import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const CONTACT_RATE_LIMIT = 5; // max submissions per hour
const CONTACT_RATE_WINDOW_SECONDS = 60 * 60; // 1 hour
const CSRF_TOKEN_NAME = "csrf_token";

/**
 * Strip HTML tags from user input to prevent XSS in stored messages.
 */
function sanitizeHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

function getHashSecret(): string {
  const salt = process.env.ANALYTICS_SALT;
  if (salt) return salt;

  const serverSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serverSecret) {
    console.warn(
      "[Contact] ANALYTICS_SALT is not set — deriving the visitor hash salt from SUPABASE_SERVICE_ROLE_KEY. Set ANALYTICS_SALT to keep visitor hashes stable across key rotations.",
    );
    return crypto.createHash("sha256").update(`contact-salt:${serverSecret}`).digest("hex");
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("[Contact] ANALYTICS_SALT and SUPABASE_SERVICE_ROLE_KEY are both unset — falling back to the development salt.");
  }

  return "portfolio-analytics-secret-salt-dev-only";
}

function hashIp(ip: string, userAgent: string): string {
  return crypto.createHash("sha256").update(`${ip}-${userAgent}-${getHashSecret()}`).digest("hex");
}

function getCsrfTokenFromRequest(req: NextRequest): string | null {
  // Parse cookie from header directly since request.cookies.getAll() returns empty for this route
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name.trim() === CSRF_TOKEN_NAME) {
      return valueParts.join("=").trim();
    }
  }
  return null;
}

function validateCsrfToken(req: NextRequest, bodyToken: string | null): boolean {
  const cookieToken = getCsrfTokenFromRequest(req);
  const fs = require('fs');
  fs.appendFileSync('contact-debug.log', `[Contact CSRF Debug] cookieToken: ${cookieToken}, bodyToken: ${bodyToken}\n`);
  fs.appendFileSync('contact-debug.log', `[Contact CSRF Debug] All cookies (req.cookies): ${JSON.stringify(req.cookies.getAll().map(c => ({ name: c.name, value: c.value })))}\n`);
  const cookieHeader = req.headers.get("cookie") || "";
  fs.appendFileSync('contact-debug.log', `[Contact CSRF Debug] Cookie header: ${cookieHeader}\n`);
  return !!cookieToken && !!bodyToken && cookieToken === bodyToken;
}

// Public endpoint for contact form submissions — no auth required
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, csrfToken } = body;

    // Validate CSRF token
    if (!validateCsrfToken(request, csrfToken)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Sanitize inputs
    const cleanName = sanitizeHtml(name).substring(0, 200);
    const cleanSubject = subject ? sanitizeHtml(subject).substring(0, 500) : null;
    const cleanMessage = sanitizeHtml(message).substring(0, 5000);

    if (!cleanName || !cleanMessage) {
      return NextResponse.json({ error: "Name and message cannot be empty after sanitization" }, { status: 400 });
    }

    // Get idempotency key from header (required)
    const idempotencyKey = request.headers.get("Idempotency-Key");
    
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency-Key header is required" },
        { status: 400 }
      );
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      return NextResponse.json(
        { error: "Invalid Idempotency-Key format" },
        { status: 400 }
      );
    }

    // Rate limiting - check both email and IP
    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(request);
    
    // Server-only Supabase client (service role). The public contact form writes
    // messages, analytics rows and rate-limit counters that RLS intentionally
    // restricts to the service role, so the anon key cannot perform them.
    // The service-role key always stays on the server and is never shipped to the browser.
    const supabase = createSupabaseAdminClient();

    // Check email-based rate limit
    const { data: emailRateLimit } = await supabase.rpc("check_rate_limit", {
      p_identifier: normalizedEmail,
      p_endpoint: "contact_email",
      p_limit: CONTACT_RATE_LIMIT,
      p_window_seconds: CONTACT_RATE_WINDOW_SECONDS,
    });
    
    if (emailRateLimit && !emailRateLimit[0]?.allowed) {
      const resetAt = emailRateLimit[0]?.reset_at;
      const retryAfter = resetAt ? Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000) : 3600;
      return NextResponse.json(
        { error: "Too many messages from this email. Please try again later." },
        { 
          status: 429,
          headers: { "Retry-After": retryAfter.toString() }
        }
      );
    }

    // Check IP-based rate limit (stricter)
    const { data: ipRateLimit } = await supabase.rpc("check_rate_limit", {
      p_identifier: ip,
      p_endpoint: "contact_ip",
      p_limit: 3, // 3 per hour per IP
      p_window_seconds: CONTACT_RATE_WINDOW_SECONDS,
    });
    
    if (ipRateLimit && !ipRateLimit[0]?.allowed) {
      const resetAt = ipRateLimit[0]?.reset_at;
      const retryAfter = resetAt ? Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000) : 3600;
      return NextResponse.json(
        { error: "Too many requests from this IP. Please try again later." },
        { 
          status: 429,
          headers: { "Retry-After": retryAfter.toString() }
        }
      );
    }

    // Check for existing message with same idempotency key
    const { data: existingMessage } = await supabase
      .from("messages")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingMessage) {
      // Return success without creating duplicate
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Try to find visitor and session from analytics tables
    let visitorId: string | null = null;
    let sessionId: string | null = null;

    const visitorHash = hashIp(ip, request.headers.get("user-agent") || "unknown");

    // Find visitor by hash
    const { data: visitor } = await supabase
      .from("analytics_visitors")
      .select("id")
      .eq("visitor_hash", visitorHash)
      .maybeSingle();

    if (visitor) {
      visitorId = visitor.id;

      // Find active session (last 30 minutes)
      const { data: session } = await supabase
        .from("analytics_sessions")
        .select("id")
        .eq("visitor_id", visitorId)
        .gte("started_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (session) {
        sessionId = session.id;
      }
    }

    // Insert message with idempotency key and visitor/session linkage
    const { error } = await supabase.from("messages").insert({
      name: cleanName,
      email: normalizedEmail,
      subject: cleanSubject,
      message: cleanMessage,
      status: "unread",
      idempotency_key: idempotencyKey,
      visitor_id: visitorId,
      session_id: sessionId,
      source: "contact_form",
      metadata: {
        ip_hash: visitorHash.substring(0, 16), // Store truncated hash for reference
        user_agent: request.headers.get("user-agent")?.substring(0, 200) || "unknown",
      },
    });

    if (error) {
      console.error("[Contact Form Error]:", error);
      
      // If unique constraint violation on idempotency_key, treat as success
      if (error.code === "23505" && error.message.includes("idempotency_key")) {
        return NextResponse.json({ success: true, duplicate: true });
      }
      
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Also insert analytics event for contact submission
    if (visitorId && sessionId) {
      await supabase.from("analytics_events").insert({
        session_id: sessionId,
        visitor_id: visitorId,
        event_name: "contact_submit",
        event_data: { subject: cleanSubject },
        path: "/contact",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact Form Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}