/**
 * File Upload Components
 *
 * React components for file upload functionality:
 * - FileUploader - main upload component with drag & drop
 * - FileList - displays uploaded files with progress
 * - DropZone - drag and drop area
 * - FilePreview - individual file preview and controls
 */

'use client'

import React, { useRef, useState } from 'react'
import {
  useFileUpload,
  useDragAndDrop,
  FileInfo,
  FileValidator,
} from '@/utils/fileUpload'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Type for React drag events
type DragEventHandler = (e: React.DragEvent<HTMLDivElement>) => void

// File Upload Progress Component
export function FileProgress({
  progress,
  status,
  size = 'md',
}: {
  progress: number
  status: FileInfo['status']
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const statusColors = {
    pending: 'bg-gray-200',
    uploading: 'bg-blue-500',
    completed: 'bg-green-500',
    error: 'bg-red-500',
    paused: 'bg-yellow-500',
  }

  return (
    <div className="w-full">
      <div
        className={`${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}
      >
        <div
          className={`h-full transition-all duration-300 ${statusColors[status]} progress-bar`}
          data-progress={Math.max(0, Math.min(100, progress))}
        />
      </div>
      {size !== 'sm' && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span className="capitalize">{status}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  )
}

// Individual File Preview Component
export function FilePreview({
  fileInfo,
  onRemove,
  onRetry,
  showThumbnail = true,
}: {
  fileInfo: FileInfo
  onRemove: (id: string) => void
  onRetry: (id: string) => void
  showThumbnail?: boolean
}) {
  const { id, name, size, type, status, progress, error, thumbnailUrl } =
    fileInfo
  const isImage = type.startsWith('image/')
  const fileSize = FileValidator.formatFileSize(size)

  const statusIcons = {
    pending: '⏳',
    uploading: '📤',
    completed: '✅',
    error: '❌',
    paused: '⏸️',
  }

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
      {/* Thumbnail or File Icon */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {showThumbnail && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">
            {isImage
              ? '🖼️'
              : type.includes('pdf')
                ? '📄'
                : type.includes('video')
                  ? '🎥'
                  : type.includes('audio')
                    ? '🎵'
                    : '📄'}
          </span>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <span className="text-lg">{statusIcons[status]}</span>
        </div>
        <p className="text-xs text-gray-500">{fileSize}</p>

        {/* Progress Bar */}
        {(status === 'uploading' || status === 'completed') && (
          <div className="mt-2">
            <FileProgress progress={progress} status={status} size="sm" />
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {status === 'error' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetry(id)}
            className="text-xs"
          >
            🔄 Retry
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(id)}
          className="text-xs text-red-600 hover:text-red-700"
        >
          🗑️
        </Button>
      </div>
    </div>
  )
}

// Drag and Drop Zone Component
export function DropZone({
  onFilesSelected,
  accept,
  multiple = true,
  disabled = false,
  className = '',
}: {
  onFilesSelected: (files: File[]) => void
  accept?: string[]
  multiple?: boolean
  disabled?: boolean
  className?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isDragOver } = useDragAndDrop(onFilesSelected, accept)

  // Convert drag handlers to React event handlers
  const handleDragEnter: DragEventHandler = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave: DragEventHandler = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragOver: DragEventHandler = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop: DragEventHandler = e => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files || [])
    onFilesSelected(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    onFilesSelected(files)
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept?.join(',')}
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
        aria-label="File upload input"
        title="Select files to upload"
      />

      <div className="space-y-4">
        <div className="text-6xl text-gray-400">{isDragOver ? '📤' : '📁'}</div>

        <div>
          <p className="text-lg font-medium text-gray-900">
            {isDragOver ? 'Drop files here' : 'Upload files'}
          </p>
          <p className="text-sm text-gray-500">
            {isDragOver
              ? 'Release to upload'
              : `Drag and drop files here, or click to browse${multiple ? ' (multiple files supported)' : ''}`}
          </p>
        </div>

        {accept && (
          <p className="text-xs text-gray-400">
            Supported formats: {accept.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}

// File List Component
export function FileList({
  files,
  onRemoveFile,
  onRetryFile,
  showThumbnails = true,
  className = '',
}: {
  files: FileInfo[]
  onRemoveFile: (id: string) => void
  onRetryFile: (id: string) => void
  showThumbnails?: boolean
  className?: string
}) {
  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <span className="text-4xl block mb-2">📄</span>
        <p>No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {files.map(fileInfo => (
        <FilePreview
          key={fileInfo.id}
          fileInfo={fileInfo}
          onRemove={onRemoveFile}
          onRetry={onRetryFile}
          showThumbnail={showThumbnails}
        />
      ))}
    </div>
  )
}

// Upload Statistics Component
export function UploadStats({
  totalFiles,
  completedFiles,
  failedFiles,
  totalProgress,
  isUploading,
}: {
  totalFiles: number
  completedFiles: number
  failedFiles: number
  totalProgress: number
  isUploading: boolean
}) {
  if (totalFiles === 0) return null

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Upload Progress</h3>
          <span className="text-sm text-gray-500">
            {completedFiles}/{totalFiles} files
          </span>
        </div>

        <FileProgress
          progress={totalProgress}
          status={isUploading ? 'uploading' : 'completed'}
          size="md"
        />

        <div className="flex justify-between text-xs text-gray-500 mt-3">
          <span>✅ Completed: {completedFiles}</span>
          {failedFiles > 0 && <span>❌ Failed: {failedFiles}</span>}
          {isUploading && <span>📤 Uploading...</span>}
        </div>
      </CardBody>
    </Card>
  )
}

// Main File Uploader Component
export function FileUploader({
  uploadEndpoint = '/api/upload',
  config = {},
  onUploadComplete,
  onUploadError,
  className = '',
}: {
  uploadEndpoint?: string
  config?: any
  onUploadComplete?: (files: FileInfo[]) => void
  onUploadError?: (error: string) => void
  className?: string
}) {
  const {
    files,
    addFiles,
    removeFile,
    retryUpload,
    uploadAll,
    clearFiles,
    totalFiles,
    completedFiles,
    failedFiles,
    totalProgress,
    isUploading,
  } = useFileUpload(uploadEndpoint, config)

  const [error, setError] = useState<string>('')

  const handleFilesSelected = async (selectedFiles: File[]) => {
    try {
      setError('')
      await addFiles(selectedFiles)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add files'
      setError(errorMessage)
      onUploadError?.(errorMessage)
    }
  }

  const handleClearAll = () => {
    clearFiles()
    setError('')
  }

  // Notify when all uploads complete
  React.useEffect(() => {
    if (totalFiles > 0 && !isUploading && completedFiles === totalFiles) {
      onUploadComplete?.(files.filter(f => f.status === 'completed'))
    }
  }, [totalFiles, isUploading, completedFiles, files, onUploadComplete])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <DropZone
        onFilesSelected={handleFilesSelected}
        accept={config.allowedTypes}
        multiple={config.maxFiles > 1}
        disabled={isUploading}
      />

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Upload Statistics */}
      <UploadStats
        totalFiles={totalFiles}
        completedFiles={completedFiles}
        failedFiles={failedFiles}
        totalProgress={totalProgress}
        isUploading={isUploading}
      />

      {/* Control Buttons */}
      {totalFiles > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {!config.autoUpload && (
              <Button
                onClick={uploadAll}
                disabled={
                  isUploading || files.every(f => f.status !== 'pending')
                }
                variant="solid"
              >
                📤 Upload All
              </Button>
            )}
            <Button
              onClick={handleClearAll}
              disabled={isUploading}
              variant="outline"
            >
              🗑️ Clear All
            </Button>
          </div>
        </div>
      )}

      {/* File List */}
      <FileList
        files={files}
        onRemoveFile={removeFile}
        onRetryFile={retryUpload}
        showThumbnails={config.generateThumbnails !== false}
      />
    </div>
  )
}

export default FileUploader
