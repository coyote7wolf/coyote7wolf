import { createApp } from "vue";
import router from "./router";
import App from "./App.vue";
import { pinia } from "./stores";
import i18n from "./i18n";

// Import styles
import "./assets/styles/main.css";

// PWA and utilities
import { pwaManager } from "./utils/pwaManager";
import { OfflineTestUtils } from "./utils/offlineTestUtils";

// Mock API setup
const setupMockAPI = async () => {
  console.log("🔧 設置 Mock API，當前模式:", import.meta.env.VITE_MODE);
  console.log("🔧 DEV 模式:", import.meta.env.DEV);
  console.log("🔧 環境變數:", import.meta.env);

  if (import.meta.env.VITE_MODE === "mock-data" || import.meta.env.DEV) {
    try {
      const { worker } = await import("./mocks/browser");

      // 更詳細的 MSW 配置
      await worker.start({
        onUnhandledRequest: "warn", // 改為 warn 來看未處理的請求
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });

      console.log("🎭 Mock Service Worker 已啟動");

      // 添加一個測試請求來驗證 MSW 是否工作
      setTimeout(async () => {
        try {
          const testResponse = await fetch("/api/dashboard/overview");
          console.log("🎭 MSW 測試請求狀態:", testResponse.status);
        } catch (error) {
          console.error("🎭 MSW 測試請求失敗:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("🎭 Mock Service Worker 啟動失敗:", error);
    }
  } else {
    console.log("🔧 跳過 Mock API 設置");
  }
};

// Global error handler
const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
  console.error("Vue Error:", err);
  console.error("Component:", vm);
  console.error("Error Info:", info);

  // You can send error to monitoring service here
  // errorService.log(err, { vm, info })
};

// Install plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Initialize mock API and mount app
setupMockAPI().then(() => {
  app.mount("#app");

  // 開發模式下掛載測試工具到 window
  if (import.meta.env.DEV) {
    (window as any).OfflineTestUtils = OfflineTestUtils;
    (window as any).pwaManager = pwaManager;
    console.log(
      "🔧 PWA 測試工具已掛載到 window.OfflineTestUtils 和 window.pwaManager"
    );
  }
});
