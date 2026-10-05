import { LLMProvider, GenerateOptions } from "../base";
import { MockProvider } from "./mock";

export class OpenAICompatibleProvider implements LLMProvider {
  name: string;
  model: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(providerName: string, modelName: string, apiKey: string, baseUrl: string) {
    this.name = providerName || "openai";
    this.model = modelName || "gpt-4o-mini";
    this.apiKey = apiKey || "";
    this.baseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slash
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const temp = options?.temperature ?? 0.2;
    const maxTokens = options?.maxTokens ?? 4000;

    let systemInstruction = "You are an intelligent educational AI system and computer science assistant.";
    let userPrompt = prompt;

    // If a structured JSON schema is requested, ensure the model returns strictly valid JSON
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    // Special header for OpenRouter
    if (this.baseUrl.includes("openrouter.ai")) {
      headers["HTTP-Referer"] = "https://ai-learning-platform.local";
      headers["X-Title"] = "AI Computer Science Platform";
    }

    const body: any = {
      model: this.model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      temperature: temp,
      max_tokens: maxTokens
    };

    if (options?.responseSchema) {
      // Direct instruction to output valid JSON
      body.messages[0].content += " You must respond ONLY with a raw, valid JSON object conforming to the requested schema. Do not enclose in markdown code fences.";
      body.response_format = { type: "json_object" };
    }

    try {
      const endpoint = `${this.baseUrl}/chat/completions`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API returned HTTP ${res.status}: ${errBody.substring(0, 300)}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from AI provider");
      }

      // If json_object was requested and markdown fences were returned, clean them up
      let cleaned = content.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      return cleaned;
    } catch (err: any) {
      console.error(`Error in OpenAICompatibleProvider [${this.name}/${this.model}], falling back to MockProvider:`, err.message || err);
      const fallback = new MockProvider(this.model);
      return await fallback.generate(prompt, options);
    }
  }
}
