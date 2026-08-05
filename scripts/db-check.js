const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Kranthi%402006@db.wepflhbhesqemfoamvsl.supabase.co:5432/postgres?sslmode=require' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name LIKE '%url%';
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  client.end();
}).catch(console.error);
