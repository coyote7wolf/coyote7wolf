import { Module } from "@nestjs/common";
import { AppController } from "../app.controller";
import { AppService } from "../service/app.service";
import {
  TaskReasoningService,
  SummarizeProcessor,
  AnalyzeProcessor,
  RecommendProcessor,
} from "../services/task-reasoning.service";
import { RedisCacheService } from "../services/redis-cache.service";

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    TaskReasoningService,
    RedisCacheService,
    SummarizeProcessor,
    AnalyzeProcessor,
    RecommendProcessor,
  ],
})
export class AppModule {}
