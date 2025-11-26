/**
 * Performance Monitoring and Optimization System
 * Comprehensive performance tracking, metrics collection, and optimization recommendations
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

// Types
interface PerformanceMetrics {
  navigation: {
    loadTime: number
    domContentLoaded: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay: number
    cumulativeLayoutShift: number
    timeToInteractive: number
  }
  runtime: {
    memoryUsage: number
    renderTime: number
    bundleSize: number
    cacheHitRate: number
    apiResponseTime: number
    wsLatency: number
  }
  user: {
    sessionsCount: number
    averageSessionDuration: number
    bounceRate: number
    errorRate: number
    conversionRate: number
  }
  vitals: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
    fcp: number // First Contentful Paint
    ttfb: number // Time to First Byte
  }
}

interface OptimizationRecommendation {
  id: string
  type: 'performance' | 'bundle' | 'cache' | 'memory' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  solution: string
  estimatedImprovement: string
  implemented: boolean
}

interface PerformanceMonitorProps {
  onOptimizationApply?: (recommendationId: string) => void
  onMetricsExport?: (metrics: PerformanceMetrics) => void
}

// Mock performance data
const MOCK_METRICS: PerformanceMetrics = {
  navigation: {
    loadTime: 1234,
    domContentLoaded: 890,
    firstContentfulPaint: 1100,
    largestContentfulPaint: 1890,
    firstInputDelay: 45,
    cumulativeLayoutShift: 0.08,
    timeToInteractive: 2100,
  },
  runtime: {
    memoryUsage: 45.2,
    renderTime: 16.7,
    bundleSize: 2.4,
    cacheHitRate: 87.5,
    apiResponseTime: 245,
    wsLatency: 32,
  },
  user: {
    sessionsCount: 1247,
    averageSessionDuration: 8.5,
    bounceRate: 23.4,
    errorRate: 0.8,
    conversionRate: 12.3,
  },
  vitals: {
    lcp: 1890,
    fid: 45,
    cls: 0.08,
    fcp: 1100,
    ttfb: 340,
  },
}

const OPTIMIZATION_RECOMMENDATIONS: OptimizationRecommendation[] = [
  {
    id: '1',
    type: 'bundle',
    severity: 'high',
    title: 'Bundle Size Optimization',
    description: 'Large JavaScript bundles are affecting load times',
    impact: 'Reducing initial page load by 35%',
    solution: 'Implement code splitting and lazy loading for routes',
    estimatedImprovement: '~800ms faster load time',
    implemented: false,
  },
  {
    id: '2',
    type: 'cache',
    severity: 'medium',
    title: 'Aggressive Caching Strategy',
    description:
      'API responses and static assets could benefit from better caching',
    impact: 'Reducing server requests by 40%',
    solution: 'Implement service worker and HTTP cache headers',
    estimatedImprovement: '~200ms faster API responses',
    implemented: false,
  },
  {
    id: '3',
    type: 'performance',
    severity: 'high',
    title: 'Image Optimization',
    description: 'Large unoptimized images impacting Largest Contentful Paint',
    impact: 'Improving LCP score by 25%',
    solution: 'Use Next.js Image component with lazy loading and WebP format',
    estimatedImprovement: '~500ms better LCP',
    implemented: false,
  },
  {
    id: '4',
    type: 'memory',
    severity: 'medium',
    title: 'Memory Leak Prevention',
    description:
      'WebSocket connections and event listeners not properly cleaned up',
    impact: 'Preventing memory growth over time',
    solution: 'Implement proper cleanup in useEffect hooks',
    estimatedImprovement: '~30% less memory usage',
    implemented: false,
  },
  {
    id: '5',
    type: 'network',
    severity: 'low',
    title: 'Resource Prefetching',
    description: 'Critical resources could be prefetched for better UX',
    impact: 'Improving perceived performance',
    solution: 'Add resource hints and preload critical assets',
    estimatedImprovement: '~15% better user experience',
    implemented: false,
  },
]

export function PerformanceMonitor({
  onOptimizationApply,
  onMetricsExport,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(MOCK_METRICS)
  const [recommendations, setRecommendations] = useState(
    OPTIMIZATION_RECOMMENDATIONS
  )
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'vitals' | 'runtime' | 'recommendations'
  >('overview')

  // Collect real performance metrics
  const collectMetrics = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')

      // Core Web Vitals (simplified)
      const fcp =
        paintEntries.find(entry => entry.name === 'first-contentful-paint')
          ?.startTime || 0
      const memoryInfo = (performance as any).memory

      setMetrics(prev => ({
        ...prev,
        navigation: {
          ...prev.navigation,
          loadTime:
            navigation?.loadEventEnd - navigation?.loadEventStart ||
            prev.navigation.loadTime,
          domContentLoaded:
            navigation?.domContentLoadedEventEnd -
              navigation?.domContentLoadedEventStart ||
            prev.navigation.domContentLoaded,
          firstContentfulPaint: fcp || prev.navigation.firstContentfulPaint,
        },
        runtime: {
          ...prev.runtime,
          memoryUsage: memoryInfo
            ? memoryInfo.usedJSHeapSize / 1024 / 1024
            : prev.runtime.memoryUsage,
          renderTime: performance.now() % 100, // Simplified
        },
        vitals: {
          ...prev.vitals,
          fcp: fcp || prev.vitals.fcp,
        },
      }))
    } catch (error) {
      console.warn('Error collecting performance metrics:', error)
    }
  }, [])

  // Start monitoring
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(collectMetrics, 5000)
      return () => clearInterval(interval)
    }
  }, [isMonitoring, collectMetrics])

  // Initial metrics collection
  useEffect(() => {
    setTimeout(collectMetrics, 1000)
  }, [collectMetrics])

  // Apply optimization
  const handleApplyOptimization = useCallback(
    (recommendationId: string) => {
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendationId ? { ...rec, implemented: true } : rec
        )
      )
      onOptimizationApply?.(recommendationId)
    },
    [onOptimizationApply]
  )

  // Get performance score
  const getPerformanceScore = useMemo(() => {
    const { vitals } = metrics
    let score = 100

    // LCP score (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (vitals.lcp > 4000) score -= 30
    else if (vitals.lcp > 2500) score -= 15

    // FID score (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (vitals.fid > 300) score -= 25
    else if (vitals.fid > 100) score -= 10

    // CLS score (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (vitals.cls > 0.25) score -= 25
    else if (vitals.cls > 0.1) score -= 10

    return Math.max(0, score)
  }, [metrics])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return { text: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (score >= 70)
      return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Needs Work', color: 'bg-red-100 text-red-800' }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(1)} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Performance Monitor
          </h1>
          <p className="text-gray-600">
            Application performance metrics and optimization
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={isMonitoring ? 'solid' : 'outline'}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="ghost" onClick={() => onMetricsExport?.(metrics)}>
            Export Metrics
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Performance Score</h3>
              <p className="text-sm text-gray-600">Based on Core Web Vitals</p>
            </div>
            <div className="text-right">
              <div
                className={`text-4xl font-bold ${getScoreColor(getPerformanceScore)}`}
              >
                {getPerformanceScore}
              </div>
              <Badge className={getScoreBadge(getPerformanceScore).color}>
                {getScoreBadge(getPerformanceScore).text}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {(['overview', 'vitals', 'runtime', 'recommendations'] as const).map(
            tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Load Performance</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Page Load Time</span>
                <span className="font-medium">
                  {formatTime(metrics.navigation.loadTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  DOM Content Loaded
                </span>
                <span className="font-medium">
                  {formatTime(metrics.navigation.domContentLoaded)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Time to Interactive
                </span>
                <span className="font-medium">
                  {formatTime(metrics.navigation.timeToInteractive)}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Runtime Metrics</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="font-medium">
                  {formatBytes(metrics.runtime.memoryUsage * 1024 * 1024)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bundle Size</span>
                <span className="font-medium">
                  {formatBytes(metrics.runtime.bundleSize * 1024 * 1024)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                <span className="font-medium">
                  {metrics.runtime.cacheHitRate.toFixed(1)}%
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">User Experience</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sessions</span>
                <span className="font-medium">
                  {metrics.user.sessionsCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Avg Session Duration
                </span>
                <span className="font-medium">
                  {metrics.user.averageSessionDuration.toFixed(1)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="font-medium">
                  {metrics.user.errorRate.toFixed(1)}%
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Core Web Vitals Tab */}
      {selectedTab === 'vitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Largest Contentful Paint (LCP)',
              value: metrics.vitals.lcp,
              unit: 'ms',
              good: 2500,
              needsWork: 4000,
              description: 'Time until the largest content element is rendered',
            },
            {
              name: 'First Input Delay (FID)',
              value: metrics.vitals.fid,
              unit: 'ms',
              good: 100,
              needsWork: 300,
              description: 'Time from user interaction to browser response',
            },
            {
              name: 'Cumulative Layout Shift (CLS)',
              value: metrics.vitals.cls,
              unit: '',
              good: 0.1,
              needsWork: 0.25,
              description: 'Amount of unexpected layout shift',
            },
            {
              name: 'First Contentful Paint (FCP)',
              value: metrics.vitals.fcp,
              unit: 'ms',
              good: 1800,
              needsWork: 3000,
              description: 'Time until first content is rendered',
            },
            {
              name: 'Time to First Byte (TTFB)',
              value: metrics.vitals.ttfb,
              unit: 'ms',
              good: 800,
              needsWork: 1800,
              description: 'Time until first response byte is received',
            },
          ].map(vital => {
            const getVitalStatus = () => {
              if (vital.value <= vital.good)
                return { status: 'Good', color: 'bg-green-100 text-green-800' }
              if (vital.value <= vital.needsWork)
                return {
                  status: 'Needs Improvement',
                  color: 'bg-yellow-100 text-yellow-800',
                }
              return { status: 'Poor', color: 'bg-red-100 text-red-800' }
            }

            const status = getVitalStatus()

            return (
              <Card key={vital.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{vital.name}</h3>
                    <Badge className={status.color}>{status.status}</Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold mb-2">
                    {vital.unit === 'ms'
                      ? formatTime(vital.value)
                      : vital.value.toFixed(vital.unit === '' ? 3 : 1)}
                    {vital.unit && vital.unit !== 'ms' && vital.unit}
                  </div>
                  <p className="text-xs text-gray-600">{vital.description}</p>
                  <div className="mt-3 text-xs text-gray-500">
                    Good: ≤{vital.good}
                    {vital.unit} • Needs work: ≤{vital.needsWork}
                    {vital.unit}
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Runtime Tab */}
      {selectedTab === 'runtime' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Network Performance</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    API Response Time
                  </span>
                  <span className="font-medium">
                    {metrics.runtime.apiResponseTime}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    WebSocket Latency
                  </span>
                  <span className="font-medium">
                    {metrics.runtime.wsLatency}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache Hit Rate</span>
                  <span className="font-medium">
                    {metrics.runtime.cacheHitRate}%
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Resource Usage</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="font-medium">
                    {metrics.runtime.memoryUsage.toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bundle Size</span>
                  <span className="font-medium">
                    {metrics.runtime.bundleSize.toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Render Time</span>
                  <span className="font-medium">
                    {metrics.runtime.renderTime.toFixed(1)}ms
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Real-time monitoring status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Monitoring Status</h3>
                <Badge
                  className={
                    isMonitoring
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {isMonitoring ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 mb-4">
                {isMonitoring
                  ? 'Performance metrics are being collected every 5 seconds.'
                  : 'Start monitoring to collect real-time performance data.'}
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={collectMetrics}
                  disabled={isMonitoring}
                >
                  Collect Now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMetrics(MOCK_METRICS)}
                >
                  Reset to Mock Data
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Optimization Recommendations
            </h3>
            <Badge variant="outline">
              {recommendations.filter(r => !r.implemented).length} pending
            </Badge>
          </div>

          {recommendations.map(recommendation => (
            <Card key={recommendation.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{recommendation.title}</h4>
                      <Badge
                        className={severityColors[recommendation.severity]}
                      >
                        {recommendation.severity}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {recommendation.type}
                      </Badge>
                      {recommendation.implemented && (
                        <Badge className="bg-green-100 text-green-800">
                          Implemented
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-3">
                      {recommendation.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">
                          Impact:
                        </span>
                        <span className="text-gray-600 ml-2">
                          {recommendation.impact}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Solution:
                        </span>
                        <span className="text-gray-600 ml-2">
                          {recommendation.solution}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Estimated Improvement:
                        </span>
                        <span className="text-green-600 ml-2">
                          {recommendation.estimatedImprovement}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    {!recommendation.implemented ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleApplyOptimization(recommendation.id)
                        }
                      >
                        Apply Fix
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Applied
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default PerformanceMonitor
