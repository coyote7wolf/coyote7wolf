import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AgentService } from "./agent.service";

@Controller()
export class AgentGrpcController {
  constructor(private readonly agentService: AgentService) {}

  @GrpcMethod("AgentService", "CreateTask")
  async createTaskGrpc(data: any) {
    return this.agentService.createTask(data);
  }

  @GrpcMethod("AgentService", "GetTask")
  async getTaskGrpc(data: { id: string }) {
    return this.agentService.getTaskById(data.id);
  }
}
