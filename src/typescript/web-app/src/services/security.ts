/**
 * Enterprise Security Service
 *
 * Mock SSO integration, audit logging system, compliance tools,
 * and advanced security controls for enterprise deployment.
 */

'use client'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer' | 'guest'
  department?: string
  organization: string
  lastLogin?: number
  isActive: boolean
  permissions: string[]
  mfaEnabled: boolean
  securityClearance?: 'public' | 'internal' | 'confidential' | 'secret'
}

export interface SSOProvider {
  id: string
  name: string
  type: 'saml' | 'oauth' | 'ldap' | 'azure_ad' | 'google' | 'okta'
  enabled: boolean
  config: Record<string, any>
  domains: string[]
}

export interface AuditLogEntry {
  id: string
  timestamp: number
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  result: 'success' | 'failure' | 'denied'
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
    coordinates?: [number, number]
  }
  metadata: Record<string, any>
  risk: 'low' | 'medium' | 'high' | 'critical'
  category:
    | 'authentication'
    | 'authorization'
    | 'data_access'
    | 'admin'
    | 'configuration'
    | 'security'
}

export interface SecurityPolicy {
  id: string
  name: string
  type: 'password' | 'session' | 'access' | 'data' | 'audit' | 'compliance'
  enabled: boolean
  rules: Array<{
    rule: string
    description: string
    severity: 'info' | 'warning' | 'error' | 'critical'
    action: 'allow' | 'warn' | 'block' | 'audit'
  }>
  compliance: string[] // e.g., ['GDPR', 'HIPAA', 'SOX', 'SOC2']
  createdAt: number
  updatedAt: number
  enforcedAt?: number
}

export interface SecurityAlert {
  id: string
  type:
    | 'anomaly'
    | 'breach'
    | 'policy_violation'
    | 'suspicious_activity'
    | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: number
  userId?: string
  sourceIp?: string
  affectedResources: string[]
  mitigationSteps: string[]
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive'
  assignedTo?: string
  resolvedAt?: number
  metadata: Record<string, any>
}

export interface ComplianceReport {
  id: string
  type: 'GDPR' | 'HIPAA' | 'SOX' | 'SOC2' | 'ISO27001' | 'PCI_DSS'
  period: { start: number; end: number }
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending'
  score: number // 0-100
  findings: Array<{
    requirement: string
    status: 'pass' | 'fail' | 'warning'
    evidence: string
    recommendations?: string[]
  }>
  generatedAt: number
  generatedBy: string
  approvedBy?: string
  approvedAt?: number
}

export interface SessionInfo {
  id: string
  userId: string
  startTime: number
  lastActivity: number
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
  }
  isActive: boolean
  riskScore: number
  devices: Array<{
    type: 'desktop' | 'mobile' | 'tablet'
    os: string
    browser: string
  }>
}

class SecurityService {
  private users: Map<string, User> = new Map()
  private ssoProviders: SSOProvider[] = []
  private auditLogs: AuditLogEntry[] = []
  private securityPolicies: SecurityPolicy[] = []
  private securityAlerts: SecurityAlert[] = []
  private complianceReports: ComplianceReport[] = []
  private activeSessions: Map<string, SessionInfo> = new Map()
  private currentUser: User | null = null

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Mock SSO providers
    this.ssoProviders = [
      {
        id: 'azure_ad',
        name: 'Azure Active Directory',
        type: 'azure_ad',
        enabled: true,
        config: {
          tenantId: 'example-tenant-id',
          clientId: 'example-client-id',
          redirectUri: 'https://app.synccoreai.com/auth/callback',
        },
        domains: ['synccoreai.com', 'company.com'],
      },
      {
        id: 'google_workspace',
        name: 'Google Workspace',
        type: 'google',
        enabled: true,
        config: {
          clientId: 'example-google-client-id',
          redirectUri: 'https://app.synccoreai.com/auth/google/callback',
        },
        domains: ['gmail.com', 'googlemail.com'],
      },
      {
        id: 'okta',
        name: 'Okta',
        type: 'okta',
        enabled: false,
        config: {
          domain: 'company.okta.com',
          clientId: 'example-okta-client-id',
        },
        domains: ['company.com'],
      },
    ]

