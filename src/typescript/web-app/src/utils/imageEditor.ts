/**
 * Image Editing Utilities
 *
 * Comprehensive image editing functionality:
 * - Canvas-based editing
 * - Crop, resize, rotate operations
 * - Filters and adjustments
 * - Real-time preview
 * - Undo/redo system
 * - Export functionality
 */

import { useCallback, useRef, useState, useEffect } from 'react'

// Image editing types
export interface ImageDimensions {
  width: number
  height: number
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface FilterSettings {
  brightness: number // -100 to 100
  contrast: number // -100 to 100
  saturation: number // -100 to 100
  hue: number // -180 to 180
  blur: number // 0 to 10
  sepia: number // 0 to 100
  grayscale: number // 0 to 100
  invert: number // 0 to 100
}

export interface EditHistory {
  id: string
  timestamp: number
  operation: string
  imageData: string // base64
  settings?: any
}

// Default filter settings
export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
}

// Image processing utilities
export class ImageProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private originalImage: HTMLImageElement | null = null
  private currentImageData: ImageData | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context')
    }
    this.ctx = ctx
  }

  // Load image from file or URL
  async loadImage(source: File | string): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        this.originalImage = img
        this.canvas.width = img.width
        this.canvas.height = img.height
        this.ctx.drawImage(img, 0, 0)
        this.currentImageData = this.ctx.getImageData(
          0,
          0,
          img.width,
          img.height
        )

        resolve({
          width: img.width,
          height: img.height,
        })
      }

      img.onerror = reject

      if (source instanceof File) {
        const reader = new FileReader()
        reader.onload = e => {
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(source)
      } else {
        img.src = source
      }
    })
  }

  // Crop image
  crop(cropArea: CropArea): void {
    if (!this.originalImage) return

    const { x, y, width, height } = cropArea

    // Create new canvas for cropped image
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCanvas.width = width
    tempCanvas.height = height

    // Draw cropped portion
    tempCtx.drawImage(
      this.originalImage,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    )

    // Update main canvas
    this.canvas.width = width
    this.canvas.height = height
    this.ctx.drawImage(tempCanvas, 0, 0)
    this.currentImageData = this.ctx.getImageData(0, 0, width, height)
  }

  // Resize image
  resize(
    newDimensions: ImageDimensions,
    maintainAspectRatio: boolean = true
  ): void {
    if (!this.originalImage) return

    let { width, height } = newDimensions

    if (maintainAspectRatio) {
      const aspectRatio = this.originalImage.width / this.originalImage.height

      if (width / height > aspectRatio) {
        width = height * aspectRatio
      } else {
        height = width / aspectRatio
      }
    }

    this.canvas.width = width
    this.canvas.height = height
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
    this.ctx.drawImage(this.originalImage, 0, 0, width, height)
    this.currentImageData = this.ctx.getImageData(0, 0, width, height)
  }

  // Rotate image
  rotate(degrees: number): void {
    if (!this.currentImageData) return

    const radians = (degrees * Math.PI) / 180
    const { width, height } = this.canvas

    // Calculate new dimensions after rotation
    const cos = Math.abs(Math.cos(radians))
    const sin = Math.abs(Math.sin(radians))
    const newWidth = width * cos + height * sin
    const newHeight = width * sin + height * cos

    // Create temporary canvas
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCanvas.width = newWidth
    tempCanvas.height = newHeight

    // Translate to center and rotate
    tempCtx.translate(newWidth / 2, newHeight / 2)
    tempCtx.rotate(radians)
    tempCtx.drawImage(this.canvas, -width / 2, -height / 2)

    // Update main canvas
    this.canvas.width = newWidth
    this.canvas.height = newHeight
    this.ctx.clearRect(0, 0, newWidth, newHeight)
    this.ctx.drawImage(tempCanvas, 0, 0)
    this.currentImageData = this.ctx.getImageData(0, 0, newWidth, newHeight)
  }

  // Flip image
  flip(horizontal: boolean = true): void {
    if (!this.currentImageData) return

    const { width, height } = this.canvas
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCanvas.width = width
    tempCanvas.height = height

    if (horizontal) {
      tempCtx.scale(-1, 1)
      tempCtx.drawImage(this.canvas, -width, 0)
    } else {
      tempCtx.scale(1, -1)
      tempCtx.drawImage(this.canvas, 0, -height)
    }

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.drawImage(tempCanvas, 0, 0)
    this.currentImageData = this.ctx.getImageData(0, 0, width, height)
  }

  // Apply filters
  applyFilters(filters: FilterSettings): void {
    if (!this.originalImage) return

    // Redraw original image
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(
      this.originalImage,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )

    // Apply CSS filters
    const filterString = this.buildFilterString(filters)
    this.ctx.filter = filterString

    // Redraw with filters
    this.ctx.drawImage(this.canvas, 0, 0)
    this.ctx.filter = 'none' // Reset filter

    this.currentImageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }

  // Build CSS filter string
  private buildFilterString(filters: FilterSettings): string {
    const parts: string[] = []

    if (filters.brightness !== 0) {
      parts.push(`brightness(${100 + filters.brightness}%)`)
    }

    if (filters.contrast !== 0) {
      parts.push(`contrast(${100 + filters.contrast}%)`)
    }

    if (filters.saturation !== 0) {
      parts.push(`saturate(${100 + filters.saturation}%)`)
    }

    if (filters.hue !== 0) {
      parts.push(`hue-rotate(${filters.hue}deg)`)
    }

    if (filters.blur > 0) {
      parts.push(`blur(${filters.blur}px)`)
    }

    if (filters.sepia > 0) {
      parts.push(`sepia(${filters.sepia}%)`)
    }

    if (filters.grayscale > 0) {
      parts.push(`grayscale(${filters.grayscale}%)`)
    }

    if (filters.invert > 0) {
      parts.push(`invert(${filters.invert}%)`)
    }

    return parts.join(' ') || 'none'
  }

  // Get current image as base64
  getImageData(format: string = 'image/png', quality: number = 0.9): string {
    return this.canvas.toDataURL(format, quality)
  }

  // Get canvas dimensions
  getDimensions(): ImageDimensions {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    }
  }

  // Reset to original image
  reset(): void {
    if (!this.originalImage) return

    this.canvas.width = this.originalImage.width
    this.canvas.height = this.originalImage.height
    this.ctx.drawImage(this.originalImage, 0, 0)
    this.currentImageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }
}

