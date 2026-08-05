-- Add image_public_id column to achievements table for Cloudinary asset tracking
ALTER TABLE achievements
ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);
