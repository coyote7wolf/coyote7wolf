import { defineStore } from "pinia";
import { ref, readonly, onUnmounted } from "vue";
import { dashboardApi } from "./api";
import { mockWebSocketService } from "@/services/websocket";
import type {
  SystemHealth,
  KPIs,
  RealtimeMetrics,
  DashboardMetrics,
} from "./types";

export const useDashboardStore = defineStore("dashboard", () => {
  // State
  const systemHealth = ref<SystemHealth | null>(null);
  const kpis = ref<KPIs | null>(null);
  const realtimeMetrics = ref<RealtimeMetrics | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);
  const wsConnected = ref(false);

  // WebSocket 事件處理
  const handleWebSocketData = (data: DashboardMetrics) => {
    console.log("📊 Dashboard: 收到即時數據", data);

    // 更新系統健康狀態
    if (systemHealth.value) {
      systemHealth.value.status = data.systemHealth;
    }

    // 更新 KPIs
    if (kpis.value) {
      kpis.value.activeUsers = data.activeUsers;
      kpis.value.collaborationSessions = data.totalCollaborations;
      kpis.value.resolvedConflicts = data.successfulSyncs;
    }

    // 更新即時指標
    if (realtimeMetrics.value) {
      realtimeMetrics.value.cpuUsage = data.cpuUsage;
      realtimeMetrics.value.memoryUsage = data.memoryUsage;
      realtimeMetrics.value.networkLatency = data.averageResponseTime;
    }

    lastUpdated.value = new Date();
  };

  // 連接 WebSocket
  const connectWebSocket = () => {
    mockWebSocketService.subscribe("dashboard:metrics", handleWebSocketData);
    wsConnected.value = mockWebSocketService.isConnected();
    console.log("📊 Dashboard: WebSocket 已連接");
  };

  // 斷開 WebSocket
  const disconnectWebSocket = () => {
    mockWebSocketService.unsubscribe("dashboard:metrics", handleWebSocketData);
    wsConnected.value = false;
    console.log("📊 Dashboard: WebSocket 已斷開");
  };

  // Actions
  const fetchOverview = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await dashboardApi.getOverview();
      if (response.success && response.data) {
        systemHealth.value = response.data.systemHealth;
        kpis.value = response.data.kpis;
        realtimeMetrics.value = response.data.realtimeMetrics;
        lastUpdated.value = new Date();
      } else {
        throw new Error(response.message || "Failed to fetch dashboard data");
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch dashboard data";
      console.error("Dashboard fetch error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateRealtimeMetrics = (newMetrics: Partial<RealtimeMetrics>) => {
    if (realtimeMetrics.value) {
      realtimeMetrics.value = { ...realtimeMetrics.value, ...newMetrics };
      lastUpdated.value = new Date();
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Auto-refresh functionality
  let refreshInterval: NodeJS.Timeout | null = null;

  const startAutoRefresh = (intervalMs: number = 30000) => {
    stopAutoRefresh();
    refreshInterval = setInterval(fetchOverview, intervalMs);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  return {
    // State
    systemHealth: readonly(systemHealth),
    kpis: readonly(kpis),
    realtimeMetrics: readonly(realtimeMetrics),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),

    // Actions
    fetchOverview,
    updateRealtimeMetrics,
    clearError,
    startAutoRefresh,
    stopAutoRefresh,
    connectWebSocket,
    disconnectWebSocket,

    // WebSocket state
    wsConnected: readonly(wsConnected),
  };
});
