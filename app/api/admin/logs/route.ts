import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withApiAuth } from "@/lib/server/api-utils";

export const GET = withApiAuth(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return apiSuccess(data);
});
