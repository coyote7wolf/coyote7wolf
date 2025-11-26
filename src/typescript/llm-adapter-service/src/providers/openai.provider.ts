import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";
import { BaseProvider } from "./base.provider";
import {
  LLMResponse,
  EmbeddingResponse,
  StreamingResponse,
} from "../interfaces/llm.interface";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIEmbeddingRequest {
  model: string;
  input: string;
}

interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class OpenAIProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(private configService: ConfigService) {
    super();
    this.apiKey = this.configService.get<string>("OPENAI_API_KEY") || "";
    this.baseUrl =
      this.configService.get<string>("OPENAI_BASE_URL") ||
      "https://api.openai.com/v1";
    this.model =
      this.configService.get<string>("OPENAI_MODEL") || "gpt-3.5-turbo";
    this.validateConfig();
  }

  async generateText(prompt: string, options?: any): Promise<LLMResponse> {
    try {
      const request: OpenAICompletionRequest = {
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        stream: false,
      };

      const response: AxiosResponse<OpenAICompletionResponse> =
        await axios.post(`${this.baseUrl}/chat/completions`, request, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        });

      const choice = response.data.choices[0];
      const llmResponse: LLMResponse = {
        text: choice.message.content,
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
        finishReason: choice.finish_reason,
      };

      this.logger.log(
        `Generated text using OpenAI: ${llmResponse.text.slice(0, 50)}...`
      );
      return llmResponse;
    } catch (error) {
      this.logger.error(
        `OpenAI API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `OpenAI API failed: ${
          axios.isAxiosError(error)
            ? error.response?.data?.error?.message || error.message
            : "Unknown error"
        }`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const request: OpenAIEmbeddingRequest = {
        model: "text-embedding-ada-002",
        input: text,
      };

      const response: AxiosResponse<OpenAIEmbeddingResponse> = await axios.post(
        `${this.baseUrl}/embeddings`,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const embeddingResponse: EmbeddingResponse = {
        embedding: response.data.data[0].embedding,
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };

      this.logger.log(`Generated embedding for text: ${text.slice(0, 50)}...`);
      return embeddingResponse;
    } catch (error) {
      this.logger.error(
        `OpenAI Embedding API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `OpenAI Embedding API failed: ${
          axios.isAxiosError(error)
            ? error.response?.data?.error?.message || error.message
            : "Unknown error"
        }`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async *generateTextStream(
    prompt: string,
    options?: any
  ): AsyncGenerator<StreamingResponse> {
    try {
      const request: OpenAICompletionRequest = {
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        stream: true,
      };

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
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
              const delta = parsed.choices[0]?.delta;
              if (delta?.content) {
                yield {
                  text: delta.content,
                  done: false,
                  model: parsed.model,
                };
              }
            } catch (parseError) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `OpenAI Streaming API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `OpenAI Streaming API failed: ${
          axios.isAxiosError(error)
            ? error.response?.data?.error?.message || error.message
            : "Unknown error"
        }`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  protected validateConfig(): void {
    if (!this.apiKey) {
      this.logger.warn("OpenAI API key not provided, using mock mode");
      return;
    }
    if (!this.model) {
      throw new Error("OpenAI model is required");
    }
    this.logger.log(`OpenAI provider configured with model: ${this.model}`);
  }
}
