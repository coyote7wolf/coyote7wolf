import { defineStore } from "pinia";
import { ref, readonly, computed } from "vue";
import { collaborationApi } from "./api";
import type { HeatmapPoint, ConflictStats, ActiveUser } from "./types";

export const useCollaborationStore = defineStore("collaboration", () => {
  // State
  const heatmapData = ref<HeatmapPoint[]>([]);
  const conflictStats = ref<ConflictStats | null>(null);
  const activeUsers = ref<ActiveUser[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  // Getters
  const totalActiveUsers = computed(() => activeUsers.value.length);
  const editingUsers = computed(() =>
    activeUsers.value.filter((user) => user.status === "editing")
  );
  const conflictResolutionRate = computed(() => {
    if (!conflictStats.value || conflictStats.value.total === 0) return 0;
    return (conflictStats.value.resolved / conflictStats.value.total) * 100;
  });

  // Actions
  const fetchHeatmapData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await collaborationApi.getHeatmap();
      if (response.success && response.data) {
        heatmapData.value = response.data;
        lastUpdated.value = new Date();
      } else {
        throw new Error(response.message || "Failed to fetch heatmap data");
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch heatmap data";
      console.error("Heatmap fetch error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchConflictStats = async () => {
    try {
      const response = await collaborationApi.getConflicts();
      if (response.success && response.data) {
        conflictStats.value = response.data;
      }
    } catch (err: any) {
      console.error("Conflict stats fetch error:", err);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await collaborationApi.getActiveUsers();
      if (response.success && response.data) {
        activeUsers.value = response.data;
      }
    } catch (err: any) {
      console.error("Active users fetch error:", err);
    }
  };

  const fetchAllCollaborationData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await Promise.all([
        fetchHeatmapData(),
        fetchConflictStats(),
        fetchActiveUsers(),
      ]);
      lastUpdated.value = new Date();
    } catch (err: any) {
      error.value = err.message || "Failed to fetch collaboration data";
    } finally {
      isLoading.value = false;
    }
  };

  const updateUserCursor = (
    userId: string,
    position: { x: number; y: number }
  ) => {
    const userIndex = activeUsers.value.findIndex((user) => user.id === userId);
    if (userIndex !== -1) {
      activeUsers.value[userIndex].cursor = position;
      activeUsers.value[userIndex].lastActivity = new Date().toISOString();
    }
  };

  const addRealtimeHeatmapPoint = (point: HeatmapPoint) => {
    heatmapData.value.push(point);
    // Keep only recent points (last 1000)
    if (heatmapData.value.length > 1000) {
      heatmapData.value = heatmapData.value.slice(-1000);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Auto-refresh functionality
  let refreshInterval: number | null = null;

  const startAutoRefresh = (intervalMs: number = 15000) => {
    stopAutoRefresh();
    refreshInterval = setInterval(fetchAllCollaborationData, intervalMs);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  return {
    // State
    heatmapData: readonly(heatmapData),
    conflictStats: readonly(conflictStats),
    activeUsers: readonly(activeUsers),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),

    // Getters
    totalActiveUsers,
    editingUsers,
    conflictResolutionRate,

    // Actions
    fetchHeatmapData,
    fetchConflictStats,
    fetchActiveUsers,
    fetchAllCollaborationData,
    updateUserCursor,
    addRealtimeHeatmapPoint,
    clearError,
    startAutoRefresh,
    stopAutoRefresh,
  };
});
