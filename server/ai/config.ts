export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'groq' | 'deepseek' | 'openrouter' | 'gemini' | 'custom' | 'mock';
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProviderPreset {
  id: string;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  recommendedModels: string[];
  requiresApiKey: boolean;
  description: string;
}

export const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    recommendedModels: ["gpt-4o-mini", "gpt-4o", "o3-mini", "gpt-3.5-turbo"],
    requiresApiKey: true,
    description: "Industry-standard GPT models with high reasoning and structured JSON output."
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-haiku-20241022",
    recommendedModels: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-20241022", "claude-3-haiku-20240307"],
    requiresApiKey: true,
    description: "Claude models known for deep nuance, coding accuracy, and safe educational tutoring."
  },
  groq: {
    id: "groq",
    name: "Groq (Ultra-Fast LPU)",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    recommendedModels: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    requiresApiKey: true,
    description: "Near-instantaneous inference with open-source Llama and Mixtral models."
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek AI",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    recommendedModels: ["deepseek-chat", "deepseek-reasoner"],
    requiresApiKey: true,
    description: "Powerful, high-efficiency models specialized in mathematical and algorithmic coding."
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter (Universal Gateway)",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "meta-llama/llama-3.3-70b-instruct",
    recommendedModels: ["meta-llama/llama-3.3-70b-instruct", "anthropic/claude-3.5-haiku", "openai/gpt-4o-mini"],
    requiresApiKey: true,
    description: "Route to any open or proprietary AI model with a single unified API key."
  },
  custom: {
    id: "custom",
    name: "Custom OpenAI-Compatible (Ollama / Local / Proxy)",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3",
    recommendedModels: ["llama3", "mistral", "qwen2.5-coder", "custom-model"],
    requiresApiKey: false,
    description: "Connect to Ollama, vLLM, LM Studio, or your own self-hosted inference proxy."
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    defaultBaseUrl: "https://generativelanguage.googleapis.com",
    defaultModel: "gemini-3.8-flash",
    recommendedModels: ["gemini-3.8-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
    requiresApiKey: true,
    description: "Google multimodal model suite."
  },
  mock: {
    id: "mock",
    name: "Offline Intelligent Engine (No API Key Required)",
    defaultBaseUrl: "local",
    defaultModel: "offline-intelligent-engine",
    recommendedModels: ["offline-intelligent-engine"],
    requiresApiKey: false,
    description: "Local deterministic generation and intelligent tutoring without external network calls."
  }
};

class AIConfigManager {
  private currentConfig: AIProviderConfig;

  constructor() {
    this.currentConfig = this.loadInitialConfig();
  }

  private loadInitialConfig(): AIProviderConfig {
    // Check environment variables
    const rawProvider = (process.env.AI_PROVIDER || "").toLowerCase().trim();
    
    // Auto-detect provider if specific keys exist
    let detectedProvider: AIProviderConfig['provider'] = 'mock';
    let apiKey = process.env.AI_API_KEY || "";
    let baseUrl = process.env.AI_BASE_URL || "";
    let model = process.env.AI_MODEL || "";

    const envGeminiKey = process.env.GEMINI_API_KEY || "";
    const hasValidGeminiKey = envGeminiKey && envGeminiKey !== "MY_GEMINI_API_KEY" && envGeminiKey.length > 5;
    const envOpenAIKey = process.env.OPENAI_API_KEY || "";
    const hasValidOpenAIKey = envOpenAIKey && envOpenAIKey !== "MY_OPENAI_API_KEY" && envOpenAIKey.length > 5;

    // Smart auto-detection and promotion from mock mode to live provider when keys are supplied during deployment
    if (hasValidGeminiKey && (rawProvider === 'mock' || !rawProvider || rawProvider === 'gemini')) {
      detectedProvider = 'gemini';
      apiKey = envGeminiKey;
    } else if (hasValidOpenAIKey && (rawProvider === 'mock' || !rawProvider || rawProvider === 'openai')) {
      detectedProvider = 'openai';
      apiKey = envOpenAIKey;
    } else if (rawProvider && PROVIDER_PRESETS[rawProvider]) {
      detectedProvider = rawProvider as any;
      if (detectedProvider === 'gemini' && !apiKey && hasValidGeminiKey) {
        apiKey = envGeminiKey;
      } else if (detectedProvider === 'openai' && !apiKey && hasValidOpenAIKey) {
        apiKey = envOpenAIKey;
      }
    } else if (hasValidGeminiKey) {
      detectedProvider = 'gemini';
      apiKey = envGeminiKey;
    } else if (hasValidOpenAIKey) {
      detectedProvider = 'openai';
      apiKey = envOpenAIKey;
    } else if (process.env.ANTHROPIC_API_KEY) {
      detectedProvider = 'anthropic';
      apiKey = process.env.ANTHROPIC_API_KEY;
    } else if (process.env.GROQ_API_KEY) {
      detectedProvider = 'groq';
      apiKey = process.env.GROQ_API_KEY;
    } else if (process.env.DEEPSEEK_API_KEY) {
      detectedProvider = 'deepseek';
      apiKey = process.env.DEEPSEEK_API_KEY;
    } else if (process.env.OPENROUTER_API_KEY) {
      detectedProvider = 'openrouter';
      apiKey = process.env.OPENROUTER_API_KEY;
    } else if (apiKey) {
      detectedProvider = 'openai';
    }

    const preset = PROVIDER_PRESETS[detectedProvider] || PROVIDER_PRESETS.mock;

    return {
      provider: detectedProvider,
      model: model || preset.defaultModel,
      apiKey: apiKey,
      baseUrl: baseUrl || preset.defaultBaseUrl,
      temperature: Number(process.env.AI_TEMPERATURE || "0.2"),
      maxTokens: Number(process.env.AI_MAX_TOKENS || "4000")
    };
  }

  public getConfig(): AIProviderConfig {
    return { ...this.currentConfig };
  }

  public getPublicConfig() {
    const config = this.currentConfig;
    const hasKey = Boolean(config.apiKey && config.apiKey.length > 5);
    const maskedKey = hasKey 
      ? `${config.apiKey.substring(0, 4)}••••••••${config.apiKey.substring(config.apiKey.length - 4)}` 
      : "";

    return {
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      hasApiKey: hasKey,
      maskedApiKey: maskedKey,
      presets: PROVIDER_PRESETS
    };
  }

  public updateConfig(newConfig: Partial<AIProviderConfig>): AIProviderConfig {
    const preset = PROVIDER_PRESETS[newConfig.provider || this.currentConfig.provider] || PROVIDER_PRESETS.mock;

    this.currentConfig = {
      ...this.currentConfig,
      ...newConfig,
      baseUrl: newConfig.baseUrl || preset.defaultBaseUrl,
      model: newConfig.model || preset.defaultModel
    };

    return this.getConfig();
  }
}

export const aiConfigManager = new AIConfigManager();
