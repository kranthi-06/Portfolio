import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: experiences, error: expError } = await supabase.from('experience').select('*');
  console.log("=== EXPERIENCE RECORDS ===");
  if (expError) console.error(expError);
  else console.log(JSON.stringify(experiences, null, 2));

  const { data: journeys, error: journeyError } = await supabase.from('journey').select('*');
  console.log("=== JOURNEY RECORDS ===");
  if (journeyError) console.error(journeyError);
  else console.log(JSON.stringify(journeys, null, 2));
}

checkData();
