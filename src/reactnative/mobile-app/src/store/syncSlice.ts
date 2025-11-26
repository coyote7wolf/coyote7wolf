import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {SyncOperation, ConflictResolution} from '../types'

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingOperations: SyncOperation[]
  conflicts: SyncOperation[]
  syncProgress: number
  error: string | null
}

const initialState: SyncState = {
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  pendingOperations: [],
  conflicts: [],
  syncProgress: 0,
  error: null,
}

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    syncStart: state => {
      state.isSyncing = true
      state.syncProgress = 0
      state.error = null
    },
    syncProgress: (state, action: PayloadAction<number>) => {
      state.syncProgress = action.payload
    },
    syncSuccess: (state, action: PayloadAction<number>) => {
      state.isSyncing = false
      state.lastSyncTime = action.payload
      state.pendingOperations = []
      state.syncProgress = 100
      state.error = null
    },
    syncFailure: (state, action: PayloadAction<string>) => {
      state.isSyncing = false
      state.syncProgress = 0
      state.error = action.payload
    },
    addPendingOperation: (state, action: PayloadAction<SyncOperation>) => {
      state.pendingOperations.push(action.payload)
    },
    removePendingOperation: (state, action: PayloadAction<string>) => {
      state.pendingOperations = state.pendingOperations.filter(
        op => op.id !== action.payload,
      )
    },
    addConflict: (state, action: PayloadAction<SyncOperation>) => {
      state.conflicts.push(action.payload)
    },
    resolveConflict: (state, action: PayloadAction<ConflictResolution>) => {
      state.conflicts = state.conflicts.filter(
        conflict => conflict.id !== action.payload.operationId,
      )
    },
    clearError: state => {
      state.error = null
    },
  },
})

export const {
  setOnlineStatus,
  syncStart,
  syncProgress,
  syncSuccess,
  syncFailure,
  addPendingOperation,
  removePendingOperation,
  addConflict,
  resolveConflict,
  clearError,
} = syncSlice.actions

export default syncSlice.reducer
