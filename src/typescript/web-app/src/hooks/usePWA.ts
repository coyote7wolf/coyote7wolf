/**
 * PWA Hook
 *
 * React hook for integrating PWA features with components,
 * providing install prompts, offline detection, and push notifications.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import PWAManager from '@/utils/pwa/PWAManager'

export interface PWAHookResult {
  // Installation
  canInstall: boolean
  isInstalled: boolean
  isInstalling: boolean
  showInstallPrompt: () => Promise<{ outcome: string; platform: string } | null>

  // Network status
  isOnline: boolean

  // Notifications
  notificationPermission: NotificationPermission
  canReceiveNotifications: boolean
  requestNotificationPermission: () => Promise<NotificationPermission>
  subscribeToPushNotifications: () => Promise<PushSubscription | null>
  unsubscribeFromPushNotifications: () => Promise<boolean>
  showNotification: (title: string, options?: NotificationOptions) => void

  // Service Worker
  serviceWorkerUpdateAvailable: boolean
  updateServiceWorker: () => Promise<void>

  // Cache and Storage
  clearCache: (cacheName?: string) => Promise<void>
  storageEstimate: StorageEstimate | null

  // Background sync
  triggerBackgroundSync: (tag?: string) => Promise<void>

  // App state
  isAppVisible: boolean
}

export function usePWA(): PWAHookResult {
  // State
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default')
  const [serviceWorkerUpdateAvailable, setServiceWorkerUpdateAvailable] =
    useState(false)
  const [storageEstimate, setStorageEstimate] =
    useState<StorageEstimate | null>(null)
  const [isAppVisible, setIsAppVisible] = useState(true)

  // Initialize PWA state
  useEffect(() => {
    // Set initial states
    setIsInstalled(PWAManager.isInstalled())
    setCanInstall(PWAManager.canInstall())
    setIsOnline(PWAManager.isOnlineStatus())

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    // Get storage estimate
    PWAManager.getStorageEstimate().then(estimate => {
      if (estimate) {
        setStorageEstimate(estimate)
      }
    })

    // Set up event listeners
    const handleInstallPromptAvailable = ({
      canInstall: canInstallApp,
    }: {
      canInstall: boolean
    }) => {
      setCanInstall(canInstallApp)
    }

    const handleAppInstalled = ({ installed }: { installed: boolean }) => {
      setIsInstalled(installed)
      setCanInstall(false)
    }

    const handleNetworkChange = ({ online }: { online: boolean }) => {
      setIsOnline(online)
    }

    const handleNotificationPermissionChange = ({
      permission,
    }: {
      permission: NotificationPermission
    }) => {
      setNotificationPermission(permission)
    }

    const handleServiceWorkerUpdate = () => {
      setServiceWorkerUpdateAvailable(true)
    }

    const handleVisibilityChange = ({ visible }: { visible: boolean }) => {
      setIsAppVisible(visible)
    }

    // Register event listeners
    PWAManager.on('install-prompt-available', handleInstallPromptAvailable)
    PWAManager.on('app-installed', handleAppInstalled)
    PWAManager.on('network-change', handleNetworkChange)
    PWAManager.on(
      'notification-permission-change',
      handleNotificationPermissionChange
    )
    PWAManager.on('sw-update-available', handleServiceWorkerUpdate)
    PWAManager.on('visibility-change', handleVisibilityChange)

    // Cleanup
    return () => {
      PWAManager.off('install-prompt-available', handleInstallPromptAvailable)
      PWAManager.off('app-installed', handleAppInstalled)
      PWAManager.off('network-change', handleNetworkChange)
      PWAManager.off(
        'notification-permission-change',
        handleNotificationPermissionChange
      )
      PWAManager.off('sw-update-available', handleServiceWorkerUpdate)
      PWAManager.off('visibility-change', handleVisibilityChange)
    }
  }, [])

  // Install app
  const showInstallPrompt = useCallback(async () => {
    if (!canInstall) {
      return null
    }

    setIsInstalling(true)
    try {
      const result = await PWAManager.showInstallPrompt()
      return result
    } finally {
      setIsInstalling(false)
    }
  }, [canInstall])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await PWAManager.requestNotificationPermission()
      setNotificationPermission(permission)
      return permission
    } catch (error) {
      console.error(
        '[PWA Hook] Failed to request notification permission:',
        error
      )
      return 'denied' as NotificationPermission
    }
  }, [])

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    try {
      return await PWAManager.subscribeToPushNotifications()
    } catch (error) {
      console.error(
        '[PWA Hook] Failed to subscribe to push notifications:',
        error
      )
      return null
    }
  }, [])

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = useCallback(async () => {
    try {
      return await PWAManager.unsubscribeFromPushNotifications()
    } catch (error) {
      console.error(
        '[PWA Hook] Failed to unsubscribe from push notifications:',
        error
      )
      return false
    }
  }, [])

  // Show notification
  const showNotification = useCallback(
    (title: string, options: NotificationOptions = {}) => {
      PWAManager.showNotification(title, options)
    },
    []
  )

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    try {
      await PWAManager.updateServiceWorker()
      setServiceWorkerUpdateAvailable(false)

      // Reload the page to use the new service worker
      window.location.reload()
    } catch (error) {
      console.error('[PWA Hook] Failed to update service worker:', error)
    }
  }, [])

  // Clear cache
  const clearCache = useCallback(async (cacheName?: string) => {
    try {
      await PWAManager.clearCache(cacheName)

      // Update storage estimate
      const estimate = await PWAManager.getStorageEstimate()
      if (estimate) {
        setStorageEstimate(estimate)
      }
    } catch (error) {
      console.error('[PWA Hook] Failed to clear cache:', error)
    }
  }, [])

  // Trigger background sync
  const triggerBackgroundSync = useCallback(
    async (tag: string = 'sync-documents') => {
      try {
        await PWAManager.triggerBackgroundSync(tag)
      } catch (error) {
        console.error('[PWA Hook] Failed to trigger background sync:', error)
      }
    },
    []
  )

  // Computed values
  const canReceiveNotifications = notificationPermission === 'granted'

  return {
    // Installation
    canInstall,
    isInstalled,
    isInstalling,
    showInstallPrompt,

    // Network status
    isOnline,

    // Notifications
    notificationPermission,
    canReceiveNotifications,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showNotification,

    // Service Worker
    serviceWorkerUpdateAvailable,
    updateServiceWorker,

    // Cache and Storage
    clearCache,
    storageEstimate,

    // Background sync
    triggerBackgroundSync,

    // App state
    isAppVisible,
  }
}

export default usePWA
