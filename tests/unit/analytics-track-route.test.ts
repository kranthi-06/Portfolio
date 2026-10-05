import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Regression tests for the public analytics tracking endpoint.
 *
 * The endpoint is hit by anonymous browsers (pageviews + a 30s heartbeat), so it
 * must never require auth and must never 500 on malformed input. The heartbeat
 * ("ping") sends no `payload` at all — reading `payload.referrer` unconditionally
 * used to throw and make every heartbeat fail.
 */

const mocks = vi.hoisted(() => {
  const state = {
    rpcResults: [] as Array<{ data: unknown; error: unknown }>,
    rpcCalls: [] as Array<{ name: string; args: Record<string, unknown> }>,
    inserts: [] as Array<{ table: string; payload: Record<string, unknown> }>,
    updates: [] as Array<{ table: string; payload: Record<string, unknown> }>,
    latestPageView: null as { id: string; created_at: string } | null,
    sessionLookup: null as { id: string; started_at: string } | null,
    sessionInsert: null as { id: string } | null,
  };

  function makeBuilder(table: string) {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    const result =
      table === "analytics_sessions"
        ? { data: state.sessionLookup, error: null }
        : { data: state.latestPageView, error: null };
    const insertResult = {
      data: table === "analytics_sessions" ? state.sessionInsert : null,
      error: null,
    };
    const insertBuilder: Record<string, unknown> = {
      select: () => insertBuilder,
      single: async () => insertResult,
      then: (resolve: (value: unknown) => unknown) => resolve(insertResult),
    };

    Object.assign(builder, {
      select: chain, eq: chain, neq: chain, order: chain, limit: chain, in: chain,
      gte: chain, lte: chain, single: async () => result, maybeSingle: async () => result,
      insert: (payload: Record<string, unknown>) => {
        state.inserts.push({ table, payload });
        return insertBuilder;
      },
      update: (payload: Record<string, unknown>) => {
        state.updates.push({ table, payload });
        return builder;
      },
      then: (resolve: (value: unknown) => unknown) => resolve(result),
    });

    return builder;
  }

  const client = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      state.rpcCalls.push({ name, args });
      return state.rpcResults.shift() ?? { data: "11111111-1111-4111-8111-111111111111", error: null };
    },
    from: (table: string) => makeBuilder(table),
  };

  return { state, client };
});

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => mocks.client,
}));

// eslint-disable-next-line import/first
import { POST } from "@/app/api/analytics/track/route";

const ORIGIN = "https://portfolio.test";
const SESSION_ID = "11111111-1111-4111-8111-111111111111";

function trackRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(new URL("/api/analytics/track", ORIGIN), {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "vitest", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.state.rpcResults = [];
  mocks.state.rpcCalls = [];
  mocks.state.inserts = [];
  mocks.state.updates = [];
  mocks.state.latestPageView = null;
  mocks.state.sessionLookup = null;
  mocks.state.sessionInsert = null;
});

describe("payload validation", () => {
  it("returns 400 instead of 500 for a request with no payload at all", async () => {
    const res = await POST(trackRequest({}));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid tracking payload");
    expect(mocks.state.rpcCalls).toHaveLength(0);
  });

  it("returns 400 for a body that is not valid JSON", async () => {
    const res = await POST(
      new NextRequest(new URL("/api/analytics/track", ORIGIN), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not-json",
      }),
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for an unknown action", async () => {
    const res = await POST(trackRequest({ action: "teleport" }));

    expect(res.status).toBe(400);
  });

  it("requires a pathname for pageviews", async () => {
    const res = await POST(trackRequest({ action: "pageview", payload: {} }));

    expect(res.status).toBe(400);
    expect(mocks.state.rpcCalls).toHaveLength(0);
  });

  it("requires an eventName for events", async () => {
    const res = await POST(trackRequest({ action: "event", payload: { eventData: {} } }));

    expect(res.status).toBe(400);
    expect(mocks.state.rpcCalls).toHaveLength(0);
  });
});

describe("pageview tracking", () => {
  const body = {
    action: "pageview",
    sessionId: "temp_123",
    payload: {
      pathname: "/",
      searchParams: {},
      referrer: "https://www.google.com/",
      resolution: "1920x1080",
      language: "en-US",
    },
  };

  it("resolves the visitor and session, then records the view", async () => {
    const res = await POST(trackRequest(body));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ success: true, sessionId: SESSION_ID });

    expect(mocks.state.rpcCalls.map((call) => call.name)).toEqual([
      "get_or_create_visitor",
      "get_or_create_session",
    ]);
    expect(mocks.state.rpcCalls[1].args).toMatchObject({
      p_session_id: "temp_123",
      p_landing_page: "/",
      p_exit_page: "/",
    });

    const tables = mocks.state.inserts.map((insert) => insert.table);
    expect(tables).toContain("analytics_page_views");
    expect(tables).toContain("analytics_events");
    expect(mocks.state.inserts.find((i) => i.table === "analytics_page_views")?.payload).toMatchObject({
      pathname: "/",
      session_id: SESSION_ID,
    });
    expect(mocks.state.inserts.find((i) => i.table === "analytics_events")?.payload).toMatchObject({
      event_name: "page_view",
    });
  });

  it("issues a first-party visitor cookie when the browser has none", async () => {
    const res = await POST(trackRequest(body));

    expect(res.headers.get("set-cookie")).toContain("pv_visitor_id");
  });
});

