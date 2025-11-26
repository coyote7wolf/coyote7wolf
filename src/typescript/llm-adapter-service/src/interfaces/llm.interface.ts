export interface TokenUsage {
  promptTokens: number;
  completionTokens?: number;
  totalTokens: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage: TokenUsage;
  finishReason?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: TokenUsage;
}

export interface StreamingResponse {
  text: string;
  done: boolean;
  model: string;
}

export interface LLMProvider {
  generateText(prompt: string, options?: any): Promise<LLMResponse>;
  generateEmbedding(text: string): Promise<EmbeddingResponse>;
  generateTextStream?(
    prompt: string,
    options?: any
  ): AsyncGenerator<StreamingResponse>;
}

export interface ModelOptions {
  maxTokens?: number;
  temperature?: number;
  streaming?: boolean;
  model?: string;
}
