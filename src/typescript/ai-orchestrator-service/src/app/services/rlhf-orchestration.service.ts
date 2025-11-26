import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

export interface RLHFFeedback {
  taskId: string;
  modelUsed: string;
  feedbackType: "good" | "bad" | "neutral";
  score: number;
  preferredOutput: string;
  rejectedOutput: string;
  comments?: string;
  timestamp: number;
}

export interface FeedbackForwarding {
  taskId: string;
  sourceService: string;
  destinationService: string;
  feedback: RLHFFeedback;
  status: "pending" | "sent" | "failed";
  retryCount: number;
  lastError?: string;
}

@Injectable()
export class RLHFOrchestrationService {
  private readonly logger = new Logger(RLHFOrchestrationService.name);
  private pendingFeedback: Map<string, FeedbackForwarding> = new Map();
  private readonly LLM_ADAPTER_URL =
    process.env.LLM_ADAPTER_SERVICE_URL || "http://localhost:3602";
  private readonly MEMORY_SERVICE_URL =
    process.env.MEMORY_SERVICE_URL || "http://localhost:3603";
  private readonly MAX_RETRIES = 3;
  private feedbackBuffer: RLHFFeedback[] = [];

  /**
   * Collect RLHF feedback from orchestration layer
   */
  async collectFeedback(feedback: Omit<RLHFFeedback, "timestamp">): Promise<{
    collected: boolean;
    feedbackId: string;
    status: string;
  }> {
    const feedbackItem: RLHFFeedback = {
      ...feedback,
      timestamp: Date.now(),
    };

    this.feedbackBuffer.push(feedbackItem);
    const feedbackId = `fb_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.logger.log(
      `Feedback collected: ${feedbackId}, Type: ${feedback.feedbackType}`
    );

    // Forward to llm-adapter-service immediately
    await this.forwardFeedbackToAdapter(feedbackId, feedbackItem);

    // Also store in memory-service for persistence
    await this.storeFeedbackInMemory(feedbackId, feedbackItem);

    return {
      collected: true,
      feedbackId,
      status: "collected_and_forwarded",
    };
  }

  /**
   * Forward feedback to llm-adapter-service for RLHF training
   */
  private async forwardFeedbackToAdapter(
    feedbackId: string,
    feedback: RLHFFeedback
  ): Promise<void> {
    const forwarding: FeedbackForwarding = {
      taskId: feedback.taskId,
      sourceService: "orchestrator",
      destinationService: "llm-adapter",
      feedback,
      status: "pending",
      retryCount: 0,
    };

    this.pendingFeedback.set(feedbackId, forwarding);

    try {
      const response = await axios.post(
        `${this.LLM_ADAPTER_URL}/v1/rlhf/feedback`,
        feedback,
        { timeout: 5000 }
      );

      if (response.status === 201) {
        forwarding.status = "sent";
        this.logger.log(`Feedback forwarded to llm-adapter: ${feedbackId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to forward feedback to llm-adapter: ${error}`);

      // Retry logic
      if (forwarding.retryCount < this.MAX_RETRIES) {
        forwarding.retryCount++;
        forwarding.lastError =
          error instanceof Error ? error.message : "Unknown error";
        this.logger.log(
          `Scheduled retry ${forwarding.retryCount}/${this.MAX_RETRIES} for ${feedbackId}`
        );

        // Schedule retry after 2 seconds
        setTimeout(() => {
          this.forwardFeedbackToAdapter(feedbackId, feedback).catch((err) => {
            this.logger.error(`Retry failed for ${feedbackId}: ${err}`);
          });
        }, 2000);
      } else {
        forwarding.status = "failed";
        this.logger.error(`Max retries reached for ${feedbackId}`);
      }
    }
  }

  /**
   * Store feedback in memory-service for persistence
   */
  private async storeFeedbackInMemory(
    feedbackId: string,
    feedback: RLHFFeedback
  ): Promise<void> {
    try {
      const response = await axios.post(
        `${this.MEMORY_SERVICE_URL}/v1/memory/rlhf/feedback`,
        {
          feedbackId,
          ...feedback,
        },
        { timeout: 5000 }
      );

      if (response.status === 201) {
        this.logger.log(`Feedback stored in memory-service: ${feedbackId}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to store feedback in memory-service: ${error}`);
      // Non-critical, continue without blocking
    }
  }

  /**
   * Get feedback forwarding status
   */
  getFeedbackStatus(feedbackId: string): FeedbackForwarding | null {
    return this.pendingFeedback.get(feedbackId) || null;
  }

  /**
   * Get all pending feedback
   */
  getPendingFeedback(): FeedbackForwarding[] {
    return Array.from(this.pendingFeedback.values()).filter(
      (f) => f.status === "pending"
    );
  }

  /**
   * Get feedback statistics in orchestrator
   */
  getFeedbackStats(): {
    totalCollected: number;
    successfullySent: number;
    pendingCount: number;
    failedCount: number;
    goodCount: number;
    badCount: number;
    neutralCount: number;
  } {
    const forwarding = Array.from(this.pendingFeedback.values());

    return {
      totalCollected: this.feedbackBuffer.length,
      successfullySent: forwarding.filter((f) => f.status === "sent").length,
      pendingCount: forwarding.filter((f) => f.status === "pending").length,
      failedCount: forwarding.filter((f) => f.status === "failed").length,
      goodCount: this.feedbackBuffer.filter((f) => f.feedbackType === "good")
        .length,
      badCount: this.feedbackBuffer.filter((f) => f.feedbackType === "bad")
        .length,
      neutralCount: this.feedbackBuffer.filter(
        (f) => f.feedbackType === "neutral"
      ).length,
    };
  }

  /**
   * Get RLHF training status from llm-adapter-service
   */
  async getTrainingStatus(jobId: string): Promise<{
    jobId: string;
    status: string;
    progress: number;
  }> {
    try {
      const response = await axios.get(
        `${this.LLM_ADAPTER_URL}/v1/rlhf/status/${jobId}`,
        { timeout: 5000 }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get training status: ${error}`);
      throw error;
    }
  }

  /**
   * Get current model information from llm-adapter-service
   */
  async getCurrentModel(): Promise<{
    version: string;
    baseModel: string;
    hasLoRA: boolean;
    checkpoint: string;
  }> {
    try {
      const response = await axios.get(
        `${this.LLM_ADAPTER_URL}/v1/rlhf/model/current`,
        { timeout: 5000 }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get current model: ${error}`);
      throw error;
    }
  }

  /**
   * Orchestrate feedback collection across multiple workflow types
   */
  async orchestrateFeedbackCollection(
    workflowType: "rag" | "context_flow" | "event_dispatch",
    result: {
      taskId: string;
      modelUsed: string;
      output: string;
      alternativeOutput?: string;
    },
    userRating: {
      type: "good" | "bad" | "neutral";
      score: number;
      comments?: string;
    }
  ): Promise<{
    feedbackId: string;
    workflowType: string;
    status: string;
  }> {
    this.logger.log(
      `Orchestrating feedback for ${workflowType} workflow: ${result.taskId}`
    );

    const feedback: Omit<RLHFFeedback, "timestamp"> = {
      taskId: result.taskId,
      modelUsed: result.modelUsed,
      feedbackType: userRating.type,
      score: userRating.score,
      preferredOutput: result.output,
      rejectedOutput:
        result.alternativeOutput || `[Default rejection for ${workflowType}]`,
      comments: userRating.comments,
    };

    const feedbackResult = await this.collectFeedback(feedback);

    return {
      feedbackId: feedbackResult.feedbackId,
      workflowType,
      status: feedbackResult.status,
    };
  }

  /**
   * Batch collect feedback from multiple workflow results
   */
  async batchCollectFeedback(
    feedbackBatch: Array<{
      taskId: string;
      modelUsed: string;
      feedbackType: "good" | "bad" | "neutral";
      score: number;
      preferredOutput: string;
      rejectedOutput: string;
      comments?: string;
    }>
  ): Promise<{
    totalCollected: number;
    successCount: number;
    failureCount: number;
    feedbackIds: string[];
  }> {
    this.logger.log(`Batch collecting ${feedbackBatch.length} feedback items`);

    const feedbackIds: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const feedback of feedbackBatch) {
      try {
        const result = await this.collectFeedback(feedback);
        feedbackIds.push(result.feedbackId);
        successCount++;
      } catch (error) {
        this.logger.error(
          `Failed to collect feedback for task ${feedback.taskId}: ${error}`
        );
        failureCount++;
      }
    }

    return {
      totalCollected: feedbackBatch.length,
      successCount,
      failureCount,
      feedbackIds,
    };
  }

  /**
   * Export feedback data from orchestrator
   */
  async exportFeedbackData(format: "json" | "csv" = "json"): Promise<{
    totalRecords: number;
    exportPath: string;
    format: string;
  }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `orchestrator-feedback-${timestamp}.${format}`;

    this.logger.log(
      `Exporting ${this.feedbackBuffer.length} feedback records in ${format} format`
    );

    // In production, this would write to disk/S3
    // For now, just return metadata
    return {
      totalRecords: this.feedbackBuffer.length,
      exportPath: `./data/rlhf-feedback/${filename}`,
      format,
    };
  }

  /**
   * Health check for RLHF orchestration
   */
  async health(): Promise<{
    status: string;
    adapterReachable: boolean;
    memoryReachable: boolean;
    feedbackBufferSize: number;
    pendingForwardings: number;
  }> {
    let adapterReachable = false;
    let memoryReachable = false;

    try {
      await axios.get(`${this.LLM_ADAPTER_URL}/health`, { timeout: 2000 });
      adapterReachable = true;
    } catch (error) {
      this.logger.warn("llm-adapter-service unreachable");
    }

    try {
      await axios.get(`${this.MEMORY_SERVICE_URL}/health`, { timeout: 2000 });
      memoryReachable = true;
    } catch (error) {
      this.logger.warn("memory-service unreachable");
    }

    return {
      status: "healthy",
      adapterReachable,
      memoryReachable,
      feedbackBufferSize: this.feedbackBuffer.length,
      pendingForwardings: this.getPendingFeedback().length,
    };
  }
}
