<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4"
    >
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            載入數據時發生錯誤
          </h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          <button
            @click="retry"
            class="mt-2 text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100"
          >
            重試
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard content -->
    <div v-else>
      <!-- System Health Card -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            系統健康狀態
          </h2>
          <div class="flex items-center space-x-2">
            <div
              :class="[
                'h-3 w-3 rounded-full',
                systemHealth?.status === 'healthy'
                  ? 'bg-green-400'
                  : systemHealth?.status === 'warning'
                    ? 'bg-yellow-400'
                    : 'bg-red-400',
              ]"
            ></div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ getStatusText(systemHealth?.status) }}
            </span>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ systemHealth?.uptime || "--" }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">運行時間</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatDate(systemHealth?.lastIncident) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">上次事件</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">
              20+
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">服務運行中</p>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <UsersIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                活躍用戶
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ kpis?.activeUsers?.toLocaleString() || "--" }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <ChatBubbleLeftRightIcon
                class="h-6 w-6 text-green-600 dark:text-green-400"
              />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                協作會話
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ kpis?.collaborationSessions?.toLocaleString() || "--" }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <CheckCircleIcon
                class="h-6 w-6 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                衝突解決
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ kpis?.resolvedConflicts?.toLocaleString() || "--" }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
              <CpuChipIcon
                class="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                AI 建議採用率
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ formatPercentage(kpis?.aiSuggestionRate) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Metrics -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          即時系統指標
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="relative w-16 h-16 mx-auto mb-2">
              <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-dasharray="100, 100"
                  class="text-gray-200 dark:text-gray-700"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :stroke-dasharray="`${realtimeMetrics?.cpuUsage || 0}, 100`"
                  class="text-blue-600 dark:text-blue-400"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                  {{ realtimeMetrics?.cpuUsage?.toFixed(1) || "0" }}%
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">CPU 使用率</p>
          </div>

          <div class="text-center">
            <div class="relative w-16 h-16 mx-auto mb-2">
              <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-dasharray="100, 100"
                  class="text-gray-200 dark:text-gray-700"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :stroke-dasharray="`${realtimeMetrics?.memoryUsage || 0}, 100`"
                  class="text-green-600 dark:text-green-400"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                  {{ realtimeMetrics?.memoryUsage?.toFixed(1) || "0" }}%
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">記憶體使用率</p>
          </div>

          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ realtimeMetrics?.networkLatency || "--" }}ms
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">網路延遲</p>
          </div>

          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ realtimeMetrics?.diskUsage?.toFixed(1) || "--" }}%
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">磁碟使用率</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快速導航
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            to="/collaboration"
            class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <UsersIcon
              class="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform"
            />
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              協作分析
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              查看協作熱力圖
            </p>
          </router-link>

          <router-link
            to="/ai-insights"
            class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <CpuChipIcon
              class="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform"
            />
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              AI 洞察
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              AI 使用統計
            </p>
          </router-link>

          <router-link
            to="/performance"
            class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <ChartBarIcon
              class="h-8 w-8 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform"
            />
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              系統效能
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              監控系統狀態
            </p>
          </router-link>

          <router-link
            to="/3d-workspace"
            class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <CubeIcon
              class="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2 group-hover:scale-110 transition-transform"
            />
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              3D 空間
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              立體協作視覺化
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useDashboardStore } from "@/stores";
import {
  ExclamationTriangleIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ChartBarIcon,
  CubeIcon,
} from "@heroicons/vue/24/outline";

// Store
const dashboardStore = useDashboardStore();

// Computed properties
const isLoading = computed(() => dashboardStore.isLoading);
const error = computed(() => dashboardStore.error);
const systemHealth = computed(() => dashboardStore.systemHealth);
const kpis = computed(() => dashboardStore.kpis);
const realtimeMetrics = computed(() => dashboardStore.realtimeMetrics);

// Methods
const getStatusText = (status?: string) => {
  switch (status) {
    case "healthy":
      return "健康";
    case "warning":
      return "警告";
    case "error":
      return "錯誤";
    default:
      return "未知";
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    month: "short",
    day: "numeric",
  });
};

const formatPercentage = (value?: number) => {
  if (value === undefined || value === null) return "--";
  return `${value.toFixed(1)}%`;
};

const retry = () => {
  dashboardStore.clearError();
  dashboardStore.fetchOverview();
};

// Lifecycle
onMounted(() => {
  dashboardStore.fetchOverview();
});
</script>
