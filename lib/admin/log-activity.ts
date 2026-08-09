import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type LogAction =
  | "create" | "update" | "delete" | "publish" | "unpublish"
  | "archive" | "upload" | "login" | "logout" | "ai_generate" | "settings_update";

interface LogEntry {
  action: LogAction;
  entityType: string;
  entityId?: string;
  entityTitle?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(entry: LogEntry) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("activity_logs").insert({
      user_id: user?.id,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      entity_title: entry.entityTitle,
      metadata: entry.metadata || {},
    });
  } catch (err) { console.error(err);
    // Activity logging should never break the main flow
    console.error("Failed to log activity:", entry);
  }
}
