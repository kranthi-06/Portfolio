import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: before } = await supabase.from("achievements").select("*").eq('id', '1b43668e-f27a-44df-a371-557a25b9e724').single();
  console.log("Before save:", before.gallery);

  // simulate frontend saving
  const editing = { ...before };
  
  // What if editing.gallery is missing for some reason? Let's check how emptyAch merges
  const emptyAch = { 
    gallery: []
  };
  const data = before ? { ...emptyAch, ...before } : emptyAch;
  console.log("Merged data gallery:", data.gallery);
}
run();
