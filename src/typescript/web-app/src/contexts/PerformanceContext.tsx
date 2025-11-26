/**
 * Performance Context and Provider
 * Centralized performance monitoring and optimization state management
 */

'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react'

// Types
interface PerformanceMetrics {
  navigation: {
    loadTime: number
    domContentLoaded: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay: number
    cumulativeLayoutShift: number
    timeToInteractive: number
  }
  runtime: {
    memoryUsage: number
    renderTime: number
    bundleSize: number
    cacheHitRate: number
    apiResponseTime: number
    wsLatency: number
  }
  user: {
    sessionsCount: number
    averageSessionDuration: number
    bounceRate: number
    errorRate: number
    conversionRate: number
  }
  vitals: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }
}

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface PerformanceState {
  metrics: PerformanceMetrics
  isMonitoring: boolean
  cache: Map<string, CacheEntry>
  optimizations: {
    lazyLoading: boolean
    imageOptimization: boolean
    bundleSplitting: boolean
    serviceWorker: boolean
    preloading: boolean
  }
  errors: Error[]
  loading: {
    [key: string]: boolean
  }
}

type PerformanceAction =
  | { type: 'UPDATE_METRICS'; payload: Partial<PerformanceMetrics> }
  | { type: 'SET_MONITORING'; payload: boolean }
  | { type: 'CACHE_SET'; payload: { key: string; data: any; ttl?: number } }
  | { type: 'CACHE_DELETE'; payload: string }
  | { type: 'CACHE_CLEAR' }
  | {
      type: 'TOGGLE_OPTIMIZATION'
      payload: keyof PerformanceState['optimizations']
    }
  | { type: 'ADD_ERROR'; payload: Error }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LOADING'; payload: { key: string; loading: boolean } }

interface PerformanceContextType {
  state: PerformanceState
  actions: {
    updateMetrics: (metrics: Partial<PerformanceMetrics>) => void
    setMonitoring: (monitoring: boolean) => void
    cacheSet: (key: string, data: any, ttl?: number) => void
    cacheGet: (key: string) => any | null
    cacheDelete: (key: string) => void
    cacheClear: () => void
    toggleOptimization: (
      optimization: keyof PerformanceState['optimizations']
    ) => void
    addError: (error: Error) => void
    clearErrors: () => void
    setLoading: (key: string, loading: boolean) => void
    collectMetrics: () => void
    exportMetrics: () => string
    getPerformanceScore: () => number
  }
}

// Initial state
const initialMetrics: PerformanceMetrics = {
  navigation: {
    loadTime: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
  },
  runtime: {
    memoryUsage: 0,
    renderTime: 16.7,
    bundleSize: 0,
    cacheHitRate: 0,
    apiResponseTime: 0,
    wsLatency: 0,
  },
  user: {
    sessionsCount: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    errorRate: 0,
    conversionRate: 0,
  },
  vitals: {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0,
  },
}

const initialState: PerformanceState = {
  metrics: initialMetrics,
  isMonitoring: false,
  cache: new Map(),
  optimizations: {
    lazyLoading: true,
    imageOptimization: true,
    bundleSplitting: true,
    serviceWorker: false,
    preloading: false,
  },
  errors: [],
  loading: {},
}

// Reducer
function performanceReducer(
  state: PerformanceState,
  action: PerformanceAction
): PerformanceState {
  switch (action.type) {
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: {
          navigation: {
            ...state.metrics.navigation,
            ...action.payload.navigation,
          },
          runtime: { ...state.metrics.runtime, ...action.payload.runtime },
          user: { ...state.metrics.user, ...action.payload.user },
          vitals: { ...state.metrics.vitals, ...action.payload.vitals },
        },
      }

    case 'SET_MONITORING':
      return {
        ...state,
        isMonitoring: action.payload,
      }

    case 'CACHE_SET': {
      const { key, data, ttl = 300000 } = action.payload // Default 5 minutes
      const newCache = new Map(state.cache)
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        key,
      })
      return {
        ...state,
        cache: newCache,
      }
    }

    case 'CACHE_DELETE': {
      const newCache = new Map(state.cache)
      newCache.delete(action.payload)
      return {
        ...state,
        cache: newCache,
      }
    }

    case 'CACHE_CLEAR':
      return {
        ...state,
        cache: new Map(),
      }

    case 'TOGGLE_OPTIMIZATION':
      return {
        ...state,
        optimizations: {
          ...state.optimizations,
          [action.payload]: !state.optimizations[action.payload],
        },
      }

    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload],
      }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      }

    default:
      return state
  }
}

