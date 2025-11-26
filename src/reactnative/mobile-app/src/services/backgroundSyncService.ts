import {AppState, AppStateStatus} from 'react-native'
import NetInfo, {NetInfoState} from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CRDTSyncService from './crdtSyncService'
import {MOCK_CONFIG} from '../utils/constants'

export interface BackgroundSyncConfig {
  syncInterval: number // milliseconds
  maxRetryAttempts: number
  retryBackoffMultiplier: number
  batteryOptimized: boolean
  syncOnlyOnWifi: boolean
  enablePushNotifications: boolean
}

export interface SyncJob {
  id: string
  documentId: string
  type: 'full' | 'delta' | 'conflict'
  priority: 'high' | 'medium' | 'low'
  scheduledTime: number
  retryAttempts: number
  lastError?: string
}

export interface NetworkStatus {
  isConnected: boolean
  type: string
  isWifiEnabled: boolean
  isInternetReachable: boolean
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown'
}

class BackgroundSyncService {
  private mockMode = MOCK_CONFIG.enabled
  private crdtService: CRDTSyncService
  private config: BackgroundSyncConfig
  private isRunning = false
  private syncJobs: Map<string, SyncJob> = new Map()
  private networkStatus: NetworkStatus
  private appState: AppStateStatus = 'active'
  private syncInterval?: NodeJS.Timeout

  constructor(userId: string, config: Partial<BackgroundSyncConfig> = {}) {
    this.crdtService = new CRDTSyncService(userId)
    this.config = {
      syncInterval: 30000, // 30 seconds
      maxRetryAttempts: 3,
      retryBackoffMultiplier: 2,
      batteryOptimized: true,
      syncOnlyOnWifi: false,
      enablePushNotifications: true,
      ...config,
    }

    this.networkStatus = {
      isConnected: false,
      type: 'unknown',
      isWifiEnabled: false,
      isInternetReachable: false,
      connectionQuality: 'unknown',
    }

    this.initializeListeners()
    console.log(
      'BackgroundSyncService initialized with mock mode:',
      this.mockMode,
    )
  }

  // 初始化監聽器
  private initializeListeners(): void {
    // 網路狀態監聽
    NetInfo.addEventListener(this.handleNetworkChange)

    // App 狀態監聽
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  // 處理網路狀態變化
  private handleNetworkChange = (state: NetInfoState): void => {
    const wasConnected = this.networkStatus.isConnected

    this.networkStatus = {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isWifiEnabled: state.type === 'wifi',
      isInternetReachable: state.isInternetReachable ?? false,
      connectionQuality: this.assessConnectionQuality(state),
    }

    console.log('Network status changed:', this.networkStatus)

    // 網路恢復時立即同步
    if (!wasConnected && this.networkStatus.isConnected) {
      this.triggerImmediateSync()
    }

    // 網路斷開時停止同步
    if (wasConnected && !this.networkStatus.isConnected) {
      this.pauseSync()
    }
  }

  // 評估連接質量
  private assessConnectionQuality(
    state: NetInfoState,
  ): NetworkStatus['connectionQuality'] {
    if (!state.isConnected) return 'unknown'

    if (state.type === 'wifi') {
      return 'excellent'
    } else if (state.type === 'cellular') {
      // 根據 cellular 數據評估（在實際應用中可以使用更複雜的邏輯）
      return 'good'
    }

    return 'unknown'
  }

  // 處理 App 狀態變化
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    const prevAppState = this.appState
    this.appState = nextAppState

    console.log('App state changed from', prevAppState, 'to', nextAppState)

    if (prevAppState === 'background' && nextAppState === 'active') {
      // App 從背景回到前台，立即同步
      this.triggerImmediateSync()
    } else if (prevAppState === 'active' && nextAppState === 'background') {
      // App 進入背景，啟動背景同步
      this.startBackgroundSync()
    }
  }

  // Mock 推播通知處理
  private mockHandlePushNotification(documentId: string): void {
    console.log('Mock push notification for document:', documentId)
    this.scheduleSyncJob(documentId, 'delta', 'high')
  }

  // 啟動背景同步
  async startBackgroundSync(): Promise<void> {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    console.log('Starting background sync service')

    // Mock 背景同步（在實際應用中使用真實的背景任務）
    console.log('Mock background job started')

    // 設置同步間隔
    this.syncInterval = setInterval(() => {
      this.performScheduledSync()
    }, this.config.syncInterval)

    // 載入待處理的同步作業
    await this.loadPendingSyncJobs()
  }

