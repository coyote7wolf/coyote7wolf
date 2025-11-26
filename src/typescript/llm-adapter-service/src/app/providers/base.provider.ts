export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message?: { role: string; content: string };
    delta?: { content: string };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
  pooling?: "mean" | "first" | "sum";
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export abstract class BaseProvider {
  abstract name: string;

  abstract chatCompletions(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse>;
  abstract embeddings(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  abstract isAvailable(): Promise<boolean>;
}
