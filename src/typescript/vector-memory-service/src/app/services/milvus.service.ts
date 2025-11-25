import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import {
  IVectorDatabase,
  VectorSearchParams,
  FullTextSearchParams,
  SearchResponse,
  DocumentOperationResult,
  IndexStats,
  ClusterStats,
} from "../interfaces/vector-database.interface";
import { MilvusConfig } from "../../config/milvus.config";
import {
  MILVUS_VECTOR_COLLECTION,
  MILVUS_DOCUMENT_COLLECTION,
  VECTOR_COLLECTION_SCHEMA,
  DOCUMENT_COLLECTION_SCHEMA,
  VECTOR_INDEX_CONFIG,
  DEFAULT_INDEX_TYPE,
} from "../../config/milvus-schema";

@Injectable()
export class MilvusService implements IVectorDatabase {
  private client: any;
  private logger = new Logger("MilvusService");

  constructor() {
    this.client = MilvusConfig.getClient();
  }

  /**
   * 健康檢查 - 驗證連接
   */
  async ping(): Promise<boolean> {
    try {
      const isAlive = await MilvusConfig.ping();
      if (isAlive) {
        this.logger.log("✓ Milvus ping successful");
      }
      return isAlive;
    } catch (error) {
      this.logger.error("✗ Milvus ping failed:", error);
      return false;
    }
  }

  /**
   * 獲取 Milvus 信息
   */
  async getInfo(): Promise<Record<string, any>> {
    try {
      return await MilvusConfig.getInfo();
    } catch (error) {
      this.logger.error("Failed to get Milvus info:", error);
      throw error;
    }
  }

