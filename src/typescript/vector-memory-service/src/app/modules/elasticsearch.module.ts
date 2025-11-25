import { Module } from "@nestjs/common";
import { ElasticsearchService } from "../services/elasticsearch.service";
import { ElasticsearchController } from "../controllers/elasticsearch.controller";

@Module({
  controllers: [ElasticsearchController],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
