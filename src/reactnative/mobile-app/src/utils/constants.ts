// App configuration
export const APP_CONFIG = {
  name: 'SyncCoreAI Mobile',
  version: '1.0.0',
  buildNumber: 1,
}

// API configuration
export const API_CONFIG = {
  baseURL: 'http://localhost:3100', // Gateway service
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
}

// Mock configuration
export const MOCK_CONFIG = {
  enabled: true,
  enableMockData: true,
  mode: 'data' as 'data' | 'api',
  apiPort: 3001,
  enableMockWebSocket: true,
}

// Sync configuration
export const SYNC_CONFIG = {
  maxRetries: 5,
  retryDelay: 2000,
  batchSize: 10,
  heartbeatInterval: 30000,
  conflictResolutionTimeout: 10000,
}

// Storage keys
export const STORAGE_KEYS = {
  USER: '@synccoreai/user',
  AUTH_TOKEN: '@synccoreai/auth_token',
  DOCUMENTS: '@synccoreai/documents',
  OFFLINE_OPERATIONS: '@synccoreai/offline_operations',
  SETTINGS: '@synccoreai/settings',
  THEME: '@synccoreai/theme',
  LAST_SYNC_TIME: '@synccoreai/last_sync_time',
} as const

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_DOCUMENT: 'join-document',
  LEAVE_DOCUMENT: 'leave-document',
  DOCUMENT_UPDATE: 'document-update',
  CURSOR_UPDATE: 'cursor-update',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  CONFLICT_DETECTED: 'conflict-detected',
  CONFLICT_RESOLVED: 'conflict-resolved',
} as const

// Test accounts
export const TEST_ACCOUNTS = [
  {
    email: 'admin@synccoreai.com',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Admin User',
  },
  {
    email: 'editor@synccoreai.com',
    password: 'admin123',
    role: 'editor' as const,
    name: 'Editor User',
  },
  {
    email: 'author@synccoreai.com',
    password: 'admin123',
    role: 'author' as const,
    name: 'Author User',
  },
  {
    email: 'viewer@synccoreai.com',
    password: 'admin123',
    role: 'viewer' as const,
    name: 'Viewer User',
  },
]

// Performance thresholds
export const PERFORMANCE = {
  MAX_MEMORY_MB: 100,
  MAX_STARTUP_TIME_MS: 2000,
  MAX_SYNC_DELAY_MS: 100,
  TARGET_FPS: 60,
}

// Feature flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  VOICE_INPUT: true,
  AI_SUGGESTIONS: true,
  OFFLINE_MODE: true,
  REAL_TIME_COLLABORATION: true,
  ANALYTICS: true,
}
