import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AppController } from "../app.controller";
import { AppService } from "../service/app.service";
import { RAGOrchestrationService } from "../service/rag-orchestration.service";
import { LLMAdapterClient } from "../clients/llm-adapter.client";
import { MemoryServiceClient } from "../clients/memory-service.client";
import { AgentServiceClient } from "../clients/agent-service.client";
import { RLHFOrchestrationService } from "../services/rlhf-orchestration.service";
import { RLHFOrchestrationController } from "../rlhf-orchestration.controller";

@Module({
  imports: [HttpModule],
  controllers: [AppController, RLHFOrchestrationController],
  providers: [
    AppService,
    RAGOrchestrationService,
    RLHFOrchestrationService,
    LLMAdapterClient,
    MemoryServiceClient,
    AgentServiceClient,
  ],
})
export class AppModule {}
