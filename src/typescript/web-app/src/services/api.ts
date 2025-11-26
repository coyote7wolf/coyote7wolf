/**
 * API Service Layer - Abstraction for Mock and Real API
 *
 * This service provides a unified interface for all API calls,
 * allowing seamless switching between mock and real backend services.
 */

import { requestWrapper } from '@/utils/requestWrapper'
import { apiEndpoints } from '@/utils/apiEndpoints'
import environment from '@/config/environment'

// Types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
  timestamp?: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
  page?: number
}

export interface SearchParams extends PaginationParams {
  q?: string
  filters?: Record<string, any>
  sort?: string
  order?: 'asc' | 'desc'
}

// Base API class
class BaseApiService {
  private baseUrl: string
  private isMockMode: boolean

  constructor() {
    this.baseUrl = environment.CONFIG.apiBase
    this.isMockMode =
      environment.APP_MODE === 'mock-api' ||
      environment.APP_MODE === 'mock-data'
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.isMockMode
        ? `${this.baseUrl}${endpoint}`
        : `${this.baseUrl}/api/v1${endpoint}`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (options.headers) {
        Object.assign(headers, options.headers)
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Handle mock API response format
      if (this.isMockMode && responseData.success !== undefined) {
        return responseData as ApiResponse<T>
      }

      // Handle real API response format
      return {
        success: true,
        data: responseData as T,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      return {
        success: false,
        data: null as T,
        error: error.message || 'API_ERROR',
        message: error.message || '請求失敗',
      }
    }
  }

  protected get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request<T>(url, { method: 'GET' })
  }

  protected post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'POST' }
    if (data) {
      options.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, options)
  }

  protected put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'PUT' }
    if (data) {
      options.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, options)
  }

  protected patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'PATCH' }
    if (data) {
      options.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, options)
  }

  protected delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Authentication Service
export class AuthService extends BaseApiService {
  async login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials)
  }

  async register(userData: { email: string; password: string; name: string }) {
    return this.post('/auth/register', userData)
  }

  async logout() {
    return this.post('/auth/logout')
  }

  async refreshToken(refreshToken: string) {
    return this.post('/auth/refresh', { refreshToken })
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.post('/auth/reset-password', { token, newPassword })
  }

  async verifyEmail(token: string) {
    return this.post('/auth/verify-email', { token })
  }
}

// User Service
export class UserService extends BaseApiService {
  async getProfile() {
    return this.get('/users/me')
  }

  async updateProfile(data: Partial<any>) {
    return this.patch('/users/me', data)
  }

  async getPreferences() {
    return this.get('/users/preferences')
  }

