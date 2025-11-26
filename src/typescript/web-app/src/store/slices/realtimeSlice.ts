import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * WebSocket 連接狀態
 */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

/**
 * 實時事件類型
 */
export type RealtimeEventType =
  | 'document_update'
  | 'cursor_move'
  | 'user_join'
  | 'user_leave'
  | 'comment_add'
  | 'comment_update'
  | 'comment_delete'
  | 'permission_change'
  | 'document_lock'
  | 'document_unlock'

/**
 * 實時事件
 */
export interface RealtimeEvent {
  id: string
  type: RealtimeEventType
  timestamp: number
  userId: string
  userName: string
  documentId?: string
  data: any
}

/**
 * 用戶狀態
 */
export interface UserPresence {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: number
  currentDocument?: string
  cursor?: {
    documentId: string
    position: number
    selection?: [number, number]
    color: string
  }
  isTyping?: {
    documentId: string
    position: number
  }
}

/**
 * 文件鎖定狀態
 */
export interface DocumentLock {
  documentId: string
  userId: string
  userName: string
  lockedAt: number
  section?: {
    start: number
    end: number
  }
}

/**
 * 同步衝突
 */
export interface SyncConflict {
  id: string
  documentId: string
  type: 'content' | 'metadata' | 'permission'
  localVersion: number
  remoteVersion: number
  localChange: any
  remoteChange: any
  timestamp: number
  resolved: boolean
}

/**
 * 實時狀態介面
 */
export interface RealtimeState {
  // 連接狀態
  connectionStatus: ConnectionStatus
  socket: WebSocket | null
  lastHeartbeat: number
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectDelay: number

  // 房間管理
  currentRoom: string | null
  joinedRooms: string[]

  // 用戶在線狀態
  onlineUsers: UserPresence[]
  userPresence: { [userId: string]: UserPresence }

  // 實時事件
  events: RealtimeEvent[]
  eventQueue: RealtimeEvent[]

  // 文件協作
  documentLocks: DocumentLock[]
  typingUsers: { [documentId: string]: UserPresence[] }

  // 同步狀態
  syncStatus: 'idle' | 'syncing' | 'conflict' | 'error'
  syncConflicts: SyncConflict[]
  pendingChanges: { [documentId: string]: any[] }

  // 錯誤處理
  errors: string[]

  // 統計數據
  stats: {
    messagesSent: number
    messagesReceived: number
    reconnects: number
    uptime: number
    startTime: number
  }
}

// 初始狀態
const initialState: RealtimeState = {
  connectionStatus: 'disconnected',
  socket: null,
  lastHeartbeat: 0,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,

  currentRoom: null,
  joinedRooms: [],

  onlineUsers: [],
  userPresence: {},

  events: [],
  eventQueue: [],

  documentLocks: [],
  typingUsers: {},

  syncStatus: 'idle',
  syncConflicts: [],
  pendingChanges: {},

  errors: [],

  stats: {
    messagesSent: 0,
    messagesReceived: 0,
    reconnects: 0,
    uptime: 0,
    startTime: Date.now(),
  },
}

/**
 * 連接 WebSocket Thunk
 */
export const connectWebSocket = createAsyncThunk<
  WebSocket,
  { url: string; token: string }
>(
  'realtime/connectWebSocket',
  async ({ url, token }, { rejectWithValue, dispatch }) => {
    try {
      const wsUrl = `${url}?token=${token}`
      const socket = new WebSocket(wsUrl)

      return new Promise((resolve, reject) => {
        socket.onopen = () => {
          dispatch(setConnectionStatus('connected'))
          dispatch(resetReconnectAttempts())
          resolve(socket)
        }

        socket.onerror = error => {
          dispatch(setConnectionStatus('error'))
          reject(new Error('WebSocket 連接失敗'))
        }

        socket.onmessage = event => {
          try {
            const data = JSON.parse(event.data)
            dispatch(handleIncomingMessage(data))
          } catch (error) {
            dispatch(addError('解析訊息失敗'))
          }
        }

        socket.onclose = () => {
          dispatch(setConnectionStatus('disconnected'))
          dispatch(handleDisconnection())
        }
      })
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 斷開 WebSocket 連接 Thunk
 */
export const disconnectWebSocket = createAsyncThunk<void, void>(
  'realtime/disconnectWebSocket',
  async (_, { getState, dispatch }) => {
    const state = getState() as { realtime: RealtimeState }
    const { socket } = state.realtime

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close()
    }

    dispatch(setConnectionStatus('disconnected'))
    dispatch(clearUserPresence())
  }
)

/**
 * 加入房間 Thunk
 */
export const joinRoom = createAsyncThunk<void, string>(
  'realtime/joinRoom',
  async (roomId, { getState, dispatch }) => {
    const state = getState() as { realtime: RealtimeState }
    const { socket } = state.realtime

    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'join_room',
        roomId,
        timestamp: Date.now(),
      }

      socket.send(JSON.stringify(message))
      dispatch(addToJoinedRooms(roomId))
      dispatch(setCurrentRoom(roomId))
    } else {
      throw new Error('WebSocket 未連接')
    }
  }
)

