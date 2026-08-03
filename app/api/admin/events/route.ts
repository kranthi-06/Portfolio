import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let query = supabase.from("events").select("*, event_images(*)").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { images, ...eventData } = body;

  const { data, error } = await supabase.from("events").insert(eventData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, images, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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

  const action = updates.status === "published" ? "publish" : updates.status === "archived" ? "archive" : "update";
  await logActivity({ action, entityType: "event", entityId: data.id, entityTitle: data.name });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { data: ev } = await supabase.from("events").select("name").eq("id", id).single();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({ action: "delete", entityType: "event", entityId: id, entityTitle: ev?.name });
  return NextResponse.json({ success: true });
}
