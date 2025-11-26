<template>
  <div class="fixed top-4 right-4 z-50">
    <!-- WebSocket 連接狀態指示器 -->
    <div
      class="flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-sm transition-all duration-300"
      :class="statusClasses"
    >
      <!-- 狀態指示燈 -->
      <div class="relative">
        <div class="w-3 h-3 rounded-full" :class="indicatorClasses"></div>
        <div
          v-if="isConnected"
          class="absolute inset-0 w-3 h-3 rounded-full animate-ping"
          :class="pulseClasses"
        ></div>
      </div>

      <!-- 狀態文字 -->
      <span class="text-sm font-medium">
        {{ statusText }}
      </span>

      <!-- 重連按鈕 -->
      <button
        v-if="showReconnectButton"
        @click="handleReconnect"
        class="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        :disabled="isConnecting"
      >
        {{ isConnecting ? "重連中..." : "重連" }}
      </button>
    </div>

    <!-- 詳細信息面板（可展開） -->
    <div
      v-if="showDetails"
      class="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-80"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">連接詳情</h3>
          <button
            @click="showDetails = false"
            class="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">狀態:</span>
            <span :class="isConnected ? 'text-green-600' : 'text-red-600'">
              {{ isConnected ? "已連接" : "已斷開" }}
            </span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">重連次數:</span>
            <span class="text-gray-900 dark:text-white">{{
              reconnectAttempts
            }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">連接時間:</span>
            <span class="text-gray-900 dark:text-white">
              {{ formatConnectionTime(connectionTime) }}
            </span>
          </div>

          <div
            v-if="lastError"
            class="pt-2 border-t border-gray-200 dark:border-gray-600"
          >
            <span class="text-gray-600 dark:text-gray-400 text-xs">錯誤:</span>
            <p class="text-red-600 text-xs mt-1">{{ lastError }}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
          <button
            @click="toggleAutoReconnect"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            {{ autoReconnectEnabled ? "停用自動重連" : "啟用自動重連" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useWebSocketConnection } from "@/services/websocket";

// WebSocket 連接管理
const {
  connected: isConnected,
  connecting: isConnecting,
  error: connectionError,
  reconnectAttempts,
  connect,
  disconnect,
  autoReconnect,
} = useWebSocketConnection();

// 本地狀態
const showDetails = ref(false);
const autoReconnectEnabled = ref(true);
const connectionTime = ref<Date | null>(null);
const lastError = ref<string | null>(null);

// 計算屬性
const statusText = computed(() => {
  if (isConnecting.value) return "連接中...";
  if (isConnected.value) return "已連接";
  return "已斷開";
});

const statusClasses = computed(() => {
  if (isConnecting.value) {
    return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
  }
  if (isConnected.value) {
    return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200";
  }
  return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
});

const indicatorClasses = computed(() => {
  if (isConnecting.value) return "bg-yellow-500";
  if (isConnected.value) return "bg-green-500";
  return "bg-red-500";
});

const pulseClasses = computed(() => {
  return "bg-green-400";
});

const showReconnectButton = computed(() => {
  return !isConnected.value && !isConnecting.value;
});

// 方法
const handleReconnect = async () => {
  try {
    await connect();
    connectionTime.value = new Date();
    lastError.value = null;
  } catch (error: any) {
    lastError.value = error.message;
  }
};

const toggleAutoReconnect = () => {
  autoReconnectEnabled.value = !autoReconnectEnabled.value;
  if (autoReconnectEnabled.value && !isConnected.value) {
    autoReconnect();
  }
};

const formatConnectionTime = (time: Date | null): string => {
  if (!time) return "未知";
  const now = new Date();
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
  return `${Math.floor(diff / 3600)}小時前`;
};

// 點擊狀態指示器顯示詳情
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

// 監聽連接狀態變化
const handleConnectionChange = () => {
  if (isConnected.value) {
    connectionTime.value = new Date();
    lastError.value = null;
  } else if (connectionError.value) {
    lastError.value = connectionError.value;

    // 自動重連
    if (autoReconnectEnabled.value) {
      setTimeout(() => {
        if (!isConnected.value) {
          autoReconnect();
        }
      }, 3000);
    }
  }
};

// 生命週期
onMounted(async () => {
  // 監聽連接狀態變化
  watch([isConnected, connectionError], handleConnectionChange);

  // 初始連接
  try {
    await connect();
    connectionTime.value = new Date();
  } catch (error: any) {
    lastError.value = error.message;
    console.error("初始 WebSocket 連接失敗:", error);
  }
});

onUnmounted(() => {
  disconnect();
});
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
