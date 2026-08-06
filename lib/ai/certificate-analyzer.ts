/**
 * CertificateAnalyzer — Fault-tolerant certificate analysis engine
 *
 * Pipeline: Validate → Compress → OCR → Gemini AI → Validate JSON → Retry → Fallback
 *
 * Design principles:
 * - Never throws — always returns a result (success/partial/fallback)
 * - Never loses user data — file is saved before AI analysis begins
 * - Retries with escalating parameters (temperature, prompt, timeout)
 * - Falls back to OCR-only data if all AI retries fail
 */

import { GoogleGenAI } from "@google/genai";
import { getServerEnvironment } from "@/lib/server/env";
import {
  certificateAnalysisSchema,
  certificateAnalysisJsonSchema,
  type CertificateAnalysis,
  type AnalysisResult,
  type AnalysisStepLog,
} from "./schemas";
import { getAnalysisPrompt, getRetryTemperature } from "./certificate-prompts";
import crypto from "crypto";

const MAX_RETRIES = 3;
const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const MAX_IMAGE_DIMENSION = 2048;

/** Utility to time a step */
async function timed<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, durationMs: Date.now() - start };
}

export class CertificateAnalyzer {
  private steps: AnalysisStepLog[] = [];
  private startTime = Date.now();

  /**
   * Run the full analysis pipeline.
   * This NEVER throws — it always returns an AnalysisResult.
   */
  async analyze(
    fileBuffer: Buffer,
    mimeType: string,
    fileName?: string
  ): Promise<AnalysisResult> {
    this.steps = [];
    this.startTime = Date.now();

    let processedBuffer = fileBuffer;
    let ocrText: string | null = null;
    let analysis: CertificateAnalysis | null = null;
    let retryCount = 0;
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";

    // Step 1: Validate
    const validationOk = this.logStep("validate", "completed", 0);
    if (!isImage && !isPdf) {
      this.logStep("validate", "failed", 0, `Unsupported MIME type: ${mimeType}`);
      return this.buildFallbackResult(ocrText, retryCount);
    }

    // Step 2: Compress image if needed
    if (isImage && fileBuffer.length > MAX_IMAGE_SIZE_BYTES) {
      try {
        const { result: compressed, durationMs } = await timed(() =>
          this.compressImage(fileBuffer)
        );
        processedBuffer = compressed;
        this.logStep("compress", "completed", durationMs, undefined, {
          originalSize: fileBuffer.length,
          compressedSize: compressed.length,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Compression failed";
        this.logStep("compress", "failed", 0, msg);
        // Continue with original buffer
      }
    } else {
      this.logStep("compress", "skipped", 0);
    }

    // Step 3: OCR extraction
    if (isImage) {
      try {
        const { result: text, durationMs } = await timed(() =>
          this.extractOCR(processedBuffer)
        );
        ocrText = text;
        this.logStep("ocr", "completed", durationMs, undefined, {
          textLength: text.length,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "OCR failed";
        this.logStep("ocr", "failed", 0, msg);
        // Continue without OCR
      }
    } else {
      // For PDFs, skip OCR — Gemini handles them natively
      this.logStep("ocr", "skipped", 0, "PDF — using Gemini native PDF analysis");
    }

    // Step 4: AI Analysis with retry
    const base64Data = processedBuffer.toString("base64");

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      retryCount = attempt;
      try {
        const prompt = getAnalysisPrompt(attempt, ocrText);
        const temperature = getRetryTemperature(attempt);

        const { result: rawResult, durationMs } = await timed(() =>
          this.callGemini(base64Data, mimeType, prompt, temperature)
        );

        // Step 5: Validate JSON
        const parsed = this.validateAndRepair(rawResult);
        if (parsed) {
          analysis = parsed;
          this.logStep("ai_analysis", "completed", durationMs, undefined, {
            attempt,
            temperature,
            confidence: parsed.confidence,
          });
          break;
        } else {
          this.logStep("ai_analysis", "failed", durationMs, `Attempt ${attempt + 1}: JSON validation failed`, {
            attempt,
            rawResponsePreview: typeof rawResult === "string" ? rawResult.substring(0, 200) : "object",
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI analysis failed";
        this.logStep("ai_analysis", "failed", 0, `Attempt ${attempt + 1}: ${msg}`, {
          attempt,
        });
      }
    }

    // Build result
    if (analysis) {
      // Determine if it's full success or partial
      const status = analysis.confidence >= 0.5 ? "success" : "partial";
      return {
        status,
        analysis,
        ocrText,
        confidence: analysis.confidence,
        retryCount,
        processingTimeMs: Date.now() - this.startTime,
        steps: this.steps,
      };
    }

    // All retries failed — fallback
    return this.buildFallbackResult(ocrText, retryCount);
  }

  /**
   * Compute SHA-256 hash of a file buffer for duplicate detection.
   */
  static computeFileHash(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Compress an image using sharp.
   * Resizes longest edge to MAX_IMAGE_DIMENSION, converts to JPEG quality 85.
   */
  private async compressImage(buffer: Buffer): Promise<Buffer> {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const longestEdge = Math.max(width, height);

    let transformer = sharp(buffer);

    if (longestEdge > MAX_IMAGE_DIMENSION) {
      transformer = transformer.resize({
        width: width >= height ? MAX_IMAGE_DIMENSION : undefined,
        height: height > width ? MAX_IMAGE_DIMENSION : undefined,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    return transformer.jpeg({ quality: 85 }).toBuffer();
  }

  /**
   * Extract text from image using Tesseract.js
   */
  private async extractOCR(buffer: Buffer): Promise<string> {
    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("eng", 1, {
        cacheMethod: "none",
        logger: () => {}, // Disable logger to avoid stdout buffer issues
      });
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();
      return text.trim();
    } catch (err) {
      console.error("[CertificateAnalyzer] OCR extraction failed:", err);
      return "";
    }
  }

  /**
   * Call Gemini with the document and prompt.
   * Always uses Gemini regardless of AI_PROVIDER setting,
   * because Gemini supports both images and PDFs natively.
   */
  private async callGemini(
    base64Data: string,
    mimeType: string,
    prompt: string,
    temperature: number
  ): Promise<unknown> {
    const env = getServerEnvironment();
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required for certificate analysis");
    }

    const client = new GoogleGenAI({ apiKey });
    const model = env.GEMINI_MODEL || "gemini-2.0-flash";

    const response = await client.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt },
        ],
      }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: certificateAnalysisJsonSchema,
        temperature,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned empty response");
    }

    return JSON.parse(response.text);
  }

  /**
   * Validate and auto-repair AI output against the Zod schema.
   * Returns null if the response is completely unusable.
   */
  private validateAndRepair(raw: unknown): CertificateAnalysis | null {
    if (!raw || typeof raw !== "object") return null;

    try {
      // Try direct parse first
      return certificateAnalysisSchema.parse(raw);
    } catch {
      // Try to repair common issues
      try {
        const obj = raw as Record<string, unknown>;

        // Repair: ensure required string fields have defaults
        if (!obj.title && typeof obj.title !== "string") obj.title = "Untitled Certificate";
        if (!obj.organization) obj.organization = "Unknown";
        if (!obj.description) obj.description = "";
        if (!obj.professionalSummary) obj.professionalSummary = "";
        if (!obj.seoTitle) obj.seoTitle = String(obj.title || "Certificate");
        if (!obj.seoDescription) obj.seoDescription = String(obj.description || "");

        // Repair: ensure arrays are arrays
        if (!Array.isArray(obj.skills)) obj.skills = [];
        if (!Array.isArray(obj.technologies)) obj.technologies = [];
        if (!Array.isArray(obj.tags)) obj.tags = [];
        if (!Array.isArray(obj.keywords)) obj.keywords = [];

        // Repair: ensure numbers are numbers
        if (typeof obj.confidence !== "number") obj.confidence = 0.3;
        if (typeof obj.categoryConfidence !== "number") obj.categoryConfidence = 0.3;

        // Repair: ensure credibility has a value
        if (!obj.credibility) obj.credibility = "unknown";

        // Repair: ensure boolean
        if (typeof obj.requiresCategoryReview !== "boolean") {
          obj.requiresCategoryReview = (obj.categoryConfidence as number) < 0.8;
        }

        return certificateAnalysisSchema.parse(obj);
      } catch {
        return null;
      }
    }
  }

  /**
   * Build a fallback result from OCR text when AI fails completely.
   */
  private buildFallbackResult(ocrText: string | null, retryCount: number): AnalysisResult {
    // Try to extract a title from OCR text
    const lines = (ocrText || "").split("\n").filter((l) => l.trim().length > 0);
    const title = lines[0]?.substring(0, 100) || "Untitled Certificate";

    const fallbackAnalysis: CertificateAnalysis = {
      title,
      organization: "Unknown",
      participantName: null,
      certificateNumber: null,
      category: "Certificate",
      categoryConfidence: 0,
      requiresCategoryReview: true,
      certificateType: null,
      eventType: null,
      description: ocrText ? `Extracted text: ${ocrText.substring(0, 500)}` : "",
      achievement: null,
      position: null,
      location: null,
      issueDate: null,
      expiryDate: null,
      skills: [],
      technologies: [],
      tags: [],
      keywords: [],
      professionalSummary: "",
      resumeSummary: null,
      portfolioSummary: null,
      linkedinSummary: null,
      reflection: null,
      seoTitle: title,
      seoDescription: "",
      confidence: 0,
      difficulty: null,
      importance: null,
      credibility: "unknown",
      competitionLevel: null,
      domain: null,
      subdomain: null,
      estimatedHours: null,
    };

    this.logStep("fallback", "completed", 0, "All AI retries exhausted, using OCR-only fallback");

    return {
      status: "fallback",
      analysis: fallbackAnalysis,
      ocrText,
      confidence: 0,
      retryCount,
      processingTimeMs: Date.now() - this.startTime,
      steps: this.steps,
    };
  }

  private logStep(
    step: string,
    status: "completed" | "failed" | "skipped",
    durationMs: number,
    error?: string,
    metadata?: Record<string, unknown>
  ) {
    this.steps.push({ step, status, durationMs, error, metadata });
  }
}
