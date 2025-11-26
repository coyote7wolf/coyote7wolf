/**
 * 請求包裝系統 (Request Wrapper System)
 * 提供統一的 HTTP 請求處理、快取、重試和錯誤處理功能
 */

import { apiEndpoints } from '../apiEndpoints'
import { defaultLogger as logger, LogCategory } from '../logger'
import { AuthStatus, authStorage } from '../authStorage'

// 請求方法
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

// 請求優先級
export enum RequestPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// 快取策略
export enum CacheStrategy {
  NO_CACHE = 'NO_CACHE',
  CACHE_FIRST = 'CACHE_FIRST',
  NETWORK_FIRST = 'NETWORK_FIRST',
  CACHE_ONLY = 'CACHE_ONLY',
  NETWORK_ONLY = 'NETWORK_ONLY',
  STALE_WHILE_REVALIDATE = 'STALE_WHILE_REVALIDATE',
}

// 重試策略
export interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  retryCondition?: (error: Error, attempt: number) => boolean
}

// 請求配置
export interface RequestConfig {
  method?: RequestMethod
  headers?: Record<string, string>
  body?: any
  timeout?: number
  cache?: CacheStrategy
  cacheTTL?: number
  retry?: RetryConfig
  priority?: RequestPriority
  metadata?: Record<string, any>
  abortController?: AbortController
  onProgress?: (progress: number) => void
  onRetry?: (attempt: number, error: Error) => void
  transformRequest?: (data: any) => any
  transformResponse?: (data: any) => any
  validateStatus?: (status: number) => boolean
}

// 請求響應
export interface RequestResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
  fromCache: boolean
  requestId: string
  duration: number
  retryCount: number
}

// 快取項目
export interface CacheItem {
  data: any
  timestamp: number
  ttl: number
  etag?: string
  lastModified?: string
  requestId: string
}

// 請求統計
export interface RequestStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cacheHits: number
  cacheMisses: number
  averageResponseTime: number
  requestsByMethod: Record<RequestMethod, number>
  errorsByStatus: Record<number, number>
}

// 請求攔截器
export interface RequestInterceptor {
  name: string
  request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  response?: (
    response: RequestResponse
  ) => RequestResponse | Promise<RequestResponse>
  error?: (error: Error) => Error | Promise<Error>
}

// 預設重試配置
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: Error, attempt: number) => {
    // 只重試網路錯誤和 5xx 錯誤
    if (
      error.message.includes('NetworkError') ||
      error.message.includes('fetch')
    ) {
      return true
    }
    if (
      error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503')
    ) {
      return true
    }
    return false
  },
}

