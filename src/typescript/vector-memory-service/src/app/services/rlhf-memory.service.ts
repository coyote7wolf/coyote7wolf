import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

export interface StoredFeedback {
  feedbackId: string;
  taskId: string;
  modelUsed: string;
  feedbackType: "good" | "bad" | "neutral";
  score: number;
  preferredOutput: string;
  rejectedOutput: string;
  comments?: string;
  timestamp: number;
  sourceService?: string;
}

export interface FeedbackQuery {
  feedbackType?: "good" | "bad" | "neutral";
  modelUsed?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

export interface FeedbackBatch {
  batchId: string;
  feedbackIds: string[];
  totalCount: number;
  goodCount: number;
  badCount: number;
  neutralCount: number;
  averageScore: number;
  createdAt: number;
}

@Injectable()
export class RLHFMemoryService {
  private readonly logger = new Logger(RLHFMemoryService.name);
  private feedbackStorage: Map<string, StoredFeedback> = new Map();
  private feedbackBatches: Map<string, FeedbackBatch> = new Map();
  private readonly FEEDBACK_STORAGE_PATH = "./data/rlhf-memory";
  private readonly BATCH_SIZE = 32;

  constructor() {
    this.initializeStorage();
    this.loadStoredFeedback();
  }

  /**
   * Initialize storage directory
   */
  private initializeStorage(): void {
    if (!fs.existsSync(this.FEEDBACK_STORAGE_PATH)) {
      fs.mkdirSync(this.FEEDBACK_STORAGE_PATH, { recursive: true });
      this.logger.log(
        `Created feedback storage directory: ${this.FEEDBACK_STORAGE_PATH}`
      );
    }
  }

  /**
   * Load previously stored feedback from disk
   */
  private loadStoredFeedback(): void {
    try {
      const files = fs.readdirSync(this.FEEDBACK_STORAGE_PATH);
      let loadedCount = 0;

      files.forEach((file) => {
        if (file.endsWith(".json")) {
          const filepath = path.join(this.FEEDBACK_STORAGE_PATH, file);
          const content = fs.readFileSync(filepath, "utf-8");
          const feedback = JSON.parse(content) as StoredFeedback;
          this.feedbackStorage.set(feedback.feedbackId, feedback);
          loadedCount++;
        }
      });

      this.logger.log(`Loaded ${loadedCount} feedback records from storage`);
    } catch (error) {
      this.logger.warn(`Failed to load stored feedback: ${error}`);
    }
  }

  /**
   * Store feedback received from orchestrator/adapter
   */
  async storeFeedback(
    feedback: Omit<StoredFeedback, "timestamp"> | StoredFeedback
  ): Promise<{
    stored: boolean;
    feedbackId: string;
    path: string;
  }> {
    const feedbackItem: StoredFeedback = {
      ...(feedback as StoredFeedback),
      timestamp: (feedback as StoredFeedback).timestamp || Date.now(),
    };

    this.feedbackStorage.set(feedbackItem.feedbackId, feedbackItem);

    // Persist to disk
    const filepath = path.join(
      this.FEEDBACK_STORAGE_PATH,
      `${feedbackItem.feedbackId}.json`
    );

    try {
      fs.writeFileSync(filepath, JSON.stringify(feedbackItem, null, 2));
      this.logger.debug(`Feedback stored: ${feedbackItem.feedbackId}`);
    } catch (error) {
      this.logger.error(`Failed to persist feedback: ${error}`);
      throw error;
    }

    return {
      stored: true,
      feedbackId: feedbackItem.feedbackId,
      path: filepath,
    };
  }

  /**
   * Retrieve feedback by ID
   */
  getFeedback(feedbackId: string): StoredFeedback | null {
    return this.feedbackStorage.get(feedbackId) || null;
  }

