<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">AI 洞察</h1>
      <button
        @click="refreshData"
        :disabled="isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        <ArrowPathIcon
          :class="['h-4 w-4 mr-2', { 'animate-spin': isLoading }]"
        />
        重新整理
      </button>
    </div>

    <!-- AI Usage Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center">
          <CpuChipIcon class="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              本月總 Token
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatNumber(llmUsage?.totalTokens) }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center">
          <CurrencyDollarIcon
            class="h-8 w-8 text-green-600 dark:text-green-400"
          />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              本月費用
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              ${{ llmUsage?.costThisMonth?.toFixed(2) || "0.00" }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center">
          <CheckCircleIcon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              建議採用率
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ llmUsage?.suggestionAcceptRate?.toFixed(1) || "0" }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Usage Trends -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <AIUsageChart :data="aiUsageStats" />
    </div>

    <!-- AI Models Usage -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        AI 模型使用統計
      </h2>

      <div v-if="llmUsage?.topModels" class="space-y-4">
        <div
          v-for="model in llmUsage.topModels"
          :key="model.name"
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              {{ model.name }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              使用率: {{ model.usage }}%
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              ${{ model.cost.toFixed(2) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">本月費用</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 建議採用率漏斗 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📊 AI 建議採用率分析
      </h2>
      <AIAdoptionFunnel :data="adoptionFunnelData" />
    </div>

    <!-- 智能推薦引擎 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <SmartRecommendationEngine :recommendations="recommendations" />
    </div>

    <!-- AI 錯誤邊界和降級 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <AIErrorBoundary />
    </div>

    <!-- Context Flow 3D -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          🌐 Context Flow 3D 視覺化
        </h2>
        <div
          class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
        >
          <span>{{ contextFlowData?.nodes?.length || 0 }} 節點</span>
          <span>{{ contextFlowData?.clusters?.length || 0 }} 集群</span>
        </div>
      </div>

      <div class="h-96 rounded-lg overflow-hidden">
        <ContextFlow3D :data="contextFlowData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useAIStore } from "@/stores";
import {
  ArrowPathIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  LightBulbIcon,
  CubeIcon,
} from "@heroicons/vue/24/outline";
import AIUsageChart from "@/components/charts/AIUsageChart.vue";
import ContextFlow3D from "@/components/charts/ContextFlow3D.vue";
import AIAdoptionFunnel from "@/components/charts/AIAdoptionFunnel.vue";
import SmartRecommendationEngine from "@/components/ai/SmartRecommendationEngine.vue";
import AIErrorBoundary from "@/components/ai/AIErrorBoundary.vue";
import { contextFlow3DGenerator } from "@/utils/contextFlow3D";

// Store
const aiStore = useAIStore();

// Context Flow 3D Data
const contextFlowData = ref(contextFlow3DGenerator.generateContextFlowGraph());

// AI 建議採用率數據
const adoptionFunnelData = ref({
  totalSuggestions: 2543,
  viewedSuggestions: 1876,
  consideredSuggestions: 1245,
  adoptedSuggestions: 687,
  averageViewTime: 12.3,
  averageConsiderationTime: 45.7,
  averageImplementationTime: 2.8,
  categoryBreakdown: [
    { category: "代碼品質", total: 856, adopted: 234, color: "#3b82f6" },
    { category: "性能優化", total: 743, adopted: 189, color: "#10b981" },
    { category: "團隊協作", total: 542, adopted: 156, color: "#f59e0b" },
    { category: "工作流程", total: 402, adopted: 108, color: "#8b5cf6" },
  ],
});

// Computed properties
const isLoading = computed(() => aiStore.isLoading);
const llmUsage = computed(() => aiStore.llmUsage);
const recommendations = computed(() => aiStore.recommendations);
const contextFlow = computed(() => aiStore.contextFlow);
const aiUsageStats = computed(() => ({
  requests: llmUsage.value?.totalTokens || 0,
  successRate: 95.8,
  responseTime: 245,
  errorRate: 4.2,
}));

// Methods
const formatNumber = (num?: number) => {
  if (!num) return "0";
  return num.toLocaleString();
};

const refreshData = () => {
  aiStore.fetchAllAIData();
};

// Lifecycle
onMounted(() => {
  aiStore.fetchAllAIData();
  aiStore.startAutoRefresh();
});

onUnmounted(() => {
  aiStore.stopAutoRefresh();
});
</script>
