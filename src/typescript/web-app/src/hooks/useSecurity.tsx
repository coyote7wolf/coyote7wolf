/**
 * Security Hook
 *
 * React hook for integrating security features with components,
 * providing authentication, authorization, and audit logging.
 */

'use client'
/** @jsxImportSource react */

import React, { useState, useEffect, useCallback } from 'react'
import {
  securityService,
  User,
  AuditLogEntry,
  SecurityAlert,
  SessionInfo,
} from '../services/security'

export interface UseSecurityOptions {
  userId?: string
  autoLogin?: boolean
  trackActions?: boolean
  sessionTimeout?: number
}

export interface SecurityHookResult {
  // Authentication state
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Authentication actions
  loginSSO: (
    provider: string,
    token: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => void

  // Authorization
  hasPermission: (permission: string) => boolean
  checkResourceAccess: (
    resource: string,
    action: string,
    metadata?: Record<string, any>
  ) => { allowed: boolean; reason?: string }

  // Audit logging
  logAction: (
    action: string,
    category: AuditLogEntry['category'],
    metadata?: Record<string, any>
  ) => string
  logSecurityEvent: (
    action: string,
    result: 'success' | 'failure' | 'denied',
    metadata?: Record<string, any>
  ) => string

  // Security monitoring
  getSecurityAlerts: (filter?: {
    severity?: SecurityAlert['severity']
    limit?: number
  }) => SecurityAlert[]
  createSecurityAlert: (
    alert: Omit<
      SecurityAlert,
      'id' | 'timestamp' | 'status' | 'mitigationSteps'
    >
  ) => string

  // Session management
  getCurrentSession: () => SessionInfo | null
  getActiveSessions: () => SessionInfo[]

  // Data export
  exportSecurityData: (startTime?: number, endTime?: number) => string

  // Dashboard data
  getSecurityDashboard: () => ReturnType<
    typeof securityService.getSecurityDashboard
  >
}

export function useSecurity(
  options: UseSecurityOptions = {}
): SecurityHookResult {
  const {
    userId,
    autoLogin = false,
    trackActions = true,
    sessionTimeout = 8 * 60 * 60 * 1000, // 8 hours
  } = options

  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null)

