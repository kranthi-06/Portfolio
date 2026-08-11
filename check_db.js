require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAchievements() {
  const { data, error } = await supabase.from('achievements').select('*');
  if (error) {
    console.error('Error fetching achievements:', error);
  } else {
    console.log('Achievements in DB:', data.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkAchievements();
