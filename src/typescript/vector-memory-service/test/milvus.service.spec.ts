import { Test, TestingModule } from "@nestjs/testing";
import { MilvusService } from "../src/app/services/milvus.service";
import { MilvusConfig } from "../src/config/milvus.config";

describe("MilvusService", () => {
  let service: MilvusService;
  let module: TestingModule;

  beforeEach(async () => {
    // Mock MilvusConfig.getClient()
    const mockClient = {
      ping: jest.fn().mockResolvedValue({ status: "ok" }),
      getBuildInfo: jest.fn().mockResolvedValue({
        buildTag: "v0.2.16",
        buildDate: "2023-11-11",
        gitCommit: "abc123",
      }),
      hasCollection: jest.fn().mockResolvedValue({ value: false }),
      createCollection: jest.fn().mockResolvedValue({}),
      createIndex: jest.fn().mockResolvedValue({}),
      loadCollectionSync: jest.fn().mockResolvedValue({}),
      releaseCollection: jest.fn().mockResolvedValue({}),
      dropCollection: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      insert: jest.fn().mockResolvedValue({
        IDs: ["1"],
      }),
      upsert: jest.fn().mockResolvedValue({}),
      search: jest.fn().mockResolvedValue({
        results: [
          {
            documentId: "doc1",
            score: 0.95,
            userId: "user1",
            title: "Test Document",
            content: "This is a test document",
            tags: "test,document",
            metadata: "{}",
          },
        ],
      }),
      query: jest.fn().mockResolvedValue([
        {
          documentId: "doc1",
          userId: "user1",
          title: "Test Document",
          content: "This is a test document",
          tags: "test,document",
          metadata: "{}",
        },
      ]),
      getCollectionStatistics: jest.fn().mockResolvedValue({
        row_count: 100,
      }),
    };

    jest.spyOn(MilvusConfig, "getClient").mockReturnValue(mockClient as any);
    jest.spyOn(MilvusConfig, "ping").mockResolvedValue(true);
    jest
      .spyOn(MilvusConfig, "getInfo")
      .mockResolvedValue({ version: "v0.2.16" });

    module = await Test.createTestingModule({
      providers: [MilvusService],
    }).compile();

    service = module.get<MilvusService>(MilvusService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Connection Management", () => {
    it("should successfully ping Milvus", async () => {
      const result = await service.ping();
      expect(result).toBe(true);
    });

    it("should get Milvus info", async () => {
      const result = await service.getInfo();
      expect(result).toHaveProperty("version");
      expect(result.version).toBe("v0.2.16");
    });

    it("should return health status", async () => {
      const result = await service.health();
      expect(result.status).toBe("healthy");
      expect(result.milvus).toBeDefined();
    });
  });

  describe("Index Management", () => {
    it("should create vector collection", async () => {
      await service.createVectorIndex();
      const client = MilvusConfig.getClient();
      expect(client.createCollection).toHaveBeenCalled();
    });

    it("should create document collection", async () => {
      await service.createDocumentIndex();
      const client = MilvusConfig.getClient();
      expect(client.createCollection).toHaveBeenCalled();
    });

    it("should check if collection exists", async () => {
      const exists = await service.collectionExists("test_collection");
      expect(exists).toBe(false);
    });

    it("should delete collection", async () => {
      const client = MilvusConfig.getClient();
      client.hasCollection = jest.fn().mockResolvedValue({ value: true });

      await service.deleteIndex("test_collection");
      expect(client.releaseCollection).toHaveBeenCalled();
      expect(client.dropCollection).toHaveBeenCalled();
    });

    it("should clear collection", async () => {
      const client = MilvusConfig.getClient();
      await service.clearIndex("test_collection");
      expect(client.delete).toHaveBeenCalled();
    });
  });

  describe("Document Operations", () => {
    it("should index a document", async () => {
      const result = await service.indexDocument({
        documentId: "doc1",
        userId: "user1",
        title: "Test Document",
        content: "This is a test document",
        vector: Array(768).fill(0.1),
        tags: ["test", "document"],
        metadata: { source: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("doc1");
    });

    it("should reject invalid vector dimension", async () => {
      await expect(
        service.indexDocument({
          documentId: "doc1",
          userId: "user1",
          title: "Test",
          content: "Test",
          vector: Array(512).fill(0.1), // Wrong dimension
          tags: [],
        })
      ).rejects.toThrow();
    });

    it("should update a document", async () => {
      const result = await service.updateDocument("doc1", {
        title: "Updated Title",
        content: "Updated content",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("doc1");
    });

    it("should delete a document", async () => {
      const result = await service.deleteDocument("doc1");
      expect(result.success).toBe(true);
      expect(result.id).toBe("doc1");
    });

    it("should bulk index documents", async () => {
      const documents = Array.from({ length: 10 }, (_, i) => ({
        documentId: `doc${i}`,
        userId: "user1",
        title: `Document ${i}`,
        content: `Content ${i}`,
        vector: Array(768).fill(0.1),
        tags: [`tag${i}`],
      }));

      const result = await service.bulkIndex(documents);
      expect(result.success).toBe(true);
    });
  });

  describe("Search Operations", () => {
    it("should perform vector search", async () => {
      const result = await service.vectorSearch({
        vector: Array(768).fill(0.1),
        k: 10,
      });

      expect(result.type).toBe("vector_search");
      expect(result.results).toHaveLength(1);
      expect(result.results[0].score).toBe(0.95);
    });

    it("should perform full-text search", async () => {
      const result = await service.fullTextSearch({
        query: "test document",
        fields: ["title", "content"],
        limit: 10,
      });

      expect(result.type).toBe("fulltext_search");
      expect(result.results).toHaveLength(1);
    });

    it("should perform phrase search", async () => {
      const result = await service.phraseSearch({
        phrase: "test document",
        fields: ["title", "content"],
      });

      expect(result.type).toBe("phrase_search");
      expect(result.results).toBeDefined();
    });

    it("should perform prefix search", async () => {
      const result = await service.prefixSearch({
        prefix: "test",
        fields: ["title"],
        limit: 10,
      });

      expect(result.type).toBe("prefix_search");
      expect(result.results).toBeDefined();
    });

    it("should perform hybrid search", async () => {
      const result = await service.hybridSearch({
        vector: Array(768).fill(0.1),
        query: "test document",
        k: 10,
        limit: 10,
        weights: {
          vector: 0.6,
          text: 0.3,
          recency: 0.1,
        },
      });

      expect(result.type).toBe("hybrid_search");
      expect(result.results).toBeDefined();
    });
  });

  describe("Statistics", () => {
    it("should get index statistics", async () => {
      const result = await service.getIndexStats("vectors");
      expect(result.docs_count).toBe(100);
    });

    it("should get cluster statistics", async () => {
      const result = await service.getClusterStats();
      expect(result.status).toBe("green");
    });
  });

  describe("Error Handling", () => {
    it("should handle connection errors gracefully", async () => {
      const client = MilvusConfig.getClient();
      client.ping = jest.fn().mockRejectedValue(new Error("Connection failed"));

      const result = await service.ping();
      expect(result).toBe(false);
    });

    it("should handle index creation errors", async () => {
      const client = MilvusConfig.getClient();
      client.createCollection = jest
        .fn()
        .mockRejectedValue(new Error("Creation failed"));

      await expect(service.createVectorIndex()).rejects.toThrow();
    });

    it("should handle search errors", async () => {
      const client = MilvusConfig.getClient();
      client.search = jest.fn().mockRejectedValue(new Error("Search failed"));

      await expect(
        service.vectorSearch({
          vector: Array(768).fill(0.1),
          k: 10,
        })
      ).rejects.toThrow();
    });
  });
});
