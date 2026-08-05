import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { CloudinaryService } from "@/lib/services/cloudinary";
import { resumeSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("resume").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = resumeSchema.parse(rawBody);

  // Deactivate all existing resumes
  await supabase.from("resume").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");

  // Get next version
  const { count } = await supabase.from("resume").select("id", { count: "exact", head: true });
  const version = (count || 0) + 1;

  const { data, error } = await supabase.from("resume").insert({
    file_url: body.file_url,
    file_public_id: body.file_public_id || null,
    file_name: body.file_name,
    file_size: body.file_size,
    version,
    is_active: true,
  }).select().single();

  if (error) throw error;
  
  await logActivity({ action: "upload", entityType: "resume", entityId: data.id, entityTitle: `Resume v${version}` });
  return apiSuccess(data, "Resume uploaded successfully", 201);
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: res } = await supabase.from("resume").select("file_name, file_url, file_public_id").eq("id", id).single();
  const { error } = await supabase.from("resume").delete().eq("id", id);
  if (error) throw error;

  // Cleanup Cloudinary
  if (res?.file_url) {
    const pubId = res.file_public_id || CloudinaryService.extractPublicId(res.file_url);
    if (pubId) {
      const type = res.file_url.includes('.pdf') ? 'raw' : 'image';
      await CloudinaryService.deleteAsset(pubId, type);
    }
  }

  await logActivity({ action: "delete", entityType: "resume", entityId: id, entityTitle: res?.file_name });
  return apiSuccess(null, "Resume deleted successfully");
});
