/**
 * Application Constants and Enums
 *
 * This file contains all application-wide constants, enums, and magic numbers
 * to maintain consistency and avoid hardcoded values throughout the codebase.
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  REQUEST_TIMEOUT: 408,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

// WebSocket Event Types
export const WS_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  ERROR: 'error',

  // Document events
  DOCUMENT_DELTA_APPLIED: 'document.delta.applied',
  DOCUMENT_UPDATED: 'document.updated',
  DOCUMENT_CREATED: 'document.created',
  DOCUMENT_DELETED: 'document.deleted',

  // Presence events
  PRESENCE_UPDATE: 'presence.update',
  PRESENCE_JOIN: 'presence.join',
  PRESENCE_LEAVE: 'presence.leave',

  // Conflict events
  CONFLICT_DETECTED: 'conflict.detected',
  CONFLICT_RESOLVED: 'conflict.resolved',

  // AI events
  AI_SUGGESTION_GENERATED: 'ai.suggestion.generated',
  AI_SUGGESTION_APPLIED: 'ai.suggestion.applied',

  // Notification events
  NOTIFICATION_PUSH: 'notification.push',
  NOTIFICATION_READ: 'notification.read',
} as const

// Document Status
export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

// User Roles
export enum UserRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  COMMENTER = 'commenter',
}

// Sync Status
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  ERROR = 'error',
  OFFLINE = 'offline',
}

// Conflict Status
export enum ConflictStatus {
  NONE = 'none',
  DETECTED = 'detected',
  MERGING = 'merging',
  RESOLVED = 'resolved',
  MANUAL_REQUIRED = 'manual_required',
}

// AI Suggestion Types
export enum AISuggestionType {
  SUMMARY = 'summary',
  TRANSLATION = 'translation',
  GRAMMAR_CHECK = 'grammar_check',
  STYLE_IMPROVEMENT = 'style_improvement',
  CONFLICT_RESOLUTION = 'conflict_resolution',
  AUTO_COMPLETE = 'auto_complete',
}

// Notification Types
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  DOCUMENT_SHARED = 'document_shared',
  COMMENT_ADDED = 'comment_added',
  AI_SUGGESTION = 'ai_suggestion',
  CONFLICT_DETECTED = 'conflict_detected',
}

// Connection Status
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// Error Codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Document errors
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  DOCUMENT_ACCESS_DENIED: 'DOCUMENT_ACCESS_DENIED',
  DOCUMENT_LOCKED: 'DOCUMENT_LOCKED',
  DOCUMENT_VERSION_CONFLICT: 'DOCUMENT_VERSION_CONFLICT',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',

  // Sync errors
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  SYNC_FAILED: 'SYNC_FAILED',
  SYNC_TIMEOUT: 'SYNC_TIMEOUT',

  // WebSocket errors
  WS_CONNECTION_FAILED: 'WS_CONNECTION_FAILED',
  WS_RECONNECTION_FAILED: 'WS_RECONNECTION_FAILED',
  WS_MESSAGE_FAILED: 'WS_MESSAGE_FAILED',

  // AI errors
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_SUGGESTION_FAILED: 'AI_SUGGESTION_FAILED',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TYPE_ERROR: 'TYPE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  ACCESS_DENIED: 'ACCESS_DENIED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const

// Storage Keys
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'synccoreai_access_token',
  REFRESH_TOKEN: 'synccoreai_refresh_token',
  USER_PROFILE: 'synccoreai_user_profile',

  // UI State
  THEME: 'synccoreai_theme',
  LANGUAGE: 'synccoreai_language',
  SIDEBAR_COLLAPSED: 'synccoreai_sidebar_collapsed',

  // Document State
  RECENT_DOCUMENTS: 'synccoreai_recent_documents',
  DRAFT_CONTENT: 'synccoreai_draft_content',

  // Settings
  USER_PREFERENCES: 'synccoreai_user_preferences',
  NOTIFICATION_SETTINGS: 'synccoreai_notification_settings',

  // Offline
  OFFLINE_QUEUE: 'synccoreai_offline_queue',
  OFFLINE_DOCUMENTS: 'synccoreai_offline_documents',
} as const

// API Routes
export const API_ROUTES = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  REGISTER: '/auth/register',

  // Users
  PROFILE: '/users/profile',
  PREFERENCES: '/users/preferences',

  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,
  DOCUMENT_VERSIONS: (id: string) => `/documents/${id}/versions`,
  DOCUMENT_SHARE: (id: string) => `/documents/${id}/share`,

  // AI
  AI_SUGGESTIONS: '/ai/suggestions',
  AI_ANALYZE: '/ai/analyze',
  AI_TRANSLATE: '/ai/translate',

  // Sync
  SYNC_DOCUMENT: (id: string) => `/sync/documents/${id}`,
  SYNC_DELTA: (id: string) => `/sync/documents/${id}/delta`,

  // Presence
  PRESENCE: '/presence',
  PRESENCE_DOCUMENT: (id: string) => `/presence/documents/${id}`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_READ: '/notifications/read',
} as const

// Validation Constraints
export const VALIDATION = {
  // User
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Document
  DOCUMENT_TITLE_MAX_LENGTH: 255,
  DOCUMENT_CONTENT_MAX_LENGTH: 1000000, // 1MB

  // General
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID_REGEX:
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const

// Performance Limits
export const LIMITS = {
  // API
  MAX_REQUESTS_PER_MINUTE: 60,
  REQUEST_TIMEOUT: 30000, // 30 seconds

  // WebSocket
  MAX_RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000, // 1 second

  // UI
  MAX_RECENT_DOCUMENTS: 20,
  MAX_SUGGESTIONS: 10,
  MAX_NOTIFICATIONS: 100,

  // File
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.txt', '.md', '.doc', '.docx'],

  // Sync
  MAX_PENDING_OPERATIONS: 100,
  SYNC_BATCH_SIZE: 50,
  SYNC_INTERVAL: 1000, // 1 second
} as const

// Keyboard Shortcuts
export const SHORTCUTS = {
  // Global
  TOGGLE_SIDEBAR: 'cmd+shift+s',
  TOGGLE_THEME: 'cmd+shift+t',
  SEARCH: 'cmd+k',

  // Document
  SAVE: 'cmd+s',
  UNDO: 'cmd+z',
  REDO: 'cmd+shift+z',

  // AI
  AI_SUGGEST: 'cmd+shift+a',
  AI_TRANSLATE: 'cmd+shift+t',

  // Navigation
  NEW_DOCUMENT: 'cmd+n',
  CLOSE_DOCUMENT: 'cmd+w',
} as const

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  VERY_SLOW: 600,
} as const

// Type definitions
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]
export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS]
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES]

export default {
  HTTP_STATUS,
  WS_EVENTS,
  DocumentStatus,
  UserRole,
  SyncStatus,
  ConflictStatus,
  AISuggestionType,
  NotificationType,
  ConnectionStatus,
  ERROR_CODES,
  STORAGE_KEYS,
  API_ROUTES,
  VALIDATION,
  LIMITS,
  SHORTCUTS,
  ANIMATION_DURATION,
}
