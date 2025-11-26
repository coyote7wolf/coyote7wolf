/**
 * 錯誤處理系統
 * 提供統一的錯誤管理和處理機制
 */

import React, { Component, ReactNode } from 'react'

// 錯誤類型定義
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SYNC = 'SYNC',
  AI = 'AI',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  timestamp: number
  userAgent: string
  url: string
  action?: string
  component?: string
  additionalData?: Record<string, any>
}

export interface ErrorRecoveryOptions {
  retryable: boolean
  maxRetries: number
  retryDelay: number
  fallbackAction?: () => void
  userMessage?: string
}

// 基礎錯誤類
export abstract class BaseError extends Error {
  abstract readonly type: ErrorType
  abstract readonly severity: ErrorSeverity

  public readonly context: ErrorContext
  public readonly recoveryOptions: ErrorRecoveryOptions
  public readonly timestamp: number

  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    recoveryOptions: Partial<ErrorRecoveryOptions> = {}
  ) {
    super(message)
    this.name = this.constructor.name
    this.timestamp = Date.now()

    this.context = {
      timestamp: this.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    }

    this.recoveryOptions = {
      retryable: false,
      maxRetries: 0,
      retryDelay: 1000,
      ...recoveryOptions,
    }
  }
}

// 網路錯誤
export class NetworkError extends BaseError {
  readonly type = ErrorType.NETWORK
  readonly severity = ErrorSeverity.MEDIUM

  constructor(
    message: string,
    public readonly statusCode?: number,
    context?: Partial<ErrorContext>
  ) {
    super(message, context, {
      retryable: true,
      maxRetries: 3,
      retryDelay: 1000,
      userMessage: '網路連線發生問題，請稍後再試',
    })
  }
}

// 認證錯誤
export class AuthError extends BaseError {
  readonly type = ErrorType.AUTH
  readonly severity = ErrorSeverity.HIGH

  constructor(message: string, context?: Partial<ErrorContext>) {
    super(message, context, {
      retryable: false,
      maxRetries: 0,
      userMessage: '身份驗證失敗，請重新登入',
    })
  }
}

// 驗證錯誤
export class ValidationError extends BaseError {
  readonly type = ErrorType.VALIDATION
  readonly severity = ErrorSeverity.LOW

  constructor(
    message: string,
    public readonly field?: string,
    public readonly errors?: Record<string, string[]>,
    context?: Partial<ErrorContext>
  ) {
    super(message, context, {
      retryable: false,
      maxRetries: 0,
      userMessage: '輸入資料格式不正確，請檢查後重試',
    })
  }
}

// 同步錯誤
export class SyncError extends BaseError {
  readonly type = ErrorType.SYNC
  readonly severity = ErrorSeverity.HIGH

  constructor(
    message: string,
    public readonly conflictData?: any,
    context?: Partial<ErrorContext>
  ) {
    super(message, context, {
      retryable: true,
      maxRetries: 5,
      retryDelay: 2000,
      userMessage: '文件同步發生問題，正在嘗試重新同步',
    })
  }
}

// AI 服務錯誤
export class AIError extends BaseError {
  readonly type = ErrorType.AI
  readonly severity = ErrorSeverity.MEDIUM

  constructor(message: string, context?: Partial<ErrorContext>) {
    super(message, context, {
      retryable: true,
      maxRetries: 2,
      retryDelay: 3000,
      userMessage: 'AI 服務暫時無法使用，請稍後再試',
    })
  }
}

// 存儲錯誤
export class StorageError extends BaseError {
  readonly type = ErrorType.STORAGE
  readonly severity = ErrorSeverity.MEDIUM

  constructor(message: string, context?: Partial<ErrorContext>) {
    super(message, context, {
      retryable: true,
      maxRetries: 3,
      retryDelay: 1500,
      userMessage: '數據存儲發生問題，請檢查存儲空間',
    })
  }
}

// 全域錯誤處理器
class GlobalErrorHandler {
  private errorQueue: BaseError[] = []
  private isProcessing = false
  private listeners: ((error: BaseError) => void)[] = []

  // 註冊錯誤監聽器
  subscribe(listener: (error: BaseError) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 處理錯誤
  async handle(error: Error | BaseError): Promise<boolean> {
    const processedError = this.normalizeError(error)

    // 加入處理佇列
    this.errorQueue.push(processedError)

    // 通知監聽器
    this.listeners.forEach(listener => {
      try {
        listener(processedError)
      } catch (e) {
        console.error('Error listener failed:', e)
      }
    })

    // 記錄錯誤
    this.logError(processedError)

    // 處理錯誤
    return this.processError(processedError)
  }

  private normalizeError(error: Error | BaseError): BaseError {
    if (error instanceof BaseError) {
      return error
    }

    // 根據錯誤訊息推斷錯誤類型
    if (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch')
    ) {
      return new NetworkError(error.message)
    }

    if (
      error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('auth')
    ) {
      return new AuthError(error.message)
    }

    // 預設為未知錯誤
    return new (class extends BaseError {
      readonly type = ErrorType.UNKNOWN
      readonly severity = ErrorSeverity.MEDIUM
    })(error.message)
  }

  private async processError(error: BaseError): Promise<boolean> {
    if (this.isProcessing) return false

    this.isProcessing = true

    try {
      // 如果錯誤可重試
      if (error.recoveryOptions.retryable) {
        return await this.attemptRetry(error)
      }

      // 執行回退操作
      if (error.recoveryOptions.fallbackAction) {
        error.recoveryOptions.fallbackAction()
        return true
      }

      return false
    } finally {
      this.isProcessing = false
    }
  }

  private async attemptRetry(error: BaseError): Promise<boolean> {
    const { maxRetries, retryDelay } = error.recoveryOptions

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 等待重試延遲
        await this.delay(retryDelay * attempt)

        // 這裡應該重新執行原始操作
        // 在實際實作中，需要保存原始操作的引用
        console.log(
          `Retry attempt ${attempt}/${maxRetries} for error:`,
          error.message
        )

        // Mock 重試成功
        if (Math.random() > 0.5) {
          console.log('Retry successful')
          return true
        }
      } catch (retryError) {
        console.log(`Retry attempt ${attempt} failed:`, retryError)
      }
    }

