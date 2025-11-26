import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LocalModelConfig, ServiceConfig } from "../dto/config.dto";

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get serviceConfig(): ServiceConfig {
    const config = new ServiceConfig();
    config.port = this.configService.get<number>("PORT", 3001);
    config.nodeEnv = this.configService.get<string>("NODE_ENV", "development");
    config.logLevel = this.configService.get<string>("LOG_LEVEL", "info");
    config.enableRequestLogging = this.configService.get<boolean>(
      "ENABLE_REQUEST_LOGGING",
      true
    );
    return config;
  }

  get localModelConfig(): LocalModelConfig {
    const config = new LocalModelConfig();
    // 直接讀取 .env 的 MODEL_PATH
    config.modelPath = this.configService.get<string>(
      "MODEL_PATH",
      "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    );
    config.modelType = "tinyllama";
    config.embeddingDimension = 768;
    config.contextLength = 2048;
    config.gpuLayers = 0;
    return config;
  }

  isProduction(): boolean {
    return this.serviceConfig.nodeEnv === "production";
  }

  isDevelopment(): boolean {
    return this.serviceConfig.nodeEnv === "development";
  }
}
