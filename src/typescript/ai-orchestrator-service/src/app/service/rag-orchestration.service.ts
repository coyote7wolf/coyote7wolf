import { Injectable } from "@nestjs/common";
import { LLMAdapterClient } from "../clients/llm-adapter.client";
import { MemoryServiceClient } from "../clients/memory-service.client";
import { AgentServiceClient } from "../clients/agent-service.client";
import { OrchestrationContext } from "../types/orchestrator.types";

@Injectable()
export class RAGOrchestrationService {
  constructor(
    private readonly llmClient: LLMAdapterClient,
    private readonly memoryClient: MemoryServiceClient,
    private readonly agentClient: AgentServiceClient
  ) {}

  async executeRAGFlow(context: OrchestrationContext): Promise<any> {
    try {
      // Step 1: Retrieve relevant documents from memory service
      const retrievalResult = await this.memoryClient.search({
        query: context.query,
        limit: 5,
        threshold: 0.7,
      });

      // Step 2: Combine retrieved context with user query
      const augmentedContext = this.combineContext(
        context,
        retrievalResult.matches
      );

      // Step 3: Generate response using LLM with augmented context
      const llmResponse = await this.llmClient.chatCompletion({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Use the provided context to answer the user's question accurately.",
          },
          {
            role: "user",
            content: `Context: ${JSON.stringify(
              augmentedContext.retrievedDocs
            )}\n\nQuestion: ${context.query}`,
          },
        ],
        provider: "local",
        temperature: 0.7,
        max_tokens: 500,
      });

      // Step 4: Optional post-processing with agent service
      let finalResult = llmResponse;

      if (context.metadata?.useAgent) {
        const agentResult = await this.agentClient.act({
          task: "refine_response",
          input: llmResponse,
          context: augmentedContext,
        });
        finalResult = { ...llmResponse, agentRefinement: agentResult };
      }

      return {
        query: context.query,
        retrievedCount: retrievalResult.matches?.length || 0,
        response: finalResult,
        sources: retrievalResult.matches?.map((match: any) => ({
          id: match.id,
          score: match.score,
          source: match.metadata?.source,
        })),
        metadata: {
          retrievalScore: this.calculateAverageScore(retrievalResult.matches),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("RAG Flow execution error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`RAG Flow failed: ${errorMessage}`);
    }
  }

  async executeContextFlow(event: any): Promise<any> {
    try {
      // Handle different event types
      switch (event.type) {
        case "document.updated":
          return await this.handleDocumentUpdate(event);
        case "query.request":
          return await this.executeRAGFlow(event.context);
        case "agent.task":
          return await this.agentClient.act(event.payload);
        default:
          return { status: "unknown_event", event };
      }
    } catch (error) {
      console.error("Context Flow execution error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { status: "error", error: errorMessage };
    }
  }

  private combineContext(
    originalContext: OrchestrationContext,
    retrievedDocs: any[]
  ): OrchestrationContext {
    return {
      ...originalContext,
      retrievedDocs: retrievedDocs.map((doc) => ({
        content: doc.content,
        score: doc.score,
        metadata: doc.metadata,
      })),
    };
  }

  private calculateAverageScore(matches: any[]): number {
    if (!matches || matches.length === 0) return 0;
    const totalScore = matches.reduce(
      (sum, match) => sum + (match.score || 0),
      0
    );
    return totalScore / matches.length;
  }

  private async handleDocumentUpdate(event: any): Promise<any> {
    // Process document update event
    const { document } = event.payload;

    // Step 1: Generate embeddings for the updated document
    await this.memoryClient.embedding({
      input: document.content,
      pooling: "mean",
    });

    // Step 2: Potentially trigger re-indexing or cache invalidation
    // This would be implementation-specific

    return {
      status: "document_processed",
      documentId: document.id,
      timestamp: new Date().toISOString(),
    };
  }

  async healthCheck(): Promise<any> {
    const [llmHealth, memoryHealth, agentHealth] = await Promise.all([
      this.llmClient.healthCheck(),
      this.memoryClient.healthCheck(),
      this.agentClient.healthCheck(),
    ]);

    return {
      status: "ok",
      services: {
        llmAdapter: llmHealth,
        memoryService: memoryHealth,
        agentService: agentHealth,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
