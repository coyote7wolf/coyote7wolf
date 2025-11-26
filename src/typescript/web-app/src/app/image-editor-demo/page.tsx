/**
 * Image Editor Demo Page
 *
 * Demonstrates the image editing functionality with various tools
 * and filters for comprehensive image manipulation
 */

'use client'

import React, { useState } from 'react'
import { ImageEditor } from '@/components/editor/ImageEditor'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { HomeLayout } from '@/components/layout/HomeLayout'
import '@/styles/image-editor.css'

export default function ImageEditorDemoPage() {
  const [editedImages, setEditedImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState<File | string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  // Sample images for demo
  const sampleImages = [
    'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Sample+Image+1',
    'https://via.placeholder.com/600x800/4ECDC4/FFFFFF?text=Sample+Image+2',
    'https://via.placeholder.com/1000x400/45B7D1/FFFFFF?text=Sample+Image+3',
    'https://via.placeholder.com/500x500/96CEB4/FFFFFF?text=Sample+Image+4',
  ]

  const handleImageSelect = (image: File | string) => {
    setCurrentImage(image)
    setShowEditor(true)
  }

  const handleSave = (imageData: string) => {
    setEditedImages(prev => [...prev, imageData])
    setShowEditor(false)
    setCurrentImage(null)

    // Show success message
    alert('Image saved successfully!')
  }

  const handleCancel = () => {
    setShowEditor(false)
    setCurrentImage(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const downloadImage = (imageData: string, index: number) => {
    const link = document.createElement('a')
    link.download = `edited-image-${index + 1}.png`
    link.href = imageData
    link.click()
  }

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <ImageEditor
          initialImage={currentImage ?? undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Image Editor</h1>
            <p className="text-gray-600 mt-2">
              Professional image editing with filters, cropping, resizing, and
              more
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Start Editing</h2>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-6">
                  <div className="text-6xl text-gray-400 mb-4">🎨</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Your Image
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Choose an image to start editing with our powerful tools
                  </p>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      >
                        📁 Upload Image
                      </label>
                    </div>
                    <p className="text-xs text-gray-400">
                      Supports JPEG, PNG, GIF, WebP formats
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sample Images */}
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Try with Sample Images</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sampleImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => handleImageSelect(image)}
                  >
                    <img
                      src={image}
                      alt={`Sample ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button variant="solid" size="sm">
                        Edit Image
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Features Overview */}
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Editing Features</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎨</div>
                  <h3 className="font-medium mb-1">Filters</h3>
                  <p className="text-sm text-gray-600">
                    Brightness, contrast, saturation, blur, and artistic effects
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-2">✂️</div>
                  <h3 className="font-medium mb-1">Crop</h3>
                  <p className="text-sm text-gray-600">
                    Precise cropping with custom aspect ratios and positioning
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-2">📏</div>
                  <h3 className="font-medium mb-1">Resize</h3>
                  <p className="text-sm text-gray-600">
                    Scale images up or down with aspect ratio preservation
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-2">🛠️</div>
                  <h3 className="font-medium mb-1">Transform</h3>
                  <p className="text-sm text-gray-600">
                    Rotate, flip, and transform with undo/redo support
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Edited Images Gallery */}
          {editedImages.length > 0 && (
            <Card>
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Edited Images</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditedImages([])}
                >
                  🗑️ Clear All
                </Button>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editedImages.map((imageData, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageData}
                        alt={`Edited ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={() => downloadImage(imageData, index)}
                        >
                          💾 Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImageSelect(imageData)}
                        >
                          ✏️ Edit More
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Usage Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">How to Use</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">🎨 Applying Filters</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • Use sliders to adjust brightness, contrast, and
                      saturation
                    </li>
                    <li>
                      • Apply artistic effects like sepia, grayscale, and blur
                    </li>
                    <li>• Preview changes in real-time</li>
                    <li>• Click "Apply" to make changes permanent</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">✂️ Cropping Images</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Set precise crop coordinates and dimensions</li>
                    <li>• Use "Center Crop" for quick 80% crop</li>
                    <li>• Adjust position and size as needed</li>
                    <li>• Apply crop to finalize the selection</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">📏 Resizing Images</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Choose new width and height dimensions</li>
                    <li>• Toggle aspect ratio preservation</li>
                    <li>• Support for scaling up to 4000px</li>
                    <li>• High-quality resampling algorithm</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">🛠️ Transform Tools</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Rotate images in 90-degree increments</li>
                    <li>• Flip horizontally or vertically</li>
                    <li>• Use undo/redo for easy experimentation</li>
                    <li>• Reset to original image anytime</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Technical Specifications */}
          <Card className="mt-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Technical Specifications
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Supported Formats</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• JPEG/JPG</li>
                    <li>• PNG (with transparency)</li>
                    <li>• GIF (static)</li>
                    <li>• WebP</li>
                    <li>• BMP</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Output Options</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PNG (lossless)</li>
                    <li>• JPEG (configurable quality)</li>
                    <li>• WebP (modern format)</li>
                    <li>• High DPI support</li>
                    <li>• Color profile preservation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Performance</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Client-side processing</li>
                    <li>• No server uploads required</li>
                    <li>• Real-time preview</li>
                    <li>• Efficient memory usage</li>
                    <li>• Browser compatibility</li>
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
