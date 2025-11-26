import { Injectable } from "@nestjs/common";
import { ProviderManagerService } from "./provider-manager.service";
import {
  ChatCompletionRequest,
  EmbeddingRequest,
} from "../providers/base.provider";

@Injectable()
export class AppService {
  constructor(private readonly providerManager: ProviderManagerService) {}

  async chatCompletions(body: ChatCompletionRequest & { provider?: string }) {
    const { provider, ...request } = body;
    return await this.providerManager.chatCompletions(request, provider);
  }

  async completions(body: any) {
    // Convert completion to chat completion format
    const chatRequest: ChatCompletionRequest = {
      messages: [{ role: "user", content: body.prompt }],
      model: body.model,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
    };

    const response = await this.providerManager.chatCompletions(
      chatRequest,
      body.provider
    );
    return {
      text: response.choices[0]?.message?.content || "",
      usage: response.usage,
    };
  }

  async embeddings(body: EmbeddingRequest & { provider?: string }) {
    const { provider, ...request } = body;
    return await this.providerManager.embeddings(request, provider);
  }

  loraTrain(body: any) {
    return { status: "started", job_id: "mock_job_id" };
  }

  fineTune(body: any) {
    return { status: "started", job_id: "mock_job_id" };
  }

  loraStatus(jobId: string) {
    // mock 狀態查詢
    return { job_id: jobId, status: "running", progress: 42 };
  }

  loraResult(jobId: string) {
    // mock 結果回傳
    return { job_id: jobId, result: "mock lora result" };
  }

  fineTuneStatus(jobId: string) {
    // mock 狀態查詢
    return { job_id: jobId, status: "completed", progress: 100 };
  }

  fineTuneResult(jobId: string) {
    // mock 結果回傳
    return { job_id: jobId, result: "mock fine-tune result" };
  }

  health() {
    return { status: "ok" };
  }
}
