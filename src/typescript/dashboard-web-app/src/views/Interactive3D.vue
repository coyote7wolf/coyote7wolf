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
                class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-sm font-bold">3D</span>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                  3D 互動工作空間
                </h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Phase 4 - 沉浸式協作可視化
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- 視圖切換 -->
            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                v-for="view in views"
                :key="view.id"
                @click="activeView = view.id"
                class="px-3 py-1.5 text-sm rounded-md transition-all duration-200"
                :class="
                  activeView === view.id
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                "
              >
                {{ view.icon }} {{ view.name }}
              </button>
            </div>

            <!-- 全屏切換 -->
            <button
              @click="toggleFullscreen"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              :title="isFullscreen ? '退出全屏' : '進入全屏'"
            >
              <svg
                v-if="!isFullscreen"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="flex-1 relative">
      <!-- 協作軌跡視圖 -->
      <div
        v-show="activeView === 'collaboration'"
        class="h-[calc(100vh-4rem)] relative"
      >
        <CollaborationTrajectory3D
          :width="viewportDimensions.width"
          :height="viewportDimensions.height"
        />

        <!-- 視圖信息覆蓋層 -->
        <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div
            class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center space-x-2">
              <div
                class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
              ></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white"
                >實時協作軌跡追蹤</span
              >
              <span class="text-xs text-gray-500 dark:text-gray-400"
                >{{ activeUsersCount }} 位活躍用戶</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Git 版本演化樹視圖 -->
      <div
        v-show="activeView === 'git-evolution'"
        class="h-[calc(100vh-4rem)] relative"
      >
        <GitEvolutionTree3D
          :width="viewportDimensions.width"
          :height="viewportDimensions.height"
        />

        <!-- 視圖信息覆蓋層 -->
        <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div
            class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center space-x-2">
              <div
                class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
              ></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white"
                >Git 版本演化樹</span
              >
              <span class="text-xs text-gray-500 dark:text-gray-400"
                >{{ totalCommits }} 次提交</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- VR 準備視圖 -->
      <div
        v-show="activeView === 'vr-ready'"
        class="h-[calc(100vh-4rem)] relative flex items-center justify-center"
      >
        <div class="max-w-4xl mx-auto text-center px-6">
          <!-- VR 狀態檢測 -->
          <div class="mb-8">
            <div
              class="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              VR 介面準備
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
              沉浸式虛擬現實協作空間
            </p>
          </div>

          <!-- VR 設備檢測 -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <div
              v-for="device in vrDevices"
              :key="device.name"
              class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ device.name }}
                </h3>
                <div
                  class="w-3 h-3 rounded-full"
                  :class="device.supported ? 'bg-green-500' : 'bg-red-500'"
                ></div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {{ device.description }}
              </p>
              <div class="text-xs">
                <span
                  class="px-2 py-1 rounded-full"
                  :class="
                    device.supported
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  "
                >
                  {{ device.supported ? "支援" : "不支援" }}
                </span>
              </div>
            </div>
          </div>

          <!-- WebXR API 狀態 -->
          <div
            class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8"
          >
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              WebXR API 狀態
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="api in webxrAPIs" :key="api.name" class="text-center">
                <div
                  class="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                  :class="
                    api.available
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  "
                >
                  <span
                    class="text-lg"
                    :class="
                      api.available
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  >
                    {{ api.available ? "✓" : "✗" }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ api.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ api.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- VR 啟動按鈕 -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="enterVRMode"
              :disabled="!vrSupported"
              class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {{ vrSupported ? "🥽 進入 VR 模式" : "❌ VR 不可用" }}
            </button>
            <button
              @click="startVRDemo"
              class="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              📱 演示模式
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能監控浮動面板 -->
    <div
      v-if="showPerformanceMonitor"
      class="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-30"
    >
      <div class="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>FPS: {{ performanceMetrics.fps }}</div>
        <div>渲染: {{ performanceMetrics.renderTime }}ms</div>
        <div>物件: {{ performanceMetrics.objects }}</div>
        <div>記憶體: {{ performanceMetrics.memory }}MB</div>
      </div>
    </div>

    <!-- VR 模式覆蓋層 -->
    <div
      v-if="isVRMode"
      class="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
    >
      <div class="text-center text-white">
        <div
          class="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <h3 class="text-xl font-semibold mb-2">正在初始化 VR 模式</h3>
        <p class="text-gray-300 mb-6">請戴上您的 VR 頭戴設備</p>
        <button
          @click="exitVRMode"
          class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          退出 VR
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import CollaborationTrajectory3D from "@/components/3d/CollaborationTrajectory3D.vue";
import GitEvolutionTree3D from "@/components/3d/GitEvolutionTree3D.vue";

// 視圖控制
const activeView = ref("collaboration");
const isFullscreen = ref(false);
const isVRMode = ref(false);
const showPerformanceMonitor = ref(true);

// 視圖選項
const views = [
  { id: "collaboration", name: "協作軌跡", icon: "👥" },
  { id: "git-evolution", name: "Git 演化", icon: "🌲" },
  { id: "vr-ready", name: "VR 準備", icon: "🥽" },
];

// VR 設備檢測
const vrDevices = ref([
  {
    name: "Oculus/Meta Quest",
    description: "Meta Quest 系列 VR 頭戴設備",
    supported: false,
  },
  {
    name: "HTC Vive",
    description: "HTC Vive 系列 VR 設備",
    supported: false,
  },
  {
    name: "Windows Mixed Reality",
    description: "Windows MR 頭戴設備",
    supported: false,
  },
]);

// WebXR API 檢測
const webxrAPIs = ref([
  {
    name: "WebXR Device API",
    description: "基礎 VR/AR 支援",
    available: false,
  },
  {
    name: "WebXR Gamepads",
    description: "VR 控制器支援",
    available: false,
  },
  {
    name: "WebXR Layers",
    description: "圖層渲染支援",
    available: false,
  },
  {
    name: "WebXR Hand Input",
    description: "手部追蹤支援",
    available: false,
  },
]);

// 性能指標
const performanceMetrics = ref({
  fps: 0,
  renderTime: 0,
  objects: 0,
  memory: 0,
});

// 視窗尺寸
const viewportDimensions = ref({
  width: window.innerWidth,
  height: window.innerHeight - 64, // 減去 header 高度
});

// 計算屬性
const vrSupported = computed(() => {
  return webxrAPIs.value.some((api) => api.available);
});

const activeUsersCount = computed(() => {
  return Math.floor(Math.random() * 8) + 3; // 模擬 3-10 個活躍用戶
});

const totalCommits = computed(() => {
  return Math.floor(Math.random() * 500) + 100; // 模擬 100-600 個提交
});

// 方法
const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    await document.exitFullscreen();
    isFullscreen.value = false;
  }
};

