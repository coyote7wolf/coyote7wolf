/**
 * SyncCoreAI Service Worker
 *
 * Progressive Web App service worker with intelligent caching,
 * offline support, and background sync capabilities.
 */

const CACHE_NAME = 'synccoreai-v1.0.0'
const STATIC_CACHE_NAME = 'synccoreai-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'synccoreai-dynamic-v1.0.0'
const API_CACHE_NAME = 'synccoreai-api-v1.0.0'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/documents',
  '/login',
  '/register',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  // Static assets will be added by Next.js build process
]

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/v1/users/profile',
  '/api/v1/documents',
  '/api/v1/templates',
  '/api/v1/workspaces',
  '/api/v1/analytics/dashboard',
]

// Network-first strategies for these patterns
const NETWORK_FIRST_PATTERNS = [
  '/api/v1/auth',
  '/api/v1/sync',
  '/api/v1/realtime',
  '/api/v1/ai',
]

// Cache-first strategies for these patterns
const CACHE_FIRST_PATTERNS = [
  '/icons/',
  '/images/',
  '/screenshots/',
  '/_next/static/',
  '/static/',
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),

      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),

      // Claim all clients
      self.clients.claim(),
    ])
  )
})

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different request types
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAssets(request))
  } else if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequests(request))
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequests(request))
  } else {
    event.respondWith(handleDynamicRequests(request))
  }
})

// Handle static assets (cache-first strategy)
async function handleStaticAssets(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      // Update cache in background
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response.clone())
          }
        })
        .catch(() => {
          // Ignore network errors for background updates
        })

      return cachedResponse
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', error)

    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">Offline</tspan></text></g></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }

    throw error
  }
}

// Handle API requests (network-first with intelligent caching)
async function handleApiRequests(request) {
  const url = new URL(request.url)

  // Network-first for real-time endpoints
  if (isNetworkFirstApi(url.pathname)) {
    return handleNetworkFirst(request, API_CACHE_NAME)
  }

  // Cache-first for static data
  if (isCacheableApi(url.pathname)) {
    return handleCacheFirst(request, API_CACHE_NAME)
  }

  // Default: network-first with short cache
  return handleNetworkFirst(request, API_CACHE_NAME, 300000) // 5 minutes
}

// Handle navigation requests (app shell)
async function handleNavigationRequests(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request)

    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Navigation request failed, serving from cache:', error)

    // Serve from cache if available
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Serve app shell for SPA routes
    const appShell = await cache.match('/')
    if (appShell) {
      return appShell
    }

    // Final fallback - offline page
    return new Response(getOfflineHTML(), {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    })
  }
}

// Handle dynamic requests (stale-while-revalidate)
async function handleDynamicRequests(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)

    // Serve from cache while updating in background
    const networkResponsePromise = fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone())
        }
        return response
      })
      .catch(() => {
        // Ignore network errors for background updates
      })

    return cachedResponse || (await networkResponsePromise)
  } catch (error) {
    console.log('[SW] Dynamic request failed:', error)
    throw error
  }
}

// Network-first strategy
async function handleNetworkFirst(request, cacheName, maxAge = null) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)

      // Add timestamp for cache expiry
      if (maxAge) {
        const responseWithTimestamp = new Response(networkResponse.body, {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: {
            ...networkResponse.headers,
            'sw-cached-at': Date.now().toString(),
          },
        })
        cache.put(request, responseWithTimestamp.clone())
        return responseWithTimestamp
      } else {
        cache.put(request, networkResponse.clone())
        return networkResponse
      }
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', error)

    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      // Check if cache is expired
      if (maxAge) {
        const cachedAt = parseInt(
          cachedResponse.headers.get('sw-cached-at') || '0'
        )
        const now = Date.now()

        if (now - cachedAt > maxAge) {
          console.log('[SW] Cache expired, removing entry')
          cache.delete(request)
          throw new Error('Cache expired and network unavailable')
        }
      }

      return cachedResponse
    }

    throw error
  }
}

// Cache-first strategy
async function handleCacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      // Update cache in background
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response.clone())
          }
        })
        .catch(() => {
          // Ignore network errors for background updates
        })

      return cachedResponse
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Cache-first request failed:', error)
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag)

  if (event.tag === 'sync-documents') {
    event.waitUntil(syncDocuments())
  } else if (event.tag === 'sync-user-actions') {
    event.waitUntil(syncUserActions())
  }
})

// Sync offline document changes
async function syncDocuments() {
  try {
    // Get pending document changes from IndexedDB
    const pendingChanges = await getPendingDocumentChanges()

    for (const change of pendingChanges) {
      try {
        const response = await fetch('/api/v1/documents/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(change),
        })

        if (response.ok) {
          // Remove from pending changes
          await removePendingChange(change.id)
          console.log('[SW] Synced document change:', change.id)
        }
      } catch (error) {
        console.log('[SW] Failed to sync document change:', error)
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error)
  }
}

// Sync offline user actions
async function syncUserActions() {
  try {
    // Implementation for syncing user actions
    console.log('[SW] Syncing user actions...')
  } catch (error) {
    console.log('[SW] Failed to sync user actions:', error)
  }
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push notification received:', event)

  const options = {
    body: 'You have new updates in your documents',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Updates',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png',
      },
    ],
  }

  if (event.data) {
    const payload = event.data.json()
    options.body = payload.body || options.body
    options.data = { ...options.data, ...payload.data }
  }

  event.waitUntil(self.registration.showNotification('SyncCoreAI', options))
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event)

  event.notification.close()

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(clients.openWindow('/dashboard'))
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open app
    event.waitUntil(clients.openWindow('/'))
  }
})

// Utility functions
function isStaticAsset(pathname) {
  return CACHE_FIRST_PATTERNS.some(pattern => pathname.startsWith(pattern))
}

function isApiRequest(pathname) {
  return pathname.startsWith('/api/')
}

function isNavigationRequest(request) {
  return request.mode === 'navigate'
}

function isNetworkFirstApi(pathname) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pathname.startsWith(pattern))
}

function isCacheableApi(pathname) {
  return CACHEABLE_APIS.some(pattern => pathname.startsWith(pattern))
}

function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - SyncCoreAI</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 2rem;
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          opacity: 0.9;
          line-height: 1.6;
        }
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1.5rem;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>You're Offline</h1>
        <p>Don't worry! SyncCoreAI works offline too. Your changes are saved locally and will sync when you're back online.</p>
        <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `
}

// IndexedDB helper functions (mock implementations)
async function getPendingDocumentChanges() {
  // Mock implementation - in real app, this would use IndexedDB
  return []
}

async function removePendingChange(changeId) {
  // Mock implementation - in real app, this would remove from IndexedDB
  console.log('[SW] Removing pending change:', changeId)
}

console.log('[SW] Service worker loaded successfully')
