import { getServerEnvironment } from "@/lib/server/env";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";

export interface IAIProvider {
  /**
   * Generates a text response from the AI.
   */
  generateText(prompt: string, systemPrompt?: string): Promise<string>;

  /**
   * Generates a streaming text response from the AI.
   */
  streamText(prompt: string, systemPrompt?: string): AsyncIterable<string>;

  /**
   * Analyzes a document (PDF, PNG, JPEG, WEBP) and extracts information.
   * Note: Not all providers support vision/documents. The implementation may throw
   * or fallback if the capability is unsupported.
   */
  analyzeDocument(data: string, mimeType: string, prompt: string, schema?: any): Promise<any>;
}

class AIServiceManager {
  private static instance: IAIProvider | null = null;

  public static getProvider(): IAIProvider {
    if (this.instance) return this.instance;

    const env = getServerEnvironment();

    switch (env.AI_PROVIDER) {
      case "groq":
        this.instance = new GroqProvider(env.GROQ_API_KEY || "", env.GROQ_MODEL || "llama-3.3-70b-versatile");
        break;
      case "gemini":
      default:
        this.instance = new GeminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL);
        break;
    }

    return this.instance;
  }
}

export const AIService = {
  generateText: (prompt: string, systemPrompt?: string) =>
    AIServiceManager.getProvider().generateText(prompt, systemPrompt),

  streamText: (prompt: string, systemPrompt?: string) =>
    AIServiceManager.getProvider().streamText(prompt, systemPrompt),

  analyzeDocument: (data: string, mimeType: string, prompt: string, schema?: any) =>
    AIServiceManager.getProvider().analyzeDocument(data, mimeType, prompt, schema),
};
