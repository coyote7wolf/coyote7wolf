/**
 * Error Handling Configuration and Classes
 *
 * Provides comprehensive error handling system with custom error classes,
 * error codes, severity levels, and structured error information.
 */

import { HTTP_STATUS, ERROR_CODES } from '@/config/constants'

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error Categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  EXTERNAL_SERVICE = 'external_service',
  USER_INPUT = 'user_input',
  CONFIGURATION = 'configuration',
  DATABASE = 'database',
  FILE_SYSTEM = 'file_system',
  SYNC = 'sync',
  AI_SERVICE = 'ai_service',
  UNKNOWN = 'unknown',
}

/**
 * Error Context Interface
 */
export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  documentId?: string
  feature?: string
  action?: string
  userAgent?: string
  url?: string
  timestamp?: Date
  field?: string
  value?: unknown
  serviceName?: string
  operationType?: string
  serviceType?: string
  configKey?: string
  retryAfter?: number
  timeoutMs?: number
  originalError?: string
  componentStack?: string
  type?: string
  additionalData?: Record<string, unknown>
}

/**
 * Base Application Error Class
 */
export class AppError extends Error {
  public readonly code: string
  public readonly category: ErrorCategory
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly context: ErrorContext
  public readonly isOperational: boolean
  public readonly timestamp: Date
  public readonly stack?: string

  constructor(
    message: string,
    code: string = ERROR_CODES.UNKNOWN_ERROR,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    context: ErrorContext = {},
    isOperational: boolean = true
  ) {
    super(message)

    this.name = this.constructor.name
    this.code = code
    this.category = category
    this.severity = severity
    this.statusCode = statusCode
    this.context = { ...context, timestamp: new Date() }
    this.isOperational = isOperational
    this.timestamp = new Date()

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Convert error to JSON for logging/reporting
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      statusCode: this.statusCode,
      context: this.context,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    }
  }

  /**
   * Create user-friendly error message
   */
  toUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.'
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please log in again.'
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to perform this action.'
      case ErrorCategory.VALIDATION:
        return 'The information provided is not valid. Please check and try again.'
      case ErrorCategory.SYNC:
        return 'Synchronization issue. Your changes may not have been saved.'
      case ErrorCategory.AI_SERVICE:
        return 'AI service is temporarily unavailable. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.'
    }
  }
}

/**
 * Network Error Class
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    code: string = ERROR_CODES.NETWORK_ERROR,
    statusCode: number = HTTP_STATUS.SERVICE_UNAVAILABLE,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      statusCode,
      context
    )
  }
}

/**
 * Authentication Error Class
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: string = ERROR_CODES.AUTHENTICATION_FAILED,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      HTTP_STATUS.UNAUTHORIZED,
      context
    )
  }
}

/**
 * Authorization Error Class
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Access denied',
    code: string = ERROR_CODES.ACCESS_DENIED,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      HTTP_STATUS.FORBIDDEN,
      context
    )
  }
}

/**
 * Validation Error Class
 */
export class ValidationError extends AppError {
  public readonly field: string | undefined
  public readonly value: unknown

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    code: string = ERROR_CODES.VALIDATION_ERROR,
    context: ErrorContext = {}
  ) {
    const updatedContext = { ...context }
    if (field !== undefined) updatedContext.field = field
    if (value !== undefined) updatedContext.value = value

    super(
      message,
      code,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      HTTP_STATUS.BAD_REQUEST,
      updatedContext
    )

    this.field = field
    this.value = value
  }
}

/**
 * Business Logic Error Class
 */
export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    code: string = ERROR_CODES.BUSINESS_RULE_VIOLATION,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.BUSINESS_LOGIC,
      severity,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      context
    )
  }
}

/**
 * External Service Error Class
 */
export class ExternalServiceError extends AppError {
  public readonly serviceName: string

  constructor(
    serviceName: string,
    message: string,
    code: string = ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    statusCode: number = HTTP_STATUS.BAD_GATEWAY,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.HIGH,
      statusCode,
      { ...context, serviceName }
    )

