import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30"; // days
  
  const days = parseInt(range, 10);
  const startDate = startOfDay(subDays(new Date(), days)).toISOString();
  const endDate = endOfDay(new Date()).toISOString();

  // 1. Overview Stats
  const { count: totalVisitors } = await supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).gte("first_seen_at", startDate).lte("first_seen_at", endDate);
  const { count: returningVisitors } = await supabase.from("analytics_visitors").select("*", { count: "exact", head: true }).eq("is_returning", true).gte("last_seen_at", startDate).lte("last_seen_at", endDate);
  const { count: totalSessions } = await supabase.from("analytics_sessions").select("*", { count: "exact", head: true }).gte("started_at", startDate).lte("started_at", endDate);
  const { count: totalPageViews } = await supabase.from("analytics_page_views").select("*", { count: "exact", head: true }).gte("created_at", startDate).lte("created_at", endDate);
  
  // 2. Average Session Duration & Bounce Rate
  const { data: sessions } = await supabase.from("analytics_sessions").select("duration, is_bounced").gte("started_at", startDate).lte("started_at", endDate);
  
  let avgSessionDuration = 0;
  let bounceRate = 0;
  
  if (sessions && sessions.length > 0) {
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    avgSessionDuration = Math.round(totalDuration / sessions.length);
    
    const bounces = sessions.filter(s => s.is_bounced).length;
    bounceRate = Math.round((bounces / sessions.length) * 100);
  }

  // 3. Top Pages
  const { data: pageViews } = await supabase.from("analytics_page_views").select("pathname, time_on_page").gte("created_at", startDate).lte("created_at", endDate);
  const pagesMap: Record<string, { views: number, time: number }> = {};
  
  pageViews?.forEach(pv => {
    if (!pagesMap[pv.pathname]) pagesMap[pv.pathname] = { views: 0, time: 0 };
    pagesMap[pv.pathname].views += 1;
    pagesMap[pv.pathname].time += (pv.time_on_page || 0);
  });
  
  const topPages = Object.entries(pagesMap)
    .map(([path, data]) => ({ path, views: data.views, avgTime: Math.round(data.time / data.views) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // 4. Time Series (Daily Visitors)
  let dailyVisitors: unknown = null;
  try {
    const res = await supabase.rpc("get_daily_visitors", { start_date: startDate, end_date: endDate });
    dailyVisitors = res.data;
  } catch (e) {}
  
  // Fallback if RPC doesn't exist (we will calculate in memory for simplicity)
  const timeSeriesMap: Record<string, number> = {};
  if (!dailyVisitors) {
    const { data: allVisitors } = await supabase.from("analytics_visitors").select("first_seen_at").gte("first_seen_at", startDate).lte("first_seen_at", endDate);
    allVisitors?.forEach(v => {
      const date = new Date(v.first_seen_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      timeSeriesMap[date] = (timeSeriesMap[date] || 0) + 1;
    });
  }
  
  const timeSeries = Object.entries(timeSeriesMap).map(([date, visitors]) => ({ date, visitors }));

  // 5. Devices & Browsers
  const { data: devicesData } = await supabase.from("analytics_visitors").select("device_type, browser, os, country, region").gte("last_seen_at", startDate).lte("last_seen_at", endDate);
  
  const devices: Record<string, number> = {};
  const browsers: Record<string, number> = {};
  const os: Record<string, number> = {};
  const countries: Record<string, number> = {};
  const regions: Record<string, number> = {}; // States (India)
  
  devicesData?.forEach(v => {
    devices[v.device_type] = (devices[v.device_type] || 0) + 1;
    browsers[v.browser] = (browsers[v.browser] || 0) + 1;
    os[v.os] = (os[v.os] || 0) + 1;
    if (v.country) countries[v.country] = (countries[v.country] || 0) + 1;
    if (v.country === "IN" && v.region) regions[v.region] = (regions[v.region] || 0) + 1;
  });

  const formatPie = (obj: Record<string, number>) => Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  return apiSuccess({
    overview: {
      totalVisitors: totalVisitors || 0,
      returningVisitors: returningVisitors || 0,
      totalSessions: totalSessions || 0,
      totalPageViews: totalPageViews || 0,
      avgSessionDuration,
      bounceRate,
    },
    topPages,
    timeSeries,
    demographics: {
      devices: formatPie(devices),
      browsers: formatPie(browsers),
      os: formatPie(os),
      countries: formatPie(countries),
      regions: formatPie(regions),
    }
  });
});
