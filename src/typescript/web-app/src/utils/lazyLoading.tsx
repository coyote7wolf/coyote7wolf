/**
 * Lazy Loading and Code Splitting Utilities
 * Optimized component loading with suspense and error boundaries
 */

'use client'

import React, {
  Suspense,
  lazy,
  ComponentType,
  LazyExoticComponent,
} from 'react'
import { usePerformance } from '@/contexts/PerformanceContext'

// Types
interface LazyComponentOptions {
  fallback?: React.ComponentType
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  loadingText?: string
  delay?: number
  preload?: boolean
  chunkName?: string
}

interface IntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

// Default loading component
const DefaultLoadingFallback: React.FC<{ text?: string }> = ({
  text = 'Loading...',
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">{text}</span>
  </div>
)

// Default error boundary
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-red-600 mb-4">
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
    <p className="text-red-800 font-medium mb-2">Failed to load component</p>
    <p className="text-red-600 text-sm mb-4">{error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Retry
    </button>
  </div>
)

// Error boundary for lazy components
class LazyErrorBoundary extends React.Component<
  {
    fallback: React.ComponentType<{ error: Error; retry: () => void }>
    children: React.ReactNode
    onError?: (error: Error) => void
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
    this.props.onError?.(error)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorComponent = this.props.fallback
      return <ErrorComponent error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

// Create a lazy component with enhanced options
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<ComponentType<P>> {
  const {
    fallback: LoadingComponent = DefaultLoadingFallback,
    errorFallback: ErrorComponent = DefaultErrorFallback,
    loadingText = 'Loading component...',
    delay = 200,
    preload = false,
    chunkName,
  } = options

  let importPromise: Promise<{ default: ComponentType<P> }> | null = null

  // Enhanced import function with retry logic
  const enhancedImportFn = async () => {
    try {
      if (importPromise) {
        return await importPromise
      }

      importPromise = importFn()
      const result = await importPromise

      // Reset promise on successful load
      importPromise = null
      return result
    } catch (error) {
      // Reset promise on error to allow retry
      importPromise = null
      throw error
    }
  }

  const LazyComponent = lazy(enhancedImportFn)

  // Preload the component if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      enhancedImportFn().catch(() => {
        // Ignore preload errors
      })
    }, 100)
  }

  // Return wrapped component with suspense and error boundary
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <LazyErrorBoundary fallback={ErrorComponent}>
      <Suspense
        fallback={
          <DelayedLoader delay={delay}>
            <LoadingComponent text={loadingText} />
          </DelayedLoader>
        }
      >
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </LazyErrorBoundary>
  ))

  // Add preload method to the component
  ;(WrappedComponent as any).preload = () => enhancedImportFn()

  return WrappedComponent as LazyExoticComponent<ComponentType<P>>
}

// Delayed loader to prevent flash of loading state
const DelayedLoader: React.FC<{ delay: number; children: React.ReactNode }> = ({
  delay,
  children,
}) => {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return show ? <>{children}</> : null
}

// Hook for intersection observer-based lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverOptions = {},
  callback?: (entry: IntersectionObserverEntry) => void
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) return

        const isCurrentlyIntersecting = entry.isIntersecting
        setIsIntersecting(isCurrentlyIntersecting)

        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }

        callback?.(entry)
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, callback, hasIntersected, options])

  return { isIntersecting, hasIntersected }
}

// Lazy image component with intersection observer
export const LazyImage: React.FC<{
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}> = ({ src, alt, className, placeholder, onLoad, onError }) => {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const { hasIntersected } = useIntersectionObserver(imgRef)

  React.useEffect(() => {
    if (hasIntersected && !loaded && !error) {
      const img = new Image()
      img.onload = () => {
        setLoaded(true)
        onLoad?.()
      }
      img.onerror = () => {
        setError(true)
        onError?.()
      }
      img.src = src
    }
  }, [hasIntersected, loaded, error, src, onLoad, onError])

  return (
    <div ref={imgRef} className={`relative ${className || ''}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded">
          {placeholder && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {placeholder}
            </div>
          )}
        </div>
      )}
      {loaded && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
        />
      )}
      {error && (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

// Route-based code splitting helper
export function createLazyRoute<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  routeName: string
) {
  return createLazyComponent(importFn, {
    loadingText: `Loading ${routeName}...`,
    chunkName: routeName.toLowerCase().replace(/\s+/g, '-'),
    preload: false,
    delay: 300,
  })
}

// Bundle analyzer component (development only)
export const BundleAnalyzer: React.FC = () => {
  const { state } = usePerformance()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border max-w-sm">
      <h4 className="font-semibold text-sm mb-2">Bundle Analysis</h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Bundle Size:</span>
          <span>{state.metrics.runtime.bundleSize.toFixed(1)} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Memory Usage:</span>
          <span>{state.metrics.runtime.memoryUsage.toFixed(1)} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Cache Hit Rate:</span>
          <span>{state.metrics.runtime.cacheHitRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

// Performance-aware component wrapper
export function withPerformanceOptimization<P extends object>(
  Component: ComponentType<P>,
  options: {
    lazy?: boolean
    memoize?: boolean
    trackRenders?: boolean
    preload?: boolean
  } = {}
) {
  const {
    lazy: isLazy = false,
    memoize = true,
    trackRenders = false,
    preload = false,
  } = options

  let OptimizedComponent: any = Component

  if (isLazy) {
    // Create lazy version
    OptimizedComponent = createLazyComponent(
      () => Promise.resolve({ default: Component }),
      { preload }
    )
  }

  if (memoize && !isLazy) {
    OptimizedComponent = React.memo(OptimizedComponent)
  }

  if (trackRenders) {
    const WrappedComponent = (props: P) => {
      const { actions } = usePerformance()
      const renderStart = React.useRef(performance.now())

      React.useEffect(() => {
        const renderTime = performance.now() - renderStart.current
        actions.updateMetrics({
          runtime: {
            renderTime,
            memoryUsage: 0,
            bundleSize: 0,
            cacheHitRate: 0,
            apiResponseTime: 0,
            wsLatency: 0,
          },
        })
      })

      return <OptimizedComponent {...props} />
    }

    OptimizedComponent = WrappedComponent
  }

  return OptimizedComponent
}

// Preload utility for critical resources
export function preloadResources(
  resources: Array<{
    href: string
    as: 'script' | 'style' | 'font' | 'image' | 'fetch'
    type?: string
    crossorigin?: 'anonymous' | 'use-credentials'
  }>
) {
  if (typeof window === 'undefined') return

  resources.forEach(({ href, as, type, crossorigin }) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    if (crossorigin) link.crossOrigin = crossorigin

    document.head.appendChild(link)
  })
}

export default {
  createLazyComponent,
  createLazyRoute,
  LazyImage,
  BundleAnalyzer,
  withPerformanceOptimization,
  preloadResources,
  useIntersectionObserver,
}
