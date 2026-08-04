import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const testEmail = 'debug-rls-' + Date.now() + '@gmail.com';

async function run() {
  try {
    const { data: u } = await adminClient.auth.admin.createUser({ email: testEmail, password: 'password123!', email_confirm: true });
    
    const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: s, error: signInError } = await anonClient.auth.signInWithPassword({ email: testEmail, password: 'password123!' });
    
    if (signInError) throw signInError;

    const authClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: 'Bearer ' + s.session.access_token } }
    });
    
    const mockImage = new Blob(['mock-image'], { type: 'image/jpeg' });
    const { data, error } = await authClient.storage.from('projects').upload('test-debug.jpg', mockImage, { upsert: true });
    console.log('Upload error:', error);
    console.log('Upload data:', data);
    
    await adminClient.auth.admin.deleteUser(u.user.id);
  } catch (err) {
    console.error(err);
  }
}
run();
