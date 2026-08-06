-- Analytics System Tables

-- 1. Visitors
CREATE TABLE public.analytics_visitors (
  id uuid primary key default extensions.uuid_generate_v4(),
  visitor_hash text unique not null,
  country text,
  region text,
  city text,
  timezone text,
  browser text,
  os text,
  device_type text,
  resolution text,
  language text,
  is_returning boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- 2. Sessions
CREATE TABLE public.analytics_sessions (
  id uuid primary key default extensions.uuid_generate_v4(),
  visitor_id uuid not null references public.analytics_visitors(id) on delete cascade,
  referrer text,
  referrer_source text,
  landing_page text not null,
  exit_page text,
  is_bounced boolean not null default true,
  duration integer not null default 0, -- in seconds
  started_at timestamptz not null default now(),
  ended_at timestamptz not null default now()
);

-- 3. Page Views
CREATE TABLE public.analytics_page_views (
  id uuid primary key default extensions.uuid_generate_v4(),
  session_id uuid not null references public.analytics_sessions(id) on delete cascade,
  visitor_id uuid not null references public.analytics_visitors(id) on delete cascade,
  pathname text not null,
  search_params jsonb,
  time_on_page integer not null default 0, -- in seconds
  created_at timestamptz not null default now()
);

-- 4. Events
CREATE TABLE public.analytics_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  session_id uuid not null references public.analytics_sessions(id) on delete cascade,
  visitor_id uuid not null references public.analytics_visitors(id) on delete cascade,
  event_name text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for performance
CREATE INDEX idx_analytics_visitors_hash ON public.analytics_visitors(visitor_hash);
CREATE INDEX idx_analytics_visitors_last_seen ON public.analytics_visitors(last_seen_at);

CREATE INDEX idx_analytics_sessions_visitor ON public.analytics_sessions(visitor_id);
CREATE INDEX idx_analytics_sessions_started ON public.analytics_sessions(started_at);

CREATE INDEX idx_analytics_page_views_session ON public.analytics_page_views(session_id);
CREATE INDEX idx_analytics_page_views_pathname ON public.analytics_page_views(pathname);
CREATE INDEX idx_analytics_page_views_created ON public.analytics_page_views(created_at);

CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);

-- RLS Policies (Analytics data should only be readable by admins)
ALTER TABLE public.analytics_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access analytics_visitors" ON public.analytics_visitors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access analytics_sessions" ON public.analytics_sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access analytics_page_views" ON public.analytics_page_views FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access analytics_events" ON public.analytics_events FOR ALL USING (auth.role() = 'authenticated');

-- Service Role (backend API) needs to insert rows without auth context
GRANT ALL ON public.analytics_visitors TO service_role;
GRANT ALL ON public.analytics_sessions TO service_role;
GRANT ALL ON public.analytics_page_views TO service_role;
GRANT ALL ON public.analytics_events TO service_role;

NOTIFY pgrst, 'reload schema';
