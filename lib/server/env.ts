import "server-only";

import { z } from "zod";

const REQUIRED_GEMINI_MODEL = "gemini-3.6-flash";

const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  // A literal, rather than an alias, prevents silent model changes or fallbacks.
  GEMINI_MODEL: z.literal(REQUIRED_GEMINI_MODEL),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

let parsedEnvironment: z.infer<typeof serverEnvironmentSchema> | undefined;

export function getServerEnvironment() {
  if (!parsedEnvironment) parsedEnvironment = serverEnvironmentSchema.parse(process.env);
  return parsedEnvironment;
}

export { REQUIRED_GEMINI_MODEL };
