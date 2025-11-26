/**
 * Enhanced Authentication Store with API Integration
 *
 * This version integrates with the API service layer and provides
 * a complete authentication system with real API calls.
 */

import {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthEvent,
  AuthEventListener,
  AuthenticationError,
  SessionExpiredError,
  InvalidCredentialsError,
  UserRole,
  Permission,
} from './types'

import { apiClient, ApiUtils, ApiError } from '@/services/api/client'

// Simple logger for auth operations
const logger = {
  info: (message: string, data?: any) =>
    console.log(`[AUTH INFO] ${message}`, data),
  error: (message: string, error?: any) =>
    console.error(`[AUTH ERROR] ${message}`, error),
  warn: (message: string, data?: any) =>
    console.warn(`[AUTH WARN] ${message}`, data),
}

// Simple storage wrapper
const simpleStorage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined') return null
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  async set(key: string, value: any): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      logger.error('Storage set failed', error)
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    } catch (error) {
      logger.error('Storage remove failed', error)
    }
  },

  on(key: string, callback: (value: any) => void): void {
    // Only add listener in browser environment
    if (typeof window !== 'undefined') {
      // Listen for localStorage changes from other tabs
      window.addEventListener('storage', event => {
        if (event.key === key) {
          try {
            const newValue = event.newValue ? JSON.parse(event.newValue) : null
            callback(newValue)
          } catch {
            callback(null)
          }
        }
      })
    }
  },
}

/**
 * Enhanced Authentication Store Class
 */
export class ApiAuthStore {
  private state: AuthState
  private listeners: Map<string, AuthEventListener[]> = new Map()
  private sessionTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private refreshTimer: NodeJS.Timeout | null = null
  private readonly sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
  private readonly warningThreshold = 5 * 60 * 1000 // 5 minutes
  private readonly refreshThreshold = 15 * 60 * 1000 // 15 minutes

  constructor() {
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionId: null,
      expiresAt: null,
      lastActivity: Date.now(),
    }

