import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withPublicApi } from "@/lib/server/api-utils";

export const GET = withPublicApi(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const { data: activeResume, error } = await supabase
    .from("resume")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error || !activeResume?.file_url) {
    return new NextResponse("Resume not found", { status: 404 });
  }

  // Fetch the file from Cloudinary (or existing URL) with a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const response = await fetch(activeResume.file_url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch resume: ${response.statusText}`);
    }

    // Return the file as a downloadable PDF
    const headers = new Headers(response.headers);
    
    // Force content type to PDF in case Cloudinary served it as raw
    headers.set("Content-Type", "application/pdf");
    
    // Set a clean filename for download
    const fileName = "Kasa_Kranthi_Kiran_Resume.pdf";
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);

    // Remove Cloudinary's content-disposition if it exists
    if (headers.has("content-disposition") && headers.get("content-disposition")?.includes("attachment") === false) {
      headers.set("content-disposition", `attachment; filename="${fileName}"`);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    throw err; // Let withPublicApi catch and handle it
  }
});
