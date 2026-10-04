import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withAdminAuth } from "@/lib/server/admin-auth";
import { subMinutes } from "date-fns";

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const windowMinutes = parseInt(url.searchParams.get("window") || "5", 10);
  const activeThreshold = subMinutes(new Date(), windowMinutes).toISOString();

  // Get active visitors from the view
  const { data: activeVisitors } = await supabase
    .from("analytics_active_visitors")
    .select("*")
    .gte("last_seen_at", activeThreshold)
    .order("last_seen_at", { ascending: false })
    .limit(50);

  const activeUsers = (activeVisitors || []).map(v => ({
    id: v.id,
    visitorId: v.visitor_id,
    country: v.country,
    region: v.region,
    city: v.city,
    deviceType: v.device_type,
    deviceBrand: v.device_brand,
    browser: v.browser,
    os: v.os,
    currentPage: v.current_page,
    sessionStartedAt: v.session_started_at,
    lastSeenAt: v.last_seen_at,
  }));

  return apiSuccess({
    activeUsersCount: activeUsers.length,
    activeUsers,
  });
});
