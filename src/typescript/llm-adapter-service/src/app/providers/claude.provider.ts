import { Injectable } from "@nestjs/common";
import {
  BaseProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "./base.provider";

@Injectable()
export class ClaudeProvider extends BaseProvider {
  name = "claude";

  async chatCompletions(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    // Mock Claude implementation
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: `Claude response to: ${
              request.messages[request.messages.length - 1]?.content
            }`,
          },
        },
      ],
      usage: {
        prompt_tokens: 45,
        completion_tokens: 95,
        total_tokens: 140,
      },
    };
  }

  async embeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(request.input)
      ? request.input
      : [request.input];

    return {
      data: inputs.map((_, index) => ({
        embedding: Array.from({ length: 1024 }, () => Math.random() - 0.5), // Claude embedding dimension
        index,
      })),
      usage: {
        prompt_tokens: inputs.join(" ").length / 4,
        total_tokens: inputs.join(" ").length / 4,
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    // Mock availability check
    return true;
  }
}
