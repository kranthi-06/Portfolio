import dotenv from "dotenv";
import pg from "pg";
dotenv.config({ path: ".env.local", quiet: true });

// Read-only audit. Never print connection strings, user IDs, emails or tokens.
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
try {
  await client.connect();
  await client.query("BEGIN READ ONLY");
  await client.query("SET LOCAL statement_timeout = '15s'");
  const queries = {
    schema: "SELECT table_name, column_name, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('profiles','messages','analytics_visitors','analytics_sessions') AND column_name IN ('role','status','visitor_id','session_id','idempotency_key') ORDER BY table_name,column_name",
    roles: "SELECT role, count(*)::int AS count FROM public.profiles GROUP BY role",
    profiles: "SELECT count(*)::int AS auth_users, count(p.id)::int AS linked_profiles, count(*) FILTER (WHERE p.role='admin')::int AS admins FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id",
    rls: "SELECT relname, relrowsecurity, reloptions FROM pg_class JOIN pg_namespace n ON n.oid=relnamespace WHERE n.nspname='public' AND (relname LIKE 'analytics_%' OR relname IN ('profiles','messages','visitor_analytics','rate_limits')) AND relkind IN ('r','v') ORDER BY relname",
    policies: "SELECT tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' AND (tablename LIKE 'analytics_%' OR tablename IN ('profiles','messages','visitor_analytics','rate_limits')) ORDER BY tablename,policyname",
    realtime: "SELECT pubname, tablename FROM pg_publication_tables WHERE schemaname='public' AND tablename='messages'",
    functions: "SELECT proname, prosecdef, proconfig, proacl FROM pg_proc JOIN pg_namespace n ON n.oid=pronamespace WHERE n.nspname='public' AND proname IN ('is_admin_user','get_or_create_visitor','get_or_create_session','check_rate_limit')",
  };
  for (const [name, sql] of Object.entries(queries)) {
    await client.query("SAVEPOINT audit_query");
    try { console.log(name, JSON.stringify((await client.query(sql)).rows)); }
    catch (error) { await client.query("ROLLBACK TO SAVEPOINT audit_query"); console.log(name, JSON.stringify({ code: error.code, error: "Read-only query failed" })); }
  }
  await client.query("ROLLBACK");
} catch (error) {
  console.error("Database audit unavailable:", error.code || error.name);
  process.exitCode = 1;
} finally {
  await client.end();
}
