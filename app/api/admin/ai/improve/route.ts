import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { getServerEnvironment, REQUIRED_GEMINI_MODEL } from "@/lib/server/env";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { text, action, context } = body;

    if (!text || !action) {
      return NextResponse.json({ error: "text and action are required" }, { status: 400 });
    }

    const env = getServerEnvironment();
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const prompts: Record<string, string> = {
      improve: `Improve this text to be more professional and polished. Keep the same meaning but enhance clarity and impact. Context: ${context || "portfolio content"}.\n\nText: "${text}"\n\nReturn only the improved text, nothing else.`,
      shorten: `Shorten this text significantly while keeping the core message. Make it concise and impactful.\n\nText: "${text}"\n\nReturn only the shortened text.`,
      expand: `Expand this text with more detail and context. Make it comprehensive and informative while maintaining a professional tone.\n\nText: "${text}"\n\nReturn only the expanded text.`,
      rewrite: `Rewrite this text in a completely different way while preserving the meaning. Make it engaging and professional.\n\nText: "${text}"\n\nReturn only the rewritten text.`,
      professional: `Rewrite this text in a highly professional and formal tone suitable for a portfolio or CV.\n\nText: "${text}"\n\nReturn only the professional version.`,
    };

    const prompt = prompts[action];
    if (!prompt) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: REQUIRED_GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const result = response.text?.trim();
    if (!result) throw new Error("AI returned empty response");

    // Log AI generation
    await supabase.from("ai_generations").insert({
      entity_type: "text_improvement",
      input_type: "text",
      prompt: action,
      output: { original: text, improved: result, action },
      model: REQUIRED_GEMINI_MODEL,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI improve error:", error);
    return NextResponse.json({ error: "AI improvement failed" }, { status: 500 });
  }
}
