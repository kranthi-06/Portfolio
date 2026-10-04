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
    .from("analytics_top_pages")
    .select("*")
    .order("page_views", { ascending: false })
    .limit(50);

  const pages = (data || []).map((p, i) => ({
    rank: i + 1,
    path: p.pathname,
    uniqueVisitors: p.unique_visitors,
    views: p.page_views,
    avgTimeOnPage: Math.round(p.avg_time_on_page || 0),
  }));

  return apiSuccess({ pages });
});