import { Test, TestingModule } from "@nestjs/testing";
import { AgentController } from "../src/modules/agent/agent.controller";
import { AgentService } from "../src/modules/agent/agent.service";

describe("AgentController", () => {
  let controller: AgentController;
  let service: AgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      providers: [
        {
          provide: AgentService,
          useValue: {
            createTask: jest.fn().mockImplementation((body) => ({
              ...body,
              taskId: "mock-task",
              status: "pending",
              result: "",
              message: "",
            })),
            getTaskById: jest.fn().mockImplementation((id) => ({
              taskId: id,
              status: "pending",
              result: "",
              message: "",
            })),
          },
        },
      ],
    }).compile();
    controller = module.get<AgentController>(AgentController);
    service = module.get<AgentService>(AgentService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should create agent task", async () => {
    const body = {
      userId: "u1",
      role: "admin",
      taskType: "suggestion",
      documentId: "doc1",
      lang: "zh-TW",
      params: { prompt: "請給建議" },
    };
    const result = await controller.act(body);
    expect(result).toHaveProperty("taskId");
    expect(result).toHaveProperty("status", "pending");
  });

  it("should get agent task by id", async () => {
    const result = await controller.getTask("mock-task");
    expect(result).toHaveProperty("taskId", "mock-task");
  });
});
