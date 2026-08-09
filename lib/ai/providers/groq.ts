import Groq from "groq-sdk";
import { IAIProvider } from "../provider";

export class GroqProvider implements IAIProvider {
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty response.");
    return content.trim();
  }

  async *streamText(prompt: string, systemPrompt?: string): AsyncIterable<string> {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Whether this provider supports the given MIME type for document analysis.
   * Groq Vision supports images only, not PDFs.
   */
  supportsDocumentType(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }

  async analyzeDocument(data: string, mimeType: string, prompt: string, schema?: Record<string, unknown>): Promise<unknown> {
    // Groq Vision requires a vision-capable model and only supports images.
    const visionModel = "llama-3.2-90b-vision-preview";

    const isImage = mimeType.startsWith("image/");
    if (!isImage) {
      throw new Error(
        `GroqProvider does not support ${mimeType} document analysis. ` +
        `Only image types (image/png, image/jpeg, image/webp) are supported. ` +
        `PDF analysis requires the Gemini provider as a fallback.`
      );
    }

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: [
          { type: "text", text: schema ? `${prompt}\n\nYou MUST return valid JSON matching this schema: ${JSON.stringify(schema)}` : prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${data}`,
            },
          },
        ],
      },
    ];

    const response = await this.client.chat.completions.create({
      model: visionModel,
      messages,
      response_format: schema ? { type: "json_object" } : undefined,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty document analysis.");
    
    if (schema) {
      try {
        return JSON.parse(content);
      } catch (err) {
        throw new Error("Groq failed to return valid JSON: " + content);
      }
    }
    
    return content;
  }
}
