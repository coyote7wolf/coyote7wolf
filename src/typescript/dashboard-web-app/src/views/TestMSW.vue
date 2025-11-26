<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">MSW 測試頁面</h1>

    <div class="space-y-4">
      <button
        @click="testMSW"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        測試 MSW 連接
      </button>

      <button
        @click="testLogin"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        測試登入 API
      </button>

      <div class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="font-bold">測試結果:</h3>
        <pre class="mt-2 text-sm">{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

const result = ref("");

const testMSW = async () => {
  result.value = "測試中...";
  try {
    const response = await axios.get("/api/dashboard/overview");
    result.value = JSON.stringify(response.data, null, 2);
  } catch (error) {
    result.value = `錯誤: ${error}`;
  }
};

const testLogin = async () => {
  result.value = "測試登入中...";
  try {
    const response = await axios.post("/api/auth/login", {
      email: "admin@synccoreai.com",
      password: "admin123",
    });
    result.value = JSON.stringify(response.data, null, 2);
  } catch (error: any) {
    result.value = `登入錯誤: ${error.message}\n回應: ${JSON.stringify(error.response?.data, null, 2)}`;
  }
};
</script>
