/**
 * Offline Support Hook
 *
 * React hook for integrating offline editing capabilities
 * with document components and sync management.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  offlineService,
  OfflineOperation,
  SyncQueue,
  SyncResult,
  OfflineStorage,
} from '@/services/offline'

export interface UseOfflineOptions {
  documentId: string
  userId: string
  enableAutoSync?: boolean
  syncInterval?: number
  maxRetries?: number
}

export interface OfflineHookResult {
  // Connection state
  isOnline: boolean
  syncStatus: 'online' | 'offline' | 'syncing'

  // Queue management
  syncQueue: SyncQueue
  pendingOperations: number

  // Document operations
  saveOffline: (documentId: string, document: any) => Promise<void>
  getOfflineDocument: (documentId: string) => any | null

  // Sync operations
  triggerSync: () => Promise<SyncResult>
  retryOperation: (operationId: string) => Promise<void>
  cancelOperation: (operationId: string) => void
  resolveConflict: (
    operationId: string,
    resolution: 'local' | 'remote' | 'merge'
  ) => Promise<void>

  // Queue operations
  queueOperation: (
    operation: Omit<
      OfflineOperation,
      'id' | 'timestamp' | 'retryCount' | 'status'
    >
  ) => Promise<string>

  // Storage management
  storageInfo: OfflineStorage['metadata'] & {
    documentsCount: number
    queueSize: number
  }
  clearOfflineData: () => Promise<void>
  exportData: () => string
  importData: (jsonData: string) => Promise<void>

  // Statistics
  stats: {
    totalOperations: number
    syncedOperations: number
    failedOperations: number
    conflictOperations: number
    lastSyncTime: number | null
    syncSuccessRate: number
    averageSyncTime: number
  }

  // Event handlers
  onSync: ((result: SyncResult) => void) | undefined
  onConflict:
    | ((operation: OfflineOperation, serverData: any) => void)
    | undefined
  onError: ((error: string) => void) | undefined
}

export function useOffline(options: UseOfflineOptions): OfflineHookResult {
  const {
    documentId,
    userId,
    enableAutoSync = true,
    syncInterval = 300000, // 5 minutes
    maxRetries = 3,
  } = options

  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<
    'online' | 'offline' | 'syncing'
  >('online')
  const [syncQueue, setSyncQueue] = useState<SyncQueue>({
    operations: [],
    lastSyncTime: 0,
    syncInProgress: false,
    totalPendingOps: 0,
    failedOps: 0,
    conflictOps: 0,
  })
  const [storageInfo, setStorageInfo] = useState(
    offlineService.getStorageInfo()
  )
  const [stats, setStats] = useState({
    totalOperations: 0,
    syncedOperations: 0,
    failedOperations: 0,
    conflictOperations: 0,
    lastSyncTime: null as number | null,
    syncSuccessRate: 0,
    averageSyncTime: 0,
  })

  // Event handlers refs
  const [onSync, setOnSync] = useState<
    ((result: SyncResult) => void) | undefined
  >()
  const [onConflict, setOnConflict] = useState<
    ((operation: OfflineOperation, serverData: any) => void) | undefined
  >()
  const [onError, setOnError] = useState<
    ((error: string) => void) | undefined
  >()

  // Update sync queue and storage info
  const updateStatus = useCallback(() => {
    const queue = offlineService.getSyncStatus()
    const storage = offlineService.getStorageInfo()

    setSyncQueue(queue)
    setStorageInfo(storage)

    // Update stats
    setStats(prev => ({
      ...prev,
      totalOperations: queue.operations.length,
      failedOperations: queue.failedOps,
      conflictOperations: queue.conflictOps,
      lastSyncTime: queue.lastSyncTime || prev.lastSyncTime,
      syncSuccessRate:
        queue.operations.length > 0
          ? ((queue.operations.length - queue.failedOps - queue.conflictOps) /
              queue.operations.length) *
            100
          : 100,
    }))
  }, [])

  // Document operations
  const saveOffline = useCallback(
    async (docId: string, document: any) => {
      try {
        await offlineService.storeDocumentOffline(docId, document)
        updateStatus()
      } catch (error) {
        console.error('Failed to save document offline:', error)
        onError?.(
          error instanceof Error ? error.message : 'Failed to save offline'
        )
      }
    },
    [onError, updateStatus]
  )

  const getOfflineDocument = useCallback((docId: string) => {
    return offlineService.getOfflineDocument(docId)
  }, [])

  // Queue operation
  const queueOperation = useCallback(
    async (
      operation: Omit<
        OfflineOperation,
        'id' | 'timestamp' | 'retryCount' | 'status'
      >
    ) => {
      try {
        const operationId = await offlineService.queueOperation({
          ...operation,
          maxRetries: operation.maxRetries || maxRetries,
          metadata: {
            ...operation.metadata,
            priority: operation.metadata?.priority || 'medium',
          },
        })

        updateStatus()
        return operationId
      } catch (error) {
        console.error('Failed to queue operation:', error)
        onError?.(
          error instanceof Error ? error.message : 'Failed to queue operation'
        )
        throw error
      }
    },
    [maxRetries, onError, updateStatus]
  )

  // Sync operations
  const triggerSync = useCallback(async () => {
    try {
      setSyncStatus('syncing')
      const result = await offlineService.triggerSync()

      updateStatus()
      onSync?.(result)

      return result
    } catch (error) {
      console.error('Sync failed:', error)
      onError?.(error instanceof Error ? error.message : 'Sync failed')
      throw error
    } finally {
      setSyncStatus(isOnline ? 'online' : 'offline')
    }
  }, [isOnline, onSync, onError, updateStatus])

  const retryOperation = useCallback(
    async (operationId: string) => {
      try {
        // Find the operation and reset its status
        const operation = syncQueue.operations.find(op => op.id === operationId)
        if (operation) {
          operation.status = 'pending'
          operation.retryCount = 0

          // Trigger sync to retry the operation
          await triggerSync()
        }
      } catch (error) {
        console.error('Failed to retry operation:', error)
        onError?.(
          error instanceof Error ? error.message : 'Failed to retry operation'
        )
      }
    },
    [syncQueue.operations, triggerSync, onError]
  )

  const cancelOperation = useCallback(
    (operationId: string) => {
      try {
        // Remove operation from queue
        const updatedOperations = syncQueue.operations.filter(
          op => op.id !== operationId
        )
        setSyncQueue(prev => ({
          ...prev,
          operations: updatedOperations,
          totalPendingOps: updatedOperations.filter(
            op => op.status === 'pending'
          ).length,
        }))

        updateStatus()
      } catch (error) {
        console.error('Failed to cancel operation:', error)
        onError?.(
          error instanceof Error ? error.message : 'Failed to cancel operation'
        )
      }
    },
    [syncQueue.operations, onError, updateStatus]
  )

  const resolveConflict = useCallback(
    async (operationId: string, resolution: 'local' | 'remote' | 'merge') => {
      try {
        const operation = syncQueue.operations.find(op => op.id === operationId)
        if (!operation) return

        switch (resolution) {
          case 'local':
            // Keep local changes, mark as pending for retry
            operation.status = 'pending'
            operation.retryCount = 0
            break

          case 'remote':
            // Accept remote changes, mark as synced
            operation.status = 'synced'
            break

          case 'merge':
            // Attempt merge, mark as pending for retry
            operation.status = 'pending'
            operation.retryCount = 0
            // Note: In a real implementation, you would perform the actual merge here
            break
        }

        updateStatus()

        if (resolution !== 'remote') {
          await triggerSync()
        }
      } catch (error) {
        console.error('Failed to resolve conflict:', error)
        onError?.(
          error instanceof Error ? error.message : 'Failed to resolve conflict'
        )
      }
    },
    [syncQueue.operations, onError, updateStatus, triggerSync]
  )

  // Storage management
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineService.clearOfflineData()
      updateStatus()
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to clear data')
    }
  }, [onError, updateStatus])

  const exportData = useCallback(() => {
    try {
      return offlineService.exportOfflineData()
    } catch (error) {
      console.error('Failed to export data:', error)
      onError?.(
        error instanceof Error ? error.message : 'Failed to export data'
      )
      return ''
    }
  }, [onError])

  const importData = useCallback(
    async (jsonData: string) => {
      try {
        await offlineService.importOfflineData(jsonData)
        updateStatus()
      } catch (error) {
        console.error('Failed to import data:', error)
        onError?.(
          error instanceof Error ? error.message : 'Failed to import data'
        )
        throw error
      }
    },
    [onError, updateStatus]
  )

  // Setup event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('online')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('offline')
    }

    const handleSyncStarted = () => {
      setSyncStatus('syncing')
    }

    const handleSyncCompleted = (result: SyncResult) => {
      setSyncStatus('online')
      updateStatus()
      onSync?.(result)
    }

    const handleSyncFailed = (result: SyncResult) => {
      setSyncStatus(isOnline ? 'online' : 'offline')
      updateStatus()
      onError?.(`Sync failed: ${result.errors.join(', ')}`)
    }

    const handleConflictDetected = (data: {
      operation: OfflineOperation
      serverData: any
    }) => {
      updateStatus()
      onConflict?.(data.operation, data.serverData)
    }

    const handleOperationQueued = () => {
      updateStatus()
    }

    // Register event listeners
    offlineService.on('online', handleOnline)
    offlineService.on('offline', handleOffline)
    offlineService.on('syncStarted', handleSyncStarted)
    offlineService.on('syncCompleted', handleSyncCompleted)
    offlineService.on('syncFailed', handleSyncFailed)
    offlineService.on('conflictDetected', handleConflictDetected)
    offlineService.on('operationQueued', handleOperationQueued)

    // Initial status update
    updateStatus()

    return () => {
      offlineService.off('online', handleOnline)
      offlineService.off('offline', handleOffline)
      offlineService.off('syncStarted', handleSyncStarted)
      offlineService.off('syncCompleted', handleSyncCompleted)
      offlineService.off('syncFailed', handleSyncFailed)
      offlineService.off('conflictDetected', handleConflictDetected)
      offlineService.off('operationQueued', handleOperationQueued)
    }
  }, [isOnline, onSync, onConflict, onError, updateStatus])

  // Auto-sync when online and enabled
  useEffect(() => {
    if (!enableAutoSync || !isOnline || syncQueue.totalPendingOps === 0) {
      return
    }

    const interval = setInterval(() => {
      if (syncQueue.totalPendingOps > 0 && !syncQueue.syncInProgress) {
        triggerSync()
      }
    }, syncInterval)

    return () => clearInterval(interval)
  }, [
    enableAutoSync,
    isOnline,
    syncQueue.totalPendingOps,
    syncQueue.syncInProgress,
    syncInterval,
    triggerSync,
  ])

  // Calculate pending operations
  const pendingOperations = syncQueue.operations.filter(
    op =>
      op.status === 'pending' ||
      op.status === 'failed' ||
      op.status === 'conflict'
  ).length

  return {
    // Connection state
    isOnline,
    syncStatus,

    // Queue management
    syncQueue,
    pendingOperations,

    // Document operations
    saveOffline,
    getOfflineDocument,

    // Sync operations
    triggerSync,
    retryOperation,
    cancelOperation,
    resolveConflict,

    // Queue operations
    queueOperation,

    // Storage management
    storageInfo,
    clearOfflineData,
    exportData,
    importData,

    // Statistics
    stats,

    // Event handlers
    onSync,
    onConflict,
    onError,
  }
}

// Additional hook for offline document management
export function useOfflineDocuments() {
  const [documents, setDocuments] = useState<
    Array<{
      id: string
      title: string
      lastModified: number
      size: number
    }>
  >([])

  const refreshDocuments = useCallback(() => {
    // In a real implementation, you would get this from the offline service
    const mockDocuments = [
      {
        id: 'doc1',
        title: 'Meeting Notes - Q4 Planning',
        lastModified: Date.now() - 3600000,
        size: 2048,
      },
      {
        id: 'doc2',
        title: 'Project Proposal Draft',
        lastModified: Date.now() - 7200000,
        size: 4096,
      },
      {
        id: 'doc3',
        title: 'Weekly Report',
        lastModified: Date.now() - 86400000,
        size: 1024,
      },
    ]

    setDocuments(mockDocuments)
  }, [])

  useEffect(() => {
    refreshDocuments()

    // Listen for document storage events
    const handleDocumentStored = () => {
      refreshDocuments()
    }

    offlineService.on('documentStored', handleDocumentStored)

    return () => {
      offlineService.off('documentStored', handleDocumentStored)
    }
  }, [refreshDocuments])

  const deleteDocument = useCallback((documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }, [])

  const exportDocument = useCallback((documentId: string) => {
    const document = offlineService.getOfflineDocument(documentId)
    if (document) {
      const dataStr = JSON.stringify(document, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `document-${documentId}.json`
      link.click()

      URL.revokeObjectURL(url)
    }
  }, [])

  return {
    documents,
    refreshDocuments,
    deleteDocument,
    exportDocument,
  }
}

export default useOffline