// 請求包裝管理器
class RequestWrapperManager {
  private cache = new Map<string, CacheItem>()
  private requestQueue = new Map<string, Promise<RequestResponse>>()
  private interceptors: RequestInterceptor[] = []
  private stats: RequestStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    requestsByMethod: {} as Record<RequestMethod, number>,
    errorsByStatus: {} as Record<number, number>,
  }
  private responseTimeHistory: number[] = []

  constructor() {
    this.setupDefaultInterceptors()
    this.setupCacheCleanup()
  }

  // 設置預設攔截器
  private setupDefaultInterceptors(): void {
    // 認證攔截器
    this.addInterceptor({
      name: 'auth',
      request: async config => {
        const token = await authStorage.getAccessToken()
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          }
        }
        return config
      },
      error: async error => {
        if (error.message.includes('401') || error.message.includes('403')) {
          // 嘗試刷新 token
          const newToken = await authStorage.refreshToken()
          if (!newToken) {
            // 登出用戶
            await authStorage.logout()
          }
        }
        return error
      },
    })

    // 日誌攔截器
    this.addInterceptor({
      name: 'logging',
      request: config => {
        logger.debug(LogCategory.API, 'HTTP Request', {
          component: 'RequestWrapper',
          metadata: {
            method: config.method,
            url: config.metadata?.url,
            headers: config.headers,
          },
        })
        return config
      },
      response: response => {
        logger.debug(LogCategory.API, 'HTTP Response', {
          component: 'RequestWrapper',
          metadata: {
            status: response.status,
            duration: response.duration,
            fromCache: response.fromCache,
          },
        })
        return response
      },
      error: error => {
        logger.error(
          LogCategory.API,
          'HTTP Error',
          {
            component: 'RequestWrapper',
          },
          error
        )
        return error
      },
    })

    // 統計攔截器
    this.addInterceptor({
      name: 'stats',
      request: config => {
        this.stats.totalRequests++
        const method = config.method || RequestMethod.GET
        this.stats.requestsByMethod[method] =
          (this.stats.requestsByMethod[method] || 0) + 1
        return config
      },
      response: response => {
        this.stats.successfulRequests++
        this.updateResponseTime(response.duration)
        return response
      },
      error: error => {
        this.stats.failedRequests++
        const statusMatch = error.message.match(/(\d{3})/)
        if (statusMatch && statusMatch[1]) {
          const status = parseInt(statusMatch[1])
          this.stats.errorsByStatus[status] =
            (this.stats.errorsByStatus[status] || 0) + 1
        }
        return error
      },
    })
  }

  // 設置快取清理
  private setupCacheCleanup(): void {
    // 每5分鐘清理過期快取
    setInterval(
      () => {
        this.cleanExpiredCache()
      },
      5 * 60 * 1000
    )
  }

  // 添加攔截器
  addInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor)
  }

  // 移除攔截器
  removeInterceptor(name: string): void {
    this.interceptors = this.interceptors.filter(i => i.name !== name)
  }

  // 主要請求方法
  async request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<RequestResponse<T>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    // 預設配置
    const finalConfig: RequestConfig = {
      method: RequestMethod.GET,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
      cache: CacheStrategy.NETWORK_FIRST,
      cacheTTL: 5 * 60 * 1000, // 5分鐘
      retry: DEFAULT_RETRY_CONFIG,
      priority: RequestPriority.NORMAL,
      ...config,
      metadata: {
        ...config.metadata,
        url,
        requestId,
        startTime,
      },
    }

    try {
      // 應用請求攔截器
      let processedConfig = finalConfig
      for (const interceptor of this.interceptors) {
        if (interceptor.request) {
          processedConfig = await interceptor.request(processedConfig)
        }
      }

      // 檢查快取
      const cacheKey = this.generateCacheKey(url, processedConfig)
      if (processedConfig.cache !== CacheStrategy.NETWORK_ONLY) {
        const cachedResponse = await this.getCachedResponse<T>(
          cacheKey,
          processedConfig.cache!
        )
        if (cachedResponse) {
          this.stats.cacheHits++
          return cachedResponse
        }
      }

      this.stats.cacheMisses++

      // 檢查是否有相同請求正在進行
      const queueKey = `${processedConfig.method}:${url}:${JSON.stringify(processedConfig.body || {})}`
      if (this.requestQueue.has(queueKey)) {
        return (await this.requestQueue.get(queueKey)) as RequestResponse<T>
      }

      // 執行請求
      const requestPromise = this.executeRequest<T>(
        url,
        processedConfig,
        requestId,
        startTime
      )
      this.requestQueue.set(queueKey, requestPromise)

      try {
        const response = await requestPromise

        // 快取響應
        if (
          processedConfig.cache !== CacheStrategy.NO_CACHE &&
          response.status >= 200 &&
          response.status < 300
        ) {
          await this.cacheResponse(
            cacheKey,
            response,
            processedConfig.cacheTTL!
          )
        }

        return response
      } finally {
        this.requestQueue.delete(queueKey)
      }
    } catch (error) {
      // 應用錯誤攔截器
      let processedError = error as Error
      for (const interceptor of this.interceptors) {
        if (interceptor.error) {
          processedError = await interceptor.error(processedError)
        }
      }
      throw processedError
    }
  }

  // 執行實際請求
  private async executeRequest<T>(
    url: string,
    config: RequestConfig,
    requestId: string,
    startTime: number
  ): Promise<RequestResponse<T>> {
    let lastError: Error | null = null
    const maxAttempts = config.retry?.maxAttempts || 1

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.performRequest<T>(
          url,
          config,
          requestId,
          startTime,
          attempt
        )

        // 應用響應攔截器
        let processedResponse = response
        for (const interceptor of this.interceptors) {
          if (interceptor.response) {
            processedResponse = await interceptor.response(processedResponse)
          }
        }

        return processedResponse
      } catch (error) {
        lastError = error as Error

        if (
          attempt < maxAttempts &&
          config.retry?.retryCondition?.(lastError, attempt)
        ) {
          const delay = this.calculateRetryDelay(attempt, config.retry)

          // 呼叫重試回調
          config.onRetry?.(attempt, lastError)

          logger.warn(
            LogCategory.API,
            `Request retry ${attempt}/${maxAttempts}`,
            {
              component: 'RequestWrapper',
              metadata: {
                url,
                error: lastError.message,
                delay,
              },
            }
          )

          await this.delay(delay)
          continue
        }

        break
      }
    }

    throw lastError
  }

  // 執行單次請求
  private async performRequest<T>(
    url: string,
    config: RequestConfig,
    requestId: string,
    startTime: number,
    attempt: number
  ): Promise<RequestResponse<T>> {
    // 檢查是否為 mock 模式
    if (process.env.NODE_ENV === 'development' || url.includes('mock')) {
      return await this.mockRequest<T>(
        url,
        config,
        requestId,
        startTime,
        attempt
      )
    }

    // 準備請求選項
    const fetchOptions: RequestInit = {
      ...(config.method && { method: config.method }),
      ...(config.headers && { headers: config.headers }),
      ...(config.abortController?.signal && {
        signal: config.abortController.signal,
      }),
    }

    // 處理請求體
    if (
      config.body &&
      config.method !== RequestMethod.GET &&
      config.method !== RequestMethod.HEAD
    ) {
      if (config.transformRequest) {
        fetchOptions.body = JSON.stringify(config.transformRequest(config.body))
      } else if (typeof config.body === 'object') {
        fetchOptions.body = JSON.stringify(config.body)
      } else {
        fetchOptions.body = config.body
      }
    }

    // 執行請求
    const timeoutPromise = config.timeout
      ? this.createTimeoutPromise(config.timeout)
      : null
    const fetchPromise = fetch(url, fetchOptions)

    const response = timeoutPromise
      ? await Promise.race([fetchPromise, timeoutPromise])
      : await fetchPromise

    // 檢查響應狀態
    if (!config.validateStatus?.(response.status) && !response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // 解析響應資料
    let data: T
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const text = await response.text()
      data = text ? JSON.parse(text) : null
    } else if (contentType.includes('text/')) {
      data = (await response.text()) as T
    } else {
      data = (await response.blob()) as T
    }

    // 應用響應轉換
    if (config.transformResponse) {
      data = config.transformResponse(data)
    }

    // 解析響應頭
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    const duration = Date.now() - startTime

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      config,
      fromCache: false,
      requestId,
      duration,
      retryCount: attempt - 1,
    }
  }

  // Mock 請求處理
  private async mockRequest<T>(
    url: string,
    config: RequestConfig,
    requestId: string,
    startTime: number,
    attempt: number
  ): Promise<RequestResponse<T>> {
    // 模擬網路延遲
    await this.delay(Math.random() * 500 + 100)

    // 簡單的 mock 資料生成
    let mockData: any

    if (url.includes('/auth/login')) {
      mockData = {
        success: true,
        user: { id: '1', name: 'Mock User', email: 'user@example.com' },
        token: 'mock-jwt-token',
      }
    } else if (url.includes('/documents')) {
      mockData = {
        success: true,
        documents: [
          {
            id: '1',
            title: 'Mock Document 1',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Mock Document 2',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 2,
      }
    } else {
      mockData = {
        success: true,
        message: 'Mock response',
        data: null,
      }
    }

    const duration = Date.now() - startTime

    return {
      data: mockData as T,
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-mock': 'true',
      },
      config,
      fromCache: false,
      requestId,
      duration,
      retryCount: attempt - 1,
    }
  }

  // 便捷的 HTTP 方法
  async get<T = any>(
    url: string,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>(url, { ...config, method: RequestMethod.GET })
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: RequestMethod.POST,
      body: data,
    })
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: RequestMethod.PUT,
      body: data,
    })
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: RequestMethod.PATCH,
      body: data,
    })
  }

  async delete<T = any>(
    url: string,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>(url, { ...config, method: RequestMethod.DELETE })
  }

  // 快取管理
  private generateCacheKey(url: string, config: RequestConfig): string {
    const keyData = {
      url,
      method: config.method,
      body: config.body,
      headers: config.headers,
    }
    return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '')
  }

  private async getCachedResponse<T>(
    key: string,
    strategy: CacheStrategy
  ): Promise<RequestResponse<T> | null> {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    const isExpired = now > cached.timestamp + cached.ttl

    switch (strategy) {
      case CacheStrategy.CACHE_FIRST:
        return isExpired ? null : this.createCachedResponse<T>(cached)

      case CacheStrategy.CACHE_ONLY:
        return this.createCachedResponse<T>(cached)

      case CacheStrategy.STALE_WHILE_REVALIDATE:
        if (!isExpired) {
          return this.createCachedResponse<T>(cached)
        }
        // 如果過期，返回 null 讓請求繼續，但同時在背景重新驗證
        return null

      default:
        return null
    }
  }

  private createCachedResponse<T>(cached: CacheItem): RequestResponse<T> {
    return {
      data: cached.data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as RequestConfig,
      fromCache: true,
      requestId: cached.requestId,
      duration: 0,
      retryCount: 0,
    }
  }

  private async cacheResponse(
    key: string,
    response: RequestResponse,
    ttl: number
  ): Promise<void> {
    const cached: CacheItem = {
      data: response.data,
      timestamp: Date.now(),
      ttl,
      requestId: response.requestId,
    }

    this.cache.set(key, cached)
  }

  private cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.timestamp + cached.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // 工具方法
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateRetryDelay(
    attempt: number,
    retryConfig: RetryConfig
  ): number {
    const { initialDelay, maxDelay, backoffFactor } = retryConfig
    const delay = initialDelay * Math.pow(backoffFactor, attempt - 1)
    return Math.min(delay, maxDelay)
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`))
      }, timeout)
    })
  }

  private updateResponseTime(duration: number): void {
    this.responseTimeHistory.push(duration)
    if (this.responseTimeHistory.length > 100) {
      this.responseTimeHistory.shift()
    }
    this.stats.averageResponseTime =
      this.responseTimeHistory.reduce((sum, time) => sum + time, 0) /
      this.responseTimeHistory.length
  }

  // 公共方法
  getStats(): RequestStats {
    return { ...this.stats }
  }

  clearCache(): void {
    this.cache.clear()
  }

  cancelAllRequests(): void {
    this.requestQueue.clear()
  }

  getInterceptors(): RequestInterceptor[] {
    return [...this.interceptors]
  }
}

// 全域實例
export const requestWrapper = new RequestWrapperManager()

// 便捷函數
export const get = requestWrapper.get.bind(requestWrapper)
export const post = requestWrapper.post.bind(requestWrapper)
export const put = requestWrapper.put.bind(requestWrapper)
export const patch = requestWrapper.patch.bind(requestWrapper)
export const del = requestWrapper.delete.bind(requestWrapper)

// React Hook
export function useRequestWrapper() {
  return {
    request: requestWrapper.request.bind(requestWrapper),
    get: requestWrapper.get.bind(requestWrapper),
    post: requestWrapper.post.bind(requestWrapper),
    put: requestWrapper.put.bind(requestWrapper),
    patch: requestWrapper.patch.bind(requestWrapper),
    delete: requestWrapper.delete.bind(requestWrapper),
    getStats: requestWrapper.getStats.bind(requestWrapper),
    clearCache: requestWrapper.clearCache.bind(requestWrapper),
  }
}

export default requestWrapper
