import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withAdminAuth } from "@/lib/server/admin-auth";
import { parseAnalyticsRange } from "@/lib/analytics/date-utils";

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30";
  const { start, end } = parseAnalyticsRange(range);

  const { data } = await supabase
    .from("analytics_by_os")
    .select("*")
    .order("unique_visitors", { ascending: false });

  const os = (data || []).map(o => ({
    name: o.os,
    visitors: o.unique_visitors,
    sessions: o.sessions,
    pageViews: o.page_views,
  }));

  return apiSuccess({ os });
});