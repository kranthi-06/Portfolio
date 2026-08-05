import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withApiAuth } from '@/lib/server/api-utils';
import { CloudinaryService } from '@/lib/services/cloudinary';
import { ALLOWED_UPLOAD_TYPES, ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPES } from '@/lib/admin/constants';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = withApiAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'misc';

    if (!file) {
      return apiError(new Error('No file provided'), 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError(new Error('File exceeds 10MB limit'), 400);
    }

    const isPdf = ALLOWED_PDF_TYPES.includes(file.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    
    if (!isImage && !isPdf) {
      return apiError(new Error(`Unsupported file type: ${file.type}. Allowed: ${ALLOWED_UPLOAD_TYPES.join(', ')}`), 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Using resource_type 'auto' allows Cloudinary to figure it out,
    // but explicit is better for PDFs to prevent conversion issues.
    const resourceType = isPdf ? 'raw' : 'image';

    const result = await CloudinaryService.uploadFile(buffer, folder, resourceType);

    return apiSuccess(
      {
        secure_url: result.secure_url,
        public_id: result.public_id,
        asset_id: result.asset_id,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        created_at: result.created_at,
      },
      'File uploaded successfully',
      201
    );
  } catch (error) {
    console.error('Upload Error:', error);
    return apiError(error, 500);
  }
});
