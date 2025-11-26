import NetInfo, {NetInfoState} from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {databaseService, SyncRecord} from './databaseService'
import {STORAGE_KEYS} from '../utils/constants'

export interface OfflineState {
  isConnected: boolean
  isOnline: boolean
  connectionType: string | null
  lastSyncTime: number | null
  pendingSyncCount: number
  syncInProgress: boolean
}

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

class OfflineService {
  private isConnected = true
  private connectionType: string | null = null
  private syncInProgress = false
  private listeners: ((state: OfflineState) => void)[] = []
  private netInfoUnsubscribe: (() => void) | null = null

  constructor() {
    this.initialize()
  }

  private async initialize() {
    // Listen to network state changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(this.handleNetworkChange)

    // Get initial network state
    const state = await NetInfo.fetch()
    this.handleNetworkChange(state)

    // Auto-sync when coming back online
    if (this.isConnected) {
      setTimeout(() => {
        this.syncPendingChanges()
      }, 2000) // Wait 2 seconds after initialization
    }
  }

  private handleNetworkChange = (state: NetInfoState) => {
    const wasConnected = this.isConnected
    this.isConnected = state.isConnected ?? false
    this.connectionType = state.type

    console.log('Network state changed:', {
      isConnected: this.isConnected,
      type: state.type,
      wasConnected,
    })

    // Trigger sync when coming back online
    if (!wasConnected && this.isConnected) {
      console.log('Back online - starting sync')
      setTimeout(() => {
        this.syncPendingChanges()
      }, 1000)
    }

    this.notifyListeners()
  }

  // Public API
  async getOfflineState(): Promise<OfflineState> {
    const lastSyncTime = await this.getLastSyncTime()
    const pendingSyncCount = await this.getPendingSyncCount()

    return {
      isConnected: this.isConnected,
      isOnline: this.isConnected,
      connectionType: this.connectionType,
      lastSyncTime,
      pendingSyncCount,
      syncInProgress: this.syncInProgress,
    }
  }

  addStateListener(callback: (state: OfflineState) => void) {
    this.listeners.push(callback)
    // Immediately call with current state
    this.getOfflineState().then(state => callback(state))
  }

  removeStateListener(callback: (state: OfflineState) => void) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  private async notifyListeners() {
    const state = await this.getOfflineState()
    this.listeners.forEach(callback => callback(state))
  }

  async syncPendingChanges(): Promise<SyncResult> {
    if (!this.isConnected) {
      console.log('Cannot sync - offline')
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Device is offline'],
      }
    }

    if (this.syncInProgress) {
      console.log('Sync already in progress')
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Sync already in progress'],
      }
    }

    this.syncInProgress = true
    this.notifyListeners()

    try {
      const pendingRecords = await databaseService.getPendingSyncRecords()
      console.log(`Starting sync for ${pendingRecords.length} records`)

      let synced = 0
      let failed = 0
      const errors: string[] = []

      for (const record of pendingRecords) {
        try {
          await this.syncRecord(record)
          await databaseService.markSyncRecordAsCompleted(record.id)
          synced++
        } catch (error) {
          console.error('Failed to sync record:', record.id, error)
          failed++
          errors.push(`Record ${record.recordId}: ${error}`)
        }
      }

      // Update last sync time
      await this.setLastSyncTime(Date.now())

      // Clean up completed sync records
      await databaseService.clearCompletedSyncRecords()

      console.log(`Sync completed: ${synced} synced, ${failed} failed`)

      return {
        success: failed === 0,
        synced,
        failed,
        errors,
      }
    } catch (error) {
      console.error('Sync failed:', error)
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [String(error)],
      }
    } finally {
      this.syncInProgress = false
      this.notifyListeners()
    }
  }

  private async syncRecord(record: SyncRecord): Promise<void> {
    // Mock sync - in real app, this would make API calls
    console.log(`Syncing record: ${record.recordId} (${record.operation})`)

    // Simulate network delay
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000),
    )

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error')
    }

    // In real implementation, you would:
    // 1. Make HTTP request to sync endpoint
    // 2. Handle response and conflicts
    // 3. Update local data if needed
    console.log(`Successfully synced: ${record.recordId}`)
  }

  async forceSyncDocument(documentId: string): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    try {
      // Get document from database
      const document = await databaseService.getDocument(documentId)
      if (!document) {
        return false
      }

      // Create a sync record for immediate sync
      const syncRecord: SyncRecord = {
        id: `force-sync-${Date.now()}`,
        table: 'documents',
        recordId: documentId,
        operation: 'update',
        data: JSON.stringify(document),
        timestamp: Date.now(),
        synced: false,
      }

      await this.syncRecord(syncRecord)
      return true
    } catch (error) {
      console.error('Force sync failed:', error)
      return false
    }
  }

  // Storage helpers
  private async getLastSyncTime(): Promise<number | null> {
    try {
      const timeStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME)
      return timeStr ? parseInt(timeStr, 10) : null
    } catch (error) {
      console.error('Failed to get last sync time:', error)
      return null
    }
  }

  private async setLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC_TIME,
        timestamp.toString(),
      )
    } catch (error) {
      console.error('Failed to set last sync time:', error)
    }
  }

  private async getPendingSyncCount(): Promise<number> {
    try {
      const records = await databaseService.getPendingSyncRecords()
      return records.length
    } catch (error) {
      console.error('Failed to get pending sync count:', error)
      return 0
    }
  }

  // Network status helpers
  isOnline(): boolean {
    return this.isConnected
  }

  getConnectionType(): string | null {
    return this.connectionType
  }

  async canSyncLargeFiles(): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    // Don't sync large files on cellular to save data
    return this.connectionType === 'wifi'
  }

  // Cleanup
  destroy() {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe()
      this.netInfoUnsubscribe = null
    }
    this.listeners = []
  }
}

export const offlineService = new OfflineService()
export default offlineService
