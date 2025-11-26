/**
 * 監控相關的 React Hooks
 *
 * 提供 React 組件中使用的監控功能
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { monitoring, logger, LogLevel } from '@/monitoring'
import type { SystemHealth } from '@/monitoring'

// 錯誤邊界 Hook
export function useErrorBoundary() {
  const reportError = useCallback((error: Error, errorInfo?: any) => {
    monitoring.reportError(error, {
      component: 'ErrorBoundary',
      errorInfo,
    })
  }, [])

  return { reportError }
}

// 效能監控 Hook
export function usePerformanceMonitoring() {
  const startTimeRef = useRef<number>()

  const startMeasurement = useCallback((name: string) => {
    startTimeRef.current = performance.now()
    monitoring.addBreadcrumb({
      message: `Started performance measurement: ${name}`,
      category: 'performance',
    })
  }, [])

  const endMeasurement = useCallback((name: string, metadata?: any) => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current
      monitoring.recordMetric({
        type: 'custom',
        name,
        value: duration,
        unit: 'ms',
        metadata,
      })

      monitoring.addBreadcrumb({
        message: `Completed performance measurement: ${name} (${duration.toFixed(2)}ms)`,
        category: 'performance',
      })
    }
  }, [])

  return { startMeasurement, endMeasurement }
}

// 用戶行為追蹤 Hook
export function useUserBehaviorTracking() {
  const trackAction = useCallback((action: string, data?: any) => {
    monitoring.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user_action',
      data,
    })

    logger.info(`User performed action: ${action}`, data, {
      component: 'UserBehaviorTracking',
      action,
    })
  }, [])

  const trackPageView = useCallback((page: string, metadata?: any) => {
    monitoring.addBreadcrumb({
      message: `Page view: ${page}`,
      category: 'navigation',
      data: metadata,
    })

    monitoring.recordMetric({
      type: 'custom',
      name: 'page_view',
      value: 1,
      unit: 'count',
      metadata: {
        page,
        ...metadata,
      },
    })
  }, [])

  const trackFeatureUsage = useCallback((feature: string, context?: any) => {
    logger.info(`Feature used: ${feature}`, context, {
      component: 'FeatureTracking',
      feature,
    })

    monitoring.recordMetric({
      type: 'custom',
      name: 'feature_usage',
      value: 1,
      unit: 'count',
      metadata: {
        feature,
        ...context,
      },
    })
  }, [])

  return { trackAction, trackPageView, trackFeatureUsage }
}

// 系統健康監控 Hook
export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshHealth = useCallback(() => {
    setIsLoading(true)
    try {
      const currentHealth = monitoring.getSystemHealth()
      setHealth(currentHealth)
    } catch (error) {
      logger.error('Failed to get system health', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // 初始載入
    refreshHealth()

    // 定期更新
    const interval = setInterval(refreshHealth, 30000) // 每 30 秒更新

    return () => clearInterval(interval)
  }, [refreshHealth])

  return { health, isLoading, refreshHealth }
}

// 組件生命週期監控 Hook
export function useComponentLifecycleMonitoring(componentName: string) {
  const mountTimeRef = useRef<number>()

  useEffect(() => {
    // 組件掛載
    mountTimeRef.current = performance.now()

    monitoring.addBreadcrumb({
      message: `Component mounted: ${componentName}`,
      category: 'component_lifecycle',
    })

    logger.debug(`Component ${componentName} mounted`)

    // 組件卸載
    return () => {
      const mountDuration = mountTimeRef.current
        ? performance.now() - mountTimeRef.current
        : 0

      monitoring.addBreadcrumb({
        message: `Component unmounted: ${componentName}`,
        category: 'component_lifecycle',
        data: { mountDuration },
      })

      monitoring.recordMetric({
        type: 'custom',
        name: 'component_lifetime',
        value: mountDuration,
        unit: 'ms',
        metadata: {
          component: componentName,
        },
      })

      logger.debug(
        `Component ${componentName} unmounted after ${mountDuration}ms`
      )
    }
  }, [componentName])

  const logComponentError = useCallback(
    (error: Error, context?: any) => {
      monitoring.reportError(error, {
        component: componentName,
        ...context,
      })
    },
    [componentName]
  )

  const logComponentAction = useCallback(
    (action: string, data?: any) => {
      monitoring.addBreadcrumb({
        message: `${componentName}: ${action}`,
        category: 'component_action',
        data,
      })

      logger.debug(`${componentName} action: ${action}`, data)
    },
    [componentName]
  )

  return { logComponentError, logComponentAction }
}

// API 請求監控 Hook
export function useAPIMonitoring() {
  const trackAPICall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      endpoint: string,
      method: string = 'GET'
    ): Promise<T> => {
      const startTime = performance.now()

      monitoring.addBreadcrumb({
        message: `API call started: ${method} ${endpoint}`,
        category: 'api_call',
      })

      try {
        const result = await apiCall()
        const duration = performance.now() - startTime

        monitoring.recordMetric({
          type: 'custom',
          name: 'api_call_success',
          value: duration,
          unit: 'ms',
          metadata: {
            endpoint,
            method,
            status: 'success',
          },
        })

        monitoring.addBreadcrumb({
          message: `API call completed: ${method} ${endpoint} (${duration.toFixed(2)}ms)`,
          category: 'api_call',
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        monitoring.recordMetric({
          type: 'custom',
          name: 'api_call_error',
          value: duration,
          unit: 'ms',
          metadata: {
            endpoint,
            method,
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          },
        })

        monitoring.reportError(
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'APICall',
            endpoint,
            method,
            duration,
          }
        )

        throw error
      }
    },
    []
  )

  return { trackAPICall }
}

// 表單提交監控 Hook
export function useFormMonitoring(formName: string) {
  const [submissionCount, setSubmissionCount] = useState(0)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const trackFormStart = useCallback(() => {
    monitoring.addBreadcrumb({
      message: `Form interaction started: ${formName}`,
      category: 'form_interaction',
    })

    monitoring.recordMetric({
      type: 'custom',
      name: 'form_start',
      value: 1,
      unit: 'count',
      metadata: { formName },
    })
  }, [formName])

  const trackFormSubmission = useCallback(
    (success: boolean, validationErrors?: Record<string, string[]>) => {
      setSubmissionCount(prev => prev + 1)

      if (validationErrors) {
        setErrors(validationErrors)
      }

      const status = success ? 'success' : 'error'

      monitoring.addBreadcrumb({
        message: `Form submission ${status}: ${formName}`,
        category: 'form_interaction',
        data: { success, errors: validationErrors },
      })

      monitoring.recordMetric({
        type: 'custom',
        name: `form_submission_${status}`,
        value: 1,
        unit: 'count',
        metadata: {
          formName,
          attemptNumber: submissionCount + 1,
          errorCount: validationErrors
            ? Object.keys(validationErrors).length
            : 0,
        },
      })

      if (!success && validationErrors) {
        logger.warn(`Form validation failed: ${formName}`, validationErrors, {
          component: 'FormValidation',
          formName,
        })
      }
    },
    [formName, submissionCount]
  )

  const trackFieldError = useCallback(
    (fieldName: string, error: string) => {
      monitoring.addBreadcrumb({
        message: `Form field error: ${formName}.${fieldName}`,
        category: 'form_validation',
        data: { fieldName, error },
      })

      monitoring.recordMetric({
        type: 'custom',
        name: 'form_field_error',
        value: 1,
        unit: 'count',
        metadata: {
          formName,
          fieldName,
          error,
        },
      })
    },
    [formName]
  )

  return {
    submissionCount,
    errors,
    trackFormStart,
    trackFormSubmission,
    trackFieldError,
  }
}

// 實時告警 Hook
export function useRealTimeAlerts() {
  const [alerts, setAlerts] = useState<
    Array<{
      id: string
      type: string
      message: string
      severity: 'info' | 'warning' | 'error'
      timestamp: number
    }>
  >([])

  const addAlert = useCallback(
    (alert: {
      type: string
      message: string
      severity: 'info' | 'warning' | 'error'
    }) => {
      const newAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...alert,
      }

      setAlerts(prev => [...prev, newAlert])

      // 記錄到監控系統
      if (alert.severity === 'error') {
        logger.error(`Alert: ${alert.message}`, alert, {
          component: 'RealTimeAlerts',
          alertType: alert.type,
        })
      } else if (alert.severity === 'warning') {
        logger.warn(`Alert: ${alert.message}`, alert, {
          component: 'RealTimeAlerts',
          alertType: alert.type,
        })
      } else {
        logger.info(`Alert: ${alert.message}`, alert, {
          component: 'RealTimeAlerts',
          alertType: alert.type,
        })
      }

      // 自動清除舊告警
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== newAlert.id))
      }, 10000) // 10 秒後自動清除
    },
    []
  )

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return {
    alerts,
    addAlert,
    clearAlert,
    clearAllAlerts,
  }
}

// 用戶會話監控 Hook
export function useSessionMonitoring() {
  const sessionStartRef = useRef<number>()
  const lastActivityRef = useRef<number>()

  useEffect(() => {
    sessionStartRef.current = Date.now()
    lastActivityRef.current = Date.now()

    const trackActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // 監聽用戶活動
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true })
    })

    // 定期檢查會話狀態
    const checkSession = () => {
      const now = Date.now()
      const sessionDuration = sessionStartRef.current
        ? now - sessionStartRef.current
        : 0
      const inactiveDuration = lastActivityRef.current
        ? now - lastActivityRef.current
        : 0

      monitoring.recordMetric({
        type: 'custom',
        name: 'session_duration',
        value: sessionDuration,
        unit: 'ms',
      })

      if (inactiveDuration > 30 * 60 * 1000) {
        // 30 分鐘無活動
        monitoring.addBreadcrumb({
          message: 'User session inactive for 30 minutes',
          category: 'session_management',
        })
      }
    }

    const sessionInterval = setInterval(checkSession, 60000) // 每分鐘檢查

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity)
      })
      clearInterval(sessionInterval)

      // 記錄會話結束
      const sessionDuration = sessionStartRef.current
        ? Date.now() - sessionStartRef.current
        : 0
      monitoring.recordMetric({
        type: 'custom',
        name: 'session_end',
        value: sessionDuration,
        unit: 'ms',
      })
    }
  }, [])

  const getSessionInfo = useCallback(() => {
    const now = Date.now()
    return {
      duration: sessionStartRef.current ? now - sessionStartRef.current : 0,
      lastActivity: lastActivityRef.current ? now - lastActivityRef.current : 0,
    }
  }, [])

  return { getSessionInfo }
}
