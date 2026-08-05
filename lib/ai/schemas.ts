import { z } from "zod";

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

// Shared AI schema for object generation
export const certificateAnalysisJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    organization: { type: "string" },
    description: { type: "string" },
    category: { type: "string", enum: certificateCategories },
    categoryConfidence: { type: "number" },
    requiresCategoryReview: { type: "boolean" },
    issueDate: { type: ["string", "null"] },
    credentialId: { type: ["string", "null"] },
    skills: { type: "array", items: { type: "string" } },
    tags: { type: "array", items: { type: "string" } },
    professionalSummary: { type: "string" },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" },
  },
  required: [
    "title", "organization", "description", "category", "categoryConfidence",
    "requiresCategoryReview", "issueDate", "credentialId", "skills", "tags",
    "professionalSummary", "seoTitle", "seoDescription",
  ],
  additionalProperties: false,
};
