import { Test, TestingModule } from "@nestjs/testing";
import { ElasticsearchService } from "./elasticsearch.service";
import { Client } from "@elastic/elasticsearch";

// Mock Elasticsearch Client
jest.mock("@elastic/elasticsearch", () => ({
  Client: jest.fn(),
}));

// Mock ElasticsearchConfig
jest.mock("../../config/elasticsearch.config", () => ({
  ElasticsearchConfig: {
    getClient: jest.fn(),
  },
}));

describe("ElasticsearchService", () => {
  let service: ElasticsearchService;
  let mockClient: jest.Mocked<Client>;

  const mockVectorData = Array(768).fill(0.5);

  beforeEach(async () => {
    mockClient = {
      ping: jest.fn().mockResolvedValue(true),
      info: jest.fn().mockResolvedValue({
        version: { number: "8.11.0" },
        name: "elasticsearch",
        cluster_name: "elasticsearch",
      }),
      indices: {
        exists: jest.fn().mockResolvedValue(true),
        create: jest.fn().mockResolvedValue({
          acknowledged: true,
          shards_acknowledged: true,
          index: "embeddings",
        }),
        delete: jest.fn().mockResolvedValue({ acknowledged: true }),
        stats: jest.fn().mockResolvedValue({
          indices: {
            embeddings: {
              status: "green",
              primaries: {
                docs: { count: 100 },
                store: { size_in_bytes: 1024000 },
              },
            },
          },
        }),
        getMapping: jest.fn().mockResolvedValue({
          body: {
            embeddings: {
              mappings: {
                properties: {
                  id: { type: "keyword" },
                  vector: { type: "dense_vector" },
                },
              },
            },
          },
        }),
      },
      index: jest.fn().mockResolvedValue({ _id: "doc1" }),
      update: jest.fn().mockResolvedValue({ _id: "doc1" }),
      delete: jest.fn().mockResolvedValue({ _id: "doc1" }),
      search: jest.fn().mockResolvedValue({
        hits: {
          total: { value: 10 },
          hits: [
            {
              _id: "doc1",
              _score: 0.95,
              _source: { content: "test document" },
            },
          ],
        },
      }),
      bulk: jest.fn().mockResolvedValue({
        errors: false,
        items: [],
      }),
      cluster: {
        stats: jest.fn().mockResolvedValue({
          status: "green",
          nodes: { count: { total: 1 } },
          indices: { count: 2, docs: { count: 1000 } },
        }),
      },
      deleteByQuery: jest.fn().mockResolvedValue({
        deleted: 100,
      }),
    } as any;

    // Mock ElasticsearchConfig.getClient
    const {
      ElasticsearchConfig,
    } = require("../../config/elasticsearch.config");
    ElasticsearchConfig.getClient.mockReturnValue(mockClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [ElasticsearchService],
    }).compile();

    service = module.get<ElasticsearchService>(ElasticsearchService);
  });

  describe("ping", () => {
    it("should return true when connected", async () => {
      const result = await service.ping();
      expect(result).toBe(true);
      expect(mockClient.ping).toHaveBeenCalled();
    });

    it("should return false when connection fails", async () => {
      mockClient.ping.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await service.ping();
      expect(result).toBe(false);
    });
  });

  describe("getInfo", () => {
    it("should return Elasticsearch info", async () => {
      const info = await service.getInfo();
      expect(info).toEqual({
        version: "8.11.0",
        name: "elasticsearch",
        cluster_name: "elasticsearch",
      });
    });
  });

  describe("indexExists", () => {
    it("should return true if index exists", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      const result = await service.indexExists("embeddings");
      expect(result).toBe(true);
    });

    it("should return false if index does not exist", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(false);
      const result = await service.indexExists("embeddings");
      expect(result).toBe(false);
    });
  });

  describe("createVectorIndex", () => {
    it("should create vector index successfully", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(false);
      await service.createVectorIndex();
      expect(mockClient.indices.create).toHaveBeenCalled();
    });

    it("should delete existing index before creating new one", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      await service.createVectorIndex();
      expect(mockClient.indices.delete).toHaveBeenCalled();
      expect(mockClient.indices.create).toHaveBeenCalled();
    });
  });

  describe("createDocumentIndex", () => {
    it("should create document index successfully", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(false);
      await service.createDocumentIndex();
      expect(mockClient.indices.create).toHaveBeenCalled();
    });
  });

  describe("deleteIndex", () => {
    it("should delete index successfully", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      await service.deleteIndex("embeddings");
      expect(mockClient.indices.delete).toHaveBeenCalled();
    });

    it("should throw error if index does not exist", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(false);
      await expect(service.deleteIndex("embeddings")).rejects.toThrow();
    });
  });

  describe("indexDocument", () => {
    it("should index document successfully", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      const result = await service.indexDocument("embeddings", "doc1", {
        content: "test",
      });
      expect(mockClient.index).toHaveBeenCalledWith(
        expect.objectContaining({
          index: "embeddings",
          id: "doc1",
        })
      );
    });

    it("should throw error if index does not exist", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(false);
      await expect(
        service.indexDocument("embeddings", "doc1", { content: "test" })
      ).rejects.toThrow();
    });
  });

  describe("updateDocument", () => {
    it("should update document successfully", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      await service.updateDocument("embeddings", "doc1", {
        content: "updated",
      });
      expect(mockClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          index: "embeddings",
          id: "doc1",
        })
      );
    });
  });

  describe("deleteDocument", () => {
    it("should delete document successfully", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      await service.deleteDocument("embeddings", "doc1");
      expect(mockClient.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          index: "embeddings",
          id: "doc1",
        })
      );
    });
  });

  describe("vectorSearch", () => {
    it("should perform vector search successfully", async () => {
      mockClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            {
              _id: "doc1",
              _score: 0.95,
              _source: { content: "test" },
            },
          ],
        },
      });

      const results = await service.vectorSearch(mockVectorData, 10);
      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(0.95);
    });

    it("should throw error for invalid vector dimensions", async () => {
      const invalidVector = Array(512).fill(0.5);
      await expect(service.vectorSearch(invalidVector, 10)).rejects.toThrow();
    });

    it("should support filters in vector search", async () => {
      mockClient.search.mockResolvedValueOnce({
        hits: { hits: [] },
      });

      await service.vectorSearch(mockVectorData, 10, { userId: "user1" });
      expect(mockClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            query: expect.objectContaining({
              knn: expect.objectContaining({
                vector: expect.objectContaining({
                  filter: expect.any(Object),
                }),
              }),
            }),
          }),
        })
      );
    });
  });

  describe("fullTextSearch", () => {
    it("should perform full-text search successfully", async () => {
      mockClient.search.mockResolvedValueOnce({
        hits: {
          total: { value: 1 },
          hits: [
            {
              _id: "doc1",
              _score: 0.95,
              _source: { content: "test document" },
              highlight: { content: ["<em>test</em> document"] },
            },
          ],
        },
      });

      const result = await service.fullTextSearch("test", ["content"]);
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it("should throw error for empty query", async () => {
      await expect(service.fullTextSearch("")).rejects.toThrow();
    });

    it("should support pagination", async () => {
      mockClient.search.mockResolvedValueOnce({
        hits: { total: { value: 100 }, hits: [] },
      });

      await service.fullTextSearch("test", ["content"], 20, 40);
      expect(mockClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            size: 20,
            from: 40,
          }),
        })
      );
    });
  });

  describe("phraseSearch", () => {
    it("should perform phrase search successfully", async () => {
      mockClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            {
              _id: "doc1",
              _score: 0.95,
              _source: { content: "exact phrase match" },
            },
          ],
        },
      });

      const results = await service.phraseSearch("exact phrase", ["content"]);
      expect(results).toHaveLength(1);
    });
  });

  describe("prefixSearch", () => {
    it("should perform prefix search successfully", async () => {
      mockClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            {
              _id: "doc1",
              _score: 0.95,
              _source: { title: "elasticsearch" },
            },
          ],
        },
      });

      const results = await service.prefixSearch("title", "elastic");
      expect(results).toHaveLength(1);
    });
  });

  describe("hybridSearch", () => {
    it("should perform hybrid search combining vector and full-text", async () => {
      mockClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            {
              _id: "doc1",
              _score: 0.95,
              _source: { content: "test" },
            },
          ],
        },
      } as any);

      mockClient.search.mockResolvedValueOnce({
        hits: {
          total: { value: 1 },
          hits: [
            {
              _id: "doc1",
              _score: 0.85,
              _source: { content: "test document" },
            },
          ],
        },
      } as any);

      const results = await service.hybridSearch(
        mockVectorData,
        "test",
        {},
        {},
        10
      );
      expect(results).toBeDefined();
    });
  });

  describe("bulkIndex", () => {
    it("should bulk index documents successfully", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      mockClient.bulk.mockResolvedValueOnce({
        errors: false,
        items: [],
      } as any);

      const documents = [
        { id: "doc1", body: { content: "test1" } },
        { id: "doc2", body: { content: "test2" } },
      ];

      const result = await service.bulkIndex("embeddings", documents);
      expect(result.indexed).toBe(2);
    });
  });

  describe("getIndexStats", () => {
    it("should return index statistics", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      const stats = await service.getIndexStats("embeddings");
      expect(stats.index).toBe("embeddings");
      expect(stats.documentCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getClusterStats", () => {
    it("should return cluster statistics", async () => {
      const stats = await service.getClusterStats();
      expect(stats.status).toBe("green");
      expect(stats.nodeCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("clearIndex", () => {
    it("should clear all documents from index", async () => {
      mockClient.indices.exists.mockResolvedValueOnce(true);
      await service.clearIndex("embeddings");
      expect(mockClient.deleteByQuery).toHaveBeenCalled();
    });
  });
});
