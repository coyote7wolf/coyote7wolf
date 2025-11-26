import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { AgentActRequest } from "../types/orchestrator.types";

@Injectable()
export class AgentServiceClient {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.AGENT_SERVICE_URL || "http://localhost:3003";
  }

  async act(request: AgentActRequest): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/agent/act`, request)
      );
      return response.data;
    } catch (error) {
      console.error("Agent Service act error:", error);
      // Return mock response as fallback
      return {
        action: request.task,
        result: `Mock agent result for task: ${request.task}`,
        reasoning: "Agent service unavailable, using mock response",
        metadata: { timestamp: new Date().toISOString() },
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
      console.error("Agent Service health check failed:", error);
      return false;
    }
  }
}
