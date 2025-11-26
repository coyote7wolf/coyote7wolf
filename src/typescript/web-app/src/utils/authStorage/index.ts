/**
 * 認證存儲系統
 * 提供安全的認證資訊存儲、管理和同步功能
 */

import { encrypt, decrypt } from '../storage'

// 認證狀態
export enum AuthStatus {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATED = 'AUTHENTICATED',
  EXPIRED = 'EXPIRED',
  REFRESHING = 'REFRESHING',
  ERROR = 'ERROR',
}

// 使用者權限
export enum UserRole {
  USER = 'USER',
  VERIFIED = 'VERIFIED',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
}

// Token 類型
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  idToken?: string
  expiresAt: number
  tokenType: 'Bearer'
  scopes: string[]
}

// 使用者資訊
export interface UserInfo {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  permissions: string[]
  isEmailVerified: boolean
  isPremium: boolean
  createdAt: string
  lastLoginAt: string
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'auto'
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      inApp: boolean
    }
  }
}

// 認證狀態
export interface AuthState {
  status: AuthStatus
  user: UserInfo | null
  tokens: AuthTokens | null
  sessionId: string | null
  lastActivity: number
  expiresAt: number | null
  error: string | null
}

// 認證事件
export enum AuthEvent {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  USER_UPDATED = 'USER_UPDATED',
  PERMISSIONS_CHANGED = 'PERMISSIONS_CHANGED',
}

// 認證事件監聽器
export type AuthEventListener = (event: AuthEvent, data?: any) => void

// 儲存鍵名常數
const STORAGE_KEYS = {
  AUTH_STATE: 'auth_state',
  TOKENS: 'auth_tokens',
  USER_INFO: 'user_info',
  SESSION_ID: 'session_id',
  REMEMBER_ME: 'remember_me',
  LAST_ACTIVITY: 'last_activity',
  DEVICE_ID: 'device_id',
} as const

// Mock 使用者資料
const MOCK_USERS: Record<string, UserInfo> = {
  'user@example.com': {
    id: 'user_001',
    email: 'user@example.com',
    name: '張小明',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: UserRole.USER,
    permissions: ['documents:read', 'documents:write'],
    isEmailVerified: true,
    isPremium: false,
    createdAt: '2023-01-15T08:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    preferences: {
      language: 'zh-TW',
      theme: 'light',
      timezone: 'Asia/Taipei',
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
    },
  },
  'premium@example.com': {
    id: 'user_002',
    email: 'premium@example.com',
    name: '李小華',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face',
    role: UserRole.PREMIUM,
    permissions: [
      'documents:read',
      'documents:write',
      'documents:share',
      'ai:access',
    ],
    isEmailVerified: true,
    isPremium: true,
    createdAt: '2023-02-20T09:30:00.000Z',
    lastLoginAt: new Date().toISOString(),
    preferences: {
      language: 'zh-TW',
      theme: 'dark',
      timezone: 'Asia/Taipei',
      notifications: {
        email: true,
        push: false,
        inApp: true,
      },
    },
  },
  'admin@example.com': {
    id: 'admin_001',
    email: 'admin@example.com',
    name: '王管理員',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: UserRole.ADMIN,
    permissions: ['*'],
    isEmailVerified: true,
    isPremium: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    preferences: {
      language: 'zh-TW',
      theme: 'auto',
      timezone: 'Asia/Taipei',
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
    },
  },
}

// 認證存儲管理器
class AuthStorageManager {
  private eventListeners: Map<AuthEvent, AuthEventListener[]> = new Map()
  private refreshTimer: NodeJS.Timeout | null = null
  private activityTimer: NodeJS.Timeout | null = null
  private storageAvailable = typeof window !== 'undefined'

  constructor() {
    if (this.storageAvailable) {
      this.initializeActivityTracking()
      this.setupStorageListener()
    }
  }

