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
    .from("analytics_by_country")
    .select("*")
    .order("unique_visitors", { ascending: false });

  const countries = (data || []).map(c => ({
    name: c.country,
    visitors: c.unique_visitors,
    sessions: c.sessions,
    pageViews: c.page_views,
  }));

  return apiSuccess({ countries });
});
