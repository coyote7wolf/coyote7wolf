export interface ChatCompletionRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  provider?: string;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
  pooling?: "mean" | "first" | "sum";
  provider?: string;
}

export interface MemorySearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface MemoryEmbeddingRequest {
  input: string | string[];
  pooling?: "mean" | "first" | "sum";
}

export interface AgentActRequest {
  task: string;
  input: any;
  context?: any;
}

export interface OrchestrationContext {
  query: string;
  retrievedDocs?: any[];
  userContext?: any;
  metadata?: any;
}
