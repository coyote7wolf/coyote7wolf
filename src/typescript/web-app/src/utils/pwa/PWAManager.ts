/**
 * PWA Manager
 *
 * Manages Progressive Web App features including service worker registration,
 * install prompts, push notifications, and offline capabilities.
 */

'use client'

class PWAManager {
  private static instance: PWAManager
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private installPromptEvent: any = null
  private isOnline: boolean = true
  private listeners: Map<string, Function[]> = new Map()

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializePWA()
      this.setupEventListeners()
    }
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  // Initialize PWA features
  private async initializePWA() {
    try {
      // Register service worker
      await this.registerServiceWorker()

      // Setup install prompt
      this.setupInstallPrompt()

      // Initialize online/offline detection
      this.initializeNetworkDetection()

      // Setup push notifications
      await this.initializePushNotifications()

      console.log('[PWA] PWA Manager initialized successfully')
    } catch (error) {
      console.error('[PWA] Failed to initialize PWA:', error)
    }
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service workers are not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      this.serviceWorkerRegistration = registration

      console.log(
        '[PWA] Service worker registered successfully:',
        registration.scope
      )

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker is available
              this.emit('sw-update-available', { registration, newWorker })
            }
          })
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('[PWA] Message from service worker:', event.data)
        this.emit('sw-message', event.data)
      })
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error)
      throw error
    }
  }

  // Setup install prompt handling
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', event => {
      console.log('[PWA] Install prompt available')

      // Prevent the mini-infobar from appearing
      event.preventDefault()

      // Store the event for later use
      this.installPromptEvent = event

      // Emit event for UI to show custom install button
      this.emit('install-prompt-available', { canInstall: true })
    })

    // Handle app installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed')
      this.installPromptEvent = null
      this.emit('app-installed', { installed: true })
    })
  }

  // Initialize network detection
  private initializeNetworkDetection(): void {
    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      console.log('[PWA] App is online')
      this.isOnline = true
      this.emit('network-change', { online: true })

      // Trigger background sync when coming back online
      this.triggerBackgroundSync()
    })

    window.addEventListener('offline', () => {
      console.log('[PWA] App is offline')
      this.isOnline = false
      this.emit('network-change', { online: false })
    })
  }

  // Initialize push notifications
  private async initializePushNotifications(): Promise<void> {
    if (!('Notification' in window) || !('PushManager' in window)) {
      console.warn('[PWA] Push notifications are not supported')
      return
    }

    try {
      // Check current permission status
      const permission = await Notification.requestPermission()
      console.log('[PWA] Notification permission:', permission)

      this.emit('notification-permission-change', { permission })
    } catch (error) {
      console.error('[PWA] Failed to initialize push notifications:', error)
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden
      this.emit('visibility-change', { visible: isVisible })
    })

    // Listen for beforeunload to save state
    window.addEventListener('beforeunload', () => {
      this.emit('before-unload', {})
    })
  }

  // Public methods

  // Show install prompt
  async showInstallPrompt(): Promise<{
    outcome: string
    platform: string
  } | null> {
    if (!this.installPromptEvent) {
      console.warn('[PWA] Install prompt not available')
      return null
    }

    try {
      // Show the install prompt
      this.installPromptEvent.prompt()

      // Wait for the user to respond
      const choiceResult = await this.installPromptEvent.userChoice
      console.log('[PWA] Install prompt result:', choiceResult)

      // Clear the saved event
      this.installPromptEvent = null

      return choiceResult
    } catch (error) {
      console.error('[PWA] Failed to show install prompt:', error)
      return null
    }
  }

  // Check if app can be installed
  canInstall(): boolean {
    return this.installPromptEvent !== null
  }

  // Check if app is installed
  isInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true
    )
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported')
    }

    const permission = await Notification.requestPermission()
    this.emit('notification-permission-change', { permission })
    return permission
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      throw new Error('Service worker is not registered')
    }

    try {
      const applicationServerKey = this.urlBase64ToUint8Array(
        // Replace with your VAPID public key
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80xEqkON1I3j9z3mVEGZJ84jzjNWq9Sk1f3LxUlhQjHZlVzHtHe7J3KM'
      )

      const subscription =
        await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        })

      console.log('[PWA] Push subscription successful:', subscription)

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

      return subscription
    } catch (error) {
      console.error('[PWA] Failed to subscribe to push notifications:', error)
      throw error
    }
  }

  // Get current push subscription
  async getCurrentPushSubscription(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      return null
    }

    return await this.serviceWorkerRegistration.pushManager.getSubscription()
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    const subscription = await this.getCurrentPushSubscription()

    if (subscription) {
      const success = await subscription.unsubscribe()
      console.log('[PWA] Push unsubscription result:', success)
      return success
    }

    return true
  }

  // Show local notification
  showNotification(title: string, options: NotificationOptions = {}): void {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications are not supported')
      return
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      })

      // Auto-close after 5 seconds if not specified
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000)
      }
    }
  }

  // Trigger background sync
  async triggerBackgroundSync(tag: string = 'sync-documents'): Promise<void> {
    if (
      !this.serviceWorkerRegistration ||
      !('sync' in this.serviceWorkerRegistration)
    ) {
      console.warn('[PWA] Background sync is not supported')
      return
    }

    try {
      const syncManager = (this.serviceWorkerRegistration as any).sync
      await syncManager.register(tag)
      console.log('[PWA] Background sync registered:', tag)
    } catch (error) {
      console.error('[PWA] Failed to register background sync:', error)
    }
  }

  // Cache management
  async clearCache(cacheName?: string): Promise<void> {
    if (!('caches' in window)) {
      console.warn('[PWA] Cache API is not supported')
      return
    }

    try {
      if (cacheName) {
        await caches.delete(cacheName)
        console.log('[PWA] Cache cleared:', cacheName)
      } else {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        console.log('[PWA] All caches cleared')
      }
    } catch (error) {
      console.error('[PWA] Failed to clear cache:', error)
    }
  }

  // Get cache storage estimate
  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      console.warn('[PWA] Storage API is not supported')
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      console.log('[PWA] Storage estimate:', estimate)
      return estimate
    } catch (error) {
      console.error('[PWA] Failed to get storage estimate:', error)
      return null
    }
  }

  // Network status
  isOnlineStatus(): boolean {
    return this.isOnline
  }

  // Update service worker
  async updateServiceWorker(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      console.warn('[PWA] Service worker is not registered')
      return
    }

    try {
      await this.serviceWorkerRegistration.update()
      console.log('[PWA] Service worker update check completed')
    } catch (error) {
      console.error('[PWA] Failed to update service worker:', error)
    }
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('[PWA] Event callback error:', error)
        }
      })
    }
  }

  // Helper methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      const response = await fetch('/api/v1/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }

      console.log('[PWA] Subscription sent to server successfully')
    } catch (error) {
      console.error('[PWA] Failed to send subscription to server:', error)
      // Don't throw - subscription still works locally
    }
  }
}

export default PWAManager.getInstance()
