import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import {
  RLHFMemoryService,
  FeedbackQuery,
} from "./services/rlhf-memory.service";

@Controller("v1/memory/rlhf")
export class RLHFMemoryController {
  private readonly logger = new Logger(RLHFMemoryController.name);

  constructor(private readonly rlhfMemoryService: RLHFMemoryService) {}

  /**
   * POST /v1/memory/rlhf/feedback
   * Store RLHF feedback received from orchestrator/adapter
   */
  @Post("feedback")
  @HttpCode(201)
  async storeFeedback(
    @Body()
    payload: {
      feedbackId: string;
      taskId: string;
      modelUsed: string;
      feedbackType: "good" | "bad" | "neutral";
      score: number;
      preferredOutput: string;
      rejectedOutput: string;
      comments?: string;
      timestamp?: number;
      sourceService?: string;
    }
  ) {
    // Validate payload
    if (!payload.feedbackId || !payload.taskId || !payload.modelUsed) {
      throw new BadRequestException("Missing required fields");
    }

    if (payload.score < 0 || payload.score > 1) {
      throw new BadRequestException("Score must be between 0 and 1");
    }

    const result = await this.rlhfMemoryService.storeFeedback(payload);

    return {
      success: true,
      data: result,
      message: "Feedback stored successfully",
    };
  }

  /**
   * GET /v1/memory/rlhf/feedback/:feedbackId
   * Retrieve stored feedback by ID
   */
  @Get("feedback/:feedbackId")
  getFeedback(@Param("feedbackId") feedbackId: string) {
    const feedback = this.rlhfMemoryService.getFeedback(feedbackId);

    if (!feedback) {
      throw new NotFoundException(`Feedback not found: ${feedbackId}`);
    }

    return {
      success: true,
      data: feedback,
    };
  }

  /**
   * GET /v1/memory/rlhf/feedback
   * Query feedback with filters
   */
  @Get("feedback")
  queryFeedback(
    @Query("feedbackType") feedbackType?: "good" | "bad" | "neutral",
    @Query("modelUsed") modelUsed?: string,
    @Query("minScore") minScore?: string,
    @Query("maxScore") maxScore?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const query: FeedbackQuery = {
      feedbackType,
      modelUsed,
      minScore: minScore ? parseFloat(minScore) : undefined,
      maxScore: maxScore ? parseFloat(maxScore) : undefined,
      startDate: startDate ? parseInt(startDate) : undefined,
      endDate: endDate ? parseInt(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const feedback = this.rlhfMemoryService.queryFeedback(query);

    return {
      success: true,
      data: {
        count: feedback.length,
        feedback,
      },
    };
  }

  /**
   * GET /v1/memory/rlhf/stats
   * Get feedback statistics
   */
  @Get("stats")
  getStatistics(@Query("modelUsed") modelUsed?: string) {
    const stats = this.rlhfMemoryService.getStatistics(modelUsed);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * POST /v1/memory/rlhf/batch
   * Create a feedback batch for training
   */
  @Post("batch")
  @HttpCode(201)
  createFeedbackBatch(@Body() payload: { feedbackIds: string[] }) {
    if (!payload.feedbackIds || payload.feedbackIds.length === 0) {
      throw new BadRequestException("feedbackIds cannot be empty");
    }

    const batch = this.rlhfMemoryService.createFeedbackBatch(
      payload.feedbackIds
    );

    return {
      success: true,
      data: batch,
      message: `Feedback batch created with ${batch.totalCount} items`,
    };
  }

  /**
   * GET /v1/memory/rlhf/batch/:batchId
   * Get batch details
   */
  @Get("batch/:batchId")
  getFeedbackBatch(@Param("batchId") batchId: string) {
    const batch = this.rlhfMemoryService.getFeedbackBatch(batchId);

    if (!batch) {
      throw new NotFoundException(`Batch not found: ${batchId}`);
    }

    return {
      success: true,
      data: batch,
    };
  }

  /**
   * GET /v1/memory/rlhf/batches
   * List all feedback batches
   */
  @Get("batches")
  listFeedbackBatches() {
    const batches = this.rlhfMemoryService.listFeedbackBatches();

    return {
      success: true,
      data: {
        total: batches.length,
        batches,
      },
    };
  }

  /**
   * POST /v1/memory/rlhf/export
   * Export feedback data
   */
  @Post("export")
  @HttpCode(200)
  async exportFeedbackData(
    @Body()
    payload?: {
      format?: "jsonl" | "csv";
    }
  ) {
    const format = payload?.format || "jsonl";
    const result = await this.rlhfMemoryService.exportFeedbackData(format);

    return {
      success: true,
      data: result,
      message: `Exported ${result.recordCount} feedback records`,
    };
  }

  /**
   * DELETE /v1/memory/rlhf/feedback/:feedbackId
   * Delete feedback by ID
   */
  @Post("feedback/:feedbackId/delete")
  @HttpCode(200)
  deleteFeedback(@Param("feedbackId") feedbackId: string) {
    const result = this.rlhfMemoryService.deleteFeedback(feedbackId);

    return {
      success: result.deleted,
      data: result,
      message: result.deleted
        ? `Feedback deleted: ${feedbackId}`
        : `Failed to delete: ${feedbackId}`,
    };
  }

  /**
   * POST /v1/memory/rlhf/cleanup
   * Cleanup old feedback
   */
  @Post("cleanup")
  @HttpCode(200)
  async cleanupOldFeedback(
    @Body()
    payload: {
      daysOld: number;
    }
  ) {
    if (!payload.daysOld || payload.daysOld < 1) {
      throw new BadRequestException("daysOld must be at least 1");
    }

    const result = await this.rlhfMemoryService.cleanupOldFeedback(
      payload.daysOld
    );

    return {
      success: true,
      data: result,
      message: `Cleaned up ${result.deletedCount} old feedback records`,
    };
  }

  /**
   * GET /v1/memory/rlhf/count
   * Get total feedback count
   */
  @Get("count")
  getTotalFeedbackCount() {
    const count = this.rlhfMemoryService.getTotalFeedbackCount();

    return {
      success: true,
      data: {
        totalCount: count,
      },
    };
  }

  /**
   * GET /v1/memory/rlhf/health
   * Health check
   */
  @Get("health")
  health() {
    const health = this.rlhfMemoryService.health();

    return {
      success: true,
      data: health,
    };
  }
}
