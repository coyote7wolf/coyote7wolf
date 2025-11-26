/**
 * Analytics Hook
 *
 * React hook for integrating analytics tracking with components,
 * providing easy-to-use functions for event tracking and monitoring.
 */

'use client'

import React, { useEffect, useCallback, useRef } from 'react'
import analyticsService, {
  UserEvent,
  PerformanceMetrics,
  Alert,
  AnalyticsSummary,
} from '@/services/analytics'

export interface UseAnalyticsOptions {
  userId: string
  workspaceId?: string
  documentId?: string
  enableAutoTracking?: boolean
  trackPageViews?: boolean
  trackFeatureUsage?: boolean
  trackPerformance?: boolean
}

export interface AnalyticsHookResult {
  // Event tracking
  trackEvent: (
    eventType: UserEvent['eventType'],
    action: string,
    metadata?: Record<string, any>
  ) => string
  trackPageView: (page: string, metadata?: Record<string, any>) => string
  trackDocumentAction: (
    action: string,
    metadata?: Record<string, any>
  ) => string
  trackEditAction: (
    action: 'insert' | 'delete' | 'format' | 'undo' | 'redo',
    metadata?: Record<string, any>
  ) => string
  trackCollaboration: (
    action: 'join' | 'leave' | 'conflict' | 'resolve',
    metadata?: Record<string, any>
  ) => string
  trackFeatureUsage: (
    feature: string,
    action: string,
    duration?: number,
    metadata?: Record<string, any>
  ) => string
  trackPerformance: (
    category: PerformanceMetrics['category'],
    metric: string,
    value: number,
    unit: PerformanceMetrics['unit'],
    metadata?: Record<string, any>
  ) => void

  // Timing utilities
  startTimer: (name: string) => () => void
  measureAsync: <T>(name: string, asyncFn: () => Promise<T>) => Promise<T>
  measureSync: <T>(name: string, syncFn: () => T) => T

  // Data retrieval
  getDashboardData: () => ReturnType<typeof analyticsService.getDashboardData>
  generateSummary: (period?: AnalyticsSummary['period']) => AnalyticsSummary
  getActiveAlerts: () => Alert[]

  // Utilities
  exportData: (startTime?: number, endTime?: number) => string
  acknowledgeAlert: (alertId: string) => boolean
}

