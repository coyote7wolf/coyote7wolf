/**
 * Error Handler Utilities
 *
 * Provides global error handling, error boundary integration,
 * error reporting, and user notification systems.
 */

import { isDevelopment } from '@/config/environment'
import {
  AppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorMatchers,
  ErrorFactory,
  NetworkError,
  AuthenticationError,
} from './errors'

/**
 * Error Handler Configuration
 */
export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean
  enableRemoteLogging: boolean
  enableUserNotifications: boolean
  enableRetry: boolean
  maxRetryAttempts: number
  retryDelayMs: number
  notificationDurationMs: number
}

/**
 * Default Error Handler Configuration
 */
export const DEFAULT_ERROR_CONFIG: ErrorHandlerConfig = {
  enableConsoleLogging: isDevelopment,
  enableRemoteLogging: true,
  enableUserNotifications: true,
  enableRetry: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  notificationDurationMs: 5000,
}

/**
 * Error Notification Interface
 */
export interface ErrorNotification {
  id: string
  title: string
  message: string
  severity: ErrorSeverity
  timestamp: Date
  actions?: ErrorNotificationAction[]
  autoClose?: boolean
  duration?: number
}

export interface ErrorNotificationAction {
  label: string
  action: () => void | Promise<void>
  primary?: boolean
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig
  private notificationCallbacks: Set<
    (notification: ErrorNotification) => void
  > = new Set()
  private retryQueue: Map<string, () => Promise<void>> = new Map()

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_ERROR_CONFIG, ...config }
  }

  /**
   * Handle error with full processing pipeline
   */
  async handle(error: Error, context?: Record<string, unknown>): Promise<void> {
    const appError = this.normalizeError(error, context)

    // Log error
    if (this.config.enableConsoleLogging) {
      this.logToConsole(appError)
    }

    // Report to remote logging service
    if (
      this.config.enableRemoteLogging &&
      ErrorMatchers.shouldReport(appError)
    ) {
      await this.reportError(appError)
    }

    // Show user notification
    if (this.config.enableUserNotifications) {
      this.showNotification(appError)
    }

    // Handle retry logic
    if (this.config.enableRetry && ErrorMatchers.isRetryable(appError)) {
      this.handleRetry(appError)
    }

    // Handle specific error types
    await this.handleSpecificError(appError)
  }

  /**
   * Normalize any error to AppError
   */
  private normalizeError(
    error: Error,
    context?: Record<string, unknown>
  ): AppError {
    if (error instanceof AppError) {
      return error
    }

    // Convert JavaScript errors to AppError
    return ErrorFactory.fromJSError(error, context)
  }

  /**
   * Log error to console with formatting
   */
  private logToConsole(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity)
    const logMessage = this.formatLogMessage(error)

    console[logLevel](logMessage, {
      error: error.toJSON(),
      stack: error.stack,
    })
  }

  /**
   * Get appropriate console log level
   */
  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warn'
      case ErrorSeverity.LOW:
      default:
        return 'info'
    }
  }

  /**
   * Format error message for logging
   */
  private formatLogMessage(error: AppError): string {
    return `[${error.category.toUpperCase()}] ${error.code}: ${error.message}`
  }

  /**
   * Report error to remote logging service
   */
  private async reportError(error: AppError): Promise<void> {
    try {
      // In a real implementation, this would send to a service like Sentry, LogRocket, etc.
      const reportData = {
        ...error.toJSON(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }

      // Mock API call for demonstration
      console.log('Reporting error to remote service:', reportData)

      // Example: Send to monitoring service
      // await this.sendToMonitoringService(reportData)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  /**
   * Show user notification for error
   */
  private showNotification(error: AppError): void {
    // Don't show notifications for low-severity validation errors
    if (
      error.category === ErrorCategory.VALIDATION &&
      error.severity === ErrorSeverity.LOW
    ) {
      return
    }

    const notification: ErrorNotification = {
      id: this.generateNotificationId(),
      title: this.getNotificationTitle(error),
      message: error.toUserMessage(),
      severity: error.severity,
      timestamp: new Date(),
      actions: this.getNotificationActions(error),
      autoClose: error.severity === ErrorSeverity.LOW,
      duration: this.config.notificationDurationMs,
    }

    // Notify all registered callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification)
      } catch (callbackError) {
        console.error('Error in notification callback:', callbackError)
      }
    })
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get appropriate notification title
   */
  private getNotificationTitle(error: AppError): string {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return 'Connection Issue'
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication Error'
      case ErrorCategory.AUTHORIZATION:
        return 'Access Denied'
      case ErrorCategory.VALIDATION:
        return 'Invalid Input'
      case ErrorCategory.SYNC:
        return 'Sync Error'
      case ErrorCategory.AI_SERVICE:
        return 'AI Service Issue'
      default:
        return 'Error'
    }
  }

  /**
   * Get notification actions based on error type
   */
  private getNotificationActions(error: AppError): ErrorNotificationAction[] {
    const actions: ErrorNotificationAction[] = []

    // Add retry action for retryable errors
    if (ErrorMatchers.isRetryable(error)) {
      actions.push({
        label: 'Retry',
        action: () => this.retryLastOperation(),
        primary: true,
      })
    }

    // Add login action for auth errors
    if (ErrorMatchers.isAuthError(error)) {
      actions.push({
        label: 'Login',
        action: () => this.redirectToLogin(),
        primary: true,
      })
    }

    // Add refresh action for network errors
    if (ErrorMatchers.isNetworkError(error)) {
      actions.push({
        label: 'Refresh',
        action: () => window.location.reload(),
      })
    }

    return actions
  }

  /**
   * Handle retry logic for retryable errors
   */
  private handleRetry(error: AppError): void {
    if (error instanceof NetworkError) {
      // Add exponential backoff for network errors
      const retryKey = `${error.code}_${error.context.url || 'unknown'}`

      if (!this.retryQueue.has(retryKey)) {
        this.scheduleRetry(retryKey, () => this.retryNetworkOperation(error))
      }
    }
  }

  /**
   * Schedule retry operation
   */
  private scheduleRetry(key: string, operation: () => Promise<void>): void {
    const delay =
      this.config.retryDelayMs * Math.pow(2, this.getRetryAttempt(key))

    setTimeout(async () => {
      try {
        await operation()
        this.retryQueue.delete(key)
      } catch (retryError) {
        const attempts = this.getRetryAttempt(key)

        if (attempts < this.config.maxRetryAttempts) {
          this.incrementRetryAttempt(key)
          this.scheduleRetry(key, operation)
        } else {
          this.retryQueue.delete(key)
          console.error(`Max retry attempts reached for ${key}:`, retryError)
        }
      }
    }, delay)
  }

  /**
   * Handle specific error types with custom logic
   */
  private async handleSpecificError(error: AppError): Promise<void> {
    switch (error.category) {
      case ErrorCategory.AUTHENTICATION:
        await this.handleAuthenticationError(error as AuthenticationError)
        break
      case ErrorCategory.NETWORK:
        await this.handleNetworkError(error as NetworkError)
        break
      case ErrorCategory.SYNC:
        await this.handleSyncError(error)
        break
      // Add more specific handlers as needed
    }
  }

  /**
   * Handle authentication errors
   */
  private async handleAuthenticationError(
    error: AuthenticationError
  ): Promise<void> {
    // Clear authentication tokens
    localStorage.removeItem('synccoreai_access_token')
    localStorage.removeItem('synccoreai_refresh_token')

    // Redirect to login after short delay
    setTimeout(() => {
      this.redirectToLogin()
    }, 2000)
  }

  /**
   * Handle network errors
   */
  private async handleNetworkError(error: NetworkError): Promise<void> {
    // Check if we're offline
    if (!navigator.onLine) {
      // Trigger offline mode
      window.dispatchEvent(new CustomEvent('app:offline'))
    }
  }

  /**
   * Handle sync errors
   */
  private async handleSyncError(error: AppError): Promise<void> {
    // Trigger sync conflict resolution UI
    window.dispatchEvent(
      new CustomEvent('app:sync-conflict', {
        detail: { error },
      })
    )
  }

  /**
   * Retry last operation
   */
  private async retryLastOperation(): Promise<void> {
    // Implementation would depend on how operations are tracked
    console.log('Retrying last operation...')
  }

  /**
   * Retry network operation
   */
  private async retryNetworkOperation(error: NetworkError): Promise<void> {
    // Implementation would re-attempt the failed network request
    console.log('Retrying network operation:', error.context.url)
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    window.location.href = '/login'
  }

  /**
   * Get retry attempt count for operation
   */
  private getRetryAttempt(key: string): number {
    // In a real implementation, this would track retry attempts
    return 0
  }

  /**
   * Increment retry attempt count
   */
  private incrementRetryAttempt(key: string): void {
    // In a real implementation, this would increment retry count
  }

  /**
   * Register callback for error notifications
   */
  onNotification(
    callback: (notification: ErrorNotification) => void
  ): () => void {
    this.notificationCallbacks.add(callback)

    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback)
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Global Error Handler Instance
 */
