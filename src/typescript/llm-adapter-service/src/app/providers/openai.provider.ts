import { Injectable } from "@nestjs/common";
import {
  BaseProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "./base.provider";

@Injectable()
export class OpenAIProvider extends BaseProvider {
  name = "openai";

  async chatCompletions(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    // Mock OpenAI implementation
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: `OpenAI response to: ${
              request.messages[request.messages.length - 1]?.content
            }`,
          },
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150,
      },
    };
  }

  async embeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(request.input)
      ? request.input
      : [request.input];

    return {
      data: inputs.map((_, index) => ({
        embedding: Array.from({ length: 1536 }, () => Math.random() - 0.5), // OpenAI embedding dimension
        index,
      })),
      usage: {
        prompt_tokens: inputs.join(" ").length / 4, // Rough token estimate
        total_tokens: inputs.join(" ").length / 4,
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    // Mock availability check - could check API key, network connectivity, etc.
    return true;
  }
}
