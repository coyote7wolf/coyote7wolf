import React from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

/**
 * 使用 typed dispatch hook
 * 提供正確的 TypeScript 類型推斷
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * 使用 typed selector hook
 * 提供正確的 TypeScript 類型推斷
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Auth 相關的 hooks
 */
export const useAuth = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(state => state.auth)

  return {
    // 狀態
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    lastActivity: auth.lastActivity,
    sessionExpiry: auth.sessionExpiry,

    // Actions (會在後面的組件中使用)
    // 這裡返回的是純粹的狀態，actions 在組件中直接使用 dispatch
  }
}

/**
 * Documents 相關的 hooks
 */
export const useDocuments = () => {
  const dispatch = useAppDispatch()
  const documents = useAppSelector(state => state.documents)

  return {
    // 狀態
    documents: documents.documents,
    currentDocument: documents.currentDocument,
    isLoading: documents.isLoading,
    error: documents.error,
    searchQuery: documents.searchQuery,
    searchResults: documents.searchResults,
    isSearching: documents.isSearching,
    filter: documents.filter,
    sort: documents.sort,
    pagination: documents.pagination,
    recentDocuments: documents.recentDocuments,
    sharedWithMe: documents.sharedWithMe,
    trash: documents.trash,
  }
}

/**
 * UI 相關的 hooks
 */
export const useUI = () => {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(state => state.ui)

  return {
    // 主題和語言
    theme: ui.theme,
    language: ui.language,

    // 布局
    sidebar: ui.sidebar,
    isMobileMenuOpen: ui.isMobileMenuOpen,
    headerHeight: ui.headerHeight,

    // 模態框
    modal: ui.modal,

    // 通知
    notifications: ui.notifications,

    // 載入狀態
    globalLoading: ui.globalLoading,
    pageLoading: ui.pageLoading,

    // 面包屑
    breadcrumbs: ui.breadcrumbs,

    // 搜索面板
    searchPanel: ui.searchPanel,

    // 工具欄
    toolbar: ui.toolbar,

    // 右側面板
    rightPanel: ui.rightPanel,

    // 編輯器
    editor: ui.editor,

    // 偏好設置
    preferences: ui.preferences,

    // 快捷鍵
    shortcuts: ui.shortcuts,

    // 錯誤狀態
    errors: ui.errors,
  }
}

/**
 * Realtime 相關的 hooks
 */
export const useRealtime = () => {
  const dispatch = useAppDispatch()
  const realtime = useAppSelector(state => state.realtime)

  return {
    // 連接狀態
    connectionStatus: realtime.connectionStatus,
    socket: realtime.socket,
    lastHeartbeat: realtime.lastHeartbeat,
    reconnectAttempts: realtime.reconnectAttempts,

    // 房間管理
    currentRoom: realtime.currentRoom,
    joinedRooms: realtime.joinedRooms,

    // 用戶在線狀態
    onlineUsers: realtime.onlineUsers,
    userPresence: realtime.userPresence,

    // 實時事件
    events: realtime.events,
    eventQueue: realtime.eventQueue,

    // 文件協作
    documentLocks: realtime.documentLocks,
    typingUsers: realtime.typingUsers,

    // 同步狀態
    syncStatus: realtime.syncStatus,
    syncConflicts: realtime.syncConflicts,
    pendingChanges: realtime.pendingChanges,

    // 錯誤和統計
    errors: realtime.errors,
    stats: realtime.stats,
  }
}

/**
 * Enhanced Notifications Hook (for new notifications slice)
 * Note: Temporarily disabled until notifications slice is properly integrated
 */
export const useNotificationsEnhanced = () => {
  // const dispatch = useAppDispatch()
  // const notifications = useAppSelector(state => state.notifications)

  return {
    // State - using mock data for now
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      browserNotifications: true,
      soundEnabled: true,
      categories: {
        system: true,
        document: true,
        user: true,
        security: true,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    },
    isPermissionGranted: false,

    // Computed values
    unreadItems: [],
    highPriorityItems: [],
  }
}

/**
 * Legacy notification management hook (UI slice)
 */
export const useNotifications = () => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(state => state.ui.notifications)

  const addNotification = (
    notification: Omit<
      import('./slices/uiSlice').Notification,
      'id' | 'createdAt'
    >
  ) => {
    dispatch({ type: 'ui/addNotification', payload: notification })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: 'ui/removeNotification', payload: id })
  }

  const clearAllNotifications = () => {
    dispatch({ type: 'ui/clearAllNotifications' })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  }
}

