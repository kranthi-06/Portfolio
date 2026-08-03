import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("resume").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Deactivate all existing resumes
  await supabase.from("resume").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");

  // Get next version
  const { count } = await supabase.from("resume").select("id", { count: "exact", head: true });
  const version = (count || 0) + 1;

  const { data, error } = await supabase.from("resume").insert({
    file_url: body.file_url,
    file_name: body.file_name,
    file_size: body.file_size,
    version,
    is_active: true,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity({ action: "upload", entityType: "resume", entityId: data.id, entityTitle: `Resume v${version}` });
  return NextResponse.json({ data });
}
