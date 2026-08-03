/**
 * Seed the initial admin user using Supabase Admin API.
 * 
 * Run once with: npx tsx scripts/seed-admin.ts
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL
 * in .env.local (already configured).
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  const email = "kasakranthikiran@3324";
  const password = "Kranthi@11046";

  console.log("Creating admin user...");

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const exists = existingUsers?.users?.some((u) => u.email === email);

  if (exists) {
    console.log("Admin user already exists. Skipping.");
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Kasa Kranthi Kiran" },
  });

  if (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }

  console.log("Admin user created successfully:");
  console.log(`  ID: ${data.user.id}`);
  console.log(`  Email: ${data.user.email}`);
  console.log("Done!");
}

seedAdmin();
