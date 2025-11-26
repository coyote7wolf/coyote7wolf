import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit'
import {
  collaborationService,
  CursorPosition,
  DocumentOperation,
} from '../services/collaborationService'

export interface CollaborationUser {
  id: string
  name: string
  color: string
  isOnline: boolean
  lastActive: number
}

export interface CollaborationState {
  isConnected: boolean
  currentDocumentId: string | null
  activeUsers: CollaborationUser[]
  cursors: CursorPosition[]
  pendingOperations: DocumentOperation[]
  conflicts: Array<{
    id: string
    operation: DocumentOperation
    conflictWith: DocumentOperation
    timestamp: number
  }>
  isJoiningDocument: boolean
  error: string | null
}

const initialState: CollaborationState = {
  isConnected: false,
  currentDocumentId: null,
  activeUsers: [],
  cursors: [],
  pendingOperations: [],
  conflicts: [],
  isJoiningDocument: false,
  error: null,
}

// Async thunks
export const connectToCollaboration = createAsyncThunk(
  'collaboration/connect',
  async (serverUrl?: string) => {
    const isConnected = await collaborationService.connect(serverUrl)
    return {isConnected}
  },
)

export const joinDocument = createAsyncThunk(
  'collaboration/joinDocument',
  async (documentId: string) => {
    const success = await collaborationService.joinDocument(documentId)
    if (success) {
      return {documentId}
    }
    throw new Error('Failed to join document')
  },
)

export const sendOperation = createAsyncThunk(
  'collaboration/sendOperation',
  async (operation: Omit<DocumentOperation, 'userId' | 'timestamp'>) => {
    const fullOperation: DocumentOperation = {
      ...operation,
      userId: 'current-user', // In real app, get from auth state
      timestamp: Date.now(),
    }
    collaborationService.sendOperation(fullOperation)
    return fullOperation
  },
)

