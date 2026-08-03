import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { mediaSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const search = new URL(request.url).searchParams.get("search");
  
  let query = supabase.from("media").select("*").order("created_at", { ascending: false });
  if (search) query = query.or(`original_name.ilike.%${search}%,file_type.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const body = mediaSchema.parse(rawBody);
  
  const { data, error } = await supabase.from("media").insert(body).select().single();
  if (error) throw error;
  
  return apiSuccess(data, "Media metadata saved successfully", 201);
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) throw error;
  
  return apiSuccess(null, "Media metadata deleted successfully");
});
