import { Injectable, Inject } from "@nestjs/common";
import { IDatabase } from "../../mock/mock_db";
import { IRedis } from "../../mock/mock_redis";
import { IMQ } from "../../mock/mock_mq";
import { IWebSocket } from "../../mock/mock_websocket";
import { ISSE } from "../../mock/mock_sse";
import { ILakehouse } from "../../mock/mock_lakehouse";
import { ILLM } from "../../mock/mock_llm";

@Injectable()
export class AgentService {
  constructor(
    @Inject("IDatabase") private readonly db: IDatabase,
    @Inject("IRedis") private readonly redis: IRedis,
    @Inject("IMQ") private readonly mq: IMQ,
    @Inject("IWebSocket") private readonly ws: IWebSocket,
    @Inject("ISSE") private readonly sse: ISSE,
    @Inject("ILakehouse") private readonly lakehouse: ILakehouse,
    @Inject("ILLM") private readonly llm: ILLM
  ) {}

  async createTask(data: any) {
    const task = await this.db.createTask(data);
    await this.redis.set(`task:${task.id}`, task);
    await this.mq.publish("agent.task.created", task);
    await this.lakehouse.save(task);
    await this.db.logAction({ type: "create", taskId: task.id });
    return {
      taskId: task.id,
      status: "success",
      ...(task.result ? { result: task.result } : {}),
      ...task,
    };
  }

  async getTaskById(id: string) {
    let task = await this.redis.get(`task:${id}`);
    if (!task) {
      task = await this.db.getTaskById(id);
    }
    if (!task) {
      return { error: "Task not found", taskId: id };
    }
    return {
      taskId: task.id,
      ...(task.result ? { result: task.result } : {}),
      ...task,
    };
  }
}
