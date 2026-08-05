import { NextRequest, NextResponse } from "next/server";
import { getServerEnvironment } from "@/lib/server/env";
import { withApiAuth } from "@/lib/server/api-utils";
import { z } from "zod";
import { AIService } from "@/lib/ai/provider";
import { buildPrompt, AIAction, AITone } from "@/lib/ai/prompts";
import { getPortfolioContext } from "@/lib/ai/context-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const streamSchema = z.object({
  text: z.string().min(1, "Text is required"),
  action: z.string(), 
  customPrompt: z.string().optional(),
  tone: z.string().optional(),
  contextType: z.string().optional(),
});

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();
  const rawBody = await request.json();
  const { text, action, customPrompt, tone, contextType } = streamSchema.parse(rawBody);

  const contextStr = await getPortfolioContext(contextType);
  const prompt = buildPrompt(text, action as any, customPrompt, tone as any, contextStr);

  const responseStream = await AIService.streamText(prompt);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          if (chunk) {
            controller.enqueue(encoder.encode(chunk));
          }
        }
        
        supabase.from("ai_generations").insert({
          entity_type: "text_stream",
          input_type: "text",
          prompt: action,
          output: { action, contextType, textLength: text.length },
          model: getServerEnvironment().AI_PROVIDER,
        }).then(() => {}, (err) => console.error(err));
        
      } catch (err) {
        console.error("AI Stream error:", err);
        controller.error(err);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  }) as unknown as NextResponse;
});
