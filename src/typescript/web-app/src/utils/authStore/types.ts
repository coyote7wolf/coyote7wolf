/**
 * Authentication Types
 *
 * Type definitions for the authentication system
 */

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  VERIFIED = 'verified',
  PREMIUM = 'premium',
  ADMIN = 'admin',
}

export enum Permission {
  // Document permissions
  DOCUMENTS_READ = 'documents:read',
  DOCUMENTS_CREATE = 'documents:create',
  DOCUMENTS_UPDATE = 'documents:update',
  DOCUMENTS_DELETE = 'documents:delete',
  DOCUMENTS_SHARE = 'documents:share',

  // Collaboration permissions
  COLLABORATE_VIEW = 'collaborate:view',
  COLLABORATE_EDIT = 'collaborate:edit',
  COLLABORATE_COMMENT = 'collaborate:comment',
  COLLABORATE_INVITE = 'collaborate:invite',

  // Admin permissions
  ADMIN_USERS = 'admin:users',
  ADMIN_SYSTEM = 'admin:system',
  ADMIN_ANALYTICS = 'admin:analytics',
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionId: string | null
  expiresAt: number | null
  lastActivity: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface OAuthProvider {
  name: string
  id: 'google' | 'github' | 'microsoft'
  clientId: string
  redirectUri: string
}

export interface AuthConfig {
  // Session settings
  sessionTimeout: number // milliseconds
  warningThreshold: number // show warning when this much time left
  refreshThreshold: number // refresh token when this much time left

  // Storage settings
  persistAuth: boolean
  encryptStorage: boolean
  storageNamespace: string

  // OAuth settings
  oauthProviders: OAuthProvider[]

  // API settings
  apiBaseUrl: string
  endpoints: {
    login: string
    register: string
    logout: string
    refresh: string
    profile: string
    oauthCallback: string
  }
}

export interface AuthEvent {
  type:
    | 'login'
    | 'logout'
    | 'sessionExpiring'
    | 'sessionExpired'
    | 'error'
    | 'userUpdated'
  payload?: any
  timestamp: number
}

export type AuthEventListener = (event: AuthEvent) => void

export interface SessionData {
  sessionId: string
  userId: string
  expiresAt: number
  lastActivity: number
  refreshToken?: string
}

export interface AuthError extends Error {
  code: string
  statusCode?: number | undefined
  details?: any
}

export class AuthenticationError extends Error implements AuthError {
  code: string
  statusCode?: number | undefined
  details?: any

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: any
  ) {
    super(message)
    this.name = 'AuthenticationError'
    this.code = code
    if (statusCode !== undefined) {
      this.statusCode = statusCode
    }
    this.details = details
  }
}

export class SessionExpiredError extends AuthenticationError {
  constructor() {
    super('Session has expired', 'SESSION_EXPIRED', 401)
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401)
  }
}

export class NetworkAuthError extends AuthenticationError {
  constructor(message: string) {
    super(`Network error: ${message}`, 'NETWORK_ERROR', 0)
  }
}
