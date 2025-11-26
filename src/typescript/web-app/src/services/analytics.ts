/**
 * Analytics & Monitoring Service
 *
 * Comprehensive user behavior tracking, collaboration analytics,
 * performance metrics collection, and real-time monitoring system.
 */

'use client'

export interface UserEvent {
  id: string
  userId: string
  sessionId: string
  eventType:
    | 'page_view'
    | 'document_open'
    | 'edit_action'
    | 'collaboration'
    | 'feature_usage'
    | 'performance'
  action: string
  metadata: Record<string, any>
  timestamp: number
  duration?: number
  documentId?: string
  workspaceId?: string
}

export interface CollaborationMetrics {
  documentId: string
  totalUsers: number
  activeUsers: number
  totalEdits: number
  conflictCount: number
  resolvedConflicts: number
  averageResponseTime: number
  sessionDuration: number
  lastActivity: number
  userContributions: Record<
    string,
    {
      edits: number
      timeSpent: number
      lastActivity: number
      conflicts: number
    }
  >
}

export interface PerformanceMetrics {
  timestamp: number
  category: 'ui' | 'network' | 'sync' | 'ai' | 'crdt'
  metric: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  metadata?: Record<string, any>
}

export interface AnalyticsSummary {
  period: 'hour' | 'day' | 'week' | 'month'
  startTime: number
  endTime: number
  totalEvents: number
  uniqueUsers: number
  totalDocuments: number
  averageSessionDuration: number
  mostUsedFeatures: Array<{ feature: string; usage: number }>
  collaborationStats: {
    totalCollaborations: number
    averageParticipants: number
    conflictRate: number
    resolutionSuccessRate: number
  }
  performanceStats: {
    averageLoadTime: number
    averageSyncTime: number
    errorRate: number
    uptime: number
  }
}

export interface AlertRule {
  id: string
  name: string
  type: 'performance' | 'error' | 'usage' | 'security'
  condition: {
    metric: string
    operator: '>' | '<' | '=' | '>=' | '<='
    threshold: number
    duration?: number
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  notifications: {
    email?: boolean
    slack?: boolean
    webhook?: string
  }
}

export interface Alert {
  id: string
  ruleId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: number
  acknowledged: boolean
  resolvedAt?: number
  metadata: Record<string, any>
}

class AnalyticsService {
  private events: UserEvent[] = []
  private collaborationMetrics: Map<string, CollaborationMetrics> = new Map()
  private performanceMetrics: PerformanceMetrics[] = []
  private alertRules: AlertRule[] = []
  private activeAlerts: Alert[] = []
  private sessionId: string
  private startTime: number

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.initializeDefaultAlertRules()
    this.startPerformanceMonitoring()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Track user events
   */
  trackEvent(event: Omit<UserEvent, 'id' | 'sessionId' | 'timestamp'>): string {
    const fullEvent: UserEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      ...event,
    }

    this.events.push(fullEvent)
    this.checkAlertRules(fullEvent)

