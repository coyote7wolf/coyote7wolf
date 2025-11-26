<template>
  <div class="space-y-6">
    <!-- 推薦引擎狀態 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div
          class="w-3 h-3 rounded-full"
          :class="
            engineStatus.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          "
        ></div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          智能推薦引擎
        </h3>
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        更新時間: {{ lastUpdateTime }}
      </div>
    </div>

    <!-- 推薦類型切換 -->
    <div class="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="type in recommendationTypes"
        :key="type.id"
        @click="activeType = type.id"
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
        :class="
          activeType === type.id
            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
        "
      >
        {{ type.icon }} {{ type.name }}
        <span
          class="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
        >
          {{ getRecommendationCount(type.id) }}
        </span>
      </button>
    </div>

    <!-- 推薦列表 -->
    <div class="space-y-4">
      <div
        v-for="recommendation in filteredRecommendations"
        :key="recommendation.id"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- 推薦標題和類型 -->
            <div class="flex items-center space-x-2 mb-2">
              <span class="text-lg">{{
                getTypeIcon(recommendation.type)
              }}</span>
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ recommendation.title }}
              </h4>
              <span
                class="px-2 py-1 text-xs rounded-full"
                :class="getPriorityColor(recommendation.priority)"
              >
                {{ recommendation.priority }}
              </span>
            </div>

            <!-- 推薦描述 -->
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {{ recommendation.description }}
            </p>

            <!-- 推薦依據 -->
            <div
              class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3"
            >
              <div class="flex items-center space-x-1">
                <span>📊</span>
                <span
                  >信心度:
                  {{ (recommendation.confidence * 100).toFixed(0) }}%</span
                >
              </div>
              <div class="flex items-center space-x-1">
                <span>⏱️</span>
                <span>預期節省: {{ recommendation.estimatedTimeSaving }}h</span>
              </div>
              <div class="flex items-center space-x-1">
                <span>👥</span>
                <span>影響: {{ recommendation.impactedUsers.length }} 人</span>
              </div>
            </div>

            <!-- 相關數據 -->
            <div
              v-if="recommendation.supportingData"
              class="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3"
            >
              <div
                class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                支持數據:
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div
                  v-for="(value, key) in recommendation.supportingData"
                  :key="key"
                  class="flex justify-between"
                >
                  <span class="text-gray-600 dark:text-gray-400"
                    >{{ key }}:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    value
                  }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="flex items-center space-x-2">
              <button
                v-if="recommendation.actionable"
                @click="implementRecommendation(recommendation)"
                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                立即執行
              </button>
              <button
                @click="viewDetails(recommendation)"
                class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                查看詳情
              </button>
              <button
                @click="dismissRecommendation(recommendation.id)"
                class="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                忽略
              </button>
            </div>
          </div>

          <!-- 推薦時間和狀態 -->
          <div class="text-right text-xs text-gray-500 dark:text-gray-400">
            <div>{{ formatTime(recommendation.timestamp) }}</div>
            <div
              class="mt-1 px-2 py-0.5 rounded-full text-xs"
              :class="getStatusColor(recommendation.status)"
            >
              {{ recommendation.status }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="filteredRecommendations.length === 0" class="text-center py-8">
        <div class="text-4xl mb-4">🤖</div>
        <p class="text-gray-500 dark:text-gray-400">
          目前沒有 {{ getTypeName(activeType) }} 相關的推薦
        </p>
      </div>
    </div>

    <!-- 推薦統計 -->
    <div
      class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ recommendations.length }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">總推薦數</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ implementedCount }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">已執行</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ pendingCount }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">待處理</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ (averageConfidence * 100).toFixed(0) }}%
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">平均信心度</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface SmartRecommendation {
  id: string;
  type:
    | "team-pairing"
    | "optimal-time"
    | "code-quality"
    | "performance"
    | "workflow";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  estimatedTimeSaving: number;
  impactedUsers: string[];
  actionable: boolean;
  timestamp: Date;
  status: "new" | "viewed" | "in-progress" | "implemented" | "dismissed";
  supportingData?: Record<string, any>;
}

interface Props {
  recommendations?: SmartRecommendation[];
  autoRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  recommendations: () => [],
  autoRefresh: true,
});

// 響應式數據
const activeType = ref<string>("all");
const lastUpdateTime = ref<string>("");
const engineStatus = ref({ online: true, lastHeartbeat: new Date() });

// 推薦類型配置
const recommendationTypes = [
  { id: "all", name: "全部", icon: "📋" },
  { id: "team-pairing", name: "團隊配對", icon: "👥" },
  { id: "optimal-time", name: "最佳時機", icon: "⏰" },
  { id: "code-quality", name: "代碼品質", icon: "🔧" },
  { id: "performance", name: "性能優化", icon: "⚡" },
  { id: "workflow", name: "工作流程", icon: "🔄" },
];

