/**
 * 生產環境監控、錯誤追蹤、效能監控系統
 *
 * 提供完整的應用程式監控解決方案，包括：
 * - 錯誤追蹤和報告
 * - 效能監控和分析
 * - 用戶行為追蹤
 * - 系統健康狀態監控
 * - 實時告警系統
 */

// 監控配置
export const MONITORING_CONFIG = {
  // 錯誤追蹤配置
  ERROR_TRACKING: {
    ENABLED: process.env.NODE_ENV === 'production',
    SAMPLE_RATE: parseFloat(process.env.NEXT_PUBLIC_ERROR_SAMPLE_RATE || '1.0'),
    MAX_BREADCRUMBS: 50,
    MAX_STACK_FRAMES: 50,
    IGNORED_ERRORS: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Script error.',
      'Network request failed',
    ],
  },

  // 效能監控配置
  PERFORMANCE: {
    ENABLED: process.env.NODE_ENV === 'production',
    SAMPLE_RATE: parseFloat(
      process.env.NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE || '0.1'
    ),
    THRESHOLDS: {
      FCP: 2500, // First Contentful Paint
      LCP: 4000, // Largest Contentful Paint
      FID: 300, // First Input Delay
      CLS: 0.25, // Cumulative Layout Shift
      TTFB: 1500, // Time to First Byte
    },
  },

  // 日誌配置
  LOGGING: {
    LEVEL: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    MAX_LOG_SIZE: 1000, // 最大日誌條目數
    BATCH_SIZE: 10, // 批量發送大小
    FLUSH_INTERVAL: 5000, // 發送間隔（毫秒）
  },

  // 告警配置
  ALERTS: {
    ERROR_THRESHOLD: 10, // 每分鐘錯誤數量閾值
    PERFORMANCE_THRESHOLD: 5000, // 頁面載入時間閾值（毫秒）
    MEMORY_THRESHOLD: 100 * 1024 * 1024, // 記憶體使用閾值（bytes）
  },
} as const

// 日誌級別
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

// 日誌條目接口
export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  message: string
  data?: any
  context?: {
    userId?: string
    sessionId?: string
    userAgent?: string
    url?: string
    component?: string
    action?: string
  }
  stackTrace?: string
  fingerprint?: string
}

// 效能指標接口
export interface PerformanceMetric {
  id: string
  timestamp: number
  type: 'navigation' | 'resource' | 'paint' | 'layout' | 'custom'
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'score'
  metadata?: Record<string, any>
}

// 錯誤詳情接口
export interface ErrorDetails {
  id: string
  timestamp: number
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context: {
    userId?: string
    sessionId?: string
    url: string
    userAgent: string
    buildVersion?: string
    environment: string
  }
  breadcrumbs: Array<{
    timestamp: number
    message: string
    category: string
    level: string
    data?: any
  }>
  tags: Record<string, string>
  fingerprint: string
}

// 系統健康狀態接口
export interface SystemHealth {
  timestamp: number
  status: 'healthy' | 'warning' | 'critical'
  metrics: {
    memoryUsage: {
      used: number
      total: number
      percentage: number
    }
    cpuUsage?: number
    networkLatency: number
    errorRate: number
    responseTime: number
    activeUsers: number
  }
  alerts: Array<{
    type: string
    message: string
    severity: 'info' | 'warning' | 'error'
    timestamp: number
  }>
}

