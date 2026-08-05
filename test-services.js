import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  console.log("=== Testing Supabase ===");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('settings').select('id').limit(1);
    if (error) console.error("Supabase Error:", error.message);
    else console.log("✅ Supabase is working!");
  }

  console.log("\n=== Testing Cloudinary ===");
  if (!process.env.CLOUDINARY_URL) {
    console.error("Missing CLOUDINARY_URL");
  } else {
    console.log("✅ Cloudinary URL is present");
  }
}
run();
