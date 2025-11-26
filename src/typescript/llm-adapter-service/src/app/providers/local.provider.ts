import { Injectable } from "@nestjs/common";
import {
  BaseProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "./base.provider";

@Injectable()
export class LocalProvider extends BaseProvider {
  name = "local";

  async chatCompletions(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    // Mock Local LLM implementation
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: `Local model response to: ${
              request.messages[request.messages.length - 1]?.content
            }`,
          },
        },
      ],
      usage: {
        prompt_tokens: 40,
        completion_tokens: 80,
        total_tokens: 120,
      },
    };
  }

  async embeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(request.input)
      ? request.input
      : [request.input];

    return {
      data: inputs.map((_, index) => ({
        embedding: Array.from({ length: 768 }, () => Math.random() - 0.5), // Local model embedding dimension
        index,
      })),
      usage: {
        prompt_tokens: inputs.join(" ").length / 4,
        total_tokens: inputs.join(" ").length / 4,
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    // Mock availability check - could check if local model is loaded
    return true;
  }
}