export function useAnalytics(
  options: UseAnalyticsOptions
): AnalyticsHookResult {
  const {
    userId,
    workspaceId,
    documentId,
    enableAutoTracking = true,
    trackPageViews = true,
    trackFeatureUsage = true,
    trackPerformance = true,
  } = options

  const timers = useRef<Map<string, number>>(new Map())
  const lastPage = useRef<string>('')

  // Track page views automatically
  useEffect(() => {
    if (!trackPageViews || !enableAutoTracking) return

    const currentPage = window.location.pathname
    if (currentPage !== lastPage.current) {
      analyticsService.trackPageView(userId, currentPage, {
        workspaceId,
        documentId,
        referrer: document.referrer,
      })
      lastPage.current = currentPage
    }
  }, [userId, workspaceId, documentId, trackPageViews, enableAutoTracking])

  // Track performance metrics automatically
  useEffect(() => {
    if (!trackPerformance || !enableAutoTracking) return

    const trackMemoryUsage = () => {
      if (
        typeof window !== 'undefined' &&
        (window as any).performance?.memory
      ) {
        const memory = (window as any).performance.memory
        analyticsService.trackPerformance(
          'ui',
          'memory_used',
          memory.usedJSHeapSize,
          'bytes'
        )
        analyticsService.trackPerformance(
          'ui',
          'memory_total',
          memory.totalJSHeapSize,
          'bytes'
        )
      }
    }

    const trackNetworkSpeed = () => {
      if (typeof navigator !== 'undefined' && (navigator as any).connection) {
        const connection = (navigator as any).connection
        analyticsService.trackPerformance(
          'network',
          'download_speed',
          connection.downlink,
          'count'
        )
        analyticsService.trackPerformance(
          'network',
          'rtt',
          connection.rtt,
          'ms'
        )
      }
    }

    // Initial tracking
    trackMemoryUsage()
    trackNetworkSpeed()

    // Periodic tracking
    const interval = setInterval(() => {
      trackMemoryUsage()
      trackNetworkSpeed()
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [trackPerformance, enableAutoTracking])

  // Event tracking functions
  const trackEvent = useCallback(
    (
      eventType: UserEvent['eventType'],
      action: string,
      metadata?: Record<string, any>
    ): string => {
      return analyticsService.trackEvent({
        userId,
        eventType,
        action,
        ...(workspaceId && { workspaceId }),
        ...(documentId && { documentId }),
        metadata: metadata || {},
      })
    },
    [userId, workspaceId, documentId]
  )

  const trackPageView = useCallback(
    (page: string, metadata?: Record<string, any>): string => {
      return analyticsService.trackPageView(userId, page, {
        workspaceId,
        documentId,
        ...metadata,
      })
    },
    [userId, workspaceId, documentId]
  )

  const trackDocumentAction = useCallback(
    (action: string, metadata?: Record<string, any>): string => {
      if (!documentId) {
        console.warn('trackDocumentAction called without documentId')
        return ''
      }

      return analyticsService.trackDocumentAction(userId, documentId, action, {
        workspaceId,
        ...metadata,
      })
    },
    [userId, documentId, workspaceId]
  )

  const trackEditAction = useCallback(
    (
      action: 'insert' | 'delete' | 'format' | 'undo' | 'redo',
      metadata?: Record<string, any>
    ): string => {
      if (!documentId) {
        console.warn('trackEditAction called without documentId')
        return ''
      }

      return analyticsService.trackEditAction(userId, documentId, action, {
        workspaceId,
        ...metadata,
      })
    },
    [userId, documentId, workspaceId]
  )

  const trackCollaboration = useCallback(
    (
      action: 'join' | 'leave' | 'conflict' | 'resolve',
      metadata?: Record<string, any>
    ): string => {
      if (!documentId) {
        console.warn('trackCollaboration called without documentId')
        return ''
      }

      return analyticsService.trackCollaboration(userId, documentId, action, {
        workspaceId,
        ...metadata,
      })
    },
    [userId, documentId, workspaceId]
  )

  const trackFeatureUsageCallback = useCallback(
    (
      feature: string,
      action: string,
      duration?: number,
      metadata?: Record<string, any>
    ): string => {
      return analyticsService.trackFeatureUsage(
        userId,
        feature,
        action,
        duration,
        {
          workspaceId,
          documentId,
          ...metadata,
        }
      )
    },
    [userId, workspaceId, documentId]
  )

  const trackPerformanceCallback = useCallback(
    (
      category: PerformanceMetrics['category'],
      metric: string,
      value: number,
      unit: PerformanceMetrics['unit'],
      metadata?: Record<string, any>
    ): void => {
      analyticsService.trackPerformance(category, metric, value, unit, {
        userId,
        workspaceId,
        documentId,
        ...metadata,
      })
    },
    [userId, workspaceId, documentId]
  )

  // Timing utilities
  const startTimer = useCallback(
    (name: string) => {
      const startTime = performance.now()
      timers.current.set(name, startTime)

      return () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        timers.current.delete(name)

        trackPerformanceCallback('ui', name, duration, 'ms', {
          operation: 'timer',
        })

        return duration
      }
    },
    [trackPerformanceCallback]
  )

  const measureAsync = useCallback(
    async <T>(name: string, asyncFn: () => Promise<T>): Promise<T> => {
      const startTime = performance.now()

      try {
        const result = await asyncFn()
        const duration = performance.now() - startTime

        trackPerformanceCallback('ui', name, duration, 'ms', {
          operation: 'async',
          success: true,
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        trackPerformanceCallback('ui', name, duration, 'ms', {
          operation: 'async',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        throw error
      }
    },
    [trackPerformanceCallback]
  )

  const measureSync = useCallback(
    <T>(name: string, syncFn: () => T): T => {
      const startTime = performance.now()

      try {
        const result = syncFn()
        const duration = performance.now() - startTime

        trackPerformanceCallback('ui', name, duration, 'ms', {
          operation: 'sync',
          success: true,
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        trackPerformanceCallback('ui', name, duration, 'ms', {
          operation: 'sync',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        throw error
      }
    },
    [trackPerformanceCallback]
  )

  // Data retrieval functions
  const getDashboardData = useCallback(() => {
    return analyticsService.getDashboardData()
  }, [])

  const generateSummary = useCallback((period?: AnalyticsSummary['period']) => {
    return analyticsService.generateSummary(period)
  }, [])

  const getActiveAlerts = useCallback(() => {
    return analyticsService.getActiveAlerts()
  }, [])

  // Utility functions
  const exportData = useCallback((startTime?: number, endTime?: number) => {
    return analyticsService.exportData(startTime, endTime)
  }, [])

  const acknowledgeAlert = useCallback((alertId: string) => {
    return analyticsService.acknowledgeAlert(alertId)
  }, [])

  return {
    // Event tracking
    trackEvent,
    trackPageView,
    trackDocumentAction,
    trackEditAction,
    trackCollaboration,
    trackFeatureUsage: trackFeatureUsageCallback,
    trackPerformance: trackPerformanceCallback,

    // Timing utilities
    startTimer,
    measureAsync,
    measureSync,

    // Data retrieval
    getDashboardData,
    generateSummary,
    getActiveAlerts,

    // Utilities
    exportData,
    acknowledgeAlert,
  }
}

// Higher-order component for automatic feature usage tracking
export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string,
  options?: {
    trackMount?: boolean
    trackUnmount?: boolean
    trackProps?: boolean
  }
) {
  const {
    trackMount = true,
    trackUnmount = false,
    trackProps = false,
  } = options || {}

  return function AnalyticsWrapper(props: P & { userId?: string }) {
    const { userId = 'anonymous', ...componentProps } = props

    const analytics = useAnalytics({
      userId,
      enableAutoTracking: true,
    })

    useEffect(() => {
      if (trackMount) {
        analytics.trackFeatureUsage(featureName, 'mount', undefined, {
          component: WrappedComponent.displayName || WrappedComponent.name,
          props: trackProps ? componentProps : undefined,
        })
      }

      return () => {
        if (trackUnmount) {
          analytics.trackFeatureUsage(featureName, 'unmount', undefined, {
            component: WrappedComponent.displayName || WrappedComponent.name,
          })
        }
      }
    }, [analytics, componentProps])

    return React.createElement(WrappedComponent, componentProps as P)
  }
}

export default useAnalytics
