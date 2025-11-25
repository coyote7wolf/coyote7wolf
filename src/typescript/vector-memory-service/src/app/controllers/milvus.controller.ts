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
import { MilvusService } from "../services/milvus.service";
import {
  MILVUS_VECTOR_COLLECTION,
  MILVUS_DOCUMENT_COLLECTION,
} from "../../config/milvus-schema";

@Controller("v1/milvus")
export class MilvusController {
  private logger = new Logger("MilvusController");

  constructor(private readonly milvusService: MilvusService) {}

  /**
   * 健康檢查
   */
  @Get("health")
  async health() {
    return await this.milvusService.health();
  }

  /**
   * 獲取統計信息
   */
  @Get("stats")
  async getStats() {
    try {
      const clusterStats = await this.milvusService.getClusterStats();
      const vectorStats = await this.milvusService
        .getIndexStats(MILVUS_VECTOR_COLLECTION)
        .catch(() => null);
      const documentStats = await this.milvusService
        .getIndexStats(MILVUS_DOCUMENT_COLLECTION)
        .catch(() => null);

      return {
        cluster: clusterStats,
        indices: {
          [MILVUS_VECTOR_COLLECTION]: vectorStats,
          [MILVUS_DOCUMENT_COLLECTION]: documentStats,
        },
      };
    } catch (error) {
      this.logger.error("Failed to get stats:", error);
      throw error;
    }
  }

  /**
   * 建立向量集合
   */
  @Post("indices/embeddings/create")
  @HttpCode(HttpStatus.CREATED)
  async createVectorIndex() {
    await this.milvusService.createVectorIndex();
    return {
      message: "✓ Vector collection created successfully",
      collection: MILVUS_VECTOR_COLLECTION,
    };
  }

  /**
   * 建立文檔集合
   */
  @Post("indices/documents/create")
  @HttpCode(HttpStatus.CREATED)
  async createDocumentIndex() {
    await this.milvusService.createDocumentIndex();
    return {
      message: "✓ Document collection created successfully",
      collection: MILVUS_DOCUMENT_COLLECTION,
    };
  }

  /**
   * 刪除集合
   */
  @Delete("indices/:collectionName")
  async deleteIndex(@Param("collectionName") collectionName: string) {
    await this.milvusService.deleteIndex(collectionName);
    return {
      message: `✓ Collection deleted: ${collectionName}`,
    };
  }

  /**
   * 向量搜尋 (kNN)
   */
  @Post("search/vectors")
  async vectorSearch(@Body() body: any) {
    return await this.milvusService.vectorSearch(body);
  }

  /**
   * 全文搜尋
   */
  @Post("search/fulltext")
  async fullTextSearch(@Body() body: any) {
    return await this.milvusService.fullTextSearch(body);
  }

  /**
   * 短語搜尋
   */
  @Post("search/phrase")
  async phraseSearch(@Body() body: any) {
    return await this.milvusService.phraseSearch(body);
  }

  /**
   * 前綴搜尋
   */
  @Post("search/prefix")
  async prefixSearch(@Body() body: any) {
    return await this.milvusService.prefixSearch(body);
  }

  /**
   * 混合搜尋 (向量 + 全文 + 過濾)
   */
  @Post("search/hybrid")
  async hybridSearch(@Body() body: any) {
    return await this.milvusService.hybridSearch(body);
  }

  /**
   * 索引文檔
   */
  @Post("documents/vector")
  @HttpCode(HttpStatus.CREATED)
  async indexDocument(@Body() body: any) {
    return await this.milvusService.indexDocument(body);
  }

  /**
   * 更新文檔
   */
  @Put("documents/vectors/:documentId")
  async updateDocument(
    @Param("documentId") documentId: string,
    @Body() body: any
  ) {
    return await this.milvusService.updateDocument(documentId, body);
  }

  /**
   * 刪除文檔
   */
  @Delete("documents/vectors/:documentId")
  async deleteDocument(@Param("documentId") documentId: string) {
    return await this.milvusService.deleteDocument(documentId);
  }

  /**
   * 批量索引文檔
   */
  @Post("documents/bulk")
  @HttpCode(HttpStatus.CREATED)
  async bulkIndex(@Body() body: { documents: any[] }) {
    return await this.milvusService.bulkIndex(body.documents);
  }

  /**
   * 清空集合
   */
  @Post("indices/:collectionName/clear")
  async clearIndex(@Param("collectionName") collectionName: string) {
    await this.milvusService.clearIndex(collectionName);
    return {
      message: `✓ Collection cleared: ${collectionName}`,
    };
  }

  /**
   * 獲取集合統計
   */
  @Get("indices/:collectionName/stats")
  async getIndexStats(@Param("collectionName") collectionName: string) {
    const stats = await this.milvusService.getIndexStats(collectionName);
    return {
      collection: collectionName,
      stats,
    };
  }
}
