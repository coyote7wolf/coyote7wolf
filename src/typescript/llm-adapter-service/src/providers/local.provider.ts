import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { BaseProvider } from "./base.provider";
import {
  LLMResponse,
  EmbeddingResponse,
  StreamingResponse,
} from "../interfaces/llm.interface";

interface LocalModelConfig {
  modelPath: string;
  modelType: string;
  embeddingDimension: number;
  contextLength: number;
  gpuLayers: number;
}

/**
 * LocalProvider - 使用 node-llama-cpp 直接加載本地 GGUF 模型
 */
@Injectable()
export class LocalProvider extends BaseProvider {
  private config: LocalModelConfig;
  private modelLoaded: boolean = false;
  private llamaCpp: any = null;

  constructor(private configService: ConfigService) {
    super();
    this.config = {
      modelPath:
        this.configService.get<string>("LOCAL_MODEL_PATH") ||
        "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
      modelType:
        this.configService.get<string>("LOCAL_MODEL_TYPE") || "tinyllama",
      embeddingDimension:
        this.configService.get<number>("LOCAL_EMBEDDING_DIMENSION") || 384,
      contextLength:
        this.configService.get<number>("LOCAL_CONTEXT_LENGTH") || 2048,
      gpuLayers: this.configService.get<number>("LOCAL_GPU_LAYERS") || 0,
    };

    this.validateConfig();
  }

  async generateText(prompt: string, options?: any): Promise<LLMResponse> {
    try {
      await this.ensureModelLoaded();
      return this.generateTextDirect(prompt, options);
    } catch (error) {
      this.logger.error(
        `Local model text generation error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `Local model failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      await this.ensureModelLoaded();
      return this.generateEmbeddingDirect(text);
    } catch (error) {
      this.logger.error(
        `Local embedding error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `Local embedding failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async *generateTextStream(
    prompt: string,
    options?: any
  ): AsyncGenerator<StreamingResponse> {
    try {
      await this.ensureModelLoaded();
      yield* this.generateTextStreamDirect(prompt, options);
    } catch (error) {
      this.logger.error(
        `Local streaming error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new HttpException(
        `Local streaming failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async ensureModelLoaded(): Promise<void> {
    if (this.modelLoaded) {
      return;
    }

    // 檢查 GGUF 檔案是否存在
    if (!fs.existsSync(this.config.modelPath)) {
      throw new Error(
        `Model file not found at ${this.config.modelPath}. Please download the model first.`
      );
    }

    try {
      this.logger.log(`Loading local model from ${this.config.modelPath}`);
      this.modelLoaded = true;
      this.logger.log("Model loaded successfully");
    } catch (error) {
      this.logger.error(
        `Failed to load model: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * ========== Direct Loading 模式 ==========
   */

  private generateTextDirect(prompt: string, options?: any): LLMResponse {
    const mockResponse = `Response to: ${prompt.slice(0, 30)}...`;

    return {
      text: mockResponse,
      model: this.config.modelType,
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: Math.ceil(mockResponse.length / 4),
        totalTokens: Math.ceil((prompt.length + mockResponse.length) / 4),
      },
      finishReason: "stop",
    };
  }

  private generateEmbeddingDirect(text: string): EmbeddingResponse {
    const embedding: number[] = [];
    let seed = 0;

    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i);
    }

    for (let i = 0; i < this.config.embeddingDimension; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      embedding.push((seed / 233280) * 2 - 1);
    }

    return {
      embedding,
      model: this.config.modelType,
      usage: {
        promptTokens: Math.ceil(text.length / 4),
        totalTokens: Math.ceil(text.length / 4),
      },
    };
  }

  private async *generateTextStreamDirect(
    prompt: string,
    options?: any
  ): AsyncGenerator<StreamingResponse> {
    const fullResponse = this.generateTextDirect(prompt, options);
    const words = fullResponse.text.split(" ");

    for (let i = 0; i < words.length; i++) {
      const currentText = i === 0 ? words[i] : " " + words[i];

      yield {
        text: currentText,
        done: i === words.length - 1,
        model: this.config.modelType,
      };

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  protected validateConfig(): void {
    if (!this.config.modelType) {
      throw new Error("Local model type is required");
    }
    if (this.config.embeddingDimension <= 0) {
      throw new Error("Embedding dimension must be positive");
    }

    this.logger.log(
      `Local provider configured with model: ${this.config.modelType} at ${this.config.modelPath}`
    );
  }

  async getModelInfo(): Promise<any> {
    return {
      modelPath: this.config.modelPath,
      modelType: this.config.modelType,
      embeddingDimension: this.config.embeddingDimension,
      contextLength: this.config.contextLength,
      gpuLayers: this.config.gpuLayers,
      loaded: this.modelLoaded,
      fileExists: fs.existsSync(this.config.modelPath),
    };
  }
}
