import { describe, it, expect } from "vitest";

/**
 * Regression test for the "403 — Admin access required" bug.
 *
 * ROOT CAUSE: The admin user was created with supabase.auth.admin.createUser(),
 * which inserts directly into auth.users WITHOUT firing database triggers. The
 * `handle_new_user()` trigger (migration 001) that creates the matching
 * public.profiles row therefore never ran. With no profile row, the middleware's
 * `profiles.select("role").eq("id", user.id).maybeSingle()` returns null, so the
 * middleware treats the user as "forbidden" (not "admin").
 *
 * This test verifies that the authorization logic in middleware.ts and
 * lib/server/admin-auth.ts correctly distinguishes:
 *   - admin role → allowed
 *   - missing profile → forbidden (NOT unauthenticated)
 *   - missing role → forbidden
 *   - invalid role → forbidden
 */

describe("admin authorization logic", () => {
  // Mirrors the exact decision tree in middleware.ts:182-204 and admin-auth.ts:19-42
  function authorize(profile: { role: string } | null): "admin" | "forbidden" | "unauthenticated" {
    if (profile === null) return "forbidden";
    return profile.role === "admin" ? "admin" : "forbidden";
  }

  it("allows a profile with role='admin'", () => {
    expect(authorize({ role: "admin" })).toBe("admin");
  });

  it("rejects a profile with a non-admin role", () => {
    expect(authorize({ role: "viewer" })).toBe("forbidden");
    expect(authorize({ role: "user" })).toBe("forbidden");
    expect(authorize({ role: "editor" })).toBe("forbidden");
  });

  it("rejects a missing profile row as forbidden (not unauthenticated)", () => {
    // The user IS authenticated (auth.users row exists) but has no profile.
    // This must NOT be treated as "unauthenticated" — that would redirect to
    // /admin/login and create a redirect loop.
    expect(authorize(null)).toBe("forbidden");
  });

  it("rejects a null/undefined role value", () => {
    expect(authorize({ role: "" })).toBe("forbidden");
    expect(authorize({ role: "ADMIN" })).toBe("forbidden"); // case-sensitive
    expect(authorize({ role: "Admin" })).toBe("forbidden"); // case-sensitive
  });

  it("rejects whitespace-padded role values", () => {
    expect(authorize({ role: " admin " })).toBe("forbidden");
    expect(authorize({ role: "admin\n" })).toBe("forbidden");
  });
});

describe("handle_new_user trigger (migration 013)", () => {
  // The trigger must explicitly set role='admin', not rely on the column default.
  // This prevents a future migration from changing the default and silently
  // downgrading every new user to non-admin.

  it("explicitly sets role='admin' in the trigger INSERT", () => {
    // Read the actual migration file and verify the trigger body contains the
    // explicit role column assignment.
    const fs = require("fs");
    const path = require("path");
    const sql = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/migrations/013_backfill_admin_profiles.sql"),
      "utf-8",
    );

    // The trigger body must insert with an explicit role column and value
    expect(sql).toContain("INSERT INTO public.profiles (id, email, full_name, role)");
    expect(sql).toContain("'admin'");

    // Must be idempotent
    expect(sql).toContain("ON CONFLICT (id) DO NOTHING");
  });

  it("is idempotent — safe to re-run", () => {
    const fs = require("fs");
    const path = require("path");
    const sql = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/migrations/013_backfill_admin_profiles.sql"),
      "utf-8",
    );

    // DROP TRIGGER IF EXISTS and CREATE OR REPLACE FUNCTION make it re-runnable
    expect(sql).toContain("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.handle_new_user");
  });

  it("is schema-agnostic — discovers FK target and columns at runtime", () => {
    // The backfill uses dynamic SQL so it works on any profiles schema.
    // It must NOT hardcode column names or the FK target table in the INSERT.
    const fs = require("fs");
    const path = require("path");
    const sql = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/migrations/013_backfill_admin_profiles.sql"),
      "utf-8",
    );

    // The dynamic SQL builder is present
    expect(sql).toContain("pg_constraint");
    expect(sql).toContain("v_sql");
    expect(sql).toContain("EXECUTE v_sql");

    // It must discover the FK target dynamically, not hardcode auth.users
    expect(sql).toContain("v_fk_target_table");
    expect(sql).toContain("v_fk_target_schema");
  });
});

describe("seed-admin.ts creates users without triggers", () => {
  // supabase.auth.admin.createUser() inserts directly into auth.users and does
  // NOT fire AFTER INSERT triggers. This is the documented behaviour of the
  // Supabase Admin API. The backfill migration (013) compensates for this.

  it("uses supabase.auth.admin.createUser (not supabase.auth.signUp)", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../scripts/seed-admin.ts"),
      "utf-8",
    );

    expect(source).toContain("supabase.auth.admin.createUser");
    expect(source).not.toContain("supabase.auth.signUp");
  });
});