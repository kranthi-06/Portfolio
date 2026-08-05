import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth, revalidateData } from "@/lib/server/api-utils";
import { CloudinaryService } from "@/lib/services/cloudinary";
import { gallerySchema } from "@/lib/server/validations";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const album = new URL(request.url).searchParams.get("album");
  let query = supabase.from("gallery").select("*").order("sort_order");
  if (album) query = query.eq("album", album);

  const { data, error } = await query;
  if (error) throw error;
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = gallerySchema.parse(rawBody);

  const { data, error } = await supabase.from("gallery").insert(body).select().single();
  if (error) throw error;

  await logActivity({ action: "create", entityType: "gallery", entityId: data.id, entityTitle: data.title });
  revalidateData();
  return apiSuccess(data, "Gallery item created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;
  
  if (!id) return apiError(new Error("ID required"), 400);
  const body = gallerySchema.partial().parse(updates);

  // Fetch existing gallery item to compare images
  const { data: existingGal } = await supabase.from("gallery").select("image_url, image_public_id").eq("id", id).single();

  const { data, error } = await supabase.from("gallery").update(body).eq("id", id).select().single();
  if (error) throw error;

  // Cleanup old image if replaced
  if (existingGal && body.image_url !== undefined && existingGal.image_url && body.image_url !== existingGal.image_url) {
    const pubId = existingGal.image_public_id || CloudinaryService.extractPublicId(existingGal.image_url);
    if (pubId) await CloudinaryService.deleteAsset(pubId);
  }
  revalidateData();
  return apiSuccess(data, "Gallery item updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: gal } = await supabase.from("gallery").select("title, image_url, image_public_id").eq("id", id).single();
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;

  // Cleanup Cloudinary
  if (gal?.image_url) {
    const pubId = gal.image_public_id || CloudinaryService.extractPublicId(gal.image_url);
    if (pubId) await CloudinaryService.deleteAsset(pubId);
  }

  await logActivity({ action: "delete", entityType: "gallery", entityId: id, entityTitle: gal?.title });
  revalidateData();
  return apiSuccess(null, "Gallery item deleted successfully");
});
