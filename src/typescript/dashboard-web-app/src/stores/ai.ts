import { defineStore } from "pinia";
import { ref, readonly, computed } from "vue";
import { aiApi } from "./api";
import type { LLMUsage, ContextFlow, TeamRecommendation } from "./types";

export const useAIStore = defineStore("ai", () => {
  // State
  const llmUsage = ref<LLMUsage | null>(null);
  const contextFlow = ref<ContextFlow | null>(null);
  const recommendations = ref<TeamRecommendation[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  // Getters
  const totalAICost = computed(() => llmUsage.value?.costThisMonth || 0);
  const averageAcceptanceRate = computed(
    () => llmUsage.value?.suggestionAcceptRate || 0
  );
  const actionableRecommendations = computed(() =>
    recommendations.value.filter((rec) => rec.actionable)
  );
  const topAIModel = computed(() => {
    if (!llmUsage.value?.topModels?.length) return null;
    return llmUsage.value.topModels.reduce((top, current) =>
      current.usage > top.usage ? current : top
    );
  });

  // Actions
  const fetchLLMUsage = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await aiApi.getLLMUsage();
      if (response.success && response.data) {
        llmUsage.value = response.data;
        lastUpdated.value = new Date();
      } else {
        throw new Error(response.message || "Failed to fetch LLM usage data");
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch LLM usage data";
      console.error("LLM usage fetch error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchContextFlow = async () => {
    try {
      const response = await aiApi.getContextFlow();
      if (response.success && response.data) {
        contextFlow.value = response.data;
      }
    } catch (err: any) {
      console.error("Context flow fetch error:", err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await aiApi.getRecommendations();
      if (response.success && response.data) {
        recommendations.value = response.data;
      }
    } catch (err: any) {
      console.error("Recommendations fetch error:", err);
    }
  };

  const fetchAllAIData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await Promise.all([
        fetchLLMUsage(),
        fetchContextFlow(),
        fetchRecommendations(),
      ]);
      lastUpdated.value = new Date();
    } catch (err: any) {
      error.value = err.message || "Failed to fetch AI data";
    } finally {
      isLoading.value = false;
    }
  };

  const updateTokenUsage = (additionalTokens: number, cost: number) => {
    if (llmUsage.value) {
      llmUsage.value.totalTokens += additionalTokens;
      llmUsage.value.costThisMonth += cost;
      lastUpdated.value = new Date();
    }
  };

  const dismissRecommendation = (recommendationIndex: number) => {
    if (
      recommendationIndex >= 0 &&
      recommendationIndex < recommendations.value.length
    ) {
      recommendations.value.splice(recommendationIndex, 1);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Auto-refresh functionality
  let refreshInterval: number | null = null;

  const startAutoRefresh = (intervalMs: number = 60000) => {
    stopAutoRefresh();
    refreshInterval = setInterval(fetchAllAIData, intervalMs);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  return {
    // State
    llmUsage: readonly(llmUsage),
    contextFlow: readonly(contextFlow),
    recommendations: readonly(recommendations),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),

    // Getters
    totalAICost,
    averageAcceptanceRate,
    actionableRecommendations,
    topAIModel,

    // Actions
    fetchLLMUsage,
    fetchContextFlow,
    fetchRecommendations,
    fetchAllAIData,
    updateTokenUsage,
    dismissRecommendation,
    clearError,
    startAutoRefresh,
    stopAutoRefresh,
  };
});
