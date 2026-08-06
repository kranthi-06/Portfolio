import { z } from "zod";

/* ---- Certificate Categories (shared with DB enum) ---- */
const certificateCategories = [
  "Certificate", "Internship", "Workshop", "Webinar", "Course", "Hackathon",
  "Competition", "Bootcamp", "Training", "Achievement", "Seminar", "Conference", "Volunteer Work",
] as const;

/* ---- Enhanced Certificate Analysis Schema ---- */
export const certificateAnalysisSchema = z.object({
  // Core identity
  title: z.string().min(1, "Title is required"),
  organization: z.string().default("Unknown"),
  participantName: z.string().nullable().default(null),
  certificateNumber: z.string().nullable().default(null),

  // Classification
  category: z.enum(certificateCategories).default("Certificate"),
  categoryConfidence: z.number().min(0).max(1).default(0.5),
  requiresCategoryReview: z.boolean().default(true),
  certificateType: z.string().nullable().default(null),
  eventType: z.string().nullable().default(null),

  // Details
  description: z.string().default(""),
  achievement: z.string().nullable().default(null),
  position: z.string().nullable().default(null),
  location: z.string().nullable().default(null),

  // Dates
  issueDate: z.string().nullable().default(null),
  expiryDate: z.string().nullable().default(null),

  // Skills & Technologies
  skills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),

  // Generated content
  professionalSummary: z.string().default(""),
  resumeSummary: z.string().nullable().default(null),
  portfolioSummary: z.string().nullable().default(null),
  linkedinSummary: z.string().nullable().default(null),
  reflection: z.string().nullable().default(null),

  // SEO
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),

  // AI Metadata
  confidence: z.number().min(0).max(1).default(0),
  difficulty: z.string().nullable().default(null),
  importance: z.string().nullable().default(null),
  credibility: z.string().default("unknown"),
  competitionLevel: z.string().nullable().default(null),
  domain: z.string().nullable().default(null),
  subdomain: z.string().nullable().default(null),
  estimatedHours: z.number().nullable().default(null),
});

export type CertificateAnalysis = z.infer<typeof certificateAnalysisSchema>;

/* ---- JSON Schema for Gemini structured output ---- */
export const certificateAnalysisJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    organization: { type: "string" },
    participantName: { type: ["string", "null"] },
    certificateNumber: { type: ["string", "null"] },
    category: { type: "string", enum: certificateCategories },
    categoryConfidence: { type: "number" },
    requiresCategoryReview: { type: "boolean" },
    certificateType: { type: ["string", "null"] },
    eventType: { type: ["string", "null"] },
    description: { type: "string" },
    achievement: { type: ["string", "null"] },
    position: { type: ["string", "null"] },
    location: { type: ["string", "null"] },
    issueDate: { type: ["string", "null"] },
    expiryDate: { type: ["string", "null"] },
    skills: { type: "array", items: { type: "string" } },
    technologies: { type: "array", items: { type: "string" } },
    tags: { type: "array", items: { type: "string" } },
    keywords: { type: "array", items: { type: "string" } },
    professionalSummary: { type: "string" },
    resumeSummary: { type: ["string", "null"] },
    portfolioSummary: { type: ["string", "null"] },
    linkedinSummary: { type: ["string", "null"] },
    reflection: { type: ["string", "null"] },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" },
    confidence: { type: "number" },
    difficulty: { type: ["string", "null"] },
    importance: { type: ["string", "null"] },
    credibility: { type: "string" },
    competitionLevel: { type: ["string", "null"] },
    domain: { type: ["string", "null"] },
    subdomain: { type: ["string", "null"] },
    estimatedHours: { type: ["number", "null"] },
  },
  required: [
    "title", "organization", "category", "categoryConfidence",
    "requiresCategoryReview", "description", "skills", "tags",
    "professionalSummary", "seoTitle", "seoDescription", "confidence",
    "credibility",
  ],
  additionalProperties: false,
};

/* ---- Analysis Result Wrapper ---- */
export interface AnalysisResult {
  status: "success" | "partial" | "fallback";
  analysis: CertificateAnalysis;
  ocrText: string | null;
  confidence: number;
  retryCount: number;
  processingTimeMs: number;
  steps: AnalysisStepLog[];
}

export interface AnalysisStepLog {
  step: string;
  status: "completed" | "failed" | "skipped";
  durationMs: number;
  error?: string;
  metadata?: Record<string, unknown>;
}
