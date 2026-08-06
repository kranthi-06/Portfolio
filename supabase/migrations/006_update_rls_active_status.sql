-- ============================================
-- 006 - Update RLS Policies for Active Status
-- ============================================

-- Drop existing policies that rely only on 'published'
DROP POLICY IF EXISTS "Public read published projects" ON public.projects;
DROP POLICY IF EXISTS "Public read published certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public read published events" ON public.events;
DROP POLICY IF EXISTS "Public read event images" ON public.event_images;
DROP POLICY IF EXISTS "Public read published gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public read published achievements" ON public.achievements;
DROP POLICY IF EXISTS "Public read published skills" ON public.skills;
DROP POLICY IF EXISTS "Public read published experience" ON public.experience;
DROP POLICY IF EXISTS "Public read supporting images" ON public.certificate_supporting_images;

-- Create updated policies supporting both 'published' (legacy) and 'active'
CREATE POLICY "Public read published projects" ON public.projects FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Public read published certificates" ON public.certificates FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Public read event images" ON public.event_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = event_images.event_id AND events.status IN ('published', 'active')));
CREATE POLICY "Public read published gallery" ON public.gallery FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Public read published achievements" ON public.achievements FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Public read published skills" ON public.skills FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Public read published experience" ON public.experience FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Public read supporting images" ON public.certificate_supporting_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.certificates WHERE certificates.id = certificate_supporting_images.certificate_id AND certificates.status IN ('published', 'active')));

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
