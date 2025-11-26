import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit'
import {
  offlineService,
  OfflineState,
  SyncResult,
} from '../services/offlineService'
import {databaseService} from '../services/databaseService'
import {Document} from '../types'

export interface OfflineSliceState extends OfflineState {
  syncResult: SyncResult | null
  lastError: string | null
  localDocuments: Document[]
  isInitialized: boolean
}

const initialState: OfflineSliceState = {
  isConnected: true,
  isOnline: true,
  connectionType: null,
  lastSyncTime: null,
  pendingSyncCount: 0,
  syncInProgress: false,
  syncResult: null,
  lastError: null,
  localDocuments: [],
  isInitialized: false,
}

// Async thunks
export const initializeOfflineService = createAsyncThunk(
  'offline/initialize',
  async () => {
    const state = await offlineService.getOfflineState()
    const documents = await databaseService.getAllDocuments()
    return {state, documents}
  },
)

export const syncPendingChanges = createAsyncThunk(
  'offline/syncPendingChanges',
  async () => {
    const result = await offlineService.syncPendingChanges()
    return result
  },
)

export const saveDocumentOffline = createAsyncThunk(
  'offline/saveDocument',
  async (document: Document) => {
    await databaseService.saveDocument(document)
    const allDocuments = await databaseService.getAllDocuments()
    return allDocuments
  },
)

export const loadLocalDocuments = createAsyncThunk(
  'offline/loadDocuments',
  async () => {
    const documents = await databaseService.getAllDocuments()
    return documents
  },
)

export const deleteDocumentOffline = createAsyncThunk(
  'offline/deleteDocument',
  async (documentId: string) => {
    await databaseService.deleteDocument(documentId)
    const allDocuments = await databaseService.getAllDocuments()
    return allDocuments
  },
)

export const searchDocumentsOffline = createAsyncThunk(
  'offline/searchDocuments',
  async (searchTerm: string) => {
    const documents = await databaseService.searchDocuments(searchTerm)
    return documents
  },
)

