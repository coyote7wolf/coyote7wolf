/**
 * Logger System Types and Interfaces
 *
 * Comprehensive logging system with multiple log levels, structured logging,
 * remote logging integration, and environment-specific configurations.
 */

/**
 * Log Levels (RFC 5424 Syslog Standard)
 */
export enum LogLevel {
  EMERGENCY = 0, // System is unusable
  ALERT = 1, // Action must be taken immediately
  CRITICAL = 2, // Critical conditions
  ERROR = 3, // Error conditions
  WARNING = 4, // Warning conditions
  NOTICE = 5, // Normal but significant condition
  INFO = 6, // Informational messages
  DEBUG = 7, // Debug-level messages
}

/**
 * Log Categories for Organization
 */
export enum LogCategory {
  SYSTEM = 'system',
  AUTH = 'auth',
  API = 'api',
  UI = 'ui',
  DATABASE = 'database',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  BUSINESS = 'business',
  EXTERNAL = 'external',
  TESTING = 'testing',
}

/**
 * Log Context Information
 */
export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  userAgent?: string
  ip?: string
  url?: string
  method?: string
  component?: string
  feature?: string
  version?: string
  buildId?: string
  environment?: string
  timestamp?: string
  duration?: number
  metadata?: Record<string, any>
}

/**
 * Structured Log Entry
 */
export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  context: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string | number
    cause?: any
  }
  tags?: string[]
  source: {
    file?: string
    function?: string
    line?: number
    column?: number
  }
}

/**
 * Logger Configuration
 */
export interface LoggerConfig {
  level: LogLevel
  categories: LogCategory[]
  enableConsole: boolean
  enableRemote: boolean
  enableStorage: boolean
  maxStorageEntries: number
  remoteEndpoint?: string
  remoteApiKey?: string
  bufferSize: number
  flushInterval: number
  enableSourceMap: boolean
  enableStackTrace: boolean
  enablePerformanceLogging: boolean
  enableUserTracking: boolean
  enableErrorBoundary: boolean
  sensitiveFields: string[]
  maskSensitiveData: boolean
  environment: 'development' | 'staging' | 'production' | 'test'
}

/**
 * Log Transport Interface
 */
export interface LogTransport {
  name: string
  level: LogLevel
  enabled: boolean
  log(entry: LogEntry): Promise<void> | void
  flush?(): Promise<void> | void
  close?(): Promise<void> | void
}

/**
 * Log Filter Function
 */
export type LogFilter = (entry: LogEntry) => boolean

/**
 * Log Formatter Function
 */
export type LogFormatter = (entry: LogEntry) => string

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  memory?: {
    used: number
    total: number
  }
  navigation?: {
    type: string
    redirectCount: number
  }
  timing?: {
    domContentLoaded: number
    loadComplete: number
    firstPaint: number
    firstContentfulPaint: number
  }
}

/**
 * Log Aggregation Data
 */
export interface LogAggregation {
  period: 'minute' | 'hour' | 'day'
  timestamp: string
  counts: Record<LogLevel, number>
  categories: Record<LogCategory, number>
  errors: {
    count: number
    unique: number
    topErrors: Array<{
      message: string
      count: number
      lastOccurrence: string
    }>
  }
  performance: {
    averageResponseTime: number
    slowestRequests: Array<{
      url: string
      duration: number
      timestamp: string
    }>
  }
}

/**
 * Remote Logging Configuration
 */
export interface RemoteLoggingConfig {
  endpoint: string
  apiKey?: string
  headers?: Record<string, string>
  timeout: number
  retryAttempts: number
  retryDelay: number
  batchSize: number
  enableCompression: boolean
  enableEncryption: boolean
}

/**
 * Logger Event Types
 */
export type LoggerEventType =
  | 'log_created'
  | 'log_filtered'
  | 'transport_error'
  | 'buffer_full'
  | 'flush_started'
  | 'flush_completed'
  | 'remote_sync_started'
  | 'remote_sync_completed'
  | 'remote_sync_failed'

/**
 * Logger Event
 */
export interface LoggerEvent {
  type: LoggerEventType
  timestamp: string
  data?: any
  error?: Error
}

/**
 * Logger Statistics
 */
