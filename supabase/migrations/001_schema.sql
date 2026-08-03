-- ============================================
-- Portfolio CMS — Complete Database Schema
-- Run in Supabase SQL Editor (or via CLI)
-- ============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- ENUM Types
-- ============================================
create type content_status as enum ('draft', 'published', 'archived');
create type message_status as enum ('unread', 'read', 'archived');
create type certificate_category as enum (
  'Certificate', 'Internship', 'Workshop', 'Webinar', 'Course',
  'Hackathon', 'Competition', 'Bootcamp', 'Training', 'Achievement',
  'Seminar', 'Conference', 'Volunteer Work'
);
create type experience_type as enum ('Internship', 'Freelancing', 'Volunteer Work', 'Training', 'Full-Time', 'Part-Time');
create type skill_category_type as enum (
  'Programming Languages', 'Frameworks', 'Libraries', 'Databases',
  'Tools', 'AI Technologies', 'Soft Skills', 'Cloud', 'DevOps', 'Other'
);
create type log_action as enum (
  'create', 'update', 'delete', 'publish', 'unpublish', 'archive',
  'upload', 'login', 'logout', 'ai_generate', 'settings_update'
);

-- ============================================
-- 1. Profiles (linked to auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- 2. Projects
-- ============================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
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
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 3. Certificates
-- ============================================
create table certificates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  organization text,
  description text,
  professional_summary text,
  category certificate_category not null default 'Certificate',
  category_confidence real default 1.0,
  requires_category_review boolean default false,
  issue_date text,
  credential_id text,
  credential_url text,
  file_url text not null,
  file_type text not null, -- 'pdf', 'png', 'jpeg', 'webp'
  thumbnail_url text,
  skills text[] default '{}',
  tags text[] default '{}',
  sort_order integer not null default 0,
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 4. Events
-- ============================================
create table events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  summary text,
  organizer text,
  location text,
  event_date text,
  event_type text, -- hackathon, workshop, conference, etc.
  achievement text, -- what was achieved
  prize text,
  highlights text[] default '{}',
  timeline_entry text,
  cover_image_url text,
  sort_order integer not null default 0,
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 5. Event Images
-- ============================================
create table event_images (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  image_url text not null,
  caption text,
  image_type text, -- participation, award, group, stage, newspaper, etc.
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_event_images_event on event_images(event_id);

-- ============================================
-- 6. Gallery
-- ============================================
create table gallery (
  id uuid primary key default uuid_generate_v4(),
  title text,
  caption text,
  image_url text not null,
  album text not null default 'General', -- Travel, College, Hackathon, Awards, etc.
  tags text[] default '{}',
  sort_order integer not null default 0,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 7. Achievements
-- ============================================
create table achievements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  event text,
  position text,
  date text,
  description text,
  image_url text,
  color text default '#FFD700',
  sort_order integer not null default 0,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 8. Skills
-- ============================================
create table skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category skill_category_type not null default 'Other',
  category_label text, -- display name override
  level integer not null default 50 check (level >= 0 and level <= 100),
  icon text,
  color text,
  sort_order integer not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 9. Experience
-- ============================================
create table experience (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  company text not null,
  company_url text,
  location text,
  type experience_type not null default 'Internship',
  start_date text not null,
  end_date text, -- null = present
  description text,
  achievements text[] default '{}',
  technologies text[] default '{}',
  sort_order integer not null default 0,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 10. Resume
-- ============================================
create table resume (
  id uuid primary key default uuid_generate_v4(),
  file_url text not null,
  file_name text not null,
  file_size integer,
  version integer not null default 1,
  is_active boolean not null default true,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- 11. Settings (key-value + JSON)
-- ============================================
create table settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Seed default settings
insert into settings (key, value) values
  ('profile', '{"name": "Kasa Kranthi Kiran", "title": "AI Systems Engineer", "bio": "", "email": "kasakk2006@gmail.com", "phone": "", "location": "India", "avatar_url": ""}'::jsonb),
  ('social_links', '{"github": "https://github.com/kranthi-06", "linkedin": "https://www.linkedin.com/in/kasakranthikiran06/", "twitter": "", "website": ""}'::jsonb),
  ('seo', '{"title": "Kasa Kranthi Kiran — AI Systems Engineer", "description": "Building intelligent products that shape the future.", "keywords": []}'::jsonb),
  ('counters', '{"projects": 15, "certificates": 30, "internships": 2, "courses": 10, "hackathons": 8, "competitions": 5, "workshops": 3, "visitors": 0, "github_commits": 470, "github_repos": 10, "experience_years": 2}'::jsonb),
  ('theme', '{"admin_dark_mode": true, "portfolio_default_theme": "pearl"}'::jsonb)
on conflict (key) do nothing;

-- ============================================
-- 12. Messages (contact form submissions)
-- ============================================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status message_status not null default 'unread',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 13. Visitor Analytics
-- ============================================
create table visitor_analytics (
  id uuid primary key default uuid_generate_v4(),
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

create index idx_analytics_page on visitor_analytics(page);
create index idx_analytics_created on visitor_analytics(created_at);

-- ============================================
-- 14. GitHub Stats (cached)
-- ============================================
create table github_stats (
  id uuid primary key default uuid_generate_v4(),
  username text not null,
  data jsonb not null default '{}',
  -- data contains: repos, commits, languages, stars, followers, contribution_graph
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================
-- 15. Activity Logs
-- ============================================
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  action log_action not null,
  entity_type text not null, -- 'certificate', 'project', 'event', etc.
  entity_id uuid,
  entity_title text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_logs_user on activity_logs(user_id);
create index idx_logs_created on activity_logs(created_at desc);
create index idx_logs_entity on activity_logs(entity_type, entity_id);

-- ============================================
-- 16. AI Generations
-- ============================================
create table ai_generations (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null, -- 'certificate', 'event', 'project'
  entity_id uuid,
  prompt text,
  input_type text, -- 'image', 'pdf', 'text'
  output jsonb not null default '{}',
  model text not null default 'gemini-3.6-flash',
  accepted boolean,
  created_at timestamptz not null default now()
);

create index idx_ai_gen_entity on ai_generations(entity_type, entity_id);

-- ============================================
-- 17. Media (centralized media library)
-- ============================================
create table media (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  original_name text not null,
  file_url text not null,
  file_type text not null, -- mime type
  file_size integer not null default 0,
  bucket text not null,
  folder text default '',
  alt_text text,
  tags text[] default '{}',
  used_by jsonb default '[]', -- tracks which entities reference this media
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_media_bucket on media(bucket);
create index idx_media_type on media(file_type);

-- ============================================
-- Auto-update updated_at triggers
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles', 'projects', 'certificates', 'events', 'gallery',
      'achievements', 'skills', 'experience', 'settings', 'messages', 'media'
    ])
  loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute procedure update_updated_at()',
      t
    );
  end loop;
end;
$$;
