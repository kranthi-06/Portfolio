import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeCertificate } from "@/lib/ai/gemini";
import { logActivity } from "@/lib/admin/log-activity";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { z } from "zod";

const analyzeSchema = z.object({
  fileUrl: z.string().url("Valid file URL is required"),
  fileType: z.string().min(1, "File type is required"),
  entityId: z.string().optional().nullable(),
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { fileUrl, fileType, entityId } = analyzeSchema.parse(rawBody);

  // Fetch the file from Supabase Storage
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    return apiError(new Error("Failed to fetch file from storage"), 400);
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

  return apiSuccess({ analysis }, "Certificate analyzed successfully");
});
