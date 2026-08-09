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
  analyzeDocument(data: string, mimeType: string, prompt: string, schema?: Record<string, unknown>): Promise<unknown>;

  /**
   * Whether this provider supports analyzing the given MIME type.
   * Returns true if the provider can handle this document type natively.
   */
  supportsDocumentType?(mimeType: string): boolean;
}

class AIServiceManager {
  private static instance: IAIProvider | null = null;
  private static geminiInstance: GeminiProvider | null = null;

  /**
   * Get the primary AI provider (based on AI_PROVIDER env var).
   */
  public static getProvider(): IAIProvider {
    // In development, don't cache so env changes take effect without restart
    if (process.env.NODE_ENV === "development") {
      return this.createProvider();
    }

    if (this.instance) return this.instance;
    this.instance = this.createProvider();
    return this.instance;
  }

  /**
   * Get a provider capable of analyzing documents with the given MIME type.
   * Falls back to Gemini for PDFs when the primary provider (e.g., Groq) doesn't support them.
   */
  public static getDocumentAnalyzer(mimeType: string): IAIProvider {
    const primary = this.getProvider();

    // Check if the primary provider can handle this MIME type
    if (primary.supportsDocumentType && !primary.supportsDocumentType(mimeType)) {
      console.log(
        `[AI] Primary provider does not support ${mimeType}. Falling back to Gemini for document analysis.`
      );
      return this.getGeminiFallback();
    }

    // If supportsDocumentType is not implemented, assume it supports everything (e.g., Gemini)
    return primary;
  }

  private static createProvider(): IAIProvider {
    const env = getServerEnvironment();

    switch (env.AI_PROVIDER) {
      case "groq":
        return new GroqProvider(env.GROQ_API_KEY || "", env.GROQ_MODEL || "llama-3.3-70b-versatile");
      case "gemini":
      default:
        return new GeminiProvider(env.GEMINI_API_KEY || "", env.GEMINI_MODEL || "gemini-3.6-flash");
    }
  }

  /**
   * Get a Gemini provider instance for document analysis fallback.
   * This is used when the primary provider (e.g., Groq) doesn't support certain document types like PDFs.
   */
  private static getGeminiFallback(): GeminiProvider {
    if (this.geminiInstance) return this.geminiInstance;

    const env = getServerEnvironment();
    if (!env.GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key is required for PDF document analysis when using Groq as the primary provider. " +
        "Set GEMINI_API_KEY in your environment variables."
      );
    }

    this.geminiInstance = new GeminiProvider(
      env.GEMINI_API_KEY,
      env.GEMINI_MODEL || "gemini-3.6-flash"
    );
    return this.geminiInstance;
  }
}

export const AIService = {
  generateText: (prompt: string, systemPrompt?: string) =>
    AIServiceManager.getProvider().generateText(prompt, systemPrompt),

  streamText: (prompt: string, systemPrompt?: string) =>
    AIServiceManager.getProvider().streamText(prompt, systemPrompt),

  analyzeDocument: (data: string, mimeType: string, prompt: string, schema?: Record<string, unknown>) =>
    AIServiceManager.getDocumentAnalyzer(mimeType).analyzeDocument(data, mimeType, prompt, schema),
};
