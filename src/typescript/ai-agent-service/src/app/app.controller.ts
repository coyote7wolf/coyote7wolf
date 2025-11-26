import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Logger,
} from "@nestjs/common";
import { TaskReasoningService } from "./services/task-reasoning.service";
import { RedisCacheService } from "./services/redis-cache.service";
import { AppService } from "./service/app.service";
import { AgentActDto } from "./dto/agent.dto";

@Controller("v1/agent")
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly taskReasoningService: TaskReasoningService,
    private readonly cacheService: RedisCacheService,
    private readonly appService: AppService
  ) {}

  @Post("act")
  @UsePipes(new ValidationPipe({ transform: true }))
  async act(@Body() body: AgentActDto) {
    return await this.taskReasoningService.executeTask(body);
  }

  @Get("task/:taskId")
  async getTaskResult(@Param("taskId") taskId: string) {
    const result = await this.taskReasoningService.getTaskResult(taskId);
    if (!result) {
      return { error: "Task not found", task_id: taskId };
    }
    return result;
  }

  /**
   * GET /v1/agent/model/current
   * Get current active model version
   */
  @Get("model/current")
  async getCurrentModel() {
    const model = await this.appService.queryCurrentModel();

    return {
      success: true,
      data: model,
    };
  }

  /**
   * POST /v1/agent/model/switch/:version
   * Switch to specific model version
   */
  @Post("model/switch/:version")
  @HttpCode(200)
  async switchModel(@Param("version") version: string) {
    const result = await this.appService.switchModel(version);

    return {
      success: result.switched,
      data: result,
      message: result.switched
        ? `Model switched to ${version}`
        : `Failed to switch to ${version}`,
    };
  }

  /**
   * POST /v1/agent/task/execute
   * Execute task with model tracking
   */
  @Post("task/execute")
  @HttpCode(201)
  async executeTaskWithModel(
    @Body()
    payload: {
      taskId: string;
      taskType: string;
      input: string;
      context?: any;
    }
  ) {
    const result = await this.appService.executeTaskWithModel(payload);

    return {
      success: true,
      data: result,
      message: `Task executed with model: ${result.modelUsed}`,
    };
  }

  /**
   * POST /v1/agent/task/batch
   * Execute batch tasks with model tracking
   */
  @Post("task/batch")
  @HttpCode(201)
  async executeTaskBatch(
    @Body()
    payload: {
      tasks: Array<{
        taskId: string;
        taskType: string;
        input: string;
      }>;
    }
  ) {
    const results = await this.appService.executeTaskBatch(payload.tasks);

    return {
      success: true,
      data: {
        taskCount: payload.tasks.length,
        results,
      },
      message: `Batch executed ${payload.tasks.length} tasks`,
    };
  }

  @Get("health")
  async health() {
    const redisHealth = await this.cacheService.healthCheck();
    const currentModel = this.appService.getCurrentModel();

    return {
      status: "ok",
      services: {
        redis: redisHealth,
      },
      model: currentModel,
      timestamp: new Date().toISOString(),
    };
  }

  @Post("session")
  async createSession(@Body() body: { user_id: string; context?: any }) {
    const sessionId = this.generateUUID();
    const sessionData = {
      user_id: body.user_id,
      context: body.context || {},
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    };

    await this.cacheService.setSessionData(sessionId, sessionData, 3600); // 1 hour
    return { session_id: sessionId, ...sessionData };
  }

  @Get("session/:sessionId")
  async getSession(@Param("sessionId") sessionId: string) {
    const sessionData = await this.cacheService.getSessionData(sessionId);
    if (!sessionData) {
      return { error: "Session not found", session_id: sessionId };
    }
    return { session_id: sessionId, ...sessionData };
  }

  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
