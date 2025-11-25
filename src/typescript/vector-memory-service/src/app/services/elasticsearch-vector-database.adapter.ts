import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "./elasticsearch.service";
import {
  IVectorDatabase,
  VectorSearchParams,
  FullTextSearchParams,
  PhraseSearchParams,
  PrefixSearchParams,
  HybridSearchParams,
  SearchResponse,
  DocumentOperationResult,
  IndexStats,
  ClusterStats,
} from "../interfaces/vector-database.interface";
import {
  VECTOR_INDEX_NAME,
  DOCUMENT_INDEX_NAME,
} from "../../config/vector-index.mapping";

/**
 * Elasticsearch Vector Database 適配器
 *
 * 將現有的 ElasticsearchService 適配到 IVectorDatabase 介面
 */
@Injectable()
export class ElasticsearchVectorDatabaseAdapter implements IVectorDatabase {
  private logger = new Logger("ElasticsearchVectorDatabaseAdapter");

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  // 連接管理方法
  async ping(): Promise<boolean> {
    return await this.elasticsearchService.ping();
  }

  async getInfo(): Promise<Record<string, any>> {
    return await this.elasticsearchService.getInfo();
  }

  async health(): Promise<Record<string, any>> {
    return await this.elasticsearchService.health();
  }

  // 索引管理方法
  async createVectorIndex(): Promise<void> {
    return await this.elasticsearchService.createVectorIndex();
  }

  async createDocumentIndex(): Promise<void> {
    return await this.elasticsearchService.createDocumentIndex();
  }

  async deleteIndex(indexName: string): Promise<void> {
    return await this.elasticsearchService.deleteIndex(indexName);
  }

  async indexExists(indexName: string): Promise<boolean> {
    return await this.elasticsearchService.indexExists(indexName);
  }

  async clearIndex(indexName: string): Promise<void> {
    return await this.elasticsearchService.clearIndex(indexName);
  }

  // 文檔操作方法
  async indexDocument(params: {
    documentId: string;
    userId: string;
    title: string;
    content: string;
    vector: number[];
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<DocumentOperationResult> {
    try {
      const result = await this.elasticsearchService.indexDocument(
        VECTOR_INDEX_NAME,
        params.documentId,
        {
          documentId: params.documentId,
          userId: params.userId,
          title: params.title,
          content: params.content,
          vector: params.vector,
          tags: params.tags || [],
          metadata: params.metadata || {},
          timestamp: Date.now(),
        }
      );

      return {
        success: true,
        message: "Document indexed successfully",
        id: params.documentId,
      };
    } catch (error) {
      this.logger.error("Failed to index document:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to index document",
      };
    }
  }

  async updateDocument(
    documentId: string,
    updates: Partial<{
      title: string;
      content: string;
      tags: string[];
      metadata: Record<string, any>;
    }>
  ): Promise<DocumentOperationResult> {
    try {
      const result = await this.elasticsearchService.updateDocument(
        VECTOR_INDEX_NAME,
        documentId,
        {
          ...updates,
          updatedAt: Date.now(),
        }
      );

      return {
        success: true,
        message: "Document updated successfully",
        id: documentId,
      };
    } catch (error) {
      this.logger.error("Failed to update document:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update document",
      };
    }
  }

  async deleteDocument(documentId: string): Promise<DocumentOperationResult> {
    try {
      const result = await this.elasticsearchService.deleteDocument(
        VECTOR_INDEX_NAME,
        documentId
      );

      return {
        success: true,
        message: "Document deleted successfully",
        id: documentId,
      };
    } catch (error) {
      this.logger.error("Failed to delete document:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete document",
      };
    }
  }

  async bulkIndex(
    documents: Array<{
      documentId: string;
      userId: string;
      title: string;
      content: string;
      vector: number[];
      tags?: string[];
      metadata?: Record<string, any>;
    }>
  ): Promise<DocumentOperationResult> {
    try {
      const formattedDocs = documents.map((doc) => ({
        documentId: doc.documentId,
        userId: doc.userId,
        title: doc.title,
        content: doc.content,
        vector: doc.vector,
        tags: doc.tags || [],
        metadata: doc.metadata || {},
        timestamp: Date.now(),
      }));

      await this.elasticsearchService.bulkIndex(
        VECTOR_INDEX_NAME,
        formattedDocs as any
      );

      return {
        success: true,
        message: `Bulk indexed ${documents.length} documents`,
      };
    } catch (error) {
      this.logger.error("Failed to bulk index documents:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to bulk index documents",
      };
    }
  }

  // 搜尋方法
  async vectorSearch(params: VectorSearchParams): Promise<SearchResponse> {
    return (await this.elasticsearchService.vectorSearch(
      params.vector
    )) as unknown as SearchResponse;
  }

  async fullTextSearch(params: FullTextSearchParams): Promise<SearchResponse> {
    return (await this.elasticsearchService.fullTextSearch(
      params.query
    )) as unknown as SearchResponse;
  }

  async phraseSearch(params: PhraseSearchParams): Promise<SearchResponse> {
    return (await this.elasticsearchService.phraseSearch(
      params.phrase
    )) as unknown as SearchResponse;
  }

  async prefixSearch(params: PrefixSearchParams): Promise<SearchResponse> {
    return (await this.elasticsearchService.prefixSearch(
      params.prefix,
      (params.limit || 10).toString()
    )) as unknown as SearchResponse;
  }

  async hybridSearch(params: HybridSearchParams): Promise<SearchResponse> {
    return (await this.elasticsearchService.hybridSearch(
      params.vector || [],
      params.query || "",
      params.k,
      params.weights
    )) as unknown as SearchResponse;
  }

  // 統計方法
  async getIndexStats(indexName: string): Promise<IndexStats> {
    return await this.elasticsearchService.getIndexStats(indexName);
  }

  async getClusterStats(): Promise<ClusterStats> {
    return await this.elasticsearchService.getClusterStats();
  }
}
