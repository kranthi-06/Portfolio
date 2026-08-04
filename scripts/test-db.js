const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT NOW()`
  .then(res => { console.log('Connected to DB:', res); process.exit(0); })
  .catch(err => { console.error('Connection failed:', err); process.exit(1); });
