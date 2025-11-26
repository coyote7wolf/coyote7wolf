/**
 * HTTP Request Wrapper Types and Interfaces
 *
 * Unified HTTP request wrapper with interceptors, retry logic, timeout handling,
 * authentication injection, and response transformation.
 */

/**
 * HTTP Methods
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

/**
 * Request Configuration
 */
export interface RequestConfig {
  url: string
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: any) => boolean
  transformRequest?: (data: any, headers: Record<string, string>) => any
  transformResponse?: (data: any) => any
  validateStatus?: (status: number) => boolean
  withCredentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream'
  signal?: AbortSignal
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
  metadata?: Record<string, any>
}

/**
 * Response Interface
 */
export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
  request?: any
}

/**
 * Error Response Interface
 */
export interface ApiError extends Error {
  config?: RequestConfig
  code?: string
  request?: any
  response?: ApiResponse
  isAxiosError?: boolean
  isNetworkError?: boolean
  isTimeoutError?: boolean
  isRetryableError?: boolean
}

/**
 * Request Interceptor
 */
export interface RequestInterceptor {
  onFulfilled?: (
    config: RequestConfig
  ) => RequestConfig | Promise<RequestConfig>
  onRejected?: (error: any) => any
}

/**
 * Response Interceptor
 */
export interface ResponseInterceptor {
  onFulfilled?: <T = any>(
    response: ApiResponse<T>
  ) => ApiResponse<T> | Promise<ApiResponse<T>>
  onRejected?: (error: any) => any
}

/**
 * Authentication Configuration
 */
export interface AuthConfig {
  type: 'bearer' | 'basic' | 'apikey' | 'custom'
  token?: string
  username?: string
  password?: string
  apiKey?: string
  headerName?: string
  customAuth?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  retries: number
  retryDelay: number
  retryDelayType: 'fixed' | 'exponential' | 'linear'
  maxRetryDelay?: number
  retryCondition?: (error: ApiError) => boolean
  shouldResetTimeout?: boolean
  onRetry?: (retryCount: number, error: ApiError, delayMs: number) => void
}

/**
 * Cache Configuration
 */
export interface CacheConfig {
  enabled: boolean
  ttl: number // Time to live in milliseconds
  maxSize: number
  keyGenerator?: (config: RequestConfig) => string
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  excludeHeaders?: string[]
}

/**
 * Request Queue Configuration
 */
export interface QueueConfig {
  enabled: boolean
  maxConcurrent: number
  delay?: number
  priority?: (config: RequestConfig) => number
}

/**
 * HTTP Client Configuration
 */
export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  auth?: AuthConfig
  retry?: RetryConfig
  cache?: CacheConfig
  queue?: QueueConfig
  validateStatus?: (status: number) => boolean
  transformRequest?: (data: any, headers: Record<string, string>) => any
  transformResponse?: (data: any) => any
  withCredentials?: boolean
  maxRedirects?: number
  maxBodyLength?: number
  maxContentLength?: number
  enableLogging?: boolean
  enableMetrics?: boolean
}

/**
 * Request Metrics
 */
export interface RequestMetrics {
  requestId: string
  url: string
  method: HttpMethod
  startTime: number
  endTime?: number
  duration?: number
  status?: number
  size?: {
    request: number
    response: number
  }
  retryCount: number
  fromCache?: boolean
  error?: string
}

/**
 * Cache Entry
 */
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  headers: Record<string, string>
  etag?: string
}

/**
 * Request Queue Item
 */
export interface QueueItem {
  id: string
  config: RequestConfig
  resolve: (value: ApiResponse) => void
  reject: (error: ApiError) => void
  priority: number
  timestamp: number
  retryCount: number
}

/**
 * Upload Progress Event
 */
export interface UploadProgressEvent {
  loaded: number
  total: number
  percentage: number
  rate?: number
  estimated?: number
}

/**
 * Download Progress Event
 */
export interface DownloadProgressEvent {
  loaded: number
  total: number
  percentage: number
  rate?: number
  estimated?: number
}

/**
 * Request Lifecycle Events
 */
export type RequestEvent =
  | 'request:start'
  | 'request:success'
  | 'request:error'
  | 'request:timeout'
  | 'request:retry'
  | 'request:cache:hit'
  | 'request:cache:miss'
  | 'request:queue:add'
  | 'request:queue:process'
  | 'upload:progress'
  | 'download:progress'

/**
 * Event Handler
 */
export interface EventHandler {
  (event: RequestEvent, data: any): void
}

