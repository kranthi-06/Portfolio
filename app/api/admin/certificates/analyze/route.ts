import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AIService } from "@/lib/ai/provider";
import { certificateAnalysisJsonSchema, certificateAnalysisSchema } from "@/lib/ai/schemas";
import { getServerEnvironment } from "@/lib/server/env";
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

  const prompt = "Analyze this portfolio credential. Extract only evidence contained in the document. Return JSON following the supplied schema. Set requiresCategoryReview to true when categoryConfidence is below 0.8.";
  
  const rawAnalysis = await AIService.analyzeDocument(base64Data, mimeType, prompt, certificateAnalysisJsonSchema);
  const analysis = certificateAnalysisSchema.parse(rawAnalysis);

  // Save AI generation record
  await supabase.from("ai_generations").insert({
    entity_type: "certificate",
    entity_id: entityId || null,
    input_type: mimeType.startsWith("image/") ? "image" : "pdf",
    output: analysis,
    model: getServerEnvironment().AI_PROVIDER,
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
