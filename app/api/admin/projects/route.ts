import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { projectSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  let query = supabase.from("projects").select("*").order("sort_order", { ascending: true });
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

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
  return apiSuccess(data, "Project created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, ...updates } = rawBody;
  
  if (!id) return apiError(new Error("ID required"), 400);
  const body = projectSchema.partial().parse(updates);

  const { data, error } = await supabase.from("projects").update(body).eq("id", id).select().single();
  if (error) throw error;

  const action = updates.status === "published" ? "publish" : updates.status === "archived" ? "archive" : "update";
  await logActivity({ action, entityType: "project", entityId: data.id, entityTitle: data.title });
  return apiSuccess(data, "Project updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: proj } = await supabase.from("projects").select("title").eq("id", id).single();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;

  await logActivity({ action: "delete", entityType: "project", entityId: id, entityTitle: proj?.title });
  return apiSuccess(null, "Project deleted successfully");
});
