import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z
  .object({
    CLOUDINARY_URL: z.string().min(1, "CLOUDINARY_URL is required"),

    // AI Provider selection
    AI_PROVIDER: z.enum(["gemini", "groq"]).default("gemini"),

    // Gemini — required when AI_PROVIDER=gemini, optional otherwise
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().optional(),

    // Groq — required when AI_PROVIDER=groq, optional otherwise
    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().optional(),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.AI_PROVIDER === "gemini") {
      if (!data.GEMINI_API_KEY || data.GEMINI_API_KEY.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GEMINI_API_KEY is required when AI_PROVIDER is 'gemini'",
          path: ["GEMINI_API_KEY"],
        });
      }
      if (!data.GEMINI_MODEL || data.GEMINI_MODEL.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GEMINI_MODEL is required when AI_PROVIDER is 'gemini'",
          path: ["GEMINI_MODEL"],
        });
      }
    }

    if (data.AI_PROVIDER === "groq") {
      if (!data.GROQ_API_KEY || data.GROQ_API_KEY.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GROQ_API_KEY is required when AI_PROVIDER is 'groq'",
          path: ["GROQ_API_KEY"],
        });
      }
    }
  });

let parsedEnvironment: z.infer<typeof serverEnvironmentSchema> | undefined;

export function getServerEnvironment() {
  if (!parsedEnvironment) parsedEnvironment = serverEnvironmentSchema.parse(process.env);
  return parsedEnvironment;
}
