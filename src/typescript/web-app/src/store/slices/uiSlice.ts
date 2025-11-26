import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * 主題模式
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * 語言設置
 */
export type Language = 'zh-TW' | 'zh-CN' | 'en' | 'ja'

/**
 * 側邊欄狀態
 */
export interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  activeSection: string | null
}

/**
 * 模態框狀態
 */
export interface ModalState {
  type:
    | 'create-document'
    | 'share-document'
    | 'settings'
    | 'confirmation'
    | null
  isOpen: boolean
  data?: any
}

/**
 * 通知介面
 */
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  createdAt: number
}

/**
 * 面包屑項目
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

/**
 * UI 狀態介面
 */
export interface UIState {
  // 主題相關
  theme: ThemeMode
  language: Language

  // 布局相關
  sidebar: SidebarState
  isMobileMenuOpen: boolean
  headerHeight: number

  // 模態框
  modal: ModalState

  // 通知系統
  notifications: Notification[]

  // 載入狀態
  globalLoading: boolean
  pageLoading: boolean

  // 面包屑導航
  breadcrumbs: BreadcrumbItem[]

  // 搜索
  searchPanel: {
    isOpen: boolean
    query: string
    filters: {
      type?: string
      dateRange?: [string, string]
      author?: string
    }
  }

  // 工具欄
  toolbar: {
    isVisible: boolean
    activeTools: string[]
  }

  // 右側面板
  rightPanel: {
    isOpen: boolean
    activeTab: 'outline' | 'comments' | 'history' | 'collaborators' | null
  }

  // 文件編輯器
  editor: {
    isFullscreen: boolean
    showLineNumbers: boolean
    wordWrap: boolean
    fontSize: number
    theme: 'light' | 'dark'
  }

  // 偏好設置
  preferences: {
    autoSave: boolean
    autoSaveInterval: number
    showWelcomeScreen: boolean
    compactMode: boolean
    animationsEnabled: boolean
  }

  // 鍵盤快捷鍵
  shortcuts: {
    [key: string]: string
  }

  // 錯誤狀態
  errors: {
    network: boolean
    server: boolean
    permission: boolean
  }
}

// 初始狀態
const initialState: UIState = {
  theme: 'system',
  language: 'zh-TW',
  sidebar: {
    isOpen: true,
    isCollapsed: false,
    activeSection: null,
  },
  isMobileMenuOpen: false,
  headerHeight: 64,
  modal: {
    type: null,
    isOpen: false,
    data: undefined,
  },
  notifications: [],
  globalLoading: false,
  pageLoading: false,
  breadcrumbs: [],
  searchPanel: {
    isOpen: false,
    query: '',
    filters: {},
  },
  toolbar: {
    isVisible: true,
    activeTools: [],
  },
  rightPanel: {
    isOpen: false,
    activeTab: null,
  },
  editor: {
    isFullscreen: false,
    showLineNumbers: true,
    wordWrap: true,
    fontSize: 14,
    theme: 'light',
  },
  preferences: {
    autoSave: true,
    autoSaveInterval: 30000, // 30秒
    showWelcomeScreen: true,
    compactMode: false,
    animationsEnabled: true,
  },
  shortcuts: {
    'Cmd+S': 'save',
    'Cmd+N': 'new-document',
    'Cmd+O': 'open-document',
    'Cmd+F': 'search',
    'Cmd+Shift+P': 'command-palette',
    Escape: 'close-modal',
  },
  errors: {
    network: false,
    server: false,
    permission: false,
  },
}

/**
 * 生成通知 ID
 */
