/**
 * Routing Utilities and Guards
 *
 * Provides route guards, navigation utilities, breadcrumb generation,
 * and route validation for secure and consistent navigation.
 */

import {
  ROUTES,
  RouteConfig,
  RouteKey,
  RouteParams,
  RoutePermission,
  NAVIGATION,
  NavigationItem,
} from './routes'
import { UserRole } from '@/config/constants'

/**
 * User Session Interface (will be replaced with actual auth store)
 */
export interface UserSession {
  isAuthenticated: boolean
  isVerified: boolean
  isPremium: boolean
  roles: UserRole[]
  permissions: string[]
}

/**
 * Route Guard Result
 */
export interface RouteGuardResult {
  allowed: boolean
  redirectTo?: string
  reason?: string
}

/**
 * Breadcrumb Item
 */
export interface BreadcrumbItem {
  key: RouteKey
  label: string
  path: string
  isCurrentPage: boolean
}

/**
 * Navigation State
 */
export interface NavigationState {
  currentRoute: RouteKey | undefined
  previousRoute: RouteKey | undefined
  breadcrumbs: BreadcrumbItem[]
  canGoBack: boolean
  canGoForward: boolean
}

/**
 * Route Utilities Class
 */
export class RouteUtils {
  /**
   * Build route path with parameters
   */
  static buildPath(routeKey: RouteKey, params: RouteParams = {}): string {
    const route = ROUTES[routeKey]
    if (!route) {
      throw new Error(`Route '${routeKey}' not found`)
    }

    let path = route.path

    // Replace dynamic segments with actual values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        path = path.replace(`[${key}]`, encodeURIComponent(value))
      }
    })

    return path
  }

  /**
   * Extract parameters from path
   */
  static extractParams(routeKey: RouteKey, actualPath: string): RouteParams {
    const route = ROUTES[routeKey]
    if (!route) {
      return {}
    }

    const routeSegments = route.path.split('/')
    const pathSegments = actualPath.split('/')
    const params: RouteParams = {}

    routeSegments.forEach((segment, index) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1)
        const paramValue = pathSegments[index]
        if (paramValue) {
          params[paramName] = decodeURIComponent(paramValue)
        }
      }
    })

    return params
  }

  /**
   * Find route by path
   */
  static findRouteByPath(
    path: string
  ): { routeKey: RouteKey; config: RouteConfig; params: RouteParams } | null {
    for (const [routeKey, config] of Object.entries(ROUTES)) {
      const routePath = config.path

      // Exact match
      if (routePath === path) {
        return {
          routeKey: routeKey as RouteKey,
          config,
          params: {},
        }
      }

      // Dynamic route match
      if (routePath.includes('[') && routePath.includes(']')) {
        const routePattern = routePath.replace(/\[([^\]]+)\]/g, '([^/]+)')
        const regex = new RegExp(`^${routePattern}$`)
        const match = path.match(regex)

        if (match) {
          const params = this.extractParams(routeKey as RouteKey, path)
          return {
            routeKey: routeKey as RouteKey,
            config,
            params,
          }
        }
      }
    }

    return null
  }

  /**
   * Check if route exists
   */
  static routeExists(routeKey: string): routeKey is RouteKey {
    return routeKey in ROUTES
  }

  /**
   * Get route configuration
   */
  static getRouteConfig(routeKey: RouteKey): RouteConfig {
    const route = ROUTES[routeKey]
    if (!route) {
      throw new Error(`Route '${routeKey}' not found`)
    }
    return route
  }

  /**
   * Check if path matches route
   */
  static pathMatchesRoute(path: string, routeKey: RouteKey): boolean {
    const found = this.findRouteByPath(path)
    return found?.routeKey === routeKey
  }

  /**
   * Get canonical URL for route
   */
  static getCanonicalUrl(
    routeKey: RouteKey,
    params: RouteParams = {},
    baseUrl = ''
  ): string {
    const path = this.buildPath(routeKey, params)
    const route = ROUTES[routeKey]

    if (route?.meta?.canonicalUrl) {
      return route.meta.canonicalUrl
    }

    return `${baseUrl}${path}`
  }
}

/**
 * Route Guards Class
 */
export class RouteGuards {
  private static featureFlags: Record<string, boolean> = {}

  /**
   * Set feature flags for route guards
   */
  static setFeatureFlags(flags: Record<string, boolean>): void {
    this.featureFlags = { ...this.featureFlags, ...flags }
  }

