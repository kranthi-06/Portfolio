-- Add Explicit public_id columns to all media-bearing tables

-- Projects Table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

-- Events Table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS cover_image_public_id VARCHAR(255);

-- Event Images Table
ALTER TABLE event_images
ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

-- Certificates Table
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS file_public_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS thumbnail_public_id VARCHAR(255);

-- Gallery Table
ALTER TABLE gallery
ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

-- Resume Table
ALTER TABLE resume
ADD COLUMN IF NOT EXISTS file_public_id VARCHAR(255);

-- (Optional) If you have a settings or profile table storing profile_image_url
-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS profile_image_public_id VARCHAR(255);
