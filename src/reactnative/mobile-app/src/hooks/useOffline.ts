import {useEffect, useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch} from '../store'
import {
  initializeOfflineService,
  syncPendingChanges,
  saveDocumentOffline,
  loadLocalDocuments,
  deleteDocumentOffline,
  searchDocumentsOffline,
  forceSyncDocument,
  updateOfflineState,
  selectOfflineState,
  selectIsOnline,
  selectLocalDocuments,
  selectPendingSyncCount,
  selectSyncInProgress,
} from '../store/offlineSlice'
import {offlineService} from '../services/offlineService'
import {Document} from '../types'

export const useOffline = () => {
  const dispatch = useDispatch<AppDispatch>()
  const offlineState = useSelector(selectOfflineState)
  const isOnline = useSelector(selectIsOnline)
  const localDocuments = useSelector(selectLocalDocuments)
  const pendingSyncCount = useSelector(selectPendingSyncCount)
  const syncInProgress = useSelector(selectSyncInProgress)

  // Initialize offline service
  useEffect(() => {
    dispatch(initializeOfflineService())

    // Setup offline state listener
    const handleStateUpdate = (state: any) => {
      dispatch(updateOfflineState(state))
    }

    offlineService.addStateListener(handleStateUpdate)

    return () => {
      offlineService.removeStateListener(handleStateUpdate)
    }
  }, [dispatch])

  // Auto sync when coming online and have pending changes
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0 && !syncInProgress) {
      const timer = setTimeout(() => {
        dispatch(syncPendingChanges())
      }, 2000) // Wait 2 seconds after coming online

      return () => clearTimeout(timer)
    }
  }, [dispatch, isOnline, pendingSyncCount, syncInProgress])

  // Document operations
  const saveDocument = useCallback(
    async (document: Document) => {
      try {
        await dispatch(saveDocumentOffline(document)).unwrap()
        return true
      } catch (error) {
        console.error('Failed to save document offline:', error)
        return false
      }
    },
    [dispatch],
  )

  const loadDocuments = useCallback(async () => {
    try {
      await dispatch(loadLocalDocuments()).unwrap()
      return true
    } catch (error) {
      console.error('Failed to load documents:', error)
      return false
    }
  }, [dispatch])

  const deleteDocument = useCallback(
    async (documentId: string) => {
      try {
        await dispatch(deleteDocumentOffline(documentId)).unwrap()
        return true
      } catch (error) {
        console.error('Failed to delete document:', error)
        return false
      }
    },
    [dispatch],
  )

  const searchDocuments = useCallback(
    async (searchTerm: string) => {
      try {
        const results = await dispatch(
          searchDocumentsOffline(searchTerm),
        ).unwrap()
        return results
      } catch (error) {
        console.error('Failed to search documents:', error)
        return []
      }
    },
    [dispatch],
  )

  // Sync operations
  const manualSync = useCallback(async () => {
    if (!isOnline) {
      return false
    }

    try {
      await dispatch(syncPendingChanges()).unwrap()
      return true
    } catch (error) {
      console.error('Manual sync failed:', error)
      return false
    }
  }, [dispatch, isOnline])

  const forceSyncSpecificDocument = useCallback(
    async (documentId: string) => {
      if (!isOnline) {
        return false
      }

      try {
        await dispatch(forceSyncDocument(documentId)).unwrap()
        return true
      } catch (error) {
        console.error('Force sync failed:', error)
        return false
      }
    },
    [dispatch, isOnline],
  )

  // Utility functions
  const canSyncLargeFiles = useCallback(async () => {
    return await offlineService.canSyncLargeFiles()
  }, [])

  const getConnectionType = useCallback(() => {
    return offlineService.getConnectionType()
  }, [])

  const formatSyncStatus = useCallback(() => {
    if (syncInProgress) {
      return '正在同步...'
    }

    if (!isOnline) {
      return '離線模式'
    }

    if (pendingSyncCount > 0) {
      return `${pendingSyncCount} 個檔案待同步`
    }

    return '已同步'
  }, [isOnline, pendingSyncCount, syncInProgress])

  const getSyncProgress = useCallback(() => {
    return {
      isOnline,
      pendingSyncCount,
      syncInProgress,
      lastSyncTime: offlineState.lastSyncTime,
      connectionType: offlineState.connectionType,
    }
  }, [
    isOnline,
    pendingSyncCount,
    syncInProgress,
    offlineState.lastSyncTime,
    offlineState.connectionType,
  ])

  // Check if document has local changes
  const hasLocalChanges = useCallback(
    (_documentId: string) => {
      // This would check if the document has unsaved/unsynced changes
      return pendingSyncCount > 0 // Simplified check
    },
    [pendingSyncCount],
  )

  return {
    // State
    isOnline,
    localDocuments,
    offlineState,
    pendingSyncCount,
    syncInProgress,

    // Document operations
    saveDocument,
    loadDocuments,
    deleteDocument,
    searchDocuments,

    // Sync operations
    manualSync,
    forceSyncSpecificDocument,

    // Utility functions
    canSyncLargeFiles,
    getConnectionType,
    formatSyncStatus,
    getSyncProgress,
    hasLocalChanges,
  }
}

export default useOffline
