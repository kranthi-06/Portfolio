import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Public endpoints that must NEVER be gated behind admin authentication.
 * They keep their own protections (CSRF validation, input validation,
 * rate limiting, idempotency keys) inside their route handlers.
 */
const PUBLIC_API_PATHS = new Set<string>(["/api/contact", "/api/analytics/track", "/api/csrf"]);

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_UNAUTHORIZED_PATH = "/admin/unauthorized";

/**
 * Result of the server-verified authentication/authorisation check.
 *
 *  admin           → valid session AND profiles.role === "admin"
 *  forbidden       → valid session but NOT an admin (authorization failure)
 *  unauthenticated → no valid session (authentication failure)
 *  unavailable     → dependency failure (profile lookup / network / schema).
 *                    Must NEVER produce a redirect, otherwise a transient
 *                    outage turns into an infinite redirect loop.
 */
type AuthState = "admin" | "forbidden" | "unauthenticated" | "unavailable";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter for middleware (best effort, per instance)
// ---------------------------------------------------------------------------
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

/** Copy the session cookies refreshed by Supabase onto a redirect/error response. */
function withRefreshedCookies(target: NextResponse, source: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

/**
 * Only allow same-origin paths below /admin as a post-login destination, and
 * never the login/unauthorized pages themselves (that would create a loop).
 */
function safeAdminNext(raw: string | null): string | null {
  if (!raw) return null;

  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;

  const path = value.split("?")[0].split("#")[0].replace(/\/+$/, "");
  if (path !== "/admin" && !path.startsWith("/admin/")) return null;
  if (path === ADMIN_LOGIN_PATH || path === ADMIN_UNAUTHORIZED_PATH) return null;

  return value;
}

/** Controlled 503 page — used instead of a redirect for dependency failures. */
function serviceUnavailable(message: string): NextResponse {
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8" />` +
    `<meta name="viewport" content="width=device-width, initial-scale=1" />` +
    `<title>Admin temporarily unavailable</title></head>` +
    `<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f8f8fa;` +
    `font-family:ui-sans-serif,system-ui,sans-serif;color:#18181b">` +
    `<main style="max-width:32rem;padding:2rem;background:#fff;border:1px solid #e4e4e7;border-radius:24px">` +
    `<p style="margin:0 0 .75rem;font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#71717a">503 — Service unavailable</p>` +
    `<h1 style="margin:0 0 .75rem;font-size:1.25rem">Admin is temporarily unavailable</h1>` +
    `<p style="margin:0;line-height:1.6;color:#52525b">${message}</p>` +
    `</main></body></html>`;

  return new NextResponse(html, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function applyRateLimit(
  request: NextRequest,
  pathname: string,
): { response: NextResponse | null; headers: Record<string, string> } {
  const isTracking = pathname === "/api/analytics/track" && request.method === "POST";
  const isContact = pathname === "/api/contact" && request.method === "POST";
  if (!isTracking && !isContact) return { response: null, headers: {} };

  const limit = isTracking ? 60 : 5;
  const windowMs = isTracking ? 60_000 : 3_600_000;
  const rl = checkRateLimit(getClientIp(request), limit, windowMs);
  const headers = { "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(rl.remaining) };

  if (rl.success) return { response: null, headers };

  return {
    response: new NextResponse(
      JSON.stringify({
        error: isTracking ? "Rate limit exceeded" : "Too many requests, please try again later",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": isTracking ? "60" : "3600" },
      },
    ),
    headers,
  };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // A mutable response so Supabase session refreshes propagate to the client.
  let response = NextResponse.next({ request });

  // -----------------------------------------------------------------------
  // 1. Public endpoints — rate limited, but NEVER gated behind authentication.
  //    (Anonymous visitors must be able to submit the contact form and to be
  //    tracked; their security comes from CSRF, validation and rate limits.)
  // -----------------------------------------------------------------------
  const rate = applyRateLimit(request, pathname);
  Object.entries(rate.headers).forEach(([key, value]) => response.headers.set(key, value));
  if (rate.response) return applySecurityHeaders(rate.response);
  if (PUBLIC_API_PATHS.has(pathname)) return applySecurityHeaders(response);

  // -----------------------------------------------------------------------
  // 2. Only /admin* is protected by this middleware (see `config.matcher`).
  // -----------------------------------------------------------------------
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!isAdminPath) return applySecurityHeaders(response);

  // -----------------------------------------------------------------------
  // 3. Server-verified authentication + authorization (single source of truth)
  // -----------------------------------------------------------------------
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    // Controlled server error — never redirect (that caused an endless loop).
    return applySecurityHeaders(
      serviceUnavailable("Authentication is not configured for this deployment (missing Supabase environment variables)."),
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let state: AuthState = "unauthenticated";
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Authentication failure (no/expired session) — NOT an authorization failure.
      state = "unauthenticated";
    } else {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        // Dependency failure (network / RLS / schema drift). Never treat this as
        // "not signed in" — redirecting here is what created the redirect loop.
        console.error("[Middleware] Profile lookup failed:", profileError.message);
        state = "unavailable";
      } else {
        state = profile?.role === "admin" ? "admin" : "forbidden";
      }
    }
  } catch (error) {
    console.error("[Middleware] Authentication check failed:", error);
    state = "unavailable";
  }

  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const isUnauthorizedPage = pathname === ADMIN_UNAUTHORIZED_PATH;

  // -----------------------------------------------------------------------
  // 4. /admin/login — public. It only redirects for a VERIFIED admin, never
  //    for anonymous / non-admin / error states, so it can never loop.
  // -----------------------------------------------------------------------
  if (isLoginPage) {
    if (state === "admin") {
      const destination = safeAdminNext(request.nextUrl.searchParams.get("next")) ?? "/admin";
      return applySecurityHeaders(
        withRefreshedCookies(NextResponse.redirect(new URL(destination, request.url)), response),
      );
    }
    return applySecurityHeaders(response);
  }

  // -----------------------------------------------------------------------
  // 5. /admin/unauthorized — safe landing spot for signed-in non-admins
  // -----------------------------------------------------------------------
  if (isUnauthorizedPage) {
    if (state === "admin") {
      return applySecurityHeaders(
        withRefreshedCookies(NextResponse.redirect(new URL("/admin", request.url)), response),
      );
    }
    if (state === "unauthenticated") {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("next", "/admin");
      return applySecurityHeaders(withRefreshedCookies(NextResponse.redirect(loginUrl), response));
    }
    // forbidden / unavailable → render the 403 page
    return applySecurityHeaders(response);
  }

  // -----------------------------------------------------------------------
  // 6. Protected admin routes
  // -----------------------------------------------------------------------
  if (state === "admin") return applySecurityHeaders(response);

  if (state === "unauthenticated") {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return applySecurityHeaders(withRefreshedCookies(NextResponse.redirect(loginUrl), response));
  }

  if (state === "forbidden") {
    // Signed in but not an admin → 403 page. Never back to /admin/login.
    return applySecurityHeaders(
      withRefreshedCookies(NextResponse.redirect(new URL(ADMIN_UNAUTHORIZED_PATH, request.url)), response),
    );
  }

  // state === "unavailable" → controlled 503, never an infinite redirect.
  return applySecurityHeaders(
    serviceUnavailable("We could not verify your admin access right now. Please try again in a moment."),
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/analytics/track", "/api/contact"],
};

