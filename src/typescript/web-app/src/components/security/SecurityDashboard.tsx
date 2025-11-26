/**
 * Security Dashboard Component
 *
 * Enterprise security monitoring dashboard with audit logs,
 * security alerts, compliance status, and user management.
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import securityService, {
  User,
  AuditLogEntry,
  SecurityAlert,
  SecurityPolicy,
  ComplianceReport,
} from '@/services/security'

// Mock icons as simple components
const ShieldIcon = ({ className }: { className?: string }) => (
  <span className={className}>🛡️</span>
)
const UsersIcon = ({ className }: { className?: string }) => (
  <span className={className}>👥</span>
)
const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <span className={className}>⚠️</span>
)
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <span className={className}>✅</span>
)
const XCircleIcon = ({ className }: { className?: string }) => (
  <span className={className}>❌</span>
)
const ClockIcon = ({ className }: { className?: string }) => (
  <span className={className}>⏰</span>
)
const FileTextIcon = ({ className }: { className?: string }) => (
  <span className={className}>📄</span>
)
const SettingsIcon = ({ className }: { className?: string }) => (
  <span className={className}>⚙️</span>
)
const RefreshCwIcon = ({ className }: { className?: string }) => (
  <span className={className}>🔄</span>
)
const DownloadIcon = ({ className }: { className?: string }) => (
  <span className={className}>⬇️</span>
)
const LockIcon = ({ className }: { className?: string }) => (
  <span className={className}>🔒</span>
)
const UnlockIcon = ({ className }: { className?: string }) => (
  <span className={className}>🔓</span>
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

export interface SecurityDashboardProps {
  currentUserId: string
  refreshInterval?: number
  className?: string
}

export function SecurityDashboard(props: SecurityDashboardProps) {
  const {
    currentUserId,
    refreshInterval = 30000, // 30 seconds
    className,
  } = props

  // State
  const [dashboardData, setDashboardData] = useState(
    securityService.getSecurityDashboard()
  )
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'alerts' | 'audit' | 'compliance' | 'users'
  >('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  // Refresh dashboard data
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const newData = securityService.getSecurityDashboard()
      setDashboardData(newData)
      setLastRefresh(Date.now())
    } catch (error) {
      console.error('Failed to refresh security data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshData, refreshInterval])

  // Event handlers
  const handleExportData = () => {
    const data = securityService.exportSecurityData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-data-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateComplianceReport = (type: ComplianceReport['type']) => {
    const report = securityService.generateComplianceReport(type)
    console.log('Generated compliance report:', report)
    refreshData()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'outline'
      case 'high':
        return 'outline'
      case 'medium':
        return 'subtle'
      case 'low':
        return 'ghost'
      default:
        return 'ghost'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'solid'
      case 'non_compliant':
        return 'outline'
      case 'partial':
        return 'subtle'
      case 'pending':
        return 'ghost'
      default:
        return 'ghost'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatRiskLevel = (risk: string) => {
    return risk.charAt(0).toUpperCase() + risk.slice(1)
  }

  return (
    <div className={cn('security-dashboard space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldIcon className="w-6 h-6" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Enterprise security monitoring and compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.summary.activeUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              of {dashboardData.summary.totalUsers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <AlertTriangleIcon className="w-4 h-4" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.summary.openAlerts}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardData.summary.criticalAlerts} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <LockIcon className="w-4 h-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.summary.totalSessions}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.summary.complianceScore}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Overall score</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {(
            [
              { id: 'overview', label: 'Overview', icon: ShieldIcon },
              {
                id: 'alerts',
                label: 'Security Alerts',
                icon: AlertTriangleIcon,
              },
              { id: 'audit', label: 'Audit Logs', icon: FileTextIcon },
              { id: 'compliance', label: 'Compliance', icon: CheckCircleIcon },
              { id: 'users', label: 'User Management', icon: UsersIcon },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={cn(
                'flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dashboardData.riskDistribution).map(
                    ([risk, count]) => (
                      <div
                        key={risk}
                        className="text-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="text-lg font-semibold">{count}</div>
                        <p className="text-sm text-gray-600">
                          {formatRiskLevel(risk)} Risk
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dashboardData.complianceStatus).map(
                    ([standard, status]) => (
                      <div
                        key={standard}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{standard}</span>
                        <Badge variant={getStatusColor(status)}>
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'alerts' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dashboardData.recentAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="ghost">{alert.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        {alert.sourceIp && <span>IP: {alert.sourceIp}</span>}
                        {alert.userId && <span>User: {alert.userId}</span>}
                      </div>
                      {alert.mitigationSteps.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Mitigation Steps:
                          </p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {alert.mitigationSteps
                              .slice(0, 2)
                              .map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {dashboardData.recentAlerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No security alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'audit' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dashboardData.recentAuditLogs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-3 border-l-4 border-l-blue-200 bg-gray-50 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.action}</span>
                        <Badge
                          variant={
                            log.result === 'success' ? 'solid' : 'outline'
                          }
                        >
                          {log.result}
                        </Badge>
                        <Badge variant="ghost">
                          {formatRiskLevel(log.risk)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{log.userEmail}</span>
                        <span>{log.ipAddress}</span>
                        <span>{formatTimestamp(log.timestamp)}</span>
                        <span>{log.category}</span>
                      </div>
                      {log.resourceId && (
                        <p className="text-xs text-gray-600 mt-1">
                          Resource: {log.resource} ({log.resourceId})
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {dashboardData.recentAuditLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No audit logs available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'compliance' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(['GDPR', 'SOC2', 'ISO27001', 'HIPAA'] as const).map(
                    type => (
                      <Button
                        key={type}
                        onClick={() => handleGenerateComplianceReport(type)}
                        variant="outline"
                        className="h-auto py-3 flex-col gap-1"
                      >
                        <FileTextIcon className="w-5 h-5" />
                        Generate {type}
                      </Button>
                    )
                  )}
                </div>

                <div className="text-center py-8 text-gray-500">
                  <FileTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Click above to generate compliance reports</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>User management interface would be implemented here</p>
                <p className="text-sm mt-1">
                  Features: User roles, permissions, MFA status, security
                  clearance
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div>Last updated: {formatTimestamp(lastRefresh)}</div>
        <div className="flex items-center gap-2">
          <LockIcon className="w-4 h-4" />
          <span>Secure connection established</span>
        </div>
      </div>
    </div>
  )
}

export default SecurityDashboard
