import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withApiAuth } from "@/lib/server/api-utils";
import { subMinutes } from "date-fns";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  
  // Consider users "active" if their last ping/pageview was within the last 3 minutes
  const activeThreshold = subMinutes(new Date(), 3).toISOString();

  // 1. Get Live Users (Sessions that have recent page views)
  // To avoid complex joins if we don't have a direct "last_active_at" on session,
  // we will just look at visitors who were seen recently, and their latest session/page
  const { data: activeVisitors } = await supabase
    .from("analytics_visitors")
    .select(`
      id, country, region, city, device_type, os, browser,
      sessions:analytics_sessions ( id, landing_page, exit_page, started_at )
    `)
    .gte("last_seen_at", activeThreshold)
    .order("last_seen_at", { ascending: false })
    .limit(50);
    
  let activeUsersCount = 0;
  const activeUsers = activeVisitors?.map(v => {
    // get latest session
    const latestSession = v.sessions?.sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
    if (latestSession) activeUsersCount++;
    
    return {
      id: v.id,
      country: v.country,
      region: v.region,
      city: v.city,
      device: v.device_type,
      browser: v.browser,
      os: v.os,
      currentPage: latestSession?.exit_page || latestSession?.landing_page || "Unknown",
    };
  }) || [];

  // 2. Event Timeline (Last 50 events)
  const { data: recentEvents } = await supabase
    .from("analytics_events")
    .select(`
      id, event_name, event_data, created_at,
      visitor:analytics_visitors(city, country, region)
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  const timeline = recentEvents?.map(e => ({
    id: e.id,
    event: e.event_name,
    data: e.event_data,
    time: e.created_at,
    location: e.visitor ? `${(e.visitor as any).city || "Unknown"}, ${(e.visitor as any).country || "Unknown"}` : "Unknown Location"
  })) || [];

  return apiSuccess({
    activeUsersCount,
    activeUsers: activeUsers.slice(0, 10), // send top 10 for detailed view
    timeline
  });
});
