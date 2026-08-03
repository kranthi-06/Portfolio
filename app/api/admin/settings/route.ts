import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const settings: Record<string, unknown> = {};
  for (const row of data || []) settings[row.key] = row.value;
  return NextResponse.json({ data: settings });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });
  const { error } = await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity({ action: "settings_update", entityType: "settings", entityTitle: key });
  return NextResponse.json({ success: true });
}