// 監控管理器類
export class MonitoringManager {
  private static instance: MonitoringManager
  private logs: LogEntry[] = []
  private metrics: PerformanceMetric[] = []
  private errors: ErrorDetails[] = []
  private breadcrumbs: Array<{
    timestamp: number
    message: string
    category: string
  }> = []
  private sessionId: string
  private userId?: string
  private flushTimer?: NodeJS.Timeout

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeMonitoring()
  }

  public static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager()
    }
    return MonitoringManager.instance
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('monitoring_session_id')
      if (stored) return stored
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('monitoring_session_id', sessionId)
    }

    return sessionId
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return

    // 初始化錯誤監聽
    this.setupErrorHandlers()

    // 初始化效能監控
    this.setupPerformanceMonitoring()

    // 初始化用戶行為追蹤
    this.setupUserBehaviorTracking()

    // 設置定期數據發送
    this.setupPeriodicFlush()

    // 頁面卸載時發送剩餘數據
    this.setupBeforeUnload()
  }

  private setupErrorHandlers(): void {
    // 全局錯誤處理
    window.addEventListener('error', event => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    // Promise 拒絕處理
    window.addEventListener('unhandledrejection', event => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      })
    })

    // React 錯誤邊界
    const originalConsoleError = console.error
    console.error = (...args) => {
      if (args[0]?.includes?.('React')) {
        this.reportError({
          message: args.join(' '),
          type: 'react_error',
        })
      }
      originalConsoleError(...args)
    }
  }

  private setupPerformanceMonitoring(): void {
    // Web Vitals 監控
    this.observeWebVitals()

    // 資源載入監控
    this.observeResourceLoading()

    // 導航時間監控
    this.observeNavigationTiming()
  }

  private observeWebVitals(): void {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          this.recordMetric({
            type: 'paint',
            name: 'LCP',
            value: entry.startTime,
            unit: 'ms',
          })
        })
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // Fallback for browsers that don't support LCP
      }

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          this.recordMetric({
            type: 'custom',
            name: 'FID',
            value: (entry as any).processingStart - entry.startTime,
            unit: 'ms',
          })
        })
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        // Fallback for browsers that don't support FID
      }
    }

    // CLS (Cumulative Layout Shift)
    let clsScore = 0
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value
          }
        })

        this.recordMetric({
          type: 'layout',
          name: 'CLS',
          value: clsScore,
          unit: 'score',
        })
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // Fallback for browsers that don't support layout-shift
      }
    }
  }

  private observeResourceLoading(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.duration > 1000) {
            // 只記錄耗時超過 1 秒的資源
            this.recordMetric({
              type: 'resource',
              name: 'resource_load_time',
              value: entry.duration,
              unit: 'ms',
              metadata: {
                name: entry.name,
                type: (entry as any).initiatorType,
                size: (entry as any).transferSize,
              },
            })
          }
        })
      })

      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
      } catch (e) {
        // Fallback
      }
    }
  }

  private observeNavigationTiming(): void {
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          const navEntry = entry as PerformanceNavigationTiming

          // 記錄各種導航時間
          this.recordMetric({
            type: 'navigation',
            name: 'TTFB',
            value: navEntry.responseStart - navEntry.requestStart,
            unit: 'ms',
          })

          this.recordMetric({
            type: 'navigation',
            name: 'DOM_Content_Loaded',
            value:
              navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
            unit: 'ms',
          })

          this.recordMetric({
            type: 'navigation',
            name: 'Load_Complete',
            value: navEntry.loadEventEnd - navEntry.loadEventStart,
            unit: 'ms',
          })
        })
      })

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] })
      } catch (e) {
        // Fallback
      }
    }
  }

  private setupUserBehaviorTracking(): void {
    // 點擊追蹤
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement
      this.addBreadcrumb({
        message: `User clicked on ${target.tagName}`,
        category: 'user_interaction',
        data: {
          tag: target.tagName,
          className: target.className,
          id: target.id,
          text: target.textContent?.slice(0, 100),
        },
      })
    })

    // 頁面可見性變化
    document.addEventListener('visibilitychange', () => {
      this.addBreadcrumb({
        message: `Page visibility changed to ${document.visibilityState}`,
        category: 'page_lifecycle',
      })
    })

    // 網絡狀態變化
    if ('navigator' in window && 'onLine' in navigator) {
      window.addEventListener('online', () => {
        this.addBreadcrumb({
          message: 'Network connection restored',
          category: 'network',
        })
      })

      window.addEventListener('offline', () => {
        this.addBreadcrumb({
          message: 'Network connection lost',
          category: 'network',
        })
      })
    }
  }

  private setupPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, MONITORING_CONFIG.LOGGING.FLUSH_INTERVAL)
  }

  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      this.flush(true) // 同步發送
    })
  }

  // 公共方法
  public setUserId(userId: string): void {
    this.userId = userId
  }

  public log(
    level: LogLevel,
    message: string,
    data?: any,
    context?: any
  ): void {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      data,
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context,
      },
    }

    this.logs.push(entry)

    // 限制日誌數量
    if (this.logs.length > MONITORING_CONFIG.LOGGING.MAX_LOG_SIZE) {
      this.logs = this.logs.slice(-MONITORING_CONFIG.LOGGING.MAX_LOG_SIZE)
    }

    // 立即發送嚴重錯誤
    if (level >= LogLevel.ERROR) {
      this.flush()
    }
  }

  public recordMetric(
    metric: Omit<PerformanceMetric, 'id' | 'timestamp'>
  ): void {
    const fullMetric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...metric,
    }

    this.metrics.push(fullMetric)

    // 檢查效能閾值
    this.checkPerformanceThresholds(fullMetric)
  }

  public reportError(error: any, context?: any): void {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 檢查是否應該忽略此錯誤
    if (
      MONITORING_CONFIG.ERROR_TRACKING.IGNORED_ERRORS.some(ignored =>
        error.message?.includes(ignored)
      )
    ) {
      return
    }

    const errorDetails: ErrorDetails = {
      id: errorId,
      timestamp: Date.now(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary,
      severity: this.determineSeverity(error),
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
        environment: process.env.NODE_ENV || 'unknown',
        ...context,
      },
      breadcrumbs: this.breadcrumbs.map(b => ({ ...b, level: 'info' })),
      tags: {
        component: context?.component || 'unknown',
        action: context?.action || 'unknown',
        ...context?.tags,
      },
      fingerprint: this.generateErrorFingerprint(error),
    }

    this.errors.push(errorDetails)

    // 立即發送嚴重錯誤
    if (errorDetails.severity === 'critical') {
      this.flush()
    }
  }

  public addBreadcrumb(breadcrumb: {
    message: string
    category: string
    data?: any
  }): void {
    this.breadcrumbs.push({
      timestamp: Date.now(),
      ...breadcrumb,
    })

    // 限制麵包屑數量
    if (
      this.breadcrumbs.length > MONITORING_CONFIG.ERROR_TRACKING.MAX_BREADCRUMBS
    ) {
      this.breadcrumbs = this.breadcrumbs.slice(
        -MONITORING_CONFIG.ERROR_TRACKING.MAX_BREADCRUMBS
      )
    }
  }

  public getSystemHealth(): SystemHealth {
    const now = Date.now()
    const recentErrors = this.errors.filter(e => now - e.timestamp < 60000) // 最近 1 分鐘
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 60000)

    const memoryInfo = (performance as any).memory
    const memoryUsage = memoryInfo
      ? {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          percentage:
            (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100,
        }
      : { used: 0, total: 0, percentage: 0 }

    const avgResponseTime = recentMetrics
      .filter(m => m.name === 'TTFB')
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0)

    const alerts = []

    // 檢查錯誤率
    if (recentErrors.length > MONITORING_CONFIG.ALERTS.ERROR_THRESHOLD) {
      alerts.push({
        type: 'high_error_rate',
        message: `高錯誤率: ${recentErrors.length} 個錯誤在過去 1 分鐘內`,
        severity: 'error' as const,
        timestamp: now,
      })
    }

    // 檢查記憶體使用
    if (memoryUsage.used > MONITORING_CONFIG.ALERTS.MEMORY_THRESHOLD) {
      alerts.push({
        type: 'high_memory_usage',
        message: `記憶體使用率過高: ${memoryUsage.percentage.toFixed(1)}%`,
        severity: 'warning' as const,
        timestamp: now,
      })
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (alerts.some(a => a.severity === 'error')) {
      status = 'critical'
    } else if (alerts.length > 0) {
      status = 'warning'
    }

    return {
      timestamp: now,
      status,
      metrics: {
        memoryUsage,
        networkLatency: 0, // 需要額外實現
        errorRate: recentErrors.length,
        responseTime: avgResponseTime,
        activeUsers: 1, // 需要從後端獲取
      },
      alerts,
    }
  }

  private determineSeverity(
    error: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Loading chunk')
    ) {
      return 'medium'
    }

    if (error.componentStack || error.errorBoundary) {
      return 'high'
    }

    if (
      error.stack?.includes('TypeError') ||
      error.stack?.includes('ReferenceError')
    ) {
      return 'high'
    }

    return 'medium'
  }

  private generateErrorFingerprint(error: any): string {
    const key = `${error.message}_${error.stack?.split('\n')[0] || 'no-stack'}`
    return btoa(key)
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8)
  }

  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    const thresholds = MONITORING_CONFIG.PERFORMANCE.THRESHOLDS

    if (metric.name === 'LCP' && metric.value > thresholds.LCP) {
      this.log(LogLevel.WARN, `LCP threshold exceeded: ${metric.value}ms`, {
        metric,
      })
    }

    if (metric.name === 'FID' && metric.value > thresholds.FID) {
      this.log(LogLevel.WARN, `FID threshold exceeded: ${metric.value}ms`, {
        metric,
      })
    }

    if (metric.name === 'TTFB' && metric.value > thresholds.TTFB) {
      this.log(LogLevel.WARN, `TTFB threshold exceeded: ${metric.value}ms`, {
        metric,
      })
    }
  }

  private async flush(sync: boolean = false): Promise<void> {
    if (
      this.logs.length === 0 &&
      this.metrics.length === 0 &&
      this.errors.length === 0
    ) {
      return
    }

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      logs: [...this.logs],
      metrics: [...this.metrics],
      errors: [...this.errors],
      systemHealth: this.getSystemHealth(),
    }

    // 清空本地數據
    this.logs = []
    this.metrics = []
    this.errors = []

    try {
      const endpoint = '/api/monitoring/ingest'

      if (sync && navigator.sendBeacon) {
        // 使用 sendBeacon 進行同步發送
        navigator.sendBeacon(endpoint, JSON.stringify(payload))
      } else {
        // 異步發送
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }).catch(error => {
          console.warn('Failed to send monitoring data:', error)
        })
      }
    } catch (error) {
      console.warn('Monitoring flush failed:', error)
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush(true)
  }
}

