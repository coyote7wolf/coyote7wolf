<template>
  <div class="space-y-6">
    <!-- 服務狀態總覽 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="service in aiServices"
        :key="service.name"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ service.displayName }}
          </h3>
          <div
            class="w-3 h-3 rounded-full"
            :class="getStatusColor(service.status)"
          ></div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">響應時間:</span>
            <span class="font-medium" :class="getLatencyColor(service.latency)">
              {{ service.latency }}ms
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">錯誤率:</span>
            <span
              class="font-medium"
              :class="getErrorRateColor(service.errorRate)"
            >
              {{ service.errorRate.toFixed(2) }}%
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">可用性:</span>
            <span class="font-medium text-green-600">
              {{ service.uptime.toFixed(2) }}%
            </span>
          </div>
        </div>

        <!-- 降級策略狀態 -->
        <div
          v-if="service.fallbackActive"
          class="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800"
        >
          <div
            class="flex items-center text-yellow-800 dark:text-yellow-200 text-xs"
          >
            <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
            <span class="font-medium">降級模式啟用</span>
          </div>
          <div class="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
            {{ service.fallbackReason }}
          </div>
        </div>
      </div>
    </div>

    <!-- 錯誤日志和處理 -->
    <div
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            🚨 實時錯誤監控
          </h3>
          <div class="flex items-center space-x-2">
            <button
              @click="toggleAutoRefresh"
              class="px-3 py-1 text-xs rounded transition-colors"
              :class="
                autoRefresh
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              "
            >
              自動刷新: {{ autoRefresh ? "ON" : "OFF" }}
            </button>
            <button
              @click="clearErrors"
              class="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              清除錯誤
            </button>
          </div>
        </div>
      </div>

      <div class="p-4">
        <!-- 錯誤篩選 -->
        <div class="flex items-center space-x-4 mb-4">
          <select
            v-model="selectedSeverity"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">所有嚴重等級</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
          </select>

          <select
            v-model="selectedService"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">所有服務</option>
            <option
              v-for="service in aiServices"
              :key="service.name"
              :value="service.name"
            >
              {{ service.displayName }}
            </option>
          </select>
        </div>

        <!-- 錯誤列表 -->
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="error in filteredErrors"
            :key="error.id"
            class="p-3 border border-gray-200 dark:border-gray-600 rounded"
            :class="getErrorBgColor(error.severity)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-lg">{{
                    getSeverityIcon(error.severity)
                  }}</span>
                  <span
                    class="text-sm font-semibold"
                    :class="getErrorTextColor(error.severity)"
                  >
                    {{ error.service }}
                  </span>
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="getSeverityColor(error.severity)"
                  >
                    {{ error.severity }}
                  </span>
                </div>

                <div class="text-sm text-gray-900 dark:text-white mb-2">
                  {{ error.message }}
                </div>

                <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <strong>錯誤碼:</strong> {{ error.errorCode }} |
                  <strong>次數:</strong> {{ error.count }} |
                  <strong>影響用戶:</strong> {{ error.affectedUsers }}
                </div>

                <!-- 詳細錯誤信息 -->
                <details class="text-xs">
                  <summary
                    class="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    查看詳細信息
                  </summary>
                  <pre
                    class="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto text-xs"
                    >{{ error.stackTrace }}</pre
                  >
                </details>

                <!-- 自動處理狀態 -->
                <div
                  v-if="error.autoHandled"
                  class="mt-2 flex items-center text-green-600 dark:text-green-400 text-xs"
                >
                  <CheckCircleIcon class="h-4 w-4 mr-1" />
                  <span>已自動處理: {{ error.handlingAction }}</span>
                </div>
              </div>

              <div
                class="text-right text-xs text-gray-500 dark:text-gray-400 ml-4"
              >
                <div>{{ formatTime(error.timestamp) }}</div>
                <div class="mt-1">
                  <button
                    v-if="!error.resolved"
                    @click="resolveError(error.id)"
                    class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    標記已解決
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空狀態 -->
          <div v-if="filteredErrors.length === 0" class="text-center py-8">
            <div class="text-4xl mb-4">✅</div>
            <p class="text-gray-500 dark:text-gray-400">沒有匹配的錯誤記錄</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 降級策略配置 -->
    <div
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🛡️ 降級策略配置
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="strategy in fallbackStrategies"
          :key="strategy.id"
          class="p-3 border border-gray-200 dark:border-gray-600 rounded"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ strategy.name }}
            </h4>
            <label class="flex items-center">
              <input
                type="checkbox"
                :checked="strategy.enabled"
                @change="toggleStrategy(strategy.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          </div>

          <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {{ strategy.description }}
          </p>

          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500 dark:text-gray-400">
              觸發條件: {{ strategy.triggerCondition }}
            </span>
            <span
              class="px-2 py-0.5 rounded-full"
              :class="
                strategy.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              "
            >
              {{ strategy.enabled ? "啟用" : "停用" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";

interface AIServiceError {
  id: string;
  service: string;
  severity: "critical" | "error" | "warning";
  message: string;
  errorCode: string;
  count: number;
  affectedUsers: number;
  timestamp: Date;
  stackTrace: string;
  resolved: boolean;
  autoHandled: boolean;
  handlingAction?: string;
}

interface AIService {
  name: string;
  displayName: string;
  status: "healthy" | "degraded" | "error";
  latency: number;
  errorRate: number;
  uptime: number;
  fallbackActive: boolean;
  fallbackReason?: string;
}

interface FallbackStrategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerCondition: string;
}

// 響應式數據
const autoRefresh = ref(true);
const selectedSeverity = ref("");
const selectedService = ref("");
let refreshInterval: NodeJS.Timer | null = null;

// AI 服務狀態
const aiServices = ref<AIService[]>([
  {
    name: "llm-service",
    displayName: "LLM 服務",
    status: "healthy",
    latency: 245,
    errorRate: 0.8,
    uptime: 99.7,
    fallbackActive: false,
  },
  {
    name: "embedding-service",
    displayName: "向量嵌入服務",
    status: "degraded",
    latency: 892,
    errorRate: 3.2,
    uptime: 97.8,
    fallbackActive: true,
    fallbackReason: "主模型響應超時，使用緩存結果",
  },
  {
    name: "recommendation-engine",
    displayName: "推薦引擎",
    status: "healthy",
    latency: 156,
    errorRate: 1.1,
    uptime: 99.9,
    fallbackActive: false,
  },
]);

// 錯誤列表
const errors = ref<AIServiceError[]>([
  {
    id: "err_1",
    service: "LLM 服務",
    severity: "warning",
    message: "Token 使用量接近月度限額 (85%)",
    errorCode: "QUOTA_WARNING",
    count: 12,
    affectedUsers: 45,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    stackTrace:
      "TokenQuotaService.checkUsage()\n  at LLMProvider.generateResponse()\n  at AIController.handleRequest()",
    resolved: false,
    autoHandled: true,
    handlingAction: "已啟用費用控制策略",
  },
  {
    id: "err_2",
    service: "向量嵌入服務",
    severity: "error",
    message: "模型載入失敗，回退到較小模型",
    errorCode: "MODEL_LOAD_FAILED",
    count: 3,
    affectedUsers: 12,
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    stackTrace:
      "EmbeddingModel.loadModel()\n  at EmbeddingService.initialize()\n  at startup.js:45",
    resolved: false,
    autoHandled: true,
    handlingAction: "自動切換到 base 模型",
  },
  {
    id: "err_3",
    service: "推薦引擎",
    severity: "critical",
    message: "用戶行為分析模組崩潰",
    errorCode: "ANALYTICS_CRASH",
    count: 1,
    affectedUsers: 234,
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    stackTrace:
      "UserBehaviorAnalyzer.analyze()\n  at RecommendationEngine.generateRecommendations()\n  at RecommendationController.getRecommendations()",
    resolved: false,
    autoHandled: false,
  },
]);

// 降級策略
const fallbackStrategies = ref<FallbackStrategy[]>([
  {
    id: "cache_fallback",
    name: "快取回退",
    description: "當 AI 服務不可用時，返回快取的結果",
    enabled: true,
    triggerCondition: "響應時間 > 5s 或錯誤率 > 5%",
  },
  {
    id: "model_downgrade",
    name: "模型降級",
    description: "使用較小但更穩定的模型替代",
    enabled: true,
    triggerCondition: "主模型載入失敗或內存不足",
  },
  {
    id: "simplified_response",
    name: "簡化回應",
    description: "提供基本功能，關閉高級特性",
    enabled: false,
    triggerCondition: "系統負載 > 80%",
  },
  {
    id: "queue_throttling",
    name: "請求節流",
    description: "限制併發請求數量，防止系統過載",
    enabled: true,
    triggerCondition: "CPU 使用率 > 85%",
  },
]);

// 計算屬性
const filteredErrors = computed(() => {
  let filtered = errors.value;

  if (selectedSeverity.value) {
    filtered = filtered.filter(
      (error) => error.severity === selectedSeverity.value
    );
  }

  if (selectedService.value) {
    filtered = filtered.filter(
      (error) =>
        aiServices.value.find(
          (service) => service.name === selectedService.value
        )?.displayName === error.service
    );
  }

  return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
});

// 方法
const getStatusColor = (status: string): string => {
  const colorMap = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    error: "bg-red-500",
  };
  return colorMap[status as keyof typeof colorMap] || "bg-gray-500";
};

