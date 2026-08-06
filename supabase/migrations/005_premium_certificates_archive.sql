-- ============================================
-- 005 - Premium Certificates & Archive System
-- ============================================

-- 1. Add missing fields to certificates
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS start_date TEXT,
  ADD COLUMN IF NOT EXISTS end_date TEXT,
  ADD COLUMN IF NOT EXISTS completion_date TEXT,
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS verification_url TEXT,
  ADD COLUMN IF NOT EXISTS raw_ai_response JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 2. Update content_status Enum
-- To support the new archive system logic: active, hidden, etc.
ALTER TYPE public.content_status ADD VALUE IF NOT EXISTS 'active';
ALTER TYPE public.content_status ADD VALUE IF NOT EXISTS 'hidden';

-- Note: We will treat 'published' as a legacy equivalent to 'active'
-- optionally we can update existing records:
UPDATE public.certificates SET status = 'active' WHERE status = 'published';
UPDATE public.projects SET status = 'active' WHERE status = 'published';
UPDATE public.events SET status = 'active' WHERE status = 'published';
UPDATE public.gallery SET status = 'active' WHERE status = 'published';
UPDATE public.achievements SET status = 'active' WHERE status = 'published';
UPDATE public.experience SET status = 'active' WHERE status = 'published';
UPDATE public.skills SET status = 'active' WHERE status = 'published';

-- Reload schema for PostgREST
NOTIFY pgrst, 'reload schema';
