/**
 * HTTP Cache Implementation
 *
 * Provides caching functionality for HTTP requests with configurable storage,
 * TTL management, and cache invalidation strategies.
 */

import { CacheConfig, CacheEntry, RequestConfig, ApiResponse } from './types'

/**
 * Cache Storage Interface
 */
interface CacheStorage {
  get(key: string): Promise<string | null> | string | null
  set(key: string, value: string, ttl?: number): Promise<void> | void
  delete(key: string): Promise<boolean> | boolean
  clear(): Promise<void> | void
  keys(): Promise<string[]> | string[]
}

/**
 * Memory Cache Storage
 */
class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, { value: string; expires: number }>()
  private timers = new Map<string, NodeJS.Timeout>()

  get(key: string): string | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.delete(key)
      return null
    }

    return entry.value
  }

  set(key: string, value: string, ttl = 0): void {
    const expires = ttl > 0 ? Date.now() + ttl : Infinity

    // Clear existing timer
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new entry
    this.cache.set(key, { value, expires })

    // Set expiration timer if TTL is specified
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key)
      }, ttl)
      this.timers.set(key, timer)
    }
  }

  delete(key: string): boolean {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }

    return this.cache.delete(key)
  }

  clear(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    this.cache.clear()
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * LocalStorage Cache Storage
 */
class LocalStorageCacheStorage implements CacheStorage {
  private prefix = 'http_cache_'

  get(key: string): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }

    try {
      const item = window.localStorage.getItem(this.prefix + key)
      if (!item) return null

      const parsed = JSON.parse(item)
      if (Date.now() > parsed.expires) {
        this.delete(key)
        return null
      }

      return parsed.value
    } catch (error) {
      console.error('Failed to get from localStorage cache', { key, error })
      return null
    }
  }

  set(key: string, value: string, ttl = 0): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    try {
      const expires = ttl > 0 ? Date.now() + ttl : Infinity
      const item = JSON.stringify({ value, expires })
      window.localStorage.setItem(this.prefix + key, item)
    } catch (error) {
      console.error('Failed to set localStorage cache', { key, error })
    }
  }

  delete(key: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }

    try {
      window.localStorage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.error('Failed to delete from localStorage cache', { key, error })
      return false
    }
  }

  clear(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    try {
      const keys = this.keys()
      keys.forEach(key => this.delete(key.replace(this.prefix, '')))
    } catch (error) {
      console.error('Failed to clear localStorage cache', { error })
    }
  }

  keys(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return []
    }

    try {
      const keys = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keys.push(key)
        }
      }
      return keys
    } catch (error) {
      console.error('Failed to get localStorage cache keys', { error })
      return []
    }
  }
}

/**
 * HTTP Cache Manager
 */
export class HttpCache {
  private storage: CacheStorage
  private config: Required<CacheConfig>

  constructor(config: CacheConfig) {
    this.config = {
      ...config,
      enabled: config.enabled ?? true,
      ttl: config.ttl ?? 300000, // 5 minutes
      maxSize: config.maxSize ?? 100,
      storage: config.storage ?? 'memory',
      excludeHeaders: config.excludeHeaders ?? [
        'authorization',
        'cookie',
        'set-cookie',
      ],
      keyGenerator: config.keyGenerator ?? this.defaultKeyGenerator,
    }

    this.storage = this.createStorage(this.config.storage)
  }

  /**
   * Create cache storage based on type
   */
  private createStorage(
    type: 'memory' | 'localStorage' | 'sessionStorage'
  ): CacheStorage {
    switch (type) {
      case 'localStorage':
        return new LocalStorageCacheStorage()
      case 'memory':
      default:
        return new MemoryCacheStorage()
    }
  }

  /**
   * Default cache key generator
   */
  private defaultKeyGenerator = (config: RequestConfig): string => {
    const { url, method = 'GET', params, data } = config
    const key = `${method}:${url}`

    if (params && Object.keys(params).length > 0) {
      const sortedParams = Object.keys(params)
        .sort()
        .reduce(
          (acc, key) => {
            acc[key] = params[key]
            return acc
          },
          {} as Record<string, any>
        )
      return `${key}?${JSON.stringify(sortedParams)}`
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      return `${key}:${JSON.stringify(data)}`
    }

    return key
  }

  /**
   * Get cached response
   */
  async get<T = any>(config: RequestConfig): Promise<ApiResponse<T> | null> {
    if (!this.config.enabled) return null

    try {
      const key = this.config.keyGenerator(config)
      const cached = await this.storage.get(key)

      if (!cached) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(cached)

      // Check if entry is expired
      if (Date.now() > entry.timestamp + entry.ttl) {
        await this.storage.delete(key)
        return null
      } // Reconstruct response
      return {
        data: entry.data,
        status: 200,
        statusText: 'OK',
        headers: entry.headers,
        config,
      }
    } catch (error) {
      console.error('Failed to get from cache', { error, config })
      return null
    }
  }

