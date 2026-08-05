import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withApiAuth } from '@/lib/server/api-utils';
import { CloudinaryService } from '@/lib/services/cloudinary';

export const POST = withApiAuth(async (request: NextRequest) => {
  try {
    const rawBody = await request.json();
    const { publicId, url, resourceType = 'image' } = rawBody;

    let targetPublicId = publicId;

    // If only url is provided, try to extract it
    if (!targetPublicId && url) {
      targetPublicId = CloudinaryService.extractPublicId(url);
    }

    if (!targetPublicId) {
      return apiError(new Error('No publicId or valid Cloudinary URL provided'), 400);
    }

    await CloudinaryService.deleteAsset(targetPublicId, resourceType);

    return apiSuccess({ deleted: true, publicId: targetPublicId }, 'Asset deleted successfully');
  } catch (error) {
    console.error('Delete Asset Error:', error);
    return apiError(error, 500);
  }
});
