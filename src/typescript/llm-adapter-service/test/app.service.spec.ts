import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "../src/app/service/app.service";
import { ProviderManagerService } from "../src/app/service/provider-manager.service";
import { OpenAIProvider } from "../src/app/providers/openai.provider";
import { ClaudeProvider } from "../src/app/providers/claude.provider";
import { LocalProvider } from "../src/app/providers/local.provider";

describe("AppService", () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        ProviderManagerService,
        OpenAIProvider,
        ClaudeProvider,
        LocalProvider,
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it("should return health", () => {
    expect(service.health()).toEqual({ status: "ok" });
  });

  it("should return mock completion", async () => {
    const result = await service.completions({ prompt: "test" });
    expect(result).toHaveProperty("text");
    expect(result).toHaveProperty("usage");
    expect(typeof result.text).toBe("string");
  });
});
