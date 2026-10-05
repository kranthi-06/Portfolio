import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Verifies that the admin API surface (server-verified role check, not just
 * "signed in") rejects non-admins and anonymous callers.
 *
 * These routes are protected by `withAdminAuth` rather than by the matcher in
 * middleware.ts, so they are covered by their own regression tests.
 */

const mocks = vi.hoisted(() => {
  const state = {
    user: null as { id: string; email: string } | null,
    authError: null as { message: string } | null,
    profile: null as { role: string } | null,
    queryResult: { data: [] as unknown, error: null as unknown },
  };

  function makeBuilder(table: string) {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    const result = () => (table === "profiles" ? { data: state.profile, error: null } : state.queryResult);

    Object.assign(builder, {
      select: chain, eq: chain, neq: chain, gt: chain, gte: chain, lt: chain, lte: chain,
      order: chain, limit: chain, range: chain, in: chain, is: chain, not: chain, or: chain,
      ilike: chain, match: chain, insert: chain, update: chain, upsert: chain, delete: chain,
      single: async () => result(),
      maybeSingle: async () => result(),
      then: (resolve: (value: unknown) => unknown) => resolve(result()),
    });

    return builder;
  }

  const client = {
    auth: { getUser: async () => ({ data: { user: state.user }, error: state.authError }) },
    from: (table: string) => makeBuilder(table),
  };

  return { state, client };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mocks.client,
}));

// eslint-disable-next-line import/first
import { withAdminAuth } from "@/lib/server/admin-auth";
// eslint-disable-next-line import/first
import { GET as messagesGET } from "@/app/api/admin/messages/route";
// eslint-disable-next-line import/first
import { GET as analyticsOverviewGET } from "@/app/api/admin/analytics/overview/route";

const ORIGIN = "https://portfolio.test";

function request(path: string, method = "GET") {
  return new NextRequest(new URL(path, ORIGIN), { method });
}

function signInAs(role: string) {
  mocks.state.user = { id: "user-1", email: "admin@example.com" };
  mocks.state.profile = { role };
}

beforeEach(() => {
  mocks.state.user = null;
  mocks.state.authError = null;
  mocks.state.profile = null;
  mocks.state.queryResult = { data: [], error: null };
});

describe("withAdminAuth", () => {
  it("runs the handler for an admin and returns the handler payload", async () => {
    signInAs("admin");

    const handler = withAdminAuth(async (_req, admin) => {
      const { NextResponse } = await import("next/server");
      return NextResponse.json({ success: true, adminId: admin.id, role: admin.role });
    });

    const res = await handler(request("/api/admin/anything"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ success: true, adminId: "user-1", role: "admin" });
  });

  it("returns 403 for an authenticated non-admin", async () => {
    signInAs("viewer");

    const handler = withAdminAuth(async () => {
      throw new Error("handler must not run for a non-admin");
    });

    const res = await handler(request("/api/admin/anything"));

    expect(res.status).toBe(403);
    expect((await res.json()).success).toBe(false);
  });

  it("returns 403 for an anonymous caller", async () => {
    const handler = withAdminAuth(async () => {
      throw new Error("handler must not run for an anonymous caller");
    });

    const res = await handler(request("/api/admin/anything"));

    expect(res.status).toBe(403);
  });

  it("returns 403 when the profile row is missing", async () => {
    mocks.state.user = { id: "user-1", email: "ghost@example.com" };
    mocks.state.profile = null;

    const handler = withAdminAuth(async () => {
      throw new Error("handler must not run without a profile");
    });

    const res = await handler(request("/api/admin/anything"));

    expect(res.status).toBe(403);
  });
});

describe("admin API routes", () => {
  it("rejects a non-admin on GET /api/admin/messages", async () => {
    signInAs("viewer");
    const res = await messagesGET(request("/api/admin/messages"));

    expect(res.status).toBe(403);
    expect((await res.json()).success).toBe(false);
  });

  it("allows an admin on GET /api/admin/messages", async () => {
    signInAs("admin");
    const res = await messagesGET(request("/api/admin/messages"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("rejects a non-admin on GET /api/admin/analytics/overview", async () => {
    signInAs("viewer");
    const res = await analyticsOverviewGET(request("/api/admin/analytics/overview"));

    expect(res.status).toBe(403);
  });

  it("rejects an anonymous caller on GET /api/admin/analytics/overview", async () => {
    const res = await analyticsOverviewGET(request("/api/admin/analytics/overview"));

    expect(res.status).toBe(403);
  });
});
