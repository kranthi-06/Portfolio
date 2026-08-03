import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeCertificate } from "@/lib/ai/gemini";
import { logActivity } from "@/lib/admin/log-activity";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { fileUrl, fileType, entityId } = body;

    if (!fileUrl || !fileType) {
      return NextResponse.json({ error: "fileUrl and fileType are required" }, { status: 400 });
    }

    // Fetch the file from Supabase Storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch file from storage" }, { status: 400 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    // Determine MIME type for Gemini
    let mimeType: "application/pdf" | "image/png" | "image/jpeg" | "image/webp";
    if (fileType === "pdf" || fileType === "application/pdf") {
      mimeType = "application/pdf";
    } else if (fileType === "png" || fileType === "image/png") {
      mimeType = "image/png";
    } else if (fileType === "webp" || fileType === "image/webp") {
      mimeType = "image/webp";
    } else {
      mimeType = "image/jpeg";
    }

    // Run Gemini AI analysis
    const analysis = await analyzeCertificate({ data: base64Data, mimeType });

    // Save AI generation record
    await supabase.from("ai_generations").insert({
      entity_type: "certificate",
      entity_id: entityId || null,
      input_type: mimeType.startsWith("image/") ? "image" : "pdf",
      output: analysis,
      model: "gemini-3.6-flash",
    });

    await logActivity({
      action: "ai_generate",
      entityType: "certificate",
      entityId: entityId || undefined,
      entityTitle: analysis.title,
      metadata: { category: analysis.category, confidence: analysis.categoryConfidence },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Certificate analyze error:", error);
    const message = error instanceof Error ? error.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
