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