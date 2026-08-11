-- Extend achievements table for World-Class Achievement & Recognition System

ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS certificate_url text,
  ADD COLUMN IF NOT EXISTS certificate_type text,
  ADD COLUMN IF NOT EXISTS certificate_filename text,
  ADD COLUMN IF NOT EXISTS certificate_mime_type text,
  ADD COLUMN IF NOT EXISTS verification_url text,
  ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence jsonb DEFAULT '[]'::jsonb;