  /**
   * Check if user can access route
   */
  static canAccessRoute(
    routeKey: RouteKey,
    userSession: UserSession | null,
    params: RouteParams = {}
  ): RouteGuardResult {
    const route = ROUTES[routeKey]

    // Check if route exists
    if (!route) {
      return {
        allowed: false,
        redirectTo: '/404',
        reason: 'Route not found',
      }
    }

    // Check feature flags
    if (route.featureFlag && !this.featureFlags[route.featureFlag]) {
      return {
        allowed: false,
        redirectTo: '/404',
        reason: 'Feature not available',
      }
    }

    // Public routes are always accessible
    if (route.permission === RoutePermission.PUBLIC) {
      // Check if authenticated users should be redirected
      if (userSession?.isAuthenticated && route.redirectIfAuthenticated) {
        return {
          allowed: false,
          redirectTo: route.redirectIfAuthenticated,
          reason: 'Already authenticated',
        }
      }
      return { allowed: true }
    }

    // Check authentication
    if (!userSession?.isAuthenticated) {
      return {
        allowed: false,
        redirectTo: route.redirectIfUnauthenticated || '/login',
        reason: 'Authentication required',
      }
    }

    // Check specific permission levels
    switch (route.permission) {
      case RoutePermission.VERIFIED:
        if (!userSession.isVerified) {
          return {
            allowed: false,
            redirectTo: '/verify-email',
            reason: 'Email verification required',
          }
        }
        break

      case RoutePermission.PREMIUM:
        if (!userSession.isPremium) {
          return {
            allowed: false,
            redirectTo: '/billing/subscription',
            reason: 'Premium subscription required',
          }
        }
        break

      case RoutePermission.ADMIN:
        if (!userSession.roles.includes(UserRole.OWNER)) {
          return {
            allowed: false,
            redirectTo: '/dashboard',
            reason: 'Admin access required',
          }
        }
        break
    }

    // Check specific roles
    if (route.roles && route.roles.length > 0) {
      const hasRequiredRole = route.roles.some(role =>
        userSession.roles.includes(role)
      )
      if (!hasRequiredRole) {
        return {
          allowed: false,
          redirectTo: '/dashboard',
          reason: 'Insufficient permissions',
        }
      }
    }

    // Additional custom checks can be added here
    const customCheck = this.performCustomChecks(routeKey, userSession, params)
    if (!customCheck.allowed) {
      return customCheck
    }

    return { allowed: true }
  }

  /**
   * Perform custom route-specific checks
   */
  private static performCustomChecks(
    routeKey: RouteKey,
    userSession: UserSession,
    params: RouteParams
  ): RouteGuardResult {
    // Document-specific checks
    if (routeKey.startsWith('DOCUMENT_') && params.id) {
      // In a real implementation, this would check document permissions
      // For now, we'll assume access is allowed
      return { allowed: true }
    }

    // Admin route checks
    if (routeKey.startsWith('ADMIN_')) {
      // Additional admin checks can be added here
      return { allowed: true }
    }

    return { allowed: true }
  }

  /**
   * Check if user should be redirected from current route
   */
  static shouldRedirect(
    currentRouteKey: RouteKey,
    userSession: UserSession | null
  ): string | null {
    const guardResult = this.canAccessRoute(currentRouteKey, userSession)
    return guardResult.redirectTo || null
  }

  /**
   * Get redirect route for unauthenticated users
   */
  static getUnauthenticatedRedirect(intendedRoute?: RouteKey): string {
    if (intendedRoute) {
      const route = ROUTES[intendedRoute]
      return route?.redirectIfUnauthenticated || '/login'
    }
    return '/login'
  }

  /**
   * Get redirect route for authenticated users
   */
  static getAuthenticatedRedirect(currentRoute?: RouteKey): string {
    if (currentRoute) {
      const route = ROUTES[currentRoute]
      return route?.redirectIfAuthenticated || '/dashboard'
    }
    return '/dashboard'
  }
}

/**
 * Breadcrumb Generator
 */
export class BreadcrumbGenerator {
  /**
   * Generate breadcrumbs for a route
   */
  static generate(
    routeKey: RouteKey,
    params: RouteParams = {}
  ): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    let currentRouteKey: RouteKey | undefined = routeKey

    // Build breadcrumb chain by following parent references
    while (currentRouteKey) {
      const route = ROUTES[currentRouteKey]
      if (!route) break

      const breadcrumb: BreadcrumbItem = {
        key: currentRouteKey,
        label: route.breadcrumbLabel || route.title,
        path: RouteUtils.buildPath(currentRouteKey, params),
        isCurrentPage: currentRouteKey === routeKey,
      }

      breadcrumbs.unshift(breadcrumb)

      // Move to parent route
      currentRouteKey = route.breadcrumbParent as RouteKey | undefined
    }

    return breadcrumbs
  }

  /**
   * Generate breadcrumbs from path
   */
  static generateFromPath(path: string): BreadcrumbItem[] {
    const found = RouteUtils.findRouteByPath(path)
    if (!found) {
      return []
    }

    return this.generate(found.routeKey, found.params)
  }

  /**
   * Get breadcrumb trail as string
   */
  static getBreadcrumbTrail(
    routeKey: RouteKey,
    params: RouteParams = {},
    separator = ' > '
  ): string {
    const breadcrumbs = this.generate(routeKey, params)
    return breadcrumbs.map(crumb => crumb.label).join(separator)
  }
}

/**
 * Navigation Manager
 */
export class NavigationManager {
  private static history: RouteKey[] = []
  private static currentIndex = -1

