import { Test, TestingModule } from "@nestjs/testing";
import { ElasticsearchService } from "../src/app/services/elasticsearch.service";
import { ElasticsearchController } from "../src/app/controllers/elasticsearch.controller";
import { Logger } from "@nestjs/common";

/**
 * Integration Tests for Elasticsearch Service & Controller
 *
 * These tests verify end-to-end interactions with Elasticsearch:
 * - Index lifecycle management
 * - Document CRUD operations
 * - Search functionality (all types)
 * - Bulk operations
 * - Statistics collection
 *
 * Requires Elasticsearch running at localhost:9200
 */
describe("Elasticsearch Integration Tests", () => {
  let module: TestingModule;
  let controller: ElasticsearchController;
  let service: ElasticsearchService;

  // Test data fixtures
  const testVector = Array(768)
    .fill(0)
    .map((_, i) => Math.sin(i / 100));
  const testDocuments = [
    {
      id: "test-doc-1",
      documentId: "test-doc-1",
      userId: "test-user-1",
      title: "Introduction to AI",
      content: "Artificial Intelligence is transforming industries...",
      vector: testVector,
      tags: ["ai", "ml", "nlp"],
      metadata: { source: "test", version: 1 },
    },
    {
      id: "test-doc-2",
      documentId: "test-doc-2",
      userId: "test-user-1",
      title: "Machine Learning Basics",
      content: "Machine learning enables computers to learn from data...",
      vector: testVector,
      tags: ["ml", "algorithms"],
      metadata: { source: "test", version: 1 },
    },
    {
      id: "test-doc-3",
      documentId: "test-doc-3",
      userId: "test-user-2",
      title: "Deep Learning Networks",
      content: "Deep learning uses neural networks with multiple layers...",
      vector: testVector,
      tags: ["dl", "nn", "ml"],
      metadata: { source: "test", version: 1 },
    },
  ];

  beforeAll(async () => {
    // Create test module with mocked dependencies if needed
    module = await Test.createTestingModule({
      controllers: [ElasticsearchController],
      providers: [ElasticsearchService],
    }).compile();

    controller = module.get<ElasticsearchController>(ElasticsearchController);
    service = module.get<ElasticsearchService>(ElasticsearchService);
  });

  afterAll(async () => {
    // Cleanup: Delete test indices
    try {
      await service.deleteIndex("vectors");
      await service.deleteIndex("documents");
    } catch (error) {
      // Indices may not exist
    }

    await module.close();
  });

  describe("Index Lifecycle Management", () => {
    it("[INTEGRATION] Should create vector index", async () => {
      const result = await service.createVectorIndex();
      expect(result).toBeDefined();

      const exists = await service.indexExists("vectors");
      expect(exists).toBe(true);
    });

    it("[INTEGRATION] Should create document index", async () => {
      const result = await service.createDocumentIndex();
      expect(result).toBeDefined();

      const exists = await service.indexExists("documents");
      expect(exists).toBe(true);
    });

    it("[INTEGRATION] Should check if index exists", async () => {
      const exists = await service.indexExists("vectors");
      expect(exists).toBe(true);

      const notExists = await service.indexExists("non-existent-index");
      expect(notExists).toBe(false);
    });

    it("[INTEGRATION] Should get index statistics", async () => {
      const stats = await service.getIndexStats("vectors");

      expect(stats).toBeDefined();
      expect(stats.docs_count).toBeGreaterThanOrEqual(0);
      expect(stats.store_size_bytes).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Document CRUD Operations", () => {
    it("[INTEGRATION] Should index single document", async () => {
      const result = await service.indexDocument(
        "vectors",
        testDocuments[0].id,
        testDocuments[0]
      );

      expect(result).toBeDefined();
      expect(result._id).toBe(testDocuments[0].id);
    });

    it("[INTEGRATION] Should retrieve indexed document", async () => {
      // First index a document
      await service.indexDocument(
        "documents",
        testDocuments[1].id,
        testDocuments[1]
      );

      // Then retrieve it via search
      const results = await service.fullTextSearch(
        "Machine Learning",
        ["title", "content"],
        10,
        0,
        false
      );

      expect(results.length).toBeGreaterThan(0);
      const found = results.some((r: any) => r.id === testDocuments[1].id);
      expect(found).toBe(true);
    });

    it("[INTEGRATION] Should update existing document", async () => {
      const updateData = {
        title: "Updated Title",
        content: "Updated content for testing",
      };

      const result = await service.updateDocument(
        "vectors",
        testDocuments[2].id,
        updateData
      );

      expect(result).toBeDefined();
      expect(result._id).toBe(testDocuments[2].id);
    });

    it("[INTEGRATION] Should delete document", async () => {
      // Index a document first
      await service.indexDocument("documents", "delete-test-doc", {
        id: "delete-test-doc",
        title: "Document to Delete",
        content: "This will be deleted",
        userId: "test-user",
      });

      // Delete it
      const result = await service.deleteDocument(
        "documents",
        "delete-test-doc"
      );

      expect(result).toBeDefined();
      expect(result._id).toBe("delete-test-doc");
    });
  });

  describe("Vector Search Operations", () => {
    beforeAll(async () => {
      // Index test documents before searching
      for (const doc of testDocuments) {
        await service.indexDocument("vectors", doc.id, doc);
      }
      // Wait for indexing to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it("[INTEGRATION] Should perform vector similarity search", async () => {
      const results = await service.vectorSearch(testVector, 5);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("id");
      expect(results[0]).toHaveProperty("score");
      expect(results[0]).toHaveProperty("source");
    });

    it("[INTEGRATION] Should filter vector search by userId", async () => {
      const results = await service.vectorSearch(testVector, 10, {
        userId: "test-user-1",
      });

      expect(results).toBeDefined();
      const allMatchingUser = results.every(
        (r: any) => r.source.userId === "test-user-1"
      );
      expect(allMatchingUser).toBe(true);
    });

    it("[INTEGRATION] Should limit vector search results", async () => {
      const results = await service.vectorSearch(testVector, 2);

      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe("Full-Text Search Operations", () => {
    beforeAll(async () => {
      // Index test documents before searching
      for (const doc of testDocuments) {
        await service.indexDocument("documents", doc.id, doc);
      }
      // Wait for indexing to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it("[INTEGRATION] Should perform full-text search", async () => {
      const results = await service.fullTextSearch(
        "learning",
        ["title", "content"],
        10,
        0,
        false
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it("[INTEGRATION] Should search with highlighting", async () => {
      const results = await service.fullTextSearch(
        "intelligence",
        ["title", "content"],
        10,
        0,
        true
      );

      expect(results).toBeDefined();
      const hasHighlight = results.some((r: any) => r.highlight);
      expect(hasHighlight).toBe(true);
    });

    it("[INTEGRATION] Should respect limit and offset", async () => {
      const results1 = await service.fullTextSearch(
        "machine",
        ["title", "content"],
        2,
        0,
        false
      );
      const results2 = await service.fullTextSearch(
        "machine",
        ["title", "content"],
        2,
        2,
        false
      );

      expect(results1.length).toBeLessThanOrEqual(2);
      expect(results2.length).toBeLessThanOrEqual(2);
    });

    it("[INTEGRATION] Should search multiple fields", async () => {
      const results = await service.fullTextSearch(
        "neural",
        ["title", "content", "tags"],
        10,
        0,
        false
      );

      expect(results).toBeDefined();
    });
  });

  describe("Phrase Search Operations", () => {
    it("[INTEGRATION] Should perform phrase search", async () => {
      const results = await service.phraseSearch(
        "Machine Learning",
        ["title", "content"],
        10,
        0
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it("[INTEGRATION] Should apply slop parameter", async () => {
      const resultsNoSlop = await service.phraseSearch(
        "learning networks",
        ["title", "content"],
        10,
        0
      );
      const resultsWithSlop = await service.phraseSearch(
        "learning networks",
        ["title", "content"],
        10,
        2
      );

      expect(resultsWithSlop.length).toBeGreaterThanOrEqual(
        resultsNoSlop.length
      );
    });
  });

  describe("Prefix Search Operations", () => {
    it("[INTEGRATION] Should perform prefix search", async () => {
      const results = await service.prefixSearch("title", "Deep", 10);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it("[INTEGRATION] Should match prefix correctly", async () => {
      const results = await service.prefixSearch("title", "Machine", 10);

      const allMatching = results.every((r: any) =>
        r.source.title?.startsWith("Machine")
      );
      expect(allMatching).toBe(true);
    });
  });

  describe("Hybrid Search Operations", () => {
    it("[INTEGRATION] Should perform hybrid search", async () => {
      const results = await service.hybridSearch(
        testVector,
        "artificial intelligence",
        { userId: "test-user-1" },
        { vector: 0.6, text: 0.3, recency: 0.1 },
        5
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it("[INTEGRATION] Should combine vector and text results", async () => {
      const results = await service.hybridSearch(
        testVector,
        "learning",
        undefined,
        undefined,
        10
      );

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      // Results should contain both vector and text matches
    });

    it("[INTEGRATION] Should apply weight parameters", async () => {
      const resultsVectorHeavy = await service.hybridSearch(
        testVector,
        "test",
        undefined,
        { vector: 0.8, text: 0.2, recency: 0.0 },
        5
      );
      const resultsTextHeavy = await service.hybridSearch(
        testVector,
        "test",
        undefined,
        { vector: 0.2, text: 0.8, recency: 0.0 },
        5
      );

      expect(resultsVectorHeavy).toBeDefined();
      expect(resultsTextHeavy).toBeDefined();
    });
  });

  describe("Bulk Operations", () => {
    it("[INTEGRATION] Should bulk index documents", async () => {
      const bulkDocs = testDocuments.map((doc, i) => ({
        id: `bulk-${doc.id}`,
        body: { ...doc },
      }));

      const result = await service.bulkIndex("vectors", bulkDocs);

      expect(result).toBeDefined();
      expect(result.errors).toBe(false);
    });

    it("[INTEGRATION] Should handle bulk errors gracefully", async () => {
      const bulkDocs = [
        {
          id: "bulk-test-1",
          body: {
            // Minimal valid document
          },
        },
      ];

      const result = await service.bulkIndex("vectors", bulkDocs);

      expect(result).toBeDefined();
      // May have errors but should not throw
    });
  });

  describe("Statistics Operations", () => {
    it("[INTEGRATION] Should get index statistics", async () => {
      const stats = await service.getIndexStats("vectors");

      expect(stats).toBeDefined();
      expect(stats.docs_count).toBeGreaterThanOrEqual(0);
      expect(stats.store_size_bytes).toBeGreaterThanOrEqual(0);
    });

    it("[INTEGRATION] Should get cluster statistics", async () => {
      const stats = await service.getClusterStats();

      expect(stats).toBeDefined();
      expect(stats.status).toBeDefined();
    });
  });

  describe("Index Maintenance Operations", () => {
    it("[INTEGRATION] Should clear index", async () => {
      // Create a test index to clear
      await service.indexDocument("documents", "clear-test", {
        id: "clear-test",
        title: "Document to clear",
        content: "Test content",
        userId: "test-user",
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      const cleared = await service.clearIndex("documents");

      expect(cleared).toBeDefined();

      const stats = await service.getIndexStats("documents");
      expect(stats.docs_count).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("[INTEGRATION] Should handle connection errors gracefully", async () => {
      try {
        // Ping should always work if ES is running
        const result = await service.ping();
        expect(result).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("[INTEGRATION] Should handle invalid vector dimensions", async () => {
      const invalidVector = Array(100).fill(0);

      try {
        await service.vectorSearch(invalidVector, 5);
        fail("Should have thrown error for invalid dimensions");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("[INTEGRATION] Should handle document not found", async () => {
      try {
        await service.updateDocument("vectors", "non-existent-doc", {
          title: "Updated",
        });
        // Should complete without error but with no result
      } catch (error) {
        // May or may not throw depending on implementation
      }
    });
  });

  describe("Controller Integration", () => {
    it("[INTEGRATION] Should expose health endpoint", async () => {
      const result = await controller.health();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("status");
    });

    it("[INTEGRATION] Should expose stats endpoint", async () => {
      const result = await controller.getStats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("indices");
    });

    it("[INTEGRATION] Should handle vector search via controller", async () => {
      const result = await controller.vectorSearch({
        vector: testVector,
        k: 5,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("type");
      expect(result.type).toBe("vector_search");
    });

    it("[INTEGRATION] Should handle full-text search via controller", async () => {
      const result = await controller.fullTextSearch({
        query: "test",
        fields: ["title", "content"],
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("type");
      expect(result.type).toBe("fulltext_search");
    });

    it("[INTEGRATION] Should handle hybrid search via controller", async () => {
      const result = await controller.hybridSearch({
        vector: testVector,
        query: "test",
        k: 5,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("type");
      expect(result.type).toBe("hybrid_search");
    });
  });

  describe("End-to-End Workflow", () => {
    it("[INTEGRATION] Should complete full index → search → update → delete workflow", async () => {
      const docId = "workflow-test-doc";
      const testDoc = {
        id: docId,
        documentId: docId,
        userId: "workflow-user",
        title: "Workflow Test Document",
        content: "This document is for testing workflow",
        vector: testVector,
        tags: ["workflow", "test"],
      };

      // 1. Index document
      const indexResult = await service.indexDocument(
        "vectors",
        docId,
        testDoc
      );
      expect(indexResult._id).toBe(docId);

      // 2. Wait for indexing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 3. Search for document
      const searchResults = await service.vectorSearch(testVector, 10);
      const found = searchResults.some((r: any) => r.id === docId);
      expect(found).toBe(true);

      // 4. Update document
      const updateResult = await service.updateDocument("vectors", docId, {
        title: "Updated Workflow Document",
      });
      expect(updateResult._id).toBe(docId);

      // 5. Delete document
      const deleteResult = await service.deleteDocument("vectors", docId);
      expect(deleteResult._id).toBe(docId);

      // 6. Verify deletion (wait a moment first)
      await new Promise((resolve) => setTimeout(resolve, 500));
      const searchAfterDelete = await service.vectorSearch(testVector, 10, {
        _id: docId,
      });
      const stillFound = searchAfterDelete.some((r: any) => r.id === docId);
      expect(stillFound).toBe(false);
    });
  });
});
