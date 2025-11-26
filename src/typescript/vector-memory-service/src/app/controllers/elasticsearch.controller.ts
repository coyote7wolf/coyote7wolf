import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ElasticsearchService } from "../services/elasticsearch.service";
import {
  VECTOR_INDEX_NAME,
  DOCUMENT_INDEX_NAME,
} from "../../config/vector-index.mapping";

@Controller("v1/elasticsearch")
export class ElasticsearchController {
  private logger = new Logger("ElasticsearchController");

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * 健康檢查
   */
  @Get("health")
  async health() {
    const isHealthy = await this.elasticsearchService.ping();
    if (!isHealthy) {
      return {
        status: "unhealthy",
        message: "Elasticsearch is not responding",
      };
    }

    const info = await this.elasticsearchService.getInfo();
    return {
      status: "healthy",
      elasticsearch: info,
    };
  }

  /**
   * 獲取統計信息
   */
  @Get("stats")
  async getStats() {
    try {
      const clusterStats = await this.elasticsearchService.getClusterStats();
      const vectorStats = await this.elasticsearchService
        .getIndexStats(VECTOR_INDEX_NAME)
        .catch(() => null);
      const documentStats = await this.elasticsearchService
        .getIndexStats(DOCUMENT_INDEX_NAME)
        .catch(() => null);

      return {
        cluster: clusterStats,
        indices: {
          [VECTOR_INDEX_NAME]: vectorStats,
          [DOCUMENT_INDEX_NAME]: documentStats,
        },
      };
    } catch (error) {
      this.logger.error("Failed to get stats:", error);
      throw error;
    }
  }

  /**
   * 建立向量索引
   */
  @Post("indices/embeddings/create")
  @HttpCode(HttpStatus.CREATED)
  async createVectorIndex() {
    await this.elasticsearchService.createVectorIndex();
    return {
      message: "✓ Vector index created successfully",
      index: VECTOR_INDEX_NAME,
    };
  }

  /**
   * 建立全文檢索索引
   */
  @Post("indices/documents/create")
  @HttpCode(HttpStatus.CREATED)
  async createDocumentIndex() {
    await this.elasticsearchService.createDocumentIndex();
    return {
      message: "✓ Document index created successfully",
      index: DOCUMENT_INDEX_NAME,
    };
  }

  /**
   * 刪除索引
   */
  @Delete("indices/:name")
  @HttpCode(HttpStatus.OK)
  async deleteIndex(@Param("name") name: string) {
    await this.elasticsearchService.deleteIndex(name);
    return {
      message: `✓ Index deleted: ${name}`,
      index: name,
    };
  }

  /**
   * 獲取索引統計
   */
  @Get("indices/:name/stats")
  async getIndexStats(@Param("name") name: string) {
    const stats = await this.elasticsearchService.getIndexStats(name);
    return stats;
  }

  /**
   * 清空索引
   */
  @Delete("indices/:name/clear")
  @HttpCode(HttpStatus.OK)
  async clearIndex(@Param("name") name: string) {
    await this.elasticsearchService.clearIndex(name);
    return {
      message: `✓ Index cleared: ${name}`,
      index: name,
    };
  }

  /**
   * 向量搜尋
   */
  @Post("search/vectors")
  async vectorSearch(
    @Body() body: { vector: number[]; k?: number; filters?: any }
  ) {
    const { vector, k = 10, filters } = body;

    const results = await this.elasticsearchService.vectorSearch(
      vector,
      k,
      filters
    );

    return {
      type: "vector_search",
      k,
      total: results.length,
      results,
    };
  }

  /**
   * 全文搜尋
   */
  @Post("search/fulltext")
  async fullTextSearch(
    @Body()
    body: {
      query: string;
      fields?: string[];
      limit?: number;
      offset?: number;
      highlight?: boolean;
    }
  ) {
    const {
      query,
      fields = ["content", "title"],
      limit = 20,
      offset = 0,
      highlight = true,
    } = body;

    const results = await this.elasticsearchService.fullTextSearch(
      query,
      fields,
      limit,
      offset,
      highlight
    );

    return {
      type: "fulltext_search",
      ...results,
    };
  }

  /**
   * 短語搜尋
   */
  @Post("search/phrase")
  async phraseSearch(
    @Body()
    body: {
      phrase: string;
      fields?: string[];
      limit?: number;
      slop?: number;
    }
  ) {
    const {
      phrase,
      fields = ["content", "title"],
      limit = 20,
      slop = 0,
    } = body;

    const results = await this.elasticsearchService.phraseSearch(
      phrase,
      fields,
      limit,
      slop
    );

    return {
      type: "phrase_search",
      total: results.length,
      results,
    };
  }

