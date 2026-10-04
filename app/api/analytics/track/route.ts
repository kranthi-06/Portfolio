import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import { parseDeviceInfo } from "@/lib/analytics/device-detection";
import { parseReferrer } from "@/lib/analytics/referrer";
import { parseVercelGeolocationHeaders, hasVercelGeolocationHeaders } from "@/lib/analytics/geolocation";

function getHashSecret(): string {
  const salt = process.env.ANALYTICS_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ANALYTICS_SALT environment variable is required in production");
    }
    return "portfolio-analytics-secret-salt-dev-only";
  }
  return salt;
}
const VISITOR_COOKIE_NAME = "pv_visitor_id";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, sessionId: clientSessionId } = body;

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

    const supabase = await createSupabaseServerClient();

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
    const { data: sessionDbId, error: sessionError } = await supabase.rpc("get_or_create_session", {
      p_visitor_id: visitorDbId,
      p_session_id: clientSessionId || null,
      p_referrer: referrer,
      p_referrer_source: referrerInfo.source,
      p_landing_page: payload.pathname || "/",
      p_exit_page: payload.pathname || "/",
      p_country: country,
      p_region: region,
      p_city: city,
      p_browser: deviceInfo.browser,
      p_os: deviceInfo.os,
      p_device_type: deviceInfo.deviceType,
      p_device_brand: deviceInfo.deviceBrand,
    });

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
      // Update time on page for the latest page view in this session
      const { data: lastView } = await supabase
        .from("analytics_page_views")
        .select("id, time_on_page")
        .eq("session_id", sessionDbId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastView) {
        await supabase.from("analytics_page_views").update({
          time_on_page: lastView.time_on_page + 10, // assuming ping every 10s
        }).eq("id", lastView.id);
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