  /**
   * 獲取健康狀態
   */
  async health(): Promise<Record<string, any>> {
    try {
      const isHealthy = await this.ping();
      if (!isHealthy) {
        return {
          status: "unhealthy",
          message: "Milvus is not responding",
        };
      }

      const info = await this.getInfo();
      return {
        status: "healthy",
        milvus: info,
      };
    } catch (error) {
      this.logger.error("Health check failed:", error);
      return {
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 檢查集合是否存在
   */
  async collectionExists(collectionName: string): Promise<boolean> {
    try {
      const response = await this.client.hasCollection({
        collection_name: collectionName,
      });
      return response.value || false;
    } catch (error) {
      this.logger.error(
        `Error checking if collection ${collectionName} exists:`,
        error
      );
      return false;
    }
  }

  /**
   * 建立向量集合
   */
  async createVectorIndex(): Promise<void> {
    try {
      if (await this.collectionExists(MILVUS_VECTOR_COLLECTION)) {
        await this.deleteIndex(MILVUS_VECTOR_COLLECTION);
        this.logger.log(
          `Deleted existing collection: ${MILVUS_VECTOR_COLLECTION}`
        );
      }

      // 創建集合
      await this.client.createCollection({
        collection_name: MILVUS_VECTOR_COLLECTION,
        fields: VECTOR_COLLECTION_SCHEMA.fields,
      });

      this.logger.log(
        `✓ Vector collection created: ${MILVUS_VECTOR_COLLECTION}`
      );

      // 創建索引
      await this.client.createIndex({
        collection_name: MILVUS_VECTOR_COLLECTION,
        field_name: "vector",
        index_name: "vector_index",
        index_type: DEFAULT_INDEX_TYPE.indexType,
        metric_type: DEFAULT_INDEX_TYPE.metricType,
        params: DEFAULT_INDEX_TYPE.params,
      });

      this.logger.log(`✓ Vector index created on ${MILVUS_VECTOR_COLLECTION}`);

      // 加載集合到內存
      await this.client.loadCollectionSync({
        collection_name: MILVUS_VECTOR_COLLECTION,
      });

      this.logger.log(`✓ Vector collection loaded into memory`);
    } catch (error) {
      this.logger.error("Failed to create vector collection:", error);
      throw error;
    }
  }

  /**
   * 建立文檔集合 (用於全文搜尋)
   */
  async createDocumentIndex(): Promise<void> {
    try {
      if (await this.collectionExists(MILVUS_DOCUMENT_COLLECTION)) {
        await this.deleteIndex(MILVUS_DOCUMENT_COLLECTION);
        this.logger.log(
          `Deleted existing collection: ${MILVUS_DOCUMENT_COLLECTION}`
        );
      }

      // 創建集合
      await this.client.createCollection({
        collection_name: MILVUS_DOCUMENT_COLLECTION,
        fields: DOCUMENT_COLLECTION_SCHEMA.fields,
      });

      this.logger.log(
        `✓ Document collection created: ${MILVUS_DOCUMENT_COLLECTION}`
      );

      // 加載集合到內存
      await this.client.loadCollectionSync({
        collection_name: MILVUS_DOCUMENT_COLLECTION,
      });

      this.logger.log(`✓ Document collection loaded into memory`);
    } catch (error) {
      this.logger.error("Failed to create document collection:", error);
      throw error;
    }
  }

  /**
   * 刪除集合
   */
  async deleteIndex(collectionName: string): Promise<void> {
    try {
      // 先卸載集合
      try {
        await this.client.releaseCollection({
          collection_name: collectionName,
        });
      } catch {
        // 集合可能未加載，忽略錯誤
      }

      // 刪除集合
      await this.client.dropCollection({
        collection_name: collectionName,
      });

      this.logger.log(`✓ Collection deleted: ${collectionName}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete collection ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * 檢查集合是否存在
   */
  async indexExists(collectionName: string): Promise<boolean> {
    return await this.collectionExists(collectionName);
  }

  /**
   * 清空集合
   */
  async clearIndex(collectionName: string): Promise<void> {
    try {
      // 刪除所有數據
      await this.client.delete({
        collection_name: collectionName,
        filter: "1==1", // 匹配所有記錄
      });

      this.logger.log(`✓ Collection cleared: ${collectionName}`);
    } catch (error) {
      this.logger.error(`Failed to clear collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * 索引單個文檔
   */
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
      if (!params.vector || params.vector.length !== 768) {
        throw new BadRequestException("Vector must be 768-dimensional");
      }

      const now = Date.now();
      const documentData = {
        documentId: params.documentId,
        userId: params.userId,
        title: params.title,
        content: params.content,
        vector: params.vector,
        tags: params.tags?.join(",") || "",
        metadata: JSON.stringify(params.metadata || {}),
        createdAt: now,
        updatedAt: now,
      };

      // 索引到向量集合
      const vectorResult = await this.client.insert({
        collection_name: MILVUS_VECTOR_COLLECTION,
        data: [documentData],
      });

      // 索引到文檔集合
      await this.client.insert({
        collection_name: MILVUS_DOCUMENT_COLLECTION,
        data: [documentData],
      });

      this.logger.log(`✓ Document indexed: ${params.documentId}`);

      return {
        success: true,
        message: "Document indexed successfully",
        id: params.documentId,
      };
    } catch (error) {
      this.logger.error("Failed to index document:", error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Failed to index document"
      );
    }
  }

  /**
   * 更新文檔
   */
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
      const now = Date.now();

      // 構建更新數據
      const updateData: any = {
        ...updates,
        updatedAt: now,
      };

      if (updates.tags) {
        updateData.tags = updates.tags.join(",");
      }
      if (updates.metadata) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }

      // 更新兩個集合
      for (const collection of [
        MILVUS_VECTOR_COLLECTION,
        MILVUS_DOCUMENT_COLLECTION,
      ]) {
        await this.client.upsert({
          collection_name: collection,
          data: [
            {
              documentId,
              ...updateData,
            },
          ],
        });
      }

      this.logger.log(`✓ Document updated: ${documentId}`);

      return {
        success: true,
        message: "Document updated successfully",
        id: documentId,
      };
    } catch (error) {
      this.logger.error("Failed to update document:", error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Failed to update document"
      );
    }
  }

  /**
   * 刪除文檔
   */
  async deleteDocument(documentId: string): Promise<DocumentOperationResult> {
    try {
      const filter = `documentId == "${documentId}"`;

      // 從兩個集合中刪除
      for (const collection of [
        MILVUS_VECTOR_COLLECTION,
        MILVUS_DOCUMENT_COLLECTION,
      ]) {
        await this.client.delete({
          collection_name: collection,
          filter,
        });
      }

      this.logger.log(`✓ Document deleted: ${documentId}`);

      return {
        success: true,
        message: "Document deleted successfully",
        id: documentId,
      };
    } catch (error) {
      this.logger.error("Failed to delete document:", error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Failed to delete document"
      );
    }
  }

  /**
   * 批量索引文檔
   */
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
      const now = Date.now();

      const formattedDocs = documents.map((doc) => ({
        documentId: doc.documentId,
        userId: doc.userId,
        title: doc.title,
        content: doc.content,
        vector: doc.vector,
        tags: doc.tags?.join(",") || "",
        metadata: JSON.stringify(doc.metadata || {}),
        createdAt: now,
        updatedAt: now,
      }));

      // 批量索引到兩個集合
      const batchSize = 1000; // Milvus 建議的批量大小
      for (let i = 0; i < formattedDocs.length; i += batchSize) {
        const batch = formattedDocs.slice(i, i + batchSize);

        for (const collection of [
          MILVUS_VECTOR_COLLECTION,
          MILVUS_DOCUMENT_COLLECTION,
        ]) {
          await this.client.insert({
            collection_name: collection,
            data: batch,
          });
        }
      }

      this.logger.log(`✓ Bulk indexed ${documents.length} documents`);

      return {
        success: true,
        message: `Bulk indexed ${documents.length} documents`,
      };
    } catch (error) {
      this.logger.error("Failed to bulk index documents:", error);
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : "Failed to bulk index documents"
      );
    }
  }

  /**
   * 向量搜尋 (kNN)
   */
  async vectorSearch(params: VectorSearchParams): Promise<SearchResponse> {
    try {
      if (!params.vector || params.vector.length !== 768) {
        throw new BadRequestException("Vector must be 768-dimensional");
      }

      const startTime = Date.now();

      // 構建搜尋過濾器
      const filter = this.buildFilter(params.filters);

      const result = await this.client.search({
        collection_name: MILVUS_VECTOR_COLLECTION,
        vector: params.vector,
        filter,
        limit: params.k || 10,
        metric_type: "COSINE",
        output_fields: [
          "documentId",
          "userId",
          "title",
          "content",
          "tags",
          "metadata",
        ],
      });

      const took = Date.now() - startTime;

      return {
        type: "vector_search",
        total: result.results?.length || 0,
        results: (result.results || []).map((hit: any) => ({
          id: hit.documentId,
          score: hit.score || 0,
          source: {
            documentId: hit.documentId,
            userId: hit.userId,
            title: hit.title,
            content: hit.content,
            tags: hit.tags?.split(",").filter((t: string) => t) || [],
            metadata: hit.metadata ? JSON.parse(hit.metadata) : {},
          },
        })),
        took,
      };
    } catch (error) {
      this.logger.error("Vector search failed:", error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Vector search failed"
      );
    }
  }

  /**
   * 全文搜尋
   * 注: Milvus 默認不支持全文搜尋，此實現使用 like 過濾
   */
  async fullTextSearch(params: FullTextSearchParams): Promise<SearchResponse> {
    try {
      const startTime = Date.now();

      // 構建搜尋過濾器 - 在標題和內容中搜尋
      const filters = (params.fields || ["title", "content"])
        .map((field) => `${field} like "%${params.query}%"`)
        .join(" || ");

      const result = await this.client.query({
        collection_name: MILVUS_DOCUMENT_COLLECTION,
        filter: filters,
        limit: params.limit || 20,
        offset: params.offset || 0,
        output_fields: [
          "documentId",
          "userId",
          "title",
          "content",
          "tags",
          "metadata",
        ],
      });

      const took = Date.now() - startTime;

      return {
        type: "fulltext_search",
        total: result.length || 0,
        results: (result || []).map((hit: any) => ({
          id: hit.documentId,
          score: 1.0, // Milvus 全文搜尋沒有分數
          source: {
            documentId: hit.documentId,
            userId: hit.userId,
            title: hit.title,
            content: hit.content,
            tags: hit.tags?.split(",").filter((t: string) => t) || [],
            metadata: hit.metadata ? JSON.parse(hit.metadata) : {},
          },
        })),
        took,
      };
    } catch (error) {
      this.logger.error("Full-text search failed:", error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Full-text search failed"
      );
    }
  }

  /**
   * 短語搜尋
   */
  async phraseSearch(params: any): Promise<SearchResponse> {
    // Milvus 不原生支持短語搜尋，使用精確匹配實現
    return this.fullTextSearch({
      query: params.phrase,
      fields: params.fields,
      limit: params.limit,
    });
  }

  /**
   * 前綴搜尋
   */
  async prefixSearch(params: any): Promise<SearchResponse> {
    try {
      const startTime = Date.now();

      const filters = (params.fields || ["title", "content"])
        .map((field: string) => `${field} like "${params.prefix}%"`)
        .join(" || ");

      const result = await this.client.query({
        collection_name: MILVUS_DOCUMENT_COLLECTION,
        filter: filters,
        limit: params.limit || 10,
        output_fields: [
          "documentId",
          "userId",
          "title",
          "content",
          "tags",
          "metadata",
        ],
      });

      const took = Date.now() - startTime;

      return {
        type: "prefix_search",
        total: result.length || 0,
        results: (result || []).map((hit: any) => ({
          id: hit.documentId,
          score: 1.0,
          source: {
            documentId: hit.documentId,
            userId: hit.userId,
            title: hit.title,
            content: hit.content,
            tags: hit.tags?.split(",").filter((t: string) => t) || [],
            metadata: hit.metadata ? JSON.parse(hit.metadata) : {},
          },
        })),
        took,
      };
    } catch (error) {
      this.logger.error("Prefix search failed:", error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Prefix search failed"
      );
    }
  }

  /**
   * 混合搜尋 (向量 + 全文)
   */
  async hybridSearch(params: any): Promise<SearchResponse> {
    try {
      const startTime = Date.now();
      const vectorResults = params.vector
        ? await this.vectorSearch({
            vector: params.vector,
            k: params.k || 10,
            filters: params.filters,
          })
        : { results: [] };

      const textResults = params.query
        ? await this.fullTextSearch({
            query: params.query,
            fields: params.fields,
            limit: params.limit || 10,
          })
        : { results: [] };

      // 合併結果 (使用權重)
      const weights = params.weights || {
        vector: 0.6,
        text: 0.3,
        recency: 0.1,
      };
      const mergedResults = this.mergeResults(
        vectorResults.results,
        textResults.results,
        weights
      );

      const took = Date.now() - startTime;

      return {
        type: "hybrid_search",
        total: mergedResults.length,
        results: mergedResults,
        took,
      };
    } catch (error) {
      this.logger.error("Hybrid search failed:", error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Hybrid search failed"
      );
    }
  }

  /**
   * 獲取索引統計
   */
  async getIndexStats(collectionName: string): Promise<IndexStats> {
    try {
      const stats = await this.client.getCollectionStatistics({
        collection_name: collectionName,
      });

      return {
        docs_count: stats.row_count || 0,
        store_size_bytes: 0, // Milvus 不直接提供
      };
    } catch (error) {
      this.logger.error(`Failed to get stats for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * 獲取集群統計
   */
  async getClusterStats(): Promise<ClusterStats> {
    try {
      const vectorStats = await this.getIndexStats(MILVUS_VECTOR_COLLECTION);
      const documentStats = await this.getIndexStats(
        MILVUS_DOCUMENT_COLLECTION
      );

      return {
        status: "green",
        version: (await this.getInfo()).version,
      };
    } catch (error) {
      this.logger.error("Failed to get cluster stats:", error);
      throw error;
    }
  }

  /**
   * 輔助方法: 構建過濾條件
   */
  private buildFilter(filters?: Record<string, any>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return "";
    }

    return Object.entries(filters)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key} == "${value}"`;
        }
        return `${key} == ${value}`;
      })
      .join(" && ");
  }

  /**
   * 輔助方法: 合併搜尋結果
   */
  private mergeResults(vectorResults: any[], textResults: any[], weights: any) {
    const scoreMap = new Map<string, number>();

    // 計算向量搜尋分數
    vectorResults.forEach((result, index) => {
      const score = (result.score || 0) * (weights.vector || 0.6);
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + score);
    });

    // 計算全文搜尋分數
    textResults.forEach((result, index) => {
      const score = (1.0 - index / textResults.length) * (weights.text || 0.3); // 基於排名的分數
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + score);
    });

    // 合併結果
    const resultMap = new Map<string, any>();
    [...vectorResults, ...textResults].forEach((result) => {
      if (!resultMap.has(result.id)) {
        resultMap.set(result.id, result);
      }
    });

    // 按分數排序
    return Array.from(resultMap.values())
      .map((result) => ({
        ...result,
        score: scoreMap.get(result.id) || 0,
      }))
      .sort((a, b) => b.score - a.score);
  }
}
