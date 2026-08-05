import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth, revalidateData, escapeSqlLike } from "@/lib/server/api-utils";
import { CloudinaryService } from "@/lib/services/cloudinary";
import { projectSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  let query = supabase.from("projects").select("*").order("sort_order", { ascending: true });
  if (status) query = query.eq("status", status);
  if (search) {
    const s = escapeSqlLike(search);
    query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = projectSchema.parse(rawBody);

  const { data, error } = await supabase.from("projects").insert(body).select().single();
  if (error) throw error;

  await logActivity({ action: "create", entityType: "project", entityId: data.id, entityTitle: data.title });
  revalidateData();
  return apiSuccess(data, "Project created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;
  
  if (!id) return apiError(new Error("ID required"), 400);
  const body = projectSchema.partial().parse(updates);

  // Fetch existing project to compare images
  const { data: existingProject } = await supabase.from("projects").select("image_url, image_public_id, gallery_urls").eq("id", id).single();

  const { data, error } = await supabase.from("projects").update(body).eq("id", id).select().single();
  if (error) throw error;

  // Cleanup old images if replaced
  if (existingProject) {
    if (body.image_url !== undefined && existingProject.image_url && body.image_url !== existingProject.image_url) {
      const pubId = existingProject.image_public_id || CloudinaryService.extractPublicId(existingProject.image_url);
      if (pubId) await CloudinaryService.deleteAsset(pubId);
    }
    
    // For gallery, delete removed urls
    if (body.gallery_urls !== undefined && existingProject.gallery_urls) {
      const currentGallery = body.gallery_urls || [];
      const removedUrls = existingProject.gallery_urls.filter((url: string) => !currentGallery.includes(url));
      for (const url of removedUrls) {
        const pubId = CloudinaryService.extractPublicId(url);
        if (pubId) await CloudinaryService.deleteAsset(pubId);
      }
    }
  }

  const action = updates.status === "published" ? "publish" : updates.status === "archived" ? "archive" : "update";
  await logActivity({ action, entityType: "project", entityId: data.id, entityTitle: data.title });
  revalidateData();
  return apiSuccess(data, "Project updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: proj } = await supabase.from("projects").select("title, image_url, image_public_id, gallery_urls").eq("id", id).single();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;

  // Cleanup Cloudinary
  if (proj?.image_url) {
    const pubId = proj.image_public_id || CloudinaryService.extractPublicId(proj.image_url);
    if (pubId) await CloudinaryService.deleteAsset(pubId);
  }
  if (proj?.gallery_urls?.length) {
    for (const url of proj.gallery_urls) {
      const pubId = CloudinaryService.extractPublicId(url);
      if (pubId) await CloudinaryService.deleteAsset(pubId);
    }
  }

  await logActivity({ action: "delete", entityType: "project", entityId: id, entityTitle: proj?.title });
  revalidateData();
  return apiSuccess(null, "Project deleted successfully");
});
