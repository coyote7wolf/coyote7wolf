import { Injectable, OnModuleInit } from "@nestjs/common";
import { Langfuse } from "langfuse";

/**
 * Langfuse 集成服务
 * 用于追踪 Agent 任务执行的完整流程
 * Local Only: http://localhost:3000
 */
@Injectable()
export class LangfuseService implements OnModuleInit {
  private langfuse: Langfuse | null = null;

  onModuleInit() {
    // 连接到本地 Langfuse 服务
    if (process.env.NODE_ENV !== "test") {
      this.langfuse = new Langfuse({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY || "pk_local_dev",
        secretKey: process.env.LANGFUSE_SECRET_KEY || "sk_local_dev",
        baseUrl: process.env.LANGFUSE_BASE_URL || "http://localhost:9200",
      });
    }
  }

  /**
   * 追踪 Agent 任务执行
   * @param taskId 任务 ID
   * @param taskType 任务类型 (summarize, analyze, recommend, etc.)
   * @param input 输入数据
   * @param result 执行结果
   * @param duration 执行时间(ms)
   * @param metadata 额外元数据
   */
  async traceAgentTask(
    taskId: string,
    taskType: string,
    input: any,
    result: any,
    duration: number,
    metadata: Record<string, any> = {}
  ): Promise<any> {
    try {
      const trace = this.langfuse?.trace({
        name: `agent-${taskType}`,
        input: JSON.stringify(input),
        output: JSON.stringify(result),
        metadata: {
          taskId,
          taskType,
          duration: `${duration}ms`,
          ...metadata,
        },
      });

      return trace || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[Langfuse] Trace error:", err?.message || String(error));
      // 不中断业务流程
      return null;
    }
  }

  /**
   * 追踪处理器执行
   * @param parentTraceId 父 trace ID
   * @param processorName 处理器名称
   * @param input 输入
   * @param output 输出
   * @param duration 执行时间(ms)
   */
  async traceProcessor(
    parentTraceId: string,
    processorName: string,
    input: any,
    output: any,
    duration: number
  ): Promise<any> {
    try {
      const span = this.langfuse?.span({
        traceId: parentTraceId,
        name: `processor-${processorName}`,
        input: JSON.stringify(input),
        output: JSON.stringify(output),
        metadata: {
          processorName,
          duration: `${duration}ms`,
        },
      });

      return span || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "[Langfuse] Processor trace error:",
        err?.message || String(error)
      );
      return null;
    }
  }

  /**
   * 追踪 Chain 执行
   * @param chainName Chain 名称
   * @param input 输入
   * @param output 输出
   * @param duration 执行时间(ms)
   * @param steps Chain 的各个步骤
   */
  async traceChainExecution(
    chainName: string,
    input: any,
    output: any,
    duration: number,
    steps: Array<{
      name: string;
      input: any;
      output: any;
      duration: number;
    }> = []
  ): Promise<any> {
    try {
      const trace = this.langfuse?.trace({
        name: `chain-${chainName}`,
        input: JSON.stringify(input),
        output: JSON.stringify(output),
        metadata: {
          chainName,
          duration: `${duration}ms`,
          stepCount: steps.length,
        },
      });

      // 记录每个步骤
      for (const step of steps) {
        this.langfuse?.span({
          traceId: trace?.traceId,
          name: `step-${step.name}`,
          input: JSON.stringify(step.input),
          output: JSON.stringify(step.output),
          metadata: {
            duration: `${step.duration}ms`,
          },
        });
      }

      return trace || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "[Langfuse] Chain trace error:",
        err?.message || String(error)
      );
      return null;
    }
  }
  /**
   * 记录错误
   * @param taskId 任务 ID
   * @param error 错误信息
   * @param context 上下文信息
   */
  async traceError(
    taskId: string,
    error: Error | string,
    context: Record<string, any> = {}
  ): Promise<any> {
    try {
      const trace = this.langfuse?.trace({
        name: "agent-error",
        input: JSON.stringify(context),
        output: JSON.stringify({
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        }),
        metadata: {
          taskId,
          errorType:
            error instanceof Error ? error.constructor.name : "Unknown",
          ...context,
        },
      });

      return trace || null;
    } catch (err: unknown) {
      const error = err as Error;
      console.error(
        "[Langfuse] Error trace failed:",
        error?.message || String(err)
      );
      return null;
    }
  }

  /**
   * 刷新缓冲区
   * 确保所有 trace 都被发送到 Langfuse
   */
  async flush() {
    try {
      if (this.langfuse) {
        await this.langfuse.flush();
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[Langfuse] Flush error:", err?.message || String(error));
    }
  }

  /**
   * 获取 Langfuse 实例（如需直接使用）
   */
  getInstance(): Langfuse | null {
    return this.langfuse;
  }
}
