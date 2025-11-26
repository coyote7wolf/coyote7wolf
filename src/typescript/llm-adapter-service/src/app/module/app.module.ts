import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "../app.controller";
import { AppService } from "../service/app.service";
import { ProviderManagerService } from "../service/provider-manager.service";
import { OpenAIProvider } from "../providers/openai.provider";
import { ClaudeProvider } from "../providers/claude.provider";
import { LocalProvider } from "../providers/local.provider";
import { LLMController } from "../../controllers/llm.controller";
import { AppConfigService } from "../../config/app-config.service";
import { RLHFService } from "../service/rlhf.service";
import { RLHFController } from "../rlhf.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  controllers: [AppController, LLMController, RLHFController],
  providers: [
    AppService,
    ProviderManagerService,
    OpenAIProvider,
    ClaudeProvider,
    LocalProvider,
    AppConfigService,
    RLHFService,
  ],
})
export class AppModule {}
