import { Controller, Post, Get, Body } from "@nestjs/common";
import { RAGOrchestrationService } from "./service/rag-orchestration.service";

@Controller()
export class AppController {
  constructor(private readonly ragService: RAGOrchestrationService) {}

  @Post("/v1/orchestrator/trigger")
  async trigger(@Body() body: any) {
    try {
      // Handle different trigger types
      if (body.type === "rag_query") {
        return await this.ragService.executeRAGFlow(body.context);
      } else if (body.type === "context_flow") {
        return await this.ragService.executeContextFlow(body.event);
      } else {
        // Default mock response for unknown types
        return { status: "ok", result: { mock: true, type: body.type } };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { status: "error", error: errorMessage };
    }
  }

  @Post("/v1/orchestrator/mock-event")
  async mockEvent(@Body() body: any) {
    // Create a mock event for testing
    const mockEvent = {
      type: body.type || "query.request",
      context: {
        query: body.query || "What is artificial intelligence?",
        userContext: body.userContext,
        metadata: { useAgent: body.useAgent || false },
      },
      timestamp: new Date().toISOString(),
    };

    return await this.ragService.executeContextFlow(mockEvent);
  }

  @Get("/v1/orchestrator/health")
  async health() {
    return await this.ragService.healthCheck();
  }

  @Post("/v1/orchestrator/rag")
  async executeRAG(@Body() body: any) {
    const context = {
      query: body.query,
      userContext: body.userContext,
      metadata: body.metadata || {},
    };

    return await this.ragService.executeRAGFlow(context);
  }
}
