import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";

// Hashing secret for visitor IDs (should use env variable in prod)
const HASH_SECRET = process.env.ANALYTICS_SALT || "portfolio-analytics-secret-salt";

function hashIp(ip: string, userAgent: string) {
  return crypto.createHash("sha256").update(`${ip}-${userAgent}-${HASH_SECRET}`).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, sessionId: clientSessionId } = body;
    
    // Extract headers
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    let region = req.headers.get("x-vercel-ip-country-region") || "Unknown";
    const city = req.headers.get("x-vercel-ip-city") || "Unknown";
    const timezone = req.headers.get("x-vercel-ip-timezone") || "Unknown";

    // Indian State Mapping
    if (country === "IN" && region !== "Unknown") {
      const stateMap: Record<string, string> = {
        "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar",
        "CG": "Chhattisgarh", "GA": "Goa", "GJ": "Gujarat", "HR": "Haryana",
        "HP": "Himachal Pradesh", "JH": "Jharkhand", "KA": "Karnataka", "KL": "Kerala",
        "MP": "Madhya Pradesh", "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya",
        "MZ": "Mizoram", "NL": "Nagaland", "OD": "Odisha", "PB": "Punjab", "RJ": "Rajasthan",
        "SK": "Sikkim", "TN": "Tamil Nadu", "TG": "Telangana", "TR": "Tripura",
        "UP": "Uttar Pradesh", "UK": "Uttarakhand", "WB": "West Bengal",
        "AN": "Andaman and Nicobar Islands", "CH": "Chandigarh", "DN": "Dadra and Nagar Haveli",
        "DD": "Daman and Diu", "DL": "Delhi", "JK": "Jammu and Kashmir", "LA": "Ladakh",
        "LD": "Lakshadweep", "PY": "Puducherry"
      };
      region = stateMap[region] || region;
    }

    const visitorHash = hashIp(ip, userAgent);

    // Parse UA
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const deviceType = parser.getDevice().type || "desktop";
    
    const supabase = await createSupabaseServerClient();

    // 1. Get or Create Visitor
    const { data: existingVisitor } = await supabase
      .from("analytics_visitors")
      .select("id, first_seen_at")
      .eq("visitor_hash", visitorHash)
      .maybeSingle();

    let visitorId = existingVisitor?.id;
    let isReturning = false;

    if (existingVisitor) {
      // Check if it's been more than 24h for "returning" definition or similar
      isReturning = true;
      await supabase.from("analytics_visitors").update({ last_seen_at: new Date().toISOString() }).eq("id", visitorId);
    } else {
      const { data: newVisitor } = await supabase.from("analytics_visitors").insert({
        visitor_hash: visitorHash,
        country,
        region,
        city,
        timezone,
        browser,
        os,
        device_type: deviceType,
        resolution: payload.resolution || "Unknown",
        language: payload.language || "Unknown",
        is_returning: false,
      }).select("id").single();
      if (newVisitor) visitorId = newVisitor.id;
    }

    if (!visitorId) return NextResponse.json({ error: "Failed to resolve visitor" }, { status: 500 });

    // 2. Manage Session
    let sessionId = clientSessionId;
    let session;
    
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from("analytics_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
        
      if (existingSession) {
        session = existingSession;
        // Update session ended_at
        const now = new Date();
        const started = new Date(session.started_at);
        const duration = Math.floor((now.getTime() - started.getTime()) / 1000);
        await supabase.from("analytics_sessions").update({
          ended_at: now.toISOString(),
          duration,
          is_bounced: duration < 10 // Consider not bounced if they stay > 10s
        }).eq("id", sessionId);
      }
    }
    
    if (!session) {
      // Create new session
      const { data: newSession } = await supabase.from("analytics_sessions").insert({
        visitor_id: visitorId,
        referrer: payload.referrer || "direct",
        referrer_source: payload.referrerSource || "direct",
        landing_page: payload.pathname || "/",
        exit_page: payload.pathname || "/",
      }).select().single();
      if (newSession) {
        session = newSession;
        sessionId = session.id;
      }
    }

    if (!sessionId) return NextResponse.json({ error: "Failed to resolve session" }, { status: 500 });

    // 3. Handle Actions
    if (action === "pageview") {
      // Update session exit page
      await supabase.from("analytics_sessions").update({ exit_page: payload.pathname }).eq("id", sessionId);
      
      await supabase.from("analytics_page_views").insert({
        session_id: sessionId,
        visitor_id: visitorId,
        pathname: payload.pathname,
        search_params: payload.searchParams || {},
      });
    } else if (action === "ping") {
      // Update time on page for the latest page view in this session
      const { data: lastView } = await supabase
        .from("analytics_page_views")
        .select("id, time_on_page")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (lastView) {
        await supabase.from("analytics_page_views").update({
          time_on_page: lastView.time_on_page + 10 // assuming ping every 10s
        }).eq("id", lastView.id);
      }
    } else if (action === "event") {
      await supabase.from("analytics_events").insert({
        session_id: sessionId,
        visitor_id: visitorId,
        event_name: payload.eventName,
        event_data: payload.eventData || {},
      });
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error("[Analytics Track Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
