import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

export interface AgentResponse {
  action: string;
  result: string;
  modelUsed?: string;
  taskId?: string;
  timestamp: number;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private currentModelVersion = "roberta-base-v0";
  private readonly LLM_ADAPTER_URL =
    process.env.LLM_ADAPTER_SERVICE_URL || "http://localhost:3602";

  act(body: any): AgentResponse {
    return {
      action: "summary",
      result: "mock result",
      modelUsed: this.currentModelVersion,
      taskId: body.taskId || "task_default",
      timestamp: Date.now(),
    };
  }

  health() {
    return {
      status: "ok",
      currentModel: this.currentModelVersion,
    };
  }

  /**
   * Get current active model version
   */
  getCurrentModel(): {
    version: string;
    baseModel: string;
  } {
    return {
      version: this.currentModelVersion,
      baseModel: "roberta-base",
    };
  }

  /**
   * Query current model from llm-adapter-service
   */
  async queryCurrentModel(): Promise<{
    version: string;
    baseModel: string;
    hasLoRA: boolean;
  }> {
    try {
      const response = await axios.get(
        `${this.LLM_ADAPTER_URL}/v1/rlhf/model/current`,
        {
          timeout: 5000,
        }
      );

      const modelInfo = response.data.data;
      this.currentModelVersion = modelInfo.version;

      this.logger.log(
        `Updated model from adapter: ${this.currentModelVersion}`
      );

      return {
        version: modelInfo.version,
        baseModel: modelInfo.baseModel,
        hasLoRA: modelInfo.hasLoRA,
      };
    } catch (error) {
      this.logger.warn(`Failed to query model from adapter: ${error}`);
      // Fallback to local version
      return {
        version: this.currentModelVersion,
        baseModel: "roberta-base",
        hasLoRA: false,
      };
    }
  }

  /**
   * Switch to a specific model version
   */
  async switchModel(modelVersion: string): Promise<{
    previousVersion: string;
    newVersion: string;
    switched: boolean;
  }> {
    const previousVersion = this.currentModelVersion;

    try {
      const response = await axios.post(
        `${this.LLM_ADAPTER_URL}/v1/rlhf/model/switch/${modelVersion}`,
        {},
        { timeout: 5000 }
      );

      if (response.status === 200) {
        this.currentModelVersion = modelVersion;
        this.logger.log(
          `Model switched: ${previousVersion} -> ${modelVersion}`
        );

        return {
          previousVersion,
          newVersion: modelVersion,
          switched: true,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to switch model: ${error}`);
    }

    return {
      previousVersion,
      newVersion: previousVersion,
      switched: false,
    };
  }

  /**
   * Execute agent task with model tracking
   */
  async executeTaskWithModel(payload: {
    taskId: string;
    taskType: string;
    input: string;
    context?: any;
  }): Promise<AgentResponse> {
    // Query latest model version
    const currentModel = await this.queryCurrentModel();

    return {
      action: payload.taskType,
      result: `Executed task with model: ${currentModel.version}`,
      modelUsed: currentModel.version,
      taskId: payload.taskId,
      timestamp: Date.now(),
    };
  }

  /**
   * Batch execute tasks with model tracking
   */
  async executeTaskBatch(
    tasks: Array<{
      taskId: string;
      taskType: string;
      input: string;
    }>
  ): Promise<AgentResponse[]> {
    const currentModel = await this.queryCurrentModel();

    return tasks.map((task) => ({
      action: task.taskType,
      result: `Executed: ${task.input}`,
      modelUsed: currentModel.version,
      taskId: task.taskId,
      timestamp: Date.now(),
    }));
  }
}
