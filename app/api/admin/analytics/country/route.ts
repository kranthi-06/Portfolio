import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, withAdminAuth } from "@/lib/server/admin-auth";
import { parseAnalyticsRange } from "@/lib/analytics/date-utils";

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const countryCode = url.searchParams.get("code");
  const range = url.searchParams.get("range") || "30";
  
  if (!countryCode) {
    return apiError(new Error("Country code required"), 400);
  }

  const { start, end } = parseAnalyticsRange(range);

  // Get country overview
  const { data: countryData } = await supabase
    .from("analytics_by_country")
    .select("*")
    .eq("country", countryCode)
    .maybeSingle();

  // Get states/regions for this country
  const { data: regionsData } = await supabase
    .from("analytics_visitors")
    .select("region")
    .eq("country", countryCode)
    .not("region", "is", null)
    .gte("first_seen_at", start)
    .lte("first_seen_at", end);

  const regionsMap: Record<string, number> = {};
  regionsData?.forEach(r => {
    if (r.region) regionsMap[r.region] = (regionsMap[r.region] || 0) + 1;
  });

  const regions = Object.entries(regionsMap)
    .map(([name, visitors]) => ({ name, visitors }))
    .sort((a, b) => b.visitors - a.visitors);

  // If India, get states from the view
  let states: any[] = [];
  if (countryCode === "IN") {
    const { data: statesData } = await supabase
      .from("analytics_india_states")
      .select("*")
      .order("unique_visitors", { ascending: false });
    states = (statesData || []).map(s => ({
      name: s.state,
      visitors: s.unique_visitors,
      sessions: s.sessions,
      pageViews: s.page_views,
    }));
  }

  return apiSuccess({
    country: countryData ? {
      name: countryData.country,
      visitors: countryData.unique_visitors,
      sessions: countryData.sessions,
      pageViews: countryData.page_views,
    } : null,
    regions,
    states,
  });
});
