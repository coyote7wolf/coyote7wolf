import { Injectable } from "@nestjs/common";
import { RedisCacheService } from "./redis-cache.service";
import { AgentActDto, TaskResultDto } from "../dto/agent.dto";
// Simple UUID v4 implementation
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface TaskProcessor {
  process(input: string, context?: any, parameters?: any): Promise<any>;
}

@Injectable()
export class SummarizeProcessor implements TaskProcessor {
  async process(input: string, context?: any, parameters?: any): Promise<any> {
    // Mock summarization logic
    const sentences = input.split(".").filter((s) => s.trim().length > 0);
    const maxSentences = parameters?.max_length || 3;
    const summary = sentences.slice(0, maxSentences).join(". ") + ".";

    return {
      summary,
      original_length: input.length,
      summary_length: summary.length,
      compression_ratio: (input.length / summary.length).toFixed(2),
    };
  }
}

@Injectable()
export class AnalyzeProcessor implements TaskProcessor {
  async process(input: string, context?: any, parameters?: any): Promise<any> {
    // Mock analysis logic
    const wordCount = input.split(" ").length;
    const sentenceCount = input
      .split(".")
      .filter((s) => s.trim().length > 0).length;
    const avgWordsPerSentence = (wordCount / sentenceCount).toFixed(1);

    // Simple sentiment analysis mock
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "positive",
    ];
    const negativeWords = ["bad", "terrible", "awful", "horrible", "negative"];

    const words = input.toLowerCase().split(" ");
    const positiveCount = words.filter((word) =>
      positiveWords.includes(word)
    ).length;
    const negativeCount = words.filter((word) =>
      negativeWords.includes(word)
    ).length;

    let sentiment = "neutral";
    if (positiveCount > negativeCount) sentiment = "positive";
    else if (negativeCount > positiveCount) sentiment = "negative";

    return {
      word_count: wordCount,
      sentence_count: sentenceCount,
      avg_words_per_sentence: avgWordsPerSentence,
      sentiment,
      sentiment_scores: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: wordCount - positiveCount - negativeCount,
      },
    };
  }
}

@Injectable()
export class RecommendProcessor implements TaskProcessor {
  async process(input: string, context?: any, parameters?: any): Promise<any> {
    // Mock recommendation logic
    const keywords = input
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 4);
    const uniqueKeywords = [...new Set(keywords)];

    const recommendations = uniqueKeywords
      .slice(0, 5)
      .map((keyword, index) => ({
        id: index + 1,
        title: `Recommendation for ${keyword}`,
        description: `This is a mock recommendation based on the keyword "${keyword}"`,
        relevance_score: Math.random().toFixed(2),
        category: parameters?.category || "general",
      }));

    return {
      recommendations,
      total_count: recommendations.length,
      keywords_analyzed: uniqueKeywords,
    };
  }
}

@Injectable()
export class TaskReasoningService {
  private processors: Map<string, TaskProcessor> = new Map();

  constructor(
    private readonly cacheService: RedisCacheService,
    private readonly summarizeProcessor: SummarizeProcessor,
    private readonly analyzeProcessor: AnalyzeProcessor,
    private readonly recommendProcessor: RecommendProcessor
  ) {
    // Register task processors
    this.processors.set("summarize", this.summarizeProcessor);
    this.processors.set("analyze", this.analyzeProcessor);
    this.processors.set("recommend", this.recommendProcessor);

    // Add mock processors for other tasks
    this.processors.set("correct", new MockTaskProcessor("correct"));
    this.processors.set("generate", new MockTaskProcessor("generate"));
    this.processors.set("extract", new MockTaskProcessor("extract"));
    this.processors.set("classify", new MockTaskProcessor("classify"));
  }

