import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { ElasticsearchService } from "../services/elasticsearch.service";

/**
 * RabbitMQ Consumer for Elasticsearch Index Synchronization
 *
 * Listens to memory service events and syncs to Elasticsearch indices:
 * - memory.upsert: Index or update documents
 * - memory.delete: Remove documents from indices
 *
 * Supports batch processing with error resilience.
 */
@Controller()
export class ElasticsearchConsumer {
  private readonly logger = new Logger(ElasticsearchConsumer.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * Handle document upsert events
   * Index new or update existing documents in Elasticsearch
   *
   * Event structure:
   * {
   *   documentId: string,
   *   userId: string,
   *   title: string,
   *   content: string,
   *   vector: number[], // 768-dimensional
   *   tags: string[],
   *   metadata: Record<string, any>,
   *   source: string,
   *   timestamp: number
   * }
   */
  @MessagePattern("memory.upsert")
  async handleMemoryUpsert(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.debug(`[UPSERT] Received memory event: ${data.documentId}`);

      const {
        documentId,
        userId,
        title,
        content,
        vector,
        tags,
        metadata,
        source,
        timestamp,
      } = data;

      // Validate required fields
      if (!documentId || !userId) {
        this.logger.error("[UPSERT] Missing documentId or userId", { data });
        context.getChannelRef().ack(context.getMessage());
        return;
      }

      // Validate vector dimensions (must be 768 for dense_vector)
      if (!vector || vector.length !== 768) {
        this.logger.warn(
          `[UPSERT] Invalid vector dimensions for ${documentId}: expected 768, got ${vector?.length}`,
          {
            documentId,
          }
        );
      }

      // Index to vector index (if valid vector)
      if (vector && vector.length === 768) {
        try {
          await this.elasticsearchService.indexDocument("vectors", documentId, {
            documentId,
            userId,
            title: title || "",
            content: content || "",
            vector,
            tags: tags || [],
            metadata: metadata || {},
            source: source || "memory-service",
            createdAt: timestamp || Date.now(),
            updatedAt: Date.now(),
          });
          this.logger.debug(`[UPSERT] Indexed to vectors: ${documentId}`);
        } catch (error) {
          this.logger.error(
            `[UPSERT] Failed to index to vectors: ${documentId}`,
            error
          );
          throw error;
        }
      }

      // Index to document index (if has content)
      if (content) {
        try {
          await this.elasticsearchService.indexDocument(
            "documents",
            documentId,
            {
              id: documentId,
              title: title || "",
              content: content || "",
              userId,
              tags: tags || [],
              status: "published",
              metadata: metadata || {},
              source: source || "memory-service",
              createdAt: timestamp || Date.now(),
              updatedAt: Date.now(),
            }
          );
          this.logger.debug(`[UPSERT] Indexed to documents: ${documentId}`);
        } catch (error) {
          this.logger.error(
            `[UPSERT] Failed to index to documents: ${documentId}`,
            error
          );
          throw error;
        }
      }

      // Acknowledge message
      context.getChannelRef().ack(context.getMessage());
      this.logger.debug(`[UPSERT] Successfully processed: ${documentId}`);
    } catch (error) {
      this.logger.error("[UPSERT] Error processing memory upsert event", error);
      // NACK the message to requeue for retry
      context.getChannelRef().nack(context.getMessage(), false, true);
    }
  }