    this.serviceName = serviceName
  }
}

/**
 * Sync Error Class
 */
export class SyncError extends AppError {
  public readonly operationType: string

  constructor(
    message: string,
    operationType: string,
    code: string = ERROR_CODES.SYNC_FAILED,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.SYNC,
      ErrorSeverity.HIGH,
      HTTP_STATUS.CONFLICT,
      { ...context, operationType }
    )

    this.operationType = operationType
  }
}

/**
 * AI Service Error Class
 */
export class AIServiceError extends AppError {
  public readonly serviceType: string

  constructor(
    message: string,
    serviceType: string,
    code: string = ERROR_CODES.AI_SERVICE_ERROR,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.AI_SERVICE,
      ErrorSeverity.MEDIUM,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      { ...context, serviceType }
    )

    this.serviceType = serviceType
  }
}

/**
 * Configuration Error Class
 */
export class ConfigurationError extends AppError {
  public readonly configKey: string

  constructor(
    message: string,
    configKey: string,
    code: string = ERROR_CODES.CONFIGURATION_ERROR,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.CONFIGURATION,
      ErrorSeverity.CRITICAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { ...context, configKey },
      false // Not operational - requires code fix
    )

    this.configKey = configKey
  }
}

/**
 * Rate Limit Error Class
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number | undefined

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    context: ErrorContext = {}
  ) {
    const updatedContext = { ...context }
    if (retryAfter !== undefined) updatedContext.retryAfter = retryAfter

    super(
      message,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      updatedContext
    )

    this.retryAfter = retryAfter
  }
}

/**
 * Timeout Error Class
 */
export class TimeoutError extends AppError {
  public readonly timeoutMs: number

  constructor(
    message: string,
    timeoutMs: number,
    code: string = ERROR_CODES.TIMEOUT_ERROR,
    context: ErrorContext = {}
  ) {
    super(
      message,
      code,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      HTTP_STATUS.REQUEST_TIMEOUT,
      { ...context, timeoutMs }
    )

    this.timeoutMs = timeoutMs
  }
}

/**
 * Error Factory for creating errors from different sources
 */
export const ErrorFactory = {
  /**
   * Create error from HTTP response
   */
  fromResponse(response: Response, context: ErrorContext = {}): AppError {
    const statusCode = response.status
    const url = response.url

    switch (statusCode) {
      case HTTP_STATUS.UNAUTHORIZED:
        return new AuthenticationError(
          'Authentication required',
          ERROR_CODES.AUTHENTICATION_REQUIRED,
          { ...context, url }
        )

      case HTTP_STATUS.FORBIDDEN:
        return new AuthorizationError(
          'Access forbidden',
          ERROR_CODES.ACCESS_DENIED,
          { ...context, url }
        )

      case HTTP_STATUS.NOT_FOUND:
        return new AppError(
          'Resource not found',
          ERROR_CODES.RESOURCE_NOT_FOUND,
          ErrorCategory.NETWORK,
          ErrorSeverity.MEDIUM,
          statusCode,
          { ...context, url }
        )

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        const retryAfter = response.headers.get('Retry-After')
        return new RateLimitError(
          'Too many requests',
          retryAfter ? parseInt(retryAfter, 10) : undefined,
          { ...context, url }
        )

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return new AppError(
          'Internal server error',
          ERROR_CODES.SERVER_ERROR,
          ErrorCategory.SYSTEM,
          ErrorSeverity.HIGH,
          statusCode,
          { ...context, url }
        )

      default:
        return new NetworkError(
          `HTTP ${statusCode}: ${response.statusText}`,
          ERROR_CODES.NETWORK_ERROR,
          statusCode,
          { ...context, url }
        )
    }
  },

  /**
   * Create error from JavaScript Error
   */
  fromJSError(error: Error, context: ErrorContext = {}): AppError {
    if (error instanceof AppError) {
      return error
    }

    // Handle specific JavaScript error types
    if (error.name === 'TypeError') {
      return new AppError(
        error.message,
        ERROR_CODES.TYPE_ERROR,
        ErrorCategory.SYSTEM,
        ErrorSeverity.MEDIUM,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        context,
        false
      )
    }

    if (error.name === 'ReferenceError') {
      return new ConfigurationError(
        error.message,
        'unknown',
        ERROR_CODES.CONFIGURATION_ERROR,
        context
      )
    }

    // Generic JavaScript error
    return new AppError(
      error.message,
      ERROR_CODES.UNKNOWN_ERROR,
      ErrorCategory.SYSTEM,
      ErrorSeverity.MEDIUM,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { ...context, originalError: error.name },
      false
    )
  },

  /**
   * Create validation error with field information
   */
  validation(field: string, value: unknown, message?: string): ValidationError {
    return new ValidationError(
      message || `Invalid value for field: ${field}`,
      field,
      value
    )
  },

  /**
   * Create network error
   */
  network(message: string, url?: string): NetworkError {
    const context: ErrorContext = {}
    if (url !== undefined) context.url = url
    return new NetworkError(
      message,
      ERROR_CODES.NETWORK_ERROR,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      context
    )
  },

  /**
   * Create timeout error
   */
  timeout(operation: string, timeoutMs: number): TimeoutError {
    return new TimeoutError(
      `Operation '${operation}' timed out after ${timeoutMs}ms`,
      timeoutMs
    )
  },
}

