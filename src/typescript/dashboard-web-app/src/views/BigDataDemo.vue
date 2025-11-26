<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900"
  >
    <!-- Header -->
    <div
      class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div
                class="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-sm font-bold">∞</span>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                  大數據虛擬滾動
                </h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Phase 5 - 高性能列表渲染
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- 數據統計 -->
            <div class="flex items-center space-x-4 text-sm">
              <div class="text-gray-600 dark:text-gray-300">
                總計:
                <span class="font-semibold text-blue-600 dark:text-blue-400">{{
                  totalItems.toLocaleString()
                }}</span>
              </div>
              <div class="text-gray-600 dark:text-gray-300">
                可見:
                <span
                  class="font-semibold text-green-600 dark:text-green-400"
                  >{{ visibleItems }}</span
                >
              </div>
            </div>

            <!-- 控制按鈕 -->
            <div class="flex space-x-2">
              <button
                @click="generateMoreData"
                :disabled="isLoading"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors flex items-center"
              >
                <svg
                  v-if="isLoading"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isLoading ? "生成中..." : "添加數據" }}
              </button>

              <button
                @click="clearData"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="flex">
      <!-- 側邊欄控制 -->
      <div
        class="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="space-y-6">
          <!-- 搜尋過濾 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >搜尋過濾</label
            >
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜尋名稱、郵箱或部門..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <!-- 類型篩選 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >類型篩選</label
            >
            <div class="space-y-2">
              <label
                v-for="type in itemTypes"
                :key="type"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :value="type"
                  v-model="selectedTypes"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{
                  type
                }}</span>
              </label>
            </div>
          </div>

          <!-- 排序選項 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >排序方式</label
            >
            <select
              v-model="sortBy"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">名稱</option>
              <option value="email">郵箱</option>
              <option value="department">部門</option>
              <option value="joinDate">加入日期</option>
              <option value="lastActive">最後活躍</option>
            </select>
          </div>

          <!-- 虛擬滾動設置 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >滾動設置</label
            >
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-600 dark:text-gray-400"
                  >項目高度: {{ itemHeight }}px</label
                >
                <input
                  type="range"
                  min="40"
                  max="120"
                  v-model="itemHeight"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label class="text-xs text-gray-600 dark:text-gray-400"
                  >緩衝區: {{ overscan }} 項</label
                >
                <input
                  type="range"
                  min="1"
                  max="10"
                  v-model="overscan"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- 性能統計 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >性能統計</label
            >
            <div
              class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-xs font-mono space-y-1"
            >
              <div>渲染項目: {{ visibleItems }}/{{ filteredItems.length }}</div>
              <div>記憶體使用: {{ memoryUsage }}MB</div>
              <div>滾動位置: {{ scrollTop }}px</div>
              <div>總高度: {{ totalHeight }}px</div>
              <div
                class="border-t border-gray-300 dark:border-gray-600 pt-1 mt-2"
              >
                <div class="text-blue-600 dark:text-blue-400 font-semibold">
                  Web Worker
                </div>
                <div v-if="isProcessing" class="text-orange-500">處理中...</div>
                <div v-else>處理時間: {{ processingTime.toFixed(1) }}ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 虛擬滾動列表 -->
      <div class="flex-1 p-6">
        <VirtualScroll
          ref="virtualScrollRef"
          :items="filteredItems"
          :item-height="itemHeight"
          :height="listHeight"
          :overscan="overscan"
          :loading="isLoading"
          @load-more="handleLoadMore"
          @scroll="handleScroll"
        >
          <template #default="{ item, index }">
            <div
              :data-index="index"
              class="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              :style="{ height: `${itemHeight}px` }"
            >
              <!-- 頭像 -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-4 flex-shrink-0"
                :style="{ backgroundColor: item.color }"
              >
                {{ item.name.charAt(0) }}
              </div>

              <!-- 主要信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3
                    class="text-sm font-medium text-gray-900 dark:text-white truncate"
                  >
                    {{ item.name }}
                  </h3>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getTypeColor(item.type)"
                  >
                    {{ item.type }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ item.email }}
                </p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs text-gray-400 dark:text-gray-500">{{
                    item.department
                  }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500">{{
                    formatDate(item.lastActive)
                  }}</span>
                </div>
              </div>

              <!-- 狀態指示器 -->
              <div class="ml-4 flex items-center space-x-2">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="item.isActive ? 'bg-green-500' : 'bg-gray-300'"
                ></div>
                <span class="text-xs text-gray-500">{{
                  item.isActive ? "線上" : "離線"
                }}</span>
              </div>
            </div>
          </template>
        </VirtualScroll>
      </div>
    </div>

    <!-- 加載覆蓋層 -->
    <div
      v-if="isGenerating"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4"
      >
        <div class="flex items-center space-x-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              生成大數據
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              正在生成 {{ generateCount.toLocaleString() }} 條記錄...
            </p>
          </div>
        </div>
        <div class="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${generateProgress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import VirtualScroll from "@/components/ui/VirtualScroll.vue";
import webWorkerManager, {
  type DataItem,
  type FilterOptions,
} from "@/utils/webWorkerManager";

