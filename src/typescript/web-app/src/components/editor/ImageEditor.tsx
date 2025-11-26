/**
 * Image Editor Components
 *
 * React components for image editing functionality:
 * - ImageEditor - main editor component
 * - FilterPanel - filter controls
 * - CropTool - crop selection tool
 * - ToolPanel - editing tools
 * - HistoryPanel - undo/redo controls
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  useImageEditor,
  FilterSettings,
  DEFAULT_FILTERS,
  CropArea,
  ImageDimensions,
} from '@/utils/imageEditor'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Filter Control Component
function FilterControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <label className="font-medium">{label}</label>
        <span className="text-gray-500">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        aria-label={`${label} filter control`}
      />
    </div>
  )
}

// Filter Panel Component
export function FilterPanel({
  filters,
  onFilterChange,
  onApply,
  onReset,
  disabled = false,
}: {
  filters: FilterSettings
  onFilterChange: (filters: Partial<FilterSettings>) => void
  onApply: () => void
  onReset: () => void
  disabled?: boolean
}) {
  const hasChanges = Object.keys(filters).some(
    key =>
      filters[key as keyof FilterSettings] !==
      DEFAULT_FILTERS[key as keyof FilterSettings]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Filters</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={disabled || !hasChanges}
            >
              Reset
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={onApply}
              disabled={disabled || !hasChanges}
            >
              Apply
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <FilterControl
          label="Brightness"
          value={filters.brightness}
          min={-100}
          max={100}
          onChange={value => onFilterChange({ brightness: value })}
        />

        <FilterControl
          label="Contrast"
          value={filters.contrast}
          min={-100}
          max={100}
          onChange={value => onFilterChange({ contrast: value })}
        />

        <FilterControl
          label="Saturation"
          value={filters.saturation}
          min={-100}
          max={100}
          onChange={value => onFilterChange({ saturation: value })}
        />

        <FilterControl
          label="Hue"
          value={filters.hue}
          min={-180}
          max={180}
          unit="°"
          onChange={value => onFilterChange({ hue: value })}
        />

        <FilterControl
          label="Blur"
          value={filters.blur}
          min={0}
          max={10}
          step={0.1}
          unit="px"
          onChange={value => onFilterChange({ blur: value })}
        />

        <FilterControl
          label="Sepia"
          value={filters.sepia}
          min={0}
          max={100}
          unit="%"
          onChange={value => onFilterChange({ sepia: value })}
        />

        <FilterControl
          label="Grayscale"
          value={filters.grayscale}
          min={0}
          max={100}
          unit="%"
          onChange={value => onFilterChange({ grayscale: value })}
        />

        <FilterControl
          label="Invert"
          value={filters.invert}
          min={0}
          max={100}
          unit="%"
          onChange={value => onFilterChange({ invert: value })}
        />
      </CardBody>
    </Card>
  )
}

// Crop Tool Component
export function CropTool({
  imageDimensions,
  onCrop,
  disabled = false,
}: {
  imageDimensions: ImageDimensions
  onCrop: (cropArea: CropArea) => void
  disabled?: boolean
}) {
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: imageDimensions.width,
    height: imageDimensions.height,
  })

  useEffect(() => {
    setCropArea({
      x: 0,
      y: 0,
      width: imageDimensions.width,
      height: imageDimensions.height,
    })
  }, [imageDimensions])

  const handleCrop = () => {
    onCrop(cropArea)
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Crop</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">X Position</label>
            <input
              type="number"
              value={cropArea.x}
              min={0}
              max={imageDimensions.width - cropArea.width}
              onChange={e =>
                setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={disabled}
              aria-label="X position for crop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Y Position</label>
            <input
              type="number"
              value={cropArea.y}
              min={0}
              max={imageDimensions.height - cropArea.height}
              onChange={e =>
                setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={disabled}
              aria-label="Y position for crop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="number"
              value={cropArea.width}
              min={1}
              max={imageDimensions.width - cropArea.x}
              onChange={e =>
                setCropArea(prev => ({
                  ...prev,
                  width: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={disabled}
              aria-label="Crop width"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <input
              type="number"
              value={cropArea.height}
              min={1}
              max={imageDimensions.height - cropArea.y}
              onChange={e =>
                setCropArea(prev => ({
                  ...prev,
                  height: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={disabled}
              aria-label="Crop height"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCropArea({
                x: Math.floor(imageDimensions.width * 0.1),
                y: Math.floor(imageDimensions.height * 0.1),
                width: Math.floor(imageDimensions.width * 0.8),
                height: Math.floor(imageDimensions.height * 0.8),
              })
            }
            disabled={disabled}
            className="flex-1"
          >
            Center Crop
          </Button>

          <Button
            variant="solid"
            size="sm"
            onClick={handleCrop}
            disabled={disabled}
            className="flex-1"
          >
            Apply Crop
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

// Resize Tool Component
export function ResizeTool({
  currentDimensions,
  onResize,
  disabled = false,
}: {
  currentDimensions: ImageDimensions
  onResize: (dimensions: ImageDimensions, maintainAspectRatio: boolean) => void
  disabled?: boolean
}) {
  const [newDimensions, setNewDimensions] = useState(currentDimensions)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const aspectRatio = currentDimensions.width / currentDimensions.height

  useEffect(() => {
    setNewDimensions(currentDimensions)
  }, [currentDimensions])

  const handleWidthChange = (width: number) => {
    if (maintainAspectRatio) {
      setNewDimensions({
        width,
        height: Math.round(width / aspectRatio),
      })
    } else {
      setNewDimensions(prev => ({ ...prev, width }))
    }
  }

  const handleHeightChange = (height: number) => {
    if (maintainAspectRatio) {
      setNewDimensions({
        width: Math.round(height * aspectRatio),
        height,
      })
    } else {
      setNewDimensions(prev => ({ ...prev, height }))
    }
  }

  const handleResize = () => {
    onResize(newDimensions, maintainAspectRatio)
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Resize</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="aspectRatio"
            checked={maintainAspectRatio}
            onChange={e => setMaintainAspectRatio(e.target.checked)}
            disabled={disabled}
            aria-label="Maintain aspect ratio when resizing"
          />
          <label htmlFor="aspectRatio" className="text-sm">
            Maintain aspect ratio
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="number"
              value={newDimensions.width}
              min={1}
              max={4000}
              onChange={e => handleWidthChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={disabled}
              aria-label="Image width in pixels"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <input
              type="number"
              value={newDimensions.height}
              min={1}
              max={4000}
              onChange={e => handleHeightChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={disabled}
              aria-label="Image height in pixels"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Current: {currentDimensions.width} × {currentDimensions.height}
        </div>

        <Button
          variant="solid"
          size="sm"
          onClick={handleResize}
          disabled={
            disabled ||
            (newDimensions.width === currentDimensions.width &&
              newDimensions.height === currentDimensions.height)
          }
          className="w-full"
        >
          Apply Resize
        </Button>
      </CardBody>
    </Card>
  )
}

// Tool Panel Component
export function ToolPanel({
  onRotate,
  onFlip,
  onReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  disabled = false,
}: {
  onRotate: (degrees: number) => void
  onFlip: (horizontal: boolean) => void
  onReset: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  disabled?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Tools</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* History Controls */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={disabled || !canUndo}
            className="flex-1"
          >
            ↶ Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={disabled || !canRedo}
            className="flex-1"
          >
            ↷ Redo
          </Button>
        </div>

        {/* Rotation Controls */}
        <div>
          <h4 className="text-sm font-medium mb-2">Rotate</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate(-90)}
              disabled={disabled}
            >
              ↺ 90° Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate(90)}
              disabled={disabled}
            >
              ↻ 90° Right
            </Button>
          </div>
        </div>

        {/* Flip Controls */}
        <div>
          <h4 className="text-sm font-medium mb-2">Flip</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFlip(true)}
              disabled={disabled}
            >
              ↔ Horizontal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFlip(false)}
              disabled={disabled}
            >
              ↕ Vertical
            </Button>
          </div>
        </div>

        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={disabled}
          className="w-full text-red-600 hover:text-red-700"
        >
          🔄 Reset All
        </Button>
      </CardBody>
    </Card>
  )
}

