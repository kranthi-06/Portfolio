require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const payload = {
    title: 'Test Insert Title',
    event: '',
    position: '',
    date: '',
    description: '',
    image_url: '',
    color: '#FFD700',
    sort_order: 0,
    status: 'draft',
    certificate_url: '',
    certificate_type: '',
    certificate_filename: '',
    certificate_mime_type: '',
    gallery: [],
    evidence: []
  };
  console.log("Inserting...", payload);
  const { data, error } = await supabase.from('achievements').insert(payload).select().single();
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
    
    // Cleanup
    await supabase.from('achievements').delete().eq('id', data.id);
  }
}

testInsert();