/**
 * User Profile Management Hook
 * Note: Temporarily disabled until user slice is properly integrated
 */
export const useUserProfile = () => {
  // const dispatch = useAppDispatch()
  // const user = useAppSelector(state => state.user)

  // Return mock data for now to maintain interface compatibility
  return {
    // State - using mock data
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    uploadProgress: 0,
    hasUnsavedChanges: false,
  }
}

/**
 * 側邊欄管理 hook
 */
export const useSidebar = () => {
  const dispatch = useAppDispatch()
  const sidebar = useAppSelector(state => state.ui.sidebar)

  const toggleSidebar = () => {
    dispatch({ type: 'ui/toggleSidebar' })
  }

  const openSidebar = () => {
    dispatch({ type: 'ui/openSidebar' })
  }

  const closeSidebar = () => {
    dispatch({ type: 'ui/closeSidebar' })
  }

  const toggleCollapse = () => {
    dispatch({ type: 'ui/toggleSidebarCollapse' })
  }

  const setActiveSection = (section: string | null) => {
    dispatch({ type: 'ui/setSidebarActiveSection', payload: section })
  }

  return {
    sidebar,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleCollapse,
    setActiveSection,
  }
}

/**
 * 模態框管理 hook
 */
export const useModal = () => {
  const dispatch = useAppDispatch()
  const modal = useAppSelector(state => state.ui.modal)

  const openModal = (
    type: import('./slices/uiSlice').ModalState['type'],
    data?: any
  ) => {
    dispatch({ type: 'ui/openModal', payload: { type, data } })
  }

  const closeModal = () => {
    dispatch({ type: 'ui/closeModal' })
  }

  return {
    modal,
    openModal,
    closeModal,
  }
}

/**
 * 主題管理 hook
 */
export const useTheme = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(state => state.ui.theme)

  const setTheme = (newTheme: import('./slices/uiSlice').ThemeMode) => {
    dispatch({ type: 'ui/setTheme', payload: newTheme })
  }

  const toggleTheme = () => {
    dispatch({ type: 'ui/toggleTheme' })
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}

/**
 * 搜索管理 hook
 */
export const useSearch = () => {
  const dispatch = useAppDispatch()
  const searchPanel = useAppSelector(state => state.ui.searchPanel)
  const documentsSearch = useAppSelector(state => ({
    query: state.documents.searchQuery,
    results: state.documents.searchResults,
    isSearching: state.documents.isSearching,
  }))

  const toggleSearchPanel = () => {
    dispatch({ type: 'ui/toggleSearchPanel' })
  }

  const openSearchPanel = () => {
    dispatch({ type: 'ui/openSearchPanel' })
  }

  const closeSearchPanel = () => {
    dispatch({ type: 'ui/closeSearchPanel' })
  }

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'ui/setSearchQuery', payload: query })
    dispatch({ type: 'documents/setSearchQuery', payload: query })
  }

  return {
    searchPanel,
    documentsSearch,
    toggleSearchPanel,
    openSearchPanel,
    closeSearchPanel,
    setSearchQuery,
  }
}

/**
 * 協作管理 hook
 */
export const useCollaboration = () => {
  const dispatch = useAppDispatch()
  const realtime = useAppSelector(state => state.realtime)
  const currentDocument = useAppSelector(
    state => state.documents.currentDocument
  )

  const currentDocumentId = currentDocument?.id
  const collaborators = currentDocument?.collaborators || []
  const onlineCollaborators = collaborators.filter(c =>
    realtime.onlineUsers.some(u => u.id === c.id)
  )
  const typingUsers = currentDocumentId
    ? realtime.typingUsers[currentDocumentId] || []
    : []
  const documentLocks = realtime.documentLocks.filter(
    l => l.documentId === currentDocumentId
  )

  return {
    collaborators,
    onlineCollaborators,
    typingUsers,
    documentLocks,
    connectionStatus: realtime.connectionStatus,
    syncStatus: realtime.syncStatus,
    syncConflicts: realtime.syncConflicts.filter(
      c => c.documentId === currentDocumentId
    ),
  }
}

/**
 * 本地儲存同步 hook
 */
export const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: any) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

/**
 * 會話儲存同步 hook
 */
export const useSessionStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: any) => {
    try {
      setStoredValue(value)
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
