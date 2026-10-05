import { GoogleGenAI } from "@google/genai";
import { LLMProvider, GenerateOptions } from "../base";
import { MockProvider } from "./mock";

export class GeminiProvider implements LLMProvider {
  name = "gemini";
  model: string;
  private ai: GoogleGenAI;

  constructor(modelName: string, apiKey: string) {
    this.model = modelName || "gemini-3.8-flash";
    if (this.model === "gemini-2.5-flash" || this.model === "gemini-3.6-flash") {
      this.model = "gemini-3.8-flash";
    }
    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const temp = options?.temperature ?? Number(process.env.AI_TEMPERATURE || "0.2");
    const maxTokens = options?.maxTokens ?? Number(process.env.AI_MAX_TOKENS || "4000");

    const config: any = {
      temperature: temp,
      maxOutputTokens: maxTokens,
    };

    if (options?.responseSchema) {
      config.responseMimeType = "application/json";
      config.responseSchema = options.responseSchema;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: config,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }
      return text;
    } catch (err: any) {
      console.error(`Gemini Generation Error for model "${this.model}", falling back to MockProvider:`, err.message || err);
      try {
        const fallbackProvider = new MockProvider(this.model);
        return await fallbackProvider.generate(prompt, options);
      } catch (fallbackErr) {
        console.error("Mock fallback provider failed as well:", fallbackErr);
        throw err;
      }
    }
  }
}