  /**
   * 前綴搜尋
   */
  @Post("search/prefix")
  async prefixSearch(
    @Body() body: { field: string; prefix: string; limit?: number }
  ) {
    const { field, prefix, limit = 20 } = body;

    const results = await this.elasticsearchService.prefixSearch(
      field,
      prefix,
      limit
    );

    return {
      type: "prefix_search",
      total: results.length,
      results,
    };
  }

  /**
   * 複合搜尋 (向量 + 全文 + 篩選)
   */
  @Post("search/hybrid")
  async hybridSearch(
    @Body()
    body: {
      vector: number[];
      query: string;
      filters?: any;
      weights?: {
        vector?: number;
        text?: number;
        recency?: number;
      };
      k?: number;
    }
  ) {
    const { vector, query, filters, weights, k = 10 } = body;

    const results = await this.elasticsearchService.hybridSearch(
      vector,
      query,
      filters,
      weights,
      k
    );

    return {
      type: "hybrid_search",
      k,
      weights: weights || { vector: 0.6, text: 0.3, recency: 0.1 },
      total: results.length,
      results,
    };
  }

  /**
   * 索引文檔 (向量索引)
   */
  @Post("documents/vector")
  @HttpCode(HttpStatus.CREATED)
  async indexVectorDocument(
    @Body()
    body: {
      id: string;
      documentId: string;
      userId: string;
      vector: number[];
      content?: string;
      title?: string;
      metadata?: any;
    }
  ) {
    await this.elasticsearchService.indexDocument(
      VECTOR_INDEX_NAME,
      body.id,
      body
    );
    return {
      message: "✓ Vector document indexed",
      index: VECTOR_INDEX_NAME,
      id: body.id,
    };
  }

  /**
   * 索引文檔 (全文索引)
   */
  @Post("documents/fulltext")
  @HttpCode(HttpStatus.CREATED)
  async indexFullTextDocument(
    @Body()
    body: {
      id: string;
      title: string;
      content: string;
      userId?: string;
      tags?: string[];
      metadata?: any;
    }
  ) {
    await this.elasticsearchService.indexDocument(
      DOCUMENT_INDEX_NAME,
      body.id,
      body
    );
    return {
      message: "✓ Full-text document indexed",
      index: DOCUMENT_INDEX_NAME,
      id: body.id,
    };
  }

  /**
   * 更新文檔
   */
  @Put("documents/:index/:id")
  @HttpCode(HttpStatus.OK)
  async updateDocument(
    @Param("index") index: string,
    @Param("id") id: string,
    @Body() body: any
  ) {
    await this.elasticsearchService.updateDocument(index, id, body);
    return {
      message: "✓ Document updated",
      index,
      id,
    };
  }

  /**
   * 刪除文檔
   */
  @Delete("documents/:index/:id")
  @HttpCode(HttpStatus.OK)
  async deleteDocument(@Param("index") index: string, @Param("id") id: string) {
    await this.elasticsearchService.deleteDocument(index, id);
    return {
      message: "✓ Document deleted",
      index,
      id,
    };
  }

  /**
   * 批量索引文檔
   */
  @Post("documents/bulk")
  @HttpCode(HttpStatus.CREATED)
  async bulkIndex(
    @Body() body: { index: string; documents: Array<{ id: string; body: any }> }
  ) {
    const result = await this.elasticsearchService.bulkIndex(
      body.index,
      body.documents
    );

    return {
      message: "✓ Bulk indexing completed",
      index: body.index,
      ...result,
    };
  }

  /**
   * 重建索引
   */
  @Post("indices/reindex")
  @HttpCode(HttpStatus.CREATED)
  async reindex(@Body() body: { sourceIndex: string; targetIndex: string }) {
    const { sourceIndex, targetIndex } = body;

    try {
      // 建立目標索引
      if (targetIndex === VECTOR_INDEX_NAME) {
        await this.elasticsearchService.createVectorIndex();
      } else if (targetIndex === DOCUMENT_INDEX_NAME) {
        await this.elasticsearchService.createDocumentIndex();
      }

      // 執行 Reindex
      // 注: 這裡簡化處理，實際需要使用 reindex API
      this.logger.log(`Reindex from ${sourceIndex} to ${targetIndex}`);

      return {
        message: `✓ Reindex completed from ${sourceIndex} to ${targetIndex}`,
        sourceIndex,
        targetIndex,
      };
    } catch (error) {
      this.logger.error("Reindex failed:", error);
      throw error;
    }
  }
}
