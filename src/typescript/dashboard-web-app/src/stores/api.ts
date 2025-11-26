import axios from "axios";
import type {
  ApiResponse,
  User,
  LoginCredentials,
  SystemHealth,
  KPIs,
  RealtimeMetrics,
  HeatmapPoint,
  ConflictStats,
  ActiveUser,
  LLMUsage,
  ContextFlow,
  TeamRecommendation,
  WebSocketMetrics,
  RedisMetrics,
  ServiceStatus,
} from "./types";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    console.log("🌐 API: 發送登入請求", credentials);
    try {
      const response = await api.post("/auth/login", credentials);
      console.log("🌐 API: 收到回應", response);
      return response.data;
    } catch (error) {
      console.error("🌐 API: 請求錯誤", error);
      throw error;
    }
  },

  me: (): Promise<ApiResponse<{ user: User }>> =>
    api.get("/auth/me").then((res) => res.data),
};

// Dashboard API
export const dashboardApi = {
  getOverview: (): Promise<
    ApiResponse<{
      systemHealth: SystemHealth;
      kpis: KPIs;
      realtimeMetrics: RealtimeMetrics;
    }>
  > => api.get("/dashboard/overview").then((res) => res.data),
};

// Collaboration API
export const collaborationApi = {
  getHeatmap: (): Promise<ApiResponse<HeatmapPoint[]>> =>
    api.get("/collaboration/heatmap").then((res) => res.data),

  getConflicts: (): Promise<ApiResponse<ConflictStats>> =>
    api.get("/collaboration/conflicts").then((res) => res.data),

  getActiveUsers: (): Promise<ApiResponse<ActiveUser[]>> =>
    api.get("/collaboration/users").then((res) => res.data),
};

// AI API
export const aiApi = {
  getLLMUsage: (): Promise<ApiResponse<LLMUsage>> =>
    api.get("/ai/llm-usage").then((res) => res.data),

  getContextFlow: (): Promise<ApiResponse<ContextFlow>> =>
    api.get("/ai/context-flow").then((res) => res.data),

  getRecommendations: (): Promise<ApiResponse<TeamRecommendation[]>> =>
    api.get("/ai/recommendations").then((res) => res.data),
};

// Performance API
export const performanceApi = {
  getWebSocketMetrics: (): Promise<ApiResponse<WebSocketMetrics>> =>
    api.get("/performance/websocket").then((res) => res.data),

  getRedisMetrics: (): Promise<ApiResponse<RedisMetrics>> =>
    api.get("/performance/redis").then((res) => res.data),

  getServices: (): Promise<ApiResponse<ServiceStatus[]>> =>
    api.get("/performance/services").then((res) => res.data),
};

// Realtime API
export const realtimeApi = {
  connect: (): Promise<ApiResponse<{ connectionId: string }>> =>
    api.get("/realtime/connect").then((res) => res.data),
};
