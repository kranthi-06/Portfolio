-- ============================================
-- Journey Schema
-- ============================================

CREATE TABLE public.journey (
  id uuid primary key default extensions.uuid_generate_v4(),
  period text not null,
  title text not null,
  subtitle text,
  category text not null,
  description text,
  technologies text[] default '{}',
  display_order integer not null default 0,
  featured boolean not null default false,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Apply auto-update trigger for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.journey FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE public.journey ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public read published journey" ON public.journey FOR SELECT USING (status = 'published');

-- Auth admin policies (Full access for authenticated users)
CREATE POLICY "Auth read all journey" ON public.journey FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert journey" ON public.journey FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update journey" ON public.journey FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete journey" ON public.journey FOR DELETE USING (auth.uid() IS NOT NULL);

-- Apply migrations for postgrest
NOTIFY pgrst, 'reload schema';
