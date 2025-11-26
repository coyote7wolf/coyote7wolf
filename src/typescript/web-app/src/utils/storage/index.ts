/**
 * Storage Helper System - Main Implementation
 *
 * Unified storage management with multiple backends, encryption,
 * quota management, and cross-tab synchronization.
 */

import {
  StorageConfig,
  StorageValue,
  StorageResult,
  StorageMetadata,
  SetOptions,
  GetOptions,
  QueryOptions,
  StorageStats,
  StorageEvent,
  StorageObserver,
  BatchOperation,
  BatchResult,
  StorageBackend,
  DEFAULT_STORAGE_CONFIG,
  StorageError,
  QuotaExceededError,
  BackendNotAvailableError,
} from './types'

/**
 * Storage Backend Implementations
 */
class LocalStorageBackend {
  isAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined' && localStorage !== null
    } catch {
      return false
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new QuotaExceededError(key)
      }
      throw error
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore errors for remove operations
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch {
      // Ignore errors for clear operations
    }
  }

  async length(): Promise<number> {
    try {
      return localStorage.length
    } catch {
      return 0
    }
  }

  async keys(): Promise<string[]> {
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) keys.push(key)
      }
      return keys
    } catch {
      return []
    }
  }
}

class SessionStorageBackend {
  isAvailable(): boolean {
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage !== null
    } catch {
      return false
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new QuotaExceededError(key)
      }
      throw error
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Ignore errors
    }
  }

  async clear(): Promise<void> {
    try {
      sessionStorage.clear()
    } catch {
      // Ignore errors
    }
  }

  async length(): Promise<number> {
    try {
      return sessionStorage.length
    } catch {
      return 0
    }
  }

  async keys(): Promise<string[]> {
    try {
      const keys: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) keys.push(key)
      }
      return keys
    } catch {
      return []
    }
  }
}

class MemoryStorageBackend {
  private storage: Map<string, string> = new Map()

  isAvailable(): boolean {
    return true
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value)
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key)
  }

  async clear(): Promise<void> {
    this.storage.clear()
  }

  async length(): Promise<number> {
    return this.storage.size
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys())
  }
}

/**
 * Main Storage Manager
 */
