import { LLMProvider } from "./base";
import { aiConfigManager, AIProviderConfig } from "./config";
import { GeminiProvider } from "./providers/gemini";
import { OpenAICompatibleProvider } from "./providers/openai_compatible";
import { AnthropicProvider } from "./providers/anthropic";
import { MockProvider } from "./providers/mock";

export class AIProviderFactory {
  static create(overrideConfig?: Partial<AIProviderConfig>): LLMProvider {
    const config = overrideConfig 
      ? { ...aiConfigManager.getConfig(), ...overrideConfig }
      : aiConfigManager.getConfig();

    const providerType = config.provider.toLowerCase();
    const apiKey = config.apiKey?.trim() || "";

    // If an external provider is selected but no API key is provided (and not local/custom or mock),
    // gracefully fall back to the intelligent offline provider without throwing or failing
    if (providerType !== "mock" && providerType !== "custom") {
      if (!apiKey || apiKey === "MY_API_KEY" || apiKey === "YOUR_API_KEY" || apiKey === "MY_GEMINI_API_KEY") {
        console.warn(`[AI Factory] Provider "${providerType}" requested without a valid API key. Using Intelligent Offline Engine.`);
        return new MockProvider(`${providerType}-offline-mode`);
      }
    }

    switch (providerType) {
      case "openai":
        return new OpenAICompatibleProvider("openai", config.model, apiKey, config.baseUrl || "https://api.openai.com/v1");

      case "groq":
        return new OpenAICompatibleProvider("groq", config.model, apiKey, config.baseUrl || "https://api.groq.com/openai/v1");

      case "deepseek":
        return new OpenAICompatibleProvider("deepseek", config.model, apiKey, config.baseUrl || "https://api.deepseek.com/v1");

      case "openrouter":
        return new OpenAICompatibleProvider("openrouter", config.model, apiKey, config.baseUrl || "https://openrouter.ai/api/v1");

      case "custom":
        return new OpenAICompatibleProvider("custom", config.model, apiKey, config.baseUrl || "http://localhost:11434/v1");

      case "anthropic":
        return new AnthropicProvider(config.model, apiKey, config.baseUrl);

      case "gemini":
        return new GeminiProvider(config.model, apiKey);

      case "mock":
      default:
        return new MockProvider(config.model);
    }
  }
}
