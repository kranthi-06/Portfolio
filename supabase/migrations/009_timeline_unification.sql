-- ============================================
-- Unify Experience into generic Timeline
-- ============================================

-- Rename and alter company -> organization
ALTER TABLE public.experience 
  RENAME COLUMN company TO organization;

ALTER TABLE public.experience 
  ALTER COLUMN organization DROP NOT NULL;

-- Rename company_url to link_url
ALTER TABLE public.experience 
  RENAME COLUMN company_url TO link_url;

-- Add new flexible fields
ALTER TABLE public.experience 
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS period text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS featured boolean not null default false;

-- Convert type from enum to text and uppercase existing values
ALTER TABLE public.experience 
  ALTER COLUMN type TYPE text USING type::text;

UPDATE public.experience 
  SET type = UPPER(type);

-- Drop the old enum type if it's no longer used elsewhere, though not strictly necessary
-- DROP TYPE IF EXISTS public.experience_type;

-- Note: We are keeping the 'journey' table around for now but it is deprecated.
