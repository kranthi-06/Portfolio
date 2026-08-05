-- Explicit GRANTS to expose tables to the Supabase REST API securely

-- 1. Schema Usage for all roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Full access for authenticated admins and service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- 3. Granular access for anonymous (public) users
-- First, revoke the overly permissive grants that might have been applied previously
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Then, grant only what is necessary
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.messages TO anon;
GRANT INSERT ON public.visitor_analytics TO anon;

-- Force schema cache reload (works in Supabase SQL editor)
NOTIFY pgrst, 'reload schema';
