import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
  MemorySearchRequest,
  MemoryEmbeddingRequest,
} from "../types/orchestrator.types";

@Injectable()
export class MemoryServiceClient {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.MEMORY_SERVICE_URL || "http://localhost:3004";
  }

  async search(request: MemorySearchRequest): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/memory/search`, request)
      );
      return response.data;
    } catch (error) {
      console.error("Memory Service search error:", error);
      // Return mock response as fallback
      return {
        matches: [
          {
            id: "doc1",
            score: 0.95,
            content:
              "Mock retrieved document content for query: " + request.query,
            metadata: { source: "mock", timestamp: new Date().toISOString() },
          },
          {
            id: "doc2",
            score: 0.87,
            content: "Additional mock context information related to the query",
            metadata: { source: "mock", timestamp: new Date().toISOString() },
          },
        ],
      };
    }
  }

  async embedding(request: MemoryEmbeddingRequest): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/memory/embedding`, request)
      );
      return response.data;
    } catch (error) {
      console.error("Memory Service embedding error:", error);
      // Return mock response as fallback
      return {
        data: [
          {
            embedding: Array.from({ length: 768 }, () => Math.random() - 0.5),
            index: 0,
          },
        ],
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
      console.error("Memory Service health check failed:", error);
      return false;
    }
  }
}
