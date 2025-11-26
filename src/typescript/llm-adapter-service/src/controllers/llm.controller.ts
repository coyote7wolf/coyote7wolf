import {
  Controller,
  Post,
  Get,
  Body,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ProviderManagerService } from "../app/service/provider-manager.service";
import { AppConfigService } from "../config/app-config.service";

export class GenerateTextDto {
  prompt!: string;
  maxTokens?: number;
  temperature?: number;
  streaming?: boolean;
}

export class GenerateEmbeddingDto {
  text!: string;
}

@Controller("llm")
@UsePipes(new ValidationPipe({ transform: true }))
export class LLMController {
  constructor(
    private providerManager: ProviderManagerService,
    private appConfig: AppConfigService
  ) {}

  @Post("generate")
  async generateText(@Body() dto: GenerateTextDto) {
    try {
      if (dto.streaming) {
        throw new HttpException(
          "Use /llm/stream endpoint for streaming responses",
          HttpStatus.BAD_REQUEST
        );
      }

      const response = await this.providerManager.generateText(dto.prompt, {
        maxTokens: dto.maxTokens,
        temperature: dto.temperature,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : "Text generation failed",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("embedding")
  async generateEmbedding(@Body() dto: GenerateEmbeddingDto) {
    try {
      const response = await this.providerManager.generateEmbedding(dto.text);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : "Embedding generation failed",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health")
  async healthCheck() {
    try {
      const healthStatus = await this.providerManager.healthCheck();

      return {
        success: true,
        healthy: healthStatus,
        provider: "local",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        healthy: false,
        error: error instanceof Error ? error.message : "Health check failed",
      };
    }
  }

  @Get("config")
  async getConfig() {
    try {
      const modelInfo = await this.providerManager.getProviderInfo();

      return {
        success: true,
        data: {
          model: modelInfo,
          provider: "local",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : "Config retrieval failed",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