export const sendCursorUpdate = createAsyncThunk(
  'collaboration/sendCursorUpdate',
  async (payload: {
    position: number
    selection?: {start: number; end: number}
  }) => {
    collaborationService.sendCursorUpdate(payload.position, payload.selection)
    return payload
  },
)

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    // Real-time event handlers
    documentUpdateReceived: (
      state,
      action: PayloadAction<{
        operation: DocumentOperation
        user: {id: string; name: string; color: string}
      }>,
    ) => {
      const {operation, user} = action.payload

      // Add to pending operations if not from current user
      if (operation.userId !== 'current-user') {
        state.pendingOperations.push(operation)
      }

      // Update user activity
      const existingUser = state.activeUsers.find(u => u.id === user.id)
      if (existingUser) {
        existingUser.lastActive = Date.now()
        existingUser.isOnline = true
      } else {
        state.activeUsers.push({
          id: user.id,
          name: user.name,
          color: user.color,
          isOnline: true,
          lastActive: Date.now(),
        })
      }
    },

    cursorUpdateReceived: (
      state,
      action: PayloadAction<{cursor: CursorPosition}>,
    ) => {
      const {cursor} = action.payload

      // Update cursor position
      const existingCursorIndex = state.cursors.findIndex(
        c => c.userId === cursor.userId,
      )

      if (existingCursorIndex >= 0) {
        state.cursors[existingCursorIndex] = cursor
      } else {
        state.cursors.push(cursor)
      }
    },

    userJoined: (
      state,
      action: PayloadAction<{userId: string; userName: string}>,
    ) => {
      const {userId, userName} = action.payload
      const existingUser = state.activeUsers.find(u => u.id === userId)

      if (!existingUser) {
        state.activeUsers.push({
          id: userId,
          name: userName,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
          isOnline: true,
          lastActive: Date.now(),
        })
      } else {
        existingUser.isOnline = true
        existingUser.lastActive = Date.now()
      }
    },

    userLeft: (state, action: PayloadAction<{userId: string}>) => {
      const {userId} = action.payload

      // Mark user as offline
      const user = state.activeUsers.find(u => u.id === userId)
      if (user) {
        user.isOnline = false
      }

      // Remove cursor
      state.cursors = state.cursors.filter(c => c.userId !== userId)
    },

    conflictDetected: (
      state,
      action: PayloadAction<{
        operation: DocumentOperation
        conflictWith: DocumentOperation
      }>,
    ) => {
      const {operation, conflictWith} = action.payload
      state.conflicts.push({
        id: `conflict-${Date.now()}`,
        operation,
        conflictWith,
        timestamp: Date.now(),
      })
    },

    conflictResolved: (
      state,
      action: PayloadAction<{
        conflictId: string
        resolvedOperation: DocumentOperation
      }>,
    ) => {
      const {conflictId} = action.payload
      state.conflicts = state.conflicts.filter(c => c.id !== conflictId)
    },

    operationAcknowledged: (
      state,
      action: PayloadAction<{operationId: string}>,
    ) => {
      // Remove from pending operations when acknowledged by server
      const {operationId} = action.payload
      state.pendingOperations = state.pendingOperations.filter(
        op => `${op.timestamp}-${op.userId}` !== operationId,
      )
    },

    leaveDocument: state => {
      collaborationService.leaveDocument()
      state.currentDocumentId = null
      state.activeUsers = []
      state.cursors = []
      state.pendingOperations = []
      state.conflicts = []
    },

    disconnect: state => {
      collaborationService.disconnect()
      state.isConnected = false
      state.currentDocumentId = null
      state.activeUsers = []
      state.cursors = []
      state.pendingOperations = []
      state.conflicts = []
    },

    clearError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // Connect
      .addCase(connectToCollaboration.pending, state => {
        state.error = null
      })
      .addCase(connectToCollaboration.fulfilled, (state, action) => {
        state.isConnected = action.payload.isConnected
        state.error = null
      })
      .addCase(connectToCollaboration.rejected, (state, action) => {
        state.isConnected = false
        state.error = action.error.message || 'Connection failed'
      })

      // Join document
      .addCase(joinDocument.pending, state => {
        state.isJoiningDocument = true
        state.error = null
      })
      .addCase(joinDocument.fulfilled, (state, action) => {
        state.isJoiningDocument = false
        state.currentDocumentId = action.payload.documentId
        state.error = null
      })
      .addCase(joinDocument.rejected, (state, action) => {
        state.isJoiningDocument = false
        state.error = action.error.message || 'Failed to join document'
      })

      // Send operation
      .addCase(sendOperation.fulfilled, (state, action) => {
        // Add to pending operations
        state.pendingOperations.push(action.payload)
      })
      .addCase(sendOperation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to send operation'
      })

      // Send cursor update
      .addCase(sendCursorUpdate.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to send cursor update'
      })
  },
})

export const {
  documentUpdateReceived,
  cursorUpdateReceived,
  userJoined,
  userLeft,
  conflictDetected,
  conflictResolved,
  operationAcknowledged,
  leaveDocument,
  disconnect,
  clearError,
} = collaborationSlice.actions

export default collaborationSlice.reducer

// Selectors
export const selectCollaborationState = (state: {
  collaboration: CollaborationState
}) => state.collaboration

export const selectIsConnected = (state: {collaboration: CollaborationState}) =>
  state.collaboration.isConnected

export const selectActiveUsers = (state: {collaboration: CollaborationState}) =>
  state.collaboration.activeUsers.filter(user => user.isOnline)

export const selectCursors = (state: {collaboration: CollaborationState}) =>
  state.collaboration.cursors

export const selectPendingOperations = (state: {
  collaboration: CollaborationState
}) => state.collaboration.pendingOperations

export const selectConflicts = (state: {collaboration: CollaborationState}) =>
  state.collaboration.conflicts

export const selectCurrentDocumentId = (state: {
  collaboration: CollaborationState
}) => state.collaboration.currentDocumentId
