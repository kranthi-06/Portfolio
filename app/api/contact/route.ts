import { NextRequest, NextResponse } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

// Simple in-memory rate limiter for contact form submissions.
// In production with multiple instances, use Redis or a database-backed approach.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max submissions
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Periodic cleanup of expired entries to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}

/**
 * Strip HTML tags from user input to prevent XSS in stored messages.
 */
function sanitizeHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// Public endpoint for contact form submissions — no auth required
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Rate limiting
    const normalizedEmail = email.toLowerCase().trim();
    if (isRateLimited(normalizedEmail)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    // Sanitize inputs
    const cleanName = sanitizeHtml(name).substring(0, 200);
    const cleanSubject = subject ? sanitizeHtml(subject).substring(0, 500) : null;
    const cleanMessage = sanitizeHtml(message).substring(0, 5000);

    if (!cleanName || !cleanMessage) {
      return NextResponse.json({ error: "Name and message cannot be empty after sanitization" }, { status: 400 });
    }

    const supabase = createPublicSupabaseClient();
    if (!supabase) {
      console.error("[Contact Form Error]: Supabase public client configuration missing");
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
    const { error } = await supabase.from("messages").insert({
      name: cleanName, email: normalizedEmail, subject: cleanSubject, message: cleanMessage, status: "unread",
    });

    if (error) {
      console.error("[Contact Form Error]:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) { console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
