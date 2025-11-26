import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
  ChatCompletionRequest,
  EmbeddingRequest,
} from "../types/orchestrator.types";

@Injectable()
export class LLMAdapterClient {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.LLM_ADAPTER_URL || "http://localhost:3001";
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/chat/completions`, request)
      );
      return response.data;
    } catch (error) {
      console.error("LLM Adapter chat completion error:", error);
      // Return mock response as fallback
      return {
        choices: [
          {
            message: {
              role: "assistant",
              content: "Mock LLM response (service unavailable)",
            },
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      };
    }
  }

  async embedding(request: EmbeddingRequest): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/embeddings`, request)
      );
      return response.data;
    } catch (error) {
      console.error("LLM Adapter embedding error:", error);
      // Return mock response as fallback
      return {
        data: [
          {
            embedding: Array.from({ length: 768 }, () => Math.random() - 0.5),
            index: 0,
          },
        ],
        usage: { prompt_tokens: 10, total_tokens: 10 },
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/health`)
      );
      return response.data.status === "ok";
    } catch (error) {
      console.error("LLM Adapter health check failed:", error);
      return false;
    }
  }
}
