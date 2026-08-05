import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerEnvironment, REQUIRED_GEMINI_MODEL } from "@/lib/server/env";
import { apiSuccess, apiError, withApiAuth } from "@/lib/server/api-utils";
import { z } from "zod";
import { AIService } from "@/lib/ai/provider";

const improveSchema = z.object({
  text: z.string().min(1, "Text is required"),
  action: z.enum(["improve", "shorten", "expand", "rewrite", "professional"]),
  context: z.string().optional(),
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { text, action, context } = improveSchema.parse(rawBody);

  const prompts: Record<string, string> = {
    improve: `Improve this text to be more professional and polished. Keep the same meaning but enhance clarity and impact. Context: ${context || "portfolio content"}.\n\nText: "${text}"\n\nReturn only the improved text, nothing else.`,
    shorten: `Shorten this text significantly while keeping the core message. Make it concise and impactful.\n\nText: "${text}"\n\nReturn only the shortened text.`,
    expand: `Expand this text with more detail and context. Make it comprehensive and informative while maintaining a professional tone.\n\nText: "${text}"\n\nReturn only the expanded text.`,
    rewrite: `Rewrite this text in a completely different way while preserving the meaning. Make it engaging and professional.\n\nText: "${text}"\n\nReturn only the rewritten text.`,
    professional: `Rewrite this text in a highly professional and formal tone suitable for a portfolio or CV.\n\nText: "${text}"\n\nReturn only the professional version.`,
  };

  const prompt = prompts[action];

  const result = await AIService.generateText(prompt);

  if (!result) throw new Error("AI returned empty response");

  // Log AI generation
  await supabase.from("ai_generations").insert({
    entity_type: "text_improvement",
    input_type: "text",
    prompt: action,
    output: { original: text, improved: result, action },
    model: getServerEnvironment().AI_PROVIDER,
  });

  return apiSuccess({ result }, "Text improved successfully");
});