  /**
   * Navigate to a route
   */
  static navigateTo(routeKey: RouteKey, params: RouteParams = {}): string {
    const path = RouteUtils.buildPath(routeKey, params)

    // Add to history
    this.history = this.history.slice(0, this.currentIndex + 1)
    this.history.push(routeKey)
    this.currentIndex = this.history.length - 1

    return path
  }

  /**
   * Go back in history
   */
  static goBack(): RouteKey | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.history[this.currentIndex] || null
    }
    return null
  }

  /**
   * Go forward in history
   */
  static goForward(): RouteKey | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex] || null
    }
    return null
  }

  /**
   * Check if can go back
   */
  static canGoBack(): boolean {
    return this.currentIndex > 0
  }

  /**
   * Check if can go forward
   */
  static canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Get current navigation state
   */
  static getNavigationState(
    currentRouteKey: RouteKey,
    params: RouteParams = {}
  ): NavigationState {
    const breadcrumbs = BreadcrumbGenerator.generate(currentRouteKey, params)
    const previousRoute =
      this.currentIndex > 0 ? this.history[this.currentIndex - 1] : undefined

    return {
      currentRoute: currentRouteKey,
      previousRoute,
      breadcrumbs,
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward(),
    }
  }

  /**
   * Get filtered navigation items based on user permissions
   */
  static getFilteredNavigation(
    userSession: UserSession | null,
    navigationItems = NAVIGATION
  ): NavigationItem[] {
    const filteredItems: NavigationItem[] = []

    for (const item of navigationItems) {
      // Check if item should be hidden
      if (item.hidden) continue

      // Check if user can access the route
      const guardResult = RouteGuards.canAccessRoute(item.key, userSession)
      if (!guardResult.allowed) continue

      // Filter children recursively
      let filteredChildren: NavigationItem[] | undefined = undefined
      if (item.children) {
        const childResults = this.getFilteredNavigation(
          userSession,
          item.children
        )
        filteredChildren = childResults.length > 0 ? childResults : undefined
      }

      // Only add item if it has access or has accessible children
      if (
        guardResult.allowed ||
        (filteredChildren && filteredChildren.length > 0)
      ) {
        const navigationItem: NavigationItem = {
          key: item.key,
          label: item.label,
        }

        // Only add optional properties if they're defined
        if (item.icon !== undefined) {
          navigationItem.icon = item.icon
        }
        if (item.badge !== undefined) {
          navigationItem.badge = item.badge
        }
        if (item.hidden !== undefined) {
          navigationItem.hidden = item.hidden
        }
        if (item.divider !== undefined) {
          navigationItem.divider = item.divider
        }
        if (filteredChildren) {
          navigationItem.children = filteredChildren
        }

        filteredItems.push(navigationItem)
      }
    }

    return filteredItems
  }

  /**
   * Find navigation item by route key
   */
  static findNavigationItem(
    routeKey: RouteKey,
    navigationItems = NAVIGATION
  ): NavigationItem | null {
    for (const item of navigationItems) {
      if (item.key === routeKey) {
        return item
      }

      if (item.children) {
        const found = this.findNavigationItem(routeKey, item.children)
        if (found) return found
      }
    }

    return null
  }

  /**
   * Get active navigation path
   */
  static getActiveNavigationPath(
    routeKey: RouteKey,
    navigationItems = NAVIGATION
  ): RouteKey[] {
    const path: RouteKey[] = []

    function findPath(
      items: NavigationItem[],
      targetKey: RouteKey,
      currentPath: RouteKey[]
    ): boolean {
      for (const item of items) {
        const newPath = [...currentPath, item.key]

        if (item.key === targetKey) {
          path.push(...newPath)
          return true
        }

        if (item.children && findPath(item.children, targetKey, newPath)) {
          return true
        }
      }
      return false
    }

    findPath(navigationItems, routeKey, [])
    return path
  }
}

/**
 * Route Validation Utilities
 */
export const routeValidation = {
  /**
   * Validate route parameters
   */
  validateParams(
    routeKey: RouteKey,
    params: RouteParams
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const route = ROUTES[routeKey]

    if (!route) {
      errors.push(`Route '${routeKey}' not found`)
      return { valid: false, errors }
    }

    // Check required parameters
    const routeSegments = route.path.split('/')
    for (const segment of routeSegments) {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1)
        if (!params[paramName]) {
          errors.push(`Missing required parameter: ${paramName}`)
        }
      }
    }

    // Add custom validation rules here
    if (routeKey.includes('DOCUMENT_') && params.id) {
      if (!/^[a-zA-Z0-9-_]+$/.test(params.id)) {
        errors.push('Document ID contains invalid characters')
      }
    }

    return { valid: errors.length === 0, errors }
  },

  /**
   * Sanitize route parameters
   */
  sanitizeParams(params: RouteParams): RouteParams {
    const sanitized: RouteParams = {}

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        // Basic sanitization - remove potentially dangerous characters
        sanitized[key] = value.replace(/[<>'"&]/g, '')
      }
    }

    return sanitized
  },
}

/**
 * Main routing utilities export
 */
export const routingUtils = {
  RouteUtils,
  RouteGuards,
  BreadcrumbGenerator,
  NavigationManager,
  routeValidation,
}

export default routingUtils
