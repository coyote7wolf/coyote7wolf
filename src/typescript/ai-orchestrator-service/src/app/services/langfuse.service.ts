import { Injectable, OnModuleInit } from "@nestjs/common";
import { Langfuse } from "langfuse";

/**
 * Langfuse 集成服务 (Orchestrator)
 * 用于追踪 Orchestration 流程的完整工作流
 * Local Only: http://localhost:9200
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
   * 追踪 Orchestration 流程
   * @param eventType 事件类型 (document.updated, query.request, agent.task)
   * @param context 工作流 context
   * @param result 流程执行结果
   * @param duration 执行时间(ms)
   */
  async traceOrchestrationFlow(
    eventType: string,
    context: any,
    result: any,
    duration: number
  ): Promise<any> {
    try {
      const trace = this.langfuse?.trace({
        name: `orchestration-${eventType}`,
        input: JSON.stringify(context),
        output: JSON.stringify(result),
        metadata: {
          eventType,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      });

      return trace || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "[Langfuse] Orchestration trace error:",
        err?.message || String(error)
      );
      return null;
    }
  }

  /**
   * 追踪 RAG 检索步骤
   * @param traceId 父 trace ID
   * @param query 查询内容
   * @param documents 检索到的文档
   * @param duration 执行时间(ms)
   */
  async traceRAGRetrieval(
    traceId: string,
    query: string,
    documents: any[],
    duration: number
  ): Promise<any> {
    try {
      const span = this.langfuse?.span({
        traceId,
        name: "rag-retrieval",
        input: JSON.stringify({ query, documentCount: documents.length }),
        output: JSON.stringify(documents),
        metadata: {
          duration: `${duration}ms`,
          documentCount: documents.length,
        },
      });

      return span || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "[Langfuse] RAG retrieval trace error:",
        err?.message || String(error)
      );
      return null;
    }
  }

  /**
   * 追踪 Context 组合步骤
   * @param traceId 父 trace ID
   * @param context 原始 context
   * @param enrichedContext 增强后的 context
   * @param duration 执行时间(ms)
   */
  async traceContextEnrichment(
    traceId: string,
    context: any,
    enrichedContext: any,
    duration: number
  ): Promise<any> {
    try {
      const span = this.langfuse?.span({
        traceId,
        name: "context-enrichment",
        input: JSON.stringify(context),
        output: JSON.stringify(enrichedContext),
        metadata: {
          duration: `${duration}ms`,
        },
      });

      return span || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "[Langfuse] Context enrichment trace error:",
        err?.message || String(error)
      );
      return null;
    }
  }

  /**
   * 追踪服务调用（LLM Adapter, Agent, Memory）
   * @param traceId 父 trace ID
   * @param serviceName 服务名称
   * @param method 方法/endpoint
   * @param request 请求内容
   * @param response 响应内容
   * @param duration 执行时间(ms)
   */
  async traceServiceCall(
    traceId: string,
    serviceName: string,
    method: string,
    request: any,
    response: any,
    duration: number
  ): Promise<any> {
    try {
      const span = this.langfuse?.span({
        traceId,
        name: `service-${serviceName}-${method}`,
        input: JSON.stringify(request),
        output: JSON.stringify(response),
        metadata: {
          serviceName,
          method,
          duration: `${duration}ms`,
        },
      });

      return span || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "[Langfuse] Service call trace error:",
        err?.message || String(error)
      );
      return null;
    }
  }

  /**
   * 追踪 RLHF 反馈收集
   * @param eventType 事件类型
   * @param feedback 反馈数据
   * @param duration 处理时间(ms)
   */
  async traceRLHFFeedback(
    eventType: string,
    feedback: any,
    duration: number
  ): Promise<any> {
    try {
      const trace = this.langfuse?.trace({
        name: `rlhf-feedback-${eventType}`,
        input: JSON.stringify(feedback),
        output: JSON.stringify({ collected: true }),
        metadata: {
          eventType,
          duration: `${duration}ms`,
          feedbackType: feedback.feedback_type,
        },
      });

      return trace || null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "[Langfuse] RLHF feedback trace error:",
        err?.message || String(error)
      );
      return null;
    }
  }

  /**
   * 记录错误
   */
  async traceError(
    eventType: string,
    error: Error | string,
    context: Record<string, any> = {}
  ): Promise<any> {
    try {
      const trace = this.langfuse?.trace({
        name: `orchestration-error-${eventType}`,
        input: JSON.stringify(context),
        output: JSON.stringify({
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        }),
        metadata: {
          eventType,
          errorType:
            error instanceof Error ? error.constructor.name : "Unknown",
        },
      });

      return trace || null;
    } catch (err: unknown) {
      const e = err as Error;
      console.error(
        "[Langfuse] Error trace failed:",
        e?.message || String(err)
      );
      return null;
    }
  }

  /**
   * 刷新缓冲区
   */
  async flush(): Promise<void> {
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
   * 获取 Langfuse 实例
   */
  getInstance(): Langfuse | null {
    return this.langfuse;
  }
}
