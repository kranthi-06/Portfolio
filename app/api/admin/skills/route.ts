import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth, revalidateData } from "@/lib/server/api-utils";
import { skillSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("skills").select("*").order("category").order("sort_order");
  if (error) throw error;
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = skillSchema.parse(rawBody);
  
  const { data, error } = await supabase.from("skills").insert(body).select().single();
  if (error) throw error;
  
  await logActivity({ action: "create", entityType: "skill", entityId: data.id, entityTitle: data.name });
  revalidateData();
  return apiSuccess(data, "Skill created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;
  
  if (!id) return apiError(new Error("ID required"), 400);
  const body = skillSchema.partial().parse(updates);
  
  const { data, error } = await supabase.from("skills").update(body).eq("id", id).select().single();
  if (error) throw error;
  
  revalidateData();
  return apiSuccess(data, "Skill updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);
  
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw error;
  
  await logActivity({ action: "delete", entityType: "skill", entityId: id });
  revalidateData();
  return apiSuccess(null, "Skill deleted successfully");
});
