/**
 * Authentication Store
 *
 * Centralized authentication state management with secure token handling,
 * user session management, and permission checks.
 */

import {
  AuthState,
  AuthAction,
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  PasswordResetData,
  UserUpdateData,
  AuthResponse,
  TokenRefreshResponse,
  PermissionResult,
  AuthEvent,
  AuthEventType,
  isValidTokens,
  isValidUser,
  hasRole,
  hasPermission,
  hasAnyRole,
  hasAnyPermission,
  hasAllPermissions,
  isTokenExpired,
  isTokenNearExpiry,
  getTokenTimeRemaining,
} from './types'

import { SecureAuthStorage, authStorage } from './storage'
import { UserRole } from '@/config/constants'

/**
 * Authentication Store Class
 */
export class AuthStore {
  private state: AuthState
  private storage: SecureAuthStorage
  private listeners: Set<(state: AuthState) => void> = new Set()
  private eventListeners: Set<(event: AuthEvent) => void> = new Set()
  private tokenRefreshTimer: NodeJS.Timeout | undefined = undefined
  private sessionWarningTimer: NodeJS.Timeout | undefined = undefined

  constructor(storage?: SecureAuthStorage) {
    this.storage = storage || authStorage.storage
    this.state = this.getInitialState()
  }

  /**
   * Get initial state
   */
  private getInitialState(): AuthState {
    return {
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      user: null,
      tokens: null,
      showLoginModal: false,
      showSignupModal: false,
      showForgotPasswordModal: false,
      showTwoFactorModal: false,
      rememberMe: false,
      error: null,
      sessionExpireWarning: false,
      sessionTimeRemaining: 0,
    }
  }

  /**
   * Get current state
   */
  getState(): AuthState {
    return { ...this.state }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Subscribe to auth events
   */
  subscribeToEvents(listener: (event: AuthEvent) => void): () => void {
    this.eventListeners.add(listener)
    return () => this.eventListeners.delete(listener)
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates }
    this.listeners.forEach(listener => listener(this.state))
  }

  /**
   * Emit auth event
   */
  private emitEvent(type: AuthEventType, data?: any): void {
    const event: AuthEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
    }

    if (this.state.user?.profile.id) {
      event.userId = this.state.user.profile.id
    }

    this.eventListeners.forEach(listener => listener(event))
  }

  /**
   * Initialize auth store
   */
  async initialize(): Promise<void> {
    this.setState({ isLoading: true })

    try {
      // Load stored auth data
      const [storedTokens, storedUser, rememberMe, redirectPath] =
        await Promise.all([
          this.storage.getTokens(),
          this.storage.getUser(),
          this.storage.getRememberMe(),
          this.storage.getLoginRedirect(),
        ])

      // Validate stored data
      if (storedTokens && isValidTokens(storedTokens)) {
        // Check if tokens are expired
        if (isTokenExpired(storedTokens.expiresAt)) {
          // Try to refresh tokens
          const refreshResult = await this.refreshTokens()
          if (refreshResult.success && refreshResult.tokens) {
            const stateUpdate: Partial<AuthState> = {
              isAuthenticated: true,
              tokens: refreshResult.tokens,
              user: storedUser && isValidUser(storedUser) ? storedUser : null,
              rememberMe,
            }

            if (redirectPath) {
              stateUpdate.loginRedirectPath = redirectPath
            }

            this.setState(stateUpdate)
            this.setupTokenRefresh(refreshResult.tokens)
          } else {
            // Clear invalid data
            await this.clearAuthData()
          }
        } else {
          // Tokens are valid
          const stateUpdate: Partial<AuthState> = {
            isAuthenticated: true,
            tokens: storedTokens,
            user: storedUser && isValidUser(storedUser) ? storedUser : null,
            rememberMe,
          }

          if (redirectPath) {
            stateUpdate.loginRedirectPath = redirectPath
          }

          this.setState(stateUpdate)
          this.setupTokenRefresh(storedTokens)
        }
      }

      this.setState({ isInitialized: true, isLoading: false })

      // Clean up expired storage items
      await this.storage.cleanExpiredItems()
    } catch (error) {
      console.error('Auth initialization failed:', error)
      this.setState({
        isInitialized: true,
        isLoading: false,
        error: 'Failed to initialize authentication',
      })
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    this.setState({ isLoading: true, error: null })

    try {
      // This would normally call your API
      const response = await this.callLoginAPI(credentials)

      if (response.success && response.user && response.tokens) {
        // Store auth data
        await Promise.all([
          this.storage.setTokens(response.tokens),
          this.storage.setUser(response.user),
          this.storage.setRememberMe(credentials.rememberMe || false),
        ])

        this.setState({
          isAuthenticated: true,
          user: response.user,
          tokens: response.tokens,
          rememberMe: credentials.rememberMe || false,
          isLoading: false,
          error: null,
        })

        this.setupTokenRefresh(response.tokens)
        this.emitEvent('login', { userId: response.user.profile.id })

        return response
      } else if (response.requiresTwoFactor) {
        this.setState({
          isLoading: false,
          showTwoFactorModal: true,
        })
        this.emitEvent('two_factor_required')
        return response
      } else {
        this.setState({
          isLoading: false,
          error: response.message || 'Login failed',
        })
        return response
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'
      this.setState({
        isLoading: false,
        error: errorMessage,
      })
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    this.setState({ isLoading: true, error: null })

    try {
      const response = await this.callRegisterAPI(data)

      if (response.success && response.user && response.tokens) {
        await Promise.all([
          this.storage.setTokens(response.tokens),
          this.storage.setUser(response.user),
          this.storage.setRememberMe(false),
        ])

        this.setState({
          isAuthenticated: true,
          user: response.user,
          tokens: response.tokens,
          isLoading: false,
          error: null,
        })

        this.setupTokenRefresh(response.tokens)
        this.emitEvent('register', { userId: response.user.profile.id })

        return response
      } else {
        this.setState({
          isLoading: false,
          error: response.message || 'Registration failed',
        })
        return response
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed'
      this.setState({
        isLoading: false,
        error: errorMessage,
      })
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.setState({ isLoading: true })

    try {
      // Call logout API if needed
      await this.callLogoutAPI()
    } catch (error) {
      console.error('Logout API call failed:', error)
    }

    // Clear local state and storage
    await this.clearAuthData()
    this.clearTimers()

    this.setState({
      ...this.getInitialState(),
      isInitialized: true,
    })

    this.emitEvent('logout')
  }

  /**
   * Refresh authentication tokens
   */
  async refreshTokens(): Promise<TokenRefreshResponse> {
    const currentTokens = this.state.tokens

    if (!currentTokens || !currentTokens.refreshToken) {
      return { success: false, message: 'No refresh token available' }
    }

    try {
      const response = await this.callRefreshTokenAPI(
        currentTokens.refreshToken
      )

      if (response.success && response.tokens) {
        await this.storage.setTokens(response.tokens)

        this.setState({
          tokens: response.tokens,
          error: null,
        })

        this.setupTokenRefresh(response.tokens)
        this.emitEvent('token_refresh')

        return response
      } else {
        // Refresh failed, logout user
        await this.logout()
        this.emitEvent('token_expired')
        return response
      }
    } catch (error) {
      await this.logout()
      this.emitEvent('token_expired')
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Token refresh failed',
      }
    }
  }

  /**
   * Update user information
   */
  async updateUser(
    updates: UserUpdateData
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    if (!this.state.user) {
      return { success: false, message: 'User not authenticated' }
    }

    this.setState({ isLoading: true, error: null })

    try {
      const response = await this.callUpdateUserAPI(updates)

      if (response.success && response.user) {
        await this.storage.setUser(response.user)

        this.setState({
          user: response.user,
          isLoading: false,
          error: null,
        })

        this.emitEvent('profile_updated', { updates })

        return response
      } else {
        this.setState({
          isLoading: false,
          error: response.message || 'Failed to update user',
        })
        return response
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update user'
      this.setState({
        isLoading: false,
        error: errorMessage,
      })
      return { success: false, message: errorMessage }
    }
  }

  /**
   * Check user permissions
   */
  checkPermissions(requiredPermissions: string[]): PermissionResult {
    const user = this.state.user

    if (!user) {
      return {
        hasPermission: false,
        requiredPermissions,
        userPermissions: [],
        missingPermissions: requiredPermissions,
      }
    }

    const userPermissions = user.permissions
    const missingPermissions = requiredPermissions.filter(
      permission => !userPermissions.includes(permission)
    )

    return {
      hasPermission: missingPermissions.length === 0,
      requiredPermissions,
      userPermissions,
      missingPermissions,
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return hasRole(this.state.user, role)
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    return hasPermission(this.state.user, permission)
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return hasAnyRole(this.state.user, roles)
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return hasAnyPermission(this.state.user, permissions)
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return hasAllPermissions(this.state.user, permissions)
  }

  /**
   * UI State Management
   */
  showLoginModal(): void {
    this.setState({ showLoginModal: true })
  }

  hideLoginModal(): void {
    this.setState({ showLoginModal: false })
  }

  showSignupModal(): void {
    this.setState({ showSignupModal: true })
  }

  hideSignupModal(): void {
    this.setState({ showSignupModal: false })
  }

  showForgotPasswordModal(): void {
    this.setState({ showForgotPasswordModal: true })
  }

  hideForgotPasswordModal(): void {
    this.setState({ showForgotPasswordModal: false })
  }

  showTwoFactorModal(): void {
    this.setState({ showTwoFactorModal: true })
  }

  hideTwoFactorModal(): void {
    this.setState({ showTwoFactorModal: false })
  }

  /**
   * Set login redirect path
   */
  async setLoginRedirect(path: string): Promise<void> {
    this.setState({ loginRedirectPath: path })
    await this.storage.setLoginRedirect(path)
  }

  /**
   * Get and clear login redirect path
   */
  async getAndClearLoginRedirect(): Promise<string | null> {
    const path =
      this.state.loginRedirectPath || (await this.storage.getLoginRedirect())
    if (path) {
      const stateUpdate: Partial<AuthState> = {}
      delete stateUpdate.loginRedirectPath
      this.setState(stateUpdate)
      this.storage.removeItem('auth_redirect')
    }
    return path
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.setState({ error: null })
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(tokens: AuthTokens): void {
    this.clearTimers()

    const timeUntilRefresh =
      getTokenTimeRemaining(tokens.expiresAt) - 5 * 60 * 1000 // 5 minutes before expiry
    const timeUntilWarning =
      getTokenTimeRemaining(tokens.expiresAt) - 10 * 60 * 1000 // 10 minutes before expiry

    if (timeUntilWarning > 0) {
      this.sessionWarningTimer = setTimeout(() => {
        this.setState({
          sessionExpireWarning: true,
          sessionTimeRemaining: Math.floor(
            getTokenTimeRemaining(tokens.expiresAt) / 1000
          ),
        })
      }, timeUntilWarning)
    }

    if (timeUntilRefresh > 0) {
      this.tokenRefreshTimer = setTimeout(async () => {
        const result = await this.refreshTokens()
        if (!result.success) {
          this.emitEvent('session_expired')
        }
      }, timeUntilRefresh)
    }
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer)
      this.tokenRefreshTimer = undefined
    }
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer)
      this.sessionWarningTimer = undefined
    }
  }

  /**
   * Clear all auth data
   */
  private async clearAuthData(): Promise<void> {
    await this.storage.clearAuthData()
  }

  /**
   * API call methods (to be implemented with actual API)
   */
  private async callLoginAPI(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        if (
          credentials.email === 'admin@example.com' &&
          credentials.password === 'password'
        ) {
          resolve({
            success: true,
            user: this.getMockUser(),
            tokens: this.getMockTokens(),
          })
        } else {
          resolve({
            success: false,
            message: 'Invalid credentials',
          })
        }
      }, 1000)
    })
  }

  private async callRegisterAPI(data: RegisterData): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          user: this.getMockUser(),
          tokens: this.getMockTokens(),
        })
      }, 1000)
    })
  }

  private async callLogoutAPI(): Promise<void> {
    // Mock implementation - replace with actual API call
    return new Promise(resolve => {
      setTimeout(resolve, 500)
    })
  }

  private async callRefreshTokenAPI(
    refreshToken: string
  ): Promise<TokenRefreshResponse> {
    // Mock implementation - replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          tokens: this.getMockTokens(),
        })
      }, 500)
    })
  }

  private async callUpdateUserAPI(
    updates: UserUpdateData
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    // Mock implementation - replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        const currentUser = this.state.user
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            profile: { ...currentUser.profile, ...updates.profile },
            preferences: { ...currentUser.preferences, ...updates.preferences },
          }
          resolve({
            success: true,
            user: updatedUser,
          })
        } else {
          resolve({
            success: false,
            message: 'User not found',
          })
        }
      }, 500)
    })
  }

  /**
   * Mock data generators (to be removed in production)
   */
  private getMockTokens(): AuthTokens {
    const now = Math.floor(Date.now() / 1000)
    return {
      accessToken: 'mock_access_token_' + now,
      refreshToken: 'mock_refresh_token_' + now,
      expiresAt: now + 3600, // 1 hour
      refreshExpiresAt: now + 86400, // 24 hours
      tokenType: 'Bearer' as const,
    }
  }

  private getMockUser(): User {
    return {
      profile: {
        id: 'user_123',
        email: 'admin@example.com',
        username: 'admin',
        displayName: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User',
        timezone: 'UTC',
        locale: 'en',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      roles: [UserRole.OWNER],
      permissions: ['read', 'write', 'admin'],
      preferences: {
        theme: 'system',
        sidebarCollapsed: false,
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        analyticsOptOut: false,
        defaultDocumentView: 'list',
        autoSave: true,
        autoSaveInterval: 30,
        keyboardShortcuts: true,
      },
      subscription: {
        plan: 'enterprise',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancelAtPeriodEnd: false,
        features: [
          'unlimited_documents',
          'advanced_collaboration',
          'priority_support',
        ],
        usage: {
          documents: 150,
          storage: 2048,
          collaborators: 25,
          apiCalls: 1000,
        },
        limits: {
          documents: -1,
          storage: -1,
          collaborators: -1,
          apiCalls: 10000,
        },
      },
      security: {
        twoFactorEnabled: false,
        backupCodesGenerated: false,
        lastPasswordChange: new Date().toISOString(),
        loginSessions: [],
        securityQuestions: false,
        passwordStrength: 'strong',
      },
      emailVerified: true,
      phoneVerified: false,
      onboardingCompleted: true,
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      isSuspended: false,
    }
  }

  /**
   * Destroy the store and clean up resources
   */
  destroy(): void {
    this.clearTimers()
    this.listeners.clear()
    this.eventListeners.clear()
  }
}

/**
 * Default auth store instance
 */
export const defaultAuthStore = new AuthStore()

export default defaultAuthStore