export const globalErrorHandler = new ErrorHandler()

/**
 * Global error event listeners
 */
if (typeof window !== 'undefined') {
  // Handle unhandled JavaScript errors
  window.addEventListener('error', event => {
    globalErrorHandler.handle(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason))
    globalErrorHandler.handle(error, {
      type: 'unhandled_promise_rejection',
    })
  })
}

/**
 * Error Boundary Helper for React components
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | undefined
}

export const createErrorBoundaryState = (): ErrorBoundaryState => ({
  hasError: false,
  error: undefined,
})

export const handleErrorBoundary = (
  error: Error,
  errorInfo: { componentStack: string }
): ErrorBoundaryState => {
  const appError = ErrorFactory.fromJSError(error, {
    componentStack: errorInfo.componentStack,
    type: 'react_error_boundary',
  })

  globalErrorHandler.handle(appError)

  return {
    hasError: true,
    error: appError,
  }
}

/**
 * Utility functions for error handling
 */
export const errorUtils = {
  /**
   * Wrap async function with error handling
   */
  wrapAsync: <T extends unknown[], R>(fn: (...args: T) => Promise<R>) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args)
      } catch (error) {
        await globalErrorHandler.handle(
          error instanceof Error ? error : new Error(String(error))
        )
        return undefined
      }
    }
  },

  /**
   * Wrap sync function with error handling
   */
  wrapSync: <T extends unknown[], R>(fn: (...args: T) => R) => {
    return (...args: T): R | undefined => {
      try {
        return fn(...args)
      } catch (error) {
        globalErrorHandler.handle(
          error instanceof Error ? error : new Error(String(error))
        )
        return undefined
      }
    }
  },

  /**
   * Create error with context
   */
  createError: (
    message: string,
    code?: string,
    category?: ErrorCategory,
    context?: Record<string, unknown>
  ): AppError => {
    return new AppError(
      message,
      code,
      category,
      ErrorSeverity.MEDIUM,
      500,
      context
    )
  },

  /**
   * Handle API errors
   */
  handleApiError: async (response: Response): Promise<never> => {
    const error = ErrorFactory.fromResponse(response)
    await globalErrorHandler.handle(error)
    throw error
  },
}

export default {
  ErrorHandler,
  globalErrorHandler,
  errorUtils,
  createErrorBoundaryState,
  handleErrorBoundary,
}
