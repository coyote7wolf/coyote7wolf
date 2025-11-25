import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "./elasticsearch.service";
import { ElasticsearchVectorDatabaseAdapter } from "./elasticsearch-vector-database.adapter";
import { MilvusService } from "./milvus.service";
import { IVectorDatabase } from "../interfaces/vector-database.interface";

/**
 * Vector Database 工廠
 *
 * 根據環境變量 VECTOR_DB_TYPE 選擇具體的 Vector DB 實現
 * 支持: elasticsearch, milvus
 */
@Injectable()
export class VectorDatabaseFactory {
  private logger = new Logger("VectorDatabaseFactory");

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly elasticsearchAdapter: ElasticsearchVectorDatabaseAdapter,
    private readonly milvusService: MilvusService
  ) {}

  /**
   * 根據配置創建 Vector Database 實例
   */
  createVectorDatabase(): IVectorDatabase {
    const dbType = (
      process.env.VECTOR_DB_TYPE || "elasticsearch"
    ).toLowerCase();

    this.logger.log(`Creating Vector Database: ${dbType}`);

    switch (dbType) {
      case "elasticsearch":
        this.logger.log("Using Elasticsearch as Vector Database");
        return this.elasticsearchAdapter;

      case "milvus":
        this.logger.log("Using Milvus as Vector Database");
        return this.milvusService;

      default:
        this.logger.warn(
          `Unknown Vector DB type: ${dbType}, defaulting to Elasticsearch`
        );
        return this.elasticsearchAdapter;
    }
  }

  /**
   * 獲取支持的 Vector Database 類型列表
   */
  getSupportedTypes(): string[] {
    return ["elasticsearch", "milvus"];
  }

  /**
   * 驗證 Vector DB 類型是否有效
   */
  isValidType(dbType: string): boolean {
    return this.getSupportedTypes().includes(dbType.toLowerCase());
  }
}

/**
 * Vector Database 提供者
 * 用於 NestJS 依賴注入
 */
export const VectorDatabaseProvider = {
  provide: "VectorDatabase",
  useFactory: (factory: VectorDatabaseFactory) => {
    return factory.createVectorDatabase();
  },
  inject: [VectorDatabaseFactory],
};
