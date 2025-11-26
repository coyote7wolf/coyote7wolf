/**
 * Authentication Types and Interfaces
 *
 * Comprehensive type definitions for authentication system including
 * user data, tokens, permissions, and authentication state management.
 */

import { UserRole } from '@/config/constants'

/**
 * Authentication Token Information
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  refreshExpiresAt: number
  tokenType: 'Bearer'
}

/**
 * User Profile Information
 */
export interface UserProfile {
  id: string
  email: string
  username: string
  displayName: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  jobTitle?: string
  phoneNumber?: string
  timezone: string
  locale: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  createdAt: string
  updatedAt: string
}

/**
 * User Preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  notificationsEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  analyticsOptOut: boolean
  defaultDocumentView: 'list' | 'grid' | 'card'
  autoSave: boolean
  autoSaveInterval: number
  keyboardShortcuts: boolean
}

/**
 * User Subscription Information
 */
export interface UserSubscription {
  plan: 'free' | 'pro' | 'team' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  features: string[]
  usage: {
    documents: number
    storage: number
    collaborators: number
    apiCalls: number
  }
  limits: {
    documents: number
    storage: number
    collaborators: number
    apiCalls: number
  }
}

/**
 * User Security Settings
 */
export interface UserSecurity {
  twoFactorEnabled: boolean
  backupCodesGenerated: boolean
  lastPasswordChange: string
  loginSessions: UserSession[]
  securityQuestions: boolean
  passwordStrength: 'weak' | 'medium' | 'strong'
}

/**
 * User Login Session
 */
export interface UserSession {
  id: string
  deviceInfo: {
    browser: string
    os: string
    device: string
    isMobile: boolean
  }
  location: {
    country: string
    city: string
    ip: string
  }
  lastActivity: string
  createdAt: string
  isCurrent: boolean
}

/**
 * Complete User Information
 */
export interface User {
  profile: UserProfile
  roles: UserRole[]
  permissions: string[]
  preferences: UserPreferences
  subscription: UserSubscription
  security: UserSecurity
  emailVerified: boolean
  phoneVerified: boolean
  onboardingCompleted: boolean
  lastLoginAt: string
  isActive: boolean
  isSuspended: boolean
}

/**
 * Authentication State
 */
export interface AuthState {
  // Authentication status
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  // User data
  user: User | null
  tokens: AuthTokens | null

  // UI state
  showLoginModal: boolean
  showSignupModal: boolean
  showForgotPasswordModal: boolean
  showTwoFactorModal: boolean

  // Temporary state
  rememberMe: boolean
  loginRedirectPath?: string | undefined

  // Error state
  error: string | null

  // Session management
  sessionExpireWarning: boolean
  sessionTimeRemaining: number
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  twoFactorCode?: string
}

/**
 * Registration Data
 */
export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  username: string
  firstName?: string
  lastName?: string
  agreedToTerms: boolean
  subscribeToNewsletter?: boolean
}

/**
 * Password Reset Data
 */
