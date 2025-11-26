<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">設定</h1>

    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        應用程式設定
      </h2>

      <div class="space-y-6">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            主題偏好
          </label>
          <select
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="system">跟隨系統</option>
            <option value="light">明亮模式</option>
            <option value="dark">暗黑模式</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            語言設定
          </label>
          <select
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="zh-TW">繁體中文</option>
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            自動重新整理間隔
          </label>
          <select
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="15">15 秒</option>
            <option value="30" selected>30 秒</option>
            <option value="60">1 分鐘</option>
            <option value="300">5 分鐘</option>
          </select>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          儲存設定
        </button>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        關於
      </h2>

      <div class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
        <p><strong>版本:</strong> 0.1.0</p>
        <p><strong>技術棧:</strong> Vue 3 + TypeScript + Vite + Tailwind CSS</p>
        <p><strong>視覺化:</strong> D3.js + Three.js + Chart.js</p>
        <p><strong>狀態管理:</strong> Pinia</p>
        <p>
          <strong>建置時間:</strong> {{ new Date().toLocaleString("zh-TW") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Settings component logic will be implemented later
</script>
