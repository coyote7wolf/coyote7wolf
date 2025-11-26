import {Platform, PermissionsAndroid} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {MOCK_CONFIG} from '../utils/constants'

export interface PushNotificationConfig {
  enablePushNotifications: boolean
  enableBadgeCount: boolean
  enableSounds: boolean
  enableVibration: boolean
  showInForeground: boolean
  channelId?: string
  iconName?: string
}

export interface NotificationPayload {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  badge?: number
  sound?: string
  category?: string
  actions?: NotificationAction[]
  scheduled?: Date
  repeat?: 'daily' | 'weekly' | 'monthly'
}

export interface NotificationAction {
  id: string
  title: string
  options?: {
    foreground?: boolean
    destructive?: boolean
    authenticationRequired?: boolean
  }
}

export interface NotificationPermissionStatus {
  hasPermission: boolean
  canRequestPermission: boolean
  permissionStatus: 'granted' | 'denied' | 'not-determined' | 'provisional'
}

export interface NotificationSettings {
  alert: boolean
  badge: boolean
  sound: boolean
  critical: boolean
  provisional: boolean
}

export interface ReceivedNotification {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  receivedAt: number
  wasOpened: boolean
  fromBackground: boolean
}

export type NotificationEventCallback = (
  notification: ReceivedNotification,
) => void
export type NotificationActionCallback = (
  actionId: string,
  notification: ReceivedNotification,
) => void

class PushNotificationService {
  private mockMode = MOCK_CONFIG.enabled
  private config: PushNotificationConfig
  private isInitialized = false
  private deviceToken?: string
  private notificationHistory: ReceivedNotification[] = []

  // Event callbacks
  private onNotificationReceived?: NotificationEventCallback
  private onNotificationOpened?: NotificationEventCallback
  private onNotificationAction?: NotificationActionCallback

  // Mock data
  private mockNotifications = [
    {
      id: 'mock-1',
      title: '文檔同步完成',
      body: '您的文檔已成功同步到雲端',
      data: {type: 'sync', documentId: 'doc-123'},
    },
    {
      id: 'mock-2',
      title: '新的協作邀請',
      body: '張三邀請您協作編輯「項目計劃」',
      data: {type: 'collaboration', documentId: 'doc-456', userId: 'user-789'},
    },
    {
      id: 'mock-3',
      title: '語音輸入完成',
      body: '您的語音筆記已轉換為文字',
      data: {type: 'voice', noteId: 'note-321'},
    },
  ]

  constructor(config: Partial<PushNotificationConfig> = {}) {
    this.config = {
      enablePushNotifications: true,
      enableBadgeCount: true,
      enableSounds: true,
      enableVibration: true,
      showInForeground: true,
      channelId: 'default',
      iconName: 'ic_notification',
      ...config,
    }

    console.log(
      'PushNotificationService initialized with mock mode:',
      this.mockMode,
    )
  }

  // 初始化推送通知服務
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      if (this.mockMode) {
        await this.initializeMockService()
      } else {
        await this.initializeRealService()
      }

      // 加載通知歷史
      await this.loadNotificationHistory()

