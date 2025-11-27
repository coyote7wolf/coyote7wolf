import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "./modules/app.module";

describe("User API Smoke Test", () => {
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

  it("GET /users should return array", async () => {
    const res = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /users should create user", async () => {
    const res = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", "Bearer mock-token")
      .send({ name: "smoke", email: "smoke@test.com", role: "user" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdId = res.body.id;
  });

  it("POST /users batch should create multiple users", async () => {
    const res = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "batch1", email: "batch1@test.com", role: "user" },
        { name: "batch2", email: "batch2@test.com", role: "admin" },
      ]);
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status", "success");
    expect(res.body[1]).toHaveProperty("status", "success");
  });

  it("GET /users/:id should return user", async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdId}`)
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdId);
  });

  it("PUT /users/:id should update user", async () => {
    const res = await request(app.getHttpServer())
      .put(`/users/${createdId}`)
      .set("Authorization", "Bearer mock-token")
      .send({ name: "smoke2", email: "smoke2@test.com", role: "admin" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "smoke2");
  });

  it("PUT /users batch should update multiple users", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "batchu1", email: "batchu1@test.com", role: "user" },
        { name: "batchu2", email: "batchu2@test.com", role: "admin" },
      ]);
    const ids = createRes.body.map((u: any) => u.id);
    const res = await request(app.getHttpServer())
      .put("/users")
      .set("Authorization", "Bearer mock-token")
      .send([
        { id: ids[0], name: "batchu1-upd" },
        { id: ids[1], name: "batchu2-upd" },
      ]);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status");
    expect(res.body[1]).toHaveProperty("status");
  });

  it("DELETE /users/:id should remove user", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdId}`)
      .set("Authorization", "Bearer mock-token");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("DELETE /users batch should remove multiple users", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "batchd1", email: "batchd1@test.com", role: "user" },
        { name: "batchd2", email: "batchd2@test.com", role: "admin" },
      ]);
    const ids = createRes.body.map((u: any) => u.id);
    const res = await request(app.getHttpServer())
      .delete("/users")
      .set("Authorization", "Bearer mock-token")
      .send(ids);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status");
    expect(res.body[1]).toHaveProperty("status");
  });

  it("PATCH /users/:id should partial update user", async () => {
    // 先建立一筆
    const createRes = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", "Bearer mock-token")
      .send({ name: "patchu", email: "patchu@test.com", role: "user" });
    const id = createRes.body.id;
    const res = await request(app.getHttpServer())
      .patch(`/users/${id}`)
      .set("Authorization", "Bearer mock-token")
      .send({ name: "patchu-upd" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "patchu-upd");
    expect(res.body).toHaveProperty("status", "success");
  });

  it("PATCH /users batch should partial update multiple users", async () => {
    // 先建立兩筆
    const createRes = await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", "Bearer mock-token")
      .send([
        { name: "patchb1", email: "patchb1@test.com", role: "user" },
        { name: "patchb2", email: "patchb2@test.com", role: "admin" },
      ]);
    const ids = createRes.body.map((u: any) => u.id);
    const res = await request(app.getHttpServer())
      .patch("/users")
      .set("Authorization", "Bearer mock-token")
      .send([
        { id: ids[0], data: { name: "patchb1-upd" } },
        { id: ids[1], data: { role: "superadmin" } },
      ]);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("status", "success");
    expect(res.body[1]).toHaveProperty("status", "success");
  });
});
