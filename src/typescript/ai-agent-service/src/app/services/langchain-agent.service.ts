import { Injectable } from "@nestjs/common";

/**
 * Langchain Agent Service (Mock Implementation)
 * 用于构建和执行 Agent 任务推理
 * 支持 7 种任务类型：summarize, analyze, recommend, correct, generate, extract, classify
 * Local Only - 使用本地 LLM
 */
@Injectable()
export class LangchainAgentService {
  private supportedTaskTypes = [
    "summarize",
    "analyze",
    "recommend",
    "correct",
    "generate",
    "extract",
    "classify",
  ];

  constructor() {
    // Mock initialization
  }

  /**
   * 执行任务
   * @param taskType 任务类型
   * @param input 输入内容
   * @returns 任务执行结果
   */
  async executeTask(taskType: string, input: string): Promise<any> {
    const startTime = Date.now();

    try {
      if (!this.isTaskTypeSupported(taskType)) {
        throw new Error(`Task type '${taskType}' not supported`);
      }

      // Mock execution
      const result = await this.mockExecuteTask(taskType, input);
      const duration = Date.now() - startTime;

      return {
        success: true,
        taskType,
        result,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error(
        `[LangchainAgentService] Error executing task ${taskType}:`,
        error
      );

      return {
        success: false,
        taskType,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Mock task execution based on task type
   */
  private async mockExecuteTask(
    taskType: string,
    input: string
  ): Promise<string> {
    const responses: Record<string, string> = {
      summarize: `摘要：${input.substring(0, 100)}...`,
      analyze: `分析：该文本的主要内容是${input.substring(0, 50)}`,
      recommend: `建议：基于输入内容，建议1、建议2、建议3`,
      correct: `修正：文本已修正，主要改正了语法和拼写错误`,
      generate: `生成的内容：${input.toUpperCase()}`,
      extract: `提取的信息：关键词、实体、日期等`,
      classify: `分类：该文本属于${Math.random() > 0.5 ? "正面" : "负面"}类别`,
    };

    return responses[taskType] || `已执行：${taskType}`;
  }

  /**
   * 执行带有上下文的任务
   * @param taskType 任务类型
   * @param input 输入内容
   * @param context 上下文信息
   * @returns 任务执行结果
   */
  async executeTaskWithContext(
    taskType: string,
    input: string,
    context: Record<string, any> = {}
  ): Promise<any> {
    const startTime = Date.now();

    try {
      if (!this.isTaskTypeSupported(taskType)) {
        throw new Error(`Task type '${taskType}' not supported`);
      }

      // 使用上下文增强输入
      const enhancedInput = `${Object.entries(context)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(", ")} - ${input}`;

      const result = await this.mockExecuteTask(taskType, enhancedInput);
      const duration = Date.now() - startTime;

      return {
        success: true,
        taskType,
        result,
        context,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error(
        `[LangchainAgentService] Error executing task with context ${taskType}:`,
        error
      );

      return {
        success: false,
        taskType,
        error: error instanceof Error ? error.message : "Unknown error",
        context,
        duration,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取支持的任务类型
   */
  getSupportedTaskTypes(): string[] {
    return this.supportedTaskTypes;
  }

  /**
   * 检查任务类型是否支持
   */
  isTaskTypeSupported(taskType: string): boolean {
    return this.supportedTaskTypes.includes(taskType);
  }
}
