/**
 * HTTP Request Wrapper System
 *
 * Unified HTTP request wrapper with interceptors, retry logic, timeout handling,
 * authentication injection, caching, and comprehensive request/response management.
 *
 * @example Basic Usage
 * ```typescript
 * import { http } from '@/utils/http'
 *
 * // Simple GET request
 * const response = await http.get('/api/users')
 *
 * // POST with data
 * const user = await http.post('/api/users', { name: 'John', email: 'john@example.com' })
 *
 * // With custom config
 * const response = await http.get('/api/data', {
 *   timeout: 5000,
 *   retries: 3,
 *   headers: { 'X-Custom': 'value' }
 * })
 * ```
 *
 * @example Advanced Usage
 * ```typescript
 * import { HttpClient, createHttpClient } from '@/utils/http'
 *
 * // Create custom client
 * const apiClient = createHttpClient({
 *   baseURL: 'https://api.example.com',
 *   timeout: 10000,
 *   auth: {
 *     type: 'bearer',
 *     token: 'your-token'
 *   },
 *   cache: {
 *     enabled: true,
 *     ttl: 300000 // 5 minutes
 *   },
 *   retry: {
 *     retries: 3,
 *     retryDelay: 1000,
 *     retryDelayType: 'exponential'
 *   }
 * })
 *
 * // Add request interceptor
 * apiClient.addRequestInterceptor({
 *   onFulfilled: (config) => {
 *     config.headers = { ...config.headers, 'X-Timestamp': Date.now().toString() }
 *     return config
 *   }
 * })
 *
 * // Add response interceptor
 * apiClient.addResponseInterceptor({
 *   onFulfilled: (response) => {
 *     console.log('Response received:', response.status)
 *     return response
 *   },
 *   onRejected: (error) => {
 *     console.error('Request failed:', error.message)
 *     throw error
 *   }
 * })
 * ```
 *
 * @example Upload with Progress
 * ```typescript
 * const formData = new FormData()
 * formData.append('file', file)
 *
 * const response = await http.post('/api/upload', formData, {
 *   onUploadProgress: (progressEvent) => {
 *     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
 *     console.log(`Upload ${percentCompleted}% completed`)
 *   }
 * })
 * ```
 */

// Import types for internal use
import type {
  HttpClientConfig,
  CacheConfig,
  QueueConfig,
  AuthConfig,
  RetryConfig,
  ApiError,
} from './types'

// Import classes for internal use
import { HttpClient } from './client'
import { HttpCache } from './cache'
import { RequestQueue, RateLimiter } from './queue'

// Export types
export type {
  HttpMethod,
  RequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  AuthConfig,
  RetryConfig,
  CacheConfig,
  QueueConfig,
  HttpClientConfig,
  RequestMetrics,
  CacheEntry,
  QueueItem,
  UploadProgressEvent,
  DownloadProgressEvent,
  RequestEvent,
  EventHandler,
} from './types'

// Export constants
export {
  HttpStatus,
  ContentType,
  DEFAULT_REQUEST_CONFIG,
  DEFAULT_HTTP_CLIENT_CONFIG,
  HttpUtils,
  isApiError,
  isApiResponse,
} from './types'

// Export main classes
export { HttpClient, httpClient, http } from './client'
export { HttpCache, CacheUtils } from './cache'
export {
  RequestQueue,
  RateLimiter,
  TimeoutManager,
  RequestDeduplicator,
} from './queue'

// Factory functions
export const createHttpClient = (config?: Partial<HttpClientConfig>) => {
  return new HttpClient(config)
}

export const createHttpCache = (config: CacheConfig) => {
  return new HttpCache(config)
}

export const createRequestQueue = (config: QueueConfig) => {
  return new RequestQueue(config)
}

export const createRateLimiter = (
  maxRequests: number,
  timeWindowMs: number
) => {
  return new RateLimiter(maxRequests, timeWindowMs)
}

