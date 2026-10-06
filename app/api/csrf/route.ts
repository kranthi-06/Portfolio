import { NextRequest, NextResponse } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

const CSRF_TOKEN_NAME = "csrf_token";
const CSRF_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours

function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "")).join("");
}

function setCsrfTokenCookie(response: NextResponse, token: string) {
  response.cookies.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CSRF_TOKEN_MAX_AGE,
    path: "/",
  });
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

export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    let token = getCsrfTokenFromRequest(request);
    
    if (!token) {
      token = generateCsrfToken();
    }

    const response = NextResponse.json({ csrfToken: token });
    setCsrfTokenCookie(response, token);
    
    return response;
  } catch (err) {
    console.error("[CSRF Token Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    const requestToken = getCsrfTokenFromRequest(request);
    
    if (!requestToken || !token || requestToken !== token) {
      return NextResponse.json({ valid: false, error: "Invalid CSRF token" }, { status: 403 });
    }
    
    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[CSRF Validate Error]:", err);
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}