    this.initialize()
  }

  /**
   * Initialize the auth store
   */
  private async initialize(): Promise<void> {
    try {
      // Restore session from storage if exists
      await this.restoreSession()

      // Set up cross-tab synchronization
      this.setupCrossTabSync()

      // Set up activity tracking
      this.setupActivityTracking()

      logger.info('ApiAuthStore initialized', {
        hasSession: !!this.state.sessionId,
      })
    } catch (error) {
      logger.error('Failed to initialize ApiAuthStore', error)
    }
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    return { ...this.state }
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.state.user
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return (
      this.state.isAuthenticated &&
      !!this.state.user &&
      !this.isSessionExpired()
    )
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(): boolean {
    if (!this.state.expiresAt) return false
    return Date.now() >= this.state.expiresAt
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission | string): boolean {
    if (!this.state.user) return false
    return this.state.user.permissions.includes(permission as Permission)
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    if (!this.state.user) return false
    return this.state.user.role === role
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    this.updateState({ isLoading: true })

    try {
      logger.info('Attempting login', { email: credentials.email })

      // Call API login
      const response = await apiClient.login(credentials)

      if (!response.success) {
        throw new AuthenticationError('Login failed', 'LOGIN_FAILED')
      }

      const { user, token, refreshToken, expiresIn } = response.data

      // Convert API user to our User type
      const authUser = this.convertApiUserToUser(user)

      // Calculate expiration time
      const expiresAt = Date.now() + expiresIn * 1000
      const sessionId = this.generateSessionId()

      // Set session
      await this.setSession(sessionId, expiresAt, authUser, token, refreshToken)

      this.emit('login', { user: authUser })
      logger.info('Login successful', { userId: authUser.id })

      return authUser
    } catch (error) {
      logger.error('Login failed', error)

      // Convert API errors to auth errors
      const authError = this.convertApiErrorToAuthError(error)
      this.emit('error', { error: authError })
      throw authError
    } finally {
      this.updateState({ isLoading: false })
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    this.updateState({ isLoading: true })

    try {
      logger.info('Attempting registration', { email: credentials.email })

      // Call API register
      const response = await apiClient.register(credentials)

      if (!response.success) {
        throw new AuthenticationError(
          'Registration failed',
          'REGISTRATION_FAILED'
        )
      }

      const { user, token, refreshToken, expiresIn } = response.data

      // Convert API user to our User type
      const authUser = this.convertApiUserToUser(user)

      // Calculate expiration time
      const expiresAt = Date.now() + expiresIn * 1000
      const sessionId = this.generateSessionId()

      // Set session
      await this.setSession(sessionId, expiresAt, authUser, token, refreshToken)

      this.emit('register', { user: authUser })
      logger.info('Registration successful', { userId: authUser.id })

      return authUser
    } catch (error) {
      logger.error('Registration failed', error)

      // Convert API errors to auth errors
      const authError = this.convertApiErrorToAuthError(error)
      this.emit('error', { error: authError })
      throw authError
    } finally {
      this.updateState({ isLoading: false })
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      logger.info('Logging out user', { userId: this.state.user?.id })

      // Call API logout (if authenticated)
      if (this.isAuthenticated()) {
        try {
          await apiClient.logout()
        } catch (error) {
          // Don't fail logout if API call fails
          logger.warn('API logout failed, continuing with local logout', error)
        }
      }

      // Clear session timers
      this.clearTimers()

      // Clear storage
      await simpleStorage.remove('auth_session')
      await simpleStorage.remove('auth_user')
      await simpleStorage.remove('auth_tokens')

      // Clear API client token
      apiClient.setToken(null)

      // Reset state
      this.updateState({
        user: null,
        isAuthenticated: false,
        sessionId: null,
        expiresAt: null,
      })

      this.emit('logout', {})
      logger.info('Logout successful')
    } catch (error) {
      logger.error('Logout failed', error)
      this.emit('error', { error })
    }
  }

  /**
   * Refresh session using refresh token
   */
  async refreshSession(): Promise<void> {
    if (!this.state.sessionId) {
      throw new SessionExpiredError()
    }

    try {
      logger.info('Refreshing session')

      // Get stored refresh token
      const tokens = await simpleStorage.get<any>('auth_tokens')
      if (!tokens?.refreshToken) {
        throw new SessionExpiredError()
      }

      // Call API refresh
      const response = await apiClient.refreshToken(tokens.refreshToken)

      if (!response.success) {
        throw new SessionExpiredError()
      }

      const { token, expiresIn } = response.data
      const newExpiresAt = Date.now() + expiresIn * 1000

      // Update session
      this.updateState({
        expiresAt: newExpiresAt,
        lastActivity: Date.now(),
      })

      // Update stored tokens
      await simpleStorage.set('auth_tokens', {
        ...tokens,
        token,
      })

      // Update API client token
      apiClient.setToken(token)

      // Update session in storage
      await simpleStorage.set('auth_session', {
        sessionId: this.state.sessionId,
        userId: this.state.user!.id,
        expiresAt: newExpiresAt,
        lastActivity: Date.now(),
      })

      this.setupSessionTimers()
      logger.info('Session refreshed successfully')
    } catch (error) {
      logger.error('Session refresh failed', error)
      await this.logout()
      throw error
    }
  }

  /**
   * OAuth login
   */
  async oauthLogin(provider: 'google' | 'github' | 'microsoft'): Promise<void> {
    try {
      logger.info('Starting OAuth login', { provider })

      // TODO: Implement actual OAuth flow with API
      // For now, redirect to OAuth provider
      const oauthUrl = `/api/auth/oauth?provider=${provider}`
      window.location.href = oauthUrl
    } catch (error) {
      logger.error('OAuth login failed', error)
      this.emit('error', { error })
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: any): Promise<User> {
    if (!this.isAuthenticated()) {
      throw new AuthenticationError('Not authenticated', 'NOT_AUTHENTICATED')
    }

    this.updateState({ isLoading: true })

    try {
      logger.info('Updating user profile')

      // Call API update profile
      const response = await apiClient.updateProfile(profileData)

      if (!response.success) {
        throw new AuthenticationError('Profile update failed', 'UPDATE_FAILED')
      }

      // Convert updated user
      const updatedUser = this.convertApiUserToUser(response.data)

      // Update state and storage
      this.updateState({ user: updatedUser })
      await simpleStorage.set('auth_user', updatedUser)

      this.emit('profileUpdated', { user: updatedUser })
      logger.info('Profile updated successfully')

      return updatedUser
    } catch (error) {
      logger.error('Profile update failed', error)

      const authError = this.convertApiErrorToAuthError(error)
      this.emit('error', { error: authError })
      throw authError
    } finally {
      this.updateState({ isLoading: false })
    }
  }

  /**
   * Add event listener
   */
  on(eventType: string, listener: AuthEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(listener)
  }

  /**
   * Remove event listener
   */
  off(eventType: string, listener: AuthEventListener): void {
    const eventListeners = this.listeners.get(eventType)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(eventType: string, payload?: any): void {
    const event: AuthEvent = {
      type: eventType as any,
      payload,
      timestamp: Date.now(),
    }

    const eventListeners = this.listeners.get(eventType)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          logger.error('Error in auth event listener', error)
        }
      })
    }
  }

  /**
   * Update authentication state
   */
  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates }

    // Update last activity when state changes
    if (updates.user || updates.isAuthenticated) {
      this.state.lastActivity = Date.now()
    }
  }

  /**
   * Set session data
   */
  private async setSession(
    sessionId: string,
    expiresAt: number,
    user: User,
    token: string,
    refreshToken: string
  ): Promise<void> {
    // Update state
    this.updateState({
      user,
      isAuthenticated: true,
      sessionId,
      expiresAt,
      lastActivity: Date.now(),
    })

    // Store session data
    await simpleStorage.set('auth_session', {
      sessionId,
      userId: user.id,
      expiresAt,
      lastActivity: Date.now(),
    })

    await simpleStorage.set('auth_user', user)

    await simpleStorage.set('auth_tokens', {
      token,
      refreshToken,
    })

    // Set API client token
    apiClient.setToken(token)

    // Set up session timers
    this.setupSessionTimers()
  }

  /**
   * Restore session from storage
   */
  private async restoreSession(): Promise<void> {
    try {
      const sessionData = await simpleStorage.get<any>('auth_session')
      const userData = await simpleStorage.get<User>('auth_user')
      const tokens = await simpleStorage.get<any>('auth_tokens')

      if (sessionData && userData && tokens) {
        // Check if session is still valid
        if (Date.now() < sessionData.expiresAt) {
          this.updateState({
            user: userData,
            isAuthenticated: true,
            sessionId: sessionData.sessionId,
            expiresAt: sessionData.expiresAt,
            lastActivity: sessionData.lastActivity,
          })

          // Set API client token
          apiClient.setToken(tokens.token)

          this.setupSessionTimers()
          logger.info('Session restored from storage', { userId: userData.id })
        } else {
          // Session expired, clean up
          await this.clearStoredSession()
          logger.info('Stored session was expired, cleared')
        }
      }
    } catch (error) {
      logger.error('Failed to restore session', error)
      await this.clearStoredSession()
    }
  }

  /**
   * Clear stored session data
   */
  private async clearStoredSession(): Promise<void> {
    try {
      await simpleStorage.remove('auth_session')
      await simpleStorage.remove('auth_user')
      await simpleStorage.remove('auth_tokens')
      apiClient.setToken(null)
    } catch (error) {
      logger.error('Failed to clear stored session', error)
    }
  }

  /**
   * Setup session timers for expiration warning, auto-logout, and auto-refresh
   */
  private setupSessionTimers(): void {
    this.clearTimers()

    if (!this.state.expiresAt) return

    const now = Date.now()
    const timeToExpiry = this.state.expiresAt - now
    const timeToWarning = timeToExpiry - this.warningThreshold
    const timeToRefresh = timeToExpiry - this.refreshThreshold

    // Set refresh timer (auto-refresh before expiry)
    if (timeToRefresh > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshSession()
        } catch (error) {
          logger.warn('Auto-refresh failed', error)
        }
      }, timeToRefresh)
    }

    // Set warning timer
    if (timeToWarning > 0) {
      this.warningTimer = setTimeout(() => {
        const remainingTime = this.state.expiresAt! - Date.now()
        this.emit('sessionExpiring', { remainingTime })
      }, timeToWarning)
    }

    // Set expiry timer
    if (timeToExpiry > 0) {
      this.sessionTimer = setTimeout(() => {
        this.emit('sessionExpired', {})
        this.logout()
      }, timeToExpiry)
    }
  }

  /**
   * Clear session timers
   */
  private clearTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
      this.sessionTimer = null
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    // Listen for storage changes in other tabs
    simpleStorage.on('auth_session', (sessionData: any) => {
      if (!sessionData) {
        // Session was cleared in another tab
        this.updateState({
          user: null,
          isAuthenticated: false,
          sessionId: null,
          expiresAt: null,
        })
        this.clearTimers()
        apiClient.setToken(null)
        this.emit('logout', { reason: 'cross-tab-logout' })
      }
    })
  }

  /**
   * Setup activity tracking
   */
  private setupActivityTracking(): void {
    // Only setup in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    // Track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]

    const updateActivity = () => {
      if (this.isAuthenticated()) {
        this.updateState({ lastActivity: Date.now() })
      }
    }

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Convert API user data to our User type
   */
  private convertApiUserToUser(apiUser: any): User {
    return {
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      avatar: apiUser.avatar,
      role: this.mapApiRoleToUserRole(apiUser.role),
      permissions: this.mapApiPermissionsToPermissions(
        apiUser.permissions || []
      ),
      isVerified: apiUser.verified || false,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt,
    }
  }

  /**
   * Map API role to UserRole
   */
  private mapApiRoleToUserRole(role: string): UserRole {
    switch (role) {
      case 'admin':
        return UserRole.ADMIN
      case 'premium':
        return UserRole.PREMIUM
      case 'verified':
        return UserRole.VERIFIED
      case 'user':
      default:
        return UserRole.USER
    }
  }

  /**
   * Map API permissions to Permission enum
   */
  private mapApiPermissionsToPermissions(
    apiPermissions: string[]
  ): Permission[] {
    const permissionMap: Record<string, Permission> = {
      'documents:read': Permission.DOCUMENTS_READ,
      'documents:create': Permission.DOCUMENTS_CREATE,
      'documents:update': Permission.DOCUMENTS_UPDATE,
      'documents:delete': Permission.DOCUMENTS_DELETE,
      'documents:share': Permission.DOCUMENTS_SHARE,
      'collaborate:view': Permission.COLLABORATE_VIEW,
      'collaborate:edit': Permission.COLLABORATE_EDIT,
      'collaborate:comment': Permission.COLLABORATE_COMMENT,
      'collaborate:invite': Permission.COLLABORATE_INVITE,
      'admin:users': Permission.ADMIN_USERS,
      'admin:system': Permission.ADMIN_SYSTEM,
      'admin:analytics': Permission.ADMIN_ANALYTICS,
    }

    return apiPermissions
      .map(perm => permissionMap[perm])
      .filter((perm): perm is Permission => Boolean(perm))
  }

  /**
   * Convert API errors to authentication errors
   */
  private convertApiErrorToAuthError(error: any): AuthenticationError {
    if (ApiUtils.isApiError(error)) {
      const apiError = error as ApiError

      switch (apiError.code) {
        case 'EMAIL_PASSWORD_INVALID':
        case 'INVALID_CREDENTIALS':
          return new InvalidCredentialsError()

        case 'EMAIL_ALREADY_EXISTS':
          return new AuthenticationError(
            '此電子郵件已被註冊',
            'EMAIL_EXISTS',
            409
          )

        case 'ACCOUNT_INACTIVE':
          return new AuthenticationError(
            '帳號已被停用，請聯繫管理員',
            'ACCOUNT_INACTIVE',
            403
          )

        case 'NOT_AUTHENTICATED':
        case 'NO_ACTIVE_SESSION':
        case 'INVALID_TOKEN':
          return new SessionExpiredError()

        default:
          return new AuthenticationError(
            apiError.message || '認證失敗',
            apiError.code,
            apiError.status
          )
      }
    }

    return new AuthenticationError('發生未知錯誤', 'UNKNOWN_ERROR')
  }
}

// Create singleton instance
export const apiAuthStore = new ApiAuthStore()

// Export default
export default apiAuthStore
