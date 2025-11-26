<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile menu overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="closeMobileMenu"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
    </div>

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0"
      :class="{ '-translate-x-full': !isMobileMenuOpen }"
    >
      <div
        class="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center space-x-2">
          <div
            class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">S</span>
          </div>
          <span class="text-lg font-semibold text-gray-900 dark:text-white">
            SyncCoreAI
          </span>
        </div>
        <button
          @click="closeMobileMenu"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-8 px-4 space-y-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            $route.name === item.name
              ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          ]"
          @click="closeMobileMenu"
        >
          <component
            :is="item.icon"
            :class="[
              $route.name === item.name
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
              'mr-3 h-6 w-6 flex-shrink-0',
            ]"
          />
          {{ item.label }}
        </router-link>
      </nav>

      <!-- User info -->
      <div
        class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center space-x-3">
          <img
            :src="user?.avatar || '/avatars/default.jpg'"
            :alt="user?.name"
            class="h-8 w-8 rounded-full"
          />
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
            >
              {{ user?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ user?.role }}
            </p>
          </div>
          <button
            @click="handleLogout"
            class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top header -->
      <header
        class="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <div class="flex h-16 items-center justify-between px-4">
          <!-- Mobile menu button -->
          <button
            @click="openMobileMenu"
            class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>

          <!-- Page title -->
          <div class="flex-1 lg:flex-none">
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ currentPageTitle }}
            </h1>
          </div>

          <!-- Header actions -->
          <div class="flex items-center space-x-4">
            <!-- Theme toggle -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Toggle theme"
            >
              <SunIcon v-if="isDark" class="h-5 w-5" />
              <MoonIcon v-else class="h-5 w-5" />
            </button>

            <!-- Notification indicator -->
            <div class="relative">
              <div
                class="h-2 w-2 bg-green-400 rounded-full animate-pulse"
                title="System healthy"
              ></div>
            </div>

            <!-- Last updated -->
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ lastUpdatedText }}
            </span>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>

    <!-- WebSocket 狀態指示器 -->
    <WebSocketStatus />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore, useDashboardStore } from "@/stores";
import WebSocketStatus from "@/components/common/WebSocketStatus.vue";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CpuChipIcon,
  CubeIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

// Stores
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const router = useRouter();
const route = useRoute();

// State
const isMobileMenuOpen = ref(false);
const isDark = ref(false);

// Navigation items
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    label: "總覽儀表板",
    icon: HomeIcon,
  },
  {
    name: "Collaboration",
    href: "/collaboration",
    label: "協作分析",
    icon: UsersIcon,
  },
  {
    name: "Performance",
    href: "/performance",
    label: "系統效能",
    icon: ChartBarIcon,
  },
  {
    name: "AIInsights",
    href: "/ai-insights",
    label: "AI 洞察",
    icon: CpuChipIcon,
  },
  {
    name: "Workspace3D",
    href: "/3d-workspace",
    label: "3D 協作空間",
    icon: CubeIcon,
  },
  {
    name: "Interactive3D",
    href: "/interactive-3d",
    label: "互動 3D 工作空間",
    icon: CubeIcon,
  },
  {
    name: "BigDataDemo",
    href: "/big-data-demo",
    label: "大數據虛擬滾動",
    icon: CubeIcon,
  },
  { name: "Settings", href: "/settings", label: "設定", icon: Cog6ToothIcon },
];

// Computed
const user = computed(() => authStore.user);
const currentPageTitle = computed(() => {
  const currentNav = navigation.find((item) => item.name === route.name);
  return currentNav && currentNav.label ? currentNav.label : "儀表板";
});

const lastUpdatedText = computed(() => {
  const lastUpdate = dashboardStore.lastUpdated;
  if (!lastUpdate) return "載入中...";

  const now = new Date();
  const diff = now.getTime() - lastUpdate.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes === 0) return "剛剛更新";
  if (minutes < 60) return `${minutes} 分鐘前更新`;

  const hours = Math.floor(minutes / 60);
  return `${hours} 小時前更新`;
});

// Methods
const openMobileMenu = () => {
  isMobileMenuOpen.value = true;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

const handleLogout = async () => {
  authStore.logout();
  await router.push("/login");
};

// Initialize theme
const initTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  isDark.value = savedTheme === "dark" || (!savedTheme && prefersDark);
  document.documentElement.classList.toggle("dark", isDark.value);
};

// Auto-refresh data
let refreshInterval: number | null = null;

const startAutoRefresh = () => {
  // Refresh every 30 seconds
  refreshInterval = setInterval(() => {
    dashboardStore.fetchOverview();
  }, 30000);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Lifecycle
onMounted(() => {
  initTheme();
  startAutoRefresh();

  // Initial data fetch
  dashboardStore.fetchOverview();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>
