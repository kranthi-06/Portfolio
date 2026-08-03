import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
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
  if (search) query = query.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);

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
  return apiSuccess(data, "Certificate created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;

  if (!id) return apiError(new Error("ID required"), 400);
  const body = certificateSchema.partial().parse(updates);

  const { data, error } = await supabase
    .from("certificates")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  const action = body.status === "published" ? "publish" : body.status === "archived" ? "archive" : "update";
  await logActivity({ action, entityType: "certificate", entityId: data.id, entityTitle: data.title });
  return apiSuccess(data, "Certificate updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: cert } = await supabase.from("certificates").select("title, file_url").eq("id", id).single();
  const { error } = await supabase.from("certificates").delete().eq("id", id);
  if (error) throw error;

  await logActivity({ action: "delete", entityType: "certificate", entityId: id, entityTitle: cert?.title || "Unknown" });
  return apiSuccess(null, "Certificate deleted successfully");
});