export class StorageManager {
  private config: Required<StorageConfig>
  private backend: any
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private observers: StorageObserver[] = []
  private metadata: Map<string, StorageMetadata> = new Map()

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config }
    this.backend = this.initializeBackend()

    if (this.config.crossTab.enabled) {
      this.initializeCrossTabSync()
    }
  }

  /**
   * Initialize storage backend
   */
  private initializeBackend() {
    const backends = {
      localStorage: new LocalStorageBackend(),
      sessionStorage: new SessionStorageBackend(),
      memory: new MemoryStorageBackend(),
    }

    const primaryBackend =
      backends[this.config.backend as keyof typeof backends]
    if (primaryBackend?.isAvailable()) {
      return primaryBackend
    }

    // Try fallback backends
    for (const fallback of this.config.fallback) {
      const fallbackBackend = backends[fallback as keyof typeof backends]
      if (fallbackBackend?.isAvailable()) {
        if (this.config.debug) {
          console.warn(
            `Primary backend '${this.config.backend}' not available, using '${fallback}'`
          )
        }
        return fallbackBackend
      }
    }

    throw new BackendNotAvailableError(this.config.backend)
  }

  /**
   * Initialize cross-tab synchronization
   */
  private initializeCrossTabSync(): void {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', event => {
        if (event.key && event.key.startsWith(this.config.prefix)) {
          this.handleStorageEvent(event)
        }
      })

      window.addEventListener('focus', () => {
        if (this.config.crossTab.syncOnFocus) {
          this.syncFromRemote()
        }
      })
    }
  }

  /**
   * Handle storage events from other tabs
   */
  private handleStorageEvent(event: any): void {
    const key = this.removePrefix(event.key || '')
    const storageEvent: StorageEvent = {
      type: 'sync',
      key,
      oldValue: this.deserialize(event.oldValue || null),
      newValue: this.deserialize(event.newValue || null),
      source: 'remote',
      timestamp: Date.now(),
    }

    this.notifyObservers(storageEvent)
  }

  /**
   * Set item in storage
   */
  async set(
    key: string,
    value: StorageValue,
    options: SetOptions = {}
  ): Promise<StorageResult<void>> {
    try {
      const serializedValue = this.serialize(value)
      const metadata: StorageMetadata = {
        key,
        value,
        size: this.calculateSize(serializedValue),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessedAt: Date.now(),
        version: 1,
      }

      if (options.ttl) {
        metadata.expiresAt = Date.now() + options.ttl
      }
      if (options.tags) {
        metadata.tags = options.tags
      }
      if (options.priority) {
        metadata.priority = options.priority
      }

      // Check quota before storing
      if (this.config.quotaManagement.enabled) {
        await this.checkQuota(metadata.size)
      }

      const prefixedKey = this.addPrefix(key)
      const dataToStore = {
        value: serializedValue,
        metadata,
      }

      await this.backend.setItem(prefixedKey, JSON.stringify(dataToStore))

      // Update metadata cache
      this.metadata.set(key, metadata)

      // Update in-memory cache
      this.cache.set(key, { data: value, timestamp: Date.now() })

      // Notify observers
      this.notifyObservers({
        type: 'set',
        key,
        newValue: value,
        metadata,
        source: 'local',
        timestamp: Date.now(),
      })

      return { success: true, metadata }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get item from storage
   */
  async get<T = StorageValue>(
    key: string,
    options: GetOptions = {}
  ): Promise<StorageResult<T>> {
    try {
      // Check in-memory cache first
      const cached = this.cache.get(key)
      if (cached && this.isCacheValid(cached)) {
        return {
          success: true,
          data: cached.data as T,
          fromCache: true,
        }
      }

      const prefixedKey = this.addPrefix(key)
      const rawData = await this.backend.getItem(prefixedKey)

      if (!rawData) {
        return {
          success: false,
          data: options.defaultValue as T,
          error: 'Key not found',
        }
      }

      const storedData = JSON.parse(rawData)
      const metadata: StorageMetadata = storedData.metadata

      // Check if expired
      if (metadata.expiresAt && Date.now() > metadata.expiresAt) {
        await this.remove(key)
        return {
          success: false,
          data: options.defaultValue as T,
          error: 'Key expired',
        }
      }

      const value = this.deserialize(storedData.value) as T

      // Update access time if requested
      if (options.updateAccess) {
        metadata.accessedAt = Date.now()
        this.metadata.set(key, metadata)
      }

      // Update cache
      this.cache.set(key, { data: value, timestamp: Date.now() })

      // Notify observers
      this.notifyObservers({
        type: 'get',
        key,
        newValue: value as StorageValue,
        metadata,
        source: 'local',
        timestamp: Date.now(),
      })

      return {
        success: true,
        data: value,
        metadata,
      }
    } catch (error) {
      return {
        success: false,
        data: options.defaultValue as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Remove item from storage
   */
  async remove(key: string): Promise<StorageResult<void>> {
    try {
      const prefixedKey = this.addPrefix(key)
      const oldValue = await this.get(key)

      await this.backend.removeItem(prefixedKey)

      // Remove from caches
      this.cache.delete(key)
      this.metadata.delete(key)

      // Notify observers
      this.notifyObservers({
        type: 'remove',
        key,
        oldValue: oldValue.data,
        source: 'local',
        timestamp: Date.now(),
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<StorageResult<void>> {
    try {
      await this.backend.clear()
      this.cache.clear()
      this.metadata.clear()

      this.notifyObservers({
        type: 'clear',
        source: 'local',
        timestamp: Date.now(),
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get all keys
   */
  async keys(pattern?: RegExp): Promise<string[]> {
    try {
      const allKeys = await this.backend.keys()
      const unprefixedKeys = allKeys
        .filter((key: string) => key.startsWith(this.config.prefix))
        .map((key: string) => this.removePrefix(key))

      if (pattern) {
        return unprefixedKeys.filter((key: string) => pattern.test(key))
      }

      return unprefixedKeys
    } catch {
      return []
    }
  }

  /**
   * Query storage with options
   */
  async query(options: QueryOptions = {}): Promise<StorageMetadata[]> {
    const keys = await this.keys()
    const results: StorageMetadata[] = []

    for (const key of keys) {
      const metadata = this.metadata.get(key)
      if (metadata && this.matchesQuery(metadata, options)) {
        results.push(metadata)
      }
    }

    // Sort results
    if (options.sortBy) {
      results.sort((a, b) => {
        const aVal = a[options.sortBy!] as number
        const bVal = b[options.sortBy!] as number
        return options.sortOrder === 'desc' ? bVal - aVal : aVal - bVal
      })
    }

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0
      const end = options.limit ? start + options.limit : undefined
      return results.slice(start, end)
    }

    return results
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    const keys = await this.keys()
    const metadataList = (await Promise.all(
      keys.map(key => this.metadata.get(key)).filter(Boolean)
    )) as StorageMetadata[]

    const totalSize = metadataList.reduce((sum, meta) => sum + meta.size, 0)
    const itemsByTag: Record<string, number> = {}

    metadataList.forEach(meta => {
      meta.tags?.forEach(tag => {
        itemsByTag[tag] = (itemsByTag[tag] || 0) + 1
      })
    })

    const oldestItem = metadataList.reduce((oldest, current) =>
      !oldest || current.createdAt < oldest.createdAt ? current : oldest
    )

    const newestItem = metadataList.reduce((newest, current) =>
      !newest || current.createdAt > newest.createdAt ? current : newest
    )

    return {
      totalItems: keys.length,
      totalSize,
      averageItemSize: keys.length > 0 ? totalSize / keys.length : 0,
      oldestItem,
      newestItem,
      itemsByTag,
      backendInfo: {
        type: this.config.backend,
        available: this.backend.isAvailable(),
        features: ['get', 'set', 'remove', 'clear', 'keys'],
      },
    }
  }

  /**
   * Subscribe to storage events
   */
  subscribe(callback: (event: StorageEvent) => void, keys?: string[]): string {
    const observer: StorageObserver = {
      id: Math.random().toString(36).substr(2, 9),
      callback,
    }

    if (keys) {
      observer.keys = keys
    }
    this.observers.push(observer)
    return observer.id
  }

  /**
   * Unsubscribe from storage events
   */
  unsubscribe(id: string): void {
    this.observers = this.observers.filter(observer => observer.id !== id)
  }

  /**
   * Utility methods
   */
  private addPrefix(key: string): string {
    return this.config.prefix + key
  }

  private removePrefix(key: string): string {
    return key.startsWith(this.config.prefix)
      ? key.slice(this.config.prefix.length)
      : key
  }

  private serialize(value: StorageValue): string {
    if (this.config.serialization === 'json') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  private deserialize(value: string | null): StorageValue {
    if (!value) return null

    if (this.config.serialization === 'json') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  }

  private calculateSize(value: string): number {
    return new Blob([value]).size
  }

  private isCacheValid(cached: { data: any; timestamp: number }): boolean {
    const maxAge = 5 * 60 * 1000 // 5 minutes
    return Date.now() - cached.timestamp < maxAge
  }

  private async checkQuota(additionalSize: number): Promise<void> {
    if (!this.config.quotaManagement.enabled) return

    const stats = await this.getStats()
    const newSize = stats.totalSize + additionalSize
    const maxSize = this.config.quotaManagement.maxSize || 0

    if (newSize > maxSize) {
      // Run cleanup
      await this.runCleanup()

      // Check again
      const updatedStats = await this.getStats()
      if (updatedStats.totalSize + additionalSize > maxSize) {
        throw new QuotaExceededError()
      }
    }
  }

  private async runCleanup(): Promise<void> {
    const keys = await this.keys()
    const metadataList = keys
      .map(key => this.metadata.get(key))
      .filter(Boolean) as StorageMetadata[]

    // Sort by cleanup strategy
    if (this.config.quotaManagement.cleanupStrategy === 'lru') {
      metadataList.sort((a, b) => a.accessedAt - b.accessedAt)
    } else if (this.config.quotaManagement.cleanupStrategy === 'fifo') {
      metadataList.sort((a, b) => a.createdAt - b.createdAt)
    }

    // Remove oldest 20% of items
    const itemsToRemove = Math.ceil(metadataList.length * 0.2)
    const keysToRemove = metadataList
      .slice(0, itemsToRemove)
      .map(meta => meta.key)

    for (const key of keysToRemove) {
      await this.remove(key)
    }

    this.config.quotaManagement.onCleanup?.(keysToRemove)
  }

  private matchesQuery(
    metadata: StorageMetadata,
    options: QueryOptions
  ): boolean {
    // Implement query matching logic
    if (options.prefix && !metadata.key.startsWith(options.prefix)) {
      return false
    }

    if (
      options.tags &&
      !options.tags.some(tag => metadata.tags?.includes(tag))
    ) {
      return false
    }

    if (options.createdAfter && metadata.createdAt < options.createdAfter) {
      return false
    }

    if (options.createdBefore && metadata.createdAt > options.createdBefore) {
      return false
    }

    return true
  }

  private notifyObservers(event: StorageEvent): void {
    this.observers.forEach(observer => {
      if (!observer.keys || observer.keys.includes(event.key || '')) {
        observer.callback(event)
      }
    })
  }

  private async syncFromRemote(): Promise<void> {
    // Implementation for syncing from remote tabs
    // This would listen to storage events and update local state
  }
}

// Create and export default instance
export const storage = new StorageManager()

// Export factory function
export const createStorage = (config?: Partial<StorageConfig>) => {
  return new StorageManager(config)
}

// Encryption utilities
class EncryptionUtils {
  private key: CryptoKey | null = null

  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      return
    }

    try {
      const keyData = localStorage.getItem('_encryption_key')
      if (keyData) {
        this.key = await this.importKey(keyData)
      } else {
        this.key = await this.generateKey()
        await this.storeKey(this.key)
      }
    } catch (error) {
      console.warn('Encryption initialization failed:', error)
    }
  }

  private async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  }

  private async storeKey(key: CryptoKey): Promise<void> {
    const exported = await window.crypto.subtle.exportKey('raw', key)
    const keyString = btoa(String.fromCharCode(...new Uint8Array(exported)))
    localStorage.setItem('_encryption_key', keyString)
  }

  private async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = new Uint8Array(
      atob(keyString)
        .split('')
        .map(char => char.charCodeAt(0))
    )
    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    )
  }

  async encrypt(data: string): Promise<string> {
    if (!this.key || typeof window === 'undefined') {
      return btoa(data) // Fallback to base64
    }

    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.key,
        dataBuffer
      )

      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.warn('Encryption failed, using base64:', error)
      return btoa(data)
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.key || typeof window === 'undefined') {
      try {
        return atob(encryptedData)
      } catch {
        return encryptedData
      }
    }

    try {
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      )

      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.key,
        encrypted
      )

      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.warn('Decryption failed, trying base64:', error)
      try {
        return atob(encryptedData)
      } catch {
        return encryptedData
      }
    }
  }
}

// Global encryption instance
const encryptionUtils = new EncryptionUtils()
encryptionUtils.initialize()

// Export encryption functions
export const encrypt = (data: string): Promise<string> => {
  return encryptionUtils.encrypt(data)
}

export const decrypt = (encryptedData: string): Promise<string> => {
  return encryptionUtils.decrypt(encryptedData)
}

// Export types
export * from './types'
