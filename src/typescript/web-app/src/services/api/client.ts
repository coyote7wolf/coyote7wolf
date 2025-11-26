/**
 * API Service Layer
 *
 * This module provides a unified API interface that automatically switches
 * between different backends based on the current environment mode:
 * - development: Real backend API
 * - mock-api: JSON Server mock API
 * - mock-data: Local mock data client
 */

import {
  CONFIG,
  isMockData,
  isMockApi,
  isDevelopment,
} from '@/config/environment'
import { mockApiClient, MockApiError } from '@/mocks/api'

// Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export interface AuthResponse {
  user: any
  token: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

// API Error types
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Base API Client
class BaseApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(
          data.error || 'API_ERROR',
          data.message || 'An error occurred',
          response.status,
          data
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network or other errors
      throw new ApiError(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network error occurred'
      )
    }
  }

  // Authentication methods
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (response.success && response.data.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.request<null>('/auth/logout', {
      method: 'POST',
    })

    if (response.success) {
      this.setToken(null)
    }

    return response
  }

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    const response = await this.request<{ token: string; expiresIn: number }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    )

    if (response.success && response.data.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request<any>('/users/profile')
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Document methods
  async getDocuments(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.search) queryParams.set('search', params.search)

    const query = queryParams.toString()
    const endpoint = `/documents${query ? `?${query}` : ''}`

    return this.request<any>(endpoint)
  }

  async getDocument(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/documents/${id}`)
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())

    const query = queryParams.toString()
    const endpoint = `/notifications${query ? `?${query}` : ''}`

    return this.request<any>(endpoint)
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>('/notifications/unread-count')
  }
}

// Mock Data Client Adapter (converts mockApiClient to match BaseApiClient interface)
class MockDataClientAdapter {
  private client = mockApiClient

  setToken(token: string | null) {
    // Mock client manages token internally
  }

  getToken(): string | null {
    return this.client.getCurrentToken()
  }

  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      return await this.client.login(credentials.email, credentials.password)
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      return await this.client.register(data.email, data.password, data.name)
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      return await this.client.logout()
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    try {
      return await this.client.refreshToken(refreshToken)
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      return await this.client.getCurrentUser()
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    try {
      return await this.client.updateProfile(profileData)
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async getDocuments(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<any>> {
    try {
      return await this.client.getDocuments(params)
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async getDocument(id: string): Promise<ApiResponse<any>> {
    try {
      return await this.client.getDocument(id)
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async getNotifications(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    try {
      return await this.client.getNotifications(params)
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      return await this.client.getUnreadCount()
    } catch (error) {
      throw this.convertMockError(error)
    }
  }

  private convertMockError(error: any): ApiError {
    if (typeof error === 'string') {
      const mockError = error as MockApiError
      const errorMessages: Record<string, string> = {
        EMAIL_PASSWORD_INVALID: '電子郵件或密碼錯誤',
        EMAIL_ALREADY_EXISTS: '此電子郵件已被註冊',
        ACCOUNT_INACTIVE: '帳號已被停用，請聯繫管理員',
        NOT_AUTHENTICATED: '請先登入',
        NO_ACTIVE_SESSION: '會話已過期，請重新登入',
        DOCUMENT_NOT_FOUND: '找不到指定的文檔',
      }

      return new ApiError(
        mockError,
        errorMessages[mockError] || '發生未知錯誤',
        mockError === 'NOT_AUTHENTICATED' || mockError === 'NO_ACTIVE_SESSION'
          ? 401
          : 400
      )
    }

    return new ApiError('UNKNOWN_ERROR', '發生未知錯誤')
  }
}

// Create appropriate client based on environment
function createApiClient() {
  if (isMockData) {
    console.log('🎭 Using Mock Data Client (local data)')
    return new MockDataClientAdapter()
  } else if (isMockApi) {
    console.log('🔧 Using Mock API Client (JSON Server)')
    return new BaseApiClient(CONFIG.apiBase)
  } else {
    console.log('🌐 Using Real API Client')
    return new BaseApiClient(CONFIG.apiBase)
  }
}

// Export singleton API client
export const apiClient = createApiClient()

// Utility functions
export const ApiUtils = {
  /**
   * Check if error is an API error
   */
  isApiError(error: any): error is ApiError {
    return error instanceof ApiError
  },

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: any): string {
    if (this.isApiError(error)) {
      return error.message
    }

    if (error instanceof Error) {
      return error.message
    }

    return '發生未知錯誤，請稍後再試'
  },

  /**
   * Check if error indicates authentication failure
   */
  isAuthError(error: any): boolean {
    if (this.isApiError(error)) {
      return (
        error.status === 401 ||
        error.code === 'NOT_AUTHENTICATED' ||
        error.code === 'NO_ACTIVE_SESSION' ||
        error.code === 'INVALID_TOKEN'
      )
    }
    return false
  },

  /**
   * Check if error indicates network failure
   */
  isNetworkError(error: any): boolean {
    if (this.isApiError(error)) {
      return error.code === 'NETWORK_ERROR'
    }
    return false
  },
}

export default apiClient