    // Mock users
    const mockUsers: User[] = [
      {
        id: 'user_admin',
        email: 'admin@company.com',
        name: 'System Administrator',
        role: 'admin',
        department: 'IT',
        organization: 'SyncCore AI',
        lastLogin: Date.now() - 3600000,
        isActive: true,
        permissions: ['*'],
        mfaEnabled: true,
        securityClearance: 'secret',
      },
      {
        id: 'user_editor',
        email: 'editor@company.com',
        name: 'Senior Editor',
        role: 'editor',
        department: 'Content',
        organization: 'SyncCore AI',
        lastLogin: Date.now() - 1800000,
        isActive: true,
        permissions: ['document:read', 'document:write', 'collaboration:join'],
        mfaEnabled: true,
        securityClearance: 'internal',
      },
      {
        id: 'user_viewer',
        email: 'viewer@company.com',
        name: 'Content Viewer',
        role: 'viewer',
        department: 'Marketing',
        organization: 'SyncCore AI',
        lastLogin: Date.now() - 7200000,
        isActive: true,
        permissions: ['document:read'],
        mfaEnabled: false,
        securityClearance: 'public',
      },
    ]

    mockUsers.forEach(user => this.users.set(user.id, user))

    // Mock security policies
    this.securityPolicies = [
      {
        id: 'password_policy',
        name: 'Strong Password Policy',
        type: 'password',
        enabled: true,
        rules: [
          {
            rule: 'minimum_length_12',
            description: 'Password must be at least 12 characters long',
            severity: 'error',
            action: 'block',
          },
          {
            rule: 'require_special_chars',
            description: 'Password must contain special characters',
            severity: 'error',
            action: 'block',
          },
          {
            rule: 'no_common_passwords',
            description: 'Password cannot be a common password',
            severity: 'warning',
            action: 'warn',
          },
        ],
        compliance: ['SOC2', 'ISO27001'],
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now() - 86400000 * 7,
        enforcedAt: Date.now() - 86400000 * 7,
      },
      {
        id: 'session_policy',
        name: 'Session Management Policy',
        type: 'session',
        enabled: true,
        rules: [
          {
            rule: 'max_session_duration_8h',
            description: 'Sessions expire after 8 hours',
            severity: 'info',
            action: 'allow',
          },
          {
            rule: 'concurrent_session_limit_3',
            description: 'Maximum 3 concurrent sessions per user',
            severity: 'warning',
            action: 'warn',
          },
        ],
        compliance: ['SOC2'],
        createdAt: Date.now() - 86400000 * 20,
        updatedAt: Date.now() - 86400000 * 5,
      },
    ]

    // Generate mock audit logs
    this.generateMockAuditLogs()

