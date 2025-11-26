/**
 * Mock Data API Client
 *
 * This module provides a mock API client that simulates real API calls
 * using local mock data files. Used in 'mock-data' mode.
 */

// Types
interface MockResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

interface AuthResponse {
  user: any
  token: string
  refreshToken: string
  expiresIn: number
}

// Mock data - in real implementation, these would come from actual JSON files
const usersData = {
  users: [
    {
      id: 'user-001',
      email: 'admin@synccoreai.com',
      password: 'admin123',
      name: '系統管理員',
      role: 'admin',
      avatar:
        'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=ffffff',
      status: 'active',
      verified: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      preferences: {
        theme: 'light',
        language: 'zh-TW',
        notifications: true,
      },
      profile: {
        firstName: '系統',
        lastName: '管理員',
        phone: '+886-912-345-678',
        company: 'SyncCoreAI',
        position: '系統管理員',
        bio: 'SyncCoreAI 系統管理員帳號',
      },
    },
    {
      id: 'user-002',
      email: 'user@example.com',
      password: 'password123',
      name: '測試用戶',
      role: 'user',
      avatar:
        'https://ui-avatars.com/api/?name=User&background=10B981&color=ffffff',
      status: 'active',
      verified: true,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T15:45:00.000Z',
      preferences: {
        theme: 'light',
        language: 'zh-TW',
        notifications: true,
      },
      profile: {
        firstName: '測試',
        lastName: '用戶',
        phone: '+886-987-654-321',
        company: '測試公司',
        position: '測試工程師',
        bio: '這是一個測試用戶帳號',
      },
    },
  ],
}

const documentsData = {
  documents: [
    {
      id: 'doc-001',
      title: 'SyncCoreAI 專案規劃',
      content:
        '# SyncCoreAI 專案規劃\n\n這是一個關於 SyncCoreAI 平台的專案規劃文檔。',
      authorId: 'user-001',
      status: 'published',
      visibility: 'public',
      tags: ['規劃', '專案管理'],
      collaborators: ['user-002'],
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-01-15T16:30:00.000Z',
      metadata: {
        wordCount: 245,
        readingTime: 2,
        language: 'zh-TW',
        version: 5,
      },
    },
    {
      id: 'doc-002',
      title: 'API 設計規範',
      content: '# API 設計規範\n\n## RESTful API 設計原則',
      authorId: 'user-002',
      status: 'draft',
      visibility: 'private',
      tags: ['API', '開發規範'],
      collaborators: ['user-001'],
      createdAt: '2024-01-10T14:20:00.000Z',
      updatedAt: '2024-01-12T11:45:00.000Z',
      metadata: {
        wordCount: 180,
        readingTime: 1,
        language: 'zh-TW',
        version: 3,
      },
    },
  ],
}

const notificationsData = {
  notifications: [
    {
      id: 'notif-001',
      userId: 'user-001',
      type: 'document_shared',
      title: '文檔已分享',
      message: "用戶 '測試用戶' 與您分享了文檔 'API 設計規範'",
      read: false,
      createdAt: '2024-01-20T10:15:00.000Z',
      data: {
        documentId: 'doc-002',
        fromUserId: 'user-002',
        action: 'share',
      },
    },
    {
      id: 'notif-002',
      userId: 'user-002',
      type: 'document_comment',
      title: '新評論',
      message: "系統管理員 在文檔 'SyncCoreAI 專案規劃' 中添加了評論",
      read: true,
      createdAt: '2024-01-19T16:30:00.000Z',
      data: {
        documentId: 'doc-001',
        fromUserId: 'user-001',
        commentId: 'comment-001',
      },
    },
  ],
}

// Simulate network delay
const delay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Mock API Client
export class MockApiClient {
  private currentUser: any = null
  private currentToken: string | null = null

  // Authentication methods
  async login(
    email: string,
    password: string
  ): Promise<MockResponse<AuthResponse>> {
    await delay(800) // Simulate network delay

    const user = usersData.users.find(
      (u: any) => u.email === email && u.password === password
    )

    if (!user) {
      throw new Error('EMAIL_PASSWORD_INVALID')
    }

    if (user.status !== 'active') {
      throw new Error('ACCOUNT_INACTIVE')
    }

    // Generate mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`

    this.currentUser = user
    this.currentToken = token

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days
      },
      message: '登入成功',
      timestamp: new Date().toISOString(),
    }
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<MockResponse<AuthResponse>> {
    await delay(1000) // Simulate network delay

    // Check if user already exists
    const existingUser = usersData.users.find((u: any) => u.email === email)
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: 'user' as const,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=ffffff`,
      status: 'active' as const,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: 'light' as const,
        language: 'zh-TW' as const,
        notifications: true,
      },
      profile: {
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ')[1] || '',
        phone: '',
        company: '',
        position: '',
        bio: '',
      },
    }

    // In real implementation, this would be saved to database
    // For mock, we just simulate the response
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`
    const refreshToken = `mock-refresh-token-${newUser.id}-${Date.now()}`

    this.currentUser = newUser
    this.currentToken = token

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
      message: '註冊成功',
      timestamp: new Date().toISOString(),
    }
  }

  async logout(): Promise<MockResponse<null>> {
    await delay(300)

    this.currentUser = null
    this.currentToken = null

    return {
      success: true,
      data: null,
      message: '登出成功',
      timestamp: new Date().toISOString(),
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<MockResponse<{ token: string; expiresIn: number }>> {
    await delay(400)

    if (!this.currentUser) {
      throw new Error('NO_ACTIVE_SESSION')
    }

    const newToken = `mock-jwt-token-${this.currentUser.id}-${Date.now()}`
    this.currentToken = newToken

    return {
      success: true,
      data: {
        token: newToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
      timestamp: new Date().toISOString(),
    }
  }

  // User methods
  async getCurrentUser(): Promise<MockResponse<any>> {
    await delay(200)

    if (!this.currentUser) {
      throw new Error('NOT_AUTHENTICATED')
    }

    const { password: _, ...userWithoutPassword } = this.currentUser

    return {
      success: true,
      data: userWithoutPassword,
      timestamp: new Date().toISOString(),
    }
  }

  async updateProfile(profileData: any): Promise<MockResponse<any>> {
    await delay(600)

    if (!this.currentUser) {
      throw new Error('NOT_AUTHENTICATED')
    }

    // Simulate updating user profile
    this.currentUser = {
      ...this.currentUser,
      ...profileData,
      updatedAt: new Date().toISOString(),
    }

    const { password: _, ...userWithoutPassword } = this.currentUser

    return {
      success: true,
      data: userWithoutPassword,
      message: '個人資料更新成功',
      timestamp: new Date().toISOString(),
    }
  }

  // Document methods
  async getDocuments(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<MockResponse<any>> {
    await delay(400)

    let documents = [...documentsData.documents]

    // Apply search filter
    if (params?.search) {
      const searchTerm = params.search.toLowerCase()
      documents = documents.filter(
        (doc: any) =>
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.content.toLowerCase().includes(searchTerm) ||
          doc.tags.some((tag: any) => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocs = documents.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        documents: paginatedDocs,
        pagination: {
          page,
          limit,
          total: documents.length,
          pages: Math.ceil(documents.length / limit),
        },
      },
      timestamp: new Date().toISOString(),
    }
  }

  async getDocument(id: string): Promise<MockResponse<any>> {
    await delay(300)

    const document = documentsData.documents.find((doc: any) => doc.id === id)

    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND')
    }

    return {
      success: true,
      data: document,
      timestamp: new Date().toISOString(),
    }
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number
    limit?: number
  }): Promise<MockResponse<any>> {
    await delay(300)

    if (!this.currentUser) {
      throw new Error('NOT_AUTHENTICATED')
    }

    let userNotifications = notificationsData.notifications.filter(
      (notif: any) => notif.userId === this.currentUser.id
    )

    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: userNotifications.length,
          pages: Math.ceil(userNotifications.length / limit),
        },
      },
      timestamp: new Date().toISOString(),
    }
  }

  async getUnreadCount(): Promise<MockResponse<{ count: number }>> {
    await delay(200)

    if (!this.currentUser) {
      throw new Error('NOT_AUTHENTICATED')
    }

    const unreadCount = notificationsData.notifications.filter(
      (notif: any) => notif.userId === this.currentUser.id && !notif.read
    ).length

    return {
      success: true,
      data: { count: unreadCount },
      timestamp: new Date().toISOString(),
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentToken
  }

  getCurrentToken(): string | null {
    return this.currentToken
  }

  getCurrentUserId(): string | null {
    return this.currentUser?.id || null
  }
}

// Export singleton instance
export const mockApiClient = new MockApiClient()

// Export mock error types
export const MockApiErrors = {
  EMAIL_PASSWORD_INVALID: 'EMAIL_PASSWORD_INVALID',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  NO_ACTIVE_SESSION: 'NO_ACTIVE_SESSION',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
} as const

export type MockApiError = (typeof MockApiErrors)[keyof typeof MockApiErrors]
