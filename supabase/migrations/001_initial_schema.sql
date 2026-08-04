-- ============================================
-- Complete Portfolio CMS Infrastructure
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ============================================
-- Custom ENUM Types
-- ============================================
-- Since this is a fresh database, we create types directly.
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.message_status AS ENUM ('unread', 'read', 'archived');
CREATE TYPE public.certificate_category AS ENUM (
  'Certificate', 'Internship', 'Workshop', 'Webinar', 'Course',
  'Hackathon', 'Competition', 'Bootcamp', 'Training', 'Achievement',
  'Seminar', 'Conference', 'Volunteer Work'
);
CREATE TYPE public.experience_type AS ENUM ('Internship', 'Freelancing', 'Volunteer Work', 'Training', 'Full-Time', 'Part-Time');
CREATE TYPE public.skill_category_type AS ENUM (
  'Programming Languages', 'Frameworks', 'Libraries', 'Databases',
  'Tools', 'AI Technologies', 'Soft Skills', 'Cloud', 'DevOps', 'Other'
);
CREATE TYPE public.log_action AS ENUM (
  'create', 'update', 'delete', 'publish', 'unpublish', 'archive',
  'upload', 'login', 'logout', 'ai_generate', 'settings_update'
);

-- ============================================
-- Auto-update Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Tables Creation
-- ============================================

