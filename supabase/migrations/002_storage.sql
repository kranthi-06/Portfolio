-- ============================================
-- Storage Buckets & Policies
-- Run in Supabase SQL Editor after schema migration
-- ============================================

-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('certificates', 'certificates', true, 20971520, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']),
  ('events', 'events', true, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
  ('gallery', 'gallery', true, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
  ('projects', 'projects', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']),
  ('resume', 'resume', true, 5242880, array['application/pdf']),
  ('documents', 'documents', true, 20971520, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('temporary', 'temporary', false, 20971520, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- ============================================
-- Storage Policies: Public read for all public buckets
-- ============================================

-- Certificates
create policy "Public read certificates" on storage.objects
  for select using (bucket_id = 'certificates');

create policy "Auth upload certificates" on storage.objects
  for insert with check (bucket_id = 'certificates' and auth.role() = 'authenticated');

create policy "Auth update certificates" on storage.objects
  for update using (bucket_id = 'certificates' and auth.role() = 'authenticated');

create policy "Auth delete certificates" on storage.objects
  for delete using (bucket_id = 'certificates' and auth.role() = 'authenticated');

-- Events
create policy "Public read events" on storage.objects
  for select using (bucket_id = 'events');

create policy "Auth upload events" on storage.objects
  for insert with check (bucket_id = 'events' and auth.role() = 'authenticated');

create policy "Auth update events" on storage.objects
  for update using (bucket_id = 'events' and auth.role() = 'authenticated');

create policy "Auth delete events" on storage.objects
  for delete using (bucket_id = 'events' and auth.role() = 'authenticated');

-- Gallery
create policy "Public read gallery" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "Auth upload gallery" on storage.objects
  for insert with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

create policy "Auth update gallery" on storage.objects
  for update using (bucket_id = 'gallery' and auth.role() = 'authenticated');

create policy "Auth delete gallery" on storage.objects
  for delete using (bucket_id = 'gallery' and auth.role() = 'authenticated');

-- Projects
create policy "Public read projects" on storage.objects
  for select using (bucket_id = 'projects');

create policy "Auth upload projects" on storage.objects
  for insert with check (bucket_id = 'projects' and auth.role() = 'authenticated');

create policy "Auth update projects" on storage.objects
  for update using (bucket_id = 'projects' and auth.role() = 'authenticated');

create policy "Auth delete projects" on storage.objects
  for delete using (bucket_id = 'projects' and auth.role() = 'authenticated');

-- Resume
create policy "Public read resume" on storage.objects
  for select using (bucket_id = 'resume');

create policy "Auth upload resume" on storage.objects
  for insert with check (bucket_id = 'resume' and auth.role() = 'authenticated');

create policy "Auth update resume" on storage.objects
  for update using (bucket_id = 'resume' and auth.role() = 'authenticated');

create policy "Auth delete resume" on storage.objects
  for delete using (bucket_id = 'resume' and auth.role() = 'authenticated');

-- Documents
create policy "Public read documents" on storage.objects
  for select using (bucket_id = 'documents');

create policy "Auth upload documents" on storage.objects
  for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Auth update documents" on storage.objects
  for update using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Auth delete documents" on storage.objects
  for delete using (bucket_id = 'documents' and auth.role() = 'authenticated');

-- Avatars
create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Auth upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Auth update avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Auth delete avatars" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Temporary (private bucket, only auth users)
create policy "Auth read temporary" on storage.objects
  for select using (bucket_id = 'temporary' and auth.role() = 'authenticated');

create policy "Auth upload temporary" on storage.objects
  for insert with check (bucket_id = 'temporary' and auth.role() = 'authenticated');

create policy "Auth delete temporary" on storage.objects
  for delete using (bucket_id = 'temporary' and auth.role() = 'authenticated');
