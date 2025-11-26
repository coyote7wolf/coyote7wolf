import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";
import { BaseProvider } from "./base.provider";
import {
  LLMResponse,
  EmbeddingResponse,
  StreamingResponse,
} from "../interfaces/llm.interface";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeCompletionRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  temperature?: number;
  stream?: boolean;
}

interface ClaudeCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

@Injectable()
export class ClaudeProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(private configService: ConfigService) {
    super();
    this.apiKey = this.configService.get<string>("CLAUDE_API_KEY") || "";
    this.baseUrl =
      this.configService.get<string>("CLAUDE_BASE_URL") ||
      "https://api.anthropic.com";
    this.model =
      this.configService.get<string>("CLAUDE_MODEL") ||
      "claude-3-haiku-20240307";
    this.validateConfig();
  }

  async generateText(prompt: string, options?: any): Promise<LLMResponse> {
    try {
      const request: ClaudeCompletionRequest = {
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        messages: [{ role: "user", content: prompt }],
        temperature: options?.temperature || 0.7,
        stream: false,
      };

      const response: AxiosResponse<ClaudeCompletionResponse> =
        await axios.post(`${this.baseUrl}/v1/messages`, request, {
          headers: {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
          },
          timeout: 30000,
        });

      const content = response.data.content[0];
      const llmResponse: LLMResponse = {
        text: content.text,
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens:
            response.data.usage.input_tokens +
            response.data.usage.output_tokens,
        },
        finishReason: response.data.stop_reason,
      };

      this.logger.log(
        `Generated text using Claude: ${llmResponse.text.slice(0, 50)}...`
      );
      return llmResponse;
    } catch (error) {
      this.logger.error(
        `Claude API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `Claude API failed: ${
          axios.isAxiosError(error)
            ? error.response?.data?.error?.message || error.message
            : "Unknown error"
        }`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    // Claude doesn't provide embedding API, so we'll use a mock implementation
    // In production, you might want to use a different service for embeddings
    this.logger.warn(
      "Claude does not provide embedding API, using mock implementation"
    );

    const mockEmbedding = this.generateMockEmbedding(text);

    const response: EmbeddingResponse = {
      embedding: mockEmbedding,
      model: `${this.model}-embedding-mock`,
      usage: {
        promptTokens: Math.ceil(text.length / 4),
        totalTokens: Math.ceil(text.length / 4),
      },
    };

    this.logger.log(
      `Generated mock embedding for text: ${text.slice(0, 50)}...`
    );
    return response;
  }

  async *generateTextStream(
    prompt: string,
    options?: any
  ): AsyncGenerator<StreamingResponse> {
    try {
      const request: ClaudeCompletionRequest = {
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        messages: [{ role: "user", content: prompt }],
        temperature: options?.temperature || 0.7,
        stream: true,
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/messages`,
        request,
        {
          headers: {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
          },
          responseType: "stream",
          timeout: 30000,
        }
      );

      let buffer = "";
      const stream = response.data;

      for await (const chunk of stream) {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                yield {
                  text: parsed.delta.text,
                  done: false,
                  model: this.model,
                };
              } else if (parsed.type === "message_stop") {
                return;
              }
            } catch (parseError) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Claude Streaming API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `Claude Streaming API failed: ${
          axios.isAxiosError(error)
            ? error.response?.data?.error?.message || error.message
            : "Unknown error"
        }`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate deterministic mock embedding based on text content
    const embedding: number[] = [];
    let seed = 0;

    // Create seed from text
    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i) * (i + 1);
    }

    // Generate 1536-dimensional embedding (same as OpenAI)
    for (let i = 0; i < 1536; i++) {
      seed = (seed * 16807) % 2147483647;
      embedding.push((seed / 2147483647) * 2 - 1);
    }

    return embedding;
  }

  protected validateConfig(): void {
    if (!this.apiKey) {
      this.logger.warn("Claude API key not provided, using mock mode");
      return;
    }
    if (!this.model) {
      throw new Error("Claude model is required");
    }
    this.logger.log(`Claude provider configured with model: ${this.model}`);
  }
}