  /**
   * Set cached response
   */
  async set<T = any>(
    config: RequestConfig,
    response: ApiResponse<T>
  ): Promise<void> {
    if (!this.config.enabled) return

    try {
      // Check if response should be cached
      if (!this.shouldCache(config, response)) {
        return
      }

      const key = this.config.keyGenerator(config)

      // Prepare cache entry
      const entry: CacheEntry<T> = {
        data: response.data,
        timestamp: Date.now(),
        ttl: this.config.ttl,
        headers: this.filterHeaders(response.headers),
      }

      // Add etag if present
      if (response.headers.etag) {
        entry.etag = response.headers.etag
      }

      // Check cache size and evict if necessary
      await this.evictIfNecessary()

      // Store in cache
      await this.storage.set(key, JSON.stringify(entry), this.config.ttl)

      // Response cached successfully
    } catch (error) {
      console.error('Failed to set cache', { error, config })
    }
  }

  /**
   * Delete cached response
   */
  async delete(config: RequestConfig): Promise<boolean> {
    try {
      const key = this.config.keyGenerator(config)
      return await this.storage.delete(key)
    } catch (error) {
      console.error('Failed to delete from cache', { error, config })
      return false
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      await this.storage.clear()
    } catch (error) {
      console.error('Failed to clear cache', { error })
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    size: number
    keys: string[]
    storage: string
    maxSize: number
    ttl: number
  }> {
    try {
      const keys = await this.storage.keys()
      return {
        size: keys.length,
        keys,
        storage: this.config.storage,
        maxSize: this.config.maxSize,
        ttl: this.config.ttl,
      }
    } catch (error) {
      console.error('Failed to get cache stats', { error })
      return {
        size: 0,
        keys: [],
        storage: this.config.storage,
        maxSize: this.config.maxSize,
        ttl: this.config.ttl,
      }
    }
  }

  /**
   * Check if response should be cached
   */
  private shouldCache<T = any>(
    config: RequestConfig,
    response: ApiResponse<T>
  ): boolean {
    // Only cache GET requests by default
    if (config.method && config.method !== 'GET') {
      return false
    }

    // Don't cache error responses
    if (response.status >= 400) {
      return false
    }

    // Don't cache responses with cache-control: no-cache
    const cacheControl = response.headers['cache-control']
    if (cacheControl && cacheControl.includes('no-cache')) {
      return false
    }

    return true
  }

  /**
   * Filter headers for caching
   */
  private filterHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    const filtered = { ...headers }

    this.config.excludeHeaders.forEach(header => {
      delete filtered[header.toLowerCase()]
    })

    return filtered
  }

  /**
   * Evict cache entries if necessary
   */
  private async evictIfNecessary(): Promise<void> {
    try {
      const keys = await this.storage.keys()

      if (keys.length >= this.config.maxSize) {
        // Simple LRU eviction - remove oldest entries
        const entriesToRemove = keys.length - this.config.maxSize + 1

        for (let i = 0; i < entriesToRemove; i++) {
          const key = keys[i]
          if (key) {
            await this.storage.delete(key)
          }
        }
      }
    } catch (error) {
      console.error('Failed to evict cache entries', { error })
    }
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Recreate storage if type changed
    if (newConfig.storage && newConfig.storage !== this.config.storage) {
      this.storage = this.createStorage(newConfig.storage)
    }

    // Configuration updated successfully
  }
}

/**
 * Export cache utilities
 */
export const CacheUtils = {
  /**
   * Generate ETag for response data
   */
  generateETag: (data: any): string => {
    const content = typeof data === 'string' ? data : JSON.stringify(data)

    // Simple hash function for ETag generation
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return `"${Math.abs(hash).toString(16)}"`
  },

  /**
   * Parse Cache-Control header
   */
  parseCacheControl: (header: string): Record<string, string | boolean> => {
    const directives: Record<string, string | boolean> = {}

    header.split(',').forEach(directive => {
      const [key, value] = directive.trim().split('=')
      if (key) {
        directives[key.toLowerCase()] = value ? value.replace(/"/g, '') : true
      }
    })

    return directives
  },

  /**
   * Check if response is cacheable based on headers
   */
  isCacheable: (headers: Record<string, string>): boolean => {
    const cacheControl = headers['cache-control']
    if (cacheControl) {
      const directives = CacheUtils.parseCacheControl(cacheControl)
      if (
        directives['no-cache'] ||
        directives['no-store'] ||
        directives['private']
      ) {
        return false
      }
    }

    return true
  },

  /**
   * Get TTL from Cache-Control header
   */
  getTTLFromHeaders: (
    headers: Record<string, string>,
    defaultTTL: number
  ): number => {
    const cacheControl = headers['cache-control']
    if (cacheControl) {
      const directives = CacheUtils.parseCacheControl(cacheControl)
      if (directives['max-age']) {
        return parseInt(directives['max-age'] as string, 10) * 1000
      }
    }

    const expires = headers['expires']
    if (expires) {
      const expiresTime = new Date(expires).getTime()
      const now = Date.now()
      return Math.max(0, expiresTime - now)
    }

    return defaultTTL
  },
}