  // 初始化活動追蹤
  private initializeActivityTracking() {
    const trackActivity = () => {
      this.updateLastActivity()
    }

    // 追蹤使用者活動
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true })
    })

    // 設定定期檢查
    this.activityTimer = setInterval(() => {
      this.checkSessionValidity()
    }, 60000) // 每分鐘檢查一次
  }

  // 設定儲存變化監聽
  private setupStorageListener() {
    window.addEventListener('storage', e => {
      if (e.key === STORAGE_KEYS.AUTH_STATE) {
        // 其他標籤頁的認證狀態變化
        this.emit(AuthEvent.USER_UPDATED)
      }
    })
  }

  // 登入
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<AuthState> {
    try {
      // Mock 登入邏輯
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 延遲

      const user = MOCK_USERS[email]
      if (!user || password !== 'demo123') {
        throw new Error('Invalid credentials')
      }

      // 生成 mock tokens
      const tokens = this.generateMockTokens(user)
      const sessionId = this.generateSessionId()
      const now = Date.now()

      const authState: AuthState = {
        status: AuthStatus.AUTHENTICATED,
        user: {
          ...user,
          lastLoginAt: new Date().toISOString(),
        },
        tokens,
        sessionId,
        lastActivity: now,
        expiresAt: tokens.expiresAt,
        error: null,
      }

      // 儲存認證狀態
      await this.saveAuthState(authState, rememberMe)

      // 設定自動刷新
      this.setupTokenRefresh(tokens.expiresAt - now - 60000) // 提前1分鐘刷新

      // 發送事件
      this.emit(AuthEvent.LOGIN, { user, sessionId })

      return authState
    } catch (error) {
      const errorState: AuthState = {
        status: AuthStatus.ERROR,
        user: null,
        tokens: null,
        sessionId: null,
        lastActivity: Date.now(),
        expiresAt: null,
        error: error instanceof Error ? error.message : 'Login failed',
      }

      await this.saveAuthState(errorState, false)
      return errorState
    }
  }

  // 登出
  async logout(): Promise<void> {
    try {
      const currentState = await this.getAuthState()

      // 清除所有儲存的資料
      await this.clearAuthData()

      // 停止定時器
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }

      // 發送事件
      this.emit(AuthEvent.LOGOUT, { user: currentState?.user })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 刷新 Token
  async refreshToken(): Promise<AuthTokens | null> {
    try {
      const currentState = await this.getAuthState()
      if (!currentState?.tokens?.refreshToken) {
        throw new Error('No refresh token available')
      }

      // 更新狀態為刷新中
      const refreshingState: AuthState = {
        ...currentState,
        status: AuthStatus.REFRESHING,
      }
      await this.saveAuthState(refreshingState, false)

      // Mock token 刷新
      await new Promise(resolve => setTimeout(resolve, 500))

      const newTokens = this.generateMockTokens(currentState.user!)
      const updatedState: AuthState = {
        ...currentState,
        status: AuthStatus.AUTHENTICATED,
        tokens: newTokens,
        expiresAt: newTokens.expiresAt,
        lastActivity: Date.now(),
        error: null,
      }

      await this.saveAuthState(updatedState, false)

      // 設定下次刷新
      this.setupTokenRefresh(newTokens.expiresAt - Date.now() - 60000)

      // 發送事件
      this.emit(AuthEvent.TOKEN_REFRESH, { tokens: newTokens })

      return newTokens
    } catch (error) {
      const errorState: AuthState = {
        status: AuthStatus.ERROR,
        user: null,
        tokens: null,
        sessionId: null,
        lastActivity: Date.now(),
        expiresAt: null,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      }

      await this.saveAuthState(errorState, false)
      this.emit(AuthEvent.SESSION_EXPIRED)
      return null
    }
  }

  // 獲取認證狀態
  async getAuthState(): Promise<AuthState | null> {
    if (!this.storageAvailable) return null

    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.AUTH_STATE)
      if (!encrypted) return null

      let decrypted: string
      try {
        // Try proper decryption first
        decrypted = await decrypt(encrypted)
      } catch {
        // Fallback to simple base64 decode for mock data
        try {
          decrypted = atob(encrypted)
        } catch {
          // If both fail, try as plain JSON
          decrypted = encrypted
        }
      }

      return JSON.parse(decrypted) as AuthState
    } catch (error) {
      console.error('Failed to get auth state:', error)
      return null
    }
  }

  // 獲取使用者資訊
  async getUserInfo(): Promise<UserInfo | null> {
    const authState = await this.getAuthState()
    return authState?.user || null
  }

  // 獲取存取 Token
  async getAccessToken(): Promise<string | null> {
    const authState = await this.getAuthState()

    if (!authState?.tokens) return null

    // 檢查 token 是否即將過期
    const now = Date.now()
    const expiresIn = authState.tokens.expiresAt - now

    if (expiresIn < 60000) {
      // 少於1分鐘就刷新
      const newTokens = await this.refreshToken()
      return newTokens?.accessToken || null
    }

    return authState.tokens.accessToken
  }

  // 檢查是否已認證
  async isAuthenticated(): Promise<boolean> {
    const authState = await this.getAuthState()
    return (
      authState?.status === AuthStatus.AUTHENTICATED &&
      authState?.tokens !== null &&
      (authState?.expiresAt || 0) > Date.now()
    )
  }

  // 檢查權限
  async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getUserInfo()
    if (!user) return false

    // 管理員有所有權限
    if (user.permissions.includes('*')) return true

    return user.permissions.includes(permission)
  }

  // 檢查角色
  async hasRole(role: UserRole): Promise<boolean> {
    const user = await this.getUserInfo()
    if (!user) return false

    // 角色層級檢查
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.VERIFIED]: 2,
      [UserRole.PREMIUM]: 3,
      [UserRole.ADMIN]: 4,
    }

    return roleHierarchy[user.role] >= roleHierarchy[role]
  }

  // 更新使用者資訊
  async updateUserInfo(updates: Partial<UserInfo>): Promise<void> {
    const currentState = await this.getAuthState()
    if (!currentState?.user) return

    const updatedUser = { ...currentState.user, ...updates }
    const updatedState: AuthState = {
      ...currentState,
      user: updatedUser,
    }

    await this.saveAuthState(updatedState, false)
    this.emit(AuthEvent.USER_UPDATED, { user: updatedUser })
  }

  // 事件監聽
  on(event: AuthEvent, listener: AuthEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  // 移除事件監聽
  off(event: AuthEvent, listener: AuthEventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // 發送事件
  private emit(event: AuthEvent, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data)
        } catch (error) {
          console.error('Auth event listener error:', error)
        }
      })
    }
  }

  // 儲存認證狀態
  private async saveAuthState(
    authState: AuthState,
    persistent: boolean
  ): Promise<void> {
    if (!this.storageAvailable) return

    try {
      const encrypted = await encrypt(JSON.stringify(authState))

      if (persistent) {
        localStorage.setItem(STORAGE_KEYS.AUTH_STATE, encrypted)
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
      } else {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, encrypted)
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
      }
    } catch (error) {
      console.error('Failed to save auth state:', error)
    }
  }

  // 清除認證資料
  private async clearAuthData(): Promise<void> {
    if (!this.storageAvailable) return

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  }

  // 生成 Mock Tokens
  private generateMockTokens(user: UserInfo): AuthTokens {
    const now = Date.now()
    const expiresIn = 3600000 // 1小時

    return {
      accessToken: this.generateJWT({
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        exp: Math.floor((now + expiresIn) / 1000),
      }),
      refreshToken: this.generateRandomToken(),
      tokenType: 'Bearer',
      expiresAt: now + expiresIn,
      scopes: ['read', 'write'],
    }
  }

  // 生成模擬 JWT
  private generateJWT(payload: any): string {
    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    const signature = this.generateRandomToken(43) // Mock signature

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  // 生成隨機 Token
  private generateRandomToken(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 生成 Session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${this.generateRandomToken(16)}`
  }

  // 設定 Token 刷新
  private setupTokenRefresh(delay: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    if (delay > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken()
      }, delay)
    }
  }

  // 更新最後活動時間
  private updateLastActivity(): void {
    const now = Date.now()
    if (this.storageAvailable) {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString())
    }
  }

  // 檢查 Session 有效性
  private async checkSessionValidity(): Promise<void> {
    const authState = await this.getAuthState()
    if (!authState || authState.status !== AuthStatus.AUTHENTICATED) return

    const now = Date.now()

    // 檢查是否過期
    if (authState.expiresAt && authState.expiresAt < now) {
      await this.refreshToken()
      return
    }

    // 檢查是否長時間未活動（24小時）
    const lastActivity = authState.lastActivity
    const maxInactivity = 24 * 60 * 60 * 1000 // 24小時

    if (now - lastActivity > maxInactivity) {
      this.emit(AuthEvent.SESSION_EXPIRED)
      await this.logout()
    }
  }

  // 清理資源
  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    if (this.activityTimer) {
      clearInterval(this.activityTimer)
      this.activityTimer = null
    }

    this.eventListeners.clear()
  }
}

// 全域實例
export const authStorage = new AuthStorageManager()

// React Hook
export function useAuthStorage() {
  return authStorage
}

export default authStorage
