-- Enhanced Analytics & Messages System - Part 1: Schema Changes
-- Adds first-party visitor tracking, device intelligence, geolocation caching, and message enhancements

-- ============================================
-- 1. Enhanced Visitors Table
-- ============================================
ALTER TABLE public.analytics_visitors 
ADD COLUMN IF NOT EXISTS visitor_id text UNIQUE,
ADD COLUMN IF NOT EXISTS device_brand text,
ADD COLUMN IF NOT EXISTS referrer_source text,
ADD COLUMN IF NOT EXISTS landing_page text;

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_visitor_id ON public.analytics_visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_country_code ON public.analytics_visitors(country);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_region ON public.analytics_visitors(region);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_city ON public.analytics_visitors(city);

-- ============================================
-- 2. Enhanced Sessions Table
-- ============================================
ALTER TABLE public.analytics_sessions
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS browser text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS device_type text,
ADD COLUMN IF NOT EXISTS device_brand text;

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor_started ON public.analytics_sessions(visitor_id, started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_country ON public.analytics_sessions(country);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_region ON public.analytics_sessions(region);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_city ON public.analytics_sessions(city);

-- ============================================
-- 3. Enhanced Page Views Table
-- ============================================
ALTER TABLE public.analytics_page_views
ADD COLUMN IF NOT EXISTS referrer text,
ADD COLUMN IF NOT EXISTS referrer_source text;

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_visitor_created ON public.analytics_page_views(visitor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_pathname_created ON public.analytics_page_views(pathname, created_at);

-- ============================================
-- 4. Enhanced Events Table
-- ============================================
ALTER TABLE public.analytics_events
ADD COLUMN IF NOT EXISTS path text;

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_created ON public.analytics_events(visitor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name_created ON public.analytics_events(event_name, created_at);

-- ============================================
-- 5. Geolocation Cache Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.geolocation_cache (
    ip_prefix text PRIMARY KEY,
    country text,
    country_code text,
    region text,
    region_code text,
    city text,
    latitude numeric,
    longitude numeric,
    accuracy_radius integer,
    provider text NOT NULL DEFAULT 'maxmind',
    resolved_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE INDEX IF NOT EXISTS idx_geolocation_cache_expires ON public.geolocation_cache(expires_at);

-- ============================================
-- 6. Enhanced Messages Table
-- ============================================
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS visitor_id uuid REFERENCES public.analytics_visitors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.analytics_sessions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'contact_form',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS read_at timestamptz,
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_messages_status_created ON public.messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_visitor ON public.messages(visitor_id);
CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_idempotency ON public.messages(idempotency_key);

-- ============================================
-- 7. Helper Functions (in separate migration for proper parsing)
-- ============================================

-- ============================================
-- 8. Aggregation Views for Dashboard
-- ============================================

-- Daily visitors view
CREATE OR REPLACE VIEW public.analytics_daily_visitors AS
SELECT 
    DATE(first_seen_at) as date,
    COUNT(DISTINCT id) as new_visitors,
    COUNT(DISTINCT CASE WHEN is_returning THEN id END) as returning_visitors
FROM public.analytics_visitors
GROUP BY DATE(first_seen_at);

-- Daily sessions view
CREATE OR REPLACE VIEW public.analytics_daily_sessions AS
SELECT 
    DATE(started_at) as date,
    COUNT(*) as sessions,
    AVG(duration) as avg_duration,
    SUM(CASE WHEN is_bounced THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0) * 100 as bounce_rate
FROM public.analytics_sessions
GROUP BY DATE(started_at);

-- Country aggregation
CREATE OR REPLACE VIEW public.analytics_by_country AS
SELECT 
    v.country,
    COUNT(DISTINCT v.id) as unique_visitors,
    COUNT(DISTINCT s.id) as sessions,
    COUNT(DISTINCT pv.id) as page_views
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id
LEFT JOIN public.analytics_page_views pv ON pv.visitor_id = v.id
WHERE v.country IS NOT NULL
GROUP BY v.country;

-- India states aggregation
CREATE OR REPLACE VIEW public.analytics_india_states AS
SELECT 
    v.region as state,
    COUNT(DISTINCT v.id) as unique_visitors,
    COUNT(DISTINCT s.id) as sessions,
    COUNT(DISTINCT pv.id) as page_views
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id
LEFT JOIN public.analytics_page_views pv ON pv.visitor_id = v.id
WHERE v.country = 'IN' AND v.region IS NOT NULL
GROUP BY v.region;

-- India cities aggregation
CREATE OR REPLACE VIEW public.analytics_india_cities AS
SELECT 
    v.region as state,
    v.city,
    COUNT(DISTINCT v.id) as unique_visitors,
    COUNT(DISTINCT s.id) as sessions,
    COUNT(DISTINCT pv.id) as page_views
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id
LEFT JOIN public.analytics_page_views pv ON pv.visitor_id = v.id
WHERE v.country = 'IN' AND v.region IS NOT NULL AND v.city IS NOT NULL
GROUP BY v.region, v.city;

-- Device aggregation
CREATE OR REPLACE VIEW public.analytics_by_device AS
SELECT 
    v.device_type,
    v.device_brand,
    COUNT(DISTINCT v.id) as unique_visitors,
    COUNT(DISTINCT s.id) as sessions,
    COUNT(DISTINCT pv.id) as page_views
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id
LEFT JOIN public.analytics_page_views pv ON pv.visitor_id = v.id
WHERE v.device_type IS NOT NULL
GROUP BY v.device_type, v.device_brand;

-- OS aggregation
CREATE OR REPLACE VIEW public.analytics_by_os AS
SELECT 
    v.os,
    COUNT(DISTINCT v.id) as unique_visitors,
    COUNT(DISTINCT s.id) as sessions,
    COUNT(DISTINCT pv.id) as page_views
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id
LEFT JOIN public.analytics_page_views pv ON pv.visitor_id = v.id
WHERE v.os IS NOT NULL
GROUP BY v.os;

-- Browser aggregation
CREATE OR REPLACE VIEW public.analytics_by_browser AS
SELECT 
    v.browser,
    COUNT(DISTINCT v.id) as unique_visitors,
    COUNT(DISTINCT s.id) as sessions,
    COUNT(DISTINCT pv.id) as page_views
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id
LEFT JOIN public.analytics_page_views pv ON pv.visitor_id = v.id
WHERE v.browser IS NOT NULL
GROUP BY v.browser;

-- Top pages aggregation
CREATE OR REPLACE VIEW public.analytics_top_pages AS
SELECT 
    pv.pathname,
    COUNT(DISTINCT pv.visitor_id) as unique_visitors,
    COUNT(*) as page_views,
    AVG(pv.time_on_page) as avg_time_on_page
FROM public.analytics_page_views pv
WHERE pv.pathname IS NOT NULL
GROUP BY pv.pathname;

-- Referrer sources aggregation
CREATE OR REPLACE VIEW public.analytics_referrer_sources AS
SELECT 
    v.referrer_source,
    COUNT(DISTINCT v.id) as unique_visitors,
    COUNT(DISTINCT s.id) as sessions
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id
WHERE v.referrer_source IS NOT NULL
GROUP BY v.referrer_source;

-- Active visitors (last 5 minutes)
CREATE OR REPLACE VIEW public.analytics_active_visitors AS
SELECT 
    v.id,
    v.visitor_id,
    v.country,
    v.region,
    v.city,
    v.device_type,
    v.device_brand,
    v.browser,
    v.os,
    v.last_seen_at,
    s.id as session_id,
    s.exit_page as current_page,
    s.started_at as session_started_at
FROM public.analytics_visitors v
LEFT JOIN public.analytics_sessions s ON s.visitor_id = v.id AND s.ended_at > now() - interval '5 minutes'
WHERE v.last_seen_at > now() - interval '5 minutes';

-- ============================================
-- 9. Grants for Views
-- ============================================
GRANT SELECT ON public.analytics_daily_visitors TO service_role;
GRANT SELECT ON public.analytics_daily_sessions TO service_role;
GRANT SELECT ON public.analytics_by_country TO service_role;
GRANT SELECT ON public.analytics_india_states TO service_role;
GRANT SELECT ON public.analytics_india_cities TO service_role;
GRANT SELECT ON public.analytics_by_device TO service_role;
GRANT SELECT ON public.analytics_by_os TO service_role;
GRANT SELECT ON public.analytics_by_browser TO service_role;
GRANT SELECT ON public.analytics_top_pages TO service_role;
GRANT SELECT ON public.analytics_referrer_sources TO service_role;
GRANT SELECT ON public.analytics_active_visitors TO service_role;

GRANT SELECT ON public.analytics_daily_visitors TO authenticated;
GRANT SELECT ON public.analytics_daily_sessions TO authenticated;
GRANT SELECT ON public.analytics_by_country TO authenticated;
GRANT SELECT ON public.analytics_india_states TO authenticated;
GRANT SELECT ON public.analytics_india_cities TO authenticated;
GRANT SELECT ON public.analytics_by_device TO authenticated;
GRANT SELECT ON public.analytics_by_os TO authenticated;
GRANT SELECT ON public.analytics_by_browser TO authenticated;
GRANT SELECT ON public.analytics_top_pages TO authenticated;
GRANT SELECT ON public.analytics_referrer_sources TO authenticated;
GRANT SELECT ON public.analytics_active_visitors TO authenticated;

NOTIFY pgrst, 'reload schema';