const getLatencyColor = (latency: number): string => {
  if (latency < 200) return "text-green-600 dark:text-green-400";
  if (latency < 500) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

const getErrorRateColor = (errorRate: number): string => {
  if (errorRate < 1) return "text-green-600 dark:text-green-400";
  if (errorRate < 3) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

const getSeverityIcon = (severity: string): string => {
  const iconMap = {
    critical: "🔴",
    error: "🟠",
    warning: "🟡",
  };
  return iconMap[severity as keyof typeof iconMap] || "⚪";
};

const getSeverityColor = (severity: string): string => {
  const colorMap = {
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    error:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  };
  return (
    colorMap[severity as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
  );
};

const getErrorBgColor = (severity: string): string => {
  const colorMap = {
    critical: "bg-red-50 dark:bg-red-900/10",
    error: "bg-orange-50 dark:bg-orange-900/10",
    warning: "bg-yellow-50 dark:bg-yellow-900/10",
  };
  return (
    colorMap[severity as keyof typeof colorMap] || "bg-gray-50 dark:bg-gray-800"
  );
};

const getErrorTextColor = (severity: string): string => {
  const colorMap = {
    critical: "text-red-700 dark:text-red-300",
    error: "text-orange-700 dark:text-orange-300",
    warning: "text-yellow-700 dark:text-yellow-300",
  };
  return (
    colorMap[severity as keyof typeof colorMap] ||
    "text-gray-700 dark:text-gray-300"
  );
};

const formatTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;

  const days = Math.floor(hours / 24);
  return `${days} 天前`;
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;

  if (autoRefresh.value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);

  refreshInterval = setInterval(() => {
    // 模擬新錯誤產生
    if (Math.random() < 0.3) {
      generateRandomError();
    }

    // 更新服務狀態
    updateServiceStatus();
  }, 10000); // 每10秒刷新
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

const clearErrors = () => {
  errors.value = errors.value.filter((error) => !error.resolved);
  console.log("🧹 已清除已解決的錯誤");
};

const resolveError = (errorId: string) => {
  const error = errors.value.find((e) => e.id === errorId);
  if (error) {
    error.resolved = true;
    console.log("✅ 錯誤已標記為解決:", errorId);
  }
};

const toggleStrategy = (strategyId: string) => {
  const strategy = fallbackStrategies.value.find((s) => s.id === strategyId);
  if (strategy) {
    strategy.enabled = !strategy.enabled;
    console.log(
      `🛡️ 降級策略 ${strategy.name} ${strategy.enabled ? "啟用" : "停用"}`
    );
  }
};

const generateRandomError = () => {
  const randomErrors = [
    {
      service: "LLM 服務",
      severity: "warning" as const,
      message: "API 響應時間較慢",
      errorCode: "SLOW_RESPONSE",
    },
    {
      service: "向量嵌入服務",
      severity: "error" as const,
      message: "向量計算超時",
      errorCode: "COMPUTE_TIMEOUT",
    },
    {
      service: "推薦引擎",
      severity: "warning" as const,
      message: "推薦準確率下降",
      errorCode: "ACCURACY_DROP",
    },
  ];

  const randomError =
    randomErrors[Math.floor(Math.random() * randomErrors.length)];

  const newError: AIServiceError = {
    id: `err_${Date.now()}`,
    service: randomError.service,
    severity: randomError.severity,
    message: randomError.message,
    errorCode: randomError.errorCode,
    count: Math.floor(Math.random() * 5) + 1,
    affectedUsers: Math.floor(Math.random() * 50) + 1,
    timestamp: new Date(),
    stackTrace: "Mock stack trace...",
    resolved: false,
    autoHandled: Math.random() > 0.5,
    handlingAction: Math.random() > 0.5 ? "已自動重試" : undefined,
  };

  errors.value.unshift(newError);

  // 限制錯誤數量
  if (errors.value.length > 20) {
    errors.value = errors.value.slice(0, 20);
  }
};

const updateServiceStatus = () => {
  aiServices.value.forEach((service) => {
    // 隨機更新服務指標
    service.latency += (Math.random() - 0.5) * 50;
    service.latency = Math.max(50, Math.min(2000, service.latency));

    service.errorRate += (Math.random() - 0.5) * 0.5;
    service.errorRate = Math.max(0, Math.min(10, service.errorRate));

    // 根據指標調整狀態
    if (service.errorRate > 5 || service.latency > 1000) {
      service.status = "error";
    } else if (service.errorRate > 2 || service.latency > 500) {
      service.status = "degraded";
    } else {
      service.status = "healthy";
    }
  });
};

// 生命週期
onMounted(() => {
  console.log("🛡️ AI 錯誤邊界監控已啟動");
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
/* 自定義滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
