/**
 * HTTP Client Core Implementation
 *
 * Main HTTP client with interceptors, retry logic, caching, authentication,
 * and comprehensive request/response handling.
 */

import {
  HttpClientConfig,
  RequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  RequestMetrics,
  HttpMethod,
  DEFAULT_HTTP_CLIENT_CONFIG,
  HttpUtils,
} from './types'
import { HttpCache } from './cache'
import {
  RequestQueue,
  RateLimiter,
  TimeoutManager,
  RequestDeduplicator,
} from './queue'

/**
 * Main HTTP Client Class
 */
export class HttpClient {
  private config: Required<HttpClientConfig>
  private cache: HttpCache
  private queue: RequestQueue
  private rateLimiter?: RateLimiter
  private timeoutManager = new TimeoutManager()
  private deduplicator = new RequestDeduplicator()
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private metrics: RequestMetrics[] = []

  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = {
      ...DEFAULT_HTTP_CLIENT_CONFIG,
      ...config,
    } as Required<HttpClientConfig>

    // Initialize components
    this.cache = new HttpCache(this.config.cache)
    this.queue = new RequestQueue(this.config.queue)

    // Setup rate limiter if needed
    if (this.config.queue.enabled && this.config.queue.maxConcurrent) {
      this.rateLimiter = new RateLimiter(this.config.queue.maxConcurrent, 1000)
    }
  }

  /**
   * Generic request method
   */
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const startTime = Date.now()
    const requestId = HttpUtils.generateRequestId()

    try {
      // Merge with default config
      const fullConfig = this.mergeConfig(config)

      // Apply request interceptors
      const processedConfig = await this.applyRequestInterceptors(fullConfig)

      // Check cache first
      if (this.config.cache.enabled && processedConfig.method === 'GET') {
        const cached = await this.cache.get<T>(processedConfig)
        if (cached) {
          this.recordMetrics(
            requestId,
            processedConfig,
            startTime,
            Date.now(),
            cached.status,
            true
          )
          return cached
        }
      }

      // Check for duplicate requests
      const dedupeKey = this.deduplicator.generateKey(processedConfig)
      if (this.config.queue.enabled) {
        return this.deduplicator.getOrCreate(dedupeKey, () =>
          this.executeRequest<T>(requestId, processedConfig, startTime)
        )
      }

      return await this.executeRequest<T>(requestId, processedConfig, startTime)
    } catch (error) {
      this.recordMetrics(
        requestId,
        config,
        startTime,
        Date.now(),
        0,
        false,
        (error as Error).message
      )
      throw this.handleError(error as ApiError)
    }
  }

  /**
   * Execute HTTP request
   */
  private async executeRequest<T = any>(
    requestId: string,
    config: RequestConfig,
    startTime: number
  ): Promise<ApiResponse<T>> {
    let response: ApiResponse<T>

    // Set timeout
    if (config.timeout) {
      this.timeoutManager.setTimeout(requestId, config.timeout, () => {
        throw this.createTimeoutError(config)
      })
    }

    try {
      // Use queue if enabled
      if (this.config.queue.enabled) {
        response = await this.queue.enqueue<T>(config)
      } else {
        response = await this.performRequest<T>(config)
      }

      // Clear timeout
      this.timeoutManager.clearTimeout(requestId)

      // Apply response interceptors
      response = await this.applyResponseInterceptors(response)

      // Cache response if applicable
      if (
        this.config.cache.enabled &&
        config.method === 'GET' &&
        response.status < 400
      ) {
        await this.cache.set(config, response)
      }

      // Record metrics
      this.recordMetrics(
        requestId,
        config,
        startTime,
        Date.now(),
        response.status,
        false
      )

      return response
    } catch (error) {
      this.timeoutManager.clearTimeout(requestId)
      throw error
    }
  }

  /**
   * Perform actual HTTP request
   */
  private async performRequest<T = any>(
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(config)
    const headers = this.buildHeaders(config)
    const body = this.buildBody(config)

    // Apply authentication
    if (this.config.auth) {
      this.applyAuth(config, headers)
    }

    const fetchConfig: RequestInit = {
      method: config.method || 'GET',
      headers,
      body,
      credentials: config.withCredentials ? 'include' : 'same-origin',
    }

    // Add signal if provided
    if (config.signal) {
      fetchConfig.signal = config.signal
    }

    const response = await fetch(url, fetchConfig)

    // Transform response
    const data = await this.parseResponse<T>(response, config.responseType)
    const responseHeaders = this.parseHeaders(response.headers)

    const apiResponse: ApiResponse<T> = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      config,
    }

    // Validate status
    if (config.validateStatus && !config.validateStatus(response.status)) {
      throw this.createResponseError(apiResponse)
    }

    return apiResponse
  }

  /**
   * HTTP method shortcuts
   */
  async get<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }

  async delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  async head<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'HEAD' })
  }

  /**
   * Interceptor management
   */
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    return this.requestInterceptors.push(interceptor) - 1
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    return this.responseInterceptors.push(interceptor) - 1
  }

  removeRequestInterceptor(index: number): boolean {
    if (index >= 0 && index < this.requestInterceptors.length) {
      this.requestInterceptors.splice(index, 1)
      return true
    }
    return false
  }

  removeResponseInterceptor(index: number): boolean {
    if (index >= 0 && index < this.responseInterceptors.length) {
      this.responseInterceptors.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Configuration management
   */
  updateConfig(newConfig: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Update sub-components
    if (newConfig.cache) {
      this.cache.updateConfig(newConfig.cache)
    }

    if (newConfig.queue) {
      this.queue.updateConfig(newConfig.queue)
    }
  }

  getConfig(): Required<HttpClientConfig> {
    return { ...this.config }
  }

  /**
   * Utility methods
   */
  getMetrics(): RequestMetrics[] {
    return [...this.metrics]
  }

  clearMetrics(): void {
    this.metrics = []
  }

  async clearCache(): Promise<void> {
    await this.cache.clear()
  }

  /**
   * Private helper methods
   */
  private mergeConfig(config: RequestConfig): RequestConfig {
    const merged: RequestConfig = {
      timeout: this.config.timeout,
      validateStatus: this.config.validateStatus,
      transformRequest: this.config.transformRequest,
      transformResponse: this.config.transformResponse,
      withCredentials: this.config.withCredentials,
      ...config,
    }

    // Merge headers separately
    merged.headers = { ...this.config.headers, ...config.headers }

    return merged
  }

  private async applyRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let processedConfig = config

    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onFulfilled) {
        try {
          processedConfig = await interceptor.onFulfilled(processedConfig)
        } catch (error) {
          if (interceptor.onRejected) {
            throw await interceptor.onRejected(error)
          }
          throw error
        }
      }
    }

    return processedConfig
  }

  private async applyResponseInterceptors<T = any>(
    response: ApiResponse<T>
  ): Promise<ApiResponse<T>> {
    let processedResponse = response

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onFulfilled) {
        try {
          processedResponse = await interceptor.onFulfilled(processedResponse)
        } catch (error) {
          if (interceptor.onRejected) {
            throw await interceptor.onRejected(error)
          }
          throw error
        }
      }
    }

    return processedResponse
  }

  private buildURL(config: RequestConfig): string {
    let url = config.url

    // Add base URL if not absolute
    if (this.config.baseURL && !url.startsWith('http')) {
      url = `${this.config.baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
    }

    // Add query parameters
    if (config.params) {
      const separator = url.includes('?') ? '&' : '?'
      url += separator + HttpUtils.serializeParams(config.params)
    }

    return url
  }

  private buildHeaders(config: RequestConfig): Record<string, string> {
    const headers: Record<string, string> = {}

    // Add default headers
    if (this.config.headers) {
      Object.assign(headers, this.config.headers)
    }

    // Add config headers
    if (config.headers) {
      Object.assign(headers, config.headers)
    }

    return headers
  }

  private buildBody(config: RequestConfig): string | FormData | null {
    if (!config.data) return null

    if (config.transformRequest) {
      return config.transformRequest(config.data, this.buildHeaders(config))
    }

    // Handle different data types
    if (config.data instanceof FormData) {
      return config.data
    }

    if (typeof config.data === 'object') {
      const headers = this.buildHeaders(config)
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
      return JSON.stringify(config.data)
    }

    return String(config.data)
  }

  private applyAuth(
    config: RequestConfig,
    headers: Record<string, string>
  ): void {
    if (!this.config.auth) return

    switch (this.config.auth.type) {
      case 'bearer':
        if (this.config.auth.token) {
          headers['Authorization'] = `Bearer ${this.config.auth.token}`
        }
        break
      case 'basic':
        if (this.config.auth.username && this.config.auth.password) {
          const credentials = btoa(
            `${this.config.auth.username}:${this.config.auth.password}`
          )
          headers['Authorization'] = `Basic ${credentials}`
        }
        break
      case 'apikey':
        if (this.config.auth.apiKey) {
          const headerName = this.config.auth.headerName || 'X-API-Key'
          headers[headerName] = this.config.auth.apiKey
        }
        break
      case 'custom':
        if (this.config.auth.customAuth) {
          this.config.auth.customAuth(config)
        }
        break
    }
  }

  private async parseResponse<T = any>(
    response: Response,
    responseType: RequestConfig['responseType'] = 'json'
  ): Promise<T> {
    switch (responseType) {
      case 'text':
        return (await response.text()) as unknown as T
      case 'blob':
        return (await response.blob()) as unknown as T
      case 'arraybuffer':
        return (await response.arrayBuffer()) as unknown as T
      case 'stream':
        return response.body as unknown as T
      case 'json':
      default:
        const text = await response.text()
        return text ? JSON.parse(text) : ({} as T)
    }
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value
    })
    return result
  }

  private recordMetrics(
    requestId: string,
    config: RequestConfig,
    startTime: number,
    endTime: number,
    status: number,
    fromCache: boolean,
    error?: string
  ): void {
    if (!this.config.enableMetrics) return

    const metrics: RequestMetrics = {
      requestId,
      url: config.url,
      method: (config.method || 'GET') as HttpMethod,
      startTime,
      endTime,
      duration: endTime - startTime,
      status,
      size: {
        request: this.calculateRequestSize(config),
        response: 0, // Would calculate from response in real implementation
      },
      retryCount: 0,
      fromCache,
    }

    // Add error if provided
    if (error) {
      metrics.error = error
    }

    this.metrics.push(metrics)

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  private calculateRequestSize(config: RequestConfig): number {
    let size = 0

    // URL size
    size += config.url.length

    // Headers size
    if (config.headers) {
      size += Object.entries(config.headers).reduce(
        (acc, [key, value]) => acc + key.length + value.length + 4,
        0
      ) // +4 for ": " and "\r\n"
    }

    // Body size
    if (config.data) {
      if (typeof config.data === 'string') {
        size += config.data.length
      } else if (config.data instanceof FormData) {
        // Approximate FormData size
        size += 1000
      } else {
        size += JSON.stringify(config.data).length
      }
    }

    return size
  }

  private createTimeoutError(config: RequestConfig): ApiError {
    const error = new Error(
      `Request timeout of ${config.timeout}ms exceeded`
    ) as ApiError
    error.code = 'TIMEOUT'
    error.config = config
    error.isTimeoutError = true
    error.isRetryableError = false
    return error
  }

  private createResponseError<T = any>(response: ApiResponse<T>): ApiError {
    const error = new Error(
      `Request failed with status ${response.status}`
    ) as ApiError
    error.response = response
    error.config = response.config
    error.isNetworkError = false
    error.isRetryableError = HttpUtils.isRetryableError(error)
    return error
  }

  private handleError(error: ApiError): ApiError {
    // Apply response interceptor error handlers
    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onRejected) {
        try {
          return interceptor.onRejected(error)
        } catch (interceptorError) {
          error = interceptorError as ApiError
        }
      }
    }

    return error
  }
}

/**
 * Default HTTP client instance
 */
export const httpClient = new HttpClient()

/**
 * Convenience methods using default client
 */
export const http = {
  get: <T = any>(url: string, config?: Partial<RequestConfig>) =>
    httpClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) =>
    httpClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) =>
    httpClient.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) =>
    httpClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: Partial<RequestConfig>) =>
    httpClient.delete<T>(url, config),

  head: <T = any>(url: string, config?: Partial<RequestConfig>) =>
    httpClient.head<T>(url, config),

  request: <T = any>(config: RequestConfig) => httpClient.request<T>(config),
}
