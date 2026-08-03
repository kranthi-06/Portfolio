import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";

// GET — List all certificates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    return NextResponse.json({ data, count, page, limit });
  } catch (error) {
    console.error("Certificates GET error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}

// POST — Create a new certificate
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
      .from("certificates")
      .insert({
        title: body.title,
        organization: body.organization,
        description: body.description,
        professional_summary: body.professional_summary,
        category: body.category,
        category_confidence: body.category_confidence,
        requires_category_review: body.requires_category_review,
        issue_date: body.issue_date,
        credential_id: body.credential_id,
        credential_url: body.credential_url,
        file_url: body.file_url,
        file_type: body.file_type,
        thumbnail_url: body.thumbnail_url,
        skills: body.skills || [],
        tags: body.tags || [],
        status: body.status || "draft",
        seo_title: body.seo_title,
        seo_description: body.seo_description,
        ai_generated: body.ai_generated || false,
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      action: "create",
      entityType: "certificate",
      entityId: data.id,
      entityTitle: data.title,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Certificates POST error:", error);
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}

// PATCH — Update a certificate
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { data, error } = await supabase
      .from("certificates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const action = updates.status === "published" ? "publish"
      : updates.status === "archived" ? "archive" : "update";

    await logActivity({
      action,
      entityType: "certificate",
      entityId: data.id,
      entityTitle: data.title,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Certificates PATCH error:", error);
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 });
  }
}

// DELETE — Delete a certificate
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Get certificate before deleting for logging
    const { data: cert } = await supabase
      .from("certificates")
      .select("title, file_url")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) throw error;

    await logActivity({
      action: "delete",
      entityType: "certificate",
      entityId: id,
      entityTitle: cert?.title || "Unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Certificates DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 });
  }
}
