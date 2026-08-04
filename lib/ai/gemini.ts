import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getServerEnvironment, REQUIRED_GEMINI_MODEL } from "@/lib/server/env";

const certificateCategories = [
  "Certificate", "Internship", "Workshop", "Webinar", "Course", "Hackathon",
  "Competition", "Bootcamp", "Training", "Achievement", "Seminar", "Conference", "Volunteer Work",
] as const;

export const certificateAnalysisSchema = z.object({
  title: z.string(),
  organization: z.string(),
  description: z.string(),
  category: z.enum(certificateCategories),
  categoryConfidence: z.number().min(0).max(1),
  requiresCategoryReview: z.boolean(),
  issueDate: z.string().nullable(),
  credentialId: z.string().nullable(),
  skills: z.array(z.string()),
  tags: z.array(z.string()),
  professionalSummary: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

export type CertificateAnalysis = z.infer<typeof certificateAnalysisSchema>;

function getGeminiClient() {
  const environment = getServerEnvironment();
  return new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY });
}

export async function analyzeCertificate({ data, mimeType, retries = 2 }: { data: string; mimeType: "application/pdf" | "image/png" | "image/jpeg" | "image/webp"; retries?: number }): Promise<CertificateAnalysis> {
  try {
    const response = await getGeminiClient().models.generateContent({
      model: REQUIRED_GEMINI_MODEL,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data, mimeType } },
          { text: "Analyze this portfolio credential. Extract only evidence contained in the document. Return JSON following the supplied schema. Set requiresCategoryReview to true when categoryConfidence is below 0.8." },
        ],
      }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            title: { type: "string" }, organization: { type: "string" }, description: { type: "string" },
            category: { type: "string", enum: certificateCategories }, categoryConfidence: { type: "number" },
            requiresCategoryReview: { type: "boolean" }, issueDate: { type: ["string", "null"] }, credentialId: { type: ["string", "null"] },
            skills: { type: "array", items: { type: "string" } }, tags: { type: "array", items: { type: "string" } },
            professionalSummary: { type: "string" }, seoTitle: { type: "string" }, seoDescription: { type: "string" },
          },
          required: ["title", "organization", "description", "category", "categoryConfidence", "requiresCategoryReview", "issueDate", "credentialId", "skills", "tags", "professionalSummary", "seoTitle", "seoDescription"],
          additionalProperties: false,
        },
      },
    });

    if (!response.text) throw new Error("Gemini returned an empty certificate analysis.");
    return certificateAnalysisSchema.parse(JSON.parse(response.text));
  } catch (error) {
    if (retries > 0) {
      console.warn(`AI Analysis failed, retrying... (${retries} retries left)`);
      return analyzeCertificate({ data, mimeType, retries: retries - 1 });
    }
    throw error;
  }
}
