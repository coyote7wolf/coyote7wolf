import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LocalProvider } from "./local.provider";
import { BaseProvider } from "./base.provider";
import {
  LLMResponse,
  EmbeddingResponse,
  StreamingResponse,
} from "../interfaces/llm.interface";

@Injectable()
export class ProviderManagerService {
  private readonly logger = new Logger(ProviderManagerService.name);
  private localProvider: LocalProvider;

  constructor(localProvider: LocalProvider) {
    this.localProvider = localProvider;
  }

  async generateText(prompt: string, options?: any): Promise<LLMResponse> {
    this.logger.log("Generating text using LocalProvider");
    return await this.localProvider.generateText(prompt, options);
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    this.logger.log("Generating embedding using LocalProvider");
    return await this.localProvider.generateEmbedding(text);
  }

  async *generateTextStream(
    prompt: string,
    options?: any
  ): AsyncGenerator<StreamingResponse> {
    this.logger.log("Starting text stream using LocalProvider");
    if (this.localProvider.generateTextStream) {
      yield* this.localProvider.generateTextStream(prompt, options);
    } else {
      const response = await this.localProvider.generateText(prompt, options);
      yield {
        text: response.text,
        done: true,
        model: response.model,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    return await this.localProvider.healthCheck();
  }
  async getProviderInfo(): Promise<any> {
    return await this.localProvider.getModelInfo();
  }
}
