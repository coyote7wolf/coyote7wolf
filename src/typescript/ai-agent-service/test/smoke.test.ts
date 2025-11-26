import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AgentModule } from "../src/modules/agent/agent.module";

describe("Agent API Smoke Test", () => {
  let app: INestApplication;
  let createdTaskId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AgentModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/agent/act should create agent task", async () => {
    const res = await request(app.getHttpServer())
      .post("/v1/agent/act")
      .set("Authorization", "Bearer mock-token")
      .send({
        userId: "u1",
        role: "admin",
        taskType: "suggestion",
        documentId: "doc1",
        lang: "zh-TW",
        params: { prompt: "請給建議" },
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("taskId");
    createdTaskId = res.body.taskId;
  });

  it("GET /v1/agent/task/:taskId should get agent task", async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/agent/task/${createdTaskId}`)
      .set("Authorization", "Bearer mock-token");
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("taskId", createdTaskId);
  });

  it("GET /v1/agent/health should return ok", async () => {
    const res = await request(app.getHttpServer()).get("/v1/agent/health");
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("status", "ok");
  });
});
