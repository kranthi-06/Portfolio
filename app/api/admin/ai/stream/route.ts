import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getServerEnvironment, REQUIRED_GEMINI_MODEL } from "@/lib/server/env";
import { withApiAuth } from "@/lib/server/api-utils";
import { z } from "zod";
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

  const env = getServerEnvironment();
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  
  const contextStr = await getPortfolioContext(contextType);
  const prompt = buildPrompt(text, action as any, customPrompt, tone as any, contextStr);

  const responseStream = await ai.models.generateContentStream({
    model: REQUIRED_GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
        
        supabase.from("ai_generations").insert({
          entity_type: "text_stream",
          input_type: "text",
          prompt: action,
          output: { action, contextType, textLength: text.length },
          model: REQUIRED_GEMINI_MODEL,
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
