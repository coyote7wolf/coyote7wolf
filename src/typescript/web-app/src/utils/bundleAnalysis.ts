/**
 * Bundle Analysis Utilities
 *
 * Tools for analyzing and optimizing bundle size and performance.
 */

import { useState, useEffect, useCallback } from 'react'

export interface BundleAnalysisData {
  bundleSize: number
  gzippedSize: number
  chunks: ChunkInfo[]
  modules: ModuleInfo[]
  assets: AssetInfo[]
  performance: PerformanceMetrics
}

export interface ChunkInfo {
  id: string
  name: string
  size: number
  files: string[]
  parents: string[]
  children: string[]
  modules: number
}

export interface ModuleInfo {
  id: string | number
  name: string
  size: number
  chunks: string[]
  issuer?: string
  reasons: ReasonInfo[]
}

export interface ReasonInfo {
  type: string
  module: string
  loc: string
}

export interface AssetInfo {
  name: string
  size: number
  chunks: string[]
  emitted: boolean
  type: 'js' | 'css' | 'image' | 'font' | 'other'
}

export interface PerformanceMetrics {
  totalSize: number
  initialChunkSize: number
  asyncChunkSize: number
  cacheableSize: number
  duplicatedModules: ModuleInfo[]
  largeModules: ModuleInfo[]
  unusedExports: string[]
}

/**
 * Hook for bundle analysis
 */
