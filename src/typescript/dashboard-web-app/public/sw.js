/**
 * PWA Service Worker - Phase 5 離線支援和快取策略
 * 提供離線功能、背景同步、推送通知等 PWA 功能
 */

const CACHE_NAME = "synccore-ai-v1.0.0";
const RUNTIME_CACHE = "runtime-cache-v1";
const API_CACHE = "api-cache-v1";

// 需要預快取的靜態資源
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/login",
  "/offline.html",
  "/manifest.json",
  "/src/main.ts",
  "/src/App.vue",
  "/src/style.css",
];

// API 端點快取策略配置
const API_CACHE_STRATEGIES = {
  // 快取優先 - 用於相對靜態的數據
  CACHE_FIRST: ["/api/users/profile", "/api/settings", "/api/config"],

  // 網路優先 - 用於實時數據
  NETWORK_FIRST: [
    "/api/collaboration/realtime",
    "/api/notifications",
    "/api/activities",
  ],

  // 僅快取 - 用於離線回退
  CACHE_ONLY: ["/api/offline-data"],
};

// Service Worker 安裝事件
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching static assets...");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("✅ Static assets cached successfully");
        // 強制激活新的 Service Worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Failed to cache static assets:", error);
      })
  );
});

// Service Worker 激活事件
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...");

  event.waitUntil(
    Promise.all([
      // 清理舊快取
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE &&
                cacheName !== API_CACHE
              );
            })
            .map((cacheName) => {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      }),

      // 立即控制所有客戶端
      self.clients.claim(),
    ])
  );
});

// 網路請求攔截
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只處理同源請求或 API 請求
  if (url.origin !== location.origin && !url.pathname.startsWith("/api")) {
    return;
  }

  // 處理不同類型的請求
  if (url.pathname.startsWith("/api")) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === "document") {
    event.respondWith(handleDocumentRequest(request));
  } else {
    event.respondWith(handleAssetRequest(request));
  }
});

/**
 * 處理 API 請求
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // 判斷快取策略
    if (
      API_CACHE_STRATEGIES.CACHE_FIRST.some((path) => pathname.includes(path))
    ) {
      return await cacheFirstStrategy(request, API_CACHE);
    } else if (
      API_CACHE_STRATEGIES.NETWORK_FIRST.some((path) => pathname.includes(path))
    ) {
      return await networkFirstStrategy(request, API_CACHE);
    } else if (
      API_CACHE_STRATEGIES.CACHE_ONLY.some((path) => pathname.includes(path))
    ) {
      return await cacheOnlyStrategy(request, API_CACHE);
    } else {
      // 默認網路優先策略
      return await networkFirstStrategy(request, API_CACHE);
    }
  } catch (error) {
    console.error("API request failed:", error);
    return createOfflineResponse();
  }
}

/**
 * 處理文檔請求（HTML 頁面）
 */
async function handleDocumentRequest(request) {
  try {
    // 嘗試從網路獲取
    const networkResponse = await fetch(request);

    // 快取成功的響應
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache...", error);

    // 網路失敗，嘗試從快取獲取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 快取也沒有，返回離線頁面
    return caches.match("/offline.html");
  }
}

/**
 * 處理靜態資源請求
 */
async function handleAssetRequest(request) {
  try {
    // 先嘗試快取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 快取沒有，從網路獲取並快取
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Asset request failed:", error);

    // 返回預設的離線資源
    if (request.destination === "image") {
      return createOfflineImageResponse();
    }

    return new Response("資源無法載入", { status: 404 });
  }
}

/**
 * 快取優先策略
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // 在背景更新快取
    updateCacheInBackground(request, cacheName);
    return cachedResponse;
  }

  // 快取沒有，從網路獲取並快取
  const networkResponse = await fetch(request);

  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

/**
 * 網路優先策略
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache...", error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * 僅快取策略
 */
async function cacheOnlyStrategy(request, cacheName) {
  return await caches.match(request);
}

/**
 * 背景更新快取
 */
async function updateCacheInBackground(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log("🔄 Cache updated in background:", request.url);
    }
  } catch (error) {
    console.log("Background cache update failed:", error);
  }
}

/**
 * 創建離線 API 響應
 */
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: "offline",
      message: "目前處於離線狀態，請稍後再試",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * 創建離線圖片響應
 */
function createOfflineImageResponse() {
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
            fill="#6b7280" font-family="system-ui" font-size="16">
        圖片載入失敗
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}

// 背景同步事件
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(performBackgroundSync());
  }
});

/**
 * 執行背景同步
 */
async function performBackgroundSync() {
  try {
    // 獲取離線時儲存的數據
    const offlineData = await getOfflineData();

    if (offlineData.length > 0) {
      console.log(`📤 Syncing ${offlineData.length} offline items...`);

      for (const item of offlineData) {
        try {
          await syncItem(item);
          await removeOfflineItem(item.id);
        } catch (error) {
          console.error("Failed to sync item:", item.id, error);
        }
      }

      // 通知客戶端同步完成
      notifyClients("sync-complete", { syncedItems: offlineData.length });
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

/**
 * 推送通知事件
 */
self.addEventListener("push", (event) => {
  console.log("📱 Push notification received");

  let notificationData = {
    title: "SyncCore AI",
    body: "您有新的通知",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "default",
    data: {},
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error("Failed to parse push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: "open",
          title: "打開應用",
        },
        {
          action: "dismiss",
          title: "忽略",
        },
      ],
    })
  );
});

// 通知點擊事件
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // 如果已有窗口打開，則聚焦
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }

        // 否則打開新窗口
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
    );
  }
});

// 工具函數
async function getOfflineData() {
  // 從 IndexedDB 或其他儲存獲取離線數據
  return [];
}

async function syncItem(item) {
  // 同步單個項目
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  return response.json();
}

async function removeOfflineItem(id) {
  // 從本地儲存移除已同步的項目
  console.log(`✅ Removed synced item: ${id}`);
}

function notifyClients(type, data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type, data });
    });
  });
}

console.log("🔧 Service Worker loaded successfully");