/**
 * 離開房間 Thunk
 */
export const leaveRoom = createAsyncThunk<void, string>(
  'realtime/leaveRoom',
  async (roomId, { getState, dispatch }) => {
    const state = getState() as { realtime: RealtimeState }
    const { socket } = state.realtime

    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'leave_room',
        roomId,
        timestamp: Date.now(),
      }

      socket.send(JSON.stringify(message))
      dispatch(removeFromJoinedRooms(roomId))

      if (state.realtime.currentRoom === roomId) {
        dispatch(setCurrentRoom(null))
      }
    }
  }
)

/**
 * 發送實時事件 Thunk
 */
export const sendRealtimeEvent = createAsyncThunk<
  void,
  Omit<RealtimeEvent, 'id' | 'timestamp'>
>('realtime/sendRealtimeEvent', async (eventData, { getState, dispatch }) => {
  const state = getState() as { realtime: RealtimeState }
  const { socket } = state.realtime

  if (socket && socket.readyState === WebSocket.OPEN) {
    const event: RealtimeEvent = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    const message = {
      type: 'realtime_event',
      event,
    }

    socket.send(JSON.stringify(message))
    dispatch(incrementMessagesSent())
  } else {
    dispatch(queueEvent(eventData))
  }
})

/**
 * Realtime Slice
 */
