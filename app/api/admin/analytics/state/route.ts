import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, withAdminAuth } from "@/lib/server/admin-auth";
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
  const countryCode = url.searchParams.get("country") || "IN";
  const stateName = url.searchParams.get("state");
  const range = url.searchParams.get("range") || "30";

  if (!stateName) {
    return apiError(new Error("State name required"), 400);
  }

  const { start, end } = parseRange(range);

  // Get state overview from view
  const { data: stateData } = await supabase
    .from("analytics_india_states")
    .select("*")
    .eq("state", stateName)
    .maybeSingle();

  // Get cities for this state
  const { data: citiesData } = await supabase
    .from("analytics_india_cities")
    .select("*")
    .eq("state", stateName)
    .order("unique_visitors", { ascending: false });

  const cities = (citiesData || []).map(c => ({
    name: c.city,
    visitors: c.unique_visitors,
    sessions: c.sessions,
    pageViews: c.page_views,
  }));

  // Get devices for this state
  const { data: devicesData } = await supabase
    .from("analytics_visitors")
    .select("device_type, device_brand, browser, os")
    .eq("country", countryCode)
    .eq("region", stateName)
    .gte("first_seen_at", start)
    .lte("first_seen_at", end);

  const aggregateByField = (field: string) => {
    const map: Record<string, number> = {};
    devicesData?.forEach(d => {
      const val = (d as any)[field];
      if (val) map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  return apiSuccess({
    state: stateData ? {
      name: stateData.state,
      visitors: stateData.unique_visitors,
      sessions: stateData.sessions,
      pageViews: stateData.page_views,
    } : null,
    cities,
    devices: aggregateByField("device_type"),
    deviceBrands: aggregateByField("device_brand"),
    browsers: aggregateByField("browser"),
    os: aggregateByField("os"),
  });
});