  /**
   * Handle document delete events
   * Remove documents from Elasticsearch indices
   *
   * Event structure:
   * {
   *   documentId: string,
   *   userId: string,
   *   timestamp: number
   * }
   */
  @MessagePattern("memory.delete")
  async handleMemoryDelete(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.debug(
        `[DELETE] Received memory delete event: ${data.documentId}`
      );

      const { documentId, userId, timestamp } = data;

      // Validate required fields
      if (!documentId) {
        this.logger.error("[DELETE] Missing documentId", { data });
        context.getChannelRef().ack(context.getMessage());
        return;
      }

      // Delete from vector index
      try {
        await this.elasticsearchService.deleteDocument("vectors", documentId);
        this.logger.debug(`[DELETE] Removed from vectors: ${documentId}`);
      } catch (error) {
        this.logger.warn(
          `[DELETE] Failed to delete from vectors: ${documentId}`,
          error
        );
        // Continue to document index deletion even if this fails
      }

      // Delete from document index
      try {
        await this.elasticsearchService.deleteDocument("documents", documentId);
        this.logger.debug(`[DELETE] Removed from documents: ${documentId}`);
      } catch (error) {
        this.logger.warn(
          `[DELETE] Failed to delete from documents: ${documentId}`,
          error
        );
      }

      // Acknowledge message
      context.getChannelRef().ack(context.getMessage());
      this.logger.debug(`[DELETE] Successfully processed: ${documentId}`);
    } catch (error) {
      this.logger.error("[DELETE] Error processing memory delete event", error);
      // NACK the message to requeue for retry
      context.getChannelRef().nack(context.getMessage(), false, true);
    }
  }

  /**
   * Handle batch upsert events
   * Process multiple documents at once (more efficient)
   *
   * Event structure:
   * {
   *   documents: [
   *     { documentId, userId, title, content, vector, tags, metadata, ... }
   *   ],
   *   source: string,
   *   timestamp: number
   * }
   */
  @MessagePattern("memory.batch.upsert")
  async handleMemoryBatchUpsert(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ) {
    try {
      this.logger.debug(
        `[BATCH_UPSERT] Received batch event with ${
          data.documents?.length || 0
        } documents`
      );

      const { documents, source, timestamp } = data;

      if (!documents || documents.length === 0) {
        this.logger.warn("[BATCH_UPSERT] No documents in batch");
        context.getChannelRef().ack(context.getMessage());
        return;
      }

      // Process in smaller chunks to avoid overwhelming Elasticsearch
      const BATCH_SIZE = 100;
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const chunk = documents.slice(i, i + BATCH_SIZE);

        // Prepare documents for vector index
        const vectorDocs = chunk
          .filter((doc: any) => doc.vector && doc.vector.length === 768)
          .map((doc: any) => ({
            index: { _index: "vectors", _id: doc.documentId },
          }))
          .flatMap((index: any) => {
            const doc = documents.find(
              (d: any) => d.documentId === index.index._id
            );
            return [
              index,
              {
                documentId: doc.documentId,
                userId: doc.userId,
                title: doc.title || "",
                content: doc.content || "",
                vector: doc.vector,
                tags: doc.tags || [],
                metadata: doc.metadata || {},
                source: source || "memory-service",
                createdAt: timestamp || Date.now(),
                updatedAt: Date.now(),
              },
            ];
          });

        // Prepare documents for document index
        const textDocs = chunk
          .filter((doc: any) => doc.content)
          .map((doc: any) => ({
            index: { _index: "documents", _id: doc.documentId },
          }))
          .flatMap((index: any) => {
            const doc = documents.find(
              (d: any) => d.documentId === index.index._id
            );
            return [
              index,
              {
                id: doc.documentId,
                title: doc.title || "",
                content: doc.content || "",
                userId: doc.userId,
                tags: doc.tags || [],
                status: "published",
                metadata: doc.metadata || {},
                source: source || "memory-service",
                createdAt: timestamp || Date.now(),
                updatedAt: Date.now(),
              },
            ];
          });

        try {
          if (vectorDocs.length > 0) {
            await this.elasticsearchService.bulkIndex("vectors", vectorDocs);
            successCount += vectorDocs.filter(
              (d: any, i: number) => i % 2 === 1
            ).length;
          }

          if (textDocs.length > 0) {
            await this.elasticsearchService.bulkIndex("documents", textDocs);
            successCount += textDocs.filter(
              (d: any, i: number) => i % 2 === 1
            ).length;
          }
        } catch (error) {
          this.logger.error(
            `[BATCH_UPSERT] Error processing chunk ${i}-${i + BATCH_SIZE}`,
            error
          );
          failureCount += chunk.length;
        }
      }

      // Acknowledge message
      context.getChannelRef().ack(context.getMessage());
      this.logger.debug(
        `[BATCH_UPSERT] Completed: ${successCount} succeeded, ${failureCount} failed out of ${documents.length} total`
      );
    } catch (error) {
      this.logger.error(
        "[BATCH_UPSERT] Error processing batch upsert event",
        error
      );
      context.getChannelRef().nack(context.getMessage(), false, true);
    }
  }

  /**
   * Handle batch delete events
   * Remove multiple documents at once
   *
   * Event structure:
   * {
   *   documentIds: string[],
   *   userId: string,
   *   timestamp: number
   * }
   */
  @MessagePattern("memory.batch.delete")
  async handleMemoryBatchDelete(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ) {
    try {
      this.logger.debug(
        `[BATCH_DELETE] Received batch delete event with ${
          data.documentIds?.length || 0
        } documents`
      );

      const { documentIds, userId, timestamp } = data;

      if (!documentIds || documentIds.length === 0) {
        this.logger.warn("[BATCH_DELETE] No documentIds in batch");
        context.getChannelRef().ack(context.getMessage());
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const documentId of documentIds) {
        try {
          await this.elasticsearchService.deleteDocument("vectors", documentId);
          await this.elasticsearchService.deleteDocument(
            "documents",
            documentId
          );
          successCount++;
        } catch (error) {
          this.logger.warn(
            `[BATCH_DELETE] Failed to delete ${documentId}`,
            error
          );
          failureCount++;
        }
      }

      // Acknowledge message
      context.getChannelRef().ack(context.getMessage());
      this.logger.debug(
        `[BATCH_DELETE] Completed: ${successCount} succeeded, ${failureCount} failed`
      );
    } catch (error) {
      this.logger.error(
        "[BATCH_DELETE] Error processing batch delete event",
        error
      );
      context.getChannelRef().nack(context.getMessage(), false, true);
    }
  }

  /**
   * Handle index reindex event
   * Trigger full reindex from source database to Elasticsearch
   *
   * Event structure:
   * {
   *   indexName: 'vectors' | 'documents',
   *   userId?: string,
   *   timestamp: number
   * }
   */
  @MessagePattern("memory.reindex")
  async handleMemoryReindex(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(
        `[REINDEX] Starting reindex for: ${data.indexName || "all"}`
      );

      const { indexName, userId, timestamp } = data;

      // For now, just log the request
      // Full reindex should be implemented separately with data source access
      this.logger.log("[REINDEX] Reindex request logged", {
        indexName,
        userId,
        timestamp,
      });

      // Acknowledge message
      context.getChannelRef().ack(context.getMessage());
    } catch (error) {
      this.logger.error("[REINDEX] Error processing reindex event", error);
      context.getChannelRef().nack(context.getMessage(), false, true);
    }
  }
}