export function useBundleAnalysis() {
  const [analysisData, setAnalysisData] = useState<BundleAnalysisData | null>(
    null
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeBundleFromStats = useCallback(async (statsUrl: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch(statsUrl)
      if (!response.ok) throw new Error('Failed to fetch bundle stats')

      const stats = await response.json()
      const analysis = processBundleStats(stats)
      setAnalysisData(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze bundle')
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const analyzeBundleFromFile = useCallback(async (file: File) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const text = await file.text()
      const stats = JSON.parse(text)
      const analysis = processBundleStats(stats)
      setAnalysisData(analysis)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to parse bundle stats'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const generateReport = useCallback((): string => {
    if (!analysisData) return ''

    const { bundleSize, gzippedSize, chunks, performance } = analysisData

    return `
# Bundle Analysis Report

## Bundle Overview
- **Total Size**: ${formatBytes(bundleSize)}
- **Gzipped Size**: ${formatBytes(gzippedSize)}
- **Compression Ratio**: ${((1 - gzippedSize / bundleSize) * 100).toFixed(1)}%

## Performance Metrics
- **Initial Chunk Size**: ${formatBytes(performance.initialChunkSize)}
- **Async Chunk Size**: ${formatBytes(performance.asyncChunkSize)}
- **Cacheable Size**: ${formatBytes(performance.cacheableSize)}

## Chunks (${chunks.length} total)
${chunks.map(chunk => `- **${chunk.name}**: ${formatBytes(chunk.size)} (${chunk.modules} modules)`).join('\n')}

## Optimization Opportunities
${performance.duplicatedModules.length > 0 ? `- **${performance.duplicatedModules.length} duplicated modules** found` : ''}
${performance.largeModules.length > 0 ? `- **${performance.largeModules.length} large modules** (>100KB each)` : ''}
${performance.unusedExports.length > 0 ? `- **${performance.unusedExports.length} unused exports** detected` : ''}

## Recommendations
${generateRecommendations(analysisData)}
    `.trim()
  }, [analysisData])

  return {
    analysisData,
    isAnalyzing,
    error,
    analyzeBundleFromStats,
    analyzeBundleFromFile,
    generateReport,
  }
}

/**
 * Process webpack stats into analysis data
 */
function processBundleStats(stats: any): BundleAnalysisData {
  const { chunks = [], modules = [], assets = [] } = stats

  // Process chunks
  const processedChunks: ChunkInfo[] = chunks.map((chunk: any) => ({
    id: chunk.id,
    name: chunk.names?.[0] || chunk.id,
    size: chunk.size || 0,
    files: chunk.files || [],
    parents: chunk.parents || [],
    children: chunk.children || [],
    modules: chunk.modules?.length || 0,
  }))

  // Process modules
  const processedModules: ModuleInfo[] = modules.map((module: any) => ({
    id: module.id,
    name: module.name || module.identifier || 'unknown',
    size: module.size || 0,
    chunks: module.chunks || [],
    issuer: module.issuer,
    reasons: module.reasons || [],
  }))

  // Process assets
  const processedAssets: AssetInfo[] = assets.map((asset: any) => ({
    name: asset.name,
    size: asset.size || 0,
    chunks: asset.chunks || [],
    emitted: asset.emitted || false,
    type: getAssetType(asset.name),
  }))

  // Calculate metrics
  const totalSize = processedAssets.reduce((sum, asset) => sum + asset.size, 0)
  const initialChunks = processedChunks.filter(
    chunk => chunk.parents.length === 0
  )
  const initialChunkSize = initialChunks.reduce(
    (sum, chunk) => sum + chunk.size,
    0
  )
  const asyncChunkSize = totalSize - initialChunkSize

  // Find duplicated modules
  const moduleNames = processedModules.map(m => m.name)
  const duplicatedModules = processedModules.filter(
    (module, index) => moduleNames.indexOf(module.name) !== index
  )

  // Find large modules (>100KB)
  const largeModules = processedModules.filter(
    module => module.size > 100 * 1024
  )

  const performance: PerformanceMetrics = {
    totalSize,
    initialChunkSize,
    asyncChunkSize,
    cacheableSize: totalSize * 0.8, // Estimate
    duplicatedModules,
    largeModules,
    unusedExports: [], // Would need more analysis
  }

  return {
    bundleSize: totalSize,
    gzippedSize: Math.round(totalSize * 0.3), // Estimate
    chunks: processedChunks,
    modules: processedModules,
    assets: processedAssets,
    performance,
  }
}

/**
 * Determine asset type from filename
 */
function getAssetType(filename: string): AssetInfo['type'] {
  const ext = filename.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'js'
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'avif':
      return 'image'
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'eot':
      return 'font'
    default:
      return 'other'
  }
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(data: BundleAnalysisData): string {
  const recommendations: string[] = []
  const { performance, chunks } = data

  // Large bundle warning
  if (performance.totalSize > 2 * 1024 * 1024) {
    recommendations.push(
      '- Consider code splitting to reduce initial bundle size'
    )
  }

  // Large initial chunk warning
  if (performance.initialChunkSize > 500 * 1024) {
    recommendations.push('- Move non-critical code to async chunks')
  }

  // Duplicated modules
  if (performance.duplicatedModules.length > 0) {
    recommendations.push('- Remove duplicate modules to reduce bundle size')
  }

  // Large modules
  if (performance.largeModules.length > 0) {
    recommendations.push(
      '- Consider lazy loading or tree shaking for large modules'
    )
  }

  // Too many chunks
  if (chunks.length > 20) {
    recommendations.push(
      '- Consider consolidating small chunks to reduce HTTP requests'
    )
  }

  // Default recommendations
  if (recommendations.length === 0) {
    recommendations.push('- Bundle size looks good!')
    recommendations.push('- Consider implementing Progressive Web App features')
    recommendations.push('- Add compression (gzip/brotli) on your server')
  }

  return recommendations.join('\n')
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(
  original: number,
  compressed: number
): number {
  if (original === 0) return 0
  return (1 - compressed / original) * 100
}

/**
 * Analyze chunk loading performance
 */
export function analyzeChunkPerformance(chunks: ChunkInfo[]): {
  initialChunks: ChunkInfo[]
  asyncChunks: ChunkInfo[]
  criticalPath: ChunkInfo[]
} {
  const initialChunks = chunks.filter(chunk => chunk.parents.length === 0)
  const asyncChunks = chunks.filter(chunk => chunk.parents.length > 0)

  // Find critical path (most dependencies)
  const criticalPath = chunks
    .sort((a, b) => b.children.length - a.children.length)
    .slice(0, 5)

  return {
    initialChunks,
    asyncChunks,
    criticalPath,
  }
}

/**
 * Bundle size comparison utilities
 */
export interface BundleComparison {
  current: BundleAnalysisData
  previous: BundleAnalysisData
  changes: {
    bundleSize: number
    gzippedSize: number
    chunkCount: number
    moduleCount: number
  }
}

export function compareBundles(
  current: BundleAnalysisData,
  previous: BundleAnalysisData
): BundleComparison {
  return {
    current,
    previous,
    changes: {
      bundleSize: current.bundleSize - previous.bundleSize,
      gzippedSize: current.gzippedSize - previous.gzippedSize,
      chunkCount: current.chunks.length - previous.chunks.length,
      moduleCount: current.modules.length - previous.modules.length,
    },
  }
}

export default useBundleAnalysis
