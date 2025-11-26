<template>
  <div id="app" class="min-h-screen">
    <!-- Global Loading -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80"
    >
      <div class="flex flex-col items-center space-y-4">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
        <p class="text-gray-600 dark:text-gray-400">
          載入 SyncCoreAI 儀表板...
        </p>
      </div>
    </div>

    <!-- Main App -->
    <RouterView v-else />

    <!-- Error Boundary -->
    <div
      v-if="hasError"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl"
      >
        <div class="flex items-center space-x-3 mb-4">
          <div class="flex-shrink-0">
            <svg
              class="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
            應用程式錯誤
          </h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          發生未預期的錯誤，請重新整理頁面或稍後再試。
        </p>
        <div class="flex space-x-3">
          <button
            @click="refreshPage"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            重新整理
          </button>
          <button
            @click="hasError = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from "vue";
import { RouterView } from "vue-router";
import { useAuthStore } from "./stores";

// Store
const authStore = useAuthStore();

// Global state
const isLoading = ref(true);
const hasError = ref(false);

// Global error handling
onErrorCaptured((err: any) => {
  console.error("App Error Captured:", err);
  hasError.value = true;
  return false; // Prevent error from propagating
});

// Initialize app
onMounted(async () => {
  try {
    // Initialize auth store
    await authStore.init();

    // Simulate initialization delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("✅ SyncCoreAI Dashboard initialized");

    isLoading.value = false;
  } catch (error) {
    console.error("App initialization error:", error);
    hasError.value = true;
    isLoading.value = false;
  }
});

// Error recovery
const refreshPage = () => {
  window.location.reload();
};
</script>

<style>
/* Global styles will be imported in main.ts */
</style>
