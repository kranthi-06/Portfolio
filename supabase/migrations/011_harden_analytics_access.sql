-- ============================================================
-- 011: Harden analytics + profile read access (least privilege)
-- ============================================================
-- Context / why this exists
-- -------------------------
-- * Migration 009 replaced the analytics table policies with admin-only SELECT
--   policies, but left the aggregate VIEWS behind. PostgreSQL views execute with
--   the privileges of their OWNER and therefore do NOT inherit RLS from their
--   base tables (the comment "Views inherit RLS from base tables" in 009 is
--   incorrect). 008 granted SELECT on those views to `authenticated`, so any
--   signed-in non-admin could read analytics aggregates through the REST API.
--
-- * 001 created a very broad profile policy: "Auth read profiles"
--   USING (auth.uid() IS NOT NULL) — i.e. ANY signed-in user can read EVERY
--   profile row (including admin emails and roles). The application only ever
--   reads the caller's own profile (middleware.ts + lib/server/admin-auth.ts),
--   so this can be narrowed to auth.uid() = id without breaking anything.
--
-- This migration is additive — it only REMOVES access. Nothing here grants new
-- read access to anon/authenticated, and the service role keeps full access for
-- the backend API routes (which are the only writers of analytics rows).
--
-- Apply: Supabase SQL editor, or `supabase db push`.
-- Rollback: see the notes at the bottom of this file.

-- ------------------------------------------------------------
-- 1. Analytics aggregate views → service role only
-- ------------------------------------------------------------
DO $$
DECLARE
    v_rel  text;
    v_name text;
    v_views text[] := ARRAY[
        'analytics_daily_visitors',
        'analytics_daily_sessions',
        'analytics_by_country',
        'analytics_india_states',
        'analytics_india_cities',
        'analytics_by_device',
        'analytics_by_os',
        'analytics_by_browser',
        'analytics_top_pages',
        'analytics_referrer_sources',
        'analytics_active_visitors'
    ];
BEGIN
    FOREACH v_name IN ARRAY v_views LOOP
        SELECT c.relname INTO v_rel
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = v_name AND c.relkind = 'v';

        IF v_rel IS NULL THEN
            RAISE NOTICE 'public.% does not exist, skipping', v_name;
            CONTINUE;
        END IF;

        EXECUTE format('REVOKE ALL ON public.%I FROM anon', v_rel);
        EXECUTE format('GRANT SELECT ON public.%I TO service_role', v_rel);

        -- Defense in depth (PostgreSQL 15+): evaluate base-table RLS as the caller
        -- so a future GRANT cannot re-open the aggregate views to non-admins.
        BEGIN
            EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v_rel);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'security_invoker unsupported here; skipping for %', v_rel;
        END;
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- 2. Profiles: restrict reads to the caller's own row
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Auth read profiles" ON public.profiles;

DROP POLICY IF EXISTS "Read own profile" ON public.profiles;
CREATE POLICY "Read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- ------------------------------------------------------------
-- 3. Re-assert RLS is enabled (idempotent safety net)
-- ------------------------------------------------------------
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visitors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geolocation_cache     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits           ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 4. Service role keeps full access for backend API writes
-- ------------------------------------------------------------
GRANT ALL ON public.analytics_visitors   TO service_role;
GRANT ALL ON public.analytics_sessions   TO service_role;
GRANT ALL ON public.analytics_page_views TO service_role;
GRANT ALL ON public.analytics_events     TO service_role;
GRANT ALL ON public.messages             TO service_role;

NOTIFY pgrst, 'reload schema';

-- ------------------------------------------------------------
-- Rollback (only if you must restore the old, broader access)
-- ------------------------------------------------------------
-- GRANT SELECT ON public.analytics_daily_visitors TO authenticated;
--   ... (repeat for each view)
-- DROP POLICY IF EXISTS "Read own profile" ON public.profiles;
-- CREATE POLICY "Auth read profiles" ON public.profiles
--   FOR SELECT USING (auth.uid() IS NOT NULL);
