import { z } from "zod";

export const contentStatusSchema = z.enum(["draft", "published", "archived", "active", "hidden"]);

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
  certificate_url: z.string().url().nullable().optional().or(z.literal("")),
  certificate_type: z.string().nullable().optional(),
  certificate_filename: z.string().nullable().optional(),
  certificate_mime_type: z.string().nullable().optional(),
  verification_url: z.string().url().nullable().optional().or(z.literal("")),
  gallery: z.array(z.any()).default([]),
  evidence: z.array(z.any()).default([]),
});

const rawBody = {
  title: "Test",
  gallery: [
    { url: "test1" }
  ]
};

console.log(JSON.stringify(achievementSchema.parse(rawBody)));
console.log(JSON.stringify(achievementSchema.partial().parse(rawBody)));
