import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    const data = await res.json();
    console.log(Object.keys(data.definitions || {}));
  } catch (err) {
    console.error(err);
  }
}
run();