// Main Image Editor Component
export function ImageEditor({
  initialImage,
  onSave,
  onCancel,
  className = '',
}: {
  initialImage?: File | string | undefined
  onSave?: (imageData: string) => void | undefined
  onCancel?: () => void | undefined
  className?: string | undefined
}) {
  const {
    canvasRef,
    isLoaded,
    isProcessing,
    dimensions,
    filters,
    canUndo,
    canRedo,
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
  } = useImageEditor()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<
    'filters' | 'crop' | 'resize' | 'tools'
  >('filters')

  // Load initial image
  useEffect(() => {
    if (initialImage) {
      loadImage(initialImage)
    }
  }, [initialImage, loadImage])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      loadImage(file)
    }
  }

  const handleSave = () => {
    const imageData = exportImage('image/png', 0.9)
    onSave?.(imageData)
  }

  const tabs = [
    { id: 'filters', label: 'Filters', icon: '🎨' },
    { id: 'crop', label: 'Crop', icon: '✂️' },
    { id: 'resize', label: 'Resize', icon: '📏' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
  ] as const

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Image Editor</h2>
              <div className="flex space-x-2">
                {!isLoaded && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Load Image
                  </Button>
                )}
                {isLoaded && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCancel}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={handleSave}
                      disabled={isProcessing}
                    >
                      💾 Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Select image file for editing"
            />

            {!isLoaded ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-6xl text-gray-400 mb-4">🖼️</div>
                <p className="text-lg font-medium text-gray-900">
                  Load an image to start editing
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Click here or use the Load Image button
                </p>
              </div>
            ) : (
              <div className="relative">
                {isProcessing && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin text-3xl mb-2">⚙️</div>
                      <p className="text-sm text-gray-600">Processing...</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[600px] border border-gray-200 rounded-lg shadow-sm"
                  />
                </div>

                {isLoaded && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    {dimensions.width} × {dimensions.height} pixels
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Controls Panel */}
      {isLoaded && (
        <div className="w-full lg:w-80">
          {/* Tab Navigation */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'filters' && (
            <FilterPanel
              filters={filters}
              onFilterChange={updateFilters}
              onApply={applyFilters}
              onReset={resetFilters}
              disabled={isProcessing}
            />
          )}

          {activeTab === 'crop' && (
            <CropTool
              imageDimensions={dimensions}
              onCrop={cropImage}
              disabled={isProcessing}
            />
          )}

          {activeTab === 'resize' && (
            <ResizeTool
              currentDimensions={dimensions}
              onResize={resizeImage}
              disabled={isProcessing}
            />
          )}

          {activeTab === 'tools' && (
            <ToolPanel
              onRotate={rotateImage}
              onFlip={flipImage}
              onReset={reset}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              disabled={isProcessing}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default ImageEditor
