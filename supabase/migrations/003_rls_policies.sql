-- ============================================
-- Row Level Security Policies
-- Run in Supabase SQL Editor after schema migration
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table projects enable row level security;
alter table certificates enable row level security;
alter table events enable row level security;
alter table event_images enable row level security;
alter table gallery enable row level security;
alter table achievements enable row level security;
alter table skills enable row level security;
alter table experience enable row level security;
alter table resume enable row level security;
alter table settings enable row level security;
alter table messages enable row level security;
alter table visitor_analytics enable row level security;
alter table github_stats enable row level security;
alter table activity_logs enable row level security;
alter table ai_generations enable row level security;
alter table media enable row level security;

-- ============================================
-- Profiles
-- ============================================
create policy "Public read profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- ============================================
-- Projects — public read published, auth full CRUD
-- ============================================
create policy "Public read published projects" on projects
  for select using (status = 'published');
create policy "Auth read all projects" on projects
  for select using (auth.role() = 'authenticated');
create policy "Auth insert projects" on projects
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update projects" on projects
  for update using (auth.role() = 'authenticated');
create policy "Auth delete projects" on projects
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Certificates
-- ============================================
create policy "Public read published certificates" on certificates
  for select using (status = 'published');
create policy "Auth read all certificates" on certificates
  for select using (auth.role() = 'authenticated');
create policy "Auth insert certificates" on certificates
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update certificates" on certificates
  for update using (auth.role() = 'authenticated');
create policy "Auth delete certificates" on certificates
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Events
-- ============================================
create policy "Public read published events" on events
  for select using (status = 'published');
create policy "Auth read all events" on events
  for select using (auth.role() = 'authenticated');
create policy "Auth insert events" on events
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update events" on events
  for update using (auth.role() = 'authenticated');
create policy "Auth delete events" on events
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Event Images
-- ============================================
create policy "Public read event images" on event_images
  for select using (
    exists (select 1 from events where events.id = event_images.event_id and events.status = 'published')
  );
create policy "Auth read all event images" on event_images
  for select using (auth.role() = 'authenticated');
create policy "Auth insert event images" on event_images
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update event images" on event_images
  for update using (auth.role() = 'authenticated');
create policy "Auth delete event images" on event_images
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Gallery
-- ============================================
create policy "Public read published gallery" on gallery
  for select using (status = 'published');
create policy "Auth read all gallery" on gallery
  for select using (auth.role() = 'authenticated');
create policy "Auth insert gallery" on gallery
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update gallery" on gallery
  for update using (auth.role() = 'authenticated');
create policy "Auth delete gallery" on gallery
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Achievements
-- ============================================
create policy "Public read published achievements" on achievements
  for select using (status = 'published');
create policy "Auth read all achievements" on achievements
  for select using (auth.role() = 'authenticated');
create policy "Auth insert achievements" on achievements
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update achievements" on achievements
  for update using (auth.role() = 'authenticated');
create policy "Auth delete achievements" on achievements
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Skills
-- ============================================
create policy "Public read published skills" on skills
  for select using (status = 'published');
create policy "Auth read all skills" on skills
  for select using (auth.role() = 'authenticated');
create policy "Auth insert skills" on skills
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update skills" on skills
  for update using (auth.role() = 'authenticated');
create policy "Auth delete skills" on skills
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Experience
-- ============================================
create policy "Public read published experience" on experience
  for select using (status = 'published');
create policy "Auth read all experience" on experience
  for select using (auth.role() = 'authenticated');
create policy "Auth insert experience" on experience
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update experience" on experience
  for update using (auth.role() = 'authenticated');
create policy "Auth delete experience" on experience
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Resume
-- ============================================
create policy "Public read active resume" on resume
  for select using (is_active = true);
create policy "Auth read all resume" on resume
  for select using (auth.role() = 'authenticated');
create policy "Auth insert resume" on resume
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update resume" on resume
  for update using (auth.role() = 'authenticated');
create policy "Auth delete resume" on resume
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Settings — public read, auth write
-- ============================================
create policy "Public read settings" on settings for select using (true);
create policy "Auth update settings" on settings
  for update using (auth.role() = 'authenticated');
create policy "Auth insert settings" on settings
  for insert with check (auth.role() = 'authenticated');

-- ============================================
-- Messages — public insert (contact form), auth read/update/delete
-- ============================================
create policy "Public insert messages" on messages
  for insert with check (true);
create policy "Auth read messages" on messages
  for select using (auth.role() = 'authenticated');
create policy "Auth update messages" on messages
  for update using (auth.role() = 'authenticated');
create policy "Auth delete messages" on messages
  for delete using (auth.role() = 'authenticated');

-- ============================================
-- Visitor Analytics — public insert, auth read
-- ============================================
create policy "Public insert analytics" on visitor_analytics
  for insert with check (true);
create policy "Auth read analytics" on visitor_analytics
  for select using (auth.role() = 'authenticated');

-- ============================================
-- GitHub Stats — public read, auth write
-- ============================================
create policy "Public read github stats" on github_stats
  for select using (true);
create policy "Auth insert github stats" on github_stats
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update github stats" on github_stats
  for update using (auth.role() = 'authenticated');

-- ============================================
-- Activity Logs — auth only
-- ============================================
create policy "Auth read logs" on activity_logs
  for select using (auth.role() = 'authenticated');
create policy "Auth insert logs" on activity_logs
  for insert with check (auth.role() = 'authenticated');

-- ============================================
-- AI Generations — auth only
-- ============================================
create policy "Auth read ai generations" on ai_generations
  for select using (auth.role() = 'authenticated');
create policy "Auth insert ai generations" on ai_generations
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update ai generations" on ai_generations
  for update using (auth.role() = 'authenticated');

-- ============================================
-- Media — public read, auth write
-- ============================================
create policy "Public read media" on media
  for select using (true);
create policy "Auth insert media" on media
  for insert with check (auth.role() = 'authenticated');
create policy "Auth update media" on media
  for update using (auth.role() = 'authenticated');
create policy "Auth delete media" on media
  for delete using (auth.role() = 'authenticated');
