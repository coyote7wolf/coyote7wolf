import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../src/app/app.controller";
import { AppService } from "../src/app/service/app.service";
import { ProviderManagerService } from "../src/app/service/provider-manager.service";
import { OpenAIProvider } from "../src/app/providers/openai.provider";
import { ClaudeProvider } from "../src/app/providers/claude.provider";
import { LocalProvider } from "../src/app/providers/local.provider";

describe("AppController", () => {
  let appController: AppController;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        ProviderManagerService,
        OpenAIProvider,
        ClaudeProvider,
        LocalProvider,
      ],
    }).compile();
    appController = app.get<AppController>(AppController);
  });
  it("should return health", () => {
    expect(appController.health()).toEqual({ status: "ok" });
  });
});
