import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "./modules/app.module";

describe("Device API Smoke Test", () => {
  let app: INestApplication;
  let createdId: string;
  const userId = "smoke-user";

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /devices should return array", async () => {
    const res = await request(app.getHttpServer())
      .get("/devices")
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /devices should create device", async () => {
    const res = await request(app.getHttpServer())
      .post("/devices")
      .set("Authorization", "Bearer mock-token")
      .send({ userId, name: "smoke-device", type: "phone" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdId = res.body.id;
  });

  it("POST /devices batch should create multiple devices", async () => {
    const res = await request(app.getHttpServer())
      .post("/devices")
      .set("Authorization", "Bearer mock-token")
      .send([
        { userId, name: "batch-device1", type: "phone" },
        { userId, name: "batch-device2", type: "tablet" },
      ]);
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status", "success");
    expect(res.body[1]).toHaveProperty("status", "success");
  });

  it("GET /devices/:id should return device", async () => {
    const res = await request(app.getHttpServer())
      .get(`/devices/${createdId}`)
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdId);
  });

  it("PUT /devices/:id should update device", async () => {
    const res = await request(app.getHttpServer())
      .put(`/devices/${createdId}`)
      .set("Authorization", "Bearer mock-token")
      .send({ name: "smoke-device2", type: "tablet" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "smoke-device2");
  });

  it("PUT /devices batch should update multiple devices", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/devices")
      .set("Authorization", "Bearer mock-token")
      .send([
        { userId, name: "batchd1", type: "phone" },
        { userId, name: "batchd2", type: "tablet" },
      ]);
    const ids = createRes.body.map((d: any) => d.id);
    const res = await request(app.getHttpServer())
      .put("/devices")
      .set("Authorization", "Bearer mock-token")
      .send([
        { id: ids[0], name: "batchd1-upd" },
        { id: ids[1], name: "batchd2-upd" },
      ]);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status");
    expect(res.body[1]).toHaveProperty("status");
  });

  it("DELETE /devices/:id should remove device", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/devices/${createdId}`)
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("DELETE /devices batch should remove multiple devices", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/devices")
      .set("Authorization", "Bearer mock-token")
      .send([
        { userId, name: "batchdd1", type: "phone" },
        { userId, name: "batchdd2", type: "tablet" },
      ]);
    const ids = createRes.body.map((d: any) => d.id);
    const res = await request(app.getHttpServer())
      .delete("/devices")
      .set("Authorization", "Bearer mock-token")
      .send(ids);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status");
    expect(res.body[1]).toHaveProperty("status");
  });

  it("PATCH /devices/:id should partial update device", async () => {
    // 先建立一筆
    const createRes = await request(app.getHttpServer())
      .post("/devices")
      .set("Authorization", "Bearer mock-token")
      .send({ userId, name: "patchd", type: "phone" });
    const id = createRes.body.id;
    const res = await request(app.getHttpServer())
      .patch(`/devices/${id}`)
      .set("Authorization", "Bearer mock-token")
      .send({ name: "patchd-upd" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "patchd-upd");
    expect(res.body).toHaveProperty("status", "success");
  });

  it("PATCH /devices batch should partial update multiple devices", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/devices")
      .set("Authorization", "Bearer mock-token")
      .send([
        { userId, name: "patchdb1", type: "phone" },
        { userId, name: "patchdb2", type: "tablet" },
      ]);
    const ids = createRes.body.map((d: any) => d.id);
    const res = await request(app.getHttpServer())
      .patch("/devices")
      .set("Authorization", "Bearer mock-token")
      .send([
        { id: ids[0], data: { name: "patchdb1-upd" } },
        { id: ids[1], data: { type: "phone" } },
      ]);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status", "success");
    expect(res.body[1]).toHaveProperty("status", "success");
  });
});
