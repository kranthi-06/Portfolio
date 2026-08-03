import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
    timestamp: string;
  };
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const response: ApiResponse<T> = { success: true, data };
  if (message) response.message = message;
  return NextResponse.json(response, { status });
}

export function apiError(error: any, status = 500, requestId?: string) {
  const timestamp = new Date().toISOString();
  
  // Do not expose raw database errors directly unless we sanitize them
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred.";
  let details = undefined;

  if (error instanceof ZodError) {
    code = "VALIDATION_ERROR";
    message = "Invalid input data.";
    details = error.issues;
    status = 400;
  } else if (error instanceof Error) {
    // If it's a known error type, we can extract the message securely.
    // Be careful not to leak stack traces or Postgres syntax errors.
    if (status >= 400 && status < 500) {
      code = "CLIENT_ERROR";
      message = error.message;
    } else {
      // Log the internal error securely on the server
      console.error(`[API Error ${requestId || timestamp}]:`, error);
      // We can expose the message if it's a standard Error object without DB secrets
      if (!error.message.includes('relation') && !error.message.includes('syntax')) {
        message = error.message;
      }
    }
  }

  const response: ApiResponse = {
    success: false,
    error: { code, message, details, timestamp, requestId },
  };

  return NextResponse.json(response, { status });
}

// Wrapper to catch errors automatically
export function withApiAuth(handler: (req: any, user: any) => Promise<NextResponse>) {
  return async (req: any) => {
    try {
      const { createSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return apiError(new Error("Unauthorized"), 401);
      }
      
      return await handler(req, user);
    } catch (error) {
      return apiError(error);
    }
  };
}
