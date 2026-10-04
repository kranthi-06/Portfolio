import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withAdminAuth } from "@/lib/server/admin-auth";
import { subDays, startOfDay, endOfDay, subMinutes, format } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

const ANALYTICS_TIMEZONE = "Asia/Kolkata";

function parseRange(range: string | null): { start: string; end: string } {
  const now = toZonedTime(new Date(), ANALYTICS_TIMEZONE);
  const end = endOfDay(now).toISOString();
  let start: Date;

  switch (range) {
    case "today":
      start = startOfDay(now);
      break;
    case "yesterday":
      start = startOfDay(subDays(now, 1));
      break;
    case "7":
      start = startOfDay(subDays(now, 7));
      break;
    case "30":
      start = startOfDay(subDays(now, 30));
      break;
    case "90":
      start = startOfDay(subDays(now, 90));
      break;
    case "all":
      start = new Date("2020-01-01");
      break;
    default:
      start = startOfDay(subDays(now, 30));
  }

  return { start: start.toISOString(), end };
}

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30";
  const { start, end } = parseRange(range);
  const now = toZonedTime(new Date(), ANALYTICS_TIMEZONE);

  // 1. Overview Stats
  const [
    { count: totalVisitors },
    { count: returningVisitors },
    { count: totalSessions },
    { count: totalPageViews },
    { count: visitorsToday },
    { count: visitorsThisWeek },
    { count: visitorsThisMonth },
    { count: activeNow },
  ] = await Promise.all([
    supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).gte("first_seen_at", start).lte("first_seen_at", end),
    supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).eq("is_returning", true).gte("last_seen_at", start).lte("last_seen_at", end),
    supabase.from("analytics_sessions").select("*", { count: "exact", head: true }).gte("started_at", start).lte("started_at", end),
    supabase.from("analytics_page_views").select("*", { count: "exact", head: true }).gte("created_at", start).lte("created_at", end),
    supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).gte("first_seen_at", startOfDay(now).toISOString()),
    supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).gte("first_seen_at", startOfDay(subDays(now, 7)).toISOString()),
    supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).gte("first_seen_at", startOfDay(subDays(now, 30)).toISOString()),
    supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).gte("last_seen_at", subMinutes(now, 5).toISOString()),
  ]);

  // 2. Average Session Duration & Bounce Rate
  const { data: sessions } = await supabase
    .from("analytics_sessions")
    .select("duration, is_bounced")
    .gte("started_at", start)
    .lte("started_at", end);

  let avgSessionDuration = 0;
  let bounceRate = 0;

  if (sessions && sessions.length > 0) {
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    avgSessionDuration = Math.round(totalDuration / sessions.length);
    const bounces = sessions.filter(s => s.is_bounced).length;
    bounceRate = Math.round((bounces / sessions.length) * 100);
  }

  // 3. Top Pages
  const { data: pageViews } = await supabase
    .from("analytics_page_views")
    .select("pathname, time_on_page")
    .gte("created_at", start)
    .lte("created_at", end);

  const pagesMap: Record<string, { views: number; time: number; uniqueVisitors: Set<string> }> = {};
  
  // We need visitor_id for unique visitors per page - use a subquery approach
  const { data: pageViewsWithVisitor } = await supabase
    .from("analytics_page_views")
    .select("pathname, time_on_page, visitor_id")
    .gte("created_at", start)
    .lte("created_at", end);

  pageViewsWithVisitor?.forEach(pv => {
    if (!pagesMap[pv.pathname]) pagesMap[pv.pathname] = { views: 0, time: 0, uniqueVisitors: new Set() };
    pagesMap[pv.pathname].views += 1;
    pagesMap[pv.pathname].time += (pv.time_on_page || 0);
    pagesMap[pv.pathname].uniqueVisitors.add(pv.visitor_id);
  });

  const topPages = Object.entries(pagesMap)
    .map(([path, data]) => ({ 
      path, 
      views: data.views, 
      uniqueVisitors: data.uniqueVisitors.size,
      avgTime: data.views > 0 ? Math.round(data.time / data.views) : 0 
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // 4. Time Series (Daily Visitors) - use the view
  const { data: dailyVisitors } = await supabase
    .from("analytics_daily_visitors")
    .select("*")
    .gte("date", start.split("T")[0])
    .lte("date", end.split("T")[0])
    .order("date", { ascending: true });

  const timeSeries = (dailyVisitors || []).map(d => ({
    date: formatTz(d.date, "MMM d", { timeZone: ANALYTICS_TIMEZONE }),
    visitors: d.new_visitors + d.returning_visitors,
    newVisitors: d.new_visitors,
    returningVisitors: d.returning_visitors,
  }));

  // 5. Devices & Browsers & OS (use views)
  const [
    { data: devicesData },
    { data: browsersData },
    { data: osData },
    { data: countriesData },
    { data: regionsData },
    { data: referrersData },
  ] = await Promise.all([
    supabase.from("analytics_by_device").select("*"),
    supabase.from("analytics_by_browser").select("*"),
    supabase.from("analytics_by_os").select("*"),
    supabase.from("analytics_by_country").select("*"),
    supabase.from("analytics_india_states").select("*"),
    supabase.from("analytics_referrer_sources").select("*"),
  ]);

  const formatData = <T extends { unique_visitors: number; sessions: number; page_views: number }>(
    data: T[] | null, 
    nameKey: keyof T
  ) => (data || []).map(d => ({
    name: String(d[nameKey]),
    visitors: d.unique_visitors,
    sessions: d.sessions,
    pageViews: d.page_views,
  })).sort((a, b) => b.visitors - a.visitors);

  return apiSuccess({
    overview: {
      totalVisitors: totalVisitors || 0,
      returningVisitors: returningVisitors || 0,
      newVisitors: (totalVisitors || 0) - (returningVisitors || 0),
      totalSessions: totalSessions || 0,
      totalPageViews: totalPageViews || 0,
      avgSessionDuration,
      bounceRate,
      visitorsToday: visitorsToday || 0,
      visitorsThisWeek: visitorsThisWeek || 0,
      visitorsThisMonth: visitorsThisMonth || 0,
      activeNow: activeNow || 0,
    },
    topPages,
    timeSeries,
    demographics: {
      devices: formatData(devicesData, "device_type"),
      deviceBrands: (devicesData || []).filter(d => d.device_brand).map(d => ({
        name: d.device_brand!,
        visitors: d.unique_visitors,
        sessions: d.sessions,
        pageViews: d.page_views,
      })).sort((a, b) => b.visitors - a.visitors),
      browsers: formatData(browsersData, "browser"),
      os: formatData(osData, "os"),
      countries: formatData(countriesData, "country"),
      regions: formatData(regionsData, "state"),
      referrers: (referrersData || []).map(d => ({
        name: d.referrer_source,
        visitors: d.unique_visitors,
        sessions: d.sessions,
      })).sort((a, b) => b.visitors - a.visitors),
    }
  });
});