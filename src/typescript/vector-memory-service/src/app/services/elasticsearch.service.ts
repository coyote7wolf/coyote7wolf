import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Client } from "@elastic/elasticsearch";
import { ElasticsearchConfig } from "../../config/elasticsearch.config";
import {
  VECTOR_INDEX_MAPPING,
  VECTOR_INDEX_NAME,
} from "../../config/vector-index.mapping";
import {
  DOCUMENT_INDEX_MAPPING,
  DOCUMENT_INDEX_NAME,
} from "../../config/document-index.mapping";

@Injectable()
export class ElasticsearchService {
  private client: Client;
  private logger = new Logger("ElasticsearchService");

  constructor() {
    this.client = ElasticsearchConfig.getClient();
  }

  /**
   * 健康檢查 - 驗證連接
   */
  async ping(): Promise<boolean> {
    try {
      await this.client.ping();
      this.logger.log("✓ Elasticsearch ping successful");
      return true;
    } catch (error) {
      this.logger.error("✗ Elasticsearch ping failed:", error);
      return false;
    }
  }

  /**
   * 獲取 Elasticsearch 信息
   */
  async getInfo() {
    try {
      const info = await this.client.info();
      return {
        version: info.version?.number,
        name: info.name,
        cluster_name: info.cluster_name,
      };
    } catch (error) {
      this.logger.error("Failed to get Elasticsearch info:", error);
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
          message: "Elasticsearch is not responding",
        };
      }

