/**
 * API 端點管理系統
 * 支援靜態部署的 mock API 端點配置
 */

export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  requiresAuth: boolean
  mockData?: any
  category:
    | 'auth'
    | 'users'
    | 'documents'
    | 'sync'
    | 'ai'
    | 'realtime'
    | 'analytics'
    | 'admin'
}

export interface ApiEndpoints {
  auth: {
    login: ApiEndpoint
    register: ApiEndpoint
    logout: ApiEndpoint
    refresh: ApiEndpoint
    profile: ApiEndpoint
  }
  users: {
    profile: ApiEndpoint
    update: ApiEndpoint
    preferences: ApiEndpoint
    avatar: ApiEndpoint
  }
  documents: {
    list: ApiEndpoint
    get: ApiEndpoint
    create: ApiEndpoint
    update: ApiEndpoint
    delete: ApiEndpoint
    share: ApiEndpoint
  }
  sync: {
    connect: ApiEndpoint
    operations: ApiEndpoint
    conflict: ApiEndpoint
  }
  ai: {
    suggestions: ApiEndpoint
    completion: ApiEndpoint
    analysis: ApiEndpoint
  }
  realtime: {
    connect: ApiEndpoint
    events: ApiEndpoint
  }
  analytics: {
    track: ApiEndpoint
    events: ApiEndpoint
  }
  admin: {
    users: ApiEndpoint
    system: ApiEndpoint
  }
}

// Mock API 端點配置
export const apiEndpoints: ApiEndpoints = {
  auth: {
    login: {
      path: '/api/auth/login',
      method: 'POST',
      requiresAuth: false,
      category: 'auth',
      mockData: {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          role: 'user',
        },
      },
    },
    register: {
      path: '/api/auth/register',
      method: 'POST',
      requiresAuth: false,
      category: 'auth',
      mockData: {
        success: true,
        message: 'User registered successfully',
      },
    },
    logout: {
      path: '/api/auth/logout',
      method: 'POST',
      requiresAuth: true,
      category: 'auth',
      mockData: {
        success: true,
        message: 'Logged out successfully',
      },
    },
    refresh: {
      path: '/api/auth/refresh',
      method: 'POST',
      requiresAuth: true,
      category: 'auth',
      mockData: {
        success: true,
        token: 'new-mock-jwt-token',
      },
    },
    profile: {
      path: '/api/auth/profile',
      method: 'GET',
      requiresAuth: true,
      category: 'auth',
      mockData: {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        preferences: {
          language: 'zh-TW',
          theme: 'light',
          notifications: true,
        },
      },
    },
  },
  users: {
    profile: {
      path: '/api/users/profile',
      method: 'GET',
      requiresAuth: true,
      category: 'users',
      mockData: {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        bio: 'This is a test user profile',
        location: 'Taiwan',
        website: 'https://example.com',
        joinedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    update: {
      path: '/api/users/profile',
      method: 'PUT',
      requiresAuth: true,
      category: 'users',
      mockData: {
        success: true,
        message: 'Profile updated successfully',
      },
    },
    preferences: {
      path: '/api/users/preferences',
      method: 'PUT',
      requiresAuth: true,
      category: 'users',
      mockData: {
        success: true,
        preferences: {
          language: 'zh-TW',
          theme: 'light',
          notifications: true,
          autoSave: true,
        },
      },
    },
    avatar: {
      path: '/api/users/avatar',
      method: 'POST',
      requiresAuth: true,
      category: 'users',
      mockData: {
        success: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=updated',
      },
    },
  },
  documents: {
    list: {
      path: '/api/documents',
      method: 'GET',
      requiresAuth: true,
      category: 'documents',
      mockData: {
        documents: [
          {
            id: '1',
            title: 'Project Proposal',
            content: 'This is a project proposal document...',
            type: 'document',
            status: 'draft',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
            author: { id: '1', name: 'Test User' },
            collaborators: [],
          },
          {
            id: '2',
            title: 'Meeting Notes',
            content: 'Meeting notes from today...',
            type: 'notes',
            status: 'published',
            createdAt: '2024-01-03T00:00:00.000Z',
            updatedAt: '2024-01-04T00:00:00.000Z',
            author: { id: '1', name: 'Test User' },
            collaborators: [{ id: '2', name: 'Jane Doe' }],
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      },
    },
    get: {
      path: '/api/documents/:id',
      method: 'GET',
      requiresAuth: true,
      category: 'documents',
      mockData: {
        id: '1',
        title: 'Project Proposal',
        content: 'This is a detailed project proposal document...',
        type: 'document',
        status: 'draft',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        author: { id: '1', name: 'Test User' },
        collaborators: [],
        permissions: ['read', 'write', 'share', 'delete'],
      },
    },
    create: {
      path: '/api/documents',
      method: 'POST',
      requiresAuth: true,
      category: 'documents',
      mockData: {
        success: true,
        document: {
          id: '3',
          title: 'New Document',
          content: '',
          type: 'document',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: { id: '1', name: 'Test User' },
          collaborators: [],
        },
      },
    },
    update: {
      path: '/api/documents/:id',
      method: 'PUT',
      requiresAuth: true,
      category: 'documents',
      mockData: {
        success: true,
        message: 'Document updated successfully',
      },
    },
    delete: {
      path: '/api/documents/:id',
      method: 'DELETE',
      requiresAuth: true,
      category: 'documents',
      mockData: {
        success: true,
        message: 'Document deleted successfully',
      },
    },
    share: {
      path: '/api/documents/:id/share',
      method: 'POST',
      requiresAuth: true,
      category: 'documents',
      mockData: {
        success: true,
        shareLink: 'https://app.synccoreai.com/shared/abc123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },
  sync: {
    connect: {
      path: '/api/sync/connect',
      method: 'POST',
      requiresAuth: true,
      category: 'sync',
      mockData: {
        success: true,
        sessionId: 'sync-session-123',
        connectionId: 'conn-456',
      },
    },
    operations: {
      path: '/api/sync/operations',
      method: 'POST',
      requiresAuth: true,
      category: 'sync',
      mockData: {
        success: true,
        operations: [],
        version: 1,
      },
    },
    conflict: {
      path: '/api/sync/conflict',
      method: 'POST',
      requiresAuth: true,
      category: 'sync',
      mockData: {
        success: true,
        resolution: 'merge',
        resolvedContent: 'Merged content...',
      },
    },
  },
  ai: {
    suggestions: {
      path: '/api/ai/suggestions',
      method: 'POST',
      requiresAuth: true,
      category: 'ai',
      mockData: {
        suggestions: [
          {
            type: 'grammar',
            text: 'Consider changing "there" to "their"',
            position: { start: 10, end: 15 },
            confidence: 0.9,
          },
          {
            type: 'style',
            text: 'This sentence could be more concise',
            position: { start: 50, end: 80 },
            confidence: 0.7,
          },
        ],
      },
    },
    completion: {
      path: '/api/ai/completion',
      method: 'POST',
      requiresAuth: true,
      category: 'ai',
      mockData: {
        completion: 'This is an AI-generated completion based on your input...',
        confidence: 0.85,
      },
    },
    analysis: {
      path: '/api/ai/analysis',
      method: 'POST',
      requiresAuth: true,
      category: 'ai',
      mockData: {
        readability: 8.5,
        sentiment: 'positive',
        keywords: ['project', 'collaboration', 'document'],
        summary: 'This document discusses project collaboration strategies...',
      },
    },
  },
  realtime: {
    connect: {
      path: '/api/realtime/connect',
      method: 'POST',
      requiresAuth: true,
      category: 'realtime',
      mockData: {
        success: true,
        wsUrl: 'wss://api.synccoreai.com/ws',
        token: 'ws-token-123',
      },
    },
    events: {
      path: '/api/realtime/events',
      method: 'GET',
      requiresAuth: true,
      category: 'realtime',
      mockData: {
        events: [
          {
            type: 'document_changed',
            documentId: '1',
            userId: '2',
            timestamp: new Date().toISOString(),
          },
          {
            type: 'user_joined',
            documentId: '1',
            userId: '3',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    },
  },
  analytics: {
    track: {
      path: '/api/analytics/track',
      method: 'POST',
      requiresAuth: false,
      category: 'analytics',
      mockData: {
        success: true,
        eventId: 'event-123',
      },
    },
    events: {
      path: '/api/analytics/events',
      method: 'GET',
      requiresAuth: true,
      category: 'analytics',
      mockData: {
        events: [
          {
            name: 'document_created',
            count: 15,
            timestamp: '2024-01-01T00:00:00.000Z',
          },
          {
            name: 'user_login',
            count: 42,
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  },
  admin: {
    users: {
      path: '/api/admin/users',
      method: 'GET',
      requiresAuth: true,
      category: 'admin',
      mockData: {
        users: [
          {
            id: '1',
            email: 'user@example.com',
            name: 'Test User',
            role: 'user',
            status: 'active',
            lastLogin: '2024-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            status: 'active',
            lastLogin: '2024-01-02T00:00:00.000Z',
          },
        ],
        total: 2,
      },
    },
    system: {
      path: '/api/admin/system',
      method: 'GET',
      requiresAuth: true,
      category: 'admin',
      mockData: {
        version: '1.0.0',
        uptime: 86400,
        users: 150,
        documents: 1250,
        storage: {
          used: '2.5GB',
          total: '10GB',
          percentage: 25,
        },
      },
    },
  },
}

// 端點工具函數
export const buildEndpoint = (
  path: string,
  params: Record<string, string> = {}
): string => {
  let builtPath = path

  // 替換路徑參數
  Object.entries(params).forEach(([key, value]) => {
    builtPath = builtPath.replace(`:${key}`, value)
  })

  return builtPath
}

export const getEndpointByPath = (path: string): ApiEndpoint | null => {
  for (const category of Object.values(apiEndpoints)) {
    for (const endpoint of Object.values(
      category as Record<string, ApiEndpoint>
    )) {
      if (endpoint.path === path) {
        return endpoint
      }
    }
  }
  return null
}

export const getEndpointsByCategory = (
  category: ApiEndpoint['category']
): ApiEndpoint[] => {
  const endpoints: ApiEndpoint[] = []

  for (const categoryEndpoints of Object.values(apiEndpoints)) {
    for (const endpoint of Object.values(
      categoryEndpoints as Record<string, ApiEndpoint>
    )) {
      if (endpoint.category === category) {
        endpoints.push(endpoint)
      }
    }
  }

  return endpoints
}

export const requiresAuthentication = (path: string): boolean => {
  const endpoint = getEndpointByPath(path)
  return endpoint?.requiresAuth || false
}

export const getHttpMethod = (path: string): string => {
  const endpoint = getEndpointByPath(path)
  return endpoint?.method || 'GET'
}

// 環境配置
export const API_CONFIG = {
  baseUrl:
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
}

export default apiEndpoints
