-- Fix RLS Policies for Admin/Non-Admin Separation
-- This migration updates RLS policies to properly restrict access based on admin role

-- ============================================
-- Helper: Check if current user is admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role text;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(v_role = 'admin', false);
END;
$$;

-- ============================================
-- Messages Table - Restrict to Admin Only
-- ============================================
DROP POLICY IF EXISTS "Public insert messages" ON public.messages;
DROP POLICY IF EXISTS "Auth read all messages" ON public.messages;
DROP POLICY IF EXISTS "Auth insert auth messages" ON public.messages;
DROP POLICY IF EXISTS "Auth update messages" ON public.messages;
DROP POLICY IF EXISTS "Auth delete messages" ON public.messages;

-- Public can INSERT (contact form submissions)
CREATE POLICY "Public insert messages" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Only admins can read messages
CREATE POLICY "Admin read messages" ON public.messages
  FOR SELECT USING (public.is_admin_user());

-- Only admins can update messages
CREATE POLICY "Admin update messages" ON public.messages
  FOR UPDATE USING (public.is_admin_user());

-- Only admins can delete messages
CREATE POLICY "Admin delete messages" ON public.messages
  FOR DELETE USING (public.is_admin_user());

-- Service role bypasses RLS (for backend APIs)
GRANT ALL ON public.messages TO service_role;

-- ============================================
-- Analytics Tables - Restrict to Admin Only
-- ============================================
DROP POLICY IF EXISTS "Admin full access analytics_visitors" ON public.analytics_visitors;
DROP POLICY IF EXISTS "Admin full access analytics_sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Admin full access analytics_page_views" ON public.analytics_page_views;
DROP POLICY IF EXISTS "Admin full access analytics_events" ON public.analytics_events;

CREATE POLICY "Admin read analytics_visitors" ON public.analytics_visitors
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admin read analytics_sessions" ON public.analytics_sessions
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admin read analytics_page_views" ON public.analytics_page_views
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admin read analytics_events" ON public.analytics_events
  FOR SELECT USING (public.is_admin_user());

GRANT ALL ON public.analytics_visitors TO service_role;
GRANT ALL ON public.analytics_sessions TO service_role;
GRANT ALL ON public.analytics_page_views TO service_role;
GRANT ALL ON public.analytics_events TO service_role;

-- ============================================
-- Analytics Views - Restrict to Admin Only
-- ============================================
-- Views inherit RLS from base tables

-- ============================================
-- Geolocation Cache - Internal Only
-- ============================================
ALTER TABLE public.geolocation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access geolocation_cache" ON public.geolocation_cache
  FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON public.geolocation_cache TO service_role;

-- ============================================
-- Analytics RPC Functions - Service Role Access
-- ============================================
GRANT EXECUTE ON FUNCTION public.get_or_create_visitor TO service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_session TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_geolocation TO service_role;
GRANT EXECUTE ON FUNCTION public.cache_geolocation TO service_role;
GRANT EXECUTE ON FUNCTION public.clean_geolocation_cache TO service_role;

NOTIFY pgrst, 'reload schema';