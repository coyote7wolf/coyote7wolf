import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { AgentService } from "./agent.service";

@Controller("v1/agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("act")
  async act(@Body() body: any) {
    // act = create agent task
    return this.agentService.createTask(body);
  }

  @Get("task/:taskId")
  async getTask(@Param("taskId") taskId: string) {
    return this.agentService.getTaskById(taskId);
  }

  @Get("health")
  async health() {
    // 可根據實際狀態回傳
    return { status: "ok" };
  }
}