// 響應式數據
const items = ref<DataItem[]>([]);
const processedItems = ref<DataItem[]>([]);
const searchQuery = ref("");
const selectedTypes = ref(["員工", "經理", "實習生", "顧問"]);
const sortBy = ref("name");
const itemHeight = ref(80);
const overscan = ref(3);
const isLoading = ref(false);
const isGenerating = ref(false);
const generateCount = ref(0);
const generateProgress = ref(0);
const isProcessing = ref(false);
const processingTime = ref(0);

// UI 狀態
const listHeight = ref(600);
const scrollTop = ref(0);
const visibleItems = ref(0);
const memoryUsage = ref(0);

// 引用
const virtualScrollRef = ref();

// 常量
const itemTypes = ["員工", "經理", "實習生", "顧問"];
const departments = [
  "技術部",
  "產品部",
  "設計部",
  "營運部",
  "人事部",
  "財務部",
];
const colors = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

// 計算屬性
const totalItems = computed(() => items.value.length);

const filteredItems = computed(() => processedItems.value);

const totalHeight = computed(() => {
  return filteredItems.value.length * itemHeight.value;
});

// 工具方法
const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    員工: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    經理: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    實習生:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    顧問: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  };
  return (
    colorMap[type] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
  );
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
};

// 數據處理
const processData = async () => {
  if (isProcessing.value || items.value.length === 0) return;

  isProcessing.value = true;

  try {
    const filters: FilterOptions = {
      searchQuery: searchQuery.value,
      selectedTypes:
        selectedTypes.value.length === itemTypes.length
          ? []
          : selectedTypes.value,
    };

    const startTime = performance.now();

    // 使用 Web Worker 處理數據
    const result = await webWorkerManager.filterData(items.value, filters);

    // 排序處理
    const sortResult = await webWorkerManager.sortData(
      result.filteredItems,
      sortBy.value
    );

    processedItems.value = sortResult.sortedItems;
    processingTime.value = performance.now() - startTime;

    console.log(
      `📊 處理了 ${items.value.length} 條記錄，過濾後 ${result.filteredCount} 條，耗時 ${processingTime.value.toFixed(2)}ms`
    );
  } catch (error) {
    console.error("數據處理失敗:", error);
    // 回退到原始數據
    processedItems.value = items.value;
  } finally {
    isProcessing.value = false;
  }
};

const generateMoreData = async () => {
  isGenerating.value = true;
  generateCount.value = 10000;
  generateProgress.value = 0;

  try {
    const startIndex = items.value.length;
    const result = await webWorkerManager.generateData(
      generateCount.value,
      startIndex
    );

    items.value.push(...result.items);
    generateProgress.value = 100;

    console.log(
      `✅ 使用 Web Worker 生成了 ${result.count} 條記錄，總計 ${items.value.length} 條，耗時 ${result.processingTime.toFixed(2)}ms`
    );

    // 重新處理數據
    await processData();
  } catch (error) {
    console.error("數據生成失敗:", error);
  } finally {
    isGenerating.value = false;
  }
};

const clearData = () => {
  items.value = [];
  processedItems.value = [];
  if (virtualScrollRef.value) {
    virtualScrollRef.value.scrollToTop();
  }
};

// 事件處理
const handleLoadMore = async () => {
  if (isLoading.value) return;

  isLoading.value = true;

  try {
    const startIndex = items.value.length;
    const result = await webWorkerManager.generateData(50, startIndex);

    items.value.push(...result.items);

    console.log(
      `🔄 加載了 ${result.count} 條記錄，耗時 ${result.processingTime.toFixed(2)}ms`
    );

    // 重新處理數據
    await processData();
  } catch (error) {
    console.error("加載更多數據失敗:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleScroll = ({ scrollTop: newScrollTop }: { scrollTop: number }) => {
  scrollTop.value = newScrollTop;

  if (virtualScrollRef.value) {
    const stats = virtualScrollRef.value.getScrollStats();
    visibleItems.value = stats.visibleItems;
  }
};

// 性能監控
const startPerformanceMonitoring = () => {
  const updateMemory = () => {
    const memory = (performance as any).memory;
    if (memory) {
      memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
  };

  updateMemory();
  const interval = setInterval(updateMemory, 1000);

  return () => clearInterval(interval);
};

// 視窗大小調整
const handleResize = () => {
  listHeight.value = window.innerHeight - 200; // 減去 header 和 padding
};

// 監聽數據變化
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, selectedTypes, sortBy], () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    processData();
  }, 300);
});

// 生命週期
let cleanupPerformanceMonitoring: (() => void) | null = null;

onMounted(async () => {
  handleResize();
  window.addEventListener("resize", handleResize);
  cleanupPerformanceMonitoring = startPerformanceMonitoring();

  // 使用 Web Worker 生成初始數據
  try {
    const result = await webWorkerManager.generateData(100, 0);
    items.value = result.items;
    processedItems.value = result.items;

    console.log(
      `📜 大數據虛擬滾動演示頁面已載入，初始生成 ${result.count} 條記錄，耗時 ${result.processingTime.toFixed(2)}ms`
    );
  } catch (error) {
    console.error("初始數據生成失敗:", error);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (cleanupPerformanceMonitoring) {
    cleanupPerformanceMonitoring();
  }
});
</script>

<style scoped>
/* 確保列表項目高度一致 */
.list-item {
  box-sizing: border-box;
}

/* 加載動畫 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 過渡效果 */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