const enterVRMode = async () => {
  if (!vrSupported.value) {
    alert("您的瀏覽器或設備不支援 WebXR VR 功能");
    return;
  }

  isVRMode.value = true;

  try {
    // 模擬 VR 初始化
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 這裡應該實際啟動 WebXR 會話
    // const session = await navigator.xr.requestSession('immersive-vr');

    console.log("🥽 VR 模式已啟動");
  } catch (error) {
    console.error("VR 模式啟動失敗:", error);
    alert("VR 模式啟動失敗，請檢查您的 VR 設備連接");
    isVRMode.value = false;
  }
};

const exitVRMode = () => {
  isVRMode.value = false;
  console.log("🚪 已退出 VR 模式");
};

const startVRDemo = () => {
  alert("演示模式將使用模擬的 3D 環境展示 VR 功能");
  // 這裡可以啟動一個桌面 3D 演示
};

// WebXR 能力檢測
const detectWebXRSupport = async () => {
  if ("xr" in navigator) {
    try {
      // 檢測 VR 支援
      const vrSupported = await (navigator as any).xr.isSessionSupported(
        "immersive-vr"
      );
      if (vrSupported) {
        webxrAPIs.value[0].available = true;

        // 檢測更多 API
        if ("getGamepads" in navigator) {
          webxrAPIs.value[1].available = true;
        }
      }
    } catch (error) {
      console.log("WebXR 檢測失敗:", error);
    }
  }

  // 檢測特定 VR 設備（模擬）
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("oculusbrowser") || userAgent.includes("quest")) {
    vrDevices.value[0].supported = true;
  }
};

// 性能監控
const startPerformanceMonitoring = () => {
  const updateMetrics = () => {
    performanceMetrics.value.fps = Math.round(60 + Math.random() * 10 - 5);
    performanceMetrics.value.renderTime = Math.round(16 + Math.random() * 4);
    performanceMetrics.value.objects = Math.round(1000 + Math.random() * 500);
    performanceMetrics.value.memory = Math.round(150 + Math.random() * 50);
  };

  updateMetrics();
  const interval = setInterval(updateMetrics, 1000);

  return () => clearInterval(interval);
};

// 視窗大小調整
const handleResize = () => {
  viewportDimensions.value = {
    width: window.innerWidth,
    height: window.innerHeight - 64,
  };
};

// 生命週期
let cleanupPerformanceMonitoring: (() => void) | null = null;

onMounted(async () => {
  await detectWebXRSupport();
  cleanupPerformanceMonitoring = startPerformanceMonitoring();
  window.addEventListener("resize", handleResize);

  // 全屏變化監聽
  document.addEventListener("fullscreenchange", () => {
    isFullscreen.value = !!document.fullscreenElement;
  });

  console.log("🌟 Phase 4 - 3D 互動工作空間已載入完成");
});

onUnmounted(() => {
  if (cleanupPerformanceMonitoring) {
    cleanupPerformanceMonitoring();
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
/* 確保全屏時的樣式 */
:fullscreen {
  background: #0a0a0f;
}

/* VR 模式下的特殊樣式 */
.vr-mode {
  cursor: none;
  user-select: none;
}

/* 自定義滾動條 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(156, 163, 175, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
