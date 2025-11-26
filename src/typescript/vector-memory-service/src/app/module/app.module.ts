import { Module } from "@nestjs/common";
import { AppController } from "../app.controller";
import { AppService } from "../service/app.service";
import { MemoryService } from "../services/memory.service";
import { VectorStoreService } from "../services/vector-store.service";
import { VectorPoolingService } from "../services/vector-pooling.service";
import { RLHFMemoryService } from "../services/rlhf-memory.service";
import { RLHFMemoryController } from "../rlhf-memory.controller";
import { ElasticsearchModule } from "../modules/elasticsearch.module";
import { MilvusModule } from "../modules/milvus.module";
import { ElasticsearchService } from "../services/elasticsearch.service";
import { ElasticsearchVectorDatabaseAdapter } from "../services/elasticsearch-vector-database.adapter";
import { MilvusService } from "../services/milvus.service";
import {
  VectorDatabaseFactory,
  VectorDatabaseProvider,
} from "../services/vector-database.factory";

@Module({
  imports: [ElasticsearchModule, MilvusModule],
  controllers: [AppController, RLHFMemoryController],
  providers: [
    AppService,
    MemoryService,
    VectorStoreService,
    VectorPoolingService,
    RLHFMemoryService,
    VectorDatabaseFactory,
    ElasticsearchVectorDatabaseAdapter,
    VectorDatabaseProvider,
  ],
})
export class AppModule {}
