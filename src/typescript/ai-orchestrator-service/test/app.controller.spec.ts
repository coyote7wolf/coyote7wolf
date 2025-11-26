import { Test, TestingModule } from "@nestjs/testing";
import { HttpModule } from "@nestjs/axios";
import { AppController } from "../src/app/app.controller";
import { AppService } from "../src/app/service/app.service";
import { RAGOrchestrationService } from "../src/app/service/rag-orchestration.service";
import { LLMAdapterClient } from "../src/app/clients/llm-adapter.client";
import { MemoryServiceClient } from "../src/app/clients/memory-service.client";
import { AgentServiceClient } from "../src/app/clients/agent-service.client";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [AppController],
      providers: [
        AppService,
        RAGOrchestrationService,
        LLMAdapterClient,
        MemoryServiceClient,
        AgentServiceClient,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("trigger", () => {
    it("should return mock response for unknown type", async () => {
      const result = await appController.trigger({ type: "unknown" });
      expect(result).toEqual({
        status: "ok",
        result: { mock: true, type: "unknown" },
      });
    });
  });

  describe("mockEvent", () => {
    it("should return mock event result", async () => {
      const result = await appController.mockEvent({});
      expect(result).toHaveProperty("query");
      expect(result).toHaveProperty("response");
    });
  });
});
