import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Regression tests for the production admin redirect loop
 * (ERR_TOO_MANY_REDIRECTS on /admin/login?next=%2Fadmin).
 *
 * The loop was caused by the middleware redirecting ANY authenticated user who
 * landed on /admin/login back to /admin, while /admin sent every user whose
 * admin check failed straight back to /admin/login.
 */

const mocks = vi.hoisted(() => {
  const state: {
    user: { id: string } | null;
    authError: { message: string } | null;
    profile: { role: string } | null;
    profileError: { message: string } | null;
  } = { user: null, authError: null, profile: null, profileError: null };

  const client = {
    auth: {
      getUser: async () => ({ data: { user: state.user }, error: state.authError }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: state.profile, error: state.profileError }),
        }),
      }),
    }),
  };

  return { state, client };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => mocks.client,
}));

// eslint-disable-next-line import/first
import { middleware } from "@/middleware";

const ORIGIN = "https://portfolio.test";

function request(path: string, init?: { method?: string; headers?: Record<string, string> }) {
  return new NextRequest(new URL(path, ORIGIN), {
    method: init?.method ?? "GET",
    headers: init?.headers,
  });
}

/** Path + query of the redirect target, or null when the request is allowed. */
function redirectTarget(res: Response): string | null {
  const location = res.headers.get("location");
  if (!location) return null;
  const url = new URL(location);
  return `${url.pathname}${url.search}`;
}

function signInAs(role: string) {
  mocks.state.user = { id: "user-1" };
  mocks.state.profile = { role };
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  mocks.state.user = null;
  mocks.state.authError = null;
  mocks.state.profile = null;
  mocks.state.profileError = null;
});

describe("anonymous visitors", () => {
  it("serves the admin login page instead of redirecting it (self-stability)", async () => {
    const res = await middleware(request("/admin/login"));

    expect(res.status).toBe(200);
    expect(redirectTarget(res)).toBeNull();
  });

  it("redirects protected admin pages to the login page with a next parameter", async () => {
    const res = await middleware(request("/admin"));

    expect(res.status).toBe(307);
    expect(redirectTarget(res)).toBe("/admin/login?next=%2Fadmin");
  });

  it("preserves the requested admin path and query string in next", async () => {
    const res = await middleware(request("/admin/messages?filter=unread"));

    expect(redirectTarget(res)).toBe("/admin/login?next=%2Fadmin%2Fmessages%3Ffilter%3Dunread");
  });

  it("redirects /admin/unauthorized to the login page", async () => {
    const res = await middleware(request("/admin/unauthorized"));

    expect(redirectTarget(res)).toBe("/admin/login?next=%2Fadmin");
  });
});

describe("admins", () => {
  it("allows the dashboard", async () => {
    signInAs("admin");
    const res = await middleware(request("/admin"));

    expect(res.status).toBe(200);
    expect(redirectTarget(res)).toBeNull();
  });

  it("allows nested admin pages", async () => {
    signInAs("admin");
    const res = await middleware(request("/admin/analytics"));

    expect(res.status).toBe(200);
    expect(redirectTarget(res)).toBeNull();
  });

  it("redirects away from the login page to the requested destination", async () => {
    signInAs("admin");
    const res = await middleware(request("/admin/login?next=%2Fadmin%2Fmessages"));

    expect(res.status).toBe(307);
    expect(redirectTarget(res)).toBe("/admin/messages");
  });

  it("defaults to /admin when no next parameter is supplied", async () => {
    signInAs("admin");
    const res = await middleware(request("/admin/login"));

    expect(redirectTarget(res)).toBe("/admin");
  });

  it("rejects protocol-relative and off-site next targets (open redirect guard)", async () => {
    signInAs("admin");

    expect(redirectTarget(await middleware(request("/admin/login?next=%2F%2Fevil.example")))).toBe("/admin");
    expect(redirectTarget(await middleware(request("/admin/login?next=https%3A%2F%2Fevil.example")))).toBe("/admin");
    expect(redirectTarget(await middleware(request("/admin/login?next=%2Fapi%2Fcontact")))).toBe("/admin");
  });

  it("never redirects the login page to itself (loop guard)", async () => {
    signInAs("admin");
    const res = await middleware(request("/admin/login?next=%2Fadmin%2Flogin"));

    expect(redirectTarget(res)).toBe("/admin");
  });

  it("redirects /admin/unauthorized back to the dashboard", async () => {
    signInAs("admin");
    const res = await middleware(request("/admin/unauthorized"));

    expect(redirectTarget(res)).toBe("/admin");
  });
});

describe("authenticated non-admins", () => {
  it("sends the dashboard to the 403 page instead of the login page", async () => {
    signInAs("viewer");
    const res = await middleware(request("/admin"));

    expect(res.status).toBe(307);
    expect(redirectTarget(res)).toBe("/admin/unauthorized");
  });

  it("serves the login page to a signed-in non-admin (no redirect loop)", async () => {
    signInAs("viewer");
    const res = await middleware(request("/admin/login?next=%2Fadmin"));

    expect(res.status).toBe(200);
    expect(redirectTarget(res)).toBeNull();
  });

  it("serves the 403 page to a signed-in non-admin", async () => {
    signInAs("viewer");
    const res = await middleware(request("/admin/unauthorized"));

    expect(res.status).toBe(200);
    expect(redirectTarget(res)).toBeNull();
  });

  it("reaches a stable state: /admin -> /admin/unauthorized, with no further redirect", async () => {
    signInAs("viewer");

    const first = await middleware(request("/admin"));
    const target = redirectTarget(first);
    expect(target).toBe("/admin/unauthorized");

    const second = await middleware(request(target!));
    expect(redirectTarget(second)).toBeNull();
  });
});

describe("dependency failures", () => {
  it("returns a controlled 503 when the profile lookup fails (never a redirect)", async () => {
    mocks.state.user = { id: "user-1" };
    mocks.state.profileError = { message: "permission denied for table profiles" };

    const res = await middleware(request("/admin"));

    expect(res.status).toBe(503);
    expect(redirectTarget(res)).toBeNull();
  });

  it("treats a missing profile row as forbidden, not unauthenticated", async () => {
    mocks.state.user = { id: "user-1" };
    mocks.state.profile = null;

    const res = await middleware(request("/admin"));

    expect(redirectTarget(res)).toBe("/admin/unauthorized");
  });

  it("returns a controlled 503 when Supabase configuration is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await middleware(request("/admin"));

    expect(res.status).toBe(503);
    expect(redirectTarget(res)).toBeNull();
  });
});

describe("public API endpoints", () => {
  it("allows anonymous POST /api/contact", async () => {
    const res = await middleware(
      request("/api/contact", { method: "POST", headers: { "x-forwarded-for": "198.51.100.1" } }),
    );

    expect(res.status).toBe(200);
    expect(redirectTarget(res)).toBeNull();
  });

  it("allows anonymous POST /api/analytics/track", async () => {
    const res = await middleware(
      request("/api/analytics/track", { method: "POST", headers: { "x-forwarded-for": "198.51.100.2" } }),
    );

    expect(res.status).toBe(200);
    expect(redirectTarget(res)).toBeNull();
  });

  it("still rate-limits POST /api/contact", async () => {
    const headers = { "x-forwarded-for": "203.0.113.10" };
    const statuses: number[] = [];

    for (let i = 0; i < 6; i++) {
      const res = await middleware(request("/api/contact", { method: "POST", headers }));
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });
});

describe("security headers", () => {
  it("sets hardening headers on allowed responses", async () => {
    const res = await middleware(request("/admin/login"));

    expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
  });
});