/**
 * Common HTTP client configurations
 */
export const HttpClientPresets = {
  /**
   * Fast configuration - minimal overhead
   */
  fast: {
    timeout: 5000,
    enableLogging: false,
    enableMetrics: false,
    cache: { enabled: false },
    queue: { enabled: false },
    retry: { retries: 1 },
  } as Partial<HttpClientConfig>,

  /**
   * Reliable configuration - with retries and caching
   */
  reliable: {
    timeout: 30000,
    enableLogging: true,
    enableMetrics: true,
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 50,
    },
    retry: {
      retries: 3,
      retryDelay: 1000,
      retryDelayType: 'exponential',
      maxRetryDelay: 10000,
    },
  } as Partial<HttpClientConfig>,

  /**
   * Heavy configuration - full features enabled
   */
  heavy: {
    timeout: 60000,
    enableLogging: true,
    enableMetrics: true,
    cache: {
      enabled: true,
      ttl: 600000, // 10 minutes
      maxSize: 100,
      storage: 'localStorage',
    },
    queue: {
      enabled: true,
      maxConcurrent: 4,
      delay: 100,
    },
    retry: {
      retries: 5,
      retryDelay: 1000,
      retryDelayType: 'exponential',
      maxRetryDelay: 30000,
    },
  } as Partial<HttpClientConfig>,

  /**
   * API configuration - optimized for REST APIs
   */
  api: {
    timeout: 15000,
    enableLogging: true,
    enableMetrics: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: {
      enabled: true,
      ttl: 180000, // 3 minutes
      maxSize: 75,
    },
    retry: {
      retries: 3,
      retryDelay: 500,
      retryDelayType: 'exponential',
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  } as Partial<HttpClientConfig>,
}

/**
 * Utility function to create pre-configured HTTP clients
 */
export const createPresetClient = (
  preset: keyof typeof HttpClientPresets,
  overrides?: Partial<HttpClientConfig>
) => {
  const config = { ...HttpClientPresets[preset], ...overrides }
  return new HttpClient(config)
}

/**
 * Common authentication helpers
 */
export const AuthHelpers = {
  /**
   * Create bearer token auth config
   */
  bearer: (token: string): AuthConfig => ({
    type: 'bearer',
    token,
  }),

  /**
   * Create basic auth config
   */
  basic: (username: string, password: string): AuthConfig => ({
    type: 'basic',
    username,
    password,
  }),

  /**
   * Create API key auth config
   */
  apiKey: (apiKey: string, headerName = 'X-API-Key'): AuthConfig => ({
    type: 'apikey',
    apiKey,
    headerName,
  }),

  /**
   * Create custom auth config
   */
  custom: (customAuth: NonNullable<AuthConfig['customAuth']>): AuthConfig => ({
    type: 'custom',
    customAuth,
  }),
}

/**
 * Common retry configurations
 */
export const RetryPresets = {
  /**
   * Conservative retry - few attempts, short delays
   */
  conservative: {
    retries: 2,
    retryDelay: 500,
    retryDelayType: 'fixed',
  } as RetryConfig,

  /**
   * Aggressive retry - many attempts, exponential backoff
   */
  aggressive: {
    retries: 5,
    retryDelay: 1000,
    retryDelayType: 'exponential',
    maxRetryDelay: 30000,
  } as RetryConfig,

  /**
   * Network retry - optimized for network issues
   */
  network: {
    retries: 3,
    retryDelay: 2000,
    retryDelayType: 'exponential',
    maxRetryDelay: 10000,
    retryCondition: (error: ApiError) => {
      return (
        error.isNetworkError ||
        error.isTimeoutError ||
        (error.response?.status ?? 0) >= 500
      )
    },
  } as RetryConfig,
}

// Import the http instance for default export
import { http } from './client'

/**
 * Default export - main HTTP client instance
 */
export default http