export interface PasswordResetData {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

/**
 * Two-Factor Authentication Data
 */
export interface TwoFactorData {
  secret: string
  qrCode: string
  backupCodes: string[]
}

/**
 * OAuth Provider Information
 */
export interface OAuthProvider {
  id: 'google' | 'github' | 'microsoft' | 'apple'
  name: string
  icon: string
  enabled: boolean
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  success: boolean
  user?: User
  tokens?: AuthTokens
  requiresTwoFactor?: boolean
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Token Refresh Response
 */
export interface TokenRefreshResponse {
  success: boolean
  tokens?: AuthTokens
  message?: string
}

/**
 * User Update Data
 */
export interface UserUpdateData {
  profile?: Partial<UserProfile>
  preferences?: Partial<UserPreferences>
}

/**
 * Permission Check Result
 */
export interface PermissionResult {
  hasPermission: boolean
  requiredPermissions: string[]
  userPermissions: string[]
  missingPermissions: string[]
}

/**
 * Authentication Events
 */
export type AuthEventType =
  | 'login'
  | 'logout'
  | 'register'
  | 'token_refresh'
  | 'token_expired'
  | 'session_expired'
  | 'permission_denied'
  | 'two_factor_required'
  | 'password_reset'
  | 'email_verified'
  | 'profile_updated'

export interface AuthEvent {
  type: AuthEventType
  timestamp: string
  data?: any
  userId?: string
}

/**
 * Authentication Configuration
 */
export interface AuthConfig {
  tokenStorageKey: string
  refreshTokenStorageKey: string
  userStorageKey: string
  sessionTimeoutMinutes: number
  sessionWarningMinutes: number
  maxLoginAttempts: number
  lockoutDurationMinutes: number
  requireEmailVerification: boolean
  enableTwoFactor: boolean
  oauthProviders: OAuthProvider[]
}

/**
 * Storage Interface for Auth Store
 */
export interface AuthStorage {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void
  clear(): void
}

/**
 * Auth Store Actions
 */
export type AuthAction =
  | { type: 'AUTH_INIT_START' }
  | {
      type: 'AUTH_INIT_SUCCESS'
      payload: { user: User | null; tokens: AuthTokens | null }
    }
  | { type: 'AUTH_INIT_FAILURE'; payload: { error: string } }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGIN_TWO_FACTOR_REQUIRED' }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'REGISTER_FAILURE'; payload: { error: string } }
  | { type: 'TOKEN_REFRESH_START' }
  | { type: 'TOKEN_REFRESH_SUCCESS'; payload: { tokens: AuthTokens } }
  | { type: 'TOKEN_REFRESH_FAILURE'; payload: { error: string } }
  | { type: 'UPDATE_USER_START' }
  | { type: 'UPDATE_USER_SUCCESS'; payload: { user: User } }
  | { type: 'UPDATE_USER_FAILURE'; payload: { error: string } }
  | { type: 'SET_SESSION_WARNING'; payload: { timeRemaining: number } }
  | { type: 'CLEAR_SESSION_WARNING' }
  | { type: 'SHOW_LOGIN_MODAL' }
  | { type: 'HIDE_LOGIN_MODAL' }
  | { type: 'SHOW_SIGNUP_MODAL' }
  | { type: 'HIDE_SIGNUP_MODAL' }
  | { type: 'SHOW_FORGOT_PASSWORD_MODAL' }
  | { type: 'HIDE_FORGOT_PASSWORD_MODAL' }
  | { type: 'SHOW_TWO_FACTOR_MODAL' }
  | { type: 'HIDE_TWO_FACTOR_MODAL' }
  | { type: 'SET_REMEMBER_ME'; payload: { rememberMe: boolean } }
  | { type: 'SET_LOGIN_REDIRECT'; payload: { path: string } }
  | { type: 'CLEAR_ERROR' }

/**
 * Type guards for auth data validation
 */
export const isValidTokens = (tokens: any): tokens is AuthTokens => {
  return (
    tokens &&
    typeof tokens.accessToken === 'string' &&
    typeof tokens.refreshToken === 'string' &&
    typeof tokens.expiresAt === 'number' &&
    typeof tokens.refreshExpiresAt === 'number' &&
    tokens.tokenType === 'Bearer'
  )
}

export const isValidUser = (user: any): user is User => {
  return (
    user &&
    user.profile &&
    typeof user.profile.id === 'string' &&
    typeof user.profile.email === 'string' &&
    Array.isArray(user.roles) &&
    Array.isArray(user.permissions)
  )
}

/**
 * Permission utilities
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
  return user?.roles.includes(role) ?? false
}

export const hasPermission = (
  user: User | null,
  permission: string
): boolean => {
  return user?.permissions.includes(permission) ?? false
}

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  return roles.some(role => hasRole(user, role))
}

export const hasAnyPermission = (
  user: User | null,
  permissions: string[]
): boolean => {
  return permissions.some(permission => hasPermission(user, permission))
}

export const hasAllPermissions = (
  user: User | null,
  permissions: string[]
): boolean => {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Token utilities
 */
export const isTokenExpired = (expiresAt: number): boolean => {
  return Date.now() >= expiresAt * 1000
}

export const isTokenNearExpiry = (
  expiresAt: number,
  minutesBuffer = 5
): boolean => {
  return Date.now() >= (expiresAt - minutesBuffer * 60) * 1000
}

export const getTokenTimeRemaining = (expiresAt: number): number => {
  return Math.max(0, expiresAt * 1000 - Date.now())
}
