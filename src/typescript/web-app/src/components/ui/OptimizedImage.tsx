/**
 * Optimized Image Component
 *
 * Enhanced Next.js Image component with automatic optimization,
 * WebP/AVIF support, lazy loading, and responsive sizing.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import NextImage, { ImageProps as NextImageProps } from 'next/image'
import {
  useImageOptimization,
  IMAGE_PRESETS,
  calculateImageSizes,
} from '@/utils/imageOptimization'
import '@/styles/optimized-image.css'

export interface OptimizedImageProps
  extends Omit<NextImageProps, 'loader' | 'onLoadingComplete'> {
  preset?: keyof typeof IMAGE_PRESETS
  showPlaceholder?: boolean
  fallbackSrc?: string
  containerWidth?: number
  onLoadingComplete?: (naturalWidth: number, naturalHeight: number) => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  preset,
  showPlaceholder = true,
  fallbackSrc,
  containerWidth = 800,
  quality = 75,
  priority = false,
  sizes,
  className = '',
  onLoadingComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageSrc, setImageSrc] = useState(src)

  const { getOptimalFormat, isWebPSupported, isAVIFSupported } =
    useImageOptimization()

  // Apply preset configurations
  const presetConfig = preset ? IMAGE_PRESETS[preset] : null
  const appliedQuality = presetConfig?.quality
    ? Math.round(presetConfig.quality * 100)
    : quality
  const appliedSizes =
    sizes || presetConfig?.sizes || calculateImageSizes(containerWidth)
  const appliedPriority =
    priority ||
    (presetConfig && 'priority' in presetConfig
      ? presetConfig.priority
      : false) ||
    false

  // Handle image loading states
  const handleLoadingComplete = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const target = event.target as HTMLImageElement
      setIsLoading(false)
      onLoadingComplete?.(target.naturalWidth, target.naturalHeight)
    },
    [onLoadingComplete]
  )

  const handleError = useCallback(() => {
    setImageError(true)
    setIsLoading(false)

    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setImageError(false)
      setIsLoading(true)
    } else {
      onError?.()
    }
  }, [fallbackSrc, imageSrc, onError])

  // Custom image loader with format optimization
  const customLoader = useCallback(
    ({
      src,
      width,
      quality = 75,
    }: {
      src: string
      width: number
      quality?: number
    }) => {
      const url = new URL(src, window.location.origin)
      url.searchParams.set('w', width.toString())
      url.searchParams.set('q', quality.toString())

      // Add optimal format if supported
      if (isAVIFSupported) {
        url.searchParams.set('f', 'avif')
      } else if (isWebPSupported) {
        url.searchParams.set('f', 'webp')
      }

      return url.toString()
    },
    [isAVIFSupported, isWebPSupported]
  )

  // Placeholder component
  const Placeholder = () => (
    <div
      className={`
        bg-gray-200 animate-pulse flex items-center justify-center
        image-placeholder
        ${className}
      `}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    </div>
  )

  // Error component
  const ErrorFallback = () => (
    <div
      className={`
        bg-gray-100 border-2 border-dashed border-gray-300 
        flex items-center justify-center text-gray-500
        image-error-fallback
        ${className}
      `}
    >
      <div className="text-center">
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-xs">Failed to load image</p>
      </div>
    </div>
  )

  if (imageError && !fallbackSrc) {
    return <ErrorFallback />
  }

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 z-10">
          <Placeholder />
        </div>
      )}

      {/* Optimized image */}
      <NextImage
        src={imageSrc}
        alt={alt}
        quality={appliedQuality}
        priority={appliedPriority}
        sizes={appliedSizes}
        loader={customLoader}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${className}
        `}
        onLoad={handleLoadingComplete}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

/**
 * Lazy Image Component with Intersection Observer
 */
export function LazyImage({
  src,
  alt,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: OptimizedImageProps & {
  threshold?: number
  rootMargin?: string
}) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!imageRef || shouldLoad) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(imageRef)

    return () => observer.disconnect()
  }, [imageRef, shouldLoad, threshold, rootMargin])

  return (
    <div ref={setImageRef}>
      {shouldLoad ? (
        <OptimizedImage src={src} alt={alt} {...props} />
      ) : (
        <div className={`bg-gray-200 aspect-video ${props.className || ''}`} />
      )}
    </div>
  )
}

/**
 * Gallery Image Component with progressive loading
 */
export function GalleryImage({
  src,
  alt,
  blurDataURL,
  ...props
}: OptimizedImageProps & {
  blurDataURL?: string
}) {
  const imageProps: OptimizedImageProps = {
    src,
    alt,
    preset: 'gallery',
    placeholder: blurDataURL ? 'blur' : 'empty',
    ...props,
  }

  if (blurDataURL) {
    imageProps.blurDataURL = blurDataURL
  }

  return <OptimizedImage {...imageProps} />
}

/**
 * Hero Image Component for large banner images
 */
export function HeroImage({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      preset="hero"
      priority={true}
      {...props}
    />
  )
}

/**
 * Avatar Image Component for profile pictures
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  ...props
}: OptimizedImageProps & {
  size?: number
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      preset="thumbnail"
      className={`rounded-full ${props.className || ''}`}
      {...props}
    />
  )
}

export default OptimizedImage
