/**
 * Authentication Store Module
 *
 * Centralized authentication state management with secure token handling,
 * user session management, permission checks, and cross-tab synchronization.
 */

// Import and re-export main components
import { AuthStore, defaultAuthStore } from './store'
import {
  SecureAuthStorage,
  AuthStorageSync,
  AuthStorageFactory,
  authStorage,
} from './storage'
import {
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
import type {
  User,
  LoginCredentials,
  RegisterData,
  UserUpdateData,
  AuthResponse,
  TokenRefreshResponse,
  PermissionResult,
} from './types'
import { UserRole } from '@/config/constants'

// Export main auth store
export { AuthStore, defaultAuthStore }

// Export storage utilities
export { SecureAuthStorage, AuthStorageSync, AuthStorageFactory, authStorage }

// Export all types and interfaces
export type {
  AuthTokens,
  UserProfile,
  UserPreferences,
  UserSubscription,
  UserSecurity,
  UserSession,
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  PasswordResetData,
  TwoFactorData,
  OAuthProvider,
  AuthResponse,
  TokenRefreshResponse,
  UserUpdateData,
  PermissionResult,
  AuthEvent,
  AuthEventType,
  AuthConfig,
  AuthStorage,
  AuthAction,
} from './types'

// Export utility functions
export {
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

/**
 * Initialize auth store with configuration
 */
export const initializeAuth = async (config?: {
  useSessionStorage?: boolean
  enableEncryption?: boolean
  enableSync?: boolean
}) => {
  const { storage, sync } = AuthStorageFactory.createStorage(config)
  const store = new AuthStore(storage)

  await store.initialize()

  return {
    store,
    storage,
    sync,
  }
}

/**
 * Create auth store for testing
 */
export const createTestAuthStore = () => {
  const storage = AuthStorageFactory.createMemoryStorage()
  return new AuthStore(storage as SecureAuthStorage)
}

/**
 * Auth Store React Hook (to be implemented)
 */
export interface UseAuthReturn {
  // Auth state
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  user: User | null
  error: string | null

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshTokens: () => Promise<TokenRefreshResponse>
  updateUser: (
    updates: UserUpdateData
  ) => Promise<{ success: boolean; user?: User; message?: string }>

  // Permission checks
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  checkPermissions: (permissions: string[]) => PermissionResult

  // UI state
  showLoginModal: () => void
  hideLoginModal: () => void
  showSignupModal: () => void
  hideSignupModal: () => void
  showForgotPasswordModal: () => void
  hideForgotPasswordModal: () => void
  showTwoFactorModal: () => void
  hideTwoFactorModal: () => void

  // Utility
  setLoginRedirect: (path: string) => Promise<void>
  getAndClearLoginRedirect: () => Promise<string | null>
  clearError: () => void
}

/**
 * Auth Store Provider Props (to be implemented)
 */
export interface AuthProviderProps {
  children: React.ReactNode
  store?: AuthStore
  config?: {
    useSessionStorage?: boolean
    enableEncryption?: boolean
    enableSync?: boolean
  }
}

/**
 * Auth Guard Component Props (to be implemented)
 */
export interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRoles?: UserRole[]
  requirePermissions?: string[]
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Default export with convenience methods
 */
export default {
  // Core classes
  AuthStore,
  SecureAuthStorage,
  AuthStorageSync,
  AuthStorageFactory,

  // Default instances
  defaultStore: defaultAuthStore,
  defaultStorage: authStorage,

  // Utilities
  initializeAuth,
  createTestAuthStore,

  // Type guards
  isValidTokens,
  isValidUser,

  // Permission helpers
  hasRole,
  hasPermission,
  hasAnyRole,
  hasAnyPermission,
  hasAllPermissions,

  // Token utilities
  isTokenExpired,
  isTokenNearExpiry,
  getTokenTimeRemaining,
}
