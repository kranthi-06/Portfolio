import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";

export const GET = withApiAuth(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return apiSuccess(data);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const { id, ...updates } = await request.json();
  if (!id) return apiError(new Error("ID required"), 400);
  const { data, error } = await supabase.from("messages").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return apiSuccess(data);
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw error;
  return apiSuccess(null, "Message deleted successfully");
});
