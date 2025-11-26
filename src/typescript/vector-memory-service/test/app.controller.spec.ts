import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../src/app/app.controller";
import { AppService } from "../src/app/service/app.service";
import { MemoryService } from "../src/app/services/memory.service";
import { VectorStoreService } from "../src/app/services/vector-store.service";
import { VectorPoolingService } from "../src/app/services/vector-pooling.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        MemoryService,
        VectorStoreService,
        VectorPoolingService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("health", () => {
    it("should return health status", async () => {
      const result = await appController.health();
      expect(result).toHaveProperty("status", "ok");
      expect(result).toHaveProperty("services");
      expect(result).toHaveProperty("metrics");
    });
  });

  describe("embedding", () => {
    it("should generate embeddings with mean pooling", async () => {
      const request = {
        input: ["test text 1", "test text 2"],
        pooling: "mean" as const,
        dimension: 768,
      };

      const result = await appController.embedding(request);
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("pooling_strategy", "mean");
      expect(result.data).toHaveLength(2);
    });
  });

  describe("search", () => {
    it("should search documents", async () => {
      const request = {
        query: "artificial intelligence",
        limit: 5,
        threshold: 0.1,
      };

      const result = await appController.search(request);
      expect(result).toHaveProperty("matches");
      expect(Array.isArray(result.matches)).toBe(true);
    });
  });
});
