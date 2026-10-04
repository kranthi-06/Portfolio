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
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const { start, end } = parseRange(range);

  const { data: events } = await supabase
    .from("analytics_events")
    .select(`
      id, event_name, event_data, created_at, path,
      visitor:analytics_visitors(id, visitor_id, country, region, city, device_type, device_brand, browser, os)
    `)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
    .limit(limit);

  const timeline = (events || []).map(e => ({
    id: e.id,
    event: e.event_name,
    data: e.event_data,
    time: e.created_at,
    path: e.path,
    location: e.visitor ? `${(e.visitor as any).city || "Unknown"}, ${(e.visitor as any).region || ""}, ${(e.visitor as any).country || "Unknown"}`.replace(/^, |, $/g, "") : "Unknown",
    device: e.visitor ? {
      type: (e.visitor as any).device_type,
      brand: (e.visitor as any).device_brand,
      browser: (e.visitor as any).browser,
      os: (e.visitor as any).os,
    } : null,
  }));

  return apiSuccess({ timeline });
});
