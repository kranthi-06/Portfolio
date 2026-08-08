import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: activeResume, error } = await supabase
      .from("resume")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error || !activeResume?.file_url) {
      return new NextResponse("Resume not found", { status: 404 });
    }

    // Fetch the file from Cloudinary (or existing URL)
    const response = await fetch(activeResume.file_url);
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
  } catch (error) {
    console.error("Download resume error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
