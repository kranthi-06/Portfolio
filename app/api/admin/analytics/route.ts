import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRes, todayRes, allRes] = await Promise.all([
      supabase.from("visitor_analytics").select("id", { count: "exact", head: true }),
      supabase.from("visitor_analytics").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("visitor_analytics").select("page, device, browser, country, created_at").order("created_at", { ascending: false }).limit(500),
    ]);

    const visitors = allRes.data || [];

    // Aggregate top pages
    const pageMap = new Map<string, number>();
    visitors.forEach(v => pageMap.set(v.page, (pageMap.get(v.page) || 0) + 1));
    const topPages = [...pageMap.entries()].sort((a, b) => b[1] - a[1]).map(([page, count]) => ({ page, count }));

    // Aggregate devices
    const deviceMap = new Map<string, number>();
    visitors.forEach(v => deviceMap.set(v.device || "Unknown", (deviceMap.get(v.device || "Unknown") || 0) + 1));
    const topDevices = [...deviceMap.entries()].sort((a, b) => b[1] - a[1]).map(([device, count]) => ({ device, count }));

    // Aggregate browsers
    const browserMap = new Map<string, number>();
    visitors.forEach(v => browserMap.set(v.browser || "Unknown", (browserMap.get(v.browser || "Unknown") || 0) + 1));
    const topBrowsers = [...browserMap.entries()].sort((a, b) => b[1] - a[1]).map(([browser, count]) => ({ browser, count }));

    return NextResponse.json({
      totalVisitors: totalRes.count || 0,
      todayVisitors: todayRes.count || 0,
      topPages,
      topDevices,
      topBrowsers,
      recentVisitors: visitors.slice(0, 20),
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