  /**
   * Query feedback with filters
   */
  queryFeedback(query: FeedbackQuery = {}): StoredFeedback[] {
    let results = Array.from(this.feedbackStorage.values());

    // Apply filters
    if (query.feedbackType) {
      results = results.filter((f) => f.feedbackType === query.feedbackType);
    }

    if (query.modelUsed) {
      results = results.filter((f) => f.modelUsed === query.modelUsed);
    }

    if (query.minScore !== undefined) {
      results = results.filter((f) => f.score >= query.minScore!);
    }

    if (query.maxScore !== undefined) {
      results = results.filter((f) => f.score <= query.maxScore!);
    }

    if (query.startDate) {
      results = results.filter((f) => f.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      results = results.filter((f) => f.timestamp <= query.endDate!);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit and offset
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return results.slice(offset, offset + limit);
  }

  /**
   * Get feedback statistics
   */
  getStatistics(modelUsed?: string): {
    totalFeedback: number;
    goodCount: number;
    badCount: number;
    neutralCount: number;
    averageScore: number;
    goodRatio: number;
    byModel?: Map<string, { count: number; averageScore: number }>;
  } {
    let feedback = Array.from(this.feedbackStorage.values());

    if (modelUsed) {
      feedback = feedback.filter((f) => f.modelUsed === modelUsed);
    }

    const stats = {
      totalFeedback: feedback.length,
      goodCount: feedback.filter((f) => f.feedbackType === "good").length,
      badCount: feedback.filter((f) => f.feedbackType === "bad").length,
      neutralCount: feedback.filter((f) => f.feedbackType === "neutral").length,
      averageScore:
        feedback.length > 0
          ? feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length
          : 0,
      goodRatio:
        feedback.length > 0
          ? feedback.filter((f) => f.feedbackType === "good").length /
            feedback.length
          : 0,
    };

    // Statistics by model
    if (!modelUsed) {
      const byModel = new Map<
        string,
        { count: number; averageScore: number }
      >();

      feedback.forEach((f) => {
        if (!byModel.has(f.modelUsed)) {
          byModel.set(f.modelUsed, { count: 0, averageScore: 0 });
        }

        const modelStats = byModel.get(f.modelUsed)!;
        modelStats.count++;
        modelStats.averageScore += f.score;
      });

      // Calculate average for each model
      byModel.forEach((stats) => {
        stats.averageScore = stats.averageScore / stats.count;
      });

      return { ...stats, byModel };
    }

    return stats;
  }

  /**
   * Create a feedback batch (for training purposes)
   */
  createFeedbackBatch(feedbackIds: string[]): FeedbackBatch {
    const batchFeedback = feedbackIds
      .map((id) => this.feedbackStorage.get(id))
      .filter((f) => f !== undefined) as StoredFeedback[];

    if (batchFeedback.length === 0) {
      throw new Error("No valid feedback IDs provided");
    }

    const batchId = `batch_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const batch: FeedbackBatch = {
      batchId,
      feedbackIds,
      totalCount: batchFeedback.length,
      goodCount: batchFeedback.filter((f) => f.feedbackType === "good").length,
      badCount: batchFeedback.filter((f) => f.feedbackType === "bad").length,
      neutralCount: batchFeedback.filter((f) => f.feedbackType === "neutral")
        .length,
      averageScore:
        batchFeedback.reduce((sum, f) => sum + f.score, 0) /
        batchFeedback.length,
      createdAt: Date.now(),
    };

    this.feedbackBatches.set(batchId, batch);
    this.logger.log(
      `Created feedback batch: ${batchId} with ${batchFeedback.length} items`
    );

    return batch;
  }

  /**
   * Get feedback batch details
   */
  getFeedbackBatch(batchId: string): FeedbackBatch | null {
    return this.feedbackBatches.get(batchId) || null;
  }

  /**
   * List all feedback batches
   */
  listFeedbackBatches(): FeedbackBatch[] {
    return Array.from(this.feedbackBatches.values());
  }

  /**
   * Export feedback data to JSONL format
   */
  async exportFeedbackData(format: "jsonl" | "csv" = "jsonl"): Promise<{
    exportPath: string;
    recordCount: number;
    format: string;
  }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `feedback-export-${timestamp}.${
      format === "jsonl" ? "jsonl" : "csv"
    }`;
    const exportPath = path.join(this.FEEDBACK_STORAGE_PATH, filename);

    const feedback = Array.from(this.feedbackStorage.values());

    try {
      if (format === "jsonl") {
        const content = feedback.map((f) => JSON.stringify(f)).join("\n");
        fs.writeFileSync(exportPath, content);
      } else {
        // CSV format
        const headers = [
          "feedbackId",
          "taskId",
          "modelUsed",
          "feedbackType",
          "score",
          "comments",
          "timestamp",
        ].join(",");

        const rows = feedback.map((f) =>
          [
            f.feedbackId,
            f.taskId,
            f.modelUsed,
            f.feedbackType,
            f.score,
            `"${(f.comments || "").replace(/"/g, '""')}"`,
            f.timestamp,
          ].join(",")
        );

        const content = [headers, ...rows].join("\n");
        fs.writeFileSync(exportPath, content);
      }

      this.logger.log(`Feedback exported to: ${exportPath}`);

      return {
        exportPath,
        recordCount: feedback.length,
        format,
      };
    } catch (error) {
      this.logger.error(`Failed to export feedback: ${error}`);
      throw error;
    }
  }

  /**
   * Delete feedback by ID
   */
  deleteFeedback(feedbackId: string): { deleted: boolean; feedbackId: string } {
    const result = this.feedbackStorage.delete(feedbackId);

    if (result) {
      const filepath = path.join(
        this.FEEDBACK_STORAGE_PATH,
        `${feedbackId}.json`
      );
      try {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      } catch (error) {
        this.logger.warn(`Failed to delete file: ${error}`);
      }
    }

    return { deleted: result, feedbackId };
  }

  /**
   * Cleanup old feedback (older than specified days)
   */
  async cleanupOldFeedback(daysOld: number): Promise<{ deletedCount: number }> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    const feedback = Array.from(this.feedbackStorage.entries());

    let deletedCount = 0;
    for (const [feedbackId, f] of feedback) {
      if (f.timestamp < cutoffTime) {
        this.deleteFeedback(feedbackId);
        deletedCount++;
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} old feedback records`);

    return { deletedCount };
  }

  /**
   * Get total feedback count
   */
  getTotalFeedbackCount(): number {
    return this.feedbackStorage.size;
  }

  /**
   * Health check
   */
  health(): {
    status: string;
    feedbackCount: number;
    batchCount: number;
    storageSize: string;
  } {
    const storageSize = this.calculateStorageSize();

    return {
      status: "healthy",
      feedbackCount: this.feedbackStorage.size,
      batchCount: this.feedbackBatches.size,
      storageSize,
    };
  }

  /**
   * Calculate storage size
   */
  private calculateStorageSize(): string {
    try {
      let totalSize = 0;
      const files = fs.readdirSync(this.FEEDBACK_STORAGE_PATH);

      files.forEach((file) => {
        const filepath = path.join(this.FEEDBACK_STORAGE_PATH, file);
        const stats = fs.statSync(filepath);
        totalSize += stats.size;
      });

      if (totalSize < 1024) return `${totalSize} B`;
      if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(2)} KB`;
      return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
    } catch (error) {
      return "N/A";
    }
  }
}
