/**
 * 離線測試工具 - 用於測試 PWA 離線功能
 */

export class OfflineTestUtils {
  /**
   * 模擬網路斷線
   */
  static simulateOffline(): void {
    // 使用 navigator.serviceWorker 發送消息模擬離線
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SIMULATE_OFFLINE",
        enabled: true,
      });
    }

    // 修改 navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    // 觸發 offline 事件
    window.dispatchEvent(new Event("offline"));

    console.log("🔴 離線模式已啟用");
  }

  /**
   * 恢復網路連線
   */
  static simulateOnline(): void {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SIMULATE_OFFLINE",
        enabled: false,
      });
    }

    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });

    window.dispatchEvent(new Event("online"));

    console.log("🟢 網路連線已恢復");
  }

  /**
   * 檢查 Service Worker 狀態
   */
  static async checkServiceWorkerStatus(): Promise<{
    registered: boolean;
    active: boolean;
    scope: string | null;
  }> {
    if (!("serviceWorker" in navigator)) {
      return { registered: false, active: false, scope: null };
    }

    const registration = await navigator.serviceWorker.getRegistration();

    return {
      registered: !!registration,
      active: !!registration?.active,
      scope: registration?.scope || null,
    };
  }

  /**
   * 清除所有快取
   */
  static async clearAllCaches(): Promise<void> {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log("🗑️ 所有快取已清除");
    }
  }

  /**
   * 列出所有快取
   */
  static async listCaches(): Promise<string[]> {
    if ("caches" in window) {
      return await caches.keys();
    }
    return [];
  }

  /**
   * 強制更新 Service Worker
   */
  static async forceServiceWorkerUpdate(): Promise<void> {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log("🔄 Service Worker 更新已觸發");
      }
    }
  }
}

// 全域掛載到 window 物件供開發者工具使用
if (typeof window !== "undefined") {
  (window as any).OfflineTestUtils = OfflineTestUtils;
}
