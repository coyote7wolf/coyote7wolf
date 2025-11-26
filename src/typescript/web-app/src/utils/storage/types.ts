/**
 * Storage Helper System - Type Definitions
 *
 * Unified storage management with encryption, cross-tab synchronization,
 * quota management, and multiple storage backends.
 */

/**
 * Storage Backend Types
 */
export type StorageBackend =
  | 'localStorage'
  | 'sessionStorage'
  | 'indexedDB'
  | 'memory'
  | 'custom'

/**
 * Storage Value Types
 */
export type StorageValue = string | number | boolean | object | null | undefined

/**
 * Serialization Strategy
 */
export type SerializationStrategy = 'json' | 'string' | 'binary' | 'custom'

/**
 * Storage Configuration
 */
export interface StorageConfig {
  backend: StorageBackend
  prefix?: string
  encryption?: EncryptionConfig
  serialization?: SerializationStrategy
  compression?: boolean
  quotaManagement?: QuotaConfig
  crossTab?: CrossTabConfig
  fallback?: StorageBackend[]
  debug?: boolean
}

/**
 * Encryption Configuration
 */
export interface EncryptionConfig {
  enabled: boolean
  algorithm?: 'AES-GCM' | 'AES-CBC' | 'custom'
  keyDerivation?: 'PBKDF2' | 'scrypt' | 'custom'
  iterations?: number
  saltLength?: number
  customEncrypt?: (data: string, key: string) => Promise<string>
  customDecrypt?: (encryptedData: string, key: string) => Promise<string>
}

/**
 * Quota Management Configuration
 */
export interface QuotaConfig {
  enabled: boolean
  maxSize?: number // in bytes
  cleanupStrategy?: 'lru' | 'fifo' | 'size' | 'expiration' | 'custom'
  warningThreshold?: number // percentage
  onQuotaExceeded?: (usedSpace: number, totalSpace: number) => void
  onCleanup?: (removedItems: string[]) => void
}

/**
 * Cross-Tab Synchronization Configuration
 */
export interface CrossTabConfig {
  enabled: boolean
  channel?: string
  broadcastChanges?: boolean
  syncOnFocus?: boolean
  conflictResolution?: 'lastWrite' | 'firstWrite' | 'merge' | 'custom'
  customResolver?: (local: any, remote: any, key: string) => any
}

/**
 * Storage Item Metadata
 */
export interface StorageMetadata {
  key: string
  value: StorageValue
  size: number
  createdAt: number
  updatedAt: number
  accessedAt: number
  expiresAt?: number
  tags?: string[]
  priority?: number
  version?: number
}

/**
 * Storage Query Options
 */
