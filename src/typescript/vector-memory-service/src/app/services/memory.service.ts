import { Injectable } from "@nestjs/common";
import { VectorStoreService } from "./vector-store.service";
import {
  VectorPoolingService,
  PoolingStrategy,
  SimilarityMetric,
} from "./vector-pooling.service";
import { EmbeddingDto, SearchDto, StoreDocumentDto } from "../dto/memory.dto";

@Injectable()
export class MemoryService {
  constructor(
    private readonly vectorStore: VectorStoreService,
    private readonly poolingService: VectorPoolingService
  ) {}

  async generateEmbedding(request: EmbeddingDto): Promise<any> {
    try {
      const { input, pooling = "mean", dimension = 768 } = request;

      // Generate embeddings for each input string
      const embeddings = input.map((text) =>
        this.poolingService.generateMockEmbedding(dimension, text)
      );

      // If multiple inputs, apply pooling strategy
      let finalEmbedding: number[];
      if (embeddings.length > 1) {
        finalEmbedding = this.poolingService.applyPooling(
          embeddings,
          pooling as PoolingStrategy
        );
      } else {
        finalEmbedding = embeddings[0];
      }

      return {
        data: input.map((text, index) => ({
          object: "embedding",
          embedding: index === 0 ? finalEmbedding : embeddings[index],
          index: index,
        })),
        model: request.model || "mock-embedding-model",
        usage: {
          prompt_tokens: input.join(" ").length / 4, // Rough token estimate
          total_tokens: input.join(" ").length / 4,
        },
        pooling_strategy: pooling,
        dimension: dimension,
      };
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error(
        `Embedding generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async searchMemory(request: SearchDto): Promise<any> {
    try {
      const {
        query,
        limit = 10,
        threshold = 0.1,
        similarity_metric = "cosine",
        filters,
      } = request;

      // Search using text query
      const results = await this.vectorStore.searchByText(
        query,
        limit,
        threshold,
        similarity_metric as SimilarityMetric,
        filters
      );

      return {
        matches: results.map((result) => ({
          id: result.id,
          score: result.score,
          values: [], // Vector values can be optionally included
          metadata: {
            content: result.content,
            ...result.metadata,
          },
        })),
        namespace: "",
        usage: {
          read_units: results.length,
        },
        query_metadata: {
          similarity_metric,
          threshold,
          filters_applied: filters?.length || 0,
        },
      };
    } catch (error) {
      console.error("Error searching memory:", error);
      throw new Error(
        `Memory search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async storeDocument(request: StoreDocumentDto): Promise<any> {
    try {
      const success = await this.vectorStore.storeDocument({
        id: request.id,
        content: request.content,
        embedding: request.embedding,
        metadata: request.metadata,
      });

      return {
        id: request.id,
        status: success ? "stored" : "failed",
        metadata: {
          timestamp: new Date().toISOString(),
          embedding_dimension: request.embedding.length,
        },
      };
    } catch (error) {
      console.error("Error storing document:", error);
      throw new Error(
        `Document storage failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteDocument(id: string): Promise<any> {
    try {
      const success = await this.vectorStore.deleteDocument(id);

      return {
        id,
        status: success ? "deleted" : "not_found",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error(
        `Document deletion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getDocument(id: string): Promise<any> {
    try {
      const document = await this.vectorStore.getDocument(id);

      if (!document) {
        return {
          error: "Document not found",
          id,
        };
      }

      return {
        id: document.id,
        content: document.content,
        metadata: document.metadata,
        embedding_dimension: document.embedding.length,
      };
    } catch (error) {
      console.error("Error retrieving document:", error);
      throw new Error(
        `Document retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getStats(): Promise<any> {
    try {
      const stats = await this.vectorStore.getStats();
      const healthCheck = await this.vectorStore.healthCheck();

      return {
        ...stats,
        health: healthCheck,
        supported_pooling_strategies: [
          "mean",
          "first",
          "sum",
          "max",
          "weighted_mean",
        ],
        supported_similarity_metrics: ["cosine", "euclidean", "dot_product"],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      throw new Error(
        `Stats retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const vectorStoreHealth = await this.vectorStore.healthCheck();

      return {
        status: "ok",
        services: {
          vector_store: vectorStoreHealth.status,
          pooling_service: "healthy",
        },
        metrics: {
          document_count: vectorStoreHealth.document_count,
          memory_usage_mb: vectorStoreHealth.memory_usage_mb,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Health check failed:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Utility methods for testing different pooling strategies
  async testPoolingStrategies(texts: string[]): Promise<any> {
    const strategies: PoolingStrategy[] = ["mean", "first", "sum", "max"];
    const results: any = {};

    const embeddings = texts.map((text) =>
      this.poolingService.generateMockEmbedding(768, text)
    );

    for (const strategy of strategies) {
      try {
        const pooledEmbedding = this.poolingService.applyPooling(
          embeddings,
          strategy
        );
        results[strategy] = {
          dimension: pooledEmbedding.length,
          magnitude: Math.sqrt(
            pooledEmbedding.reduce((sum, val) => sum + val * val, 0)
          ),
          sample_values: pooledEmbedding.slice(0, 5), // First 5 values as sample
        };
      } catch (error) {
        results[strategy] = {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return {
      input_texts: texts,
      input_count: texts.length,
      pooling_results: results,
      timestamp: new Date().toISOString(),
    };
  }
}
