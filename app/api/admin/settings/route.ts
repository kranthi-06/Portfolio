import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { settingsSchema } from "@/lib/server/validations";

export const GET = withApiAuth(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  
  const settings: Record<string, unknown> = {};
  for (const row of data || []) settings[row.key] = row.value;
  return apiSuccess(settings);
});

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { key, value } = settingsSchema.parse(rawBody);
  
  const { error } = await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
  
  await logActivity({ action: "settings_update", entityType: "settings", entityTitle: key });
  return apiSuccess(null, "Settings updated successfully");
});
