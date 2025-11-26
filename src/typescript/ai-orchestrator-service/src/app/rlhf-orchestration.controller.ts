import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  BadRequestException,
  Logger,
  Param,
} from "@nestjs/common";
import { RLHFOrchestrationService } from "./services/rlhf-orchestration.service";

@Controller("v1/orchestrator/rlhf")
export class RLHFOrchestrationController {
  private readonly logger = new Logger(RLHFOrchestrationController.name);

  constructor(private readonly rlhfService: RLHFOrchestrationService) {}

  /**
   * POST /v1/orchestrator/rlhf/feedback
   * Collect and forward RLHF feedback from orchestration workflows
   */
  @Post("feedback")
  @HttpCode(201)
  async collectFeedback(
    @Body()
    payload: {
      taskId: string;
      modelUsed: string;
      feedbackType: "good" | "bad" | "neutral";
      score: number;
      preferredOutput: string;
      rejectedOutput: string;
      comments?: string;
    }
  ) {
    // Validate payload
    if (!payload.taskId || !payload.modelUsed) {
      throw new BadRequestException(
        "Missing required fields: taskId, modelUsed"
      );
    }

    if (payload.score < 0 || payload.score > 1) {
      throw new BadRequestException("Score must be between 0 and 1");
    }

    if (!["good", "bad", "neutral"].includes(payload.feedbackType)) {
      throw new BadRequestException("Invalid feedbackType");
    }

    const result = await this.rlhfService.collectFeedback(payload);

    return {
      success: true,
      data: result,
      message: `Feedback collected and forwarded to llm-adapter-service`,
    };
  }

  /**
   * POST /v1/orchestrator/rlhf/feedback/orchestrated
   * Orchestrated feedback collection for specific workflow types
   */
  @Post("feedback/orchestrated")
  @HttpCode(201)
  async orchestrateFeedback(
    @Body()
    payload: {
      workflowType: "rag" | "context_flow" | "event_dispatch";
      taskId: string;
      modelUsed: string;
      output: string;
      alternativeOutput?: string;
      userRating: {
        type: "good" | "bad" | "neutral";
        score: number;
        comments?: string;
      };
    }
  ) {
    const {
      workflowType,
      taskId,
      modelUsed,
      output,
      alternativeOutput,
      userRating,
    } = payload;

    if (
      !workflowType ||
      !["rag", "context_flow", "event_dispatch"].includes(workflowType)
    ) {
      throw new BadRequestException("Invalid workflowType");
    }

    const result = await this.rlhfService.orchestrateFeedbackCollection(
      workflowType,
      { taskId, modelUsed, output, alternativeOutput },
      userRating
    );

    return {
      success: true,
      data: result,
      message: `Feedback orchestrated for ${workflowType} workflow`,
    };
  }

  /**
   * POST /v1/orchestrator/rlhf/feedback/batch
   * Batch collect multiple feedback items
   */
  @Post("feedback/batch")
  @HttpCode(201)
  async batchCollectFeedback(
    @Body()
    payload: {
      feedbackBatch: Array<{
        taskId: string;
        modelUsed: string;
        feedbackType: "good" | "bad" | "neutral";
        score: number;
        preferredOutput: string;
        rejectedOutput: string;
        comments?: string;
      }>;
    }
  ) {
    if (!payload.feedbackBatch || payload.feedbackBatch.length === 0) {
      throw new BadRequestException("feedbackBatch cannot be empty");
    }

    const result = await this.rlhfService.batchCollectFeedback(
      payload.feedbackBatch
    );

    return {
      success: true,
      data: result,
      message: `Batch collected ${result.successCount} feedback items`,
    };
  }

  /**
   * GET /v1/orchestrator/rlhf/status/:feedbackId
   * Get feedback forwarding status
   */
  @Get("status/:feedbackId")
  getFeedbackStatus(@Param("feedbackId") feedbackId: string) {
    const status = this.rlhfService.getFeedbackStatus(feedbackId);

    return {
      success: true,
      data: status,
    };
  }

  /**
   * GET /v1/orchestrator/rlhf/stats
   * Get feedback collection statistics
   */
  @Get("stats")
  getStats() {
    const stats = this.rlhfService.getFeedbackStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /v1/orchestrator/rlhf/pending
   * Get all pending feedback forwardings
   */
  @Get("pending")
  getPending() {
    const pending = this.rlhfService.getPendingFeedback();

    return {
      success: true,
      data: {
        total: pending.length,
        pendingForwardings: pending,
      },
    };
  }

  /**
   * GET /v1/orchestrator/rlhf/training/status/:jobId
   * Get RLHF training status from llm-adapter-service
   */
  @Get("training/status/:jobId")
  async getTrainingStatus(@Param("jobId") jobId: string) {
    const status = await this.rlhfService.getTrainingStatus(jobId);

    return {
      success: true,
      data: status,
    };
  }

  /**
   * GET /v1/orchestrator/rlhf/model/current
   * Get current model information from llm-adapter-service
   */
  @Get("model/current")
  async getCurrentModel() {
    const model = await this.rlhfService.getCurrentModel();

    return {
      success: true,
      data: model,
    };
  }

  /**
   * POST /v1/orchestrator/rlhf/export
   * Export collected feedback data
   */
  @Post("export")
  @HttpCode(200)
  async exportFeedback(
    @Body()
    payload?: {
      format?: "json" | "csv";
    }
  ) {
    const format = payload?.format || "json";
    const result = await this.rlhfService.exportFeedbackData(format);

    return {
      success: true,
      data: result,
      message: `Feedback exported to ${result.exportPath}`,
    };
  }

  /**
   * GET /v1/orchestrator/rlhf/health
   * Health check for RLHF orchestration
   */
  @Get("health")
  async health() {
    const health = await this.rlhfService.health();

    return {
      success: true,
      data: health,
    };
  }
}
