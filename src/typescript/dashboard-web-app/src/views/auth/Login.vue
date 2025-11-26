<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Title -->
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 text-white"
        >
          <svg
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          登入 SyncCoreAI
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          協作分析儀表板
        </p>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">電子郵件</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
              :class="{ 'border-red-500': errors.email }"
              placeholder="電子郵件地址"
              :disabled="isLoading"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>
          <div>
            <label for="password" class="sr-only">密碼</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
              :class="{ 'border-red-500': errors.password }"
              placeholder="密碼"
              :disabled="isLoading"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              for="remember-me"
              class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              記住我
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              忘記密碼？
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            {{ isLoading ? "登入中..." : "登入" }}
          </button>
        </div>

        <!-- Debug MSW -->
        <div
          class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <button
            @click="testMSW"
            type="button"
            class="w-full text-xs py-2 px-3 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            🔧 測試 MSW 連接
          </button>
          <div
            v-if="mswTestResult"
            class="mt-2 text-xs text-yellow-800 dark:text-yellow-200"
          >
            {{ mswTestResult }}
          </div>
        </div>

        <!-- Mock Login Demo -->
        <div
          class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            🎭 Mock 登入展示
          </h3>
          <p class="text-xs text-blue-600 dark:text-blue-300 mb-3">示範帳號:</p>
          <div class="space-y-2">
            <button
              v-for="account in demoAccounts"
              :key="account.email"
              type="button"
              @click="useDemoAccount(account)"
              class="w-full text-left p-2 bg-white dark:bg-gray-700 rounded border border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
              :disabled="isLoading"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {{ account.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ account.email }}
                  </p>
                </div>
                <span class="text-xs text-blue-600 dark:text-blue-400">{{
                  account.role
                }}</span>
              </div>
            </button>
          </div>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-4">
        <div
          :class="[
            'p-4 rounded-md',
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800',
          ]"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                v-if="messageType === 'success'"
                class="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm">{{ message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";

const router = useRouter();
const authStore = useAuthStore();

// Form state
const form = reactive({
  email: "",
  password: "",
  rememberMe: false,
});

const errors = reactive({
  email: "",
  password: "",
});

const isLoading = ref(false);
const message = ref("");
const messageType = ref<"success" | "error">("success");
const mswTestResult = ref("");

// Demo accounts for mock login
const demoAccounts = [
  {
    email: "admin@synccoreai.com",
    password: "admin123",
    name: "System Administrator",
    role: "Admin",
    avatar: "/avatars/admin.jpg",
    permissions: ["dashboard:read", "analytics:write", "system:admin"],
    department: "IT Operations",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    loginCount: 245,
  },
  {
    email: "demo@synccoreai.com",
    password: "demo123",
    name: "Demo User",
    role: "Editor",
    avatar: "/avatars/demo.jpg",
    permissions: ["dashboard:read", "analytics:read"],
    department: "Content Team",
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    loginCount: 89,
  },
  {
    email: "viewer@synccoreai.com",
    password: "viewer123",
    name: "Read-only Viewer",
    role: "Viewer",
    avatar: "/avatars/viewer.jpg",
    permissions: ["dashboard:read"],
    department: "Analytics",
    lastLogin: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    loginCount: 34,
  },
];

// Use demo account
const useDemoAccount = (account: (typeof demoAccounts)[0]) => {
  form.email = account.email;
  form.password = account.password;
};

// Validate form
const validateForm = () => {
  errors.email = "";
  errors.password = "";

  if (!form.email) {
    errors.email = "Email is required";
    return false;
  }

  if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Please enter a valid email";
    return false;
  }

  if (!form.password) {
    errors.password = "Password is required";
    return false;
  }

  if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
    return false;
  }

  return true;
};

// Handle login
const handleLogin = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  message.value = "";

  console.log("🔐 嘗試登入:", { email: form.email, password: form.password });

  try {
    const success = await authStore.login({
      email: form.email,
      password: form.password,
    });

    console.log("🔐 登入結果:", { success, error: authStore.error });

    if (success) {
      messageType.value = "success";
      message.value = `登入成功！歡迎回來`;

      console.log("🔐 準備跳轉到 dashboard");
      // 立即跳轉
      router.push("/dashboard");
    } else {
      throw new Error(authStore.error || "登入失敗");
    }
  } catch (error: any) {
    console.error("🔐 登入錯誤:", error);
    messageType.value = "error";
    message.value = error.message || "登入失敗，請檢查您的帳號密碼";
  } finally {
    isLoading.value = false;
  }
};

// Test MSW connection
const testMSW = async () => {
  mswTestResult.value = "測試中...";
  try {
    const response = await fetch("/api/dashboard/overview");
    const data = await response.json();
    mswTestResult.value = `MSW 運作正常: ${response.status}`;
    console.log("🔧 MSW 測試成功:", data);
  } catch (error) {
    mswTestResult.value = `MSW 錯誤: ${error}`;
    console.error("🔧 MSW 測試失敗:", error);
  }
};
</script>
