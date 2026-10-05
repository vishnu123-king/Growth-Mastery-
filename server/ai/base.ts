export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  responseSchema?: any;
}

export interface LLMProvider {
  name: string;
  model: string;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}