  async executeTask(request: AgentActDto): Promise<any> {
    const taskId = uuidv4();
    const startTime = Date.now();

    try {
      // Check cache first if session_id is provided
      if (request.session_id) {
        const cacheKey = `task:${request.task}:${this.hashInput(
          request.input
        )}`;
        const cachedResult = await this.cacheService.get(cacheKey);

        if (cachedResult) {
          return {
            task_id: taskId,
            task: request.task,
            status: "completed",
            result: cachedResult,
            reasoning: "Retrieved from cache",
            cached: true,
            processing_time_ms: Date.now() - startTime,
          };
        }
      }

      // Get processor for the task
      const processor = this.processors.get(request.task);
      if (!processor) {
        throw new Error(`Unsupported task type: ${request.task}`);
      }

      // Store task status as processing
      const processingTask: TaskResultDto = {
        task_id: taskId,
        task: request.task,
        status: "processing",
        metadata: {
          start_time: startTime,
          input_length: request.input.length,
        },
      };

      await this.cacheService.setTaskResult(taskId, processingTask, 300); // 5 minutes

      // Execute the task
      const result = await processor.process(
        request.input,
        request.context,
        request.parameters
      );

      // Calculate confidence score based on task type and result
      const confidence = this.calculateConfidence(request.task, result);

      // Prepare final result
      const finalResult: TaskResultDto = {
        task_id: taskId,
        task: request.task,
        status: "completed",
        result,
        reasoning: this.generateReasoning(request.task, request.input, result),
        confidence,
        metadata: {
          start_time: startTime,
          end_time: Date.now(),
          processing_time_ms: Date.now() - startTime,
          input_length: request.input.length,
          session_id: request.session_id,
        },
      };

      // Cache the result
      if (request.session_id) {
        const cacheKey = `task:${request.task}:${this.hashInput(
          request.input
        )}`;
        await this.cacheService.set(cacheKey, result, 3600); // 1 hour
      }

      // Store final result
      await this.cacheService.setTaskResult(taskId, finalResult, 3600);

      return finalResult;
    } catch (error) {
      const errorResult: TaskResultDto = {
        task_id: taskId,
        task: request.task,
        status: "failed",
        result: null,
        reasoning: `Task failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        metadata: {
          start_time: startTime,
          end_time: Date.now(),
          processing_time_ms: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };

      await this.cacheService.setTaskResult(taskId, errorResult, 300);
      return errorResult;
    }
  }

  async getTaskResult(taskId: string): Promise<TaskResultDto | null> {
    return await this.cacheService.getTaskResult<TaskResultDto>(taskId);
  }

  private calculateConfidence(task: string, result: any): number {
    // Mock confidence calculation
    switch (task) {
      case "summarize":
        return result.compression_ratio > 2 ? 0.9 : 0.7;
      case "analyze":
        return result.word_count > 10 ? 0.85 : 0.6;
      case "recommend":
        return result.recommendations?.length > 0 ? 0.8 : 0.5;
      default:
        return 0.75;
    }
  }

  private generateReasoning(task: string, input: string, result: any): string {
    switch (task) {
      case "summarize":
        return `Analyzed ${result.original_length} characters and created a summary with ${result.summary_length} characters (${result.compression_ratio}x compression)`;
      case "analyze":
        return `Processed ${result.word_count} words across ${result.sentence_count} sentences with ${result.sentiment} sentiment`;
      case "recommend":
        return `Generated ${result.total_count} recommendations based on ${result.keywords_analyzed?.length} unique keywords`;
      default:
        return `Executed ${task} task on input of ${input.length} characters`;
    }
  }

  private hashInput(input: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }
}

// Mock processor for tasks that don't have specific implementations
class MockTaskProcessor implements TaskProcessor {
  constructor(private taskType: string) {}

  async process(input: string, context?: any, parameters?: any): Promise<any> {
    return {
      task_type: this.taskType,
      input_length: input.length,
      mock_result: `Mock result for ${this.taskType} task`,
      processed_at: new Date().toISOString(),
      parameters: parameters || {},
    };
  }
}
