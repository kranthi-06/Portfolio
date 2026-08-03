import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { achievementSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("achievements").select("*").order("sort_order");
  if (error) throw error;
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = achievementSchema.parse(rawBody);

  const { data, error } = await supabase.from("achievements").insert(body).select().single();
  if (error) throw error;

  await logActivity({ action: "create", entityType: "achievement", entityId: data.id, entityTitle: data.title });
  return apiSuccess(data, "Achievement created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;
  
  if (!id) return apiError(new Error("ID required"), 400);
  const body = achievementSchema.partial().parse(updates);

  const { data, error } = await supabase.from("achievements").update(body).eq("id", id).select().single();
  if (error) throw error;

  await logActivity({ action: "update", entityType: "achievement", entityId: data.id, entityTitle: data.title });
  return apiSuccess(data, "Achievement updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: ach } = await supabase.from("achievements").select("title").eq("id", id).single();
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) throw error;

  await logActivity({ action: "delete", entityType: "achievement", entityId: id, entityTitle: ach?.title });
  return apiSuccess(null, "Achievement deleted successfully");
});
