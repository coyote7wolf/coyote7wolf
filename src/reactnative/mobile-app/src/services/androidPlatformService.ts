import {Platform, Alert, PermissionsAndroid} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {MOCK_CONFIG} from '../utils/constants'

export interface AndroidIntegrationConfig {
  enableAppShortcuts: boolean
  enableFingerprint: boolean
  enableIntentIntegration: boolean
  enableAutoBackup: boolean
  enableNotificationChannels: boolean
  enableAdaptiveIcons: boolean
}

export interface AppShortcut {
  id: string
  shortLabel: string
  longLabel: string
  iconResourceName?: string
  intentAction: string
  intentData?: string
  categories?: string[]
  rank?: number
}

export interface FingerprintAuthResult {
  success: boolean
  error?: string
  errorCode?: string
}

export interface IntentData {
  action: string
  type?: string
  data?: string
  extras?: Record<string, any>
  categories?: string[]
}

export interface BackupStatus {
  isEnabled: boolean
  isAvailable: boolean
  lastBackupTime?: number
  backupProgress?: number
  error?: string
}

export interface NotificationChannel {
  id: string
  name: string
  description: string
  importance: 'default' | 'high' | 'low' | 'min' | 'none'
  enableVibration: boolean
  enableLights: boolean
  lightColor?: string
  soundUri?: string
}

class AndroidPlatformService {
  private mockMode = MOCK_CONFIG.enabled || Platform.OS !== 'android'
  private config: AndroidIntegrationConfig
  private isInitialized = false
  private registeredShortcuts: AppShortcut[] = []
  private notificationChannels: NotificationChannel[] = []

  constructor(config: Partial<AndroidIntegrationConfig> = {}) {
    this.config = {
      enableAppShortcuts: true,
      enableFingerprint: true,
      enableIntentIntegration: true,
      enableAutoBackup: true,
      enableNotificationChannels: true,
      enableAdaptiveIcons: true,
      ...config,
    }

    console.log(
      'AndroidPlatformService initialized with mock mode:',
      this.mockMode,
    )
  }

  // 初始化 Android 平台整合
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

      // 加載已註冊的應用快捷方式
      await this.loadRegisteredShortcuts()

      // 初始化通知頻道
      await this.initializeNotificationChannels()

