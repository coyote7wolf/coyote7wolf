import { Module } from "@nestjs/common";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { MockDB } from "../../mock/mock_db";
import { MockRedis } from "../../mock/mock_redis";
import { MockMQ } from "../../mock/mock_mq";
import { MockWebSocket } from "../../mock/mock_websocket";
import { MockSSE } from "../../mock/mock_sse";
import { MockLakehouse } from "../../mock/mock_lakehouse";
import { MockLLM } from "../../mock/mock_llm";

@Module({
  controllers: [AgentController],
  providers: [
    AgentService,
    { provide: "IDatabase", useClass: MockDB },
    { provide: "IRedis", useClass: MockRedis },
    { provide: "IMQ", useClass: MockMQ },
    { provide: "IWebSocket", useClass: MockWebSocket },
    { provide: "ISSE", useClass: MockSSE },
    { provide: "ILakehouse", useClass: MockLakehouse },
    { provide: "ILLM", useClass: MockLLM },
  ],
})
export class AgentModule {}