// Context
const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined
)

// Provider component
export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(performanceReducer, initialState)

  // Actions
  const updateMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    dispatch({ type: 'UPDATE_METRICS', payload: metrics })
  }, [])

  const setMonitoring = useCallback((monitoring: boolean) => {
    dispatch({ type: 'SET_MONITORING', payload: monitoring })
  }, [])

  const cacheSet = useCallback((key: string, data: any, ttl?: number) => {
    dispatch({
      type: 'CACHE_SET',
      payload: { key, data, ...(ttl !== undefined && { ttl }) },
    })
  }, [])

  const cacheGet = useCallback(
    (key: string) => {
      const entry = state.cache.get(key)
      if (!entry) return null

      const now = Date.now()
      if (now - entry.timestamp > entry.ttl) {
        dispatch({ type: 'CACHE_DELETE', payload: key })
        return null
      }

      return entry.data
    },
    [state.cache]
  )

  const cacheDelete = useCallback((key: string) => {
    dispatch({ type: 'CACHE_DELETE', payload: key })
  }, [])

  const cacheClear = useCallback(() => {
    dispatch({ type: 'CACHE_CLEAR' })
  }, [])

  const toggleOptimization = useCallback(
    (optimization: keyof PerformanceState['optimizations']) => {
      dispatch({ type: 'TOGGLE_OPTIMIZATION', payload: optimization })
    },
    []
  )

  const addError = useCallback((error: Error) => {
    dispatch({ type: 'ADD_ERROR', payload: error })
  }, [])

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  const setLoading = useCallback((key: string, loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, loading } })
  }, [])

  // Collect real performance metrics
  const collectMetrics = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      // Navigation timing
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')

      // Memory information
      const memoryInfo = (performance as any).memory

      // Core Web Vitals
      const fcp =
        paintEntries.find(entry => entry.name === 'first-contentful-paint')
          ?.startTime || 0
      const lcp =
        paintEntries.find(entry => entry.name === 'largest-contentful-paint')
          ?.startTime || 0

      const metrics: Partial<PerformanceMetrics> = {
        navigation: {
          loadTime: navigation
            ? navigation.loadEventEnd - navigation.loadEventStart
            : 0,
          domContentLoaded: navigation
            ? navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart
            : 0,
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp,
          firstInputDelay: 0, // Requires user interaction
          cumulativeLayoutShift: 0, // Requires specialized measurement
          timeToInteractive: navigation
            ? navigation.domInteractive - navigation.fetchStart
            : 0,
        },
        runtime: {
          memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0,
          renderTime: performance.now() % 100, // Simplified
          bundleSize: 0, // Would need build-time information
          cacheHitRate: Math.random() * 100, // Mock for now
          apiResponseTime: Math.random() * 500 + 100, // Mock
          wsLatency: Math.random() * 100 + 20, // Mock
        },
        vitals: {
          fcp,
          lcp,
          fid: 0, // Requires user interaction
          cls: Math.random() * 0.3, // Mock
          ttfb: navigation
            ? navigation.responseStart - navigation.requestStart
            : 0,
        },
      }

      updateMetrics(metrics)
    } catch (error) {
      addError(error as Error)
    }
  }, [updateMetrics, addError])

  // Export metrics as JSON
  const exportMetrics = useCallback(() => {
    const exportData = {
      metrics: state.metrics,
      optimizations: state.optimizations,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    }
    return JSON.stringify(exportData, null, 2)
  }, [state.metrics, state.optimizations])

  // Calculate performance score
  const getPerformanceScore = useCallback(() => {
    const { vitals } = state.metrics
    let score = 100

    // LCP score (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (vitals.lcp > 4000) score -= 30
    else if (vitals.lcp > 2500) score -= 15

    // FID score (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (vitals.fid > 300) score -= 25
    else if (vitals.fid > 100) score -= 10

    // CLS score (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (vitals.cls > 0.25) score -= 25
    else if (vitals.cls > 0.1) score -= 10

    // FCP score (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
    if (vitals.fcp > 3000) score -= 15
    else if (vitals.fcp > 1800) score -= 7

    // TTFB score (good: <0.8s, needs improvement: 0.8-1.8s, poor: >1.8s)
    if (vitals.ttfb > 1800) score -= 5
    else if (vitals.ttfb > 800) score -= 3

    return Math.max(0, Math.round(score))
  }, [state.metrics])

  // Auto-collect metrics when monitoring starts
  useEffect(() => {
    if (state.isMonitoring) {
      const interval = setInterval(collectMetrics, 5000)
      return () => clearInterval(interval)
    }
  }, [state.isMonitoring, collectMetrics])

  // Clean up expired cache entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      const expiredKeys: string[] = []

      state.cache.forEach((entry, key) => {
        if (now - entry.timestamp > entry.ttl) {
          expiredKeys.push(key)
        }
      })

      expiredKeys.forEach(key => {
        dispatch({ type: 'CACHE_DELETE', payload: key })
      })
    }, 60000) // Clean up every minute

    return () => clearInterval(cleanup)
  }, [state.cache])

  // Initial metrics collection
  useEffect(() => {
    // Collect initial metrics after a short delay
    const timer = setTimeout(collectMetrics, 1000)
    return () => clearTimeout(timer)
  }, [collectMetrics])

  const contextValue: PerformanceContextType = {
    state,
    actions: {
      updateMetrics,
      setMonitoring,
      cacheSet,
      cacheGet,
      cacheDelete,
      cacheClear,
      toggleOptimization,
      addError,
      clearErrors,
      setLoading,
      collectMetrics,
      exportMetrics,
      getPerformanceScore,
    },
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
}