// 模擬推薦數據
const recommendations = ref<SmartRecommendation[]>([
  {
    id: "rec_1",
    type: "team-pairing",
    title: "建議 Alice 和 Bob 協作處理 API 模組",
    description:
      "基於歷史協作數據，這對組合在 API 開發上有 85% 的成功率，預計可提升 30% 開發效率。",
    priority: "high",
    confidence: 0.87,
    estimatedTimeSaving: 12,
    impactedUsers: ["alice_chen", "bob_wilson"],
    actionable: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "new",
    supportingData: {
      歷史協作次數: 15,
      平均完成時間: "3.2天",
      代碼品質分數: 92,
      用戶滿意度: "4.6/5",
    },
  },
  {
    id: "rec_2",
    type: "optimal-time",
    title: "建議在下午 2-4 點進行代碼審查",
    description:
      "數據顯示團隊在此時段的專注度最高，代碼審查效率比其他時段高 40%。",
    priority: "medium",
    confidence: 0.73,
    estimatedTimeSaving: 8,
    impactedUsers: ["team_all"],
    actionable: true,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "viewed",
    supportingData: {
      最佳專注時段: "14:00-16:00",
      效率提升: "40%",
      錯誤發現率: "提升25%",
      團隊滿意度: "4.2/5",
    },
  },
  {
    id: "rec_3",
    type: "code-quality",
    title: "建議重構 UserService 模組",
    description:
      "該模組複雜度過高，建議拆分為多個小模組，可提升可維護性和測試覆蓋率。",
    priority: "high",
    confidence: 0.91,
    estimatedTimeSaving: 20,
    impactedUsers: ["dev_team"],
    actionable: true,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: "in-progress",
    supportingData: {
      複雜度分數: 8.7,
      建議拆分: "3個模組",
      預期測試覆蓋率: "+25%",
      維護成本: "降低40%",
    },
  },
  {
    id: "rec_4",
    type: "performance",
    title: "優化數據庫查詢性能",
    description:
      "檢測到 3 個慢查詢，建議添加索引和優化查詢邏輯，可提升 60% 響應速度。",
    priority: "high",
    confidence: 0.89,
    estimatedTimeSaving: 15,
    impactedUsers: ["backend_team"],
    actionable: true,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    status: "new",
    supportingData: {
      慢查詢數量: 3,
      平均響應時間: "2.3s",
      目標響應時間: "0.9s",
      影響用戶: 1250,
    },
  },
  {
    id: "rec_5",
    type: "workflow",
    title: "自動化部署流程",
    description:
      "基於團隊部署頻率，建議實施 CI/CD 自動化，可節省 70% 部署時間。",
    priority: "medium",
    confidence: 0.78,
    estimatedTimeSaving: 25,
    impactedUsers: ["devops_team"],
    actionable: true,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: "viewed",
    supportingData: {
      當前部署時間: "45分鐘",
      目標部署時間: "15分鐘",
      每週部署次數: 12,
      錯誤率: "降低60%",
    },
  },
]);

// 計算屬性
const filteredRecommendations = computed(() => {
  if (activeType.value === "all") {
    return recommendations.value;
  }
  return recommendations.value.filter((rec) => rec.type === activeType.value);
});

const implementedCount = computed(
  () =>
    recommendations.value.filter((rec) => rec.status === "implemented").length
);

const pendingCount = computed(
  () =>
    recommendations.value.filter((rec) =>
      ["new", "viewed", "in-progress"].includes(rec.status)
    ).length
);

const averageConfidence = computed(() => {
  if (recommendations.value.length === 0) return 0;
  const sum = recommendations.value.reduce(
    (acc, rec) => acc + rec.confidence,
    0
  );
  return sum / recommendations.value.length;
});

// 方法
const getRecommendationCount = (typeId: string): number => {
  if (typeId === "all") return recommendations.value.length;
  return recommendations.value.filter((rec) => rec.type === typeId).length;
};

const getTypeName = (typeId: string): string => {
  const type = recommendationTypes.find((t) => t.id === typeId);
  return type?.name || "未知類型";
};

const getTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    "team-pairing": "👥",
    "optimal-time": "⏰",
    "code-quality": "🔧",
    performance: "⚡",
    workflow: "🔄",
  };
  return iconMap[type] || "🤖";
};

const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  };
  return colorMap[priority] || "bg-gray-100 text-gray-800";
};

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    viewed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    "in-progress":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    implemented:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    dismissed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

const formatTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} 分鐘前`;
  } else if (hours < 24) {
    return `${hours} 小時前`;
  } else {
    const days = Math.floor(hours / 24);
    return `${days} 天前`;
  }
};

const implementRecommendation = (recommendation: SmartRecommendation) => {
  console.log("🚀 執行推薦:", recommendation.title);
  recommendation.status = "implemented";

  // 模擬執行過程
  setTimeout(() => {
    alert(`推薦 "${recommendation.title}" 已成功執行！`);
  }, 1000);
};

const viewDetails = (recommendation: SmartRecommendation) => {
  console.log("👀 查看推薦詳情:", recommendation);
  recommendation.status = "viewed";

  // 這裡可以打開詳情模態框或導航到詳情頁面
  alert(`查看推薦詳情: ${recommendation.title}`);
};

const dismissRecommendation = (recommendationId: string) => {
  const index = recommendations.value.findIndex(
    (rec) => rec.id === recommendationId
  );
  if (index > -1) {
    recommendations.value[index].status = "dismissed";
    console.log("❌ 忽略推薦:", recommendationId);
  }
};

const updateLastTime = () => {
  lastUpdateTime.value = new Date().toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 生命週期
onMounted(() => {
  updateLastTime();

  // 自動更新時間
  setInterval(updateLastTime, 30000);

  // 模擬引擎心跳
  setInterval(() => {
    engineStatus.value.lastHeartbeat = new Date();
  }, 5000);

  console.log("🧠 智能推薦引擎已啟動");
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