    // Keep only last 10000 events for memory management
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000)
    }

    return fullEvent.id
  }

  /**
   * Track page views
   */
  trackPageView(
    userId: string,
    page: string,
    metadata?: Record<string, any>
  ): string {
    return this.trackEvent({
      userId,
      eventType: 'page_view',
      action: 'navigate',
      metadata: {
        page,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        ...metadata,
      },
    })
  }

  /**
   * Track document operations
   */
  trackDocumentAction(
    userId: string,
    documentId: string,
    action: string,
    metadata?: Record<string, any>
  ): string {
    return this.trackEvent({
      userId,
      documentId,
      eventType: 'document_open',
      action,
      metadata: {
        timestamp: Date.now(),
        ...metadata,
      },
    })
  }

  /**
   * Track editing actions
   */
  trackEditAction(
    userId: string,
    documentId: string,
    action: 'insert' | 'delete' | 'format' | 'undo' | 'redo',
    metadata?: Record<string, any>
  ): string {
    return this.trackEvent({
      userId,
      documentId,
      eventType: 'edit_action',
      action,
      metadata: {
        position: metadata?.position || 0,
        length: metadata?.length || 0,
        content: metadata?.content?.substring(0, 100), // Limit content for privacy
        ...metadata,
      },
    })
  }

  /**
   * Track collaboration events
   */
  trackCollaboration(
    userId: string,
    documentId: string,
    action: 'join' | 'leave' | 'conflict' | 'resolve',
    metadata?: Record<string, any>
  ): string {
    const eventId = this.trackEvent({
      userId,
      documentId,
      eventType: 'collaboration',
      action,
      metadata: metadata || {},
    })

    this.updateCollaborationMetrics(documentId, userId, action, metadata)
    return eventId
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(
    userId: string,
    feature: string,
    action: string,
    duration?: number,
    metadata?: Record<string, any>
  ): string {
    return this.trackEvent({
      userId,
      eventType: 'feature_usage',
      action: `${feature}:${action}`,
      ...(duration !== undefined && { duration }),
      metadata: {
        feature,
        ...(metadata || {}),
      },
    })
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    category: PerformanceMetrics['category'],
    metric: string,
    value: number,
    unit: PerformanceMetrics['unit'],
    metadata?: Record<string, any>
  ): void {
    const performanceEvent: PerformanceMetrics = {
      timestamp: Date.now(),
      category,
      metric,
      value,
      unit,
      ...(metadata && { metadata }),
    }

    this.performanceMetrics.push(performanceEvent)
    this.checkPerformanceAlerts(performanceEvent)

    // Keep only last 5000 performance metrics
    if (this.performanceMetrics.length > 5000) {
      this.performanceMetrics = this.performanceMetrics.slice(-5000)
    }
  }

  /**
   * Update collaboration metrics
   */
  private updateCollaborationMetrics(
    documentId: string,
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): void {
    let metrics = this.collaborationMetrics.get(documentId)

    if (!metrics) {
      metrics = {
        documentId,
        totalUsers: 0,
        activeUsers: 0,
        totalEdits: 0,
        conflictCount: 0,
        resolvedConflicts: 0,
        averageResponseTime: 0,
        sessionDuration: 0,
        lastActivity: Date.now(),
        userContributions: {},
      }
    }

    // Initialize user contribution if not exists
    if (!metrics.userContributions[userId]) {
      metrics.userContributions[userId] = {
        edits: 0,
        timeSpent: 0,
        lastActivity: Date.now(),
        conflicts: 0,
      }
    }

    const userContrib = metrics.userContributions[userId]

    switch (action) {
      case 'join':
        metrics.activeUsers++
        metrics.totalUsers = Object.keys(metrics.userContributions).length
        break

      case 'leave':
        metrics.activeUsers = Math.max(0, metrics.activeUsers - 1)
        userContrib.timeSpent += Date.now() - userContrib.lastActivity
        break

      case 'conflict':
        metrics.conflictCount++
        userContrib.conflicts++
        break

      case 'resolve':
        metrics.resolvedConflicts++
        break
    }

    userContrib.lastActivity = Date.now()
    metrics.lastActivity = Date.now()

    this.collaborationMetrics.set(documentId, metrics)
  }

  /**
   * Generate analytics summary
   */
  generateSummary(
    period: AnalyticsSummary['period'] = 'day',
    startTime?: number,
    endTime?: number
  ): AnalyticsSummary {
    const now = Date.now()
    const periodMs = this.getPeriodMs(period)

    const start = startTime || now - periodMs
    const end = endTime || now

    const filteredEvents = this.events.filter(
      event => event.timestamp >= start && event.timestamp <= end
    )

    const uniqueUsers = new Set(filteredEvents.map(e => e.userId)).size
    const totalDocuments = new Set(
      filteredEvents.filter(e => e.documentId).map(e => e.documentId)
    ).size

    // Feature usage analysis
    const featureUsage = new Map<string, number>()
    filteredEvents
      .filter(e => e.eventType === 'feature_usage')
      .forEach(event => {
        const feature = event.metadata.feature || event.action
        featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1)
      })

    const mostUsedFeatures = Array.from(featureUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([feature, usage]) => ({ feature, usage }))

    // Collaboration stats
    const collaborationEvents = filteredEvents.filter(
      e => e.eventType === 'collaboration'
    )
    const totalCollaborations = collaborationEvents.length
    const collaborationSessions = new Set(
      collaborationEvents.map(e => `${e.documentId}_${e.sessionId}`)
    ).size

    // Performance stats
    const performanceData = this.performanceMetrics.filter(
      m => m.timestamp >= start && m.timestamp <= end
    )

    return {
      period,
      startTime: start,
      endTime: end,
      totalEvents: filteredEvents.length,
      uniqueUsers,
      totalDocuments,
      averageSessionDuration:
        this.calculateAverageSessionDuration(filteredEvents),
      mostUsedFeatures,
      collaborationStats: {
        totalCollaborations,
        averageParticipants:
          collaborationSessions > 0
            ? totalCollaborations / collaborationSessions
            : 0,
        conflictRate: this.calculateConflictRate(),
        resolutionSuccessRate: this.calculateResolutionSuccessRate(),
      },
      performanceStats: {
        averageLoadTime: this.calculateAverageMetric(
          performanceData,
          'load_time'
        ),
        averageSyncTime: this.calculateAverageMetric(
          performanceData,
          'sync_time'
        ),
        errorRate: this.calculateErrorRate(filteredEvents),
        uptime: this.calculateUptime(start, end),
      },
    }
  }

  /**
   * Get collaboration metrics for a document
   */
  getCollaborationMetrics(documentId: string): CollaborationMetrics | null {
    return this.collaborationMetrics.get(documentId) || null
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData(): {
    activeUsers: number
    activeDocuments: number
    recentEvents: UserEvent[]
    performanceMetrics: PerformanceMetrics[]
    activeAlerts: Alert[]
    systemHealth: {
      status: 'healthy' | 'warning' | 'critical'
      uptime: number
      errorRate: number
      responseTime: number
    }
  } {
    const now = Date.now()
    const lastHour = now - 60 * 60 * 1000

    const recentEvents = this.events
      .filter(e => e.timestamp >= lastHour)
      .slice(-50)
      .reverse()

    const activeUsers = new Set(recentEvents.map(e => e.userId)).size

    const activeDocuments = new Set(
      recentEvents.filter(e => e.documentId).map(e => e.documentId)
    ).size

    const recentPerformance = this.performanceMetrics
      .filter(m => m.timestamp >= lastHour)
      .slice(-100)

    const systemHealth = this.calculateSystemHealth(
      recentEvents,
      recentPerformance
    )

    return {
      activeUsers,
      activeDocuments,
      recentEvents,
      performanceMetrics: recentPerformance,
      activeAlerts: this.activeAlerts.filter(a => !a.acknowledged),
      systemHealth,
    }
  }

  /**
   * Create alert rule
   */
  createAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const alertRule: AlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...rule,
    }

    this.alertRules.push(alertRule)
    return alertRule.id
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.activeAlerts.filter(alert => !alert.acknowledged)
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.activeAlerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      return true
    }
    return false
  }

  /**
   * Export analytics data
   */
  exportData(startTime?: number, endTime?: number): string {
    const data = {
      events: this.events.filter(
        e =>
          (!startTime || e.timestamp >= startTime) &&
          (!endTime || e.timestamp <= endTime)
      ),
      collaborationMetrics: Object.fromEntries(this.collaborationMetrics),
      performanceMetrics: this.performanceMetrics.filter(
        m =>
          (!startTime || m.timestamp >= startTime) &&
          (!endTime || m.timestamp <= endTime)
      ),
      summary: this.generateSummary('day', startTime, endTime),
    }

    return JSON.stringify(data, null, 2)
  }

  // Private helper methods
  private initializeDefaultAlertRules(): void {
    this.createAlertRule({
      name: 'High Error Rate',
      type: 'error',
      condition: {
        metric: 'error_rate',
        operator: '>',
        threshold: 5,
        duration: 300000, // 5 minutes
      },
      severity: 'high',
      enabled: true,
      notifications: { email: true },
    })

    this.createAlertRule({
      name: 'Slow Response Time',
      type: 'performance',
      condition: {
        metric: 'response_time',
        operator: '>',
        threshold: 2000,
        duration: 600000, // 10 minutes
      },
      severity: 'medium',
      enabled: true,
      notifications: { email: true },
    })
  }

  private startPerformanceMonitoring(): void {
    // Monitor page load performance
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime =
        window.performance.timing.loadEventEnd -
        window.performance.timing.navigationStart
      this.trackPerformance('ui', 'page_load_time', loadTime, 'ms')
    }

    // Set up periodic performance monitoring
    setInterval(() => {
      this.trackPerformance(
        'ui',
        'memory_usage',
        this.getMemoryUsage(),
        'bytes'
      )
      this.trackPerformance('ui', 'timestamp', Date.now(), 'ms')
    }, 30000) // Every 30 seconds
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.usedJSHeapSize
    }
    return 0
  }

  private getPeriodMs(period: AnalyticsSummary['period']): number {
    switch (period) {
      case 'hour':
        return 60 * 60 * 1000
      case 'day':
        return 24 * 60 * 60 * 1000
      case 'week':
        return 7 * 24 * 60 * 60 * 1000
      case 'month':
        return 30 * 24 * 60 * 60 * 1000
      default:
        return 24 * 60 * 60 * 1000
    }
  }

  private calculateAverageSessionDuration(events: UserEvent[]): number {
    const sessions = new Map<string, { start: number; end: number }>()

    events.forEach(event => {
      const session = sessions.get(event.sessionId) || {
        start: event.timestamp,
        end: event.timestamp,
      }
      session.start = Math.min(session.start, event.timestamp)
      session.end = Math.max(session.end, event.timestamp)
      sessions.set(event.sessionId, session)
    })

    const durations = Array.from(sessions.values()).map(s => s.end - s.start)
    return durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0
  }

  private calculateConflictRate(): number {
    const totalConflicts = Array.from(
      this.collaborationMetrics.values()
    ).reduce((sum, metrics) => sum + metrics.conflictCount, 0)
    const totalEdits = Array.from(this.collaborationMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.totalEdits,
      0
    )

    return totalEdits > 0 ? (totalConflicts / totalEdits) * 100 : 0
  }

  private calculateResolutionSuccessRate(): number {
    const totalConflicts = Array.from(
      this.collaborationMetrics.values()
    ).reduce((sum, metrics) => sum + metrics.conflictCount, 0)
    const resolvedConflicts = Array.from(
      this.collaborationMetrics.values()
    ).reduce((sum, metrics) => sum + metrics.resolvedConflicts, 0)

    return totalConflicts > 0 ? (resolvedConflicts / totalConflicts) * 100 : 100
  }

  private calculateAverageMetric(
    metrics: PerformanceMetrics[],
    metricName: string
  ): number {
    const filtered = metrics.filter(m => m.metric === metricName)
    return filtered.length > 0
      ? filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length
      : 0
  }

  private calculateErrorRate(events: UserEvent[]): number {
    const errorEvents = events.filter(
      e => e.action.includes('error') || e.metadata.error
    ).length

    return events.length > 0 ? (errorEvents / events.length) * 100 : 0
  }

  private calculateUptime(startTime: number, endTime: number): number {
    // Mock uptime calculation
    const totalTime = endTime - startTime
    const downtime = 0 // Mock: assume no downtime
    return ((totalTime - downtime) / totalTime) * 100
  }

  private calculateSystemHealth(
    recentEvents: UserEvent[],
    performanceMetrics: PerformanceMetrics[]
  ): {
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    errorRate: number
    responseTime: number
  } {
    const errorRate = this.calculateErrorRate(recentEvents)
    const responseTime = this.calculateAverageMetric(
      performanceMetrics,
      'response_time'
    )
    const uptime = this.calculateUptime(Date.now() - 60 * 60 * 1000, Date.now())

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (errorRate > 10 || responseTime > 3000 || uptime < 95) {
      status = 'critical'
    } else if (errorRate > 5 || responseTime > 2000 || uptime < 99) {
      status = 'warning'
    }

    return { status, uptime, errorRate, responseTime }
  }

  private checkAlertRules(event: UserEvent): void {
    // Implementation for checking alert rules against events
    // This would be expanded based on specific rule conditions
  }

  private checkPerformanceAlerts(metric: PerformanceMetrics): void {
    this.alertRules
      .filter(rule => rule.enabled && rule.type === 'performance')
      .forEach(rule => {
        if (this.evaluateCondition(metric, rule.condition)) {
          this.createAlert(rule, metric)
        }
      })
  }

  private evaluateCondition(
    metric: PerformanceMetrics,
    condition: AlertRule['condition']
  ): boolean {
    if (metric.metric !== condition.metric) return false

    switch (condition.operator) {
      case '>':
        return metric.value > condition.threshold
      case '<':
        return metric.value < condition.threshold
      case '=':
        return metric.value === condition.threshold
      case '>=':
        return metric.value >= condition.threshold
      case '<=':
        return metric.value <= condition.threshold
      default:
        return false
    }
  }

  private createAlert(rule: AlertRule, triggerData: any): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      severity: rule.severity,
      title: `Alert: ${rule.name}`,
      message: `Condition met: ${rule.condition.metric} ${rule.condition.operator} ${rule.condition.threshold}`,
      timestamp: Date.now(),
      acknowledged: false,
      metadata: { triggerData },
    }

    this.activeAlerts.push(alert)
  }
}

export const analyticsService = new AnalyticsService()
export default analyticsService
