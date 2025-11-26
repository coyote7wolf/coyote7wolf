/**
 * Enhanced Lazy Loading Components
 *
 * Provides advanced lazy loading capabilities for various components
 * including images, videos, and heavy content sections.
 */

'use client'

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import '@/styles/lazy-load.css'

interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  fallback?: ReactNode
  skeleton?: ReactNode
  onEnterViewport?: () => void
  onExitViewport?: () => void
}

/**
 * Hook for implementing intersection observer based lazy loading
 */
export function useLazyLoad({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  onEnterViewport,
  onExitViewport,
}: LazyLoadOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) return

        const isCurrentlyIntersecting = entry.isIntersecting

        setIsIntersecting(isCurrentlyIntersecting)

        if (isCurrentlyIntersecting) {
          setHasIntersected(true)
          onEnterViewport?.()

          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          onExitViewport?.()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce, onEnterViewport, onExitViewport])

  return {
    ref: setRef,
    isIntersecting,
    hasIntersected,
    shouldLoad: triggerOnce ? hasIntersected : isIntersecting,
  }
}

/**
 * Generic Lazy Load Container Component
 */
interface LazyContainerProps extends LazyLoadOptions {
  children: ReactNode
  className?: string
  height?: string | number
  width?: string | number
}

export function LazyContainer({
  children,
  className = '',
  height,
  width,
  skeleton,
  fallback,
  ...lazyOptions
}: LazyContainerProps) {
  const { ref, shouldLoad } = useLazyLoad(lazyOptions)

  if (!shouldLoad) {
    return (
      <div ref={ref} className={`lazy-container ${className}`}>
        {skeleton || fallback || (
          <div className="bg-gray-200 animate-pulse rounded w-full h-full" />
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/**
 * Lazy Video Component
 */
interface LazyVideoProps extends LazyLoadOptions {
  src: string
  poster?: string
  className?: string
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  width?: string | number
  height?: string | number
}

export function LazyVideo({
  src,
  poster,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  width,
  height,
  skeleton,
  ...lazyOptions
}: LazyVideoProps) {
  const { ref, shouldLoad } = useLazyLoad(lazyOptions)

  if (!shouldLoad) {
    const videoSkeleton = skeleton || (
      <div className="bg-gray-200 animate-pulse rounded flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16v-6a2 2 0 012-2h2a2 2 0 012 2v6M12 18h0"
          />
        </svg>
      </div>
    )

    return (
      <div ref={ref} className={`lazy-skeleton-video ${className}`}>
        {videoSkeleton}
      </div>
    )
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      width={width}
      height={height}
    />
  )
}

/**
 * Lazy Iframe Component
 */
interface LazyIframeProps extends LazyLoadOptions {
  src: string
  title: string
  className?: string
  width?: string | number
  height?: string | number
  allowFullScreen?: boolean
  sandbox?: string
}

export function LazyIframe({
  src,
  title,
  className = '',
  width,
  height,
  allowFullScreen = false,
  sandbox,
  skeleton,
  ...lazyOptions
}: LazyIframeProps) {
  const { ref, shouldLoad } = useLazyLoad(lazyOptions)

  if (!shouldLoad) {
    const iframeSkeleton = skeleton || (
      <div className="bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">Loading content...</p>
        </div>
      </div>
    )

    return (
      <div ref={ref} className={`lazy-skeleton-iframe ${className}`}>
        {iframeSkeleton}
      </div>
    )
  }

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      className={className}
      width={width}
      height={height}
      allowFullScreen={allowFullScreen}
      sandbox={sandbox}
    />
  )
}

/**
 * Lazy Component Loader for dynamic imports
 */
interface LazyComponentProps extends LazyLoadOptions {
  importComponent: () => Promise<{ default: React.ComponentType<any> }>
  componentProps?: any
  className?: string
  errorFallback?: ReactNode
}

export function LazyComponent({
  importComponent,
  componentProps = {},
  className = '',
  skeleton,
  errorFallback,
  ...lazyOptions
}: LazyComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(
    null
  )
  const [error, setError] = useState<Error | null>(null)
  const { ref, shouldLoad } = useLazyLoad(lazyOptions)

  useEffect(() => {
    if (!shouldLoad) return

    importComponent()
      .then(module => {
        setComponent(() => module.default)
      })
      .catch(err => {
        setError(err)
        console.error('Failed to load lazy component:', err)
      })
  }, [shouldLoad, importComponent])

  if (!shouldLoad) {
    const componentSkeleton = skeleton || (
      <div className="bg-gray-50 rounded p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )

    return (
      <div ref={ref} className={className}>
        {componentSkeleton}
      </div>
    )
  }

  if (error) {
    return (
      <div ref={ref} className={className}>
        {errorFallback || (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            <p>Failed to load component</p>
          </div>
        )}
      </div>
    )
  }

  if (!Component) {
    return (
      <div ref={ref} className={className}>
        {skeleton || (
          <div className="bg-gray-50 rounded p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      <Component {...componentProps} />
    </div>
  )
}

/**
 * Lazy List Component for virtualizing long lists
 */
interface LazyListProps<T> extends LazyLoadOptions {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemHeight?: number
  className?: string
  batchSize?: number
}

export function LazyList<T>({
  items,
  renderItem,
  itemHeight = 60,
  className = '',
  batchSize = 10,
  skeleton,
  ...lazyOptions
}: LazyListProps<T>) {
  const [loadedItems, setLoadedItems] = useState<T[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  const { ref, shouldLoad } = useLazyLoad({
    ...lazyOptions,
    triggerOnce: false,
    onEnterViewport: () => {
      if (loadedItems.length < items.length && !loadingMore) {
        loadMoreItems()
      }
    },
  })

  const loadMoreItems = useCallback(() => {
    setLoadingMore(true)

    // Simulate async loading
    setTimeout(() => {
      const currentLength = loadedItems.length
      const nextBatch = items.slice(currentLength, currentLength + batchSize)
      setLoadedItems(prev => [...prev, ...nextBatch])
      setLoadingMore(false)
    }, 100)
  }, [items, loadedItems.length, batchSize])

  useEffect(() => {
    if (items.length > 0 && loadedItems.length === 0) {
      const initialBatch = items.slice(0, batchSize)
      setLoadedItems(initialBatch)
    }
  }, [items, batchSize, loadedItems.length])

  return (
    <div className={className}>
      {loadedItems.map((item, index) => (
        <div key={index} className="lazy-list-item">
          {renderItem(item, index)}
        </div>
      ))}

      {loadedItems.length < items.length && (
        <div ref={ref} className="py-4">
          {loadingMore ? (
            skeleton || (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )
          ) : (
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          )}
        </div>
      )}
    </div>
  )
}

export default useLazyLoad