const generateNotificationId = () =>
  `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

/**
 * UI Slice
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 主題相關
    /**
     * 設置主題模式
     */
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
    },

    /**
     * 切換主題模式
     */
    toggleTheme: state => {
      if (state.theme === 'light') {
        state.theme = 'dark'
      } else if (state.theme === 'dark') {
        state.theme = 'system'
      } else {
        state.theme = 'light'
      }
    },

    /**
     * 設置語言
     */
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload
    },

    // 側邊欄相關
    /**
     * 切換側邊欄開關狀態
     */
    toggleSidebar: state => {
      state.sidebar.isOpen = !state.sidebar.isOpen
    },

    /**
     * 開啟側邊欄
     */
    openSidebar: state => {
      state.sidebar.isOpen = true
    },

    /**
     * 關閉側邊欄
     */
    closeSidebar: state => {
      state.sidebar.isOpen = false
    },

    /**
     * 切換側邊欄摺疊狀態
     */
    toggleSidebarCollapse: state => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed
    },

    /**
     * 設置側邊欄活動區段
     */
    setSidebarActiveSection: (state, action: PayloadAction<string | null>) => {
      state.sidebar.activeSection = action.payload
    },

    /**
     * 切換移動端選單
     */
    toggleMobileMenu: state => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },

    /**
     * 設置頭部高度
     */
    setHeaderHeight: (state, action: PayloadAction<number>) => {
      state.headerHeight = action.payload
    },

    // 模態框相關
    /**
     * 開啟模態框
     */
    openModal: (
      state,
      action: PayloadAction<{ type: ModalState['type']; data?: any }>
    ) => {
      state.modal = {
        type: action.payload.type,
        isOpen: true,
        data: action.payload.data,
      }
    },

    /**
     * 關閉模態框
     */
    closeModal: state => {
      state.modal = {
        type: null,
        isOpen: false,
        data: undefined,
      }
    },

    // 通知系統
    /**
     * 添加通知
     */
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: generateNotificationId(),
        createdAt: Date.now(),
      }
      state.notifications.push(notification)
    },

    /**
     * 移除通知
     */
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },

    /**
     * 清除所有通知
     */
    clearAllNotifications: state => {
      state.notifications = []
    },

    // 載入狀態
    /**
     * 設置全域載入狀態
     */
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },

    /**
     * 設置頁面載入狀態
     */
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload
    },

    // 面包屑導航
    /**
     * 設置面包屑
     */
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload
    },

    /**
     * 添加面包屑項目
     */
    addBreadcrumb: (state, action: PayloadAction<BreadcrumbItem>) => {
      state.breadcrumbs.push(action.payload)
    },

    /**
     * 清除面包屑
     */
    clearBreadcrumbs: state => {
      state.breadcrumbs = []
    },

    // 搜索面板
    /**
     * 切換搜索面板
     */
    toggleSearchPanel: state => {
      state.searchPanel.isOpen = !state.searchPanel.isOpen
    },

    /**
     * 開啟搜索面板
     */
    openSearchPanel: state => {
      state.searchPanel.isOpen = true
    },

    /**
     * 關閉搜索面板
     */
    closeSearchPanel: state => {
      state.searchPanel.isOpen = false
      state.searchPanel.query = ''
      state.searchPanel.filters = {}
    },

    /**
     * 設置搜索查詢
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchPanel.query = action.payload
    },

    /**
     * 設置搜索過濾器
     */
    setSearchFilters: (
      state,
      action: PayloadAction<UIState['searchPanel']['filters']>
    ) => {
      state.searchPanel.filters = action.payload
    },

    // 工具欄
    /**
     * 切換工具欄可見性
     */
    toggleToolbar: state => {
      state.toolbar.isVisible = !state.toolbar.isVisible
    },

    /**
     * 設置活動工具
     */
    setActiveTools: (state, action: PayloadAction<string[]>) => {
      state.toolbar.activeTools = action.payload
    },

    /**
     * 添加活動工具
     */
    addActiveTool: (state, action: PayloadAction<string>) => {
      if (!state.toolbar.activeTools.includes(action.payload)) {
        state.toolbar.activeTools.push(action.payload)
      }
    },

    /**
     * 移除活動工具
     */
    removeActiveTool: (state, action: PayloadAction<string>) => {
      state.toolbar.activeTools = state.toolbar.activeTools.filter(
        tool => tool !== action.payload
      )
    },

    // 右側面板
    /**
     * 切換右側面板
     */
    toggleRightPanel: state => {
      state.rightPanel.isOpen = !state.rightPanel.isOpen
    },

    /**
     * 開啟右側面板
     */
    openRightPanel: (
      state,
      action: PayloadAction<UIState['rightPanel']['activeTab']>
    ) => {
      state.rightPanel.isOpen = true
      state.rightPanel.activeTab = action.payload
    },

    /**
     * 關閉右側面板
     */
    closeRightPanel: state => {
      state.rightPanel.isOpen = false
      state.rightPanel.activeTab = null
    },

    /**
     * 設置右側面板活動標籤
     */
    setRightPanelActiveTab: (
      state,
      action: PayloadAction<UIState['rightPanel']['activeTab']>
    ) => {
      state.rightPanel.activeTab = action.payload
    },

    // 編輯器設置
    /**
     * 切換全螢幕模式
     */
    toggleEditorFullscreen: state => {
      state.editor.isFullscreen = !state.editor.isFullscreen
    },

    /**
     * 設置編輯器設置
     */
    setEditorSettings: (
      state,
      action: PayloadAction<Partial<UIState['editor']>>
    ) => {
      state.editor = { ...state.editor, ...action.payload }
    },

    // 偏好設置
    /**
     * 更新偏好設置
     */
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UIState['preferences']>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },

    // 快捷鍵
    /**
     * 設置快捷鍵
     */
    setShortcuts: (state, action: PayloadAction<UIState['shortcuts']>) => {
      state.shortcuts = action.payload
    },

    /**
     * 更新單個快捷鍵
     */
    updateShortcut: (
      state,
      action: PayloadAction<{ key: string; action: string }>
    ) => {
      state.shortcuts[action.payload.key] = action.payload.action
    },

    // 錯誤狀態
    /**
     * 設置網路錯誤狀態
     */
    setNetworkError: (state, action: PayloadAction<boolean>) => {
      state.errors.network = action.payload
    },

    /**
     * 設置伺服器錯誤狀態
     */
    setServerError: (state, action: PayloadAction<boolean>) => {
      state.errors.server = action.payload
    },

    /**
     * 設置權限錯誤狀態
     */
    setPermissionError: (state, action: PayloadAction<boolean>) => {
      state.errors.permission = action.payload
    },

    /**
     * 清除所有錯誤狀態
     */
    clearAllErrors: state => {
      state.errors = {
        network: false,
        server: false,
        permission: false,
      }
    },

    /**
     * 重置 UI 狀態
     */
    resetUIState: () => initialState,
  },
})

export const {
  // 主題
  setTheme,
  toggleTheme,
  setLanguage,

  // 側邊欄
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleSidebarCollapse,
  setSidebarActiveSection,
  toggleMobileMenu,
  setHeaderHeight,

  // 模態框
  openModal,
  closeModal,

  // 通知
  addNotification,
  removeNotification,
  clearAllNotifications,

  // 載入狀態
  setGlobalLoading,
  setPageLoading,

  // 面包屑
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,

  // 搜索
  toggleSearchPanel,
  openSearchPanel,
  closeSearchPanel,
  setSearchQuery,
  setSearchFilters,

  // 工具欄
  toggleToolbar,
  setActiveTools,
  addActiveTool,
  removeActiveTool,

  // 右側面板
  toggleRightPanel,
  openRightPanel,
  closeRightPanel,
  setRightPanelActiveTab,

  // 編輯器
  toggleEditorFullscreen,
  setEditorSettings,

  // 偏好設置
  updatePreferences,

  // 快捷鍵
  setShortcuts,
  updateShortcut,

  // 錯誤處理
  setNetworkError,
  setServerError,
  setPermissionError,
  clearAllErrors,

  // 重置
  resetUIState,
} = uiSlice.actions

export default uiSlice.reducer
