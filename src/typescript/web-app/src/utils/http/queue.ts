/**
 * HTTP Request Queue Implementation
 *
 * Manages request queuing, rate limiting, and concurrent request handling
 * with priority support and backpressure management.
 */

import {
  RequestConfig,
  ApiResponse,
  QueueConfig,
  QueueItem,
  ApiError,
} from './types'

/**
 * Request Queue Manager
 */
export class RequestQueue {
  private queue: QueueItem[] = []
  private processing: Set<string> = new Set()
  private config: Required<QueueConfig>
  private processingInterval: NodeJS.Timeout | null = null

  constructor(config: QueueConfig) {
    this.config = {
      ...config,
      enabled: config.enabled ?? true,
      maxConcurrent: config.maxConcurrent ?? 6,
      delay: config.delay ?? 0,
      priority: config.priority ?? (() => 0),
    }

    if (this.config.enabled) {
      this.startProcessing()
    }
  }

  /**
   * Add request to queue
   */
  async enqueue<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    if (!this.config.enabled) {
      throw new Error('Queue is disabled')
    }

    return new Promise((resolve, reject) => {
      const id = this.generateId()
      const priority = this.config.priority(config)

      const item: QueueItem = {
        id,
        config,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
        retryCount: 0,
      }

      // Insert item in priority order
      this.insertByPriority(item)
    })
  }

  /**
   * Process queue items
   */
  private async processQueue(): Promise<void> {
    if (
      this.processing.size >= this.config.maxConcurrent ||
      this.queue.length === 0
    ) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.processing.add(item.id)

    try {
      // Add delay if configured
      if (this.config.delay > 0) {
        await this.delay(this.config.delay)
      }

      // Execute request (this would be implemented by the HTTP client)
      // For now, we'll simulate the request
      const response = await this.executeRequest(item.config)
      item.resolve(response)
    } catch (error) {
      item.reject(error as ApiError)
    } finally {
      this.processing.delete(item.id)
    }
  }

  /**
   * Start queue processing
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, 10) // Process every 10ms
  }

  /**
   * Stop queue processing
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared') as ApiError)
    })
    this.queue = []
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueSize: number
    processing: number
    maxConcurrent: number
    totalProcessed: number
  } {
    return {
      queueSize: this.queue.length,
      processing: this.processing.size,
      maxConcurrent: this.config.maxConcurrent,
      totalProcessed: 0, // Would track this in real implementation
    }
  }

  /**
   * Insert item by priority (higher priority first)
   */
  private insertByPriority(item: QueueItem): void {
    const index = this.queue.findIndex(
      queued => queued.priority < item.priority
    )
    if (index === -1) {
      this.queue.push(item)
    } else {
      this.queue.splice(index, 0, item)
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Execute request (placeholder - would be implemented by HTTP client)
   */
  private async executeRequest<T = any>(
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    // This is a placeholder - in real implementation, this would call the actual HTTP client
    throw new Error(
      'Request execution not implemented - should be handled by HTTP client'
    )
  }

  /**
   * Update queue configuration
   */
  updateConfig(newConfig: Partial<QueueConfig>): void {
    const wasEnabled = this.config.enabled
    this.config = { ...this.config, ...newConfig }

    // Start/stop processing based on enabled state
    if (this.config.enabled && !wasEnabled) {
      this.startProcessing()
    } else if (!this.config.enabled && wasEnabled) {
      this.stop()
    }
  }
}

/**
 * Rate Limiter
 */
export class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private timeWindow: number

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindowMs
  }

  /**
   * Check if request is allowed
   */
  isAllowed(): boolean {
    const now = Date.now()

    // Remove old requests outside the time window
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    )

    // Check if we can make another request
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now)
      return true
    }

    return false
  }

  /**
   * Get time until next request is allowed
   */
  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.maxRequests) {
      return 0
    }

    const oldestRequest = Math.min(...this.requests)
    return this.timeWindow - (Date.now() - oldestRequest)
  }

  /**
   * Reset rate limiter
   */
  reset(): void {
    this.requests = []
  }

  /**
   * Get current stats
   */
  getStats(): {
    requestCount: number
    maxRequests: number
    timeWindow: number
    timeUntilNext: number
  } {
    return {
      requestCount: this.requests.length,
      maxRequests: this.maxRequests,
      timeWindow: this.timeWindow,
      timeUntilNext: this.getTimeUntilNextRequest(),
    }
  }
}

/**
 * Request Timeout Manager
 */
export class TimeoutManager {
  private timeouts = new Map<string, NodeJS.Timeout>()

  /**
   * Set timeout for request
   */
  setTimeout(
    requestId: string,
    timeoutMs: number,
    onTimeout: () => void
  ): void {
    // Clear existing timeout
    this.clearTimeout(requestId)

    // Set new timeout
    const timeout = setTimeout(() => {
      this.timeouts.delete(requestId)
      onTimeout()
    }, timeoutMs)

    this.timeouts.set(requestId, timeout)
  }

  /**
   * Clear timeout for request
   */
  clearTimeout(requestId: string): boolean {
    const timeout = this.timeouts.get(requestId)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(requestId)
      return true
    }
    return false
  }

  /**
   * Clear all timeouts
   */
  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout))
    this.timeouts.clear()
  }

  /**
   * Get active timeout count
   */
  getActiveCount(): number {
    return this.timeouts.size
  }
}

/**
 * Request Deduplication
 */
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<ApiResponse>>()

  /**
   * Get or create request promise
   */
  getOrCreate<T = any>(
    key: string,
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    const existing = this.pendingRequests.get(key)
    if (existing) {
      return existing as Promise<ApiResponse<T>>
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Clear pending request
   */
  clear(key: string): boolean {
    return this.pendingRequests.delete(key)
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pendingRequests.clear()
  }

  /**
   * Get pending request count
   */
  getPendingCount(): number {
    return this.pendingRequests.size
  }

  /**
   * Generate cache key for request
   */
  generateKey(config: RequestConfig): string {
    const { url, method = 'GET', params, data } = config
    let key = `${method}:${url}`

    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .reduce(
          (acc, k) => {
            acc[k] = params[k]
            return acc
          },
          {} as Record<string, any>
        )
      key += `?${JSON.stringify(sortedParams)}`
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      key += `:${JSON.stringify(data)}`
    }

    return key
  }
}
