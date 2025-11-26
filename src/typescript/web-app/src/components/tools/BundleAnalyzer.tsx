/**
 * Bundle Analyzer Component
 *
 * Interactive component for analyzing and visualizing bundle composition
 */

'use client'

import { useState, useCallback } from 'react'
import {
  useBundleAnalysis,
  formatBytes,
  BundleAnalysisData,
  ChunkInfo,
} from '@/utils/bundleAnalysis'

interface BundleAnalyzerProps {
  className?: string
  onAnalysisComplete?: (data: BundleAnalysisData) => void
}

export function BundleAnalyzer({
  className = '',
  onAnalysisComplete,
}: BundleAnalyzerProps) {
  const {
    analysisData,
    isAnalyzing,
    error,
    analyzeBundleFromFile,
    generateReport,
  } = useBundleAnalysis()

  const [activeTab, setActiveTab] = useState<
    'overview' | 'chunks' | 'modules' | 'assets'
  >('overview')
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        await analyzeBundleFromFile(file)
        if (analysisData) {
          onAnalysisComplete?.(analysisData)
        }
      } catch (err) {
        console.error('Failed to analyze bundle:', err)
      }
    },
    [analyzeBundleFromFile, analysisData, onAnalysisComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const jsonFile = files.find(file => file.name.endsWith('.json'))

      if (jsonFile) {
        handleFileUpload(jsonFile)
      }
    },
    [handleFileUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const downloadReport = useCallback(() => {
    const report = generateReport()
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bundle-analysis-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [generateReport])

  if (!analysisData) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bundle Analyzer
          </h3>

          {/* File Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 transition-colors
              ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
              ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400'}
            `}
            onDrop={handleDrop}
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Analyzing bundle...</span>
              </div>
            ) : (
              <>
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-600 mb-4">
                  Drop your webpack stats.json file here or click to select
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bundle-file-input"
                />
                <label
                  htmlFor="bundle-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Select File
                </label>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-2">
              How to generate webpack stats:
            </h4>
            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
              <code className="block">
                npx webpack --profile --json &gt; stats.json
              </code>
              <p className="mt-2">Or for Next.js:</p>
              <code className="block">
                npm run build -- --profile --json &gt; stats.json
              </code>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Bundle Analysis
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadReport}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Report
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh Analysis"
              aria-label="Refresh Analysis"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-600 font-medium">Total Size</div>
            <div className="text-lg font-bold text-blue-900">
              {formatBytes(analysisData.bundleSize)}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-green-600 font-medium">Gzipped</div>
            <div className="text-lg font-bold text-green-900">
              {formatBytes(analysisData.gzippedSize)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-sm text-purple-600 font-medium">Chunks</div>
            <div className="text-lg font-bold text-purple-900">
              {analysisData.chunks.length}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-sm text-orange-600 font-medium">Modules</div>
            <div className="text-lg font-bold text-orange-900">
              {analysisData.modules.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'chunks', label: 'Chunks' },
            { id: 'modules', label: 'Modules' },
            { id: 'assets', label: 'Assets' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'overview' && <OverviewTab data={analysisData} />}
        {activeTab === 'chunks' && <ChunksTab chunks={analysisData.chunks} />}
        {activeTab === 'modules' && (
          <ModulesTab modules={analysisData.modules} />
        )}
        {activeTab === 'assets' && <AssetsTab assets={analysisData.assets} />}
      </div>
    </div>
  )
}

function OverviewTab({ data }: { data: BundleAnalysisData }) {
  const { performance } = data

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          Performance Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Initial Chunk</div>
            <div className="font-semibold">
              {formatBytes(performance.initialChunkSize)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Async Chunks</div>
            <div className="font-semibold">
              {formatBytes(performance.asyncChunkSize)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Cacheable</div>
            <div className="font-semibold">
              {formatBytes(performance.cacheableSize)}
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          Optimization Opportunities
        </h4>
        <div className="space-y-3">
          {performance.duplicatedModules.length > 0 && (
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
              <svg
                className="w-5 h-5 text-yellow-500 mr-2"
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
              <span className="text-yellow-800">
                {performance.duplicatedModules.length} duplicated modules found
              </span>
            </div>
          )}

          {performance.largeModules.length > 0 && (
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded">
              <svg
                className="w-5 h-5 text-orange-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-orange-800">
                {performance.largeModules.length} modules larger than 100KB
              </span>
            </div>
          )}

          {performance.duplicatedModules.length === 0 &&
            performance.largeModules.length === 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-green-800">No major issues detected</span>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

function ChunksTab({ chunks }: { chunks: ChunkInfo[] }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Chunks ({chunks.length})</h4>
      <div className="space-y-2">
        {chunks.map(chunk => (
          <div
            key={chunk.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div>
              <div className="font-medium text-gray-900">{chunk.name}</div>
              <div className="text-sm text-gray-500">
                {chunk.modules} modules
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatBytes(chunk.size)}</div>
              <div className="text-sm text-gray-500">
                {chunk.files.length} files
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModulesTab({ modules }: { modules: any[] }) {
  const sortedModules = modules.sort((a, b) => b.size - a.size).slice(0, 50)

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Top Modules (by size)</h4>
      <div className="space-y-2">
        {sortedModules.map((module, index) => (
          <div
            key={module.id || index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {module.name}
              </div>
              <div className="text-sm text-gray-500">ID: {module.id}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatBytes(module.size)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssetsTab({ assets }: { assets: any[] }) {
  const sortedAssets = assets.sort((a, b) => b.size - a.size)

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Assets ({assets.length})</h4>
      <div className="space-y-2">
        {sortedAssets.map((asset, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {asset.name}
              </div>
              <div className="text-sm text-gray-500">Type: {asset.type}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatBytes(asset.size)}</div>
              {asset.emitted && (
                <div className="text-xs text-green-600">Emitted</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BundleAnalyzer