export interface LoggerStats {
  totalLogs: number
  logsByLevel: Record<LogLevel, number>
  logsByCategory: Record<LogCategory, number>
  errors: number
  warnings: number
  remoteLogsSent: number
  remoteLogsFailed: number
  bufferSize: number
  lastFlush: string
  uptime: number
}

/**
 * Log Search Options
 */
export interface LogSearchOptions {
  level?: LogLevel[]
  category?: LogCategory[]
  startTime?: string
  endTime?: string
  message?: string
  userId?: string
  component?: string
  tags?: string[]
  hasError?: boolean
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'level' | 'category'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Log Export Options
 */
export interface LogExportOptions {
  format: 'json' | 'csv' | 'txt'
  searchOptions?: LogSearchOptions
  includeContext?: boolean
  includeStackTrace?: boolean
  compress?: boolean
}

/**
 * Utility Types
 */
export type LogLevelName = keyof typeof LogLevel
export type LogCategoryName = keyof typeof LogCategory

/**
 * Type Guards
 */
export function isValidLogLevel(level: any): level is LogLevel {
  return typeof level === 'number' && level >= 0 && level <= 7
}

export function isValidLogCategory(category: any): category is LogCategory {
  return (
    typeof category === 'string' &&
    Object.values(LogCategory).includes(category as LogCategory)
  )
}

export function isLogEntry(obj: any): obj is LogEntry {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.timestamp === 'string' &&
    isValidLogLevel(obj.level) &&
    isValidLogCategory(obj.category) &&
    typeof obj.message === 'string' &&
    obj.context &&
    typeof obj.context === 'object'
  )
}

/**
 * Log Level Utilities
 */
export const LogLevelUtils = {
  /**
   * Get log level name
   */
  getName(level: LogLevel): string {
    return LogLevel[level] || 'UNKNOWN'
  },

  /**
   * Get log level from name
   */
  fromName(name: string): LogLevel | undefined {
    const level = LogLevel[name.toUpperCase() as LogLevelName]
    return typeof level === 'number' ? level : undefined
  },

  /**
   * Check if level should be logged
   */
  shouldLog(messageLevel: LogLevel, configLevel: LogLevel): boolean {
    return messageLevel <= configLevel
  },

  /**
   * Get color for log level (for console output)
   */
  getColor(level: LogLevel): string {
    const colors = {
      [LogLevel.EMERGENCY]: '#FF0000', // Red
      [LogLevel.ALERT]: '#FF4500', // Orange Red
      [LogLevel.CRITICAL]: '#FF6600', // Orange
      [LogLevel.ERROR]: '#FF8C00', // Dark Orange
      [LogLevel.WARNING]: '#FFD700', // Gold
      [LogLevel.NOTICE]: '#00CED1', // Dark Turquoise
      [LogLevel.INFO]: '#87CEEB', // Sky Blue
      [LogLevel.DEBUG]: '#D3D3D3', // Light Gray
    }
    return colors[level] || '#000000'
  },

  /**
   * Get emoji for log level
   */
  getEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.EMERGENCY]: '🚨',
      [LogLevel.ALERT]: '⚠️',
      [LogLevel.CRITICAL]: '💥',
      [LogLevel.ERROR]: '❌',
      [LogLevel.WARNING]: '⚠️',
      [LogLevel.NOTICE]: 'ℹ️',
      [LogLevel.INFO]: '📝',
      [LogLevel.DEBUG]: '🐛',
    }
    return emojis[level] || '📄'
  },
}

/**
 * Default Logger Configuration
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  categories: Object.values(LogCategory),
  enableConsole: true,
  enableRemote: false,
  enableStorage: true,
  maxStorageEntries: 1000,
  bufferSize: 50,
  flushInterval: 30000, // 30 seconds
  enableSourceMap: true,
  enableStackTrace: true,
  enablePerformanceLogging: true,
  enableUserTracking: false,
  enableErrorBoundary: true,
  sensitiveFields: [
    'password',
    'token',
    'apiKey',
    'secret',
    'creditCard',
    'ssn',
    'email',
    'phone',
  ],
  maskSensitiveData: true,
  environment: 'development',
}

/**
 * Log Level Configuration by Environment
 */
export const LOG_LEVEL_BY_ENVIRONMENT: Record<string, LogLevel> = {
  development: LogLevel.DEBUG,
  staging: LogLevel.INFO,
  production: LogLevel.WARNING,
  test: LogLevel.ERROR,
}
