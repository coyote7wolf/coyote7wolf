/**
 * 路由管理系統
 * 提供統一的路由管理、權限控制和導航功能
 */

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// 路由權限級別
export enum RoutePermission {
  PUBLIC = 'PUBLIC',
  AUTHENTICATED = 'AUTHENTICATED',
  VERIFIED = 'VERIFIED',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
}

// 路由配置接口
export interface RouteConfig {
  path: string
  name: string
  title: string
  description?: string
  permission: RoutePermission
  layout?: 'default' | 'auth' | 'dashboard' | 'fullscreen'
  category?: string
  meta?: {
    requiresNetwork?: boolean
    cacheable?: boolean
    preload?: boolean
  }
  params?: Record<string, string>
  query?: Record<string, string>
}

// 面包屑項目
export interface BreadcrumbItem {
  name: string
  path?: string
  active: boolean
}

// 路由名稱枚舉
export enum RouteName {
  // 公開路由
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',

  // 認證後路由
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',

  // 文件管理
  DOCUMENTS = 'DOCUMENTS',
  DOCUMENT_VIEW = 'DOCUMENT_VIEW',
  DOCUMENT_EDIT = 'DOCUMENT_EDIT',
  DOCUMENT_CREATE = 'DOCUMENT_CREATE',
  DOCUMENT_SHARE = 'DOCUMENT_SHARE',
  DOCUMENT_HISTORY = 'DOCUMENT_HISTORY',

  // 協作功能
  COLLABORATION = 'COLLABORATION',
  SHARED_DOCUMENTS = 'SHARED_DOCUMENTS',
  TEAM_WORKSPACE = 'TEAM_WORKSPACE',

  // AI 功能
  AI_ASSISTANT = 'AI_ASSISTANT',
  AI_SUGGESTIONS = 'AI_SUGGESTIONS',
  AI_ANALYSIS = 'AI_ANALYSIS',

  // 同步與版本控制
  SYNC_STATUS = 'SYNC_STATUS',
  VERSION_HISTORY = 'VERSION_HISTORY',
  CONFLICT_RESOLUTION = 'CONFLICT_RESOLUTION',

  // 分析與報告
  ANALYTICS = 'ANALYTICS',
  USAGE_REPORTS = 'USAGE_REPORTS',
  PERFORMANCE_METRICS = 'PERFORMANCE_METRICS',

  // 管理功能
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_DOCUMENTS = 'ADMIN_DOCUMENTS',
  ADMIN_SYSTEM = 'ADMIN_SYSTEM',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS',

  // 幫助與支援
  HELP = 'HELP',
  DOCUMENTATION = 'DOCUMENTATION',
  API_DOCS = 'API_DOCS',
  SUPPORT = 'SUPPORT',

  // 其他
  SEARCH = 'SEARCH',
  NOTIFICATIONS = 'NOTIFICATIONS',
  INTEGRATIONS = 'INTEGRATIONS',
  BILLING = 'BILLING',
  SUBSCRIPTION = 'SUBSCRIPTION',

  // 錯誤頁面
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  MAINTENANCE = 'MAINTENANCE',
}