  // 停止背景同步
  stopBackgroundSync(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    console.log('Stopping background sync service')

    console.log('Mock background job stopped')

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  // 暫停同步
  private pauseSync(): void {
    console.log('Pausing sync due to network disconnection')
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  // 安排同步作業
  async scheduleSyncJob(
    documentId: string,
    type: SyncJob['type'] = 'delta',
    priority: SyncJob['priority'] = 'medium',
  ): Promise<void> {
    const jobId = `${documentId}_${type}_${Date.now()}`

    const job: SyncJob = {
      id: jobId,
      documentId,
      type,
      priority,
      scheduledTime: Date.now(),
      retryAttempts: 0,
    }

    this.syncJobs.set(jobId, job)
    await this.saveSyncJob(job)

    console.log(`Scheduled sync job: ${jobId}`)
  }

  // 執行排程同步
  private async performScheduledSync(): Promise<void> {
    if (!this.shouldSync()) {
      return
    }

    console.log('Performing scheduled sync, jobs count:', this.syncJobs.size)

    // 按優先級排序作業
    const sortedJobs = Array.from(this.syncJobs.values()).sort((a, b) => {
      const priorityOrder = {high: 3, medium: 2, low: 1}
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    // 執行同步作業
    for (const job of sortedJobs) {
      try {
        await this.executeSyncJob(job)
        this.syncJobs.delete(job.id)
        await this.removeSyncJob(job.id)
      } catch (error) {
        console.error(`Sync job ${job.id} failed:`, error)
        await this.handleSyncJobError(job, error as Error)
      }
    }
  }

  // 執行同步作業
  private async executeSyncJob(job: SyncJob): Promise<void> {
    console.log(`Executing sync job: ${job.id}`)

    if (this.mockMode) {
      // Mock 模式：模擬同步操作
      await this.mockSyncExecution(job)
      return
    }

    switch (job.type) {
      case 'delta':
        await this.performDeltaSync(job.documentId)
        break
      case 'full':
        await this.performFullSync(job.documentId)
        break
      case 'conflict':
        await this.performConflictResolution(job.documentId)
        break
    }
  }

  // Mock 同步執行
  private async mockSyncExecution(job: SyncJob): Promise<void> {
    // 模擬網路延遲
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000),
    )

    // 模擬 90% 成功率
    if (Math.random() < 0.1) {
      throw new Error('Mock sync failure')
    }

    console.log(`Mock sync completed for job: ${job.id}`)
  }

  // 執行 Delta 同步
  private async performDeltaSync(documentId: string): Promise<void> {
    // 生成 Delta
    const delta = await this.crdtService.generateDelta(documentId, {})

    // 在真實環境中，這裡會發送到服務器
    console.log(
      `Delta sync for document ${documentId}:`,
      delta.operations.length,
      'operations',
    )
  }

  // 執行完整同步
  private async performFullSync(documentId: string): Promise<void> {
    console.log(`Full sync for document ${documentId}`)
    // 實現完整文檔同步邏輯
  }

  // 執行衝突解決
  private async performConflictResolution(documentId: string): Promise<void> {
    console.log(`Conflict resolution for document ${documentId}`)
    // 實現衝突解決邏輯
  }

  // 處理同步作業錯誤
  private async handleSyncJobError(job: SyncJob, error: Error): Promise<void> {
    job.retryAttempts++
    job.lastError = error.message

    if (job.retryAttempts >= this.config.maxRetryAttempts) {
      console.error(
        `Sync job ${job.id} failed permanently after ${job.retryAttempts} attempts`,
      )
      this.syncJobs.delete(job.id)
      await this.removeSyncJob(job.id)

      // 發送失敗通知
      this.sendSyncFailureNotification(job)
    } else {
      // 指數退避重試
      const delay =
        Math.pow(this.config.retryBackoffMultiplier, job.retryAttempts) * 1000
      job.scheduledTime = Date.now() + delay

      await this.saveSyncJob(job)
      console.log(`Rescheduling sync job ${job.id} after ${delay}ms`)
    }
  }

  // 檢查是否應該同步
  private shouldSync(): boolean {
    if (!this.networkStatus.isConnected) {
      return false
    }

    if (this.config.syncOnlyOnWifi && !this.networkStatus.isWifiEnabled) {
      return false
    }

    if (this.config.batteryOptimized && this.appState === 'background') {
      // 在背景時降低同步頻率
      return Math.random() < 0.3
    }

    return true
  }

  // 立即觸發同步
  private async triggerImmediateSync(): Promise<void> {
    console.log('Triggering immediate sync')
    await this.performScheduledSync()
  }

  // 發送同步失敗通知
  private sendSyncFailureNotification(job: SyncJob): void {
    if (!this.config.enablePushNotifications) {
      return
    }

    console.log(`Mock notification: 文檔 ${job.documentId} 同步失敗`)
  }

  // 保存同步作業
  private async saveSyncJob(job: SyncJob): Promise<void> {
    try {
      const jobs = await this.loadSyncJobsFromStorage()
      jobs[job.id] = job
      await AsyncStorage.setItem('background_sync_jobs', JSON.stringify(jobs))
    } catch (error) {
      console.error('Failed to save sync job:', error)
    }
  }

  // 移除同步作業
  private async removeSyncJob(jobId: string): Promise<void> {
    try {
      const jobs = await this.loadSyncJobsFromStorage()
      delete jobs[jobId]
      await AsyncStorage.setItem('background_sync_jobs', JSON.stringify(jobs))
    } catch (error) {
      console.error('Failed to remove sync job:', error)
    }
  }

  // 載入待處理的同步作業
  private async loadPendingSyncJobs(): Promise<void> {
    try {
      const jobs = await this.loadSyncJobsFromStorage()
      for (const [jobId, job] of Object.entries(jobs)) {
        this.syncJobs.set(jobId, job)
      }
      console.log(`Loaded ${this.syncJobs.size} pending sync jobs`)
    } catch (error) {
      console.error('Failed to load pending sync jobs:', error)
    }
  }

  // 從存儲載入同步作業
  private async loadSyncJobsFromStorage(): Promise<Record<string, SyncJob>> {
    try {
      const stored = await AsyncStorage.getItem('background_sync_jobs')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load sync jobs from storage:', error)
      return {}
    }
  }

  // 獲取同步統計
  getSyncStats(): {
    pendingJobs: number
    networkStatus: NetworkStatus
    isRunning: boolean
    config: BackgroundSyncConfig
  } {
    return {
      pendingJobs: this.syncJobs.size,
      networkStatus: this.networkStatus,
      isRunning: this.isRunning,
      config: this.config,
    }
  }

  // 清理服務
  cleanup(): void {
    this.stopBackgroundSync()
    // Note: NetInfo.addEventListener returns a subscription that should be stored and called to unsubscribe
    console.log('Background sync service cleaned up')
  }
}

export default BackgroundSyncService
