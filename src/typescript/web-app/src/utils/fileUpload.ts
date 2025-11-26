/**
 * File Upload and Management Utilities
 *
 * Comprehensive file handling system with:
 * - Drag & Drop support
 * - Progress tracking
 * - File validation
 * - Cloud storage integration
 * - Chunked uploads for large files
 * - Image optimization
 * - Error handling and retry logic
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// File type definitions
export interface FileInfo {
  id: string
  file: File
  name: string
  size: number
  type: string
  lastModified: number
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused'
  progress: number
  uploadedBytes: number
  error?: string | undefined
  url?: string | undefined
  thumbnailUrl?: string | undefined
  metadata?: Record<string, any> | undefined
}

export interface UploadConfig {
  maxFileSize: number // bytes
  maxFiles: number
  allowedTypes: string[]
  chunkSize: number // bytes for chunked upload
  autoUpload: boolean
  generateThumbnails: boolean
  compressionQuality: number // 0-1 for image compression
}

export interface UploadResponse {
  success: boolean
  fileId: string
  url?: string
  thumbnailUrl?: string
  error?: string
}

// Default configuration
const DEFAULT_CONFIG: UploadConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  allowedTypes: [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/*',
  ],
  chunkSize: 1024 * 1024, // 1MB chunks
  autoUpload: true,
  generateThumbnails: true,
  compressionQuality: 0.8,
}

// File validation utilities
export class FileValidator {
  static validateSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize
  }

  static validateType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '')
        return file.type.startsWith(category)
      }
      return file.type === type
    })
  }

  static validateFile(
    file: File,
    config: UploadConfig
  ): { valid: boolean; error?: string } {
    if (!this.validateSize(file, config.maxFileSize)) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(config.maxFileSize)}`,
      }
    }

    if (!this.validateType(file, config.allowedTypes)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed`,
      }
    }

    return { valid: true }
  }

  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
  }
}

// Image processing utilities
export class ImageProcessor {
  static async createThumbnail(
    file: File,
    maxWidth: number = 200,
    maxHeight: number = 200,
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate dimensions
        let { width, height } = img
        const aspectRatio = width / height

        if (width > height) {
          width = Math.min(width, maxWidth)
          height = width / aspectRatio
        } else {
          height = Math.min(height, maxHeight)
          width = height * aspectRatio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  static async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          blob => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }
}

// Upload manager class
export class UploadManager {
  private config: UploadConfig
  private uploadEndpoint: string
  private onProgress: ((fileId: string, progress: number) => void) | undefined
  private onComplete:
    | ((fileId: string, result: UploadResponse) => void)
    | undefined
  private onError: ((fileId: string, error: string) => void) | undefined

  constructor(
    uploadEndpoint: string,
    config: Partial<UploadConfig> = {},
    callbacks: {
      onProgress?: (fileId: string, progress: number) => void
      onComplete?: (fileId: string, result: UploadResponse) => void
      onError?: (fileId: string, error: string) => void
    } = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.uploadEndpoint = uploadEndpoint
    this.onProgress = callbacks.onProgress
    this.onComplete = callbacks.onComplete
    this.onError = callbacks.onError
  }

  async uploadFile(fileInfo: FileInfo): Promise<UploadResponse> {
    try {
      const { file } = fileInfo

      // Use chunked upload for large files
      if (file.size > this.config.chunkSize * 2) {
        return await this.uploadFileChunked(fileInfo)
      } else {
        return await this.uploadFileSimple(fileInfo)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed'
      this.onError?.(fileInfo.id, errorMessage)
      return { success: false, fileId: fileInfo.id, error: errorMessage }
    }
  }

  private async uploadFileSimple(fileInfo: FileInfo): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', fileInfo.file)
    formData.append('metadata', JSON.stringify(fileInfo.metadata || {}))

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          this.onProgress?.(fileInfo.id, progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          this.onComplete?.(fileInfo.id, response)
          resolve(response)
        } else {
          const error = `Upload failed with status ${xhr.status}`
          this.onError?.(fileInfo.id, error)
          reject(new Error(error))
        }
      })

      xhr.addEventListener('error', () => {
        const error = 'Network error during upload'
        this.onError?.(fileInfo.id, error)
        reject(new Error(error))
      })

      xhr.open('POST', this.uploadEndpoint)
      xhr.send(formData)
    })
  }

  private async uploadFileChunked(fileInfo: FileInfo): Promise<UploadResponse> {
    const { file } = fileInfo
    const chunkSize = this.config.chunkSize
    const totalChunks = Math.ceil(file.size / chunkSize)
    let uploadedBytes = 0

    // Initialize chunked upload
    const initResponse = await fetch(`${this.uploadEndpoint}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        filesize: file.size,
        filetype: file.type,
        totalChunks,
        metadata: fileInfo.metadata,
      }),
    })

    const { uploadId } = await initResponse.json()

    // Upload chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('uploadId', uploadId)
      formData.append('chunkIndex', chunkIndex.toString())

      await fetch(`${this.uploadEndpoint}/chunk`, {
        method: 'POST',
        body: formData,
      })

      uploadedBytes += chunk.size
      const progress = (uploadedBytes / file.size) * 100
      this.onProgress?.(fileInfo.id, progress)
    }

    // Complete upload
    const completeResponse = await fetch(`${this.uploadEndpoint}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId }),
    })

    const result = await completeResponse.json()
    this.onComplete?.(fileInfo.id, result)
    return result
  }
}

// React hook for file upload
export function useFileUpload(
  uploadEndpoint: string,
  config: Partial<UploadConfig> = {}
) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config })
  const uploadManagerRef = useRef<UploadManager>()

  // Initialize upload manager
  useEffect(() => {
    uploadManagerRef.current = new UploadManager(
      uploadEndpoint,
      configRef.current,
      {
        onProgress: (fileId, progress) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, progress, status: 'uploading' as const }
                : f
            )
          )
        },
        onComplete: (fileId, result) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? {
                    ...f,
                    status: 'completed' as const,
                    progress: 100,
                    url: result.url || undefined,
                    thumbnailUrl: result.thumbnailUrl || undefined,
                  }
                : f
            )
          )
        },
        onError: (fileId, error) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileId ? { ...f, status: 'error' as const, error } : f
            )
          )
        },
      }
    )
  }, [uploadEndpoint])

  const createFileInfo = useCallback(async (file: File): Promise<FileInfo> => {
    const fileInfo: FileInfo = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      status: 'pending',
      progress: 0,
      uploadedBytes: 0,
    }

    // Generate thumbnail for images
    if (
      file.type.startsWith('image/') &&
      configRef.current.generateThumbnails
    ) {
      try {
        fileInfo.thumbnailUrl = await ImageProcessor.createThumbnail(file)
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error)
      }
    }

    return fileInfo
  }, [])

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      const config = configRef.current

      // Check file count limit
      if (files.length + newFiles.length > config.maxFiles) {
        throw new Error(`Maximum ${config.maxFiles} files allowed`)
      }

      const validFiles: FileInfo[] = []
      const errors: string[] = []

      for (const file of newFiles) {
        const validation = FileValidator.validateFile(file, config)

        if (validation.valid) {
          const fileInfo = await createFileInfo(file)
          validFiles.push(fileInfo)
        } else {
          errors.push(`${file.name}: ${validation.error}`)
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join('\n'))
      }

      setFiles(prev => [...prev, ...validFiles])

      // Auto-upload if enabled
      if (config.autoUpload) {
        validFiles.forEach(fileInfo => {
          uploadManagerRef.current?.uploadFile(fileInfo)
        })
        setIsUploading(true)
      }

      return validFiles
    },
    [files.length, createFileInfo]
  )

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const retryUpload = useCallback(
    (fileId: string) => {
      const fileInfo = files.find(f => f.id === fileId)
      if (fileInfo) {
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, status: 'pending' as const, progress: 0 }
              : f
          )
        )
        // Clear error separately to maintain type compatibility
        setFiles(prev =>
          prev.map(f => (f.id === fileId ? { ...f, error: undefined } : f))
        )
        uploadManagerRef.current?.uploadFile(fileInfo)
      }
    },
    [files]
  )

  const uploadAll = useCallback(() => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    pendingFiles.forEach(fileInfo => {
      uploadManagerRef.current?.uploadFile(fileInfo)
    })
    setIsUploading(true)
  }, [files])

  const clearFiles = useCallback(() => {
    setFiles([])
    setIsUploading(false)
  }, [])

  // Check if all uploads are complete
  useEffect(() => {
    const uploadingFiles = files.filter(f => f.status === 'uploading')
    if (isUploading && uploadingFiles.length === 0) {
      setIsUploading(false)
    }
  }, [files, isUploading])

  return {
    files,
    isDragOver,
    isUploading,
    addFiles,
    removeFile,
    retryUpload,
    uploadAll,
    clearFiles,
    setIsDragOver,
    totalFiles: files.length,
    completedFiles: files.filter(f => f.status === 'completed').length,
    failedFiles: files.filter(f => f.status === 'error').length,
    totalProgress:
      files.length > 0
        ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
        : 0,
  }
}

// Drag and drop utilities
export function useDragAndDrop(
  onFilesDropped: (files: File[]) => void,
  accept?: string[]
) {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounterRef = useRef(0)

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current++

    if (e.dataTransfer?.items) {
      const hasFiles = Array.from(e.dataTransfer.items).some(
        item => item.kind === 'file'
      )
      if (hasFiles) {
        setIsDragOver(true)
      }
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current--

    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragOver(false)
      dragCounterRef.current = 0

      const files = Array.from(e.dataTransfer?.files || [])

      if (accept) {
        const filteredFiles = files.filter(file =>
          accept.some(type => {
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.replace('/*', ''))
            }
            return file.type === type
          })
        )
        onFilesDropped(filteredFiles)
      } else {
        onFilesDropped(files)
      }
    },
    [onFilesDropped, accept]
  )

  const dragHandlers = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  }

  return { isDragOver, dragHandlers }
}

export default useFileUpload
