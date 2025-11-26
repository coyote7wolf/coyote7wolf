import { Injectable, BadRequestException } from "@nestjs/common";
import {
  BaseProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "../providers/base.provider";
import { OpenAIProvider } from "../providers/openai.provider";
import { ClaudeProvider } from "../providers/claude.provider";
import { LocalProvider } from "../providers/local.provider";

export type ProviderType = "openai" | "claude" | "local";

@Injectable()
export class ProviderManagerService {
  private providers: Map<ProviderType, BaseProvider> = new Map();
  private defaultProvider: ProviderType = "local";

  constructor(
    private openaiProvider: OpenAIProvider,
    private claudeProvider: ClaudeProvider,
    private localProvider: LocalProvider
  ) {
    this.providers.set("openai", this.openaiProvider);
    this.providers.set("claude", this.claudeProvider);
    this.providers.set("local", this.localProvider);
  }

  async getProvider(providerName?: string): Promise<BaseProvider> {
    const targetProvider =
      (providerName as ProviderType) || this.defaultProvider;

    const provider = this.providers.get(targetProvider);
    if (!provider) {
      throw new BadRequestException(`Provider '${targetProvider}' not found`);
    }

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      // Fallback to default provider if specified provider is unavailable
      if (targetProvider !== this.defaultProvider) {
        const fallbackProvider = this.providers.get(this.defaultProvider);
        if (fallbackProvider && (await fallbackProvider.isAvailable())) {
          return fallbackProvider;
        }
      }
      throw new BadRequestException(
        `Provider '${targetProvider}' is currently unavailable`
      );
    }

    return provider;
  }

  async chatCompletions(
    request: ChatCompletionRequest,
    providerName?: string
  ): Promise<ChatCompletionResponse> {
    const provider = await this.getProvider(providerName);
    return provider.chatCompletions(request);
  }

  async embeddings(
    request: EmbeddingRequest,
    providerName?: string
  ): Promise<EmbeddingResponse> {
    const provider = await this.getProvider(providerName);
    return provider.embeddings(request);
  }

  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];

    for (const [name, provider] of this.providers.entries()) {
      if (await provider.isAvailable()) {
        available.push(name);
      }
    }

    return available;
  }

  setDefaultProvider(providerName: ProviderType): void {
    if (!this.providers.has(providerName)) {
      throw new BadRequestException(`Provider '${providerName}' not found`);
    }
    this.defaultProvider = providerName;
  }

  getDefaultProvider(): ProviderType {
    return this.defaultProvider;
  }

  /**
   * LLM-specific endpoints (simplified interface)
   */
  async generateText(prompt: string, options?: any): Promise<any> {
    const chatRequest: ChatCompletionRequest = {
      messages: [{ role: "user", content: prompt }],
      model: options?.model || "local",
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
    };
    const response = await this.chatCompletions(chatRequest);
    return response;
  }

  async generateEmbedding(text: string): Promise<any> {
    const request: EmbeddingRequest = {
      input: text,
      model: "local",
    };
    return await this.embeddings(request);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      return await provider.isAvailable();
    } catch {
      return false;
    }
  }

  async getProviderInfo(): Promise<any> {
    try {
      const provider = await this.getProvider();
      return {
        model: "local",
        available: await provider.isAvailable(),
        type: this.defaultProvider,
      };
    } catch {
      return { error: "Provider info unavailable" };
    }
  }
}
