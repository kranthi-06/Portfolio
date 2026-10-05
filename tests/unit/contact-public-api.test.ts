import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Regression tests for the public contact endpoint.
 *
 * The middleware bug that caused the admin redirect loop also 307-redirected
 * anonymous POST /api/contact and POST /api/analytics/track to the login page,
 * breaking the contact form and visitor tracking. These tests pin the endpoint
 * behaviour that must keep working once it is reachable again.
 */

const mocks = vi.hoisted(() => {
  const state = {
    rpcResults: [] as Array<{ data: unknown; error: unknown }>,
    maybeSingleResults: [] as Array<{ data: unknown; error: unknown }>,
    insertCalls: [] as Array<Record<string, unknown>>,
    insertError: null as unknown,
  };

  function makeBuilder() {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;

    Object.assign(builder, {
      select: chain, eq: chain, neq: chain, gt: chain, gte: chain, lte: chain,
      order: chain, limit: chain, in: chain, update: chain, delete: chain, upsert: chain,
      insert: async (payload: Record<string, unknown>) => {
        state.insertCalls.push(payload);
        return { error: state.insertError };
      },
      single: async () => state.maybeSingleResults.shift() ?? { data: null, error: null },
      maybeSingle: async () => state.maybeSingleResults.shift() ?? { data: null, error: null },
      then: (resolve: (value: unknown) => unknown) => resolve({ data: null, error: null }),
    });

    return builder;
  }

  const client = {
    rpc: async () => state.rpcResults.shift() ?? { data: [{ allowed: true }], error: null },
    from: () => makeBuilder(),
  };

  return { state, client };
});

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => mocks.client,
}));

// eslint-disable-next-line import/first
import { POST } from "@/app/api/contact/route";

const ORIGIN = "https://portfolio.test";
const CSRF = "csrf-token-123";
const IDEMPOTENCY_KEY = "3f1f0a3e-6a1f-4c8e-9f2a-1b2c3d4e5f60";

const validBody = {
  name: "Ada Lovelace",
  email: "ADA@Example.com",
  subject: "Hello",
  message: "Nice portfolio!",
};

function contactRequest(body: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return new NextRequest(new URL("/api/contact", ORIGIN), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `csrf_token=${CSRF}`,
      "idempotency-key": IDEMPOTENCY_KEY,
      "user-agent": "vitest",
      ...headers,
    },
    body: JSON.stringify({ csrfToken: CSRF, ...body }),
  });
}

beforeEach(() => {
  mocks.state.rpcResults = [];
  mocks.state.maybeSingleResults = [];
  mocks.state.insertCalls = [];
  mocks.state.insertError = null;
});

describe("CSRF protection", () => {
  it("rejects a mismatched CSRF token", async () => {
    const res = await POST(contactRequest(validBody, { cookie: "csrf_token=other-token" }));

    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("Invalid CSRF token");
    expect(mocks.state.insertCalls).toHaveLength(0);
  });

  it("rejects a request without a CSRF cookie", async () => {
    const res = await POST(contactRequest(validBody, { cookie: "" }));

    expect(res.status).toBe(403);
  });
});

describe("input validation", () => {
  it("rejects a request missing required fields", async () => {
    const res = await POST(contactRequest({ ...validBody, message: "" }));

    expect(res.status).toBe(400);
  });

  it("rejects an invalid email address", async () => {
    const res = await POST(contactRequest({ ...validBody, email: "not-an-email" }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid email address");
  });

  it("requires an Idempotency-Key header", async () => {
    const res = await POST(contactRequest(validBody, { "idempotency-key": "" }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Idempotency-Key header is required");
  });

  it("rejects a malformed Idempotency-Key", async () => {
    const res = await POST(contactRequest(validBody, { "idempotency-key": "not-a-uuid" }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid Idempotency-Key format");
  });
});

describe("successful submission", () => {
  it("stores a sanitized message and returns success", async () => {
    const res = await POST(contactRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });

    expect(mocks.state.insertCalls).toHaveLength(1);
    expect(mocks.state.insertCalls[0]).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Hello",
      message: "Nice portfolio!",
      status: "unread",
      idempotency_key: IDEMPOTENCY_KEY,
      source: "contact_form",
    });
  });

  it("strips HTML tags from user input", async () => {
    await POST(
      contactRequest({
        ...validBody,
        name: "Ada <script>alert(1)</script>",
        message: "<b>Hello</b> <img src=x onerror=alert(1)>",
      }),
    );

    const payload = mocks.state.insertCalls[0];
    expect(String(payload.name)).not.toContain("<");
    expect(String(payload.message)).not.toContain("<");
    expect(String(payload.name)).toBe("Ada alert(1)");
    expect(String(payload.message)).toBe("Hello");
  });
});

describe("duplicate prevention", () => {
  it("does not insert twice for the same idempotency key", async () => {
    mocks.state.maybeSingleResults = [{ data: { id: "existing-message" }, error: null }];

    const res = await POST(contactRequest(validBody));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, duplicate: true });
    expect(mocks.state.insertCalls).toHaveLength(0);
  });

  it("treats a unique-constraint violation as a duplicate", async () => {
    mocks.state.insertError = {
      code: "23505",
      message: 'duplicate key value violates unique constraint "messages_idempotency_key_key"',
    };

    const res = await POST(contactRequest(validBody));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, duplicate: true });
  });
});

describe("rate limiting", () => {
  it("returns 429 with Retry-After when the limit is exceeded", async () => {
    mocks.state.rpcResults = [
      { data: [{ allowed: false, reset_at: new Date(Date.now() + 60_000).toISOString() }], error: null },
    ];

    const res = await POST(contactRequest(validBody));

    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
    expect(mocks.state.insertCalls).toHaveLength(0);
  });
});

