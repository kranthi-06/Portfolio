import { z } from "zod";

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  long_description: z.string().nullable().optional(),
  problem: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  features: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  github_url: z.string().url().nullable().optional().or(z.literal("")),
  live_url: z.string().url().nullable().optional().or(z.literal("")),
  video_url: z.string().url().nullable().optional().or(z.literal("")),
  image_url: z.string().url().nullable().optional().or(z.literal("")),
  image_public_id: z.string().nullable().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  category: z.string().nullable().optional(),
  architecture: z.string().nullable().optional(),
  challenges: z.array(z.string()).default([]),
  future_scope: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
});

export const certificateCategorySchema = z.enum([
  "Certificate", "Internship", "Workshop", "Webinar", "Course",
  "Hackathon", "Competition", "Bootcamp", "Training", "Achievement",
  "Seminar", "Conference", "Volunteer Work"
]);

export const certificateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  professional_summary: z.string().nullable().optional(),
  category: certificateCategorySchema.default("Certificate"),
  category_confidence: z.number().min(0).max(1).default(1.0),
  requires_category_review: z.boolean().default(false),
  issue_date: z.string().nullable().optional(),
  credential_id: z.string().nullable().optional(),
  credential_url: z.string().url().nullable().optional().or(z.literal("")),
  file_url: z.string().url("File URL is required"),
  file_public_id: z.string().nullable().optional().or(z.literal("")),
  file_type: z.enum(["pdf", "png", "jpeg", "webp", "application/pdf", "image/png", "image/jpeg", "image/webp"]).default("pdf"),
  thumbnail_url: z.string().url().nullable().optional().or(z.literal("")),
  thumbnail_public_id: z.string().nullable().optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  ai_generated: z.boolean().default(false),
});

export const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  organizer: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  event_date: z.string().nullable().optional(),
  event_type: z.string().nullable().optional(),
  achievement: z.string().nullable().optional(),
  prize: z.string().nullable().optional(),
  highlights: z.array(z.string()).default([]),
  timeline_entry: z.string().nullable().optional(),
  cover_image_url: z.string().url().nullable().optional().or(z.literal("")),
  cover_image_public_id: z.string().nullable().optional().or(z.literal("")),
  sort_order: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
});

export const gallerySchema = z.object({
  title: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  image_url: z.string().url("Image URL is required"),
  image_public_id: z.string().nullable().optional().or(z.literal("")),
  album: z.string().default("General"),
  tags: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
});

export const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  event: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional().or(z.literal("")),
  image_public_id: z.string().nullable().optional().or(z.literal("")),
  color: z.string().default("#FFD700"),
  sort_order: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
});

export const skillCategorySchema = z.enum([
  "Programming Languages", "Frameworks", "Libraries", "Databases",
  "Tools", "AI Technologies", "Soft Skills", "Cloud", "DevOps", "Other"
]);

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: skillCategorySchema.default("Other"),
  category_label: z.string().nullable().optional(),
  level: z.number().int().min(0).max(100).default(50),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
  status: contentStatusSchema.default("published"),
});

export const experienceTypeSchema = z.enum([
  "Internship", "Freelancing", "Volunteer Work", "Training", "Full-Time", "Part-Time"
]);

export const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  company_url: z.string().url().nullable().optional().or(z.literal("")),
  location: z.string().nullable().optional(),
  type: experienceTypeSchema.default("Internship"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  achievements: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
});

export const resumeSchema = z.object({
  file_url: z.string().url("File URL is required"),
  file_public_id: z.string().nullable().optional().or(z.literal("")),
  file_name: z.string().min(1, "File name is required"),
  file_size: z.number().int().optional(),
  version: z.number().int().default(1),
  is_active: z.boolean().default(true),
});

export const settingsSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.any(), // JSONB can be any valid JSON structure
});

export const mediaSchema = z.object({
  file_name: z.string().min(1, "File name is required"),
  original_name: z.string().min(1, "Original name is required"),
  file_url: z.string().url("File URL is required"),
  file_type: z.string().min(1, "File type is required"),
  file_size: z.number().int().default(0),
  bucket: z.string().min(1, "Bucket is required"),
  folder: z.string().default(""),
  alt_text: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  used_by: z.array(z.string()).default([]),
});

// For updates (PATCH), all fields are optional
export const getUpdateSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return schema.optional().or(z.object({}).partial()) as z.ZodTypeAny; // Simplified for typing, we'll use partial() in usage
};
