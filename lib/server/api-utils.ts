import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { rateLimit } from "./rate-limit";
import { User } from "@supabase/supabase-js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
    timestamp: string;
  };
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const response: ApiResponse<T> = { success: true, data };
  if (message) response.message = message;
  return NextResponse.json(response, { status });
}

export function revalidateData(paths: string[] = ["/", "/admin"]) {
  try {
    paths.forEach(p => {
      revalidatePath(p, "layout");
      revalidatePath(p, "page");
    });
    console.log(`[Cache Invalidation] Cleared paths: ${paths.join(", ")}`);
  } catch (error) {
    console.error(`[Cache Invalidation Error] Failed to clear paths:`, error);
  }
}

export function escapeSqlLike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

export function apiError(error: unknown, status = 400, requestId?: string) {
  const timestamp = new Date().toISOString();
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred.";
  let details = undefined;

  if (error instanceof ZodError) {
    if (status === 500) {
      code = "INTERNAL_SERVER_ERROR";
      message = "Server configuration error.";
      details = error.issues;
    } else {
      code = "VALIDATION_ERROR";
      message = "Invalid input data.";
      details = error.issues;
      status = 400;
    }
  } else if (error instanceof Error) {
    if (status >= 400 && status < 500) {
      code = "CLIENT_ERROR";
      message = error.message;
    } else {
      console.error(`[API Error ${requestId || timestamp}]:`, error);
      if (!error.message.includes('relation') && !error.message.includes('syntax')) {
        message = error.message;
      }
    }
  } else {
    console.error(`[API Unknown Error ${requestId || timestamp}]:`, error);
    if (error && typeof error === 'object' && 'message' in error) {
      message = String((error as Error).message);
    } else if (typeof error === 'string') {
      message = error;
    }
  }

  const response: ApiResponse = {
    success: false,
    error: { code, message, details, timestamp, requestId },
  };

  return NextResponse.json(response, { status });
}

// Wrapper to catch errors automatically for authenticated routes
export function withApiAuth(handler: (req: NextRequest, user: User) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();
    const method = req.method;
    const url = req.url;

    console.log(`[API Request ${requestId}] ${method} ${url}`);

    try {
      const { createSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = await createSupabaseServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.warn(`[API Auth Failed ${requestId}] Unauthorized access attempt`);
        return apiError(new Error("Unauthorized"), 401, requestId);
      }
      
      const response = await handler(req, user);
      
      const duration = Date.now() - start;
      console.log(`[API Response ${requestId}] ${method} ${url} - Status ${response.status} - ${duration}ms`);
      
      return response;
    } catch (error) {
      console.error(`[API Exception ${requestId}] ${method} ${url} failed:`, error);
      return apiError(error, 500, requestId);
    }
  };
}

// Wrapper for public routes with rate limiting
export function withPublicApi(handler: (req: NextRequest) => Promise<NextResponse>, customLimit = 60) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();
    const method = req.method;
    const url = req.url;
    
    // IP based rate limiting
    // Fallback if IP headers are missing in local dev
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rl = rateLimit(ip, customLimit);

    console.log(`[Public API Request ${requestId}] ${method} ${url} (IP: ${ip})`);

    if (!rl.success) {
      console.warn(`[API Rate Limit Exceeded ${requestId}] IP: ${ip}`);
      return apiError(new Error("Too many requests, please try again later."), 429, requestId);
    }

    try {
      const response = await handler(req);
      
      // Set rate limit headers
      response.headers.set("X-RateLimit-Limit", rl.limit.toString());
      response.headers.set("X-RateLimit-Remaining", rl.remaining.toString());
      response.headers.set("X-RateLimit-Reset", rl.resetTime.toString());

      const duration = Date.now() - start;
      console.log(`[Public API Response ${requestId}] ${method} ${url} - Status ${response.status} - ${duration}ms`);
      
      return response;
    } catch (error) {
      console.error(`[Public API Exception ${requestId}] ${method} ${url} failed:`, error);
      return apiError(error, 500, requestId);
    }
  };
}
