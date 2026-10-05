import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import { z } from "zod";
import { UAParser } from "ua-parser-js";
import { parseDeviceInfo } from "@/lib/analytics/device-detection";
import { parseReferrer } from "@/lib/analytics/referrer";
import { parseVercelGeolocationHeaders, hasVercelGeolocationHeaders } from "@/lib/analytics/geolocation";

/**
 * Salt used for the privacy-preserving visitor hash.
 *
 * `ANALYTICS_SALT` is preferred, but a missing value must never take visitor
 * tracking down: this previously threw in production, so every track request
 * returned 500 before a single row was written. The fallback derives a
 * high-entropy, server-only secret from the service-role key (the hash is only
 * a pseudonym, never used for authentication).
 */
function getHashSecret(): string {
  const salt = process.env.ANALYTICS_SALT;
  if (salt) return salt;

  const serverSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serverSecret) {
    console.warn(
      "[Analytics] ANALYTICS_SALT is not set — deriving the visitor hash salt from SUPABASE_SERVICE_ROLE_KEY. Set ANALYTICS_SALT to keep visitor hashes stable across key rotations.",
    );
    return crypto.createHash("sha256").update(`analytics-salt:${serverSecret}`).digest("hex");
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("[Analytics] ANALYTICS_SALT and SUPABASE_SERVICE_ROLE_KEY are both unset — falling back to the development salt.");
  }

  return "portfolio-analytics-secret-salt-dev-only";
}
const VISITOR_COOKIE_NAME = "pv_visitor_id";

/**
 * Upper bound for accumulated time on a single page view. Matches the 30 minute
 * session-inactivity window so an abandoned tab cannot inflate the metric.
 */
const MAX_TIME_ON_PAGE_SECONDS = 30 * 60;

function hashIp(ip: string, userAgent: string) {
  return crypto.createHash("sha256").update(`${ip}-${userAgent}-${getHashSecret()}`).digest("hex");
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

function getVisitorIdFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get(VISITOR_COOKIE_NAME);
  return cookie?.value || null;
}

function setVisitorIdCookie(response: NextResponse, visitorId: string) {
  response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
    path: "/",
  });
}

/**
 * Request contract for the tracking endpoint.
 *
 * `payload` is optional on purpose: the browser heartbeat ("ping") sends only an
 * action + sessionId. Defaulting it to an empty object is what keeps those
 * heartbeats working — previously `payload.referrer` was read unconditionally,
 * so every ping threw a TypeError and returned 500 (silently breaking
 * "time on page" and live-visitor stats).
 */
const trackPayloadSchema = z
  .object({
    pathname: z.string().max(2048).optional(),
    searchParams: z.record(z.string(), z.unknown()).optional(),
    referrer: z.string().max(2048).optional(),
    resolution: z.string().max(64).optional(),
    language: z.string().max(64).optional(),
    eventName: z.string().max(128).optional(),
    eventData: z.record(z.string(), z.unknown()).optional(),
  })
  .default({});

const trackRequestSchema = z
  .object({
    action: z.enum(["pageview", "ping", "event"]),
    sessionId: z.string().max(128).nullable().optional(),
    payload: trackPayloadSchema,
  })
  // analytics_page_views.pathname is NOT NULL
  .refine((value) => value.action !== "pageview" || Boolean(value.payload.pathname), {
    message: "payload.pathname is required for pageviews",
    path: ["payload", "pathname"],
  })
  // analytics_events.event_name is NOT NULL
  .refine((value) => value.action !== "event" || Boolean(value.payload.eventName), {
    message: "payload.eventName is required for event tracking",
    path: ["payload", "eventName"],
  });

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Matches the 30 minute inactivity window enforced by get_or_create_session(). */
const SESSION_INACTIVITY_MS = 30 * 60 * 1000;

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

type SessionContext = {
  visitorId: string;
  clientSessionId: string | null;
  referrer: string;
  referrerSource: string;
  landingPage: string;
  exitPage: string;
  // Geolocation headers are optional, so these can legitimately be null.
  country: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  deviceBrand: string | null;
};

/**
 * Compatibility path for deployments whose `get_or_create_session()` predates
 * supabase/migrations/012. That version compares a uuid column against the text
 * argument (`WHERE id = p_session_id`), so every request carrying a session id
 * fails with PostgreSQL error 42883 and tracking silently stops. PostgREST
 * filters are typed by the column, so the same reuse-or-create logic can be
 * expressed with plain queries until the migration is applied.
 *
 * NOTE: the reuse-by-id lookup below would hit the same 42883 error on a
 * pre-012 deployment (PostgREST types the filter by the uuid column), so this
 * path deliberately skips reuse and always creates a fresh session. That keeps
 * tracking alive on old deployments; migration 012 restores the efficient
 * reuse-or-create behaviour once applied.
 */
async function resolveSessionFallback(supabase: AdminClient, ctx: SessionContext) {
  const { data: created, error } = await supabase
    .from("analytics_sessions")
    .insert({
      visitor_id: ctx.visitorId,
      referrer: ctx.referrer,
      referrer_source: ctx.referrerSource,
      landing_page: ctx.landingPage,
      exit_page: ctx.exitPage,
      country: ctx.country,
      region: ctx.region,
      city: ctx.city,
      browser: ctx.browser,
      os: ctx.os,
      device_type: ctx.deviceType,
      device_brand: ctx.deviceBrand,
    })
    .select("id")
    .single();

  return { id: (created?.id as string | undefined) ?? null, error };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = trackRequestSchema.safeParse(rawBody);

    // Malformed/unknown requests are a client error (400), never a 500 — a 500
    // here would log noise and hide real failures.
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tracking payload", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { action, payload, sessionId: clientSessionId } = parsed.data;

    // Extract headers
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    // Parse device info
    const deviceInfo = parseDeviceInfo(userAgent);

    // Parse referrer
    const referrer = payload.referrer || "direct";
    const referrerInfo = parseReferrer(referrer);

    // Resolve geolocation using Vercel headers
    const geo = parseVercelGeolocationHeaders(req.headers);
    const country = geo.country;
    const countryCode = geo.countryCode;
    const region = geo.region;
    const regionCode = geo.regionCode;
    const city = geo.city;
    const timezone = req.headers.get("x-vercel-ip-timezone") || "Unknown";
    
    // Check if we have meaningful geolocation data
    const hasGeoData = hasVercelGeolocationHeaders(req.headers);

    // Generate visitor hash for backward compatibility
    const visitorHash = hashIp(ip, userAgent);

    // Get or create first-party visitor_id from cookie
    let visitorIdCookie = getVisitorIdFromRequest(req);
    
    // If no cookie, generate one (will be set in response)
    if (!visitorIdCookie) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      visitorIdCookie = Array.from(array, (byte) => byte.toString(16).padStart(2, "")).join("");
    }

    // Server-only Supabase client (service role). Visitor/session/page-view rows
    // are protected by admin-only RLS, so anonymous tracking writes must run with
    // the service role. The key never reaches the browser (this is a route handler).
    const supabase = createSupabaseAdminClient();

    // 1. Get or Create Visitor using database function
    const { data: visitorDbId, error: visitorError } = await supabase.rpc("get_or_create_visitor", {
      p_visitor_id: visitorIdCookie,
      p_visitor_hash: visitorHash,
      p_country: country,
      p_region: region,
      p_city: city,
      p_timezone: timezone,
      p_browser: deviceInfo.browser,
      p_os: deviceInfo.os,
      p_device_type: deviceInfo.deviceType,
      p_device_brand: deviceInfo.deviceBrand,
      p_resolution: payload.resolution || "Unknown",
      p_language: payload.language || "Unknown",
      p_referrer_source: referrerInfo.source,
      p_landing_page: payload.pathname || "/",
    });

    if (visitorError || !visitorDbId) {
      console.error("[Analytics Track Error] Visitor resolution failed:", visitorError);
      return NextResponse.json({ error: "Failed to resolve visitor" }, { status: 500 });
    }

    // 2. Get or Create Session
    const sessionContext: SessionContext = {
      visitorId: visitorDbId as string,
      clientSessionId: clientSessionId ?? null,
      referrer,
      referrerSource: referrerInfo.source,
      landingPage: payload.pathname || "/",
      exitPage: payload.pathname || "/",
      country,
      region,
      city,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      deviceBrand: deviceInfo.deviceBrand,
    };

    let { data: sessionDbId, error: sessionError } = await supabase.rpc("get_or_create_session", {
      p_visitor_id: sessionContext.visitorId,
      p_session_id: sessionContext.clientSessionId,
      p_referrer: sessionContext.referrer,
      p_referrer_source: sessionContext.referrerSource,
      p_landing_page: sessionContext.landingPage,
      p_exit_page: sessionContext.exitPage,
      p_country: sessionContext.country,
      p_region: sessionContext.region,
      p_city: sessionContext.city,
      p_browser: sessionContext.browser,
      p_os: sessionContext.os,
      p_device_type: sessionContext.deviceType,
      p_device_brand: sessionContext.deviceBrand,
    });

    // 42883 = "operator does not exist: uuid = text" — the deployed function
    // predates migration 012. Fall back rather than dropping every visit that
    // carries a session id (which is every heartbeat and pageview after the first).
    if (sessionError?.code === "42883") {
      console.warn(
        "[Analytics] get_or_create_session() is missing its uuid cast (PostgreSQL 42883) — using the PostgREST fallback. Apply supabase/migrations/012_fix_get_or_create_session_uuid_cast.sql.",
      );
      const fallback = await resolveSessionFallback(supabase, sessionContext);
      sessionDbId = fallback.id;
      sessionError = fallback.error;
    }

    if (sessionError || !sessionDbId) {
      console.error("[Analytics Track Error] Session resolution failed:", sessionError);
      return NextResponse.json({ error: "Failed to resolve session" }, { status: 500 });
    }

    // 3. Handle Actions
    if (action === "pageview") {
      // Update session exit page
      await supabase
        .from("analytics_sessions")
        .update({ exit_page: payload.pathname })
        .eq("id", sessionDbId);

      await supabase.from("analytics_page_views").insert({
        session_id: sessionDbId,
        visitor_id: visitorDbId,
        pathname: payload.pathname,
        search_params: payload.searchParams || {},
        referrer: referrer,
        referrer_source: referrerInfo.source,
      });

      // Also insert event for page_view
      await supabase.from("analytics_events").insert({
        session_id: sessionDbId,
        visitor_id: visitorDbId,
        event_name: "page_view",
        event_data: { pathname: payload.pathname, referrer: referrerInfo.source },
        path: payload.pathname,
      });
    } else if (action === "ping") {
      // Heartbeat: refresh how long the visitor has been on the latest page of
      // this session. The value is absolute (seconds since that page view
      // started) rather than incremental, so a dropped heartbeat cannot make the
      // number drift, and the client's 30s cadence is not baked into the maths.
      const { data: lastView } = await supabase
        .from("analytics_page_views")
        .select("id, created_at")
        .eq("session_id", sessionDbId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastView) {
        const elapsedSeconds = Math.round(
          (Date.now() - new Date(lastView.created_at).getTime()) / 1000,
        );
        const timeOnPage = Math.min(
          Math.max(elapsedSeconds, 1),
          MAX_TIME_ON_PAGE_SECONDS,
        );

        await supabase
          .from("analytics_page_views")
          .update({ time_on_page: timeOnPage })
          .eq("id", lastView.id);
      }
    } else if (action === "event") {
      await supabase.from("analytics_events").insert({
        session_id: sessionDbId,
        visitor_id: visitorDbId,
        event_name: payload.eventName,
        event_data: payload.eventData || {},
        path: payload.pathname || "/",
      });
    }

    // Create response with visitor_id cookie if newly generated
    const response = NextResponse.json({ success: true, sessionId: sessionDbId });
    
    if (!req.cookies.get(VISITOR_COOKIE_NAME)) {
      setVisitorIdCookie(response, visitorIdCookie);
    }

    return response;
  } catch (error) {
    console.error("[Analytics Track Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}