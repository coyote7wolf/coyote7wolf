/**
 * Routing Configuration Module
 *
 * Centralized routing system with comprehensive route management,
 * guards, navigation utilities, and breadcrumb generation.
 */

// Import utilities and configurations
import {
  RouteUtils,
  RouteGuards,
  BreadcrumbGenerator,
  NavigationManager,
  routeValidation,
  routingUtils,
} from './utils'

import {
  RoutePermission,
  RouteCategory,
  ROUTES,
  NAVIGATION,
  ADMIN_NAVIGATION,
} from './routes'

// Export main routing configurations
export * from './routes'
export * from './utils'

// Re-export key types for convenience
export type {
  RouteConfig,
  RouteKey,
  RouteParams,
  NavigationItem,
} from './routes'

export type {
  UserSession,
  RouteGuardResult,
  BreadcrumbItem,
  NavigationState,
} from './utils'

/**
 * Main routing system initialization
 */
export const initializeRouting = (
  featureFlags: Record<string, boolean> = {}
) => {
  // Set feature flags for route guards
  RouteGuards.setFeatureFlags(featureFlags)

  return {
    RouteUtils,
    RouteGuards,
    BreadcrumbGenerator,
    NavigationManager,
    routeValidation,
  }
}

/**
 * Default export with all routing utilities
 */
export default {
  // Core utilities
  RouteUtils,
  RouteGuards,
  BreadcrumbGenerator,
  NavigationManager,
  routeValidation,

  // Configuration
  ROUTES,
  NAVIGATION,
  ADMIN_NAVIGATION,
  RoutePermission,
  RouteCategory,

  // Initialization
  initializeRouting,
}
