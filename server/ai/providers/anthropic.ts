import { LLMProvider, GenerateOptions } from "../base";
import { MockProvider } from "./mock";

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  model: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(modelName: string, apiKey: string, baseUrl?: string) {
    this.model = modelName || "claude-3-5-haiku-20241022";
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || "https://api.anthropic.com/v1").replace(/\/+$/, "");
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const temp = options?.temperature ?? 0.2;
    const maxTokens = options?.maxTokens ?? 4000;

    let systemInstruction = "You are an expert educational AI computer science assistant.";
    if (options?.responseSchema) {
      systemInstruction += " You must format your response strictly as valid, raw JSON with no wrapping backticks or commentary.";
    }

    try {
      const endpoint = `${this.baseUrl}/messages`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          temperature: temp,
          system: systemInstruction,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Anthropic API returned HTTP ${res.status}: ${errBody.substring(0, 300)}`);
      }

      const json = await res.json();
      const content = json.content?.[0]?.text;

      if (!content) {
        throw new Error("Empty response from Anthropic");
      }

      let cleaned = content.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      return cleaned;
    } catch (err: any) {
      console.error(`Error in AnthropicProvider [${this.model}], falling back to MockProvider:`, err.message || err);
      const fallback = new MockProvider(this.model);
      return await fallback.generate(prompt, options);
    }
  }
}