-- 1. Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Projects
CREATE TABLE public.projects (
  id uuid primary key default extensions.uuid_generate_v4(),
  title text not null,
  subtitle text,
  description text,
  long_description text,
  problem text,
  solution text,
  features text[] default '{}',
  technologies text[] default '{}',
  github_url text,
  live_url text,
  video_url text,
  image_url text,
  gallery_urls text[] default '{}',
  category text,
  architecture text,
  challenges text[] default '{}',
  future_scope text[] default '{}',
  featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Certificates
CREATE TABLE public.certificates (
  id uuid primary key default extensions.uuid_generate_v4(),
  title text not null,
  organization text,
  description text,
  professional_summary text,
  category public.certificate_category not null default 'Certificate',
  category_confidence real default 1.0,
  requires_category_review boolean default false,
  issue_date text,
  credential_id text,
  credential_url text,
  file_url text not null,
  file_type text not null,
  thumbnail_url text,
  skills text[] default '{}',
  tags text[] default '{}',
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Events
CREATE TABLE public.events (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  description text,
  summary text,
  organizer text,
  location text,
  event_date text,
  event_type text,
  achievement text,
  prize text,
  highlights text[] default '{}',
  timeline_entry text,
  cover_image_url text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Event Images
CREATE TABLE public.event_images (
  id uuid primary key default extensions.uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  caption text,
  image_type text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
CREATE INDEX idx_event_images_event ON public.event_images(event_id);

-- 6. Gallery
CREATE TABLE public.gallery (
  id uuid primary key default extensions.uuid_generate_v4(),
  title text,
  caption text,
  image_url text not null,
  album text not null default 'General',
  tags text[] default '{}',
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Achievements
CREATE TABLE public.achievements (
  id uuid primary key default extensions.uuid_generate_v4(),
  title text not null,
  event text,
  position text,
  date text,
  description text,
  image_url text,
  color text default '#FFD700',
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Skills
CREATE TABLE public.skills (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  category public.skill_category_type not null default 'Other',
  category_label text,
  level integer not null default 50 check (level >= 0 and level <= 100),
  icon text,
  color text,
  sort_order integer not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Experience
CREATE TABLE public.experience (
  id uuid primary key default extensions.uuid_generate_v4(),
  title text not null,
  company text not null,
  company_url text,
  location text,
  type public.experience_type not null default 'Internship',
  start_date text not null,
  end_date text,
  description text,
  achievements text[] default '{}',
  technologies text[] default '{}',
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Resume
CREATE TABLE public.resume (
  id uuid primary key default extensions.uuid_generate_v4(),
  file_url text not null,
  file_name text not null,
  file_size integer,
  version integer not null default 1,
  is_active boolean not null default true,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 11. Settings
CREATE TABLE public.settings (
  id uuid primary key default extensions.uuid_generate_v4(),
  key text unique not null,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

INSERT INTO public.settings (key, value) VALUES
  ('profile', '{"name": "Kasa Kranthi Kiran", "title": "AI Systems Engineer", "bio": "", "email": "kasakk2006@gmail.com", "phone": "", "location": "India", "avatar_url": ""}'::jsonb),
  ('social_links', '{"github": "https://github.com/kranthi-06", "linkedin": "https://www.linkedin.com/in/kasakranthikiran06/", "twitter": "", "website": ""}'::jsonb),
  ('seo', '{"title": "Kasa Kranthi Kiran — AI Systems Engineer", "description": "Building intelligent products that shape the future.", "keywords": []}'::jsonb),
  ('counters', '{"projects": 15, "certificates": 30, "internships": 2, "courses": 10, "hackathons": 8, "competitions": 5, "workshops": 3, "visitors": 0, "github_commits": 470, "github_repos": 10, "experience_years": 2}'::jsonb),
  ('theme', '{"admin_dark_mode": true, "portfolio_default_theme": "pearl"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 12. Messages
CREATE TABLE public.messages (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status public.message_status not null default 'unread',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. Visitor Analytics
CREATE TABLE public.visitor_analytics (
  id uuid primary key default extensions.uuid_generate_v4(),
  page text not null,
  referrer text,
  country text,
  city text,
  device text,
  browser text,
  os text,
  screen_resolution text,
  session_id text,
  created_at timestamptz not null default now()
);
CREATE INDEX idx_analytics_page ON public.visitor_analytics(page);
CREATE INDEX idx_analytics_created ON public.visitor_analytics(created_at);

-- 14. GitHub Stats
CREATE TABLE public.github_stats (
  id uuid primary key default extensions.uuid_generate_v4(),
  username text not null,
  data jsonb not null default '{}',
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 15. Activity Logs
CREATE TABLE public.activity_logs (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  action public.log_action not null,
  entity_type text not null,
  entity_id uuid,
  entity_title text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
CREATE INDEX idx_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_logs_created ON public.activity_logs(created_at desc);
CREATE INDEX idx_logs_entity ON public.activity_logs(entity_type, entity_id);

-- 16. AI Generations
CREATE TABLE public.ai_generations (
  id uuid primary key default extensions.uuid_generate_v4(),
  entity_type text not null,
  entity_id uuid,
  prompt text,
  input_type text,
  output jsonb not null default '{}',
  model text not null default 'gemini-3.6-flash',
  accepted boolean,
  created_at timestamptz not null default now()
);
CREATE INDEX idx_ai_gen_entity ON public.ai_generations(entity_type, entity_id);

-- 17. Media
CREATE TABLE public.media (
  id uuid primary key default extensions.uuid_generate_v4(),
  file_name text not null,
  original_name text not null,
  file_url text not null,
  file_type text not null,
  file_size integer not null default 0,
  bucket text not null,
  folder text default '',
  alt_text text,
  tags text[] default '{}',
  used_by jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX idx_media_bucket ON public.media(bucket);
CREATE INDEX idx_media_type ON public.media(file_type);

-- Apply updated_at triggers manually for safety
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.gallery FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.experience FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public read published projects" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published certificates" ON public.certificates FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Public read event images" ON public.event_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = event_images.event_id AND events.status = 'published'));
CREATE POLICY "Public read published gallery" ON public.gallery FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published achievements" ON public.achievements FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published skills" ON public.skills FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published experience" ON public.experience FOR SELECT USING (status = 'published');
CREATE POLICY "Public read active resume" ON public.resume FOR SELECT USING (is_active = true);
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public read github stats" ON public.github_stats FOR SELECT USING (true);
CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert analytics" ON public.visitor_analytics FOR INSERT WITH CHECK (true);

-- Auth admin policies (Full access for authenticated users)
CREATE POLICY "Auth read all projects" ON public.projects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update projects" ON public.projects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete projects" ON public.projects FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all certificates" ON public.certificates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update certificates" ON public.certificates FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete certificates" ON public.certificates FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all events" ON public.events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update events" ON public.events FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete events" ON public.events FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all event_images" ON public.event_images FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert event_images" ON public.event_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update event_images" ON public.event_images FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete event_images" ON public.event_images FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all gallery" ON public.gallery FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert gallery" ON public.gallery FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update gallery" ON public.gallery FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete gallery" ON public.gallery FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all achievements" ON public.achievements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update achievements" ON public.achievements FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete achievements" ON public.achievements FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all skills" ON public.skills FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update skills" ON public.skills FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete skills" ON public.skills FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all experience" ON public.experience FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert experience" ON public.experience FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update experience" ON public.experience FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete experience" ON public.experience FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all resume" ON public.resume FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert resume" ON public.resume FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update resume" ON public.resume FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete resume" ON public.resume FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all settings" ON public.settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update settings" ON public.settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete settings" ON public.settings FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all messages" ON public.messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert auth messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update messages" ON public.messages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete messages" ON public.messages FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read all media" ON public.media FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert media" ON public.media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update media" ON public.media FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete media" ON public.media FOR DELETE USING (auth.uid() IS NOT NULL);

-- Special tables (logs, AI, etc.)
CREATE POLICY "Auth read all visitor_analytics" ON public.visitor_analytics FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth insert github_stats" ON public.github_stats FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update github_stats" ON public.github_stats FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read logs" ON public.activity_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read ai_generations" ON public.ai_generations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert ai_generations" ON public.ai_generations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update ai_generations" ON public.ai_generations FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth read profiles" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- Storage Configuration
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('certificates', 'certificates', true, 20971520, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'application/x-pdf']),
  ('events', 'events', true, 10485760, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('gallery', 'gallery', true, 10485760, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('projects', 'projects', true, 10485760, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'video/mp4', 'video/webm']),
  ('resume', 'resume', true, 5242880, array['application/pdf', 'application/x-pdf', 'image/jpeg', 'image/png']),
  ('documents', 'documents', true, 20971520, array['application/pdf', 'application/x-pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']),
  ('temporary', 'temporary', false, 20971520, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit = EXCLUDED.file_size_limit;

-- Certificates
DROP POLICY IF EXISTS "Public read certificates" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Auth update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete certificates" ON storage.objects;
CREATE POLICY "Public read certificates" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Auth upload certificates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update certificates" ON storage.objects FOR UPDATE USING (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete certificates" ON storage.objects FOR DELETE USING (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);

-- Events
DROP POLICY IF EXISTS "Public read events" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload events" ON storage.objects;
DROP POLICY IF EXISTS "Auth update events" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete events" ON storage.objects;
CREATE POLICY "Public read events" ON storage.objects FOR SELECT USING (bucket_id = 'events');
CREATE POLICY "Auth upload events" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'events' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update events" ON storage.objects FOR UPDATE USING (bucket_id = 'events' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete events" ON storage.objects FOR DELETE USING (bucket_id = 'events' AND auth.uid() IS NOT NULL);

-- Gallery
DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete gallery" ON storage.objects;
CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Auth upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update gallery" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

-- Projects
DROP POLICY IF EXISTS "Public read projects" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload projects" ON storage.objects;
DROP POLICY IF EXISTS "Auth update projects" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete projects" ON storage.objects;
CREATE POLICY "Public read projects" ON storage.objects FOR SELECT USING (bucket_id = 'projects');
CREATE POLICY "Auth upload projects" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'projects' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update projects" ON storage.objects FOR UPDATE USING (bucket_id = 'projects' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete projects" ON storage.objects FOR DELETE USING (bucket_id = 'projects' AND auth.uid() IS NOT NULL);

-- Resume
DROP POLICY IF EXISTS "Public read resume" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload resume" ON storage.objects;
DROP POLICY IF EXISTS "Auth update resume" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete resume" ON storage.objects;
CREATE POLICY "Public read resume" ON storage.objects FOR SELECT USING (bucket_id = 'resume');
CREATE POLICY "Auth upload resume" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resume' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update resume" ON storage.objects FOR UPDATE USING (bucket_id = 'resume' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete resume" ON storage.objects FOR DELETE USING (bucket_id = 'resume' AND auth.uid() IS NOT NULL);

-- Documents
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth update documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete documents" ON storage.objects;
CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Auth upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Avatars
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Temporary (Private)
DROP POLICY IF EXISTS "Auth read temporary" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload temporary" ON storage.objects;
DROP POLICY IF EXISTS "Auth update temporary" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete temporary" ON storage.objects;
CREATE POLICY "Auth read temporary" ON storage.objects FOR SELECT USING (bucket_id = 'temporary' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth upload temporary" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'temporary' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update temporary" ON storage.objects FOR UPDATE USING (bucket_id = 'temporary' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete temporary" ON storage.objects FOR DELETE USING (bucket_id = 'temporary' AND auth.uid() IS NOT NULL);

-- ============================================
-- Explicit GRANTS for PostgREST
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';