      const info = await this.getInfo();
      return {
        status: "healthy",
        elasticsearch: info,
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
   * 檢查索引是否存在
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      const result = await this.client.indices.exists({ index: indexName });
      return result;
    } catch (error) {
      this.logger.error(`Error checking if index ${indexName} exists:`, error);
      return false;
    }
  }

  /**
   * 建立向量索引
   */
  async createVectorIndex(): Promise<void> {
    try {
      const indexName = VECTOR_INDEX_NAME;

      // 如果索引已存在，先刪除
      if (await this.indexExists(indexName)) {
        await this.deleteIndex(indexName);
        this.logger.log(`Deleted existing index: ${indexName}`);
      }

      // 建立新索引
      await this.client.indices.create({
        index: indexName,
        body: VECTOR_INDEX_MAPPING,
      } as any);

      this.logger.log(`✓ Vector index created: ${indexName}`);
    } catch (error) {
      this.logger.error("Failed to create vector index:", error);
      throw error;
    }
  }

  /**
   * 建立全文檢索索引
   */
  async createDocumentIndex(): Promise<void> {
    try {
      const indexName = DOCUMENT_INDEX_NAME;

      // 如果索引已存在，先刪除
      if (await this.indexExists(indexName)) {
        await this.deleteIndex(indexName);
        this.logger.log(`Deleted existing index: ${indexName}`);
      }

      // 建立新索引
      await this.client.indices.create({
        index: indexName,
        body: DOCUMENT_INDEX_MAPPING,
      } as any);

      this.logger.log(`✓ Document index created: ${indexName}`);
    } catch (error) {
      this.logger.error("Failed to create document index:", error);
      throw error;
    }
  }

  /**
   * 刪除索引
   */
  async deleteIndex(indexName: string): Promise<void> {
    try {
      if (!(await this.indexExists(indexName))) {
        throw new NotFoundException(`Index ${indexName} does not exist`);
      }

      await this.client.indices.delete({ index: indexName });
      this.logger.log(`✓ Index deleted: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to delete index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * 索引文檔
   */
  async indexDocument(indexName: string, id: string, body: any): Promise<any> {
    try {
      if (!(await this.indexExists(indexName))) {
        throw new NotFoundException(`Index ${indexName} does not exist`);
      }

      const result = await this.client.index({
        index: indexName,
        id,
        body: {
          ...body,
          updatedAt: new Date(),
        },
        refresh: "wait_for",
      });

      this.logger.debug(`Document indexed: ${indexName}/${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to index document in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * 更新文檔
   */
  async updateDocument(indexName: string, id: string, body: any): Promise<any> {
    try {
      if (!(await this.indexExists(indexName))) {
        throw new NotFoundException(`Index ${indexName} does not exist`);
      }

      const result = await this.client.update({
        index: indexName,
        id,
        body: {
          doc: {
            ...body,
            updatedAt: new Date(),
          },
          doc_as_upsert: true,
        },
        refresh: "wait_for",
      });

      this.logger.debug(`Document updated: ${indexName}/${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update document in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * 刪除文檔
   */
  async deleteDocument(indexName: string, id: string): Promise<any> {
    try {
      if (!(await this.indexExists(indexName))) {
        throw new NotFoundException(`Index ${indexName} does not exist`);
      }

      const result = await this.client.delete({
        index: indexName,
        id,
        refresh: "wait_for",
      });

      this.logger.debug(`Document deleted: ${indexName}/${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete document in ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * 向量搜尋
   */
  async vectorSearch(
    vector: number[],
    k: number = 10,
    filters?: any
  ): Promise<any[]> {
    try {
      if (!vector || vector.length !== 768) {
        throw new BadRequestException("Vector must have 768 dimensions");
      }

      const query: any = {
        knn: {
          vector: {
            vector,
            k,
          },
        },
      };

      // 添加過濾條件
      if (filters && Object.keys(filters).length > 0) {
        query.knn.vector.filter = {
          bool: {
            must: Object.entries(filters).map(([key, value]) => ({
              term: { [key]: value },
            })),
          },
        };
      }

      const results = await this.client.search({
        index: VECTOR_INDEX_NAME,
        body: { query, size: k },
      });

      return (results.hits.hits as any[]).map((hit) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
      }));
    } catch (error) {
      this.logger.error("Vector search failed:", error);
      throw error;
    }
  }

  /**
   * 全文搜尋
   */
  async fullTextSearch(
    query: string,
    fields: string[] = ["content", "title"],
    limit: number = 20,
    offset: number = 0,
    highlight: boolean = true
  ): Promise<any> {
    try {
      if (!query || query.trim().length === 0) {
        throw new BadRequestException("Query string is required");
      }

      const searchBody: any = {
        query: {
          multi_match: {
            query: query.trim(),
            fields,
            fuzziness: "AUTO",
            operator: "or",
            prefix_length: 0,
          },
        },
        size: limit,
        from: offset,
      };

      if (highlight) {
        searchBody.highlight = {
          fields: fields.reduce((acc: any, field) => {
            acc[field] = {
              pre_tags: ["<em>"],
              post_tags: ["</em>"],
            };
            return acc;
          }, {}),
          fragment_size: 150,
          number_of_fragments: 3,
        };
      }

      const results = await this.client.search({
        index: DOCUMENT_INDEX_NAME,
        body: searchBody,
      });

      return {
        total: (results.hits.total as any).value || 0,
        limit,
        offset,
        items: (results.hits.hits as any[]).map((hit) => ({
          id: hit._id,
          score: hit._score,
          source: hit._source,
          highlight: hit.highlight,
        })),
      };
    } catch (error) {
      this.logger.error("Full-text search failed:", error);
      throw error;
    }
  }

  /**
   * 短語搜尋
   */
  async phraseSearch(
    phrase: string,
    fields: string[] = ["content", "title"],
    limit: number = 20,
    slop: number = 0
  ): Promise<any> {
    try {
      if (!phrase || phrase.trim().length === 0) {
        throw new BadRequestException("Phrase is required");
      }

      const searchBody: any = {
        query: {
          multi_match: {
            query: phrase.trim(),
            fields,
            type: "phrase",
            slop,
          },
        },
        size: limit,
      };

      const results = await this.client.search({
        index: DOCUMENT_INDEX_NAME,
        body: searchBody,
      });

      return (results.hits.hits as any[]).map((hit) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
      }));
    } catch (error) {
      this.logger.error("Phrase search failed:", error);
      throw error;
    }
  }

  /**
   * 前綴搜尋
   */
  async prefixSearch(
    field: string,
    prefix: string,
    limit: number = 20
  ): Promise<any> {
    try {
      if (!prefix || prefix.trim().length === 0) {
        throw new BadRequestException("Prefix is required");
      }

      const searchBody: any = {
        query: {
          prefix: {
            [field]: prefix.trim(),
          },
        },
        size: limit,
      };

      const results = await this.client.search({
        index: DOCUMENT_INDEX_NAME,
        body: searchBody,
      });

      return (results.hits.hits as any[]).map((hit) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
      }));
    } catch (error) {
      this.logger.error("Prefix search failed:", error);
      throw error;
    }
  }

  /**
   * 複合搜尋 - 向量 + 全文 + 篩選
   */
  async hybridSearch(
    vector: number[],
    textQuery: string,
    filters?: any,
    weights?: {
      vector?: number;
      text?: number;
      recency?: number;
    },
    k: number = 10
  ): Promise<any> {
    try {
      const defaultWeights = {
        vector: weights?.vector ?? 0.6,
        text: weights?.text ?? 0.3,
        recency: weights?.recency ?? 0.1,
      };

      // 1. 向量搜尋
      const vectorResults = await this.vectorSearch(vector, k, filters);

      // 2. 全文搜尋
      const textResults = await this.fullTextSearch(
        textQuery,
        ["content", "title"],
        k
      );

      // 3. 結果融合 (RRF - Reciprocal Rank Fusion)
      const scoreMap = new Map<string, number>();

      vectorResults.forEach((result, idx) => {
        const normalizedScore =
          (1 - idx / (vectorResults.length || 1)) * defaultWeights.vector;
        const currentScore = scoreMap.get(result.id) || 0;
        scoreMap.set(result.id, currentScore + normalizedScore);
      });

      textResults.items.forEach((result: any, idx: number) => {
        const normalizedScore =
          (1 - idx / (textResults.items.length || 1)) * defaultWeights.text;
        const currentScore = scoreMap.get(result.id) || 0;
        scoreMap.set(result.id, currentScore + normalizedScore);
      });

      // 4. 排序與返回
      const mergedResults = Array.from(scoreMap.entries())
        .map(([id, score]) => ({ id, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k);

      return mergedResults;
    } catch (error) {
      this.logger.error("Hybrid search failed:", error);
      throw error;
    }
  }

  /**
   * 批量索引文檔
   */
  async bulkIndex(
    indexName: string,
    documents: Array<{ id: string; body: any }>
  ): Promise<any> {
    try {
      if (!(await this.indexExists(indexName))) {
        throw new NotFoundException(`Index ${indexName} does not exist`);
      }

      const body: any = [];

      for (const doc of documents) {
        body.push({ index: { _index: indexName, _id: doc.id } });
        body.push({ ...doc.body, updatedAt: new Date() });
      }

      const result = await this.client.bulk({ body, refresh: "wait_for" });

      this.logger.log(
        `Bulk indexed ${documents.length} documents to ${indexName}`
      );

      return {
        indexed: documents.length,
        errors: (result.errors as any) ? result.items.length : 0,
        items: result.items,
      };
    } catch (error) {
      this.logger.error(
        `Failed to bulk index documents in ${indexName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * 獲取索引統計信息
   */
  async getIndexStats(indexName: string): Promise<any> {
    try {
      if (!(await this.indexExists(indexName))) {
        throw new NotFoundException(`Index ${indexName} does not exist`);
      }

      const stats = await this.client.indices.stats({ index: indexName });
      const mapping = await this.client.indices.getMapping({
        index: indexName,
      });

      return {
        index: indexName,
        status: (stats.indices as any)[indexName]?.status,
        documentCount:
          (stats.indices as any)[indexName]?.primaries?.docs?.count || 0,
        storeSize:
          (stats.indices as any)[indexName]?.primaries?.store?.size_in_bytes ||
          0,
        properties:
          (mapping.body as any)[indexName]?.mappings?.properties || {},
      };
    } catch (error) {
      this.logger.error(`Failed to get index stats for ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * 獲取集群統計信息
   */
  async getClusterStats(): Promise<any> {
    try {
      const stats = await this.client.cluster.stats({});
      return {
        status: (stats as any).status,
        nodeCount: (stats as any).nodes?.count?.total || 0,
        indexCount: (stats as any).indices?.count || 0,
        documentCount: (stats as any).indices?.docs?.count || 0,
      };
    } catch (error) {
      this.logger.error("Failed to get cluster stats:", error);
      throw error;
    }
  }

  /**
   * 清空索引
   */
  async clearIndex(indexName: string): Promise<void> {
    try {
      if (!(await this.indexExists(indexName))) {
        throw new NotFoundException(`Index ${indexName} does not exist`);
      }

      await this.client.deleteByQuery({
        index: indexName,
        body: {
          query: {
            match_all: {},
          },
        },
      });

      this.logger.log(`✓ Index cleared: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to clear index ${indexName}:`, error);
      throw error;
    }
  }
}
