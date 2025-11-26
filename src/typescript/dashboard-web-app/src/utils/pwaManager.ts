/**
 * PWA 安裝管理器 - Phase 5 PWA 功能整合
 * 提供 Service Worker 註冊、PWA 安裝提示、離線支援等功能
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface ServiceWorkerUpdateInfo {
  isUpdateAvailable: boolean;
  waitingWorker: ServiceWorker | null;
  skipWaiting(): Promise<void>;
}

class PWAManager {
  private installPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private updateAvailable = false;
  private installListeners: Array<(canInstall: boolean) => void> = [];
  private updateListeners: Array<
    (updateInfo: ServiceWorkerUpdateInfo) => void
  > = [];
  private onlineListeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.initializePWA();
  }

  /**
   * 初始化 PWA 功能
   */
  private async initializePWA(): Promise<void> {
    try {
      // 檢查 Service Worker 支援
      if ("serviceWorker" in navigator) {
        await this.registerServiceWorker();
      } else {
        console.warn("Service Worker not supported");
      }

      // 設置安裝提示監聽器
      this.setupInstallPrompt();

      // 設置網路狀態監聽器
      this.setupNetworkListeners();

      // 設置通知權限檢查
      this.checkNotificationPermission();

      // 設置背景同步
      this.setupBackgroundSync();

      console.log("✅ PWA Manager initialized successfully");
    } catch (error) {
      console.error("❌ PWA Manager initialization failed:", error);
    }
  }

  /**
   * 註冊 Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("🔧 Service Worker registered:", this.registration.scope);

      // 檢查更新
      this.registration.addEventListener("updatefound", () => {
        this.handleServiceWorkerUpdate();
      });

      // 監聽 Service Worker 消息
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event);
      });

      // 檢查現有的等待中的 Service Worker
      if (this.registration.waiting) {
        this.notifyUpdateAvailable();
      }

      // 定期檢查更新
      setInterval(() => {
        this.registration?.update();
      }, 60000); // 每分鐘檢查一次更新
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  /**
   * 處理 Service Worker 更新
   */
  private handleServiceWorkerUpdate(): void {
    const newWorker = this.registration?.installing;

    if (newWorker) {
      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          this.notifyUpdateAvailable();
        }
      });
    }
  }

  /**
   * 通知更新可用
   */
  private notifyUpdateAvailable(): void {
    this.updateAvailable = true;

    const updateInfo: ServiceWorkerUpdateInfo = {
      isUpdateAvailable: true,
      waitingWorker: this.registration?.waiting || null,
      skipWaiting: async () => {
        if (this.registration?.waiting) {
          this.registration.waiting.postMessage({ type: "SKIP_WAITING" });

          // 等待控制器變更
          await new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => {
                resolve();
              },
              { once: true }
            );
          });

          // 刷新頁面
          window.location.reload();
        }
      },
    };

    this.updateListeners.forEach((listener) => listener(updateInfo));
  }

  /**
   * 處理 Service Worker 消息
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case "sync-complete":
        console.log("📤 Background sync completed:", data);
        this.showNotification("同步完成", `${data.syncedItems} 個項目已同步`);
        break;

      case "cache-updated":
        console.log("🔄 Cache updated:", data);
        break;

      case "offline-ready":
        console.log("📱 App ready for offline use");
        break;
    }
  }

  /**
   * 設置安裝提示
   */
  private setupInstallPrompt(): void {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      this.installPrompt = event as any;

      console.log("📱 PWA install prompt available");
      this.installListeners.forEach((listener) => listener(true));
    });

    // 監聽安裝完成
    window.addEventListener("appinstalled", () => {
      console.log("✅ PWA installed successfully");
      this.installPrompt = null;
      this.installListeners.forEach((listener) => listener(false));
    });
  }

  /**
   * 設置網路狀態監聽器
   */
  private setupNetworkListeners(): void {
    const updateOnlineStatus = () => {
      const wasOnline = this.isOnline;
      this.isOnline = navigator.onLine;

      if (wasOnline !== this.isOnline) {
        console.log(
          `🌐 Network status changed: ${this.isOnline ? "online" : "offline"}`
        );
        this.onlineListeners.forEach((listener) => listener(this.isOnline));

        if (this.isOnline) {
          this.showNotification("網路已連線", "應用程式已重新連線到網路");
        } else {
          this.showNotification("網路已斷線", "應用程式將以離線模式運行");
        }
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
  }

  /**
   * 檢查通知權限
   */
  private async checkNotificationPermission(): Promise<void> {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        console.log("🔔 Notification permission not granted yet");
      } else if (Notification.permission === "granted") {
        console.log("✅ Notification permission granted");
      } else {
        console.log("❌ Notification permission denied");
      }
    }
  }

  /**
   * 設置背景同步
   */
  private setupBackgroundSync(): void {
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      console.log("🔄 Background sync supported");
    } else {
      console.warn("Background sync not supported");
    }
  }

  /**
   * 安裝 PWA
   */
  async installPWA(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn("PWA install prompt not available");
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("✅ User accepted PWA install");
        this.installPrompt = null;
        return true;
      } else {
        console.log("❌ User dismissed PWA install");
        return false;
      }
    } catch (error) {
      console.error("PWA install failed:", error);
      return false;
    }
  }

  /**
   * 請求通知權限
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return "denied";
    }

    const permission = await Notification.requestPermission();
    console.log(`🔔 Notification permission: ${permission}`);
    return permission;
  }

  /**
   * 顯示通知
   */
  async showNotification(
    title: string,
    body: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    const defaultOptions: NotificationOptions = {
      body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: "synccore-notification",
      // vibrate: [200, 100, 200], // 部分瀏覽器不支援
      requireInteraction: false,
      ...options,
    };

    if (this.registration) {
      await this.registration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  /**
   * 觸發背景同步
   */
  async triggerBackgroundSync(tag: string = "background-sync"): Promise<void> {
    if (
      this.registration &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      try {
        await (this.registration as any).sync.register(tag);
        console.log(`🔄 Background sync registered: ${tag}`);
      } catch (error) {
        console.error("Background sync registration failed:", error);
      }
    }
  }

  /**
   * 獲取 PWA 狀態
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      canInstall: this.installPrompt !== null,
      updateAvailable: this.updateAvailable,
      serviceWorkerReady: this.registration !== null,
      notificationPermission:
        "Notification" in window ? Notification.permission : "not-supported",
    };
  }

  /**
   * 監聽器方法
   */
  onInstallAvailable(listener: (canInstall: boolean) => void): () => void {
    this.installListeners.push(listener);
    return () => {
      const index = this.installListeners.indexOf(listener);
      if (index > -1) {
        this.installListeners.splice(index, 1);
      }
    };
  }

  onUpdateAvailable(
    listener: (updateInfo: ServiceWorkerUpdateInfo) => void
  ): () => void {
    this.updateListeners.push(listener);
    return () => {
      const index = this.updateListeners.indexOf(listener);
      if (index > -1) {
        this.updateListeners.splice(index, 1);
      }
    };
  }

  onNetworkChange(listener: (isOnline: boolean) => void): () => void {
    this.onlineListeners.push(listener);
    return () => {
      const index = this.onlineListeners.indexOf(listener);
      if (index > -1) {
        this.onlineListeners.splice(index, 1);
      }
    };
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    this.installListeners = [];
    this.updateListeners = [];
    this.onlineListeners = [];
  }
}

// 單例模式
export const pwaManager = new PWAManager();

// Vue 3 組合式函數
import { ref, onMounted, onUnmounted } from "vue";

export function usePWA() {
  const isOnline = ref(navigator.onLine);
  const canInstall = ref(false);
  const updateAvailable = ref(false);
  const serviceWorkerReady = ref(false);
  const notificationPermission = ref<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  const updateStatus = () => {
    const status = pwaManager.getStatus();
    isOnline.value = status.isOnline;
    canInstall.value = status.canInstall;
    updateAvailable.value = status.updateAvailable;
    serviceWorkerReady.value = status.serviceWorkerReady;
    notificationPermission.value =
      status.notificationPermission as NotificationPermission;
  };

  onMounted(() => {
    updateStatus();

    // 設置監聽器
    const unsubscribeInstall = pwaManager.onInstallAvailable((available) => {
      canInstall.value = available;
    });

    const unsubscribeUpdate = pwaManager.onUpdateAvailable((info) => {
      updateAvailable.value = info.isUpdateAvailable;
    });

    const unsubscribeNetwork = pwaManager.onNetworkChange((online) => {
      isOnline.value = online;
    });

    onUnmounted(() => {
      unsubscribeInstall();
      unsubscribeUpdate();
      unsubscribeNetwork();
    });
  });

  return {
    isOnline,
    canInstall,
    updateAvailable,
    serviceWorkerReady,
    notificationPermission,
    installPWA: pwaManager.installPWA.bind(pwaManager),
    requestNotificationPermission:
      pwaManager.requestNotificationPermission.bind(pwaManager),
    showNotification: pwaManager.showNotification.bind(pwaManager),
    triggerBackgroundSync: pwaManager.triggerBackgroundSync.bind(pwaManager),
    updateStatus,
  };
}

export default pwaManager;
