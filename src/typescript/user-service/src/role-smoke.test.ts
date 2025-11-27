import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "./modules/app.module";

describe("Role API Smoke Test", () => {
  let app: INestApplication;
  let createdId: string;

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

  it("GET /roles should return array", async () => {
    const res = await request(app.getHttpServer())
      .get("/roles")
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /roles should create role", async () => {
    const res = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", "Bearer mock-token")
      .send({ name: "smoke-role", description: "test" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdId = res.body.id;
  });

  it("POST /roles batch should create multiple roles", async () => {
    const res = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "batch-role1", description: "desc1" },
        { name: "batch-role2", description: "desc2" },
      ]);
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status", "success");
    expect(res.body[1]).toHaveProperty("status", "success");
  });

  it("GET /roles/:id should return role", async () => {
    const res = await request(app.getHttpServer())
      .get(`/roles/${createdId}`)
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdId);
  });

  it("PUT /roles/:id should update role", async () => {
    const res = await request(app.getHttpServer())
      .put(`/roles/${createdId}`)
      .set("Authorization", "Bearer mock-token")
      .send({ name: "smoke-role2", description: "test2" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "smoke-role2");
  });

  it("PUT /roles batch should update multiple roles", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "batchr1", description: "desc1" },
        { name: "batchr2", description: "desc2" },
      ]);
    const ids = createRes.body.map((r: any) => r.id);
    const res = await request(app.getHttpServer())
      .put("/roles")
      .set("Authorization", "Bearer mock-token")
      .send([
        { id: ids[0], name: "batchr1-upd" },
        { id: ids[1], name: "batchr2-upd" },
      ]);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status");
    expect(res.body[1]).toHaveProperty("status");
  });

  it("DELETE /roles/:id should remove role", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/roles/${createdId}`)
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("DELETE /roles batch should remove multiple roles", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "batchrd1", description: "desc1" },
        { name: "batchrd2", description: "desc2" },
      ]);
    const ids = createRes.body.map((r: any) => r.id);
    const res = await request(app.getHttpServer())
      .delete("/roles")
      .set("Authorization", "Bearer mock-token")
      .send(ids);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status");
    expect(res.body[1]).toHaveProperty("status");
  });

  it("PATCH /roles/:id should partial update role", async () => {
    // 先建立一筆
    const createRes = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", "Bearer mock-token")
      .send({ name: "patchr", description: "patchr-desc" });
    const id = createRes.body.id;
    const res = await request(app.getHttpServer())
      .patch(`/roles/${id}`)
      .set("Authorization", "Bearer mock-token")
      .send({ name: "patchr-upd" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "patchr-upd");
    expect(res.body).toHaveProperty("status", "success");
  });

  it("PATCH /roles batch should partial update multiple roles", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/roles")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "patchrb1", description: "desc1" },
        { name: "patchrb2", description: "desc2" },
      ]);
    const ids = createRes.body.map((r: any) => r.id);
    const res = await request(app.getHttpServer())
      .patch("/roles")
      .set("Authorization", "Bearer mock-token")
      .send([
        { id: ids[0], data: { name: "patchrb1-upd" } },
        { id: ids[1], data: { description: "desc2-upd" } },
      ]);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status", "success");
    expect(res.body[1]).toHaveProperty("status", "success");
  });
});