const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    /**
     * 設置連接狀態
     */
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload

      if (action.payload === 'connected') {
        state.stats.uptime = Date.now() - state.stats.startTime
      }
    },

    /**
     * 設置 WebSocket 實例
     */
    setSocket: (state, action: PayloadAction<WebSocket | null>) => {
      // 注意：這裡我們不直接存儲 WebSocket 物件，因為它不能被序列化
      // 在實際應用中，我們會在組件中管理 WebSocket 實例
      state.socket = action.payload
    },

    /**
     * 處理傳入訊息
     */
    handleIncomingMessage: (state, action: PayloadAction<any>) => {
      const message = action.payload
      state.stats.messagesReceived += 1

      switch (message.type) {
        case 'user_presence':
          state.userPresence[message.userId] = message.presence
          break

        case 'user_joined':
          const joinedUser = message.user
          if (!state.onlineUsers.find(u => u.id === joinedUser.id)) {
            state.onlineUsers.push(joinedUser)
          }
          break

        case 'user_left':
          state.onlineUsers = state.onlineUsers.filter(
            u => u.id !== message.userId
          )
          delete state.userPresence[message.userId]
          break

        case 'realtime_event':
          state.events.push(message.event)
          // 限制事件歷史記錄數量
          if (state.events.length > 1000) {
            state.events = state.events.slice(-500)
          }
          break

        case 'sync_conflict':
          state.syncConflicts.push(message.conflict)
          state.syncStatus = 'conflict'
          break

        case 'heartbeat':
          state.lastHeartbeat = Date.now()
          break
      }
    },

    /**
     * 處理斷線
     */
    handleDisconnection: state => {
      state.connectionStatus = 'disconnected'
      state.onlineUsers = []
      state.userPresence = {}

      // 如果有重連嘗試次數剩餘，標記為重連中
      if (state.reconnectAttempts < state.maxReconnectAttempts) {
        state.connectionStatus = 'reconnecting'
        state.reconnectAttempts += 1
        state.stats.reconnects += 1
      }
    },

    /**
     * 重置重連嘗試次數
     */
    resetReconnectAttempts: state => {
      state.reconnectAttempts = 0
    },

    /**
     * 設置當前房間
     */
    setCurrentRoom: (state, action: PayloadAction<string | null>) => {
      state.currentRoom = action.payload
    },

    /**
     * 添加到已加入房間
     */
    addToJoinedRooms: (state, action: PayloadAction<string>) => {
      if (!state.joinedRooms.includes(action.payload)) {
        state.joinedRooms.push(action.payload)
      }
    },

    /**
     * 從已加入房間中移除
     */
    removeFromJoinedRooms: (state, action: PayloadAction<string>) => {
      state.joinedRooms = state.joinedRooms.filter(
        room => room !== action.payload
      )
    },

    /**
     * 更新用戶在線狀態
     */
    updateUserPresence: (state, action: PayloadAction<UserPresence>) => {
      const user = action.payload
      state.userPresence[user.id] = user

      const existingIndex = state.onlineUsers.findIndex(u => u.id === user.id)
      if (existingIndex !== -1) {
        state.onlineUsers[existingIndex] = user
      } else if (user.isOnline) {
        state.onlineUsers.push(user)
      }
    },

    /**
     * 清除用戶在線狀態
     */
    clearUserPresence: state => {
      state.onlineUsers = []
      state.userPresence = {}
    },

    /**
     * 添加事件到佇列
     */
    queueEvent: (
      state,
      action: PayloadAction<Omit<RealtimeEvent, 'id' | 'timestamp'>>
    ) => {
      const event: RealtimeEvent = {
        ...action.payload,
        id: `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }
      state.eventQueue.push(event)
    },

    /**
     * 處理佇列中的事件
     */
    processEventQueue: state => {
      state.events.push(...state.eventQueue)
      state.eventQueue = []
    },

    /**
     * 添加文件鎖定
     */
    addDocumentLock: (state, action: PayloadAction<DocumentLock>) => {
      const existingIndex = state.documentLocks.findIndex(
        lock =>
          lock.documentId === action.payload.documentId &&
          lock.userId === action.payload.userId
      )

      if (existingIndex !== -1) {
        state.documentLocks[existingIndex] = action.payload
      } else {
        state.documentLocks.push(action.payload)
      }
    },

    /**
     * 移除文件鎖定
     */
    removeDocumentLock: (
      state,
      action: PayloadAction<{ documentId: string; userId: string }>
    ) => {
      state.documentLocks = state.documentLocks.filter(
        lock =>
          !(
            lock.documentId === action.payload.documentId &&
            lock.userId === action.payload.userId
          )
      )
    },

    /**
     * 更新正在輸入用戶
     */
    updateTypingUsers: (
      state,
      action: PayloadAction<{ documentId: string; users: UserPresence[] }>
    ) => {
      state.typingUsers[action.payload.documentId] = action.payload.users
    },

    /**
     * 設置同步狀態
     */
    setSyncStatus: (
      state,
      action: PayloadAction<RealtimeState['syncStatus']>
    ) => {
      state.syncStatus = action.payload
    },

    /**
     * 解決同步衝突
     */
    resolveSyncConflict: (
      state,
      action: PayloadAction<{ conflictId: string; resolution: any }>
    ) => {
      const conflictIndex = state.syncConflicts.findIndex(
        c => c.id === action.payload.conflictId
      )
      if (conflictIndex !== -1) {
        const conflict = state.syncConflicts[conflictIndex]
        if (conflict) {
          conflict.resolved = true
        }
      }

      // 如果所有衝突都已解決，更新同步狀態
      if (state.syncConflicts.every(c => c.resolved)) {
        state.syncStatus = 'idle'
      }
    },

    /**
     * 添加待處理變更
     */
    addPendingChange: (
      state,
      action: PayloadAction<{ documentId: string; change: any }>
    ) => {
      if (!state.pendingChanges[action.payload.documentId]) {
        state.pendingChanges[action.payload.documentId] = []
      }
      const changes = state.pendingChanges[action.payload.documentId]
      if (changes) {
        changes.push(action.payload.change)
      }
    },

    /**
     * 清除待處理變更
     */
    clearPendingChanges: (state, action: PayloadAction<string>) => {
      delete state.pendingChanges[action.payload]
    },

    /**
     * 添加錯誤
     */
    addError: (state, action: PayloadAction<string>) => {
      state.errors.push(action.payload)

      // 限制錯誤記錄數量
      if (state.errors.length > 100) {
        state.errors = state.errors.slice(-50)
      }
    },

    /**
     * 清除錯誤
     */
    clearErrors: state => {
      state.errors = []
    },

    /**
     * 增加發送訊息計數
     */
    incrementMessagesSent: state => {
      state.stats.messagesSent += 1
    },

    /**
     * 重置統計數據
     */
    resetStats: state => {
      state.stats = {
        messagesSent: 0,
        messagesReceived: 0,
        reconnects: 0,
        uptime: 0,
        startTime: Date.now(),
      }
    },

    /**
     * 重置實時狀態
     */
    resetRealtimeState: () => initialState,
  },
  extraReducers: builder => {
    // 連接 WebSocket
    builder
      .addCase(connectWebSocket.pending, state => {
        state.connectionStatus = 'connecting'
      })
      .addCase(connectWebSocket.fulfilled, (state, action) => {
        state.connectionStatus = 'connected'
        state.socket = action.payload
        state.reconnectAttempts = 0
        state.stats.startTime = Date.now()
      })
      .addCase(connectWebSocket.rejected, (state, action) => {
        state.connectionStatus = 'error'
        state.errors.push(action.error.message || 'WebSocket 連接失敗')
      })

    // 斷開連接
    builder.addCase(disconnectWebSocket.fulfilled, state => {
      state.connectionStatus = 'disconnected'
      state.socket = null
      state.currentRoom = null
      state.joinedRooms = []
    })

    // 加入房間
    builder.addCase(joinRoom.rejected, (state, action) => {
      state.errors.push(action.error.message || '加入房間失敗')
    })

    // 發送事件
    builder.addCase(sendRealtimeEvent.rejected, (state, action) => {
      state.errors.push(action.error.message || '發送事件失敗')
    })
  },
})

export const {
  setConnectionStatus,
  setSocket,
  handleIncomingMessage,
  handleDisconnection,
  resetReconnectAttempts,
  setCurrentRoom,
  addToJoinedRooms,
  removeFromJoinedRooms,
  updateUserPresence,
  clearUserPresence,
  queueEvent,
  processEventQueue,
  addDocumentLock,
  removeDocumentLock,
  updateTypingUsers,
  setSyncStatus,
  resolveSyncConflict,
  addPendingChange,
  clearPendingChanges,
  addError,
  clearErrors,
  incrementMessagesSent,
  resetStats,
  resetRealtimeState,
} = realtimeSlice.actions

export default realtimeSlice.reducer
