import { NextResponse, NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { 
  apiError, 
  apiSuccess, 
  revalidateData, 
  escapeSqlLike 
} from "./api-utils";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

// Re-export commonly used utilities
export { apiSuccess, apiError, revalidateData, escapeSqlLike };

export async function getAdminUser(request: NextRequest): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    role: profile.role,
  };
}

export function withAdminAuth(handler: (req: NextRequest, admin: AdminUser) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();
    const method = req.method;
    const url = req.url;

    console.log(`[Admin API Request ${requestId}] ${method} ${url}`);

    try {
      const admin = await getAdminUser(req);
      
      if (!admin) {
        console.warn(`[Admin API Auth Failed ${requestId}] Unauthorized admin access attempt`);
        return apiError(new Error("Admin access required"), 403, requestId);
      }
      
      const response = await handler(req, admin);
      
      const duration = Date.now() - start;
      console.log(`[Admin API Response ${requestId}] ${method} ${url} - Status ${response.status} - ${duration}ms`);
      
      return response;
    } catch (error) {
      console.error(`[Admin API Exception ${requestId}] ${method} ${url} failed:`, error);
      return apiError(error, 500, requestId);
    }
  };
}

export async function requireAdminRole(request: NextRequest): Promise<AdminUser> {
  const admin = await getAdminUser(request);
  if (!admin) {
    throw new Error("Admin access required");
  }
  return admin;
}