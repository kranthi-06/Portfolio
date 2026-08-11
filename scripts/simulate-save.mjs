import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const mockBody = {
    title: "GenAI Forge Hackathon 2026",
    gallery: [
      {
        url: "test.jpg",
        filename: "test.jpg"
      }
    ]
  };

  const { data, error } = await supabase
    .from('achievements')
    .update({ gallery: mockBody.gallery })
    .eq('id', '1b43668e-f27a-44df-a371-557a25b9e724')
    .select()
    .single();

  console.log("Updated data:", data?.gallery);

  // simulate fetchItems
  const { data: fetched } = await supabase.from("achievements").select("*").eq('id', '1b43668e-f27a-44df-a371-557a25b9e724').single();
  console.log("Fetched data:", fetched?.gallery);
}

run();