// 路由配置映射
export const ROUTE_CONFIGS: Record<RouteName, RouteConfig> = {
  // 公開路由
  [RouteName.HOME]: {
    path: '/',
    name: 'home',
    title: '首頁',
    description: 'SyncCoreAI 協作文件編輯平台',
    permission: RoutePermission.PUBLIC,
    layout: 'default',
    category: 'public',
  },
  [RouteName.LOGIN]: {
    path: '/login',
    name: 'login',
    title: '登入',
    description: '登入您的帳戶',
    permission: RoutePermission.PUBLIC,
    layout: 'auth',
    category: 'auth',
  },
  [RouteName.REGISTER]: {
    path: '/register',
    name: 'register',
    title: '註冊',
    description: '建立新帳戶',
    permission: RoutePermission.PUBLIC,
    layout: 'auth',
    category: 'auth',
  },
  [RouteName.FORGOT_PASSWORD]: {
    path: '/forgot-password',
    name: 'forgot-password',
    title: '忘記密碼',
    description: '重設您的密碼',
    permission: RoutePermission.PUBLIC,
    layout: 'auth',
    category: 'auth',
  },
  [RouteName.RESET_PASSWORD]: {
    path: '/reset-password',
    name: 'reset-password',
    title: '重設密碼',
    description: '設定新密碼',
    permission: RoutePermission.PUBLIC,
    layout: 'auth',
    category: 'auth',
  },

  // 認證後路由
  [RouteName.DASHBOARD]: {
    path: '/dashboard',
    name: 'dashboard',
    title: '儀表板',
    description: '您的工作概覽',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'main',
    meta: { preload: true },
  },
  [RouteName.PROFILE]: {
    path: '/profile',
    name: 'profile',
    title: '個人資料',
    description: '管理您的個人資料',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'account',
  },
  [RouteName.SETTINGS]: {
    path: '/settings',
    name: 'settings',
    title: '設定',
    description: '應用程式設定',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'account',
  },

  // 文件管理
  [RouteName.DOCUMENTS]: {
    path: '/documents',
    name: 'documents',
    title: '文件',
    description: '管理您的文件',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'documents',
    meta: { cacheable: true },
  },
  [RouteName.DOCUMENT_VIEW]: {
    path: '/documents/:id',
    name: 'document-view',
    title: '檢視文件',
    description: '檢視文件內容',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'fullscreen',
    category: 'documents',
    meta: { requiresNetwork: true },
  },
  [RouteName.DOCUMENT_EDIT]: {
    path: '/documents/:id/edit',
    name: 'document-edit',
    title: '編輯文件',
    description: '編輯文件內容',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'fullscreen',
    category: 'documents',
    meta: { requiresNetwork: true },
  },
  [RouteName.DOCUMENT_CREATE]: {
    path: '/documents/create',
    name: 'document-create',
    title: '建立文件',
    description: '建立新文件',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'documents',
  },
  [RouteName.DOCUMENT_SHARE]: {
    path: '/documents/:id/share',
    name: 'document-share',
    title: '分享文件',
    description: '分享文件給其他使用者',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'documents',
  },
  [RouteName.DOCUMENT_HISTORY]: {
    path: '/documents/:id/history',
    name: 'document-history',
    title: '文件歷史',
    description: '檢視文件變更歷史',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'documents',
  },

  // 協作功能
  [RouteName.COLLABORATION]: {
    path: '/collaboration',
    name: 'collaboration',
    title: '協作',
    description: '協作工具與功能',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'collaboration',
  },
  [RouteName.SHARED_DOCUMENTS]: {
    path: '/shared',
    name: 'shared-documents',
    title: '共享文件',
    description: '與您共享的文件',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'collaboration',
  },
  [RouteName.TEAM_WORKSPACE]: {
    path: '/workspace',
    name: 'team-workspace',
    title: '團隊工作區',
    description: '團隊協作空間',
    permission: RoutePermission.VERIFIED,
    layout: 'dashboard',
    category: 'collaboration',
  },

  // AI 功能
  [RouteName.AI_ASSISTANT]: {
    path: '/ai',
    name: 'ai-assistant',
    title: 'AI 助手',
    description: 'AI 智能助手',
    permission: RoutePermission.PREMIUM,
    layout: 'dashboard',
    category: 'ai',
  },
  [RouteName.AI_SUGGESTIONS]: {
    path: '/ai/suggestions',
    name: 'ai-suggestions',
    title: 'AI 建議',
    description: 'AI 內容建議',
    permission: RoutePermission.PREMIUM,
    layout: 'dashboard',
    category: 'ai',
  },
  [RouteName.AI_ANALYSIS]: {
    path: '/ai/analysis',
    name: 'ai-analysis',
    title: 'AI 分析',
    description: 'AI 文件分析',
    permission: RoutePermission.PREMIUM,
    layout: 'dashboard',
    category: 'ai',
  },

  // 管理功能
  [RouteName.ADMIN_DASHBOARD]: {
    path: '/admin',
    name: 'admin-dashboard',
    title: '管理儀表板',
    description: '系統管理概覽',
    permission: RoutePermission.ADMIN,
    layout: 'dashboard',
    category: 'admin',
  },
  [RouteName.ADMIN_USERS]: {
    path: '/admin/users',
    name: 'admin-users',
    title: '使用者管理',
    description: '管理系統使用者',
    permission: RoutePermission.ADMIN,
    layout: 'dashboard',
    category: 'admin',
  },
  [RouteName.ADMIN_DOCUMENTS]: {
    path: '/admin/documents',
    name: 'admin-documents',
    title: '文件管理',
    description: '管理系統文件',
    permission: RoutePermission.ADMIN,
    layout: 'dashboard',
    category: 'admin',
  },
  [RouteName.ADMIN_SYSTEM]: {
    path: '/admin/system',
    name: 'admin-system',
    title: '系統設定',
    description: '系統配置與監控',
    permission: RoutePermission.ADMIN,
    layout: 'dashboard',
    category: 'admin',
  },
  [RouteName.ADMIN_SETTINGS]: {
    path: '/admin/settings',
    name: 'admin-settings',
    title: '管理設定',
    description: '管理員設定',
    permission: RoutePermission.ADMIN,
    layout: 'dashboard',
    category: 'admin',
  },

  // 其他路由（簡化版本，實際應用中會有完整配置）
  [RouteName.HELP]: {
    path: '/help',
    name: 'help',
    title: '幫助',
    permission: RoutePermission.PUBLIC,
    layout: 'default',
    category: 'support',
  },
  [RouteName.SEARCH]: {
    path: '/search',
    name: 'search',
    title: '搜尋',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'tools',
  },
  [RouteName.NOT_FOUND]: {
    path: '/404',
    name: 'not-found',
    title: '頁面不存在',
    permission: RoutePermission.PUBLIC,
    layout: 'default',
    category: 'error',
  },

  // 其他路由使用預設配置
  [RouteName.SYNC_STATUS]: {
    path: '/sync',
    name: 'sync-status',
    title: '同步狀態',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'tools',
  },
  [RouteName.VERSION_HISTORY]: {
    path: '/versions',
    name: 'version-history',
    title: '版本歷史',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'tools',
  },
  [RouteName.CONFLICT_RESOLUTION]: {
    path: '/conflicts',
    name: 'conflict-resolution',
    title: '衝突解決',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'tools',
  },
  [RouteName.ANALYTICS]: {
    path: '/analytics',
    name: 'analytics',
    title: '分析',
    permission: RoutePermission.VERIFIED,
    layout: 'dashboard',
    category: 'insights',
  },
  [RouteName.USAGE_REPORTS]: {
    path: '/reports',
    name: 'usage-reports',
    title: '使用報告',
    permission: RoutePermission.VERIFIED,
    layout: 'dashboard',
    category: 'insights',
  },
  [RouteName.PERFORMANCE_METRICS]: {
    path: '/metrics',
    name: 'performance-metrics',
    title: '效能指標',
    permission: RoutePermission.VERIFIED,
    layout: 'dashboard',
    category: 'insights',
  },
  [RouteName.DOCUMENTATION]: {
    path: '/docs',
    name: 'documentation',
    title: '文件',
    permission: RoutePermission.PUBLIC,
    layout: 'default',
    category: 'support',
  },
  [RouteName.API_DOCS]: {
    path: '/api-docs',
    name: 'api-docs',
    title: 'API 文件',
    permission: RoutePermission.VERIFIED,
    layout: 'default',
    category: 'support',
  },
  [RouteName.SUPPORT]: {
    path: '/support',
    name: 'support',
    title: '技術支援',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'default',
    category: 'support',
  },
  [RouteName.NOTIFICATIONS]: {
    path: '/notifications',
    name: 'notifications',
    title: '通知',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'account',
  },
  [RouteName.INTEGRATIONS]: {
    path: '/integrations',
    name: 'integrations',
    title: '整合',
    permission: RoutePermission.VERIFIED,
    layout: 'dashboard',
    category: 'tools',
  },
  [RouteName.BILLING]: {
    path: '/billing',
    name: 'billing',
    title: '計費',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'account',
  },
  [RouteName.SUBSCRIPTION]: {
    path: '/subscription',
    name: 'subscription',
    title: '訂閱',
    permission: RoutePermission.AUTHENTICATED,
    layout: 'dashboard',
    category: 'account',
  },
  [RouteName.SERVER_ERROR]: {
    path: '/500',
    name: 'server-error',
    title: '伺服器錯誤',
    permission: RoutePermission.PUBLIC,
    layout: 'default',
    category: 'error',
  },
  [RouteName.MAINTENANCE]: {
    path: '/maintenance',
    name: 'maintenance',
    title: '維護中',
    permission: RoutePermission.PUBLIC,
    layout: 'default',
    category: 'error',
  },
}

