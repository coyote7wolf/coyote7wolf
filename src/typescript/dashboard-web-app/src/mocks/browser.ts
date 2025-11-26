import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import mockData from "./db.json";
import { richMockDataGenerator } from "@/utils/richMockData";

// Mock API handlers
const handlers = [
  // Authentication
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    console.log("🎭 MSW: 收到登入請求", { email, password });

    // Check against predefined accounts
    const validCredentials = [
      { email: "admin@synccoreai.com", password: "admin123" },
      { email: "demo@synccoreai.com", password: "demo123" },
      { email: "viewer@synccoreai.com", password: "viewer123" },
    ];

    const validUser = validCredentials.find(
      (cred) => cred.email === email && cred.password === password
    );
    const user = mockData.auth.users.find((u) => u.email === email);

    console.log("🎭 MSW: 驗證結果", { validUser: !!validUser, user: !!user });

    if (validUser && user) {
      const response = {
        success: true,
        data: {
          user,
          token: `mock-jwt-token-${user.id}`,
        },
      };
      console.log("🎭 MSW: 登入成功，回應", response);
      return HttpResponse.json(response);
    }

    const errorResponse = {
      success: false,
      message: "Invalid email or password",
    };
    console.log("🎭 MSW: 登入失敗，回應", errorResponse);
    return HttpResponse.json(errorResponse, { status: 401 });
  }),

  http.get("/api/auth/me", ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Extract user ID from token (mock implementation)
    const token = auth.replace("Bearer ", "");
    let user = mockData.auth.users[0]; // Default to admin

    if (token.includes("demo-001")) {
      user = mockData.auth.users[1];
    }

    return HttpResponse.json({
      success: true,
      data: {
        user,
      },
    });
  }),

  // Dashboard
  http.get("/api/dashboard/overview", () => {
    console.log("🎭 MSW: 處理 dashboard/overview 請求");
    return HttpResponse.json({
      success: true,
      data: mockData.dashboard.overview,
    });
  }),

  // Collaboration
  http.get("/api/collaboration/heatmap", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.collaboration.heatmapData,
    });
  }),

  http.get("/api/collaboration/conflicts", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.collaboration.conflictStats,
    });
  }),

  http.get("/api/collaboration/users", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.collaboration.activeUsers,
    });
  }),

  // AI Insights
  http.get("/api/ai/llm-usage", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.ai.llmUsage,
    });
  }),

  http.get("/api/ai/context-flow", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.ai.contextFlow,
    });
  }),

  http.get("/api/ai/recommendations", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.ai.teamRecommendations,
    });
  }),

  // Performance
  http.get("/api/performance/websocket", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.performance.websocket,
    });
  }),

  http.get("/api/performance/redis", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.performance.redis,
    });
  }),

  http.get("/api/performance/services", () => {
    return HttpResponse.json({
      success: true,
      data: mockData.performance.services,
    });
  }),

  // WebSocket simulation endpoints
  http.get("/api/realtime/connect", () => {
    return HttpResponse.json({
      success: true,
      message: "Mock WebSocket connected",
      connectionId: `ws-${Date.now()}`,
    });
  }),

  // Rich Mock Data Endpoints
  http.get("/api/rich/collaboration", () => {
    const richData = richMockDataGenerator.generateCompleteDataset();
    console.log("🎭 MSW: Rich collaboration data generated");
    return HttpResponse.json({
      success: true,
      data: richData.collaboration,
    });
  }),

  http.get("/api/rich/ai-insights", () => {
    const richData = richMockDataGenerator.generateCompleteDataset();
    console.log("🎭 MSW: Rich AI insights data generated");
    return HttpResponse.json({
      success: true,
      data: richData.ai,
    });
  }),

  http.get("/api/rich/performance", () => {
    const richData = richMockDataGenerator.generateCompleteDataset();
    console.log("🎭 MSW: Rich performance data generated");
    return HttpResponse.json({
      success: true,
      data: richData.performance,
    });
  }),

  http.get("/api/rich/anomalies", () => {
    const richData = richMockDataGenerator.generateCompleteDataset();
    console.log("🎭 MSW: Rich anomalies data generated");
    return HttpResponse.json({
      success: true,
      data: richData.anomalies,
    });
  }),

  http.get("/api/rich/trends", () => {
    const richData = richMockDataGenerator.generateCompleteDataset();
    console.log("🎭 MSW: Rich trends data generated");
    return HttpResponse.json({
      success: true,
      data: richData.trends,
    });
  }),

  // WebSocket status endpoint
  http.get("/api/websocket/status", () => {
    return HttpResponse.json({
      success: true,
      data: {
        connected: true,
        uptime: Math.floor(Math.random() * 86400), // 隨機運行時間（秒）
        activeConnections: Math.floor(Math.random() * 500) + 100,
        messagesPerSecond: Math.floor(Math.random() * 1000) + 500,
        latency: Math.floor(Math.random() * 50) + 20,
      },
    });
  }),
];

// Create worker
export const worker = setupWorker(...handlers);

// Mock data for development
export { mockData };
