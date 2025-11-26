import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

export interface FeedbackItem {
  taskId: string;
  modelUsed: string;
  feedbackType: "good" | "bad" | "neutral";
  score: number;
  preferredOutput: string;
  rejectedOutput: string;
  timestamp: number;
  comments?: string;
}

export interface TrainingConfig {
  model: string;
  learningRate: number;
  epochs: number;
  batchSize: number;
  loraRank: number;
  loraAlpha: number;
  loraDropout: number;
}

export interface TrainingJobStatus {
  jobId: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  loraCheckpoint?: string;
}

@Injectable()
export class RLHFService {
  private readonly logger = new Logger(RLHFService.name);
  private feedbackBuffer: FeedbackItem[] = [];
  private trainingJobs: Map<string, TrainingJobStatus> = new Map();
  private currentModelVersion = "roberta-base-v0";
  private readonly FEEDBACK_BATCH_SIZE = 32;
  private readonly FEEDBACK_DATA_PATH = "./data/rlhf-feedback";
  private readonly LORA_CHECKPOINT_PATH = "./models/lora-checkpoints";

  constructor() {
    this.initializePaths();
  }

  /**
   * Initialize data directories for RLHF feedback and checkpoints
   */
  private initializePaths() {
    const paths = [this.FEEDBACK_DATA_PATH, this.LORA_CHECKPOINT_PATH];
    paths.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Collect RLHF feedback from users/evaluators
   */
  async collectFeedback(feedback: Omit<FeedbackItem, "timestamp">): Promise<{
    collected: boolean;
    feedbackId: string;
    batchProgress: string;
  }> {
    const feedbackItem: FeedbackItem = {
      ...feedback,
      timestamp: Date.now(),
    };

    this.feedbackBuffer.push(feedbackItem);
    const feedbackId = `fb_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.logger.debug(
      `Feedback collected: ${feedbackId}, Type: ${feedback.feedbackType}`
    );

    // Auto-trigger training when batch size reached
    const batchProgress = `${this.feedbackBuffer.length}/${this.FEEDBACK_BATCH_SIZE}`;
    if (this.feedbackBuffer.length >= this.FEEDBACK_BATCH_SIZE) {
      this.logger.log(`Feedback batch complete! Starting training...`);
      await this.startTrainingFromBuffer();
    }

    return {
      collected: true,
      feedbackId,
      batchProgress,
    };
  }

  /**
   * Batch get feedback statistics
   */
  getFeedbackStats(): {
    totalFeedback: number;
    goodCount: number;
    badCount: number;
    neutralCount: number;
    averageScore: number;
    bufferedCount: number;
  } {
    const stats = {
      totalFeedback: this.feedbackBuffer.length,
      goodCount: this.feedbackBuffer.filter((f) => f.feedbackType === "good")
        .length,
      badCount: this.feedbackBuffer.filter((f) => f.feedbackType === "bad")
        .length,
      neutralCount: this.feedbackBuffer.filter(
        (f) => f.feedbackType === "neutral"
      ).length,
      averageScore:
        this.feedbackBuffer.length > 0
          ? this.feedbackBuffer.reduce((sum, f) => sum + f.score, 0) /
            this.feedbackBuffer.length
          : 0,
      bufferedCount: this.feedbackBuffer.length,
    };
    return stats;
  }

  /**
   * Start RLHF training from buffered feedback
   */
  async startTrainingFromBuffer(): Promise<{ jobId: string; status: string }> {
    if (this.feedbackBuffer.length === 0) {
      throw new Error("No feedback to train on");
    }

    const trainingConfig: TrainingConfig = {
      model: "roberta-base",
      learningRate: 1e-4,
      epochs: 3,
      batchSize: 8,
      loraRank: 8,
      loraAlpha: 16,
      loraDropout: 0.05,
    };

    const jobId = await this.initiateTraining(trainingConfig);
    return { jobId, status: "queued" };
  }

  /**
   * Initiate RLHF training with custom configuration
   */
  async initiateTraining(config: TrainingConfig): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const jobStatus: TrainingJobStatus = {
      jobId,
      status: "queued",
      progress: 0,
      startTime: Date.now(),
    };

    this.trainingJobs.set(jobId, jobStatus);
    this.logger.log(
      `RLHF Training initiated: ${jobId}, Model: ${config.model}`
    );

    // Save feedback batch to disk
    await this.saveFeedbackBatch(jobId);

    // Start async training (simulated)
    this.simulateTrainingProcess(jobId, config);

    return jobId;
  }

  /**
   * Get training job status
   */
  getTrainingStatus(jobId: string): TrainingJobStatus | null {
    return this.trainingJobs.get(jobId) || null;
  }

  /**
   * Get training job result (checkpoint path and metadata)
   */
  async getTrainingResult(jobId: string): Promise<{
    jobId: string;
    status: string;
    modelVersion: string;
    checkpoint: string;
    metrics: {
      trainingLoss: number;
      validationAccuracy: number;
      bestEpoch: number;
    };
  }> {
    const job = this.trainingJobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status !== "completed") {
      throw new Error(`Job not completed yet: ${jobId}`);
    }

    const newModelVersion = `roberta-base-v${Date.now()}`;
    return {
      jobId,
      status: job.status,
      modelVersion: newModelVersion,
      checkpoint: job.loraCheckpoint || "",
      metrics: {
        trainingLoss: 0.45,
        validationAccuracy: 0.88,
        bestEpoch: 2,
      },
    };
  }

  /**
   * Simulate training process (in production, this would be async task queue)
   */
  private simulateTrainingProcess(jobId: string, config: TrainingConfig): void {
    const job = this.trainingJobs.get(jobId)!;
    job.status = "running";
    job.startTime = Date.now();

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress 5-20% per tick
      if (progress > 100) progress = 100;

      job.progress = Math.floor(progress);
      this.logger.debug(`Job ${jobId} progress: ${job.progress}%`);

      if (progress >= 100) {
        clearInterval(interval);
        this.completeTrainingJob(jobId);
      }
    }, 3000); // Update every 3 seconds

    // Timeout after 30 seconds for demo
    setTimeout(() => {
      if (job.status === "running") {
        clearInterval(interval);
        this.completeTrainingJob(jobId);
      }
    }, 30000);
  }

  /**
   * Mark training job as completed
   */
  private completeTrainingJob(jobId: string): void {
    const job = this.trainingJobs.get(jobId)!;
    job.status = "completed";
    job.progress = 100;
    job.endTime = Date.now();
    job.loraCheckpoint = `./models/lora-checkpoints/${jobId}-checkpoint`;

    this.logger.log(`Training job completed: ${jobId}`);

    // Update current model version
    this.currentModelVersion = `roberta-base-${jobId}`;

    // Clear feedback buffer after successful training
    this.feedbackBuffer = [];
    this.logger.log(`Feedback buffer cleared. Ready for new batch.`);
  }

  /**
   * Save feedback batch to disk for training
   */
  private async saveFeedbackBatch(jobId: string): Promise<void> {
    const feedbackFile = path.join(
      this.FEEDBACK_DATA_PATH,
      `${jobId}-feedback.jsonl`
    );

    try {
      const content = this.feedbackBuffer
        .map((item) => JSON.stringify(item))
        .join("\n");

      fs.writeFileSync(feedbackFile, content);
      this.logger.log(`Feedback saved to: ${feedbackFile}`);
    } catch (error) {
      this.logger.error(`Failed to save feedback: ${error}`);
      throw error;
    }
  }

  /**
   * Get current model version and metadata
   */
  getCurrentModel(): {
    version: string;
    baseModel: string;
    hasLoRA: boolean;
    checkpoint: string;
    trainingJobs: number;
  } {
    return {
      version: this.currentModelVersion,
      baseModel: "roberta-base",
      hasLoRA: this.currentModelVersion !== "roberta-base-v0",
      checkpoint:
        this.currentModelVersion !== "roberta-base-v0"
          ? `./models/lora-checkpoints/${this.currentModelVersion}`
          : "none",
      trainingJobs: this.trainingJobs.size,
    };
  }

  /**
   * Switch to specific model version
   */
  switchModel(version: string): {
    previousVersion: string;
    newVersion: string;
    checkpoint: string;
  } {
    const previousVersion = this.currentModelVersion;
    this.currentModelVersion = version;

    this.logger.log(`Model switched: ${previousVersion} -> ${version}`);

    return {
      previousVersion,
      newVersion: version,
      checkpoint: `./models/lora-checkpoints/${version}`,
    };
  }

  /**
   * List all training jobs
   */
  listTrainingJobs(): TrainingJobStatus[] {
    return Array.from(this.trainingJobs.values());
  }

  /**
   * Get training job details by status
   */
  getJobsByStatus(status: string): TrainingJobStatus[] {
    return Array.from(this.trainingJobs.values()).filter(
      (job) => job.status === status
    );
  }

  /**
   * Export feedback data for analysis
   */
  async exportFeedbackData(
    format: "json" | "jsonl" = "jsonl"
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `rlhf-export-${timestamp}.${
      format === "jsonl" ? "jsonl" : "json"
    }`;
    const filepath = path.join(this.FEEDBACK_DATA_PATH, filename);

    try {
      if (format === "jsonl") {
        const content = this.feedbackBuffer
          .map((item) => JSON.stringify(item))
          .join("\n");
        fs.writeFileSync(filepath, content);
      } else {
        const content = JSON.stringify(this.feedbackBuffer, null, 2);
        fs.writeFileSync(filepath, content);
      }

      this.logger.log(`Feedback exported to: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to export feedback: ${error}`);
      throw error;
    }
  }

  /**
   * Clear all buffered feedback (use with caution)
   */
  clearBuffer(): { cleared: number } {
    const count = this.feedbackBuffer.length;
    this.feedbackBuffer = [];
    this.logger.warn(`Feedback buffer cleared. Removed ${count} items.`);
    return { cleared: count };
  }
}