// 路由管理器類
class RouteManager {
  private router: any = null
  private currentPath: string = '/'

  // 設定 Next.js router 實例
  setRouter(router: any) {
    this.router = router
  }

  // 設定當前路徑
  setCurrentPath(path: string) {
    this.currentPath = path
  }

  // 建構動態路由
  buildPath(
    routeName: RouteName,
    params: Record<string, string> = {},
    query: Record<string, string> = {}
  ): string {
    const config = ROUTE_CONFIGS[routeName]
    if (!config) {
      throw new Error(`Route ${routeName} not found`)
    }

    let path = config.path

    // 替換路徑參數
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value)
    })

    // 添加查詢參數
    if (Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query).toString()
      path += `?${queryString}`
    }

    return path
  }

  // 導航到指定路由
  navigate(
    routeName: RouteName,
    params: Record<string, string> = {},
    query: Record<string, string> = {}
  ): void {
    const path = this.buildPath(routeName, params, query)

    if (this.router) {
      this.router.push(path)
    } else {
      // Fallback 到原生 history API
      window.history.pushState({}, '', path)
    }
  }

  // 替換當前路由
  replace(
    routeName: RouteName,
    params: Record<string, string> = {},
    query: Record<string, string> = {}
  ): void {
    const path = this.buildPath(routeName, params, query)

    if (this.router) {
      this.router.replace(path)
    } else {
      // Fallback 到原生 history API
      window.history.replaceState({}, '', path)
    }
  }

  // 返回上一頁
  back(): void {
    if (this.router) {
      this.router.back()
    } else {
      window.history.back()
    }
  }

  // 檢查路由權限
  canAccess(
    routeName: RouteName,
    userPermissions: RoutePermission[] = []
  ): boolean {
    const config = ROUTE_CONFIGS[routeName]
    if (!config) return false

    // 公開路由總是可以訪問
    if (config.permission === RoutePermission.PUBLIC) {
      return true
    }

    // 檢查使用者權限
    return userPermissions.includes(config.permission)
  }

  // 獲取路由配置
  getConfig(routeName: RouteName): RouteConfig | null {
    return ROUTE_CONFIGS[routeName] || null
  }

  // 根據路徑獲取路由名稱
  getRouteNameByPath(path: string): RouteName | null {
    for (const [routeName, config] of Object.entries(ROUTE_CONFIGS)) {
      if (this.matchPath(config.path, path)) {
        return routeName as RouteName
      }
    }
    return null
  }

  // 路徑匹配
  private matchPath(pattern: string, path: string): boolean {
    // 移除查詢參數
    const cleanPath = path.split('?')[0] || ''

    // 簡單的路徑匹配邏輯
    const patternParts = pattern.split('/')
    const pathParts = cleanPath.split('/')

    if (patternParts.length !== pathParts.length) {
      return false
    }

    return patternParts.every((part, index) => {
      return part.startsWith(':') || part === pathParts[index]
    })
  }

  // 生成面包屑
  generateBreadcrumbs(path: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    const pathParts = path.split('/').filter(part => part !== '')

    // 添加首頁
    breadcrumbs.push({
      name: '首頁',
      path: '/',
      active: pathParts.length === 0,
    })

    // 逐級添加路徑
    let currentPath = ''
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`
      const routeName = this.getRouteNameByPath(currentPath)
      const config = routeName ? ROUTE_CONFIGS[routeName] : null

      breadcrumbs.push({
        name: config?.title || part,
        path: currentPath,
        active: index === pathParts.length - 1,
      })
    })

    return breadcrumbs
  }

  // 獲取分類路由
  getRoutesByCategory(category: string): RouteConfig[] {
    return Object.values(ROUTE_CONFIGS).filter(
      config => config.category === category
    )
  }

  // 獲取導航選單項目
  getNavigationItems(userPermissions: RoutePermission[] = []): Array<{
    category: string
    routes: RouteConfig[]
  }> {
    const categories = new Map<string, RouteConfig[]>()

    Object.values(ROUTE_CONFIGS).forEach(config => {
      if (this.canAccess(this.getRouteNameByConfig(config), userPermissions)) {
        const category = config.category || 'other'
        if (!categories.has(category)) {
          categories.set(category, [])
        }
        categories.get(category)!.push(config)
      }
    })

    return Array.from(categories.entries()).map(([category, routes]) => ({
      category,
      routes,
    }))
  }

  private getRouteNameByConfig(config: RouteConfig): RouteName {
    for (const [routeName, routeConfig] of Object.entries(ROUTE_CONFIGS)) {
      if (routeConfig === config) {
        return routeName as RouteName
      }
    }
    return RouteName.HOME
  }
}

// 全域路由管理器實例
export const routeManager = new RouteManager()

// React Hook
export const useRouteManager = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [currentRoute, setCurrentRoute] = useState<RouteName | null>(null)

  useEffect(() => {
    routeManager.setRouter(router)
    routeManager.setCurrentPath(pathname)

    const routeName = routeManager.getRouteNameByPath(pathname)
    setCurrentRoute(routeName)
  }, [router, pathname])

  return {
    navigate: routeManager.navigate.bind(routeManager),
    replace: routeManager.replace.bind(routeManager),
    back: routeManager.back.bind(routeManager),
    buildPath: routeManager.buildPath.bind(routeManager),
    canAccess: routeManager.canAccess.bind(routeManager),
    getConfig: routeManager.getConfig.bind(routeManager),
    generateBreadcrumbs: routeManager.generateBreadcrumbs.bind(routeManager),
    getNavigationItems: routeManager.getNavigationItems.bind(routeManager),
    currentRoute,
    currentPath: pathname,
  }
}

export default routeManager
