import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth, revalidateData, escapeSqlLike } from "@/lib/server/api-utils";
import { CloudinaryService } from "@/lib/services/cloudinary";
import { certificateSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  let query = supabase
    .from("certificates")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (search) {
    const s = escapeSqlLike(search);
    query = query.or(`title.ilike.%${s}%,organization.ilike.%${s}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return apiSuccess({ data, count, page, limit });
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = certificateSchema.parse(rawBody);

  const { data, error } = await supabase
    .from("certificates")
    .insert(body)
    .select()
    .single();

  if (error) throw error;

  await logActivity({ action: "create", entityType: "certificate", entityId: data.id, entityTitle: data.title });
  revalidateData();
  return apiSuccess(data, "Certificate created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;

  if (!id) return apiError(new Error("ID required"), 400);
  const body = certificateSchema.partial().parse(updates);

  // Fetch existing cert to compare files
  const { data: existingCert } = await supabase.from("certificates").select("file_url, file_public_id, thumbnail_url, thumbnail_public_id").eq("id", id).single();

  const { data, error } = await supabase
    .from("certificates")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Cleanup old files if replaced
  if (existingCert) {
    if (body.file_url !== undefined && existingCert.file_url && body.file_url !== existingCert.file_url) {
      const pubId = existingCert.file_public_id || CloudinaryService.extractPublicId(existingCert.file_url);
      if (pubId) {
        // file_type helps know if it's raw or image, but we can just use extract to see extension
        const type = existingCert.file_url.includes('.pdf') ? 'raw' : 'image';
        await CloudinaryService.deleteAsset(pubId, type);
      }
    }
    if (body.thumbnail_url !== undefined && existingCert.thumbnail_url && body.thumbnail_url !== existingCert.thumbnail_url) {
      const pubId = existingCert.thumbnail_public_id || CloudinaryService.extractPublicId(existingCert.thumbnail_url);
      if (pubId) await CloudinaryService.deleteAsset(pubId, 'image');
    }
  }

  const action = body.status === "published" ? "publish" : body.status === "archived" ? "archive" : "update";
  await logActivity({ action, entityType: "certificate", entityId: data.id, entityTitle: data.title });
  revalidateData();
  return apiSuccess(data, "Certificate updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const permanent = url.searchParams.get("permanent") === "true";
  
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: cert } = await supabase.from("certificates").select("title, file_url, file_public_id, thumbnail_url, thumbnail_public_id, status").eq("id", id).single();
  
  if (permanent) {
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) throw error;

    // Cleanup Cloudinary
    if (cert?.file_url) {
      const pubId = cert.file_public_id || CloudinaryService.extractPublicId(cert.file_url);
      if (pubId) {
        const type = cert.file_url.includes('.pdf') ? 'raw' : 'image';
        await CloudinaryService.deleteAsset(pubId, type);
      }
    }
    if (cert?.thumbnail_url) {
      const pubId = cert.thumbnail_public_id || CloudinaryService.extractPublicId(cert.thumbnail_url);
      if (pubId) await CloudinaryService.deleteAsset(pubId, 'image');
    }

    await logActivity({ action: "delete", entityType: "certificate", entityId: id, entityTitle: cert?.title || "Unknown" });
    revalidateData();
    return apiSuccess(null, "Certificate permanently deleted");
  } else {
    // Soft delete: Archive
    const { error } = await supabase.from("certificates").update({ status: 'archived' }).eq("id", id);
    if (error) throw error;
    
    await logActivity({ action: "archive", entityType: "certificate", entityId: id, entityTitle: cert?.title || "Unknown" });
    revalidateData();
    return apiSuccess(null, "Certificate archived successfully");
  }
});