    // Generate mock security alerts
    this.generateMockSecurityAlerts()
  }

  private generateMockAuditLogs() {
    const actions = [
      'user:login',
      'user:logout',
      'document:create',
      'document:update',
      'document:delete',
      'document:share',
      'user:create',
      'user:update',
      'policy:update',
      'admin:config_change',
    ]

    const results: Array<'success' | 'failure' | 'denied'> = [
      'success',
      'success',
      'success',
      'failure',
      'denied',
    ]
    const categories: AuditLogEntry['category'][] = [
      'authentication',
      'authorization',
      'data_access',
      'admin',
      'configuration',
    ]
    const risks: AuditLogEntry['risk'][] = ['low', 'low', 'medium', 'high']

    for (let i = 0; i < 100; i++) {
      const timestamp = Date.now() - Math.random() * 86400000 * 7 // Last 7 days
      const userId = `user_${Math.floor(Math.random() * 3)}`

      this.auditLogs.push({
        id: `audit_${timestamp}_${i}`,
        timestamp,
        userId,
        userEmail: `user${Math.floor(Math.random() * 3)}@company.com`,
        action: actions[Math.floor(Math.random() * actions.length)]!,
        resource: 'document',
        resourceId: `doc_${Math.floor(Math.random() * 20)}`,
        result: results[Math.floor(Math.random() * results.length)]!,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: {
          country: 'United States',
          city: 'San Francisco',
          coordinates: [-122.4194, 37.7749],
        },
        metadata: {
          documentTitle: `Document ${Math.floor(Math.random() * 100)}`,
          collaborators: Math.floor(Math.random() * 5),
        },
        risk: risks[Math.floor(Math.random() * risks.length)]!,
        category: categories[Math.floor(Math.random() * categories.length)]!,
      })
    }

    // Sort by timestamp (newest first)
    this.auditLogs.sort((a, b) => b.timestamp - a.timestamp)
  }

  private generateMockSecurityAlerts() {
    const alertTypes: SecurityAlert['type'][] = [
      'anomaly',
      'breach',
      'policy_violation',
      'suspicious_activity',
    ]
    const severities: SecurityAlert['severity'][] = [
      'low',
      'medium',
      'high',
      'critical',
    ]

    for (let i = 0; i < 10; i++) {
      const timestamp = Date.now() - Math.random() * 86400000 * 3 // Last 3 days

      this.securityAlerts.push({
        id: `alert_${timestamp}_${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)]!,
        severity: severities[Math.floor(Math.random() * severities.length)]!,
        title: `Security Alert ${i + 1}`,
        description: `Suspicious activity detected from IP 192.168.1.${Math.floor(Math.random() * 255)}`,
        timestamp,
        ...(Math.random() > 0.5 && {
          userId: `user_${Math.floor(Math.random() * 3)}`,
        }),
        sourceIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
        affectedResources: [`document_${Math.floor(Math.random() * 20)}`],
        mitigationSteps: [
          'Review user activity logs',
          'Verify user identity',
          'Consider temporary access restriction',
        ],
        status: 'open',
        metadata: {
          riskScore: Math.floor(Math.random() * 100),
          detectionMethod: 'ML anomaly detection',
        },
      })
    }
  }

  /**
   * Authentication & SSO
   */
  async authenticateSSO(
    provider: string,
    token: string
  ): Promise<{
    success: boolean
    user?: User
    error?: string
  }> {
    // Mock SSO authentication
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

    const ssoProvider = this.ssoProviders.find(p => p.id === provider)
    if (!ssoProvider || !ssoProvider.enabled) {
      this.logAuditEvent(
        'anonymous',
        'sso:authenticate',
        'authentication',
        'failure',
        {
          provider,
          reason: 'Provider not found or disabled',
        }
      )
      return { success: false, error: 'SSO provider not available' }
    }

    // Mock successful authentication
    const mockUser: User = {
      id: `sso_user_${Date.now()}`,
      email: 'user@company.com',
      name: 'SSO User',
      role: 'editor',
      department: 'Engineering',
      organization: 'SyncCore AI',
      lastLogin: Date.now(),
      isActive: true,
      permissions: ['document:read', 'document:write', 'collaboration:join'],
      mfaEnabled: true,
      securityClearance: 'internal',
    }

    this.currentUser = mockUser
    this.users.set(mockUser.id, mockUser)

    this.logAuditEvent(
      mockUser.id,
      'sso:authenticate',
      'authentication',
      'success',
      {
        provider,
        userEmail: mockUser.email,
      }
    )

    return { success: true, user: mockUser }
  }

  /**
   * User management
   */
  getUser(userId: string): User | null {
    return this.users.get(userId) || null
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  updateUserPermissions(userId: string, permissions: string[]): boolean {
    const user = this.users.get(userId)
    if (!user) return false

    user.permissions = permissions
    this.users.set(userId, user)

    this.logAuditEvent(
      this.currentUser?.id || 'system',
      'user:update_permissions',
      'admin',
      'success',
      {
        targetUserId: userId,
        newPermissions: permissions,
      }
    )

    return true
  }

  /**
   * Permission checking
   */
  hasPermission(userId: string, permission: string): boolean {
    const user = this.users.get(userId)
    if (!user || !user.isActive) return false

    // Admin has all permissions
    if (user.permissions.includes('*')) return true

    // Check specific permission
    return user.permissions.includes(permission)
  }

  checkResourceAccess(
    userId: string,
    resource: string,
    action: string,
    resourceMetadata?: Record<string, any>
  ): {
    allowed: boolean
    reason?: string
    requiredClearance?: string
  } {
    const user = this.users.get(userId)
    if (!user || !user.isActive) {
      return { allowed: false, reason: 'User not found or inactive' }
    }

    // Check basic permission
    const permission = `${resource}:${action}`
    if (!this.hasPermission(userId, permission)) {
      return { allowed: false, reason: 'Insufficient permissions' }
    }

    // Check security clearance if resource requires it
    const requiredClearance = resourceMetadata?.securityClearance
    if (requiredClearance) {
      const clearanceLevels = ['public', 'internal', 'confidential', 'secret']
      const userLevel = clearanceLevels.indexOf(
        user.securityClearance || 'public'
      )
      const requiredLevel = clearanceLevels.indexOf(requiredClearance)

      if (userLevel < requiredLevel) {
        return {
          allowed: false,
          reason: 'Insufficient security clearance',
          requiredClearance,
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Audit logging
   */
  logAuditEvent(
    userId: string,
    action: string,
    category: AuditLogEntry['category'],
    result: AuditLogEntry['result'],
    metadata: Record<string, any> = {}
  ): string {
    const user = this.users.get(userId)
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId,
      userEmail: user?.email || 'unknown',
      action,
      resource: metadata.resource || 'unknown',
      resourceId: metadata.resourceId,
      result,
      ipAddress: metadata.ipAddress || '127.0.0.1',
      userAgent: metadata.userAgent || 'Unknown',
      location: metadata.location,
      metadata,
      risk: this.calculateRiskLevel(action, result, metadata),
      category,
    }

    this.auditLogs.unshift(entry) // Add to beginning

    // Keep only last 10000 entries
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(0, 10000)
    }

    // Check for suspicious patterns
    this.analyzeSuspiciousActivity(entry)

    return entry.id
  }

  private calculateRiskLevel(
    action: string,
    result: AuditLogEntry['result'],
    metadata: Record<string, any>
  ): AuditLogEntry['risk'] {
    if (result === 'failure' || result === 'denied') return 'medium'
    if (action.includes('admin') || action.includes('delete')) return 'high'
    if (action.includes('create') || action.includes('update')) return 'medium'
    return 'low'
  }

  private analyzeSuspiciousActivity(entry: AuditLogEntry) {
    // Simple anomaly detection
    const recentEntries = this.auditLogs
      .filter(log => log.timestamp > Date.now() - 300000) // Last 5 minutes
      .filter(log => log.userId === entry.userId)

    if (recentEntries.length > 50) {
      this.createSecurityAlert({
        type: 'suspicious_activity',
        severity: 'high',
        title: 'Unusual Activity Volume',
        description: `User ${entry.userEmail} has performed ${recentEntries.length} actions in the last 5 minutes`,
        userId: entry.userId,
        sourceIp: entry.ipAddress,
        affectedResources: [entry.resource],
        metadata: {
          actionCount: recentEntries.length,
          timeWindow: '5 minutes',
        },
      })
    }
  }

  /**
   * Security alerts
   */
  createSecurityAlert(
    alert: Omit<
      SecurityAlert,
      'id' | 'timestamp' | 'status' | 'mitigationSteps'
    >
  ): string {
    const fullAlert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'open',
      mitigationSteps: [
        'Review the incident details',
        'Investigate affected resources',
        'Take appropriate action based on severity',
      ],
      ...alert,
    }

    this.securityAlerts.unshift(fullAlert)
    return fullAlert.id
  }

  getSecurityAlerts(filter?: {
    severity?: SecurityAlert['severity']
    status?: SecurityAlert['status']
    limit?: number
  }): SecurityAlert[] {
    let alerts = this.securityAlerts

    if (filter?.severity) {
      alerts = alerts.filter(alert => alert.severity === filter.severity)
    }

    if (filter?.status) {
      alerts = alerts.filter(alert => alert.status === filter.status)
    }

    if (filter?.limit) {
      alerts = alerts.slice(0, filter.limit)
    }

    return alerts
  }

  /**
   * Compliance
   */
  generateComplianceReport(type: ComplianceReport['type']): ComplianceReport {
    const report: ComplianceReport = {
      id: `report_${Date.now()}`,
      type,
      period: {
        start: Date.now() - 86400000 * 30, // Last 30 days
        end: Date.now(),
      },
      status: 'compliant',
      score: 95,
      findings: [
        {
          requirement: 'User Authentication',
          status: 'pass',
          evidence: 'MFA enabled for all admin users',
        },
        {
          requirement: 'Data Encryption',
          status: 'pass',
          evidence: 'All data encrypted in transit and at rest',
        },
        {
          requirement: 'Audit Logging',
          status: 'pass',
          evidence: 'Comprehensive audit logs maintained',
        },
        {
          requirement: 'Access Controls',
          status: 'warning',
          evidence: 'Some users have overly broad permissions',
          recommendations: [
            'Review and restrict user permissions',
            'Implement principle of least privilege',
          ],
        },
      ],
      generatedAt: Date.now(),
      generatedBy: this.currentUser?.id || 'system',
    }

    this.complianceReports.unshift(report)
    return report
  }

  /**
   * Session management
   */
  createSession(
    userId: string,
    sessionInfo: Omit<SessionInfo, 'id' | 'userId' | 'startTime' | 'isActive'>
  ): string {
    const session: SessionInfo = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: Date.now(),
      isActive: true,
      ...sessionInfo,
    }

    this.activeSessions.set(session.id, session)
    return session.id
  }

  getActiveSessions(userId?: string): SessionInfo[] {
    const sessions = Array.from(this.activeSessions.values())
    return userId ? sessions.filter(s => s.userId === userId) : sessions
  }

  /**
   * Data export for compliance
   */
  exportSecurityData(startTime?: number, endTime?: number): string {
    const data = {
      auditLogs: this.auditLogs.filter(
        log =>
          (!startTime || log.timestamp >= startTime) &&
          (!endTime || log.timestamp <= endTime)
      ),
      securityAlerts: this.securityAlerts.filter(
        alert =>
          (!startTime || alert.timestamp >= startTime) &&
          (!endTime || alert.timestamp <= endTime)
      ),
      users: Array.from(this.users.values()).map(user => ({
        ...user,
        // Remove sensitive data for export
        permissions: user.permissions.length,
      })),
      policies: this.securityPolicies,
      complianceReports: this.complianceReports,
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * Get security dashboard data
   */
  getSecurityDashboard(): {
    summary: {
      totalUsers: number
      activeUsers: number
      totalSessions: number
      openAlerts: number
      criticalAlerts: number
      complianceScore: number
    }
    recentAlerts: SecurityAlert[]
    recentAuditLogs: AuditLogEntry[]
    riskDistribution: Record<string, number>
    complianceStatus: Record<string, string>
  } {
    const activeUsers = Array.from(this.users.values()).filter(
      u => u.isActive
    ).length
    const openAlerts = this.securityAlerts.filter(
      a => a.status === 'open'
    ).length
    const criticalAlerts = this.securityAlerts.filter(
      a => a.severity === 'critical' && a.status === 'open'
    ).length

    const riskDistribution = this.auditLogs.reduce(
      (acc, log) => {
        acc[log.risk] = (acc[log.risk] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      summary: {
        totalUsers: this.users.size,
        activeUsers,
        totalSessions: this.activeSessions.size,
        openAlerts,
        criticalAlerts,
        complianceScore: 95,
      },
      recentAlerts: this.securityAlerts.slice(0, 10),
      recentAuditLogs: this.auditLogs.slice(0, 20),
      riskDistribution,
      complianceStatus: {
        GDPR: 'compliant',
        SOC2: 'compliant',
        ISO27001: 'partial',
        HIPAA: 'not_applicable',
      },
    }
  }
}

export const securityService = new SecurityService()
export default securityService
