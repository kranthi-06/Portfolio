import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withAdminAuth } from '@/lib/server/admin-auth';
import { CloudinaryService } from '@/lib/services/cloudinary';

export const POST = withAdminAuth(async (request: NextRequest, admin) => {
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

