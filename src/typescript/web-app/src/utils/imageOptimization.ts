/**
 * Image Optimization Utilities
 *
 * Provides utilities for optimizing images including WebP conversion,
 * responsive image generation, and lazy loading support.
 */

import { useState, useEffect, useCallback } from 'react'

export interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  sizes?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export interface ResponsiveImageSizes {
  small: string
  medium: string
  large: string
  xlarge: string
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  aspectRatio: number
}

/**
 * Hook for managing image optimization
 */
export function useImageOptimization() {
  const [supportedFormats, setSupportedFormats] = useState<string[]>([])
  const [isWebPSupported, setIsWebPSupported] = useState(false)
  const [isAVIFSupported, setIsAVIFSupported] = useState(false)

  useEffect(() => {
    checkFormatSupport()
  }, [])

  const checkFormatSupport = useCallback(async () => {
    const formats: string[] = ['jpeg', 'png']

    // Check WebP support
    const webpSupported = await checkWebPSupport()
    if (webpSupported) {
      formats.push('webp')
      setIsWebPSupported(true)
    }

    // Check AVIF support
    const avifSupported = await checkAVIFSupport()
    if (avifSupported) {
      formats.push('avif')
      setIsAVIFSupported(true)
    }

    setSupportedFormats(formats)
  }, [])

  const checkWebPSupport = useCallback((): Promise<boolean> => {
    return new Promise(resolve => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }, [])

  const checkAVIFSupport = useCallback((): Promise<boolean> => {
    return new Promise(resolve => {
      const avif = new Image()
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2)
      }
      avif.src =
        'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI='
    })
  }, [])

  const getOptimalFormat = useCallback(
    (originalFormat: string): string => {
      if (isAVIFSupported) return 'avif'
      if (isWebPSupported) return 'webp'
      return originalFormat
    },
    [isAVIFSupported, isWebPSupported]
  )

  const generateResponsiveSizes = useCallback(
    (baseWidth: number): ResponsiveImageSizes => {
      return {
        small: `${Math.round(baseWidth * 0.5)}w`,
        medium: `${Math.round(baseWidth * 0.75)}w`,
        large: `${baseWidth}w`,
        xlarge: `${Math.round(baseWidth * 1.5)}w`,
      }
    },
    []
  )

  const getImageMetadata = useCallback((file: File): Promise<ImageMetadata> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        const metadata: ImageMetadata = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: file.type.split('/')[1] || 'unknown',
          size: file.size,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        }

        URL.revokeObjectURL(url)
        resolve(metadata)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  }, [])

  const compressImage = useCallback(
    (file: File, options: ImageOptimizationOptions = {}): Promise<Blob> => {
      const { quality = 0.8, format = 'webp' } = options

      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          ctx?.drawImage(img, 0, 0)

          canvas.toBlob(
            blob => {
              URL.revokeObjectURL(url)
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            `image/${format}`,
            quality
          )
        }

        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to load image'))
        }

        img.src = url
      })
    },
    []
  )

  const generateBlurDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      const url = URL.createObjectURL(file)

      // Small canvas for blur placeholder
      canvas.width = 10
      canvas.height = 10

      img.onload = () => {
        ctx?.drawImage(img, 0, 0, 10, 10)

        const dataURL = canvas.toDataURL('image/jpeg', 0.1)
        URL.revokeObjectURL(url)
        resolve(dataURL)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to generate blur placeholder'))
      }

      img.src = url
    })
  }, [])

  return {
    supportedFormats,
    isWebPSupported,
    isAVIFSupported,
    getOptimalFormat,
    generateResponsiveSizes,
    getImageMetadata,
    compressImage,
    generateBlurDataURL,
  }
}

/**
 * Calculate optimal image sizes for responsive display
 */
export function calculateImageSizes(
  containerWidth: number,
  breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 }
): string {
  const sizes = [
    `(max-width: ${breakpoints.sm}px) ${Math.min(containerWidth, breakpoints.sm)}px`,
    `(max-width: ${breakpoints.md}px) ${Math.min(containerWidth, breakpoints.md)}px`,
    `(max-width: ${breakpoints.lg}px) ${Math.min(containerWidth, breakpoints.lg)}px`,
    `(max-width: ${breakpoints.xl}px) ${Math.min(containerWidth, breakpoints.xl)}px`,
    `${containerWidth}px`,
  ]

  return sizes.join(', ')
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[],
  format?: string
): string {
  return widths
    .map(width => {
      const url = new URL(baseUrl)
      url.searchParams.set('w', width.toString())
      if (format) {
        url.searchParams.set('f', format)
      }
      return `${url.toString()} ${width}w`
    })
    .join(', ')
}

/**
 * Default image optimization presets
 */
export const IMAGE_PRESETS = {
  thumbnail: {
    quality: 0.7,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 150px, 200px',
  },
  card: {
    quality: 0.8,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 300px, 400px',
  },
  hero: {
    quality: 0.85,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    priority: true,
  },
  gallery: {
    quality: 0.8,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px',
  },
} as const

/**
 * Image loader for Next.js Image component
 */
export function imageLoader({
  src,
  width,
  quality = 75,
}: {
  src: string
  width: number
  quality?: number
}): string {
  const url = new URL(src, window.location.origin)
  url.searchParams.set('w', width.toString())
  url.searchParams.set('q', quality.toString())
  return url.toString()
}

export default useImageOptimization