      this.isInitialized = true
      console.log('Push notification service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize push notification service:', error)
      throw error
    }
  }

  // 初始化真實服務
  private async initializeRealService(): Promise<void> {
    // 在真實實現中，這裡會初始化推送通知服務
    // 例如：Firebase Cloud Messaging, Apple Push Notification Service
    console.log('Real push notification service would be initialized here')
  }

  // 初始化 Mock 服務
  private async initializeMockService(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模擬設備 token
    this.deviceToken = `mock-device-token-${Date.now()}`

    // 模擬接收通知的定時器
    this.startMockNotifications()

    console.log('Mock push notification service initialized')
  }

  // 請求推送通知權限
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    if (!this.config.enablePushNotifications) {
      return {
        hasPermission: false,
        canRequestPermission: false,
        permissionStatus: 'denied',
      }
    }

    try {
      if (this.mockMode) {
        return await this.mockRequestPermissions()
      } else {
        return await this.realRequestPermissions()
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error)
      return {
        hasPermission: false,
        canRequestPermission: false,
        permissionStatus: 'denied',
      }
    }
  }

  private async mockRequestPermissions(): Promise<NotificationPermissionStatus> {
    // 模擬用戶授權過程
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      hasPermission: true,
      canRequestPermission: true,
      permissionStatus: 'granted',
    }
  }

  private async realRequestPermissions(): Promise<NotificationPermissionStatus> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        )
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED
        return {
          hasPermission,
          canRequestPermission: true,
          permissionStatus: hasPermission ? 'granted' : 'denied',
        }
      } catch (error) {
        console.error('Android permission request failed:', error)
        return {
          hasPermission: false,
          canRequestPermission: false,
          permissionStatus: 'denied',
        }
      }
    } else {
      // iOS 實現會使用 PushNotificationIOS 或類似庫
      throw new Error('Real iOS notification permissions not implemented')
    }
  }

  // 獲取設備 token
  async getDeviceToken(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return this.deviceToken || null
  }

  // 發送本地通知
  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.config.enablePushNotifications) {
      throw new Error('Push notifications are disabled')
    }

    try {
      if (this.mockMode) {
        await this.mockSendLocalNotification(payload)
      } else {
        await this.realSendLocalNotification(payload)
      }

      console.log(`Local notification sent: ${payload.title}`)
    } catch (error) {
      console.error('Failed to send local notification:', error)
      throw new Error(`發送本地通知失敗: ${(error as Error).message}`)
    }
  }

  private async mockSendLocalNotification(
    payload: NotificationPayload,
  ): Promise<void> {
    console.log('Mock: Sending local notification', payload.title)

    // 模擬通知接收
    setTimeout(() => {
      const receivedNotification: ReceivedNotification = {
        id: payload.id,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        receivedAt: Date.now(),
        wasOpened: false,
        fromBackground: false,
      }

      this.handleNotificationReceived(receivedNotification)
    }, 1000)
  }

  private async realSendLocalNotification(
    _payload: NotificationPayload,
  ): Promise<void> {
    // 真實實現會使用平台原生通知 API
    throw new Error('Real local notification not implemented')
  }

  // 取消通知
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (this.mockMode) {
        await this.mockCancelNotification(notificationId)
      } else {
        await this.realCancelNotification(notificationId)
      }

      console.log(`Notification cancelled: ${notificationId}`)
    } catch (error) {
      console.error('Failed to cancel notification:', error)
      throw new Error(`取消通知失敗: ${(error as Error).message}`)
    }
  }

  private async mockCancelNotification(notificationId: string): Promise<void> {
    console.log('Mock: Cancelling notification', notificationId)
  }

  private async realCancelNotification(_notificationId: string): Promise<void> {
    // 真實實現
    throw new Error('Real notification cancellation not implemented')
  }

  // 取消所有通知
  async cancelAllNotifications(): Promise<void> {
    try {
      if (this.mockMode) {
        await this.mockCancelAllNotifications()
      } else {
        await this.realCancelAllNotifications()
      }

      console.log('All notifications cancelled')
    } catch (error) {
      console.error('Failed to cancel all notifications:', error)
      throw new Error(`取消所有通知失敗: ${(error as Error).message}`)
    }
  }

  private async mockCancelAllNotifications(): Promise<void> {
    console.log('Mock: Cancelling all notifications')
  }

  private async realCancelAllNotifications(): Promise<void> {
    // 真實實現
    throw new Error('Real cancel all notifications not implemented')
  }

  // 設置徽章數量
  async setBadgeCount(count: number): Promise<void> {
    if (!this.config.enableBadgeCount) {
      return
    }

    try {
      if (this.mockMode) {
        await this.mockSetBadgeCount(count)
      } else {
        await this.realSetBadgeCount(count)
      }

      console.log(`Badge count set to: ${count}`)
    } catch (error) {
      console.error('Failed to set badge count:', error)
      throw new Error(`設置徽章數量失敗: ${(error as Error).message}`)
    }
  }

  private async mockSetBadgeCount(count: number): Promise<void> {
    console.log('Mock: Setting badge count to', count)
  }

  private async realSetBadgeCount(_count: number): Promise<void> {
    // 真實實現會使用平台原生 API
    throw new Error('Real badge count setting not implemented')
  }

  // 獲取通知設置
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      if (this.mockMode) {
        return await this.mockGetNotificationSettings()
      } else {
        return await this.realGetNotificationSettings()
      }
    } catch (error) {
      console.error('Failed to get notification settings:', error)
      return {
        alert: false,
        badge: false,
        sound: false,
        critical: false,
        provisional: false,
      }
    }
  }

  private async mockGetNotificationSettings(): Promise<NotificationSettings> {
    return {
      alert: this.config.enablePushNotifications,
      badge: this.config.enableBadgeCount,
      sound: this.config.enableSounds,
      critical: false,
      provisional: false,
    }
  }

  private async realGetNotificationSettings(): Promise<NotificationSettings> {
    // 真實實現會檢查平台通知設置
    throw new Error('Real notification settings check not implemented')
  }

  // 處理接收到的通知
  private handleNotificationReceived(notification: ReceivedNotification): void {
    // 添加到歷史記錄
    this.notificationHistory.unshift(notification)
    this.saveNotificationHistory()

    // 觸發回調
    this.onNotificationReceived?.(notification)

    console.log('Notification received:', notification.title)
  }

  // 處理通知點擊
  private handleNotificationOpened(notification: ReceivedNotification): void {
    // 標記為已打開
    notification.wasOpened = true

    // 觸發回調
    this.onNotificationOpened?.(notification)

    console.log('Notification opened:', notification.title)
  }

  // 處理通知動作
  private handleNotificationAction(
    actionId: string,
    notification: ReceivedNotification,
  ): void {
    // 觸發回調
    this.onNotificationAction?.(actionId, notification)

    console.log('Notification action:', actionId, notification.title)
  }

  // 開始模擬通知
  private startMockNotifications(): void {
    if (!this.mockMode) {
      return
    }

    // 每 30 秒發送一個模擬通知
    setInterval(() => {
      const randomNotification =
        this.mockNotifications[
          Math.floor(Math.random() * this.mockNotifications.length)
        ]

      const receivedNotification: ReceivedNotification = {
        ...randomNotification,
        id: `${randomNotification.id}-${Date.now()}`,
        receivedAt: Date.now(),
        wasOpened: false,
        fromBackground: true,
      }

      this.handleNotificationReceived(receivedNotification)
    }, 30000)
  }

  // 設置事件監聽器
  setOnNotificationReceived(callback: NotificationEventCallback): void {
    this.onNotificationReceived = callback
  }

  setOnNotificationOpened(callback: NotificationEventCallback): void {
    this.onNotificationOpened = callback
  }

  setOnNotificationAction(callback: NotificationActionCallback): void {
    this.onNotificationAction = callback
  }

  // 獲取通知歷史
  getNotificationHistory(): ReceivedNotification[] {
    return [...this.notificationHistory]
  }

  // 清除通知歷史
  async clearNotificationHistory(): Promise<void> {
    try {
      this.notificationHistory = []
      await AsyncStorage.removeItem('push_notification_history')
    } catch (error) {
      console.error('Failed to clear notification history:', error)
    }
  }

  // 保存通知歷史
  private async saveNotificationHistory(): Promise<void> {
    try {
      const history = this.notificationHistory.slice(0, 100) // 只保留最近 100 條
      await AsyncStorage.setItem(
        'push_notification_history',
        JSON.stringify(history),
      )
    } catch (error) {
      console.error('Failed to save notification history:', error)
    }
  }

  // 加載通知歷史
  private async loadNotificationHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('push_notification_history')
      if (stored) {
        this.notificationHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load notification history:', error)
      this.notificationHistory = []
    }
  }

  // 生成預設通知模板
  createSyncNotification(
    message: string,
    documentId: string,
  ): NotificationPayload {
    return {
      id: `sync-${Date.now()}`,
      title: '同步完成',
      body: message,
      data: {
        type: 'sync',
        documentId,
      },
      badge: 1,
      sound: this.config.enableSounds ? 'default' : undefined,
    }
  }

  createCollaborationNotification(
    message: string,
    documentId: string,
    userId: string,
  ): NotificationPayload {
    return {
      id: `collaboration-${Date.now()}`,
      title: '協作邀請',
      body: message,
      data: {
        type: 'collaboration',
        documentId,
        userId,
      },
      badge: 1,
      sound: this.config.enableSounds ? 'default' : undefined,
      actions: [
        {
          id: 'accept',
          title: '接受',
          options: {foreground: true},
        },
        {
          id: 'decline',
          title: '拒絕',
          options: {foreground: false},
        },
      ],
    }
  }

  createVoiceNoteNotification(
    message: string,
    noteId: string,
  ): NotificationPayload {
    return {
      id: `voice-${Date.now()}`,
      title: '語音筆記',
      body: message,
      data: {
        type: 'voice',
        noteId,
      },
      badge: 1,
      sound: this.config.enableSounds ? 'default' : undefined,
    }
  }

  // 設置配置
  setConfig(config: Partial<PushNotificationConfig>): void {
    this.config = {...this.config, ...config}
    console.log('Push notification config updated:', this.config)
  }

  // 獲取配置
  getConfig(): PushNotificationConfig {
    return {...this.config}
  }

  // 檢查功能是否啟用
  isFeatureEnabled(feature: keyof PushNotificationConfig): boolean {
    return Boolean(this.config[feature])
  }

  // 清理服務
  cleanup(): void {
    this.isInitialized = false
    this.deviceToken = undefined
    this.notificationHistory = []
    this.onNotificationReceived = undefined
    this.onNotificationOpened = undefined
    this.onNotificationAction = undefined
    console.log('Push notification service cleaned up')
  }
}

export default PushNotificationService
