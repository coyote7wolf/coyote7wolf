/**
 * Analytics Dashboard Component
 *
 * Comprehensive analytics and monitoring dashboard with real-time
 * insights, performance metrics, and collaboration analytics.
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import analyticsService, {
  UserEvent,
  PerformanceMetrics,
  Alert,
  AnalyticsSummary,
  CollaborationMetrics,
} from '@/services/analytics'

// Mock icons as simple components
const BarChartIcon = ({ className }: { className?: string }) => (
  <span className={className}>📊</span>
)
const UsersIcon = ({ className }: { className?: string }) => (
  <span className={className}>👥</span>
)
const FileTextIcon = ({ className }: { className?: string }) => (
  <span className={className}>📄</span>
)
const ClockIcon = ({ className }: { className?: string }) => (
  <span className={className}>⏰</span>
)
const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <span className={className}>⚠️</span>
)
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <span className={className}>📈</span>
)
const ActivityIcon = ({ className }: { className?: string }) => (
  <span className={className}>⚡</span>
)
const ShieldIcon = ({ className }: { className?: string }) => (
  <span className={className}>🛡️</span>
)
const RefreshCwIcon = ({ className }: { className?: string }) => (
  <span className={className}>🔄</span>
)
const DownloadIcon = ({ className }: { className?: string }) => (
  <span className={className}>⬇️</span>
)
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <span className={className}>✅</span>
)
const XCircleIcon = ({ className }: { className?: string }) => (
  <span className={className}>❌</span>
)

// Mock Card components
const CardHeader = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <div className={`card-header ${className || ''}`}>{children}</div>
const CardTitle = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <h3 className={`card-title ${className || ''}`}>{children}</h3>
const CardContent = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <div className={`card-content ${className || ''}`}>{children}</div>

// Mock utility function
const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(' ')

export interface AnalyticsDashboardProps {
  userId: string
  workspaceId?: string
  refreshInterval?: number
  className?: string
}

export function AnalyticsDashboard(props: AnalyticsDashboardProps) {
  const {
    userId,
    workspaceId,
    refreshInterval = 30000, // 30 seconds
    className,
  } = props

  // State
  const [dashboardData, setDashboardData] = useState(
    analyticsService.getDashboardData()
  )
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<
    'hour' | 'day' | 'week' | 'month'
  >('day')
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  // Refresh dashboard data
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const newDashboardData = analyticsService.getDashboardData()
      const newSummary = analyticsService.generateSummary(selectedPeriod)

      setDashboardData(newDashboardData)
      setSummary(newSummary)
      setLastRefresh(Date.now())
    } catch (error) {
      console.error('Failed to refresh analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedPeriod])

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshData, refreshInterval])

  // Initial load
  useEffect(() => {
    refreshData()
  }, [selectedPeriod, refreshData])

  // Event handlers
  const handlePeriodChange = (period: typeof selectedPeriod) => {
    setSelectedPeriod(period)
  }

  const handleExportData = () => {
    const data = analyticsService.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-data-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    analyticsService.acknowledgeAlert(alertId)
    refreshData()
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'solid'
      case 'warning':
        return 'outline'
      case 'critical':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
    return `${(ms / 3600000).toFixed(1)}h`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className={cn('analytics-dashboard space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time insights and performance monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['hour', 'day', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-colors',
                  selectedPeriod === period
                    ? 'bg-white shadow-sm font-medium'
                    : 'hover:bg-gray-50'
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          <Button onClick={refreshData} disabled={isLoading} className="gap-1">
            <RefreshCwIcon
              className={cn('w-4 h-4', isLoading ? 'animate-spin' : '')}
            />
            Refresh
          </Button>

          <Button
            onClick={handleExportData}
            variant="outline"
            className="gap-1"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant={getHealthStatusColor(
                  dashboardData.systemHealth.status
                )}
              >
                {dashboardData.systemHealth.status}
              </Badge>
              <span className="text-lg font-semibold">
                {dashboardData.systemHealth.uptime.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Response: {dashboardData.systemHealth.responseTime.toFixed(0)}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.activeUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <FileTextIcon className="w-4 h-4" />
              Active Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.activeDocuments}
            </div>
            <p className="text-xs text-gray-500 mt-1">Being edited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <AlertTriangleIcon className="w-4 h-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.activeAlerts.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(summary.totalEvents)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary.period} period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unique Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.uniqueUsers}</div>
              <p className="text-xs text-gray-500 mt-1">Active participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(summary.averageSessionDuration)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Session duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.collaborationStats.resolutionSuccessRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Conflict resolution</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.recentEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ActivityIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {event.action}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.eventType}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      User: {event.userId.slice(0, 8)}...
                      {event.documentId &&
                        ` • Doc: ${event.documentId.slice(0, 8)}...`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {dashboardData.recentEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ActivityIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.activeAlerts.map(alert => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <Badge
                      variant={
                        alert.severity === 'critical' ? 'outline' : 'solid'
                      }
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full text-xs"
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}

              {dashboardData.activeAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary && (
              <>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    {summary.performanceStats.averageLoadTime.toFixed(0)}ms
                  </div>
                  <p className="text-sm text-gray-600">Avg Load Time</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    {summary.performanceStats.averageSyncTime.toFixed(0)}ms
                  </div>
                  <p className="text-sm text-gray-600">Avg Sync Time</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    {summary.performanceStats.errorRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Error Rate</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    {summary.performanceStats.uptime.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
              </>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-medium mb-2">Recent Metrics</h4>
            {dashboardData.performanceMetrics
              .slice(-10)
              .map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {metric.category}
                    </Badge>
                    <span className="text-sm">{metric.metric}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {metric.value.toFixed(
                        metric.unit === 'percentage' ? 1 : 0
                      )}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      {metric.unit}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage */}
      {summary && summary.mostUsedFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5" />
              Most Used Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.mostUsedFeatures.slice(0, 8).map((feature, index) => (
                <div key={feature.feature} className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {feature.feature}
                      </span>
                      <span className="text-sm text-gray-600">
                        {feature.usage}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        data-width={`${(feature.usage / (summary.mostUsedFeatures[0]?.usage || 1)) * 100}%`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div>Last updated: {new Date(lastRefresh).toLocaleTimeString()}</div>
        <div>
          {summary && (
            <span>
              Showing data from{' '}
              {new Date(summary.startTime).toLocaleDateString()} to{' '}
              {new Date(summary.endTime).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
