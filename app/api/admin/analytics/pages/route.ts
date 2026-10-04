import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withAdminAuth } from "@/lib/server/admin-auth";
import { subDays, startOfDay, endOfDay } from "date-fns";

function parseRange(range: string | null): { start: string; end: string } {
  const now = new Date();
  const endDate = endOfDay(now).toISOString();
  let start: Date;

  switch (range) {
    case "today": start = startOfDay(now); break;
    case "yesterday": start = startOfDay(subDays(now, 1)); break;
    case "7": start = startOfDay(subDays(now, 7)); break;
    case "30": start = startOfDay(subDays(now, 30)); break;
    case "90": start = startOfDay(subDays(now, 90)); break;
    case "all": start = new Date("2020-01-01"); break;
    default: start = startOfDay(subDays(now, 30));
  }

  return { start: start.toISOString(), end: endDate };
}

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30";
  const { start, end } = parseRange(range);

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
