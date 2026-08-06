export const maxDuration = 60;
import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CertificateAnalyzer } from "@/lib/ai/certificate-analyzer";
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

  // Fetch the file from storage
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    return apiError(new Error("Failed to fetch file from storage"), 400);
  }

  const fileArrayBuffer = await fileResponse.arrayBuffer();
  const fileBuffer = Buffer.from(fileArrayBuffer);

  // Compute file hash for duplicate detection
  const fileHash = CertificateAnalyzer.computeFileHash(fileBuffer);

  // Check for duplicates
  const { data: existingCert } = await supabase
    .from("certificates")
    .select("id, title")
    .eq("file_hash", fileHash)
    .limit(1)
    .maybeSingle();

  if (existingCert) {
    return apiSuccess({
      duplicate: true,
      existingCertificate: existingCert,
      message: `A certificate with the same file already exists: "${existingCert.title}"`,
    }, "Duplicate certificate detected");
  }

  // Determine MIME type
  let mimeType: string;
  if (fileType === "pdf" || fileType === "application/pdf") {
    mimeType = "application/pdf";
  } else if (fileType === "png" || fileType === "image/png") {
    mimeType = "image/png";
  } else if (fileType === "webp" || fileType === "image/webp") {
    mimeType = "image/webp";
  } else {
    mimeType = "image/jpeg";
  }

  // Run the analysis pipeline
  const analyzer = new CertificateAnalyzer();
  const result = await analyzer.analyze(fileBuffer, mimeType);

  // Log each step to the database
  if (entityId) {
    for (const step of result.steps) {
      await supabase.from("certificate_analysis_logs").insert({
        certificate_id: entityId,
        step: step.step,
        status: step.status,
        duration_ms: step.durationMs,
        retry_count: step.metadata?.attempt as number || 0,
        error_message: step.error || null,
        metadata: step.metadata || {},
      }).then(() => {}); // Fire and forget
    }
  }

  // Save AI generation record
  await supabase.from("ai_generations").insert({
    entity_type: "certificate",
    entity_id: entityId || null,
    input_type: mimeType.startsWith("image/") ? "image" : "pdf",
    output: {
      analysis: result.analysis,
      status: result.status,
      confidence: result.confidence,
      retryCount: result.retryCount,
      processingTimeMs: result.processingTimeMs,
    },
    model: getServerEnvironment().GEMINI_MODEL || "gemini-2.0-flash",
  });

  await logActivity({
    action: "ai_generate",
    entityType: "certificate",
    entityId: entityId || undefined,
    entityTitle: result.analysis.title,
    metadata: {
      status: result.status,
      category: result.analysis.category,
      confidence: result.confidence,
      retryCount: result.retryCount,
      processingTimeMs: result.processingTimeMs,
    },
  });

  return apiSuccess({
    analysis: result.analysis,
    status: result.status,
    ocrText: result.ocrText,
    confidence: result.confidence,
    retryCount: result.retryCount,
    processingTimeMs: result.processingTimeMs,
    steps: result.steps,
    fileHash,
  }, result.status === "fallback"
    ? "We couldn't automatically extract all information. Please review and edit the detected details."
    : "Certificate analyzed successfully"
  );
});
