import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withAdminAuth } from "@/lib/server/admin-auth";
import { parseAnalyticsRange } from "@/lib/analytics/date-utils";

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30";
  const { start, end } = parseAnalyticsRange(range);

  const { data: devicesData } = await supabase
    .from("analytics_by_device")
    .select("*")
    .order("unique_visitors", { ascending: false });

  const devices = (devicesData || []).map(d => ({
    name: d.device_type,
    brand: d.device_brand,
    visitors: d.unique_visitors,
    sessions: d.sessions,
    pageViews: d.page_views,
  }));

  // Summary by type
  const typeMap: Record<string, { visitors: number; sessions: number; pageViews: number }> = {};
  devices.forEach(d => {
    if (!typeMap[d.name]) typeMap[d.name] = { visitors: 0, sessions: 0, pageViews: 0 };
    typeMap[d.name].visitors += d.visitors;
    typeMap[d.name].sessions += d.sessions;
    typeMap[d.name].pageViews += d.pageViews;
  });

  const summary = Object.entries(typeMap).map(([name, data]) => ({ name, ...data }));

  return apiSuccess({ devices, summary });
});