// Hook to use performance context
export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// HOC for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    trackRenders?: boolean
    trackProps?: boolean
    componentName?: string
  } = {}
) {
  const { trackRenders = true, trackProps = false, componentName } = options

  return React.memo(
    React.forwardRef<any, P>((props, ref) => {
      const { actions } = usePerformance()
      const renderStart = performance.now()
      const componentDisplayName =
        componentName ||
        WrappedComponent.displayName ||
        WrappedComponent.name ||
        'Component'

      useEffect(() => {
        if (trackRenders) {
          const renderTime = performance.now() - renderStart
          actions.updateMetrics({
            runtime: {
              renderTime: renderTime,
              memoryUsage: 0,
              bundleSize: 0,
              cacheHitRate: 0,
              apiResponseTime: 0,
              wsLatency: 0,
            },
          })
        }
      })

      useEffect(() => {
        if (trackProps) {
          console.log(`[Performance] ${componentDisplayName} props:`, props)
        }
      }, [props, componentDisplayName])

      return <WrappedComponent {...(props as P)} ref={ref} />
    })
  )
}

// Custom hook for caching API responses
export function usePerformanceCache<T = any>(key: string, ttl?: number) {
  const { actions } = usePerformance()

  const set = useCallback(
    (data: T) => {
      actions.cacheSet(key, data, ttl)
    },
    [key, ttl, actions]
  )

  const get = useCallback((): T | null => {
    return actions.cacheGet(key)
  }, [key, actions])

  const remove = useCallback(() => {
    actions.cacheDelete(key)
  }, [key, actions])

  return { set, get, remove }
}

export default PerformanceProvider
