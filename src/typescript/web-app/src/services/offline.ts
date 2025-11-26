/**
 * Offline Support Service
 *
 * Comprehensive offline editing capabilities with sync queuing,
 * progressive synchronization, and conflict-free offline operations.
 * This is a mock implementation for development and testing.
 */

// Types for offline operations
export interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'sync' | 'meta'
  entityType: 'document' | 'comment' | 'user' | 'workspace' | 'settings'
  entityId: string
  data: any
  timestamp: number
  userId: string
  version: number
  dependencies?: string[]
  retryCount: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict'
  metadata: {
    originalTimestamp: number
    localId?: string
    parentOperation?: string
    priority: 'low' | 'medium' | 'high' | 'critical'
  }
}

export interface SyncQueue {
  operations: OfflineOperation[]
  lastSyncTime: number
  syncInProgress: boolean
  totalPendingOps: number
  failedOps: number
  conflictOps: number
}

export interface OfflineStorage {
  documents: Map<string, any>
  drafts: Map<string, any>
  queue: OfflineOperation[]
  metadata: {
    lastOnlineTime: number
    syncStatus: 'online' | 'offline' | 'syncing'
    storageSize: number
    maxStorageSize: number
  }
}

export interface SyncStrategy {
  name: string
  priority: number
  batchSize: number
  retryDelay: number
  maxRetries: number
  conflictResolution: 'local' | 'remote' | 'merge' | 'manual'
}

export interface SyncResult {
  success: boolean
  syncedOperations: number
  failedOperations: number
  conflictOperations: number
  nextSyncTime: number
  errors: string[]
  totalTime: number
}

class OfflineService {
  private storage: OfflineStorage
  private syncQueue: SyncQueue
  private isOnline: boolean = navigator.onLine
  private syncStrategies: Map<string, SyncStrategy> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private syncInterval: NodeJS.Timeout | null = null
  private heartBeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.storage = {
      documents: new Map(),
      drafts: new Map(),
      queue: [],
      metadata: {
        lastOnlineTime: Date.now(),
        syncStatus: navigator.onLine ? 'online' : 'offline',
        storageSize: 0,
        maxStorageSize: 50 * 1024 * 1024, // 50MB
      },
    }

    this.syncQueue = {
      operations: [],
      lastSyncTime: 0,
      syncInProgress: false,
      totalPendingOps: 0,
      failedOps: 0,
      conflictOps: 0,
    }

