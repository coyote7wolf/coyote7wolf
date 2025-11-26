import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../src/app/app.controller";
import { AppService } from "../src/app/service/app.service";
import {
  TaskReasoningService,
  SummarizeProcessor,
  AnalyzeProcessor,
  RecommendProcessor,
} from "../src/app/services/task-reasoning.service";
import { RedisCacheService } from "../src/app/services/redis-cache.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        TaskReasoningService,
        RedisCacheService,
        SummarizeProcessor,
        AnalyzeProcessor,
        RecommendProcessor,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("health", () => {
    it("should return health status", async () => {
      const result = await appController.health();
      expect(result).toHaveProperty("status", "ok");
      expect(result).toHaveProperty("services");
      expect(result).toHaveProperty("timestamp");
    });
  });

  describe("act", () => {
    it("should process a summarize task", async () => {
      const taskRequest = {
        task: "summarize" as const,
        input: "This is a test input for summarization task",
      };

      const result = await appController.act(taskRequest);
      expect(result).toHaveProperty("task_id");
      expect(result).toHaveProperty("task", "summarize");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("result");
    });
  });
});