export interface QueryOptions {
  prefix?: string
  tags?: string[]
  createdAfter?: number
  createdBefore?: number
  updatedAfter?: number
  updatedBefore?: number
  expiresAfter?: number
  expiresBefore?: number
  limit?: number
  offset?: number
  sortBy?: 'key' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'size'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Storage Operation Result
 */
export interface StorageResult<T = StorageValue> {
  success: boolean
  data?: T
  error?: string
  metadata?: StorageMetadata
  fromCache?: boolean
}

/**
 * Batch Operation
 */
export interface BatchOperation {
  type: 'set' | 'get' | 'remove'
  key: string
  value?: StorageValue
  options?: SetOptions
}

/**
 * Batch Operation Result
 */
export interface BatchResult {
  success: boolean
  results: Array<{
    key: string
    success: boolean
    data?: StorageValue
    error?: string
  }>
  totalTime: number
}

/**
 * Set Options
 */
export interface SetOptions {
  ttl?: number // time to live in milliseconds
  tags?: string[]
  priority?: number
  overwrite?: boolean
  compress?: boolean
  encrypt?: boolean
}

/**
 * Get Options
 */
export interface GetOptions {
  defaultValue?: StorageValue
  updateAccess?: boolean
  decrypt?: boolean
  decompress?: boolean
}

/**
 * Storage Event Types
 */
export type StorageEventType =
  | 'set'
  | 'get'
  | 'remove'
  | 'clear'
  | 'expire'
  | 'quota'
  | 'sync'
  | 'error'

/**
 * Storage Event
 */
export interface StorageEvent {
  type: StorageEventType
  key?: string
  oldValue?: StorageValue
  newValue?: StorageValue
  metadata?: StorageMetadata
  source: 'local' | 'remote' | 'system'
  timestamp: number
}

/**
 * Storage Statistics
 */
export interface StorageStats {
  totalItems: number
  totalSize: number
  availableSpace?: number
  quota?: number
  quotaUsed?: number
  cacheHitRate?: number
  averageItemSize: number
  oldestItem?: StorageMetadata
  newestItem?: StorageMetadata
  itemsByTag: Record<string, number>
  backendInfo: {
    type: StorageBackend
    available: boolean
    version?: string
    features: string[]
  }
}

/**
 * Custom Storage Backend Interface
 */
export interface CustomStorageBackend {
  name: string
  isAvailable(): boolean
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  length(): Promise<number>
  keys(): Promise<string[]>
  getQuota?(): Promise<{ used: number; available: number }>
}

/**
 * Migration Configuration
 */
export interface MigrationConfig {
  enabled: boolean
  fromVersion?: string
  toVersion: string
  migrations: Array<{
    version: string
    migrate: (storage: any) => Promise<void>
    rollback?: (storage: any) => Promise<void>
  }>
}

/**
 * Storage Observer
 */
export interface StorageObserver {
  id: string
  keys?: string[]
  patterns?: RegExp[]
  callback: (event: StorageEvent) => void
  once?: boolean
}

/**
 * Cache Configuration
 */
export interface CacheConfig {
  enabled: boolean
  maxSize?: number
  ttl?: number
  strategy?: 'lru' | 'lfu' | 'fifo'
  persistToStorage?: boolean
}

/**
 * Sync Configuration
 */
export interface SyncConfig {
  enabled: boolean
  endpoint?: string
  interval?: number
  strategy?: 'push' | 'pull' | 'bidirectional'
  authentication?: {
    type: 'bearer' | 'basic' | 'custom'
    credentials: Record<string, string>
  }
  onConflict?: (local: any, remote: any, key: string) => any
}

/**
 * Storage Export/Import Options
 */
export interface ExportOptions {
  format?: 'json' | 'csv' | 'binary'
  keys?: string[]
  includeMetadata?: boolean
  compress?: boolean
  encrypt?: boolean
  password?: string
}

export interface ImportOptions {
  format?: 'json' | 'csv' | 'binary'
  overwrite?: boolean
  merge?: boolean
  skipInvalid?: boolean
  decrypt?: boolean
  decompress?: boolean
  password?: string
  onProgress?: (progress: number) => void
}

/**
 * Storage Utilities
 */
export interface StorageUtils {
  calculateSize(value: StorageValue): number
  compress(data: string): Promise<string>
  decompress(compressedData: string): Promise<string>
  encrypt(data: string, key: string): Promise<string>
  decrypt(encryptedData: string, key: string): Promise<string>
  generateKey(): string
  validateKey(key: string): boolean
  sanitizeKey(key: string): string
  isExpired(metadata: StorageMetadata): boolean
  formatBytes(bytes: number): string
  estimateQuota(): Promise<{ used: number; available: number }>
}

/**
 * Default Storage Configuration
 */
export const DEFAULT_STORAGE_CONFIG: Required<StorageConfig> = {
  backend: 'localStorage',
  prefix: '',
  encryption: {
    enabled: false,
    algorithm: 'AES-GCM',
    keyDerivation: 'PBKDF2',
    iterations: 100000,
    saltLength: 16,
  },
  serialization: 'json',
  compression: false,
  quotaManagement: {
    enabled: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    cleanupStrategy: 'lru',
    warningThreshold: 80,
  },
  crossTab: {
    enabled: false,
    channel: 'storage-sync',
    broadcastChanges: true,
    syncOnFocus: true,
    conflictResolution: 'lastWrite',
  },
  fallback: ['sessionStorage', 'memory'],
  debug: false,
}

/**
 * Storage Error Types
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public key?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

export class QuotaExceededError extends StorageError {
  constructor(key?: string, usedSpace?: number, totalSpace?: number) {
    super(
      `Storage quota exceeded${key ? ` for key: ${key}` : ''}`,
      'QUOTA_EXCEEDED',
      key
    )
    this.name = 'QuotaExceededError'
  }
}

export class EncryptionError extends StorageError {
  constructor(message: string, key?: string, originalError?: Error) {
    super(message, 'ENCRYPTION_ERROR', key, originalError)
    this.name = 'EncryptionError'
  }
}

export class BackendNotAvailableError extends StorageError {
  constructor(backend: StorageBackend) {
    super(
      `Storage backend '${backend}' is not available`,
      'BACKEND_NOT_AVAILABLE'
    )
    this.name = 'BackendNotAvailableError'
  }
}
