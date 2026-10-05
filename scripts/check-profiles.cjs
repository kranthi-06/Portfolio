const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error("AUTH USERS ERROR:", usersErr.message);
    return;
  }
  console.log("=== AUTH USERS ===");
  for (const u of users.users) {
    console.log(`  id=${u.id} email=${u.email}`);
  }

  const { data: profiles, error: profilesErr } = await supabase.from("profiles").select("*");
  if (profilesErr) {
    console.error("PROFILES ERROR:", profilesErr.message);
    return;
  }
  console.log("\n=== PROFILES ===");
  if (profiles.length === 0) console.log("  (empty)");
  for (const p of profiles) {
    console.log(`  id=${p.id} role=${p.role} email=${p.email}`);
  }

  console.log("\n=== ORPHANED USERS ===");
  const profileIds = new Set(profiles.map((p) => p.id));
  const orphans = users.users.filter((u) => !profileIds.has(u.id));
  if (orphans.length === 0) console.log("  (none)");
  for (const o of orphans) {
    console.log(`  id=${o.id} email=${o.email}`);
  }
})().catch((e) => console.error("FATAL:", e.message));