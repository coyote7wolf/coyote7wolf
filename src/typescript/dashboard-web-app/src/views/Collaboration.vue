<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">協作分析</h1>
      <button
        @click="refreshData"
        :disabled="isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowPathIcon
          :class="['h-4 w-4 mr-2', { 'animate-spin': isLoading }]"
        />
        重新整理
      </button>
    </div>

    <!-- Active Users -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        目前活躍用戶
      </h2>

      <div v-if="activeUsers.length === 0" class="text-center py-8">
        <UsersIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">目前沒有活躍用戶</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="user in activeUsers"
          :key="user.id"
          class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <img
            :src="user.avatar"
            :alt="user.name"
            class="h-10 w-10 rounded-full"
            @error="handleImageError"
          />
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
            >
              {{ user.name }}
            </p>
            <div class="flex items-center space-x-2">
              <div
                :class="['h-2 w-2 rounded-full', getStatusColor(user.status)]"
              ></div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ getStatusText(user.status) }} - {{ user.currentFile }}
              </p>
            </div>
            <p class="text-xs text-gray-400">
              {{ formatLastActivity(user.lastActivity) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Conflict Statistics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          衝突統計
        </h2>

        <div v-if="conflictStats" class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400"
              >總衝突數</span
            >
            <span class="text-lg font-bold text-gray-900 dark:text-white">
              {{ conflictStats.total }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">已解決</span>
            <span class="text-lg font-bold text-green-600 dark:text-green-400">
              {{ conflictStats.resolved }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">待處理</span>
            <span
              class="text-lg font-bold text-yellow-600 dark:text-yellow-400"
            >
              {{ conflictStats.pending }}
            </span>
          </div>

          <!-- Resolution Rate Progress Bar -->
          <div class="mt-4">
            <div
              class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1"
            >
              <span>解決率</span>
              <span>{{ conflictResolutionRate.toFixed(1) }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${conflictResolutionRate}%` }"
              ></div>
            </div>
          </div>

          <!-- Resolution Types -->
          <div class="mt-6">
            <h3
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              解決方式
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">自動解決</span>
                <span class="text-gray-900 dark:text-white">{{
                  conflictStats.autoResolved
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">手動解決</span>
                <span class="text-gray-900 dark:text-white">{{
                  conflictStats.manualResolved
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conflict Types with Pie Chart -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <ConflictPieChart :data="conflictStats" />
      </div>
    </div>

    <!-- Collaboration Heatmap -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <CollaborationHeatmap :data="heatmapData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useCollaborationStore } from "@/stores";
import {
  ArrowPathIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/outline";
import CollaborationHeatmap from "@/components/charts/CollaborationHeatmap.vue";
import ConflictPieChart from "@/components/charts/ConflictPieChart.vue";

// Store
const collaborationStore = useCollaborationStore();

// Computed properties
const isLoading = computed(() => collaborationStore.isLoading);
const activeUsers = computed(() => collaborationStore.activeUsers);
const conflictStats = computed(() => collaborationStore.conflictStats);
const heatmapData = computed(() => collaborationStore.heatmapData);
const conflictResolutionRate = computed(
  () => collaborationStore.conflictResolutionRate
);

// Methods
const getStatusColor = (status: string) => {
  switch (status) {
    case "editing":
      return "bg-green-400";
    case "viewing":
      return "bg-blue-400";
    case "commenting":
      return "bg-yellow-400";
    case "idle":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "editing":
      return "編輯中";
    case "viewing":
      return "檢視中";
    case "commenting":
      return "評論中";
    case "idle":
      return "閒置";
    default:
      return "未知";
  }
};

const formatLastActivity = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes === 0) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;

  const days = Math.floor(hours / 24);
  return `${days} 天前`;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/avatars/default.jpg";
};

const refreshData = () => {
  collaborationStore.fetchAllCollaborationData();
};

// Lifecycle
onMounted(() => {
  collaborationStore.fetchAllCollaborationData();
  collaborationStore.startAutoRefresh();
});

onUnmounted(() => {
  collaborationStore.stopAutoRefresh();
});
</script>