      this.isInitialized = true
      console.log('Android platform service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Android platform service:', error)
      throw error
    }
  }

  // 初始化真實服務
  private async initializeRealService(): Promise<void> {
    // 在真實實現中，這裡會初始化各種 Android 原生模組
    console.log('Real Android service would be initialized here')
  }

  // 初始化 Mock 服務
  private async initializeMockService(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Mock Android service initialized')
  }

  // App Shortcuts 功能
  async addAppShortcut(shortcut: AppShortcut): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.config.enableAppShortcuts) {
      throw new Error('App shortcuts is disabled')
    }

    try {
      if (this.mockMode) {
        await this.mockAddAppShortcut(shortcut)
      } else {
        await this.realAddAppShortcut(shortcut)
      }

      // 保存到本地記錄
      this.registeredShortcuts.push(shortcut)
      await this.saveRegisteredShortcuts()

      console.log(`App shortcut added: ${shortcut.shortLabel}`)
    } catch (error) {
      console.error('Failed to add app shortcut:', error)
      throw new Error(`添加應用快捷方式失敗: ${(error as Error).message}`)
    }
  }

  private async mockAddAppShortcut(shortcut: AppShortcut): Promise<void> {
    console.log('Mock: Adding app shortcut', shortcut)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private async realAddAppShortcut(_shortcut: AppShortcut): Promise<void> {
    // 真實實現會使用 Android ShortcutManager
    throw new Error('Real app shortcuts not implemented')
  }

  // 移除應用快捷方式
  async removeAppShortcut(shortcutId: string): Promise<void> {
    try {
      if (this.mockMode) {
        await this.mockRemoveAppShortcut(shortcutId)
      } else {
        await this.realRemoveAppShortcut(shortcutId)
      }

      // 從本地記錄中移除
      this.registeredShortcuts = this.registeredShortcuts.filter(
        s => s.id !== shortcutId,
      )
      await this.saveRegisteredShortcuts()

      console.log(`App shortcut removed: ${shortcutId}`)
    } catch (error) {
      console.error('Failed to remove app shortcut:', error)
      throw new Error(`移除應用快捷方式失敗: ${(error as Error).message}`)
    }
  }

  private async mockRemoveAppShortcut(shortcutId: string): Promise<void> {
    console.log('Mock: Removing app shortcut', shortcutId)
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  private async realRemoveAppShortcut(_shortcutId: string): Promise<void> {
    // 真實實現
    throw new Error('Real app shortcuts removal not implemented')
  }

  // 獲取已註冊的快捷方式
  getRegisteredShortcuts(): AppShortcut[] {
    return [...this.registeredShortcuts]
  }

  // 指紋驗證
  async authenticateWithFingerprint(
    reason: string = '請使用指紋驗證身份',
  ): Promise<FingerprintAuthResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.config.enableFingerprint) {
      return {
        success: false,
        error: 'Fingerprint authentication is disabled',
      }
    }

    try {
      // 檢查權限
      const hasPermission = await this.checkFingerprintPermission()
      if (!hasPermission) {
        return {
          success: false,
          error: 'Fingerprint permission not granted',
          errorCode: 'PERMISSION_DENIED',
        }
      }

      if (this.mockMode) {
        return await this.mockFingerprintAuth(reason)
      } else {
        return await this.realFingerprintAuth(reason)
      }
    } catch (error) {
      console.error('Fingerprint authentication failed:', error)
      return {
        success: false,
        error: (error as Error).message,
        errorCode: 'AUTHENTICATION_FAILED',
      }
    }
  }

  private async checkFingerprintPermission(): Promise<boolean> {
    if (this.mockMode) {
      return true
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.USE_FINGERPRINT,
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (error) {
      console.error('Failed to request fingerprint permission:', error)
      return false
    }
  }

  private async mockFingerprintAuth(
    reason: string,
  ): Promise<FingerprintAuthResult> {
    console.log('Mock: Fingerprint authentication', reason)

    // 模擬用戶交互
    return new Promise(resolve => {
      Alert.alert('Mock 指紋驗證', reason, [
        {
          text: '取消',
          style: 'cancel',
          onPress: () =>
            resolve({
              success: false,
              error: 'User cancelled',
              errorCode: 'USER_CANCEL',
            }),
        },
        {
          text: '驗證成功',
          onPress: () =>
            resolve({
              success: true,
            }),
        },
      ])
    })
  }

  private async realFingerprintAuth(
    _reason: string,
  ): Promise<FingerprintAuthResult> {
    // 真實實現會使用 react-native-fingerprint-scanner 或類似庫
    throw new Error('Real fingerprint authentication not implemented')
  }

  // Intent 處理
  async handleIntent(intentData: IntentData): Promise<void> {
    if (!this.config.enableIntentIntegration) {
      throw new Error('Intent integration is disabled')
    }

    try {
      console.log('Handling intent:', intentData)

      switch (intentData.action) {
        case 'android.intent.action.SEND':
          await this.handleSendIntent(intentData)
          break
        case 'android.intent.action.VIEW':
          await this.handleViewIntent(intentData)
          break
        case 'android.intent.action.EDIT':
          await this.handleEditIntent(intentData)
          break
        case 'com.synccore.CREATE_NOTE':
          await this.handleCreateNoteIntent(intentData)
          break
        default:
          console.warn(`Unhandled intent action: ${intentData.action}`)
      }
    } catch (error) {
      console.error('Intent handling failed:', error)
      throw new Error(`處理 Intent 失敗: ${(error as Error).message}`)
    }
  }

  private async handleSendIntent(intentData: IntentData): Promise<void> {
    console.log('Processing SEND intent:', intentData.data)
    // 處理分享內容
  }

  private async handleViewIntent(intentData: IntentData): Promise<void> {
    console.log('Processing VIEW intent:', intentData.data)
    // 處理查看內容
  }

  private async handleEditIntent(intentData: IntentData): Promise<void> {
    console.log('Processing EDIT intent:', intentData.data)
    // 處理編輯內容
  }

  private async handleCreateNoteIntent(intentData: IntentData): Promise<void> {
    console.log('Processing CREATE_NOTE intent:', intentData.extras)
    // 處理創建筆記
  }

  // Auto Backup 功能
  async getAutoBackupStatus(): Promise<BackupStatus> {
    if (!this.config.enableAutoBackup) {
      return {
        isEnabled: false,
        isAvailable: false,
        error: 'Auto backup is disabled',
      }
    }

    try {
      if (this.mockMode) {
        return await this.mockGetBackupStatus()
      } else {
        return await this.realGetBackupStatus()
      }
    } catch (error) {
      console.error('Failed to get backup status:', error)
      return {
        isEnabled: false,
        isAvailable: false,
        error: (error as Error).message,
      }
    }
  }

  private async mockGetBackupStatus(): Promise<BackupStatus> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      isEnabled: true,
      isAvailable: true,
      lastBackupTime: Date.now() - 3600000, // 1 hour ago
      backupProgress: 1.0,
    }
  }

  private async realGetBackupStatus(): Promise<BackupStatus> {
    // 真實實現會檢查 Android Auto Backup 狀態
    throw new Error('Real backup status check not implemented')
  }

  // 手動觸發備份
  async triggerAutoBackup(): Promise<void> {
    if (!this.config.enableAutoBackup) {
      throw new Error('Auto backup is disabled')
    }

    try {
      if (this.mockMode) {
        await this.mockTriggerBackup()
      } else {
        await this.realTriggerBackup()
      }

      console.log('Auto backup triggered successfully')
    } catch (error) {
      console.error('Failed to trigger backup:', error)
      throw new Error(`觸發自動備份失敗: ${(error as Error).message}`)
    }
  }

  private async mockTriggerBackup(): Promise<void> {
    console.log('Mock: Triggering auto backup')
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  private async realTriggerBackup(): Promise<void> {
    // 真實實現會觸發 Android Auto Backup
    throw new Error('Real auto backup not implemented')
  }

  // 通知頻道管理
  async createNotificationChannel(channel: NotificationChannel): Promise<void> {
    if (!this.config.enableNotificationChannels) {
      throw new Error('Notification channels are disabled')
    }

    try {
      if (this.mockMode) {
        await this.mockCreateNotificationChannel(channel)
      } else {
        await this.realCreateNotificationChannel(channel)
      }

      // 保存到本地記錄
      this.notificationChannels.push(channel)
      await this.saveNotificationChannels()

      console.log(`Notification channel created: ${channel.name}`)
    } catch (error) {
      console.error('Failed to create notification channel:', error)
      throw new Error(`創建通知頻道失敗: ${(error as Error).message}`)
    }
  }

  private async mockCreateNotificationChannel(
    channel: NotificationChannel,
  ): Promise<void> {
    console.log('Mock: Creating notification channel', channel.name)
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  private async realCreateNotificationChannel(
    _channel: NotificationChannel,
  ): Promise<void> {
    // 真實實現會使用 Android NotificationChannel
    throw new Error('Real notification channel creation not implemented')
  }

  // 獲取通知頻道
  getNotificationChannels(): NotificationChannel[] {
    return [...this.notificationChannels]
  }

  // 初始化默認通知頻道
  private async initializeNotificationChannels(): Promise<void> {
    const defaultChannels = this.getDefaultNotificationChannels()

    for (const channel of defaultChannels) {
      const exists = this.notificationChannels.some(c => c.id === channel.id)
      if (!exists) {
        try {
          await this.createNotificationChannel(channel)
        } catch (error) {
          console.error(
            `Failed to create default channel ${channel.id}:`,
            error,
          )
        }
      }
    }
  }

  // 獲取默認通知頻道
  private getDefaultNotificationChannels(): NotificationChannel[] {
    return [
      {
        id: 'sync_notifications',
        name: '同步通知',
        description: '文檔同步相關通知',
        importance: 'default',
        enableVibration: false,
        enableLights: true,
        lightColor: '#0066CC',
      },
      {
        id: 'collaboration_notifications',
        name: '協作通知',
        description: '團隊協作相關通知',
        importance: 'high',
        enableVibration: true,
        enableLights: true,
        lightColor: '#FF6600',
      },
      {
        id: 'system_notifications',
        name: '系統通知',
        description: '系統狀態和錯誤通知',
        importance: 'high',
        enableVibration: false,
        enableLights: true,
        lightColor: '#FF0000',
      },
    ]
  }

  // 檢查 Android 功能可用性
  async checkFeatureAvailability(): Promise<Record<string, boolean>> {
    const availability: Record<string, boolean> = {}

    if (this.mockMode) {
      // Mock 所有功能都可用
      availability.appShortcuts = true
      availability.fingerprint = true
      availability.intentIntegration = true
      availability.autoBackup = true
      availability.notificationChannels = true
      availability.adaptiveIcons = true
    } else {
      // 真實檢查
      availability.appShortcuts =
        Platform.OS === 'android' && Number(Platform.Version) >= 25
      availability.fingerprint =
        Platform.OS === 'android' && Number(Platform.Version) >= 23
      availability.intentIntegration = Platform.OS === 'android'
      availability.autoBackup =
        Platform.OS === 'android' && Number(Platform.Version) >= 23
      availability.notificationChannels =
        Platform.OS === 'android' && Number(Platform.Version) >= 26
      availability.adaptiveIcons =
        Platform.OS === 'android' && Number(Platform.Version) >= 26
    }

    return availability
  }

  // 獲取預設的應用快捷方式
  getDefaultShortcuts(): AppShortcut[] {
    return [
      {
        id: 'create_note',
        shortLabel: '新筆記',
        longLabel: '創建新筆記',
        iconResourceName: 'ic_shortcut_note',
        intentAction: 'com.synccore.CREATE_NOTE',
        categories: ['com.synccore.shortcut.CREATE'],
        rank: 0,
      },
      {
        id: 'search_documents',
        shortLabel: '搜尋',
        longLabel: '搜尋文檔',
        iconResourceName: 'ic_shortcut_search',
        intentAction: 'com.synccore.SEARCH_DOCUMENTS',
        categories: ['com.synccore.shortcut.SEARCH'],
        rank: 1,
      },
      {
        id: 'sync_now',
        shortLabel: '同步',
        longLabel: '立即同步',
        iconResourceName: 'ic_shortcut_sync',
        intentAction: 'com.synccore.SYNC_NOW',
        categories: ['com.synccore.shortcut.SYNC'],
        rank: 2,
      },
      {
        id: 'voice_note',
        shortLabel: '語音筆記',
        longLabel: '語音輸入筆記',
        iconResourceName: 'ic_shortcut_voice',
        intentAction: 'com.synccore.VOICE_NOTE',
        categories: ['com.synccore.shortcut.VOICE'],
        rank: 3,
      },
    ]
  }

  // 保存註冊的快捷方式
  private async saveRegisteredShortcuts(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'android_registered_shortcuts',
        JSON.stringify(this.registeredShortcuts),
      )
    } catch (error) {
      console.error('Failed to save registered shortcuts:', error)
    }
  }

  // 加載註冊的快捷方式
  private async loadRegisteredShortcuts(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('android_registered_shortcuts')
      if (stored) {
        this.registeredShortcuts = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load registered shortcuts:', error)
      this.registeredShortcuts = []
    }
  }

  // 保存通知頻道
  private async saveNotificationChannels(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'android_notification_channels',
        JSON.stringify(this.notificationChannels),
      )
    } catch (error) {
      console.error('Failed to save notification channels:', error)
    }
  }

  // 加載通知頻道
  private async loadNotificationChannels(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('android_notification_channels')
      if (stored) {
        this.notificationChannels = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load notification channels:', error)
      this.notificationChannels = []
    }
  }

  // 設置配置
  setConfig(config: Partial<AndroidIntegrationConfig>): void {
    this.config = {...this.config, ...config}
    console.log('Android config updated:', this.config)
  }

  // 獲取配置
  getConfig(): AndroidIntegrationConfig {
    return {...this.config}
  }

  // 檢查功能是否啟用
  isFeatureEnabled(feature: keyof AndroidIntegrationConfig): boolean {
    return this.config[feature]
  }

  // 清理服務
  cleanup(): void {
    this.isInitialized = false
    this.registeredShortcuts = []
    this.notificationChannels = []
    console.log('Android platform service cleaned up')
  }
}

export default AndroidPlatformService