describe("heartbeat (ping) tracking", () => {
  it("accepts a ping that carries no payload — the historical 500 regression", async () => {
    const res = await POST(trackRequest({ action: "ping", sessionId: SESSION_ID }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, sessionId: SESSION_ID });
    expect(mocks.state.inserts).toHaveLength(0);
  });

  it("records absolute time on page for the latest view", async () => {
    mocks.state.latestPageView = {
      id: "pv-1",
      created_at: new Date(Date.now() - 60_000).toISOString(),
    };

    const res = await POST(trackRequest({ action: "ping", sessionId: SESSION_ID }));

    expect(res.status).toBe(200);
    expect(mocks.state.updates).toHaveLength(1);
    expect(mocks.state.updates[0].table).toBe("analytics_page_views");
    expect(mocks.state.updates[0].payload.time_on_page).toBeGreaterThanOrEqual(60);
    expect(mocks.state.updates[0].payload.time_on_page).toBeLessThanOrEqual(61);
  });

  it("caps time on page so an abandoned tab cannot inflate it", async () => {
    mocks.state.latestPageView = {
      id: "pv-1",
      created_at: new Date(Date.now() - 8 * 60 * 60_000).toISOString(),
    };

    await POST(trackRequest({ action: "ping", sessionId: SESSION_ID }));

    expect(mocks.state.updates[0].payload.time_on_page).toBe(1800);
  });
});

describe("dependency failures", () => {
  it("returns 500 when the visitor lookup fails", async () => {
    mocks.state.rpcResults = [{ data: null, error: { message: "database unreachable" } }];

    const res = await POST(
      trackRequest({ action: "pageview", payload: { pathname: "/" } }),
    );

    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Failed to resolve visitor");
  });

  it("returns 500 when the session lookup fails", async () => {
    mocks.state.rpcResults = [
      { data: SESSION_ID, error: null },
      { data: null, error: { message: "database unreachable" } },
    ];

    const res = await POST(
      trackRequest({ action: "pageview", payload: { pathname: "/" } }),
    );

    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Failed to resolve session");
  });
});

describe("event tracking", () => {
  it("records outbound link clicks", async () => {
    const res = await POST(
      trackRequest({
        action: "event",
        sessionId: SESSION_ID,
        payload: { eventName: "github_click", eventData: { url: "https://github.com/x" }, pathname: "/" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mocks.state.inserts.find((i) => i.table === "analytics_events")?.payload).toMatchObject({
      event_name: "github_click",
      event_data: { url: "https://github.com/x" },
      path: "/",
    });
  });
});

describe("hash salt configuration", () => {
  // Regression: getHashSecret() used to throw in production when ANALYTICS_SALT
  // was unset, so every tracking request returned 500 before writing anything.
  it("still tracks when ANALYTICS_SALT is unset in production", async () => {
    vi.stubEnv("ANALYTICS_SALT", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

    try {
      const res = await POST(trackRequest({ action: "ping", sessionId: SESSION_ID }));

      expect(res.status).toBe(200);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("tracks even with no salt and no service-role key", async () => {
    vi.stubEnv("ANALYTICS_SALT", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    try {
      const res = await POST(trackRequest({ action: "ping", sessionId: SESSION_ID }));

      expect(res.status).toBe(200);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("session fallback for deployments without migration 012", () => {
  const uuidCastError = {
    data: null,
    error: { code: "42883", message: "operator does not exist: uuid = text" },
  };

  it("creates a fresh session when the RPC cannot compare the uuid", async () => {
    mocks.state.rpcResults = [{ data: "visitor-1", error: null }, uuidCastError];
    mocks.state.sessionInsert = { id: "session-2" };

    const res = await POST(
      trackRequest({ action: "ping", sessionId: SESSION_ID, payload: { pathname: "/work" } }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, sessionId: "session-2" });
    expect(
      mocks.state.inserts.find((insert) => insert.table === "analytics_sessions")?.payload,
    ).toMatchObject({ visitor_id: "visitor-1", landing_page: "/work" });
  });

  it("creates a session when the RPC cannot cast a placeholder id", async () => {
    mocks.state.rpcResults = [{ data: "visitor-1", error: null }, uuidCastError];
    mocks.state.sessionInsert = { id: "session-2" };

    const res = await POST(trackRequest({ action: "ping", sessionId: "temp_abc" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, sessionId: "session-2" });
    expect(
      mocks.state.inserts.find((insert) => insert.table === "analytics_sessions")?.payload,
    ).toMatchObject({ visitor_id: "visitor-1", landing_page: "/" });
  });

  it("does not fall back for unrelated RPC failures", async () => {
    mocks.state.rpcResults = [
      { data: "visitor-1", error: null },
      { data: null, error: { code: "42P01", message: "relation does not exist" } },
    ];

    const res = await POST(trackRequest({ action: "ping", sessionId: SESSION_ID }));

    expect(res.status).toBe(500);
  });
});

