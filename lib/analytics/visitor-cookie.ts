import { cookies } from "next/headers";

const VISITOR_COOKIE_NAME = "pv_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

export function generateVisitorId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "")).join("");
}

export async function getVisitorIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(VISITOR_COOKIE_NAME);
  return cookie?.value || null;
}

export async function setVisitorIdCookie(visitorId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(VISITOR_COOKIE_NAME, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: VISITOR_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function ensureVisitorId(): Promise<string> {
  let visitorId = await getVisitorIdFromCookie();
  if (!visitorId) {
    visitorId = generateVisitorId();
    await setVisitorIdCookie(visitorId);
  }
  return visitorId;
}

export function getVisitorCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: VISITOR_COOKIE_MAX_AGE,
    path: "/",
  };
}