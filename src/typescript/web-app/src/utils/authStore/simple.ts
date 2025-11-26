/**
 * Simple Authentication Store
 *
 * A simplified authentication store that works with the current system
 * and can be expanded later when full integration is needed.
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
 * Simple Authentication Store Class
 */
export class SimpleAuthStore {
  private state: AuthState
  private listeners: Map<string, AuthEventListener[]> = new Map()
  private sessionTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private readonly sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
  private readonly warningThreshold = 5 * 60 * 1000 // 5 minutes

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

      logger.info('AuthStore initialized', {
        hasSession: !!this.state.sessionId,
      })
    } catch (error) {
      logger.error('Failed to initialize AuthStore', error)
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

      const mockUser = await this.mockLogin(credentials)
      const sessionId = this.generateSessionId()
      const expiresAt = Date.now() + this.sessionTimeout

      await this.setSession(sessionId, expiresAt, mockUser)

      this.emit('login', { user: mockUser })
      logger.info('Login successful', { userId: mockUser.id })

      return mockUser
    } catch (error) {
      logger.error('Login failed', error)
      this.emit('error', { error })
      throw error
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

      const mockUser = await this.mockRegister(credentials)

      logger.info('Registration successful', { userId: mockUser.id })

      return mockUser
    } catch (error) {
      logger.error('Registration failed', error)
      this.emit('error', { error })
      throw error
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

      // Clear session timers
      this.clearTimers()

      // Clear storage
      await simpleStorage.remove('auth_session')
      await simpleStorage.remove('auth_user')

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
   * Refresh session
   */
  async refreshSession(): Promise<void> {
    if (!this.state.sessionId) {
      throw new SessionExpiredError()
    }

    try {
      logger.info('Refreshing session')

      const newExpiresAt = Date.now() + this.sessionTimeout

      this.updateState({
        expiresAt: newExpiresAt,
        lastActivity: Date.now(),
      })

      // Update storage
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

      // TODO: In next todo, implement actual OAuth flow
      // For now, redirect to mock OAuth
      const oauthUrl = `/api/auth/mock-oauth?provider=${provider}`
      window.location.href = oauthUrl
    } catch (error) {
      logger.error('OAuth login failed', error)
      this.emit('error', { error })
      throw error
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
    user: User
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

      if (sessionData && userData) {
        // Check if session is still valid
        if (Date.now() < sessionData.expiresAt) {
          this.updateState({
            user: userData,
            isAuthenticated: true,
            sessionId: sessionData.sessionId,
            expiresAt: sessionData.expiresAt,
            lastActivity: sessionData.lastActivity,
          })

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
    } catch (error) {
      logger.error('Failed to clear stored session', error)
    }
  }

  /**
   * Setup session timers for expiration warning and auto-logout
   */
  private setupSessionTimers(): void {
    this.clearTimers()

    if (!this.state.expiresAt) return

    const now = Date.now()
    const timeToExpiry = this.state.expiresAt - now
    const timeToWarning = timeToExpiry - this.warningThreshold

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
   * Mock login (will be replaced with actual API call)
   */
  private async mockLogin(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock validation
    if (
      credentials.email === 'admin@synccoreai.com' &&
      credentials.password === 'admin123'
    ) {
      return {
        id: 'user_admin',
        email: credentials.email,
        name: 'Admin User',
        avatar: 'https://via.placeholder.com/100',
        role: UserRole.ADMIN,
        permissions: Object.values(Permission),
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    if (
      credentials.email === 'user@example.com' &&
      credentials.password === 'password123'
    ) {
      return {
        id: 'user_123',
        email: credentials.email,
        name: 'John Doe',
        role: UserRole.USER,
        permissions: [
          Permission.DOCUMENTS_READ,
          Permission.DOCUMENTS_CREATE,
          Permission.DOCUMENTS_UPDATE,
          Permission.COLLABORATE_VIEW,
          Permission.COLLABORATE_EDIT,
        ],
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    throw new InvalidCredentialsError()
  }

  /**
   * Mock registration (will be replaced with actual API call)
   */
  private async mockRegister(credentials: RegisterCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock validation
    if (credentials.email === 'existing@example.com') {
      throw new AuthenticationError('Email already exists', 'EMAIL_EXISTS', 409)
    }

    return {
      id: `user_${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      role: UserRole.USER,
      permissions: [
        Permission.DOCUMENTS_READ,
        Permission.DOCUMENTS_CREATE,
        Permission.COLLABORATE_VIEW,
      ],
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

// Create singleton instance
export const authStore = new SimpleAuthStore()

// Export default
export default authStore