  async updatePreferences(preferences: Record<string, any>) {
    return this.patch('/users/preferences', preferences)
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`)
  }

  async searchUsers(query: string, params?: SearchParams) {
    return this.get('/search/users', { q: query, ...params })
  }
}

// Document Service
export class DocumentService extends BaseApiService {
  async getDocuments(params?: SearchParams) {
    return this.get('/documents', params)
  }

  async getDocument(id: string) {
    return this.get(`/documents/${id}`)
  }

  async createDocument(data: {
    title: string
    content?: string
    type?: string
    visibility?: string
    tags?: string[]
  }) {
    return this.post('/documents', data)
  }

  async updateDocument(id: string, data: Partial<any>) {
    return this.patch(`/documents/${id}`, data)
  }

  async deleteDocument(id: string) {
    return this.delete(`/documents/${id}`)
  }

  async duplicateDocument(id: string, newTitle?: string) {
    return this.post(`/documents/${id}/duplicate`, { title: newTitle })
  }

  async shareDocument(
    id: string,
    shareData: {
      userId?: string
      email?: string
      role?: string
      permissions?: string[]
    }
  ) {
    return this.post(`/documents/${id}/share`, shareData)
  }

  async getCollaborators(id: string) {
    return this.get(`/documents/${id}/collaborators`)
  }

  async addCollaborator(
    id: string,
    collaboratorData: {
      userId: string
      role?: string
      permissions?: string[]
    }
  ) {
    return this.post(`/documents/${id}/collaborators`, collaboratorData)
  }

  async searchDocuments(
    query: string,
    params?: SearchParams & {
      type?: string
      author?: string
      tags?: string
      status?: string
    }
  ) {
    return this.get('/documents/search', { q: query, ...params })
  }

  async getRecentDocuments(limit = 10) {
    return this.get('/documents/recent', { limit })
  }

  async getSharedDocuments(params?: PaginationParams) {
    return this.get('/documents/shared', params)
  }

  async bulkAction(action: string, documentIds: string[], data?: any) {
    return this.post('/documents/bulk-action', { action, documentIds, data })
  }
}

// Workspace Service
export class WorkspaceService extends BaseApiService {
  async getWorkspaces(params?: PaginationParams) {
    return this.get('/workspaces', params)
  }

  async getWorkspace(id: string) {
    return this.get(`/workspaces/${id}`)
  }

  async createWorkspace(data: {
    name: string
    description?: string
    settings?: Record<string, any>
  }) {
    return this.post('/workspaces', data)
  }

  async updateWorkspace(id: string, data: Partial<any>) {
    return this.patch(`/workspaces/${id}`, data)
  }

  async deleteWorkspace(id: string) {
    return this.delete(`/workspaces/${id}`)
  }

  async getMembers(id: string) {
    return this.get(`/workspaces/${id}/members`)
  }

  async addMember(
    id: string,
    memberData: {
      userId?: string
      email?: string
      role?: string
      permissions?: string[]
    }
  ) {
    return this.post(`/workspaces/${id}/members`, memberData)
  }

  async inviteToWorkspace(
    id: string,
    inviteData: {
      email: string
      role?: string
      message?: string
    }
  ) {
    return this.post(`/workspaces/${id}/invite`, inviteData)
  }

  async getWorkspaceDocuments(id: string, params?: SearchParams) {
    return this.get(`/workspaces/${id}/documents`, params)
  }
}

// Comment Service
export class CommentService extends BaseApiService {
  async getComments(documentId: string, params?: PaginationParams) {
    return this.get(`/documents/${documentId}/comments`, params)
  }

  async createComment(data: {
    documentId: string
    content: string
    position?: { start: number; end: number; section?: string }
    mentions?: string[]
  }) {
    return this.post('/comments', data)
  }

  async updateComment(id: string, content: string) {
    return this.patch(`/comments/${id}`, { content })
  }

  async deleteComment(id: string) {
    return this.delete(`/comments/${id}`)
  }

  async resolveComment(id: string, resolved = true) {
    return this.patch(`/comments/${id}/resolve`, { resolved })
  }

  async addReply(commentId: string, content: string) {
    return this.post(`/comments/${commentId}/replies`, { content })
  }
}

// Version Service
export class VersionService extends BaseApiService {
  async getVersions(documentId: string, params?: PaginationParams) {
    return this.get(`/documents/${documentId}/versions`, params)
  }

  async getVersion(id: string) {
    return this.get(`/versions/${id}`)
  }

  async createVersion(
    documentId: string,
    data: {
      title?: string
      changesSummary?: string
    }
  ) {
    return this.post('/versions', { documentId, ...data })
  }

  async restoreVersion(id: string) {
    return this.post(`/versions/${id}/restore`)
  }
}

// AI Service
export class AIService extends BaseApiService {
  async getSuggestions(documentId: string, text: string, position?: number) {
    return this.post('/ai/suggestions', { documentId, text, position })
  }

  async acceptSuggestion(id: string) {
    return this.patch(`/ai/suggestions/${id}/accept`)
  }

  async rejectSuggestion(id: string) {
    return this.patch(`/ai/suggestions/${id}/reject`)
  }

  async checkGrammar(text: string, language = 'zh-TW') {
    return this.post('/ai/grammar-check', { text, language })
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage = 'auto'
  ) {
    return this.post('/ai/translate', { text, targetLanguage, sourceLanguage })
  }

  async summarize(text: string, maxLength = 100) {
    return this.post('/ai/summarize', { text, maxLength })
  }

  async analyzeTone(text: string) {
    return this.post('/ai/tone-analysis', { text })
  }

  async optimizeForSEO(text: string, targetKeywords?: string[]) {
    return this.post('/ai/seo-optimize', { text, targetKeywords })
  }
}

// Sync Service (for real-time collaboration)
export class SyncService extends BaseApiService {
  async getDocumentState(documentId: string) {
    return this.get(`/sync/documents/${documentId}/state`)
  }

  async sendOperation(documentId: string, operation: any) {
    return this.post(`/sync/documents/${documentId}/operations`, operation)
  }

  async getConflicts(documentId: string) {
    return this.get(`/sync/documents/${documentId}/conflicts`)
  }

  async resolveConflict(
    documentId: string,
    conflictId: string,
    resolution: any
  ) {
    return this.post(`/sync/documents/${documentId}/resolve-conflict`, {
      conflictId,
      resolution,
    })
  }
}

// Presence Service
export class PresenceService extends BaseApiService {
  async updatePresence(
    documentId: string,
    presenceData: {
      status: 'online' | 'away' | 'offline'
      cursor?: { position: number; selection?: { start: number; end: number } }
      isTyping?: boolean
    }
  ) {
    return this.post('/presence/update', { documentId, ...presenceData })
  }

  async getPresence(documentId: string) {
    return this.get(`/presence/documents/${documentId}/users`)
  }

  async getStatus() {
    return this.get('/presence/status')
  }
}

// Analytics Service
export class AnalyticsService extends BaseApiService {
  async trackEvent(event: string, properties?: Record<string, any>) {
    return this.post('/analytics/events', { event, properties })
  }

  async getDocumentStats(documentId: string) {
    return this.get(`/analytics/documents/${documentId}/stats`)
  }

  async getUserActivity(params?: { timeRange?: string; groupBy?: string }) {
    return this.get('/analytics/user-activity', params)
  }

  async getCollaborationMetrics(params?: { timeRange?: string }) {
    return this.get('/analytics/collaboration-metrics', params)
  }
}

// Template Service
export class TemplateService extends BaseApiService {
  async getTemplates(params?: SearchParams & { category?: string }) {
    return this.get('/templates', params)
  }

  async getTemplate(id: string) {
    return this.get(`/templates/${id}`)
  }

  async useTemplate(
    id: string,
    data?: { title?: string; customizations?: any }
  ) {
    return this.post(`/templates/${id}/use`, data)
  }

  async getCategories() {
    return this.get('/templates/categories')
  }

  async createTemplate(data: {
    name: string
    description?: string
    content: string
    category?: string
    tags?: string[]
    isPublic?: boolean
  }) {
    return this.post('/templates', data)
  }

  async updateTemplate(
    id: string,
    data: Partial<{
      name: string
      description: string
      content: string
      category: string
      tags: string[]
    }>
  ) {
    return this.patch(`/templates/${id}`, data)
  }

  async deleteTemplate(id: string) {
    return this.delete(`/templates/${id}`)
  }

  async incrementUsage(id: string) {
    return this.post(`/templates/${id}/increment-usage`)
  }
}

// Notification Service
export class NotificationService extends BaseApiService {
  async getNotifications(params?: PaginationParams & { unreadOnly?: boolean }) {
    return this.get('/notifications', params)
  }

  async getUnreadCount() {
    return this.get('/notifications/unread-count')
  }

  async markAsRead(id: string) {
    return this.patch(`/notifications/${id}`, { read: true })
  }

  async markAllAsRead() {
    return this.post('/notifications/mark-all-read')
  }

  async deleteNotification(id: string) {
    return this.delete(`/notifications/${id}`)
  }
}

// Search Service
export class SearchService extends BaseApiService {
  async globalSearch(
    query: string,
    params?: SearchParams & {
      types?: string[]
      scopes?: string[]
    }
  ) {
    return this.get('/search/global', { q: query, ...params })
  }

  async searchDocuments(
    query: string,
    params?: SearchParams & {
      filters?: Record<string, any>
    }
  ) {
    return this.get('/search/documents', { q: query, ...params })
  }

  async searchUsers(query: string, params?: SearchParams) {
    return this.get('/search/users', { q: query, ...params })
  }

  async getSuggestions(query: string, type?: string) {
    return this.get('/search/suggestions', { q: query, type })
  }

  async searchTemplates(query: string, params?: SearchParams) {
    return this.get('/search/templates', { q: query, ...params })
  }
}

// Activity Service
export class ActivityService extends BaseApiService {
  async getActivities(
    params?: SearchParams & {
      userId?: string
      type?: string
      resourceType?: string
    }
  ) {
    return this.get('/activities', params)
  }

  async getUserActivities(userId: string, params?: PaginationParams) {
    return this.get(`/activities/user/${userId}`, params)
  }

  async createActivity(data: {
    type: string
    resourceId?: string | null
    resourceType: string
    action: string
    title: string
    description: string
    metadata?: Record<string, any>
    timestamp: string
  }) {
    return this.post('/activities', data)
  }

  async getActivityStats(params?: {
    userId?: string
    dateRange?: { start: string; end: string }
  }) {
    return this.get('/activities/stats', params)
  }
}

// Export service instances
export const authService = new AuthService()
export const userService = new UserService()
export const documentService = new DocumentService()
export const workspaceService = new WorkspaceService()
export const commentService = new CommentService()
export const versionService = new VersionService()
export const aiService = new AIService()
export const syncService = new SyncService()
export const presenceService = new PresenceService()
export const analyticsService = new AnalyticsService()
export const templateService = new TemplateService()
export const notificationService = new NotificationService()
export const searchService = new SearchService()
export const activityService = new ActivityService()

// Default export
export default {
  auth: authService,
  user: userService,
  document: documentService,
  workspace: workspaceService,
  comment: commentService,
  version: versionService,
  ai: aiService,
  sync: syncService,
  presence: presenceService,
  analytics: analyticsService,
  template: templateService,
  notification: notificationService,
  search: searchService,
  activity: activityService,
}
