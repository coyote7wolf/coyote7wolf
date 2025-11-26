/**
 * API Endpoints Management
 *
 * This module provides centralized management of all API endpoints,
 * ensuring consistency between frontend and backend routing.
 */

import { CONFIG } from '@/config/environment'

// Base API configuration
export const API_BASE = CONFIG.apiBase
export const API_VERSION = 'v1'
export const API_PREFIX = `${API_BASE}/api/${API_VERSION}`

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}/auth/login`,
  LOGOUT: `${API_PREFIX}/auth/logout`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  REGISTER: `${API_PREFIX}/auth/register`,
  FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
  RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
  VERIFY_EMAIL: `${API_PREFIX}/auth/verify-email`,
  RESEND_VERIFICATION: `${API_PREFIX}/auth/resend-verification`,
} as const

/**
 * User Management Endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: `${API_PREFIX}/users/profile`,
  UPDATE_PROFILE: `${API_PREFIX}/users/profile`,
  PREFERENCES: `${API_PREFIX}/users/preferences`,
  CHANGE_PASSWORD: `${API_PREFIX}/users/change-password`,
  UPLOAD_AVATAR: `${API_PREFIX}/users/avatar`,
  DELETE_ACCOUNT: `${API_PREFIX}/users/account`,

  // Dynamic endpoints
  GET_USER: (userId: string) => `${API_PREFIX}/users/${userId}`,
  UPDATE_USER: (userId: string) => `${API_PREFIX}/users/${userId}`,
} as const

/**
 * Document Management Endpoints
 */
export const DOCUMENT_ENDPOINTS = {
  LIST: `${API_PREFIX}/documents`,
  CREATE: `${API_PREFIX}/documents`,
  SEARCH: `${API_PREFIX}/documents/search`,
  RECENT: `${API_PREFIX}/documents/recent`,
  TEMPLATES: `${API_PREFIX}/documents/templates`,

  // Dynamic endpoints
  GET: (docId: string) => `${API_PREFIX}/documents/${docId}`,
  UPDATE: (docId: string) => `${API_PREFIX}/documents/${docId}`,
  DELETE: (docId: string) => `${API_PREFIX}/documents/${docId}`,
  DUPLICATE: (docId: string) => `${API_PREFIX}/documents/${docId}/duplicate`,
  VERSIONS: (docId: string) => `${API_PREFIX}/documents/${docId}/versions`,
  VERSION_DETAIL: (docId: string, versionId: string) =>
    `${API_PREFIX}/documents/${docId}/versions/${versionId}`,
  SHARE: (docId: string) => `${API_PREFIX}/documents/${docId}/share`,
  COLLABORATORS: (docId: string) =>
    `${API_PREFIX}/documents/${docId}/collaborators`,
  PERMISSIONS: (docId: string) =>
    `${API_PREFIX}/documents/${docId}/permissions`,
  EXPORT: (docId: string, format: string) =>
    `${API_PREFIX}/documents/${docId}/export?format=${format}`,
} as const

/**
 * Sync and Real-time Endpoints
 */
export const SYNC_ENDPOINTS = {
  CONNECT: `${API_PREFIX}/sync/connect`,
  DISCONNECT: `${API_PREFIX}/sync/disconnect`,

  // Document sync
  DOCUMENT_DELTA: (docId: string) =>
    `${API_PREFIX}/sync/documents/${docId}/delta`,
  DOCUMENT_STATE: (docId: string) =>
    `${API_PREFIX}/sync/documents/${docId}/state`,
  APPLY_OPERATIONS: (docId: string) =>
    `${API_PREFIX}/sync/documents/${docId}/operations`,

  // Conflict resolution
  CONFLICTS: (docId: string) =>
    `${API_PREFIX}/sync/documents/${docId}/conflicts`,
  RESOLVE_CONFLICT: (docId: string, conflictId: string) =>
    `${API_PREFIX}/sync/documents/${docId}/conflicts/${conflictId}/resolve`,
} as const

/**
 * Presence and Collaboration Endpoints
 */
export const PRESENCE_ENDPOINTS = {
  STATUS: `${API_PREFIX}/presence/status`,
  UPDATE: `${API_PREFIX}/presence/update`,

  // Document presence
  DOCUMENT_USERS: (docId: string) =>
    `${API_PREFIX}/presence/documents/${docId}/users`,
  JOIN_DOCUMENT: (docId: string) =>
    `${API_PREFIX}/presence/documents/${docId}/join`,
  LEAVE_DOCUMENT: (docId: string) =>
    `${API_PREFIX}/presence/documents/${docId}/leave`,
  CURSOR_UPDATE: (docId: string) =>
    `${API_PREFIX}/presence/documents/${docId}/cursor`,
} as const

/**
 * AI Services Endpoints
 */
export const AI_ENDPOINTS = {
  SUGGESTIONS: `${API_PREFIX}/ai/suggestions`,
  ANALYZE: `${API_PREFIX}/ai/analyze`,
  TRANSLATE: `${API_PREFIX}/ai/translate`,
  SUMMARIZE: `${API_PREFIX}/ai/summarize`,
  GRAMMAR_CHECK: `${API_PREFIX}/ai/grammar-check`,
  STYLE_IMPROVE: `${API_PREFIX}/ai/style-improve`,
  AUTO_COMPLETE: `${API_PREFIX}/ai/auto-complete`,

  // Document-specific AI
  DOCUMENT_SUGGESTIONS: (docId: string) =>
    `${API_PREFIX}/ai/documents/${docId}/suggestions`,
  APPLY_SUGGESTION: (docId: string, suggestionId: string) =>
    `${API_PREFIX}/ai/documents/${docId}/suggestions/${suggestionId}/apply`,
  FEEDBACK: (suggestionId: string) =>
    `${API_PREFIX}/ai/suggestions/${suggestionId}/feedback`,
} as const

/**
 * Notification Endpoints
 */
export const NOTIFICATION_ENDPOINTS = {
  LIST: `${API_PREFIX}/notifications`,
  UNREAD_COUNT: `${API_PREFIX}/notifications/unread-count`,
  MARK_READ: `${API_PREFIX}/notifications/mark-read`,
  MARK_ALL_READ: `${API_PREFIX}/notifications/mark-all-read`,
  SETTINGS: `${API_PREFIX}/notifications/settings`,

  // Specific notification
  GET: (notificationId: string) =>
    `${API_PREFIX}/notifications/${notificationId}`,
  DELETE: (notificationId: string) =>
    `${API_PREFIX}/notifications/${notificationId}`,
} as const

/**
 * File Management Endpoints
 */
export const FILE_ENDPOINTS = {
  UPLOAD: `${API_PREFIX}/files/upload`,
  LIST: `${API_PREFIX}/files`,

  // File operations
  GET: (fileId: string) => `${API_PREFIX}/files/${fileId}`,
  DELETE: (fileId: string) => `${API_PREFIX}/files/${fileId}`,
  DOWNLOAD: (fileId: string) => `${API_PREFIX}/files/${fileId}/download`,
  THUMBNAIL: (fileId: string) => `${API_PREFIX}/files/${fileId}/thumbnail`,
} as const

/**
 * Analytics and Metrics Endpoints
 */
export const ANALYTICS_ENDPOINTS = {
  TRACK_EVENT: `${API_PREFIX}/analytics/events`,
  PAGE_VIEW: `${API_PREFIX}/analytics/page-views`,
  USER_METRICS: `${API_PREFIX}/analytics/user-metrics`,
  DOCUMENT_METRICS: (docId: string) =>
    `${API_PREFIX}/analytics/documents/${docId}/metrics`,
  PERFORMANCE: `${API_PREFIX}/analytics/performance`,
} as const

/**
 * Admin Endpoints (if applicable)
 */
export const ADMIN_ENDPOINTS = {
  USERS: `${API_PREFIX}/admin/users`,
  DOCUMENTS: `${API_PREFIX}/admin/documents`,
  ANALYTICS: `${API_PREFIX}/admin/analytics`,
  SYSTEM_HEALTH: `${API_PREFIX}/admin/health`,
  CONFIGURATIONS: `${API_PREFIX}/admin/configurations`,

  // User management
  GET_USER: (userId: string) => `${API_PREFIX}/admin/users/${userId}`,
  UPDATE_USER: (userId: string) => `${API_PREFIX}/admin/users/${userId}`,
  DELETE_USER: (userId: string) => `${API_PREFIX}/admin/users/${userId}`,
  SUSPEND_USER: (userId: string) =>
    `${API_PREFIX}/admin/users/${userId}/suspend`,
} as const

/**
 * WebSocket Endpoints
 */
export const WS_ENDPOINTS = {
  MAIN: CONFIG.wsUrl,
  DOCUMENT_SYNC: `${CONFIG.wsUrl}/document-sync`,
  PRESENCE: `${CONFIG.wsUrl}/presence`,
  NOTIFICATIONS: `${CONFIG.wsUrl}/notifications`,
  AI_SUGGESTIONS: `${CONFIG.wsUrl}/ai-suggestions`,
} as const

/**
 * All endpoints grouped for easy access
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USERS: USER_ENDPOINTS,
  DOCUMENTS: DOCUMENT_ENDPOINTS,
  SYNC: SYNC_ENDPOINTS,
  PRESENCE: PRESENCE_ENDPOINTS,
  AI: AI_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATION_ENDPOINTS,
  FILES: FILE_ENDPOINTS,
  ANALYTICS: ANALYTICS_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  WS: WS_ENDPOINTS,
} as const

/**
 * Utility functions for endpoint management
 */
export const apiUtils = {
  /**
   * Build URL with query parameters
   */
  buildUrl: (endpoint: string, params?: Record<string, unknown>): string => {
    if (!params || Object.keys(params).length === 0) {
      return endpoint
    }

    const url = new URL(endpoint)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })

    return url.toString()
  },

  /**
   * Get API endpoint with base URL
   */
  getEndpoint: (path: string): string => {
    return path.startsWith('http') ? path : `${API_PREFIX}${path}`
  },

  /**
   * Check if endpoint is for file upload
   */
  isFileUpload: (endpoint: string): boolean => {
    return endpoint.includes('/upload') || endpoint.includes('/avatar')
  },

  /**
   * Check if endpoint requires authentication
   */
  requiresAuth: (endpoint: string): boolean => {
    const publicEndpoints: string[] = [
      AUTH_ENDPOINTS.LOGIN,
      AUTH_ENDPOINTS.REGISTER,
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      AUTH_ENDPOINTS.RESET_PASSWORD,
    ]

    return !publicEndpoints.includes(endpoint)
  },

  /**
   * Get endpoint category
   */
  getCategory: (endpoint: string): string => {
    if (endpoint.includes('/auth/')) return 'auth'
    if (endpoint.includes('/users/')) return 'users'
    if (endpoint.includes('/documents/')) return 'documents'
    if (endpoint.includes('/sync/')) return 'sync'
    if (endpoint.includes('/presence/')) return 'presence'
    if (endpoint.includes('/ai/')) return 'ai'
    if (endpoint.includes('/notifications/')) return 'notifications'
    if (endpoint.includes('/files/')) return 'files'
    if (endpoint.includes('/analytics/')) return 'analytics'
    if (endpoint.includes('/admin/')) return 'admin'
    return 'unknown'
  },
}

// Type definitions
export type AuthEndpoints = typeof AUTH_ENDPOINTS
export type UserEndpoints = typeof USER_ENDPOINTS
export type DocumentEndpoints = typeof DOCUMENT_ENDPOINTS
export type SyncEndpoints = typeof SYNC_ENDPOINTS
export type PresenceEndpoints = typeof PRESENCE_ENDPOINTS
export type AIEndpoints = typeof AI_ENDPOINTS
export type NotificationEndpoints = typeof NOTIFICATION_ENDPOINTS
export type FileEndpoints = typeof FILE_ENDPOINTS
export type AnalyticsEndpoints = typeof ANALYTICS_ENDPOINTS
export type AdminEndpoints = typeof ADMIN_ENDPOINTS
export type WSEndpoints = typeof WS_ENDPOINTS
export type APIEndpoints = typeof API_ENDPOINTS

export default API_ENDPOINTS
