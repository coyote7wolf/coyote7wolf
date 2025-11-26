<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <ExclamationTriangleIcon class="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          找不到頁面
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">
          抱歉，您要尋找的頁面不存在。它可能已被移動、刪除或您輸入了錯誤的網址。
        </p>
      </div>

      <div class="space-y-4">
        <router-link
          to="/dashboard"
          class="inline-block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回儀表板
        </router-link>
        
        <button
          @click="goBack"
          class="inline-block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          返回上一頁
        </button>
      </div>

      <div class="mt-8 text-sm text-gray-400">
        <p>需要協助？聯繫我們的<a href="#" class="text-blue-600 hover:text-blue-500">技術支援團隊</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const goBack = () => {
  window.history.back()
}
</script>