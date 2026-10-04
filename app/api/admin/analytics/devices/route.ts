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
