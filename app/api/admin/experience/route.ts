import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth, revalidateData } from "@/lib/server/api-utils";
import { experienceSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("experience").select("*").order("sort_order");
  if (error) throw error;
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = experienceSchema.parse(rawBody);
  
  const { data, error } = await supabase.from("experience").insert(body).select().single();
  if (error) throw error;
  
  await logActivity({ action: "create", entityType: "experience", entityId: data.id, entityTitle: data.title });
  revalidateData();
  return apiSuccess(data, "Experience created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;
  
  if (!id) return apiError(new Error("ID required"), 400);
  const body = experienceSchema.partial().parse(updates);
  
  const { data, error } = await supabase.from("experience").update(body).eq("id", id).select().single();
  if (error) throw error;
  
  await logActivity({ action: "update", entityType: "experience", entityId: data.id, entityTitle: data.title });
  revalidateData();
  return apiSuccess(data, "Experience updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);
  
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) throw error;
  
  await logActivity({ action: "delete", entityType: "experience", entityId: id });
  revalidateData();
  return apiSuccess(null, "Experience deleted successfully");
});
