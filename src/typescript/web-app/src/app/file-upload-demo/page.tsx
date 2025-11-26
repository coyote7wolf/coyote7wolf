/**
 * File Upload Demo Page
 *
 * Demonstrates the file upload system with various configurations
 * and features including drag & drop, progress tracking, and file management
 */

'use client'

import React, { useState } from 'react'
import { FileUploader } from '@/components/files/FileUploader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileInfo } from '@/utils/fileUpload'
import { HomeLayout } from '@/components/layout/HomeLayout'
import '@/styles/file-upload.css'

export default function FileUploadDemoPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([])
  const [selectedConfig, setSelectedConfig] = useState('standard')

  // Different upload configurations
  const uploadConfigs = {
    standard: {
      name: 'Standard Upload',
      description: 'General file upload with common formats',
      config: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        allowedTypes: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/*',
        ],
        autoUpload: true,
        generateThumbnails: true,
        compressionQuality: 0.8,
      },
    },
    images: {
      name: 'Image Upload',
      description: 'Optimized for image files with thumbnails',
      config: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 10,
        allowedTypes: ['image/*'],
        autoUpload: true,
        generateThumbnails: true,
        compressionQuality: 0.9,
      },
    },
    documents: {
      name: 'Document Upload',
      description: 'For office documents and PDFs',
      config: {
        maxFileSize: 20 * 1024 * 1024, // 20MB
        maxFiles: 3,
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
        ],
        autoUpload: false,
        generateThumbnails: false,
        compressionQuality: 1.0,
      },
    },
    media: {
      name: 'Media Upload',
      description: 'For audio and video files',
      config: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxFiles: 3,
        allowedTypes: ['video/*', 'audio/*', 'image/*'],
        autoUpload: false,
        generateThumbnails: true,
        compressionQuality: 0.7,
      },
    },
    bulk: {
      name: 'Bulk Upload',
      description: 'For uploading many files at once',
      config: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 50,
        allowedTypes: ['*/*'], // All file types
        autoUpload: true,
        generateThumbnails: false,
        compressionQuality: 0.8,
      },
    },
  }

  const currentConfig =
    uploadConfigs[selectedConfig as keyof typeof uploadConfigs]

  const handleUploadComplete = (files: FileInfo[]) => {
    console.log('Upload completed:', files)
    setUploadedFiles(prev => [...prev, ...files])

    // Show success notification
    alert(`Successfully uploaded ${files.length} file(s)!`)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    alert(`Upload error: ${error}`)
  }

  const clearUploadedFiles = () => {
    setUploadedFiles([])
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              File Upload System
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive file upload with drag & drop, progress tracking, and
              cloud storage
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">
                    Upload Configuration
                  </h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  {Object.entries(uploadConfigs).map(([key, config]) => (
                    <div
                      key={key}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedConfig === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedConfig(key)}
                    >
                      <h3 className="font-medium">{config.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {config.description}
                      </p>
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <div>
                          Max size:{' '}
                          {(config.config.maxFileSize / (1024 * 1024)).toFixed(
                            0
                          )}
                          MB
                        </div>
                        <div>Max files: {config.config.maxFiles}</div>
                        <div>
                          Auto upload: {config.config.autoUpload ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* Current Configuration Details */}
              <Card className="mt-6">
                <CardHeader>
                  <h3 className="font-semibold">Current Settings</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max File Size:</span>
                      <span>
                        {(
                          currentConfig.config.maxFileSize /
                          (1024 * 1024)
                        ).toFixed(0)}
                        MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Files:</span>
                      <span>{currentConfig.config.maxFiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Upload:</span>
                      <span>
                        {currentConfig.config.autoUpload ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thumbnails:</span>
                      <span>
                        {currentConfig.config.generateThumbnails ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compression:</span>
                      <span>
                        {(
                          currentConfig.config.compressionQuality * 100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Allowed Types:</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentConfig.config.allowedTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-xs rounded"
                        >
                          {type === '*/*' ? 'All files' : type}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Upload Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">
                    {currentConfig.name}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {currentConfig.description}
                  </p>
                </CardHeader>
                <CardBody>
                  <FileUploader
                    uploadEndpoint="/api/upload"
                    config={currentConfig.config}
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                  />
                </CardBody>
              </Card>

              {/* Upload Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardBody className="text-center p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadedFiles.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Uploads</div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        uploadedFiles.filter(f => f.status === 'completed')
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="text-center p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadedFiles.filter(f => f.status === 'error').length}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </CardBody>
                </Card>
              </div>

              {/* Uploaded Files History */}
              {uploadedFiles.length > 0 && (
                <Card className="mt-6">
                  <CardHeader className="flex justify-between items-center">
                    <h3 className="font-semibold">Upload History</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearUploadedFiles}
                    >
                      🗑️ Clear History
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {uploadedFiles.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {file.status === 'completed' ? '✅' : '❌'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>

          {/* Usage Examples */}
          <Card className="mt-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Usage Examples</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">💡 Tips for Image Upload</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Supports JPEG, PNG, GIF, WebP formats</li>
                    <li>• Automatic thumbnail generation</li>
                    <li>• Image compression for web optimization</li>
                    <li>• Drag and drop multiple images</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    📄 Tips for Document Upload
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Supports PDF, Word, Excel formats</li>
                    <li>• Manual upload control</li>
                    <li>• Larger file size limits</li>
                    <li>• No compression applied</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">🎵 Tips for Media Upload</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Supports video and audio files</li>
                    <li>• Large file size support (up to 100MB)</li>
                    <li>• Manual upload confirmation</li>
                    <li>• Automatic format detection</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">📦 Tips for Bulk Upload</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Upload up to 50 files at once</li>
                    <li>• All file types supported</li>
                    <li>• Automatic processing</li>
                    <li>• Chunked upload for large files</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </HomeLayout>
  )
}