/**
 * Error matching utilities
 */
export const ErrorMatchers = {
  /**
   * Check if error is network-related
   */
  isNetworkError(error: Error): boolean {
    return (
      error instanceof NetworkError ||
      (error instanceof AppError && error.category === ErrorCategory.NETWORK)
    )
  },

  /**
   * Check if error is authentication-related
   */
  isAuthError(error: Error): boolean {
    return (
      error instanceof AuthenticationError ||
      (error instanceof AppError &&
        error.category === ErrorCategory.AUTHENTICATION)
    )
  },

  /**
   * Check if error is authorization-related
   */
  isAuthzError(error: Error): boolean {
    return (
      error instanceof AuthorizationError ||
      (error instanceof AppError &&
        error.category === ErrorCategory.AUTHORIZATION)
    )
  },

  /**
   * Check if error is validation-related
   */
  isValidationError(error: Error): boolean {
    return (
      error instanceof ValidationError ||
      (error instanceof AppError && error.category === ErrorCategory.VALIDATION)
    )
  },

  /**
   * Check if error is retryable
   */
  isRetryable(error: Error): boolean {
    if (!(error instanceof AppError)) return false

    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.EXTERNAL_SERVICE,
    ]

    const retryableCodes: string[] = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.TIMEOUT_ERROR,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      ERROR_CODES.SERVER_ERROR,
    ]

    return (
      retryableCategories.includes(error.category) ||
      retryableCodes.includes(error.code)
    )
  },

  /**
   * Check if error should be reported to monitoring
   */
  shouldReport(error: Error): boolean {
    if (!(error instanceof AppError)) return true

    // Don't report user input validation errors
    if (error.category === ErrorCategory.USER_INPUT) return false
    if (
      error.category === ErrorCategory.VALIDATION &&
      error.severity === ErrorSeverity.LOW
    )
      return false

    // Always report high severity and critical errors
    if (
      error.severity === ErrorSeverity.HIGH ||
      error.severity === ErrorSeverity.CRITICAL
    )
      return true

    // Don't report operational errors with low/medium severity
    return !error.isOperational || error.severity !== ErrorSeverity.LOW
  },
}

export default {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  BusinessLogicError,
  ExternalServiceError,
  SyncError,
  AIServiceError,
  ConfigurationError,
  RateLimitError,
  TimeoutError,
  ErrorFactory,
  ErrorMatchers,
  ErrorSeverity,
  ErrorCategory,
}
