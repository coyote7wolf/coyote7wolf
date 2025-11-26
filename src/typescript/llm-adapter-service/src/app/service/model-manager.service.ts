import { Injectable, Logger } from "@nestjs/common";

export interface ModelInfo {
  name: string;
  type: "base" | "fine-tuned" | "rlhf-trained";
  version: string;
  checkpoint?: string;
  hasLoRA?: boolean;
  status: "ready" | "loading" | "training";
  metrics?: {
    accuracy: number;
    loss: number;
  };
}

export interface LoRACheckpoint {
  id: string;
  baseModel: string;
  rank: number;
  alpha: number;
  trainingJobId: string;
  createdAt: number;
  metrics: {
    trainingLoss: number;
    validationAccuracy: number;
  };
}

@Injectable()
export class ModelManagerService {
  private readonly logger = new Logger(ModelManagerService.name);
  private currentModel: ModelInfo = {
    name: "tinyllama",
    type: "base",
    version: "1.1b",
    status: "ready",
  };

  private availableModels: Map<string, ModelInfo> = new Map([
    [
      "tinyllama",
      {
        name: "tinyllama",
        type: "base",
        version: "1.1b",
        status: "ready",
      },
    ],
    [
      "roberta-base",
      {
        name: "roberta-base",
        type: "base",
        version: "12-layer",
        status: "ready",
      },
    ],
  ]);

  private loraCheckpoints: Map<string, LoRACheckpoint> = new Map();

  /**
   * Get current active model
   */
  status(): ModelInfo {
    return { ...this.currentModel };
  }

  /**
   * Switch to a different model
   */
  switch(model: string): { model: string; status: string; type: string } {
    const availableModel = this.availableModels.get(model);

    if (!availableModel) {
      throw new Error(`Model not found: ${model}`);
    }

    this.currentModel = { ...availableModel };
    this.logger.log(`Switched to model: ${model}`);

    return {
      model: this.currentModel.name,
      status: "switched",
      type: this.currentModel.type,
    };
  }

  /**
   * Download or load a model
   */
  download(model: string): { model: string; status: string; path: string } {
    this.logger.log(`Downloading model: ${model}`);

    const modelInfo = this.availableModels.get(model);
    if (!modelInfo) {
      throw new Error(`Model not found: ${model}`);
    }

    return {
      model,
      status: "downloaded",
      path: `./models/${model}`,
    };
  }

  /**
   * List all available models
   */
  listModels(): ModelInfo[] {
    return Array.from(this.availableModels.values());
  }

  /**
   * Register a LoRA checkpoint
   */
  registerLoRACheckpoint(
    checkpointId: string,
    baseModel: string,
    trainingJobId: string,
    config: {
      rank: number;
      alpha: number;
    },
    metrics: {
      trainingLoss: number;
      validationAccuracy: number;
    }
  ): LoRACheckpoint {
    const checkpoint: LoRACheckpoint = {
      id: checkpointId,
      baseModel,
      rank: config.rank,
      alpha: config.alpha,
      trainingJobId,
      createdAt: Date.now(),
      metrics,
    };

    this.loraCheckpoints.set(checkpointId, checkpoint);
    this.logger.log(`LoRA checkpoint registered: ${checkpointId}`);

    // Register as new model variant
    const modelName = `${baseModel}-lora-${checkpointId}`;
    const modelInfo: ModelInfo = {
      name: modelName,
      type: "rlhf-trained",
      version: `lora-rank-${config.rank}`,
      checkpoint: checkpointId,
      hasLoRA: true,
      status: "ready",
      metrics: {
        accuracy: metrics.validationAccuracy,
        loss: metrics.trainingLoss,
      },
    };

    this.availableModels.set(modelName, modelInfo);
    this.logger.log(`Registered model variant: ${modelName}`);

    return checkpoint;
  }

  /**
   * Get LoRA checkpoint details
   */
  getLoRACheckpoint(checkpointId: string): LoRACheckpoint | null {
    return this.loraCheckpoints.get(checkpointId) || null;
  }

  /**
   * List all LoRA checkpoints
   */
  listLoRACheckpoints(): LoRACheckpoint[] {
    return Array.from(this.loraCheckpoints.values());
  }

  /**
   * Switch to a LoRA-enhanced model
   */
  switchToLoRAModel(checkpointId: string): {
    model: string;
    baseModel: string;
    checkpoint: string;
    loraConfig: { rank: number; alpha: number };
  } {
    const checkpoint = this.loraCheckpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`LoRA checkpoint not found: ${checkpointId}`);
    }

    const modelName = `${checkpoint.baseModel}-lora-${checkpointId}`;
    const model = this.availableModels.get(modelName);

    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }

    this.currentModel = { ...model };
    this.logger.log(
      `Switched to LoRA model: ${modelName} (checkpoint: ${checkpointId})`
    );

    return {
      model: modelName,
      baseModel: checkpoint.baseModel,
      checkpoint: checkpointId,
      loraConfig: {
        rank: checkpoint.rank,
        alpha: checkpoint.alpha,
      },
    };
  }

  /**
   * Update model status (e.g., during training)
   */
  updateModelStatus(
    model: string,
    status: "ready" | "loading" | "training"
  ): {
    model: string;
    status: string;
  } {
    const modelInfo = this.availableModels.get(model);
    if (!modelInfo) {
      throw new Error(`Model not found: ${model}`);
    }

    modelInfo.status = status;
    this.logger.log(`Updated model status: ${model} -> ${status}`);

    return {
      model,
      status,
    };
  }

  /**
   * Get model compatibility info
   */
  getModelInfo(modelName: string): ModelInfo | null {
    return this.availableModels.get(modelName) || null;
  }

  /**
   * Get statistics about registered models and checkpoints
   */
  getStats(): {
    totalModels: number;
    totalCheckpoints: number;
    currentModel: string;
    baseModels: string[];
    loraModels: string[];
  } {
    const baseModels = Array.from(this.availableModels.values())
      .filter((m) => m.type === "base")
      .map((m) => m.name);

    const loraModels = Array.from(this.availableModels.values())
      .filter((m) => m.hasLoRA)
      .map((m) => m.name);

    return {
      totalModels: this.availableModels.size,
      totalCheckpoints: this.loraCheckpoints.size,
      currentModel: this.currentModel.name,
      baseModels,
      loraModels,
    };
  }
}