// 全局監控實例
export const monitoring = MonitoringManager.getInstance()

// 便捷方法
export const logger = {
  debug: (message: string, data?: any, context?: any) =>
    monitoring.log(LogLevel.DEBUG, message, data, context),
  info: (message: string, data?: any, context?: any) =>
    monitoring.log(LogLevel.INFO, message, data, context),
  warn: (message: string, data?: any, context?: any) =>
    monitoring.log(LogLevel.WARN, message, data, context),
  error: (message: string, data?: any, context?: any) =>
    monitoring.log(LogLevel.ERROR, message, data, context),
  critical: (message: string, data?: any, context?: any) =>
    monitoring.log(LogLevel.CRITICAL, message, data, context),
}

// 效能測量裝飾器
export function measurePerformance(name: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()

      try {
        const result = await originalMethod.apply(this, args)
        const endTime = performance.now()

        monitoring.recordMetric({
          type: 'custom',
          name,
          value: endTime - startTime,
          unit: 'ms',
          metadata: {
            method: propertyKey,
            args: args.length,
          },
        })

        return result
      } catch (error) {
        const endTime = performance.now()

        monitoring.recordMetric({
          type: 'custom',
          name: `${name}_error`,
          value: endTime - startTime,
          unit: 'ms',
          metadata: {
            method: propertyKey,
            error: error instanceof Error ? error.message : String(error),
          },
        })

        throw error
      }
    }

    return descriptor
  }
}
