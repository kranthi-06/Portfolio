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
    .from("analytics_referrer_sources")
    .select("*")
    .order("unique_visitors", { ascending: false });

  const referrers = (data || []).map(r => ({
    source: r.referrer_source,
    visitors: r.unique_visitors,
    sessions: r.sessions,
  }));

  return apiSuccess({ referrers });
});
