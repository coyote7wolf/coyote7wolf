import { Logger } from "@nestjs/common";
import { LLMProvider, StreamingResponse } from "../interfaces/llm.interface";

export abstract class BaseProvider implements LLMProvider {
  protected readonly logger = new Logger(this.constructor.name);

  abstract generateText(prompt: string, options?: any): Promise<any>;
  abstract generateEmbedding(text: string): Promise<any>;

  // Optional streaming method
  generateTextStream?(
    prompt: string,
    options?: any
  ): AsyncGenerator<StreamingResponse>;

  protected abstract validateConfig(): void;

  async healthCheck(): Promise<boolean> {
    try {
      await this.generateText("test", { maxTokens: 1 });
      return true;
    } catch (error) {
      this.logger.error(
        `Health check failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return false;
    }
  }
}
