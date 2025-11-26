import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { RLHFService, TrainingConfig } from "./service/rlhf.service";

@Controller("v1/rlhf")
export class RLHFController {
  private readonly logger = new Logger(RLHFController.name);

  constructor(private readonly rlhfService: RLHFService) {}

  /**
   * POST /v1/rlhf/feedback
   * Collect RLHF feedback from users/evaluators
   */
  @Post("feedback")
  @HttpCode(201)
  async collectFeedback(
    @Body()
    payload: {
      taskId: string;
      modelUsed: string;
      feedbackType: "good" | "bad" | "neutral";
      score: number; // 0-1
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
      message: `Feedback collected. Batch progress: ${result.batchProgress}`,
    };
  }

  /**
   * POST /v1/rlhf/train
   * Manually trigger RLHF training from buffered feedback
   */
  @Post("train")
  @HttpCode(202)
  async startTraining() {
    const stats = this.rlhfService.getFeedbackStats();

    if (stats.totalFeedback === 0) {
      throw new BadRequestException("No feedback available for training");
    }

    const result = await this.rlhfService.startTrainingFromBuffer();

    return {
      success: true,
      data: result,
      feedbackStats: stats,
      message: `Training job queued with ${stats.totalFeedback} feedback items`,
    };
  }

  /**
   * POST /v1/rlhf/train/custom
   * Initiate training with custom configuration
   */
  @Post("train/custom")
  @HttpCode(202)
  async startCustomTraining(
    @Body()
    config: {
      model: string;
      learningRate: number;
      epochs: number;
      batchSize: number;
      loraRank: number;
      loraAlpha: number;
      loraDropout: number;
    }
  ) {
    if (!config.model || !config.learningRate || !config.epochs) {
      throw new BadRequestException("Missing required training config fields");
    }

    const jobId = await this.rlhfService.initiateTraining(config);

    return {
      success: true,
      data: { jobId, status: "queued" },
      config,
      message: "Custom training job initiated",
    };
  }

  /**
   * GET /v1/rlhf/status/:jobId
   * Get training job status
   */
  @Get("status/:jobId")
  async getStatus(@Param("jobId") jobId: string) {
    const status = this.rlhfService.getTrainingStatus(jobId);

    if (!status) {
      throw new NotFoundException(`Training job not found: ${jobId}`);
    }

    return {
      success: true,
      data: status,
    };
  }

  /**
   * GET /v1/rlhf/result/:jobId
   * Get training job result (checkpoint and metrics)
   */
  @Get("result/:jobId")
  async getResult(@Param("jobId") jobId: string) {
    const result = await this.rlhfService.getTrainingResult(jobId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /v1/rlhf/stats
   * Get feedback statistics
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
   * GET /v1/rlhf/model/current
   * Get current active model version
   */
  @Get("model/current")
  getCurrentModel() {
    const model = this.rlhfService.getCurrentModel();

    return {
      success: true,
      data: model,
    };
  }

  /**
   * POST /v1/rlhf/model/switch/:version
   * Switch to a specific model version
   */
  @Post("model/switch/:version")
  @HttpCode(200)
  switchModel(@Param("version") version: string) {
    const result = this.rlhfService.switchModel(version);

    return {
      success: true,
      data: result,
      message: `Model switched to ${version}`,
    };
  }

  /**
   * GET /v1/rlhf/jobs
   * List all training jobs
   */
  @Get("jobs")
  listJobs() {
    const jobs = this.rlhfService.listTrainingJobs();

    return {
      success: true,
      data: {
        total: jobs.length,
        jobs,
      },
    };
  }

  /**
   * GET /v1/rlhf/jobs/status/:status
   * Get jobs by status
   */
  @Get("jobs/status/:status")
  getJobsByStatus(@Param("status") status: string) {
    const validStatuses = ["queued", "running", "completed", "failed"];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Valid values: ${validStatuses.join(", ")}`
      );
    }

    const jobs = this.rlhfService.getJobsByStatus(status);

    return {
      success: true,
      data: {
        status,
        total: jobs.length,
        jobs: jobs.map((j: any) => j),
      },
    };
  }

  /**
   * POST /v1/rlhf/export
   * Export feedback data for analysis
   */
  @Post("export")
  @HttpCode(200)
  async exportFeedback(
    @Body()
    payload?: {
      format?: "json" | "jsonl";
    }
  ) {
    const format = payload?.format || "jsonl";
    const filepath = await this.rlhfService.exportFeedbackData(format);

    return {
      success: true,
      data: {
        filepath,
        format,
      },
      message: `Feedback exported to ${filepath}`,
    };
  }

  /**
   * POST /v1/rlhf/buffer/clear
   * Clear feedback buffer (use with caution)
   */
  @Post("buffer/clear")
  @HttpCode(200)
  clearBuffer() {
    const result = this.rlhfService.clearBuffer();

    return {
      success: true,
      data: result,
      message: `Cleared ${result.cleared} feedback items from buffer`,
    };
  }

  /**
   * GET /v1/rlhf/health
   * Health check for RLHF service
   */
  @Get("health")
  health() {
    const currentModel = this.rlhfService.getCurrentModel();
    const stats = this.rlhfService.getFeedbackStats();
    const jobs = this.rlhfService.listTrainingJobs();

    return {
      success: true,
      data: {
        status: "healthy",
        model: currentModel.version,
        feedbackBuffered: stats.bufferedCount,
        activeJobs: jobs.filter((j) => j.status === "running").length,
        totalJobs: jobs.length,
      },
    };
  }
}