/**
 * HTTP Status Categories
 */
export const HttpStatus = {
  // Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,

  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
} as const

/**
 * Content Types
 */
export const ContentType = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
  OCTET_STREAM: 'application/octet-stream',
} as const

/**
 * Default Request Configuration
 */
export const DEFAULT_REQUEST_CONFIG: Partial<RequestConfig> = {
  method: 'GET',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  validateStatus: (status: number) => status >= 200 && status < 300,
  responseType: 'json',
  withCredentials: false,
}

/**
 * Default HTTP Client Configuration
 */
export const DEFAULT_HTTP_CLIENT_CONFIG: HttpClientConfig = {
  timeout: 30000,
  validateStatus: (status: number) => status >= 200 && status < 300,
  withCredentials: false,
  maxRedirects: 5,
  maxBodyLength: 10 * 1024 * 1024, // 10MB
  maxContentLength: 10 * 1024 * 1024, // 10MB
  enableLogging: true,
  enableMetrics: true,
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryDelayType: 'exponential',
    maxRetryDelay: 30000,
    shouldResetTimeout: true,
  },
  cache: {
    enabled: false,
    ttl: 300000, // 5 minutes
    maxSize: 100,
    storage: 'memory',
    excludeHeaders: ['authorization', 'cookie', 'set-cookie'],
  },
  queue: {
    enabled: false,
    maxConcurrent: 6,
    delay: 0,
  },
}

/**
 * Utility Functions
 */
export const HttpUtils = {
  /**
   * Check if status is successful
   */
  isSuccess: (status: number): boolean => status >= 200 && status < 300,

  /**
   * Check if status is redirect
   */
  isRedirect: (status: number): boolean => status >= 300 && status < 400,

  /**
   * Check if status is client error
   */
  isClientError: (status: number): boolean => status >= 400 && status < 500,

  /**
   * Check if status is server error
   */
  isServerError: (status: number): boolean => status >= 500 && status < 600,

  /**
   * Check if error is retryable
   */
  isRetryableError: (error: ApiError): boolean => {
    if (error.code === 'ECONNABORTED') return false // Timeout
    if (error.code === 'ENOTFOUND') return false // DNS error
    if (error.code === 'ECONNREFUSED') return true // Connection refused

    if (error.response) {
      const status = error.response.status
      return status >= 500 || status === 408 || status === 429
    }

    return true // Network errors are retryable
  },

  /**
   * Check if error is network error
   */
  isNetworkError: (error: ApiError): boolean => {
    return !error.response && Boolean(error.code)
  },

  /**
   * Check if error is timeout error
   */
  isTimeoutError: (error: ApiError): boolean => {
    return error.code === 'ECONNABORTED' || error.code === 'TIMEOUT'
  },

  /**
   * Generate request ID
   */
  generateRequestId: (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Serialize query parameters
   */
  serializeParams: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    return searchParams.toString()
  },

  /**
   * Parse content type header
   */
  parseContentType: (
    contentType: string
  ): { type: string; charset?: string } => {
    const parts = contentType.split(';').map(part => part.trim())
    const type = parts[0] || ''
    const charsetPart = parts.find(part => part.startsWith('charset='))
    const charset = charsetPart ? charsetPart.split('=')[1] : undefined

    return { type, ...(charset && { charset }) }
  },

  /**
   * Get response size
   */
  getResponseSize: (response: ApiResponse): number => {
    const contentLength = response.headers['content-length']
    if (contentLength) {
      return parseInt(contentLength, 10)
    }

    if (typeof response.data === 'string') {
      return new Blob([response.data]).size
    }

    if (response.data instanceof ArrayBuffer) {
      return response.data.byteLength
    }

    return JSON.stringify(response.data).length
  },

  /**
   * Calculate retry delay
   */
  calculateRetryDelay: (
    attempt: number,
    baseDelay: number,
    type: 'fixed' | 'exponential' | 'linear',
    maxDelay: number = 30000
  ): number => {
    let delay: number

    switch (type) {
      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt - 1)
        break
      case 'linear':
        delay = baseDelay * attempt
        break
      case 'fixed':
      default:
        delay = baseDelay
        break
    }

    return Math.min(delay, maxDelay)
  },
}

/**
 * Type Guards
 */
export const isApiError = (error: any): error is ApiError => {
  return error && (error.isAxiosError || error.config || error.response)
}

export const isApiResponse = (response: any): response is ApiResponse => {
  return (
    response &&
    typeof response.status === 'number' &&
    response.data !== undefined
  )
}