    this.initializeSyncStrategies()
    this.setupEventListeners()
    this.loadFromLocalStorage()
    this.startPeriodicSync()
  }

  private initializeSyncStrategies() {
    // Immediate sync for critical operations
    this.syncStrategies.set('critical', {
      name: 'Critical Operations',
      priority: 1,
      batchSize: 1,
      retryDelay: 1000,
      maxRetries: 5,
      conflictResolution: 'manual',
    })

    // High priority sync for user actions
    this.syncStrategies.set('high', {
      name: 'User Actions',
      priority: 2,
      batchSize: 5,
      retryDelay: 2000,
      maxRetries: 3,
      conflictResolution: 'merge',
    })

    // Medium priority for automated operations
    this.syncStrategies.set('medium', {
      name: 'Automated Operations',
      priority: 3,
      batchSize: 10,
      retryDelay: 5000,
      maxRetries: 3,
      conflictResolution: 'local',
    })

    // Low priority for background operations
    this.syncStrategies.set('low', {
      name: 'Background Operations',
      priority: 4,
      batchSize: 20,
      retryDelay: 10000,
      maxRetries: 2,
      conflictResolution: 'remote',
    })
  }

  private setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true
      this.storage.metadata.syncStatus = 'online'
      this.storage.metadata.lastOnlineTime = Date.now()
      this.emit('online')
      this.triggerSync()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.storage.metadata.syncStatus = 'offline'
      this.emit('offline')
    })

    // Visibility change to sync when user returns
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.triggerSync()
      }
    })

    // Before unload to save state
    window.addEventListener('beforeunload', () => {
      this.saveToLocalStorage()
    })
  }

  /**
   * Add operation to offline queue
   */
  async queueOperation(
    operation: Omit<
      OfflineOperation,
      'id' | 'timestamp' | 'retryCount' | 'status'
    >
  ): Promise<string> {
    const fullOperation: OfflineOperation = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      ...operation,
      metadata: {
        ...operation.metadata,
        originalTimestamp: operation.metadata.originalTimestamp || Date.now(),
      },
    }

    // Add to queue
    this.storage.queue.push(fullOperation)
    this.syncQueue.operations.push(fullOperation)
    this.syncQueue.totalPendingOps++

    // Store locally
    if (operation.entityType === 'document') {
      this.storage.documents.set(operation.entityId, operation.data)
    }

    // Save to localStorage
    this.saveToLocalStorage()

    // Emit event
    this.emit('operationQueued', fullOperation)

    // Trigger immediate sync for critical operations
    if (operation.metadata.priority === 'critical' && this.isOnline) {
      setTimeout(() => this.triggerSync(), 100)
    }

    return fullOperation.id
  }

  /**
   * Trigger synchronization process
   */
  async triggerSync(): Promise<SyncResult> {
    if (!this.isOnline || this.syncQueue.syncInProgress) {
      return {
        success: false,
        syncedOperations: 0,
        failedOperations: 0,
        conflictOperations: 0,
        nextSyncTime: Date.now() + 30000,
        errors: ['Sync already in progress or offline'],
        totalTime: 0,
      }
    }

    const startTime = Date.now()
    this.syncQueue.syncInProgress = true
    this.storage.metadata.syncStatus = 'syncing'
    this.emit('syncStarted')

    try {
      const result = await this.performSync()
      this.syncQueue.lastSyncTime = Date.now()
      this.storage.metadata.syncStatus = 'online'

      this.emit('syncCompleted', result)
      return result
    } catch (error) {
      console.error('Sync failed:', error)
      const result: SyncResult = {
        success: false,
        syncedOperations: 0,
        failedOperations: this.syncQueue.totalPendingOps,
        conflictOperations: 0,
        nextSyncTime: Date.now() + 60000,
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
        totalTime: Date.now() - startTime,
      }

      this.emit('syncFailed', result)
      return result
    } finally {
      this.syncQueue.syncInProgress = false
    }
  }

  /**
   * Perform the actual synchronization
   */
  private async performSync(): Promise<SyncResult> {
    const startTime = Date.now()
    let syncedOps = 0
    let failedOps = 0
    let conflictOps = 0
    const errors: string[] = []

    // Sort operations by priority and timestamp
    const pendingOps = this.syncQueue.operations
      .filter(op => op.status === 'pending' || op.status === 'failed')
      .sort((a, b) => {
        const aPriority = this.getPriorityWeight(a.metadata.priority)
        const bPriority = this.getPriorityWeight(b.metadata.priority)

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        return a.timestamp - b.timestamp
      })

    // Process operations in batches by priority
    const priorityGroups = this.groupOperationsByPriority(pendingOps)

    for (const [priority, operations] of priorityGroups) {
      const strategy = this.syncStrategies.get(priority)!
      const batches = this.batchOperations(operations, strategy.batchSize)

      for (const batch of batches) {
        try {
          const batchResult = await this.syncBatch(batch, strategy)
          syncedOps += batchResult.synced
          failedOps += batchResult.failed
          conflictOps += batchResult.conflicts
          errors.push(...batchResult.errors)
        } catch (error) {
          failedOps += batch.length
          errors.push(`Batch sync failed: ${error}`)
        }

        // Add delay between batches to avoid overwhelming the server
        if (batches.length > 1) {
          await this.delay(200)
        }
      }
    }

    // Clean up synced operations
    this.cleanupSyncedOperations()

    // Update queue statistics
    this.updateQueueStats()

    return {
      success: failedOps === 0,
      syncedOperations: syncedOps,
      failedOperations: failedOps,
      conflictOperations: conflictOps,
      nextSyncTime: Date.now() + (failedOps > 0 ? 30000 : 300000), // 30s if failed, 5min if success
      errors,
      totalTime: Date.now() - startTime,
    }
  }

  /**
   * Sync a batch of operations
   */
  private async syncBatch(
    operations: OfflineOperation[],
    strategy: SyncStrategy
  ): Promise<{
    synced: number
    failed: number
    conflicts: number
    errors: string[]
  }> {
    let synced = 0
    let failed = 0
    let conflicts = 0
    const errors: string[] = []

    for (const operation of operations) {
      try {
        operation.status = 'syncing'

        // Mock API call
        const result = await this.mockSyncOperation(operation)

        if (result.success) {
          operation.status = 'synced'
          synced++

          // Update local data with server response
          if (result.data && operation.entityType === 'document') {
            this.storage.documents.set(operation.entityId, result.data)
          }
        } else if (result.isConflict) {
          operation.status = 'conflict'
          conflicts++
          errors.push(`Conflict in operation ${operation.id}: ${result.error}`)

          // Handle conflict based on strategy
          await this.handleConflict(operation, result, strategy)
        } else {
          operation.retryCount++
          if (operation.retryCount >= operation.maxRetries) {
            operation.status = 'failed'
            failed++
          } else {
            operation.status = 'pending'
          }
          errors.push(`Operation ${operation.id} failed: ${result.error}`)
        }
      } catch (error) {
        operation.retryCount++
        if (operation.retryCount >= operation.maxRetries) {
          operation.status = 'failed'
          failed++
        } else {
          operation.status = 'pending'
        }
        errors.push(`Operation ${operation.id} error: ${error}`)
      }
    }

    return { synced, failed, conflicts, errors }
  }

  /**
   * Mock API call for sync operation
   */
  private async mockSyncOperation(operation: OfflineOperation): Promise<{
    success: boolean
    isConflict: boolean
    data?: any
    error?: string
  }> {
    // Simulate network delay
    await this.delay(100 + Math.random() * 500)

    // Simulate various scenarios
    const rand = Math.random()

    if (rand < 0.05) {
      // 5% chance of conflict
      return {
        success: false,
        isConflict: true,
        error: 'Document was modified by another user',
      }
    } else if (rand < 0.1) {
      // 5% chance of failure
      return {
        success: false,
        isConflict: false,
        error: 'Server error or network timeout',
      }
    } else {
      // 90% success rate
      return {
        success: true,
        isConflict: false,
        data: {
          ...operation.data,
          id: operation.entityId,
          serverTimestamp: Date.now(),
          version: operation.version + 1,
        },
      }
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflict(
    operation: OfflineOperation,
    result: any,
    strategy: SyncStrategy
  ): Promise<void> {
    switch (strategy.conflictResolution) {
      case 'local':
        // Keep local changes, ignore server
        operation.status = 'synced'
        break

      case 'remote':
        // Accept server changes, discard local
        if (result.serverData) {
          this.storage.documents.set(operation.entityId, result.serverData)
        }
        operation.status = 'synced'
        break

      case 'merge':
        // Attempt automatic merge
        const merged = await this.attemptAutoMerge(operation, result.serverData)
        if (merged) {
          operation.data = merged
          operation.status = 'pending' // Retry with merged data
        } else {
          operation.status = 'conflict' // Escalate to manual
        }
        break

      case 'manual':
        // Require user intervention
        operation.status = 'conflict'
        this.emit('conflictDetected', {
          operation,
          serverData: result.serverData,
        })
        break
    }
  }

  /**
   * Attempt automatic merge of conflicting data
   */
  private async attemptAutoMerge(
    operation: OfflineOperation,
    serverData: any
  ): Promise<any | null> {
    // Simple merge strategy for documents
    if (operation.entityType === 'document') {
      try {
        const localData = operation.data
        const merged = {
          ...serverData,
          content: this.mergeDocumentContent(
            localData.content,
            serverData.content
          ),
          title: localData.title || serverData.title,
          lastModified: Math.max(
            localData.lastModified,
            serverData.lastModified
          ),
        }
        return merged
      } catch (error) {
        console.error('Auto-merge failed:', error)
        return null
      }
    }

    return null
  }

  /**
   * Simple document content merge
   */
  private mergeDocumentContent(
    localContent: string,
    serverContent: string
  ): string {
    // Very basic merge - in practice, you'd use more sophisticated algorithms
    if (localContent === serverContent) {
      return localContent
    }

    // If one is empty, use the other
    if (!localContent.trim()) return serverContent
    if (!serverContent.trim()) return localContent

    // Simple concatenation with separator
    return `${serverContent}\n\n[MERGED CONTENT]\n\n${localContent}`
  }

  /**
   * Get offline document
   */
  getOfflineDocument(documentId: string): any | null {
    return this.storage.documents.get(documentId) || null
  }

  /**
   * Store document for offline access
   */
  async storeDocumentOffline(documentId: string, document: any): Promise<void> {
    this.storage.documents.set(documentId, {
      ...document,
      offlineTimestamp: Date.now(),
      offlineVersion: true,
    })

    this.saveToLocalStorage()
    this.emit('documentStored', { documentId, document })
  }

  /**
   * Get sync queue status
   */
  getSyncStatus(): SyncQueue {
    return {
      ...this.syncQueue,
      operations: [...this.syncQueue.operations], // Return a copy
    }
  }

  /**
   * Get offline storage info
   */
  getStorageInfo(): OfflineStorage['metadata'] & {
    documentsCount: number
    queueSize: number
  } {
    return {
      ...this.storage.metadata,
      documentsCount: this.storage.documents.size,
      queueSize: this.storage.queue.length,
    }
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(): Promise<void> {
    this.storage.documents.clear()
    this.storage.drafts.clear()
    this.storage.queue = []
    this.syncQueue.operations = []

    this.updateQueueStats()
    this.saveToLocalStorage()
    this.emit('dataCleared')
  }

  /**
   * Export offline data for backup
   */
  exportOfflineData(): string {
    const exportData = {
      documents: Array.from(this.storage.documents.entries()),
      drafts: Array.from(this.storage.drafts.entries()),
      queue: this.storage.queue,
      metadata: this.storage.metadata,
      exportTimestamp: Date.now(),
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import offline data from backup
   */
  async importOfflineData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData)

      // Validate import data
      if (!importData.exportTimestamp) {
        throw new Error('Invalid import data format')
      }

      // Import documents
      this.storage.documents = new Map(importData.documents || [])
      this.storage.drafts = new Map(importData.drafts || [])

      // Import queue operations
      this.storage.queue = importData.queue || []
      this.syncQueue.operations = [...this.storage.queue]

      // Update metadata
      this.storage.metadata = {
        ...this.storage.metadata,
        ...importData.metadata,
      }

      this.updateQueueStats()
      this.saveToLocalStorage()
      this.emit('dataImported', { timestamp: importData.exportTimestamp })
    } catch (error) {
      console.error('Failed to import offline data:', error)
      throw new Error('Failed to import offline data: Invalid format')
    }
  }

  // Utility methods

  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'critical':
        return 1
      case 'high':
        return 2
      case 'medium':
        return 3
      case 'low':
        return 4
      default:
        return 5
    }
  }

  private groupOperationsByPriority(
    operations: OfflineOperation[]
  ): Map<string, OfflineOperation[]> {
    const groups = new Map<string, OfflineOperation[]>()

    for (const op of operations) {
      const priority = op.metadata.priority
      if (!groups.has(priority)) {
        groups.set(priority, [])
      }
      groups.get(priority)!.push(op)
    }

    return groups
  }

  private batchOperations(
    operations: OfflineOperation[],
    batchSize: number
  ): OfflineOperation[][] {
    const batches: OfflineOperation[][] = []

    for (let i = 0; i < operations.length; i += batchSize) {
      batches.push(operations.slice(i, i + batchSize))
    }

    return batches
  }

  private cleanupSyncedOperations(): void {
    this.syncQueue.operations = this.syncQueue.operations.filter(
      op => op.status !== 'synced'
    )
    this.storage.queue = this.storage.queue.filter(op => op.status !== 'synced')
  }

  private updateQueueStats(): void {
    const ops = this.syncQueue.operations
    this.syncQueue.totalPendingOps = ops.filter(
      op => op.status === 'pending'
    ).length
    this.syncQueue.failedOps = ops.filter(op => op.status === 'failed').length
    this.syncQueue.conflictOps = ops.filter(
      op => op.status === 'conflict'
    ).length
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.totalPendingOps > 0) {
        this.triggerSync()
      }
    }, 300000) // 5 minutes

    // Heartbeat to detect online status
    this.heartBeatInterval = setInterval(() => {
      this.checkOnlineStatus()
    }, 30000) // 30 seconds
  }

  private async checkOnlineStatus(): Promise<void> {
    try {
      // Try to fetch a small resource to check connectivity
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      })

      const wasOnline = this.isOnline
      this.isOnline = response.ok

      if (!wasOnline && this.isOnline) {
        this.storage.metadata.syncStatus = 'online'
        this.storage.metadata.lastOnlineTime = Date.now()
        this.emit('online')
        this.triggerSync()
      }
    } catch (error) {
      this.isOnline = false
      this.storage.metadata.syncStatus = 'offline'
    }
  }

  private saveToLocalStorage(): void {
    try {
      const data = {
        documents: Array.from(this.storage.documents.entries()),
        drafts: Array.from(this.storage.drafts.entries()),
        queue: this.storage.queue,
        metadata: this.storage.metadata,
        syncQueue: {
          lastSyncTime: this.syncQueue.lastSyncTime,
          totalPendingOps: this.syncQueue.totalPendingOps,
          failedOps: this.syncQueue.failedOps,
          conflictOps: this.syncQueue.conflictOps,
        },
      }

      localStorage.setItem('synccore-offline-data', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('synccore-offline-data')
      if (data) {
        const parsed = JSON.parse(data)

        this.storage.documents = new Map(parsed.documents || [])
        this.storage.drafts = new Map(parsed.drafts || [])
        this.storage.queue = parsed.queue || []
        this.storage.metadata = { ...this.storage.metadata, ...parsed.metadata }

        if (parsed.syncQueue) {
          this.syncQueue = { ...this.syncQueue, ...parsed.syncQueue }
        }

        this.syncQueue.operations = [...this.storage.queue]
        this.updateQueueStats()
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Event system
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    if (this.heartBeatInterval) {
      clearInterval(this.heartBeatInterval)
    }

    this.saveToLocalStorage()
    this.eventListeners.clear()
  }
}

export const offlineService = new OfflineService()
export default offlineService