  // Initialize user session
  useEffect(() => {
    if (userId) {
      const user = securityService.getUser(userId)
      if (user) {
        setCurrentUser(user)
        setIsAuthenticated(true)

        // Create session
        const sessionId = securityService.createSession(userId, {
          lastActivity: Date.now(),
          ipAddress: '127.0.0.1', // Mock IP
          userAgent: navigator.userAgent,
          location: { country: 'US', city: 'San Francisco' },
          riskScore: 10,
          devices: [
            {
              type: 'desktop',
              os: navigator.platform,
              browser: navigator.userAgent.includes('Chrome')
                ? 'Chrome'
                : 'Other',
            },
          ],
        })

        // Mock session info (in real app, would get from service)
        setCurrentSession({
          id: sessionId,
          userId,
          startTime: Date.now(),
          lastActivity: Date.now(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          isActive: true,
          riskScore: 10,
          devices: [
            {
              type: 'desktop',
              os: navigator.platform,
              browser: 'Chrome',
            },
          ],
        })

        if (trackActions) {
          securityService.logAuditEvent(
            userId,
            'session:initialize',
            'authentication',
            'success',
            { sessionId, autoLogin }
          )
        }
      }
    }
  }, [userId, autoLogin, trackActions])

  // Session timeout handling
  useEffect(() => {
    if (!isAuthenticated || !sessionTimeout) return

    const checkSession = () => {
      const now = Date.now()
      if (
        currentSession &&
        now - currentSession.lastActivity > sessionTimeout
      ) {
        logout()
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [isAuthenticated, sessionTimeout, currentSession])

  // Authentication actions
  const loginSSO = useCallback(
    async (provider: string, token: string) => {
      setIsLoading(true)

      try {
        const result = await securityService.authenticateSSO(provider, token)

        if (result.success && result.user) {
          setCurrentUser(result.user)
          setIsAuthenticated(true)

          // Create session
          const sessionId = securityService.createSession(result.user.id, {
            lastActivity: Date.now(),
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            location: { country: 'US', city: 'San Francisco' },
            riskScore: 15,
            devices: [
              {
                type: 'desktop',
                os: navigator.platform,
                browser: 'Chrome',
              },
            ],
          })

          setCurrentSession({
            id: sessionId,
            userId: result.user.id,
            startTime: Date.now(),
            lastActivity: Date.now(),
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            isActive: true,
            riskScore: 15,
            devices: [
              {
                type: 'desktop',
                os: navigator.platform,
                browser: 'Chrome',
              },
            ],
          })

          if (trackActions) {
            securityService.logAuditEvent(
              result.user.id,
              'sso:login_success',
              'authentication',
              'success',
              { provider, userEmail: result.user.email }
            )
          }
        }

        return result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed'

        if (trackActions) {
          securityService.logAuditEvent(
            'anonymous',
            'sso:login_failure',
            'authentication',
            'failure',
            { provider, error: errorMessage }
          )
        }

        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [trackActions]
  )

  const logout = useCallback(() => {
    if (currentUser && trackActions) {
      securityService.logAuditEvent(
        currentUser.id,
        'session:logout',
        'authentication',
        'success',
        { sessionId: currentSession?.id }
      )
    }

    setCurrentUser(null)
    setIsAuthenticated(false)
    setCurrentSession(null)
  }, [currentUser, currentSession, trackActions])

  // Authorization
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!currentUser) return false
      return securityService.hasPermission(currentUser.id, permission)
    },
    [currentUser]
  )

  const checkResourceAccess = useCallback(
    (resource: string, action: string, metadata?: Record<string, any>) => {
      if (!currentUser) {
        return { allowed: false, reason: 'Not authenticated' }
      }

      const result = securityService.checkResourceAccess(
        currentUser.id,
        resource,
        action,
        metadata
      )

      if (trackActions) {
        securityService.logAuditEvent(
          currentUser.id,
          `${resource}:${action}_check`,
          'authorization',
          result.allowed ? 'success' : 'denied',
          { resource, action, reason: result.reason, ...metadata }
        )
      }

      return result
    },
    [currentUser, trackActions]
  )

  // Audit logging
  const logAction = useCallback(
    (
      action: string,
      category: AuditLogEntry['category'],
      metadata: Record<string, any> = {}
    ): string => {
      if (!currentUser) return ''

      return securityService.logAuditEvent(
        currentUser.id,
        action,
        category,
        'success',
        {
          userAgent: navigator.userAgent,
          ipAddress: currentSession?.ipAddress || '127.0.0.1',
          sessionId: currentSession?.id,
          ...metadata,
        }
      )
    },
    [currentUser, currentSession]
  )

  const logSecurityEvent = useCallback(
    (
      action: string,
      result: 'success' | 'failure' | 'denied',
      metadata: Record<string, any> = {}
    ): string => {
      return securityService.logAuditEvent(
        currentUser?.id || 'anonymous',
        action,
        'security',
        result,
        {
          userAgent: navigator.userAgent,
          ipAddress: currentSession?.ipAddress || '127.0.0.1',
          sessionId: currentSession?.id,
          ...metadata,
        }
      )
    },
    [currentUser, currentSession]
  )

  // Security monitoring
  const getSecurityAlerts = useCallback(
    (filter?: { severity?: SecurityAlert['severity']; limit?: number }) => {
      return securityService.getSecurityAlerts(filter)
    },
    []
  )

  const createSecurityAlert = useCallback(
    (
      alert: Omit<
        SecurityAlert,
        'id' | 'timestamp' | 'status' | 'mitigationSteps'
      >
    ): string => {
      const alertId = securityService.createSecurityAlert(alert)

      if (trackActions && currentUser) {
        securityService.logAuditEvent(
          currentUser.id,
          'security:alert_created',
          'security',
          'success',
          { alertId, alertType: alert.type, severity: alert.severity }
        )
      }

      return alertId
    },
    [currentUser, trackActions]
  )

  // Session management
  const getCurrentSession = useCallback((): SessionInfo | null => {
    return currentSession
  }, [currentSession])

  const getActiveSessions = useCallback((): SessionInfo[] => {
    return securityService.getActiveSessions(currentUser?.id)
  }, [currentUser])

  // Data export
  const exportSecurityData = useCallback(
    (startTime?: number, endTime?: number): string => {
      if (trackActions && currentUser) {
        securityService.logAuditEvent(
          currentUser.id,
          'security:data_export',
          'admin',
          'success',
          { startTime, endTime }
        )
      }

      return securityService.exportSecurityData(startTime, endTime)
    },
    [currentUser, trackActions]
  )

  // Dashboard data
  const getSecurityDashboard = useCallback(() => {
    return securityService.getSecurityDashboard()
  }, [])

  return {
    // Authentication state
    currentUser,
    isAuthenticated,
    isLoading,

    // Authentication actions
    loginSSO,
    logout,

    // Authorization
    hasPermission,
    checkResourceAccess,

    // Audit logging
    logAction,
    logSecurityEvent,

    // Security monitoring
    getSecurityAlerts,
    createSecurityAlert,

    // Session management
    getCurrentSession,
    getActiveSessions,

    // Data export
    exportSecurityData,

    // Dashboard data
    getSecurityDashboard,
  }
}

// Higher-order component for route protection
export function withSecurityCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions: string[],
  options?: {
    redirectTo?: string
    showUnauthorized?: boolean
  }
) {
  return function SecurityWrapper(props: P & { userId?: string }) {
    const { userId, ...componentProps } = props
    const security = useSecurity({
      ...(userId ? { userId } : {}),
      trackActions: true,
    })

    const hasAllPermissions = requiredPermissions.every(permission =>
      security.hasPermission(permission)
    )

    if (!security.isAuthenticated) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Please log in to access this feature</p>
        </div>
      )
    }

    if (!hasAllPermissions) {
      if (options?.showUnauthorized !== false) {
        return (
          <div className="text-center py-8">
            <p className="text-red-600">
              You don't have permission to access this feature
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Required permissions: {requiredPermissions.join(', ')}
            </p>
          </div>
        )
      }
      return null
    }

    return React.createElement(WrappedComponent, componentProps as P)
  }
}

export default useSecurity
