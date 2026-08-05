import { GoogleGenAI } from "@google/genai";
import { IAIProvider } from "../provider";

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const contents: any[] = [];
    if (systemPrompt) {
      contents.push({ role: "system", parts: [{ text: systemPrompt }] });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
    });

    if (!response.text) throw new Error("Gemini returned an empty response.");
    return response.text.trim();
  }

  async *streamText(prompt: string, systemPrompt?: string): AsyncIterable<string> {
    const contents: any[] = [];
    if (systemPrompt) {
      contents.push({ role: "system", parts: [{ text: systemPrompt }] });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const responseStream = await this.client.models.generateContentStream({
      model: this.model,
      contents,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }

  async analyzeDocument(data: string, mimeType: string, prompt: string, schema?: any): Promise<any> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      }],
      config: schema ? {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
      } : undefined,
    });

    if (!response.text) throw new Error("Gemini returned an empty document analysis.");
    
    if (schema) {
      return JSON.parse(response.text);
    }
    
    return response.text;
  }
}