export const forceSyncDocument = createAsyncThunk(
  'offline/forceSyncDocument',
  async (documentId: string) => {
    const success = await offlineService.forceSyncDocument(documentId)
    if (success) {
      const state = await offlineService.getOfflineState()
      return state
    }
    throw new Error('Force sync failed')
  },
)

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    updateOfflineState: (state, action: PayloadAction<OfflineState>) => {
      const offlineState = action.payload
      state.isConnected = offlineState.isConnected
      state.isOnline = offlineState.isOnline
      state.connectionType = offlineState.connectionType
      state.lastSyncTime = offlineState.lastSyncTime
      state.pendingSyncCount = offlineState.pendingSyncCount
      state.syncInProgress = offlineState.syncInProgress
    },

    clearSyncResult: state => {
      state.syncResult = null
    },

    clearError: state => {
      state.lastError = null
    },

    setError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload
    },

    updateDocument: (state, action: PayloadAction<Document>) => {
      const document = action.payload
      const index = state.localDocuments.findIndex(
        doc => doc.id === document.id,
      )

      if (index >= 0) {
        state.localDocuments[index] = document
      } else {
        state.localDocuments.unshift(document)
      }
    },

    removeDocument: (state, action: PayloadAction<string>) => {
      const documentId = action.payload
      state.localDocuments = state.localDocuments.filter(
        doc => doc.id !== documentId,
      )
    },
  },
  extraReducers: builder => {
    builder
      // Initialize
      .addCase(initializeOfflineService.pending, state => {
        state.isInitialized = false
        state.lastError = null
      })
      .addCase(initializeOfflineService.fulfilled, (state, action) => {
        const {state: offlineState, documents} = action.payload
        state.isConnected = offlineState.isConnected
        state.isOnline = offlineState.isOnline
        state.connectionType = offlineState.connectionType
        state.lastSyncTime = offlineState.lastSyncTime
        state.pendingSyncCount = offlineState.pendingSyncCount
        state.syncInProgress = offlineState.syncInProgress
        state.localDocuments = documents
        state.isInitialized = true
        state.lastError = null
      })
      .addCase(initializeOfflineService.rejected, (state, action) => {
        state.lastError =
          action.error.message || 'Failed to initialize offline service'
      })

      // Sync pending changes
      .addCase(syncPendingChanges.pending, state => {
        state.syncInProgress = true
        state.lastError = null
      })
      .addCase(syncPendingChanges.fulfilled, (state, action) => {
        state.syncResult = action.payload
        state.syncInProgress = false
        state.pendingSyncCount = 0
        state.lastSyncTime = Date.now()
        state.lastError = null
      })
      .addCase(syncPendingChanges.rejected, (state, action) => {
        state.syncInProgress = false
        state.lastError = action.error.message || 'Sync failed'
      })

      // Save document offline
      .addCase(saveDocumentOffline.fulfilled, (state, action) => {
        state.localDocuments = action.payload
        state.pendingSyncCount += 1
      })
      .addCase(saveDocumentOffline.rejected, (state, action) => {
        state.lastError = action.error.message || 'Failed to save document'
      })

      // Load local documents
      .addCase(loadLocalDocuments.fulfilled, (state, action) => {
        state.localDocuments = action.payload
      })
      .addCase(loadLocalDocuments.rejected, (state, action) => {
        state.lastError = action.error.message || 'Failed to load documents'
      })

      // Delete document offline
      .addCase(deleteDocumentOffline.fulfilled, (state, action) => {
        state.localDocuments = action.payload
        state.pendingSyncCount += 1
      })
      .addCase(deleteDocumentOffline.rejected, (state, action) => {
        state.lastError = action.error.message || 'Failed to delete document'
      })

      // Search documents offline
      .addCase(searchDocumentsOffline.fulfilled, (_state, _action) => {
        // Don't replace all documents, this is just search results
        // The search results are returned and used by the component
      })
      .addCase(searchDocumentsOffline.rejected, (state, action) => {
        state.lastError = action.error.message || 'Failed to search documents'
      })

      // Force sync document
      .addCase(forceSyncDocument.pending, state => {
        state.lastError = null
      })
      .addCase(forceSyncDocument.fulfilled, (state, action) => {
        const offlineState = action.payload
        state.pendingSyncCount = offlineState.pendingSyncCount
        state.lastSyncTime = offlineState.lastSyncTime
      })
      .addCase(forceSyncDocument.rejected, (state, action) => {
        state.lastError = action.error.message || 'Force sync failed'
      })
  },
})

export const {
  updateOfflineState,
  clearSyncResult,
  clearError,
  setError,
  updateDocument,
  removeDocument,
} = offlineSlice.actions

export default offlineSlice.reducer

// Selectors
export const selectOfflineState = (state: {offline: OfflineSliceState}) =>
  state.offline

export const selectIsOnline = (state: {offline: OfflineSliceState}) =>
  state.offline.isOnline

export const selectConnectionType = (state: {offline: OfflineSliceState}) =>
  state.offline.connectionType

export const selectSyncInProgress = (state: {offline: OfflineSliceState}) =>
  state.offline.syncInProgress

export const selectPendingSyncCount = (state: {offline: OfflineSliceState}) =>
  state.offline.pendingSyncCount

export const selectLastSyncTime = (state: {offline: OfflineSliceState}) =>
  state.offline.lastSyncTime

export const selectLocalDocuments = (state: {offline: OfflineSliceState}) =>
  state.offline.localDocuments

export const selectSyncResult = (state: {offline: OfflineSliceState}) =>
  state.offline.syncResult

export const selectOfflineError = (state: {offline: OfflineSliceState}) =>
  state.offline.lastError

export const selectIsInitialized = (state: {offline: OfflineSliceState}) =>
  state.offline.isInitialized
