import 'dotenv/config';

async function run() {
  try {
    const res = await fetch('https://wepflhbhesqemfoamvsl.supabase.co/rest/v1/', {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
run();
