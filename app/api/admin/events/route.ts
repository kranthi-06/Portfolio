import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { eventSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let query = supabase.from("events").select("*, event_images(*)").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return apiSuccess(data);
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { images, ...eventData } = rawBody;
  
  const body = eventSchema.parse(eventData);

  const { data, error } = await supabase.from("events").insert(body).select().single();
  if (error) throw error;

  // Insert images if provided
  if (images?.length) {
    await supabase.from("event_images").insert(
      images.map((img: { image_url: string; caption?: string; image_type?: string }, i: number) => ({
        event_id: data.id,
        image_url: img.image_url,
        caption: img.caption || "",
        image_type: img.image_type || "",
        sort_order: i,
      }))
    );
  }

  await logActivity({ action: "create", entityType: "event", entityId: data.id, entityTitle: data.name });
  return apiSuccess(data, "Event created successfully", 201);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { id, images, ...updates } = rawBody;
  
  if (!id) return apiError(new Error("ID required"), 400);
  const body = eventSchema.partial().parse(updates);

  const { data, error } = await supabase.from("events").update(body).eq("id", id).select().single();
  if (error) throw error;

  // Replace images if provided
  if (images) {
    await supabase.from("event_images").delete().eq("event_id", id);
    if (images.length) {
      await supabase.from("event_images").insert(
        images.map((img: { image_url: string; caption?: string; image_type?: string }, i: number) => ({
          event_id: id,
          image_url: img.image_url,
          caption: img.caption || "",
          image_type: img.image_type || "",
          sort_order: i,
        }))
      );
    }
  }

  const action = body.status === "published" ? "publish" : body.status === "archived" ? "archive" : "update";
  await logActivity({ action, entityType: "event", entityId: data.id, entityTitle: data.name });
  return apiSuccess(data, "Event updated successfully");
});

export const DELETE = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError(new Error("ID required"), 400);

  const { data: ev } = await supabase.from("events").select("name").eq("id", id).single();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;

  await logActivity({ action: "delete", entityType: "event", entityId: id, entityTitle: ev?.name });
  return apiSuccess(null, "Event deleted successfully");
});
