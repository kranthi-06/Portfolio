import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

import { getServerEnvironment } from '@/lib/server/env';

// Explicitly configure Cloudinary parsing the URL to avoid process.env silent failures
const env = getServerEnvironment();
const urlMatch = env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

if (urlMatch) {
  cloudinary.config({
    api_key: urlMatch[1],
    api_secret: urlMatch[2],
    cloud_name: urlMatch[3],
    secure: true,
  });
} else {
  console.warn("CLOUDINARY_URL format is invalid.");
}

export class CloudinaryService {
  /**
   * Upload a stream to Cloudinary
   * @param buffer The file buffer
   * @param folder The target folder in Cloudinary
   * @param resourceType The resource type (image, raw, video, auto)
   */
  static async uploadFile(
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto'
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          // Optimize delivery without changing the source format.
          // Cloudinary will serve the best format via fetch_format: 'auto' at delivery time,
          // but the stored asset retains its original format (important for certificates/PDFs).
          quality: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned null'));
          resolve(result);
        }
      );

      // End the stream with the buffer
      uploadStream.end(buffer);
    });
  }

  /**
   * Delete an asset from Cloudinary
   * @param publicId The Cloudinary public_id
   * @param resourceType The resource type
   */
  static async deleteAsset(publicId: string, resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image'): Promise<void> {
    try {
      if (!publicId) return;
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
    }
  }

  /**
   * Extract the public_id natively from a secure_url
   * Example: https://res.cloudinary.com/u9evrlxb/image/upload/v170000000/projects/thumbnail.webp
   * Returns: projects/thumbnail
   */
  static extractPublicId(url: string): string | null {
    if (!url || !url.includes('res.cloudinary.com')) return null;

    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      
      if (uploadIndex === -1) return null;

      // The part after 'upload' is usually the version number (e.g. v123456789)
      let publicIdParts = parts.slice(uploadIndex + 1);
      
      if (publicIdParts[0]?.startsWith('v') && !isNaN(parseInt(publicIdParts[0].substring(1)))) {
        publicIdParts = publicIdParts.slice(1);
      }

      const publicIdWithExtension = publicIdParts.join('/');
      
      // Strip the extension
      const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        return publicIdWithExtension.substring(0, lastDotIndex);
      }
      
      return publicIdWithExtension;
    } catch (err) {
      console.error("Failed to parse Cloudinary URL:", url, err);
      return null;
    }
  }
}