// React hook for image editing
export function useImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const processorRef = useRef<ImageProcessor | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
  })
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS)
  const [history, setHistory] = useState<EditHistory[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize processor when canvas is ready
  useEffect(() => {
    if (canvasRef.current && !processorRef.current) {
      processorRef.current = new ImageProcessor(canvasRef.current)
    }
  }, [])

  // Load image
  const loadImage = useCallback(async (source: File | string) => {
    if (!processorRef.current) return

    setIsProcessing(true)
    try {
      const dims = await processorRef.current.loadImage(source)
      setDimensions(dims)
      setIsLoaded(true)
      setFilters(DEFAULT_FILTERS)

      // Add to history
      const imageData = processorRef.current.getImageData()
      addToHistory('load', imageData)
    } catch (error) {
      console.error('Failed to load image:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Add operation to history
  const addToHistory = useCallback(
    (operation: string, imageData?: string, settings?: any) => {
      if (!processorRef.current) return

      const data = imageData || processorRef.current.getImageData()
      const historyItem: EditHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        operation,
        imageData: data,
        settings,
      }

      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(historyItem)
        return newHistory
      })

      setHistoryIndex(prev => prev + 1)
    },
    [historyIndex]
  )

  // Crop image
  const cropImage = useCallback(
    (cropArea: CropArea) => {
      if (!processorRef.current) return

      setIsProcessing(true)
      try {
        processorRef.current.crop(cropArea)
        setDimensions(processorRef.current.getDimensions())
        addToHistory('crop', undefined, cropArea)
      } catch (error) {
        console.error('Crop failed:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [addToHistory]
  )

  // Resize image
  const resizeImage = useCallback(
    (newDimensions: ImageDimensions, maintainAspectRatio: boolean = true) => {
      if (!processorRef.current) return

      setIsProcessing(true)
      try {
        processorRef.current.resize(newDimensions, maintainAspectRatio)
        setDimensions(processorRef.current.getDimensions())
        addToHistory('resize', undefined, {
          newDimensions,
          maintainAspectRatio,
        })
      } catch (error) {
        console.error('Resize failed:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [addToHistory]
  )

  // Rotate image
  const rotateImage = useCallback(
    (degrees: number) => {
      if (!processorRef.current) return

      setIsProcessing(true)
      try {
        processorRef.current.rotate(degrees)
        setDimensions(processorRef.current.getDimensions())
        addToHistory('rotate', undefined, degrees)
      } catch (error) {
        console.error('Rotate failed:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [addToHistory]
  )

  // Flip image
  const flipImage = useCallback(
    (horizontal: boolean = true) => {
      if (!processorRef.current) return

      setIsProcessing(true)
      try {
        processorRef.current.flip(horizontal)
        addToHistory('flip', undefined, horizontal)
      } catch (error) {
        console.error('Flip failed:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [addToHistory]
  )

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<FilterSettings>) => {
      if (!processorRef.current) return

      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)

      setIsProcessing(true)
      try {
        processorRef.current.applyFilters(updatedFilters)
      } catch (error) {
        console.error('Filter update failed:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [filters]
  )

  // Apply filters permanently
  const applyFilters = useCallback(() => {
    if (!processorRef.current) return

    addToHistory('filters', undefined, filters)
  }, [filters, addToHistory])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    if (processorRef.current) {
      processorRef.current.applyFilters(DEFAULT_FILTERS)
    }
  }, [])

  // Undo last operation
  const undo = useCallback(() => {
    if (historyIndex <= 0) return

    const previousState = history[historyIndex - 1]
    if (previousState && processorRef.current && canvasRef.current) {
      // Load previous image data
      const img = new Image()
      img.onload = () => {
        if (canvasRef.current && processorRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            canvasRef.current.width = img.width
            canvasRef.current.height = img.height
            ctx.drawImage(img, 0, 0)
            setDimensions({ width: img.width, height: img.height })
          }
        }
      }
      img.src = previousState.imageData
      setHistoryIndex(prev => prev - 1)
    }
  }, [history, historyIndex])

  // Redo operation
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return

    const nextState = history[historyIndex + 1]
    if (nextState && processorRef.current && canvasRef.current) {
      // Load next image data
      const img = new Image()
      img.onload = () => {
        if (canvasRef.current && processorRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            canvasRef.current.width = img.width
            canvasRef.current.height = img.height
            ctx.drawImage(img, 0, 0)
            setDimensions({ width: img.width, height: img.height })
          }
        }
      }
      img.src = nextState.imageData
      setHistoryIndex(prev => prev + 1)
    }
  }, [history, historyIndex])

  // Export image
  const exportImage = useCallback(
    (format: string = 'image/png', quality: number = 0.9) => {
      if (!processorRef.current) return ''
      return processorRef.current.getImageData(format, quality)
    },
    []
  )

  // Reset to original
  const reset = useCallback(() => {
    if (!processorRef.current) return

    processorRef.current.reset()
    setDimensions(processorRef.current.getDimensions())
    setFilters(DEFAULT_FILTERS)

    // Clear history and add reset state
    const imageData = processorRef.current.getImageData()
    setHistory([
      {
        id: 'reset',
        timestamp: Date.now(),
        operation: 'reset',
        imageData,
      },
    ])
    setHistoryIndex(0)
  }, [])

  return {
    canvasRef,
    isLoaded,
    isProcessing,
    dimensions,
    filters,
    history,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    // Actions
    loadImage,
    cropImage,
    resizeImage,
    rotateImage,
    flipImage,
    updateFilters,
    applyFilters,
    resetFilters,
    undo,
    redo,
    exportImage,
    reset,
  }
}

export default useImageEditor
