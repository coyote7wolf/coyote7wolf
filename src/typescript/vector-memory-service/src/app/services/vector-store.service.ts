import { Injectable } from "@nestjs/common";
import {
  VectorDocument,
  SearchResult,
  SimilarityMetric,
} from "./vector-pooling.service";
import { VectorPoolingService } from "./vector-pooling.service";

@Injectable()
export class VectorStoreService {
  private documents: Map<string, VectorDocument> = new Map();
  private initialized = false;

  constructor(private readonly poolingService: VectorPoolingService) {
    this.initializeMockData();
  }

  private initializeMockData() {
    if (this.initialized) return;

    // Add some mock documents for testing
    const mockDocs = [
      {
        id: "doc1",
        content:
          "Artificial intelligence is a branch of computer science that aims to create intelligent machines.",
        metadata: {
          source: "textbook",
          category: "ai",
          tags: ["AI", "technology"],
        },
      },
      {
        id: "doc2",
        content:
          "Machine learning is a subset of artificial intelligence that enables computers to learn without being explicitly programmed.",
        metadata: {
          source: "article",
          category: "ai",
          tags: ["ML", "AI", "learning"],
        },
      },
      {
        id: "doc3",
        content:
          "Deep learning uses neural networks with multiple layers to model and understand complex patterns.",
        metadata: {
          source: "research",
          category: "ai",
          tags: ["deep learning", "neural networks"],
        },
      },
      {
        id: "doc4",
        content:
          "Natural language processing helps computers understand and interpret human language.",
        metadata: {
          source: "documentation",
          category: "ai",
          tags: ["NLP", "language"],
        },
      },
      {
        id: "doc5",
        content:
          "Computer vision enables machines to interpret and understand visual information from the world.",
        metadata: {
          source: "tutorial",
          category: "ai",
          tags: ["computer vision", "visual AI"],
        },
      },
    ];

    for (const doc of mockDocs) {
      const embedding = this.poolingService.generateMockEmbedding(
        768,
        doc.content
      );
      this.documents.set(doc.id, {
        ...doc,
        embedding,
        metadata: {
          ...doc.metadata,
          timestamp: new Date().toISOString(),
        },
      });
    }

    this.initialized = true;
  }

  async storeDocument(document: VectorDocument): Promise<boolean> {
    try {
      this.documents.set(document.id, {
        ...document,
        metadata: {
          ...document.metadata,
          timestamp: document.metadata?.timestamp || new Date().toISOString(),
        },
      });
      return true;
    } catch (error) {
      console.error("Error storing document:", error);
      return false;
    }
  }

  async getDocument(id: string): Promise<VectorDocument | null> {
    return this.documents.get(id) || null;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async searchSimilar(
    queryEmbedding: number[],
    limit: number = 10,
    threshold: number = 0.7,
    metric: SimilarityMetric = "cosine",
    filters?: string[]
  ): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];

      for (const [id, doc] of this.documents.entries()) {
        // Apply filters if provided
        if (filters && filters.length > 0) {
          const matchesFilter = filters.some(
            (filter) =>
              doc.content.toLowerCase().includes(filter.toLowerCase()) ||
              doc.metadata?.tags?.some((tag: string) =>
                tag.toLowerCase().includes(filter.toLowerCase())
              ) ||
              doc.metadata?.category
                ?.toLowerCase()
                .includes(filter.toLowerCase())
          );

          if (!matchesFilter) {
            continue;
          }
        }

        // Calculate similarity
        let score = this.poolingService.calculateSimilarity(
          queryEmbedding,
          doc.embedding,
          metric
        );

        // Convert euclidean distance to similarity score (smaller distance = higher similarity)
        if (metric === "euclidean") {
          score = 1 / (1 + score);
        }

        // Apply threshold
        if (score >= threshold) {
          results.push({
            id: doc.id,
            content: doc.content,
            score: Math.round(score * 10000) / 10000, // Round to 4 decimal places
            metadata: doc.metadata,
          });
        }
      }

      // Sort by score in descending order and apply limit
      return results.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error("Error searching documents:", error);
      return [];
    }
  }

  async searchByText(
    query: string,
    limit: number = 10,
    threshold: number = 0.7,
    metric: SimilarityMetric = "cosine",
    filters?: string[]
  ): Promise<SearchResult[]> {
    // Generate embedding for query text
    const queryEmbedding = this.poolingService.generateMockEmbedding(
      768,
      query
    );

    return this.searchSimilar(
      queryEmbedding,
      limit,
      threshold,
      metric,
      filters
    );
  }

  async bulkStore(
    documents: VectorDocument[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const doc of documents) {
      const result = await this.storeDocument(doc);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  async getAllDocuments(): Promise<VectorDocument[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentCount(): Promise<number> {
    return this.documents.size;
  }

  async getStats(): Promise<{
    total_documents: number;
    dimensions: number;
    categories: string[];
    sources: string[];
  }> {
    const docs = Array.from(this.documents.values());
    const categories = new Set<string>();
    const sources = new Set<string>();

    for (const doc of docs) {
      if (doc.metadata?.category) {
        categories.add(doc.metadata.category);
      }
      if (doc.metadata?.source) {
        sources.add(doc.metadata.source);
      }
    }

    return {
      total_documents: docs.length,
      dimensions: docs.length > 0 ? docs[0].embedding.length : 0,
      categories: Array.from(categories),
      sources: Array.from(sources),
    };
  }

  async clearAll(): Promise<boolean> {
    try {
      this.documents.clear();
      this.initialized = false;
      return true;
    } catch (error) {
      console.error("Error clearing documents:", error);
      return false;
    }
  }

  async healthCheck(): Promise<{
    status: string;
    document_count: number;
    memory_usage_mb: number;
  }> {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB =
        Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100;

      return {
        status: "healthy",
        document_count: this.documents.size,
        memory_usage_mb: memoryUsageMB,
      };
    } catch (error) {
      console.error("Health check failed:", error);
      return {
        status: "error",
        document_count: 0,
        memory_usage_mb: 0,
      };
    }
  }
}