    console.log('All retry attempts failed')
    return false
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private logError(error: BaseError): void {
    // 在生產環境中，這裡會發送到日誌服務
    const logData = {
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context,
      stack: error.stack,
      timestamp: error.timestamp,
    }

    // 根據嚴重程度決定日誌級別
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL ERROR:', logData)
        break
      case ErrorSeverity.HIGH:
        console.error('HIGH SEVERITY ERROR:', logData)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('MEDIUM SEVERITY ERROR:', logData)
        break
      case ErrorSeverity.LOW:
        console.info('LOW SEVERITY ERROR:', logData)
        break
    }

    // Mock 發送到遠端日誌服務
    if (process.env.NODE_ENV === 'production') {
      this.sendToRemoteLogging(logData)
    }
  }

  private async sendToRemoteLogging(logData: any): Promise<void> {
    try {
      // Mock API 呼叫
      await fetch('/api/logging/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      })
    } catch (e) {
      console.error('Failed to send error to remote logging:', e)
    }
  }

  // 獲取錯誤統計
  getErrorStats(): Record<ErrorType, number> {
    const stats: Record<ErrorType, number> = {
      [ErrorType.NETWORK]: 0,
      [ErrorType.AUTH]: 0,
      [ErrorType.VALIDATION]: 0,
      [ErrorType.SYNC]: 0,
      [ErrorType.AI]: 0,
      [ErrorType.STORAGE]: 0,
      [ErrorType.UNKNOWN]: 0,
    }

    this.errorQueue.forEach(error => {
      stats[error.type]++
    })

    return stats
  }

  // 清理舊錯誤
  cleanup(olderThan: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan
    this.errorQueue = this.errorQueue.filter(error => error.timestamp > cutoff)
  }
}

// React Error Boundary
interface ErrorBoundaryState {
  hasError: boolean
  error?: BaseError
}

interface ErrorBoundaryProps {
  fallback?: (error: BaseError) => ReactNode
  onError?: (error: BaseError) => void
  children: ReactNode
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const processedError =
      error instanceof BaseError
        ? error
        : new (class extends BaseError {
            readonly type = ErrorType.UNKNOWN
            readonly severity = ErrorSeverity.HIGH
          })(error.message)

    return {
      hasError: true,
      error: processedError,
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const processedError =
      this.state.error ||
      new (class extends BaseError {
        readonly type = ErrorType.UNKNOWN
        readonly severity = ErrorSeverity.HIGH
      })(error.message, {
        component: errorInfo.componentStack,
        additionalData: errorInfo,
      })

    // 通知錯誤處理器
    globalErrorHandler.handle(processedError)

    // 呼叫自定義錯誤處理器
    if (this.props.onError) {
      this.props.onError(processedError)
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error)
      }

      return React.createElement(
        'div',
        {
          className: 'min-h-screen flex items-center justify-center bg-gray-50',
        },
        React.createElement(
          'div',
          {
            className:
              'max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center',
          },
          React.createElement(
            'div',
            {
              className: 'text-red-500 text-6xl mb-4',
            },
            '⚠️'
          ),
          React.createElement(
            'h2',
            {
              className: 'text-xl font-semibold text-gray-900 mb-2',
            },
            '發生了一些問題'
          ),
          React.createElement(
            'p',
            {
              className: 'text-gray-600 mb-4',
            },
            this.state.error.recoveryOptions.userMessage ||
              '應用程式遇到未預期的錯誤'
          ),
          React.createElement(
            'button',
            {
              onClick: () => window.location.reload(),
              className:
                'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded',
            },
            '重新載入頁面'
          )
        )
      )
    }

    return this.props.children
  }
}

// 全域錯誤處理器實例
export const globalErrorHandler = new GlobalErrorHandler()

// 設定全域錯誤監聽
if (typeof window !== 'undefined') {
  // 監聽未捕獲的錯誤
  window.addEventListener('error', event => {
    globalErrorHandler.handle(new Error(event.message))
  })

  // 監聽未捕獲的 Promise 拒絕
  window.addEventListener('unhandledrejection', event => {
    globalErrorHandler.handle(new Error(event.reason))
  })
}

// React Hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: Error | BaseError) => {
    return globalErrorHandler.handle(error)
  }

  const createErrorHandler = (context?: Partial<ErrorContext>) => {
    return (error: Error | BaseError) => {
      if (error instanceof BaseError) {
        // 創建新的錯誤實例以更新 context
        const baseError = error as BaseError
        const newError = new (class extends BaseError {
          readonly type = baseError.type
          readonly severity = baseError.severity
        })(
          error.message,
          { ...baseError.context, ...context },
          baseError.recoveryOptions
        )
        return handleError(newError)
      }
      return handleError(error)
    }
  }

  return {
    handleError,
    createErrorHandler,
    errorStats: globalErrorHandler.getErrorStats(),
  }
}

export default globalErrorHandler
