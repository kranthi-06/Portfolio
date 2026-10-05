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
  // 1. List all auth users
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error("AUTH USERS ERROR:", usersErr.message);
    return;
  }
  console.log("=== AUTH USERS ===");
  for (const u of users.users) {
    console.log(`  id=${u.id} email=${u.email}`);
  }

  // 2. Inspect profiles schema via REST API
  const { data: sampleProfile, error: sampleErr } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);
  if (sampleErr) {
    console.error("PROFILES SCHEMA ERROR:", sampleErr.message);
    return;
  }

  const columns = sampleProfile && sampleProfile.length > 0
    ? Object.keys(sampleProfile[0])
    : null;

  if (columns) {
    console.log("\n=== PROFILES COLUMNS (discovered from data) ===");
    for (const c of columns) {
      console.log(`  ${c}`);
    }
  } else {
    console.log("\n=== PROFILES TABLE IS EMPTY — cannot discover columns from data ===");
    // Try to discover columns from the error message or a different approach
    // Insert a dummy row and see what error we get
    const { error: probeErr } = await supabase
      .from("profiles")
      .insert({ id: "00000000-0000-0000-0000-000000000000" })
      .select()
      .single();
    if (probeErr) {
      console.log("PROBE ERROR:", probeErr.message);
    }
  }

  // 3. Create the missing admin profile
  const ADMIN_USER_ID = "3b00b91c-a633-4fa8-aa35-e822d3fdb454";
  const ADMIN_EMAIL = "kasakranthikiran@3324";

  const profileData = { id: ADMIN_USER_ID };
  if (columns) {
    for (const c of columns) {
      if (c === 'id') continue;
      if (c === 'email') profileData.email = ADMIN_EMAIL;
      if (c === 'full_name') profileData.full_name = "Kasa Kranthi Kiran";
      if (c === 'role') profileData.role = "admin";
    }
  } else {
    // Fallback: try common column names
    profileData.email = ADMIN_EMAIL;
    profileData.full_name = "Kasa Kranthi Kiran";
    profileData.role = "admin";
  }

  console.log("\n=== CREATING PROFILE ===");
  console.log("Data:", JSON.stringify(profileData, null, 2));

  const { data, error } = await supabase.from("profiles").insert(profileData).select().single();
  if (error) {
    console.error("INSERT ERROR:", error.message);
    console.log("\n=== TRYING UPSERT ===");
    const { data: upsertData, error: upsertError } = await supabase
      .from("profiles")
      .upsert(profileData)
      .select()
      .single();
    if (upsertError) {
      console.error("UPSERT ERROR:", upsertError.message);
    } else {
      console.log("UPSERT SUCCESS:", JSON.stringify(upsertData));
    }
  } else {
    console.log("INSERT SUCCESS:", JSON.stringify(data));
  }

  // 4. Verify
  console.log("\n=== VERIFY ===");
  const { data: verify, error: verifyErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", ADMIN_USER_ID)
    .maybeSingle();
  if (verifyErr) {
    console.error("VERIFY ERROR:", verifyErr.message);
  } else {
    console.log("Profile:", JSON.stringify(verify));
    if (verify && verify.role === 'admin') {
      console.log("\n*** ADMIN PROFILE CREATED SUCCESSFULLY ***");
    } else {
      console.log("\n*** WARNING: Profile exists but role is not 'admin' ***");
    }
  }
})().catch((e) => console.error("FATAL:", e.message));