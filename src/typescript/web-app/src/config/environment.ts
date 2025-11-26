/**
 * Environment Configuration for SyncCoreAI Web App
 *
 * This module manages environment variables and app configuration
 * across different deployment modes (development, mock-api, mock-data, production)
 */

export type AppMode = 'development' | 'mock-api' | 'mock-data' | 'production'

export const APP_MODE: AppMode = (process.env.MODE as AppMode) || 'development'

export const isDevelopment = APP_MODE === 'development'
export const isMockApi = APP_MODE === 'mock-api'
export const isMockData = APP_MODE === 'mock-data'
export const isProduction = APP_MODE === 'production'

// Base configuration for each mode
export const CONFIG = {
  development: {
    apiBase: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3100',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3302',
    useMockData: false,
    enableWebSocket: true,
    enableDevtools: true,
    logLevel: 'debug' as const,
  },
  'mock-api': {
    apiBase: 'http://localhost:3100', // JSON Server
    wsUrl: 'ws://localhost:3333', // Mock WS Server
    useMockData: false,
    enableWebSocket: true,
    enableDevtools: true,
    logLevel: 'debug' as const,
  },
  'mock-data': {
    apiBase: '', // 不使用真實 API
    wsUrl: '', // 不使用真實 WebSocket
    useMockData: true,
    enableWebSocket: false, // 改用本地事件循環
    enableDevtools: true,
    logLevel: 'info' as const,
  },
  production: {
    apiBase: process.env.NEXT_PUBLIC_API_BASE || 'https://api.synccoreai.com',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.synccoreai.com',
    useMockData: false,
    enableWebSocket: true,
    enableDevtools: false,
    logLevel: 'error' as const,
  },
}[APP_MODE]

// App configuration
export const APP_CONFIG = {
  name: 'SyncCoreAI',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  description:
    'Intelligent collaborative document editing platform with AI assistance',

  // Feature flags
  features: {
    aiSuggestions: process.env.NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS !== 'false',
    conflictResolution:
      process.env.NEXT_PUBLIC_FEATURE_CONFLICT_RESOLUTION !== 'false',
    offlineMode: process.env.NEXT_PUBLIC_FEATURE_OFFLINE_MODE !== 'false',
    realTimeCollaboration:
      process.env.NEXT_PUBLIC_FEATURE_REALTIME_COLLAB !== 'false',
    metrics: process.env.NEXT_PUBLIC_FEATURE_METRICS !== 'false',
    notifications: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS !== 'false',
  },

  // API endpoints
  endpoints: {
    auth: '/auth',
    documents: '/documents',
    users: '/users',
    ai: '/ai',
    sync: '/sync',
    presence: '/presence',
    notifications: '/notifications',
  },

  // UI configuration
  ui: {
    defaultTheme: 'light' as const,
    supportedThemes: ['light', 'dark'] as const,
    defaultLanguage: 'en' as const,
    supportedLanguages: ['en', 'zh-TW', 'zh-CN'] as const,
  },

  // Performance configuration
  performance: {
    maxRetries: 3,
    retryDelay: 1000,
    requestTimeout: 10000,
    debounceDelay: 300,
    throttleDelay: 100,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },

  // Analytics and monitoring
  analytics: {
    enabled: !isDevelopment && !isMockData,
    gtag: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: APP_MODE,
    },
  },
} as const

// Environment validation
export function validateEnvironment() {
  const requiredVars = []

  if (isProduction) {
    if (!process.env.NEXT_PUBLIC_API_BASE) {
      requiredVars.push('NEXT_PUBLIC_API_BASE')
    }
    if (!process.env.NEXT_PUBLIC_WS_URL) {
      requiredVars.push('NEXT_PUBLIC_WS_URL')
    }
  }

  if (requiredVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${requiredVars.join(', ')}`
    )
  }
}

// Type definitions
export type Config = typeof CONFIG
export type AppConfig = typeof APP_CONFIG
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type Theme = 'light' | 'dark'
export type Language = 'en' | 'zh-TW' | 'zh-CN'

export default {
  APP_MODE,
  CONFIG,
  APP_CONFIG,
  isDevelopment,
  isMockApi,
  isMockData,
  isProduction,
  validateEnvironment,
}
