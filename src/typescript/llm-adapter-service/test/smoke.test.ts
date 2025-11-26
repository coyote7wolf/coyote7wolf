import axios from "axios";

const BASE_URL = "http://localhost:3602";
const client = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

describe("LLM Adapter Service - Smoke Tests", () => {
  it("should return health status", async () => {
    const response = await client.get("/health");
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("status");
    expect(response.data.status).toBe("ok");
  });

  it("should handle chat completions", async () => {
    const response = await client.post("/v1/chat/completions", {
      messages: [{ role: "user", content: "Hello" }],
      stream: false,
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("choices");
    expect(response.data.choices.length).toBeGreaterThan(0);
    expect(response.data.choices[0]).toHaveProperty("message");
  });

  it("should handle text completions", async () => {
    const response = await client.post("/v1/completions", {
      prompt: "Say hello",
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("text");
  });

  it("should handle embeddings", async () => {
    const response = await client.post("/v1/embeddings", {
      input: ["test string"],
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("data");
    expect(response.data.data.length).toBeGreaterThan(0);
    expect(response.data.data[0]).toHaveProperty("embedding");
  });

  it("should handle LLM generate endpoint", async () => {
    const response = await client.post("/llm/generate", {
      prompt: "Test prompt",
      maxTokens: 100,
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("success");
    expect(response.data.success).toBe(true);
  });

  it("should handle LLM embedding endpoint", async () => {
    const response = await client.post("/llm/embedding", {
      text: "test text",
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("success");
    expect(response.data.success).toBe(true);
  });

  it("should return LLM health status", async () => {
    const response = await client.get("/llm/health");
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("success");
    expect(response.data.success).toBe(true);
    expect(response.data).toHaveProperty("healthy");
  });

  it("should return LLM config", async () => {
    const response = await client.get("/llm/config");
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("success");
    expect(response.data.success).toBe(true);
    expect(response.data).toHaveProperty("data");
  });

  it("should handle LoRA training", async () => {
    const response = await client.post("/v1/lora/train", {
      model: "tinyllama",
      epochs: 1,
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("status");
    expect(response.data).toHaveProperty("job_id");
  });

  it("should handle fine-tuning", async () => {
    const response = await client.post("/v1/fine-tune", {
      model: "tinyllama",
      epochs: 1,
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("status");
    expect(response.data).toHaveProperty("job_id");
  });
});
