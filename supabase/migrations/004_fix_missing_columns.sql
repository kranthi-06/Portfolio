-- Fix missing Cloudinary public ID columns for certificates
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS file_public_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS thumbnail_public_id VARCHAR(255);

-- Also ensure other tables have their public ID columns just in case
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS cover_image_public_id VARCHAR(255);

ALTER TABLE public.event_images
  ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

ALTER TABLE public.resume
  ADD COLUMN IF NOT EXISTS file_public_id VARCHAR(255);

-- Reload PostgREST schema cache to immediately reflect changes in the API
NOTIFY pgrst, 'reload schema';
