import { Module, OnModuleInit } from "@nestjs/common";
import { MilvusService } from "../services/milvus.service";
import { MilvusController } from "../controllers/milvus.controller";
import { MilvusConfig } from "../../config/milvus.config";

/**
 * Milvus 模組
 *
 * 提供 Milvus 向量數據庫的集成
 * 負責初始化連接、管理生命週期
 */
@Module({
  controllers: [MilvusController],
  providers: [MilvusService],
  exports: [MilvusService],
})
export class MilvusModule implements OnModuleInit {
  async onModuleInit() {
    try {
      // 初始化 Milvus 連接
      await MilvusConfig.initialize();
    } catch (error) {
      console.error("Failed to initialize Milvus module:", error);
      // 允許模組加載失敗，但記錄錯誤
    }
  }
}
