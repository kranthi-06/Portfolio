import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { CloudinaryService } from "@/lib/services/cloudinary";
import { z } from "zod";

const createSchema = z.object({
  certificate_id: z.string().uuid("Valid certificate ID is required"),
  image_url: z.string().url("Valid image URL is required"),
  image_public_id: z.string().nullable().optional(),
  image_type: z.string().default("general"),
  caption: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

const updateSchema = z.object({
  id: z.string().uuid("Valid ID is required"),
  image_type: z.string().optional(),
  caption: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
});

// GET — list supporting images for a certificate
export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const certificateId = url.searchParams.get("certificate_id");

  if (!certificateId) {
    return apiError(new Error("certificate_id is required"), 400);
  }

  const { data, error } = await supabase
    .from("certificate_supporting_images")
    .select("*")
    .eq("certificate_id", certificateId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return apiSuccess(data);
});

// POST — add a supporting image
export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = createSchema.parse(rawBody);

  const { data, error } = await supabase
    .from("certificate_supporting_images")
    .insert(body)
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    action: "create",
    entityType: "certificate_supporting_image",
    entityId: data.id,
    entityTitle: body.image_type || "Supporting Image",
    metadata: { certificateId: body.certificate_id },
  });

  return apiSuccess(data, "Supporting image added", 201);
});

// PATCH — update a supporting image
export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = updateSchema.parse(rawBody);

  const { data, error } = await supabase
    .from("certificate_supporting_images")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return apiSuccess(data, "Supporting image updated");
});

// DELETE — remove a supporting image
export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");

  if (!id) return apiError(new Error("ID required"), 400);

  // Fetch the image to cleanup Cloudinary
  const { data: img } = await supabase
    .from("certificate_supporting_images")
    .select("image_url, image_public_id, image_type")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("certificate_supporting_images")
    .delete()
    .eq("id", id);

  if (error) throw error;

  // Cleanup Cloudinary
  if (img?.image_url) {
    const pubId = img.image_public_id || CloudinaryService.extractPublicId(img.image_url);
    if (pubId) await CloudinaryService.deleteAsset(pubId, "image");
  }

  await logActivity({
    action: "delete",
    entityType: "certificate_supporting_image",
    entityId: id,
    entityTitle: img?.image_type || "Supporting Image",
  });

  return apiSuccess(null, "Supporting image deleted");
});
