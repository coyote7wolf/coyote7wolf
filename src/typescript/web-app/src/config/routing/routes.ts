/**
 * Routing Configuration and Management
 *
 * Provides centralized routing system with protected routes, route guards,
 * breadcrumb generation, and navigation utilities for consistent application
 * navigation and security.
 */

import { UserRole } from '@/config/constants'

/**
 * Route Permission Levels
 */
export enum RoutePermission {
  PUBLIC = 'public', // Accessible to everyone
  AUTHENTICATED = 'authenticated', // Requires login
  VERIFIED = 'verified', // Requires email verification
  PREMIUM = 'premium', // Requires premium subscription
  ADMIN = 'admin', // Requires admin role
  OWNER = 'owner', // Requires owner role
}

/**
 * Route Categories for Organization
 */
export enum RouteCategory {
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  DOCUMENT = 'document',
  COLLABORATION = 'collaboration',
  AI = 'ai',
  SETTINGS = 'settings',
  ADMIN = 'admin',
  ONBOARDING = 'onboarding',
  BILLING = 'billing',
  HELP = 'help',
}

/**
 * Route Configuration Interface
 */
export interface RouteConfig {
  path: string
  title: string
  description?: string
  category: RouteCategory
  permission: RoutePermission
  roles?: UserRole[]
  featureFlag?: string
  redirectIfAuthenticated?: string
  redirectIfUnauthenticated?: string
  layout?: string
  breadcrumbLabel?: string
  breadcrumbParent?: string
  meta?: {
    keywords?: string[]
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    noIndex?: boolean
    canonicalUrl?: string
  }
  preload?: boolean
  cache?: boolean
  analytics?: {
    trackPageView?: boolean
    eventCategory?: string
    customProperties?: Record<string, unknown>
  }
}

/**
 * Application Routes Configuration
 */
export const ROUTES: Record<string, RouteConfig> = {
  // Public Routes
  HOME: {
    path: '/',
    title: 'SyncCoreAI - Collaborative Document Platform',
    description:
      'Modern collaborative document editing with AI-powered suggestions and real-time sync',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    redirectIfAuthenticated: '/dashboard',
    breadcrumbLabel: 'Home',
    meta: {
      keywords: ['collaboration', 'documents', 'AI', 'real-time', 'sync'],
      ogTitle: 'SyncCoreAI - Collaborative Document Platform',
      ogDescription: 'Edit documents together with AI-powered suggestions',
      ogImage: '/images/og-home.jpg',
    },
    analytics: {
      trackPageView: true,
      eventCategory: 'landing',
    },
  },

  // Authentication Routes
  LOGIN: {
    path: '/login',
    title: 'Login - SyncCoreAI',
    description: 'Sign in to your SyncCoreAI account',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    redirectIfAuthenticated: '/dashboard',
    breadcrumbLabel: 'Login',
    breadcrumbParent: 'HOME',
    meta: {
      noIndex: true,
    },
    analytics: {
      trackPageView: true,
      eventCategory: 'auth',
    },
  },

  REGISTER: {
    path: '/register',
    title: 'Sign Up - SyncCoreAI',
    description: 'Create your SyncCoreAI account',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    redirectIfAuthenticated: '/dashboard',
    breadcrumbLabel: 'Sign Up',
    breadcrumbParent: 'HOME',
    meta: {
      noIndex: true,
    },
    analytics: {
      trackPageView: true,
      eventCategory: 'auth',
    },
  },

  FORGOT_PASSWORD: {
    path: '/forgot-password',
    title: 'Reset Password - SyncCoreAI',
    description: 'Reset your SyncCoreAI password',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    redirectIfAuthenticated: '/dashboard',
    breadcrumbLabel: 'Reset Password',
    breadcrumbParent: 'LOGIN',
    meta: {
      noIndex: true,
    },
  },

  RESET_PASSWORD: {
    path: '/reset-password/[token]',
    title: 'Set New Password - SyncCoreAI',
    description: 'Set your new password',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    redirectIfAuthenticated: '/dashboard',
    breadcrumbLabel: 'Set New Password',
    breadcrumbParent: 'LOGIN',
    meta: {
      noIndex: true,
    },
  },

  VERIFY_EMAIL: {
    path: '/verify-email/[token]',
    title: 'Verify Email - SyncCoreAI',
    description: 'Verify your email address',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    breadcrumbLabel: 'Verify Email',
    breadcrumbParent: 'HOME',
    meta: {
      noIndex: true,
    },
  },

  // Dashboard Routes
  DASHBOARD: {
    path: '/dashboard',
    title: 'Dashboard - SyncCoreAI',
    description: 'Your document dashboard',
    category: RouteCategory.DASHBOARD,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Dashboard',
    layout: 'dashboard',
    preload: true,
    analytics: {
      trackPageView: true,
      eventCategory: 'dashboard',
    },
  },

  RECENT_DOCUMENTS: {
    path: '/dashboard/recent',
    title: 'Recent Documents - SyncCoreAI',
    description: 'Your recently accessed documents',
    category: RouteCategory.DASHBOARD,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Recent',
    breadcrumbParent: 'DASHBOARD',
    layout: 'dashboard',
    cache: true,
  },

  SHARED_DOCUMENTS: {
    path: '/dashboard/shared',
    title: 'Shared Documents - SyncCoreAI',
    description: 'Documents shared with you',
    category: RouteCategory.DASHBOARD,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Shared',
    breadcrumbParent: 'DASHBOARD',
    layout: 'dashboard',
  },

  DOCUMENT_TEMPLATES: {
    path: '/dashboard/templates',
    title: 'Document Templates - SyncCoreAI',
    description: 'Create documents from templates',
    category: RouteCategory.DASHBOARD,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Templates',
    breadcrumbParent: 'DASHBOARD',
    layout: 'dashboard',
    cache: true,
  },

  // Document Routes
  DOCUMENT_VIEW: {
    path: '/document/[id]',
    title: 'Document - SyncCoreAI',
    description: 'View and edit document',
    category: RouteCategory.DOCUMENT,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Document',
    breadcrumbParent: 'DASHBOARD',
    layout: 'editor',
    preload: true,
    analytics: {
      trackPageView: true,
      eventCategory: 'document',
      customProperties: {
        action: 'view',
      },
    },
  },

  DOCUMENT_EDIT: {
    path: '/document/[id]/edit',
    title: 'Edit Document - SyncCoreAI',
    description: 'Edit document',
    category: RouteCategory.DOCUMENT,
    permission: RoutePermission.AUTHENTICATED,
    roles: [UserRole.OWNER, UserRole.EDITOR],
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Edit',
    breadcrumbParent: 'DOCUMENT_VIEW',
    layout: 'editor',
    analytics: {
      trackPageView: true,
      eventCategory: 'document',
      customProperties: {
        action: 'edit',
      },
    },
  },

  DOCUMENT_HISTORY: {
    path: '/document/[id]/history',
    title: 'Document History - SyncCoreAI',
    description: 'View document version history',
    category: RouteCategory.DOCUMENT,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'History',
    breadcrumbParent: 'DOCUMENT_VIEW',
    layout: 'dashboard',
  },

  DOCUMENT_COLLABORATORS: {
    path: '/document/[id]/collaborators',
    title: 'Document Collaborators - SyncCoreAI',
    description: 'Manage document collaborators',
    category: RouteCategory.COLLABORATION,
    permission: RoutePermission.AUTHENTICATED,
    roles: [UserRole.OWNER, UserRole.EDITOR],
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Collaborators',
    breadcrumbParent: 'DOCUMENT_VIEW',
    layout: 'dashboard',
  },

  DOCUMENT_COMMENTS: {
    path: '/document/[id]/comments',
    title: 'Document Comments - SyncCoreAI',
    description: 'View and manage document comments',
    category: RouteCategory.COLLABORATION,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Comments',
    breadcrumbParent: 'DOCUMENT_VIEW',
    layout: 'dashboard',
  },

  // AI Features Routes
  AI_SUGGESTIONS: {
    path: '/ai/suggestions',
    title: 'AI Suggestions - SyncCoreAI',
    description: 'View AI-powered content suggestions',
    category: RouteCategory.AI,
    permission: RoutePermission.VERIFIED,
    featureFlag: 'ai_suggestions',
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'AI Suggestions',
    breadcrumbParent: 'DASHBOARD',
    layout: 'dashboard',
  },

  AI_ANALYTICS: {
    path: '/ai/analytics',
    title: 'AI Analytics - SyncCoreAI',
    description: 'AI usage analytics and insights',
    category: RouteCategory.AI,
    permission: RoutePermission.PREMIUM,
    featureFlag: 'ai_analytics',
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'AI Analytics',
    breadcrumbParent: 'DASHBOARD',
    layout: 'dashboard',
  },

  // Settings Routes
  SETTINGS: {
    path: '/settings',
    title: 'Settings - SyncCoreAI',
    description: 'Account and application settings',
    category: RouteCategory.SETTINGS,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Settings',
    breadcrumbParent: 'DASHBOARD',
    layout: 'settings',
  },

  SETTINGS_PROFILE: {
    path: '/settings/profile',
    title: 'Profile Settings - SyncCoreAI',
    description: 'Manage your profile information',
    category: RouteCategory.SETTINGS,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Profile',
    breadcrumbParent: 'SETTINGS',
    layout: 'settings',
  },

  SETTINGS_ACCOUNT: {
    path: '/settings/account',
    title: 'Account Settings - SyncCoreAI',
    description: 'Manage your account settings',
    category: RouteCategory.SETTINGS,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Account',
    breadcrumbParent: 'SETTINGS',
    layout: 'settings',
  },

  SETTINGS_SECURITY: {
    path: '/settings/security',
    title: 'Security Settings - SyncCoreAI',
    description: 'Manage security and privacy settings',
    category: RouteCategory.SETTINGS,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Security',
    breadcrumbParent: 'SETTINGS',
    layout: 'settings',
  },

  SETTINGS_NOTIFICATIONS: {
    path: '/settings/notifications',
    title: 'Notification Settings - SyncCoreAI',
    description: 'Manage notification preferences',
    category: RouteCategory.SETTINGS,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Notifications',
    breadcrumbParent: 'SETTINGS',
    layout: 'settings',
  },

  SETTINGS_INTEGRATIONS: {
    path: '/settings/integrations',
    title: 'Integrations - SyncCoreAI',
    description: 'Manage third-party integrations',
    category: RouteCategory.SETTINGS,
    permission: RoutePermission.VERIFIED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Integrations',
    breadcrumbParent: 'SETTINGS',
    layout: 'settings',
  },

  // Billing Routes
  BILLING: {
    path: '/billing',
    title: 'Billing - SyncCoreAI',
    description: 'Manage your subscription and billing',
    category: RouteCategory.BILLING,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Billing',
    breadcrumbParent: 'DASHBOARD',
    layout: 'settings',
  },

  BILLING_SUBSCRIPTION: {
    path: '/billing/subscription',
    title: 'Subscription - SyncCoreAI',
    description: 'Manage your subscription plan',
    category: RouteCategory.BILLING,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Subscription',
    breadcrumbParent: 'BILLING',
    layout: 'settings',
  },

  BILLING_HISTORY: {
    path: '/billing/history',
    title: 'Billing History - SyncCoreAI',
    description: 'View your billing history',
    category: RouteCategory.BILLING,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'History',
    breadcrumbParent: 'BILLING',
    layout: 'settings',
  },

  // Admin Routes
  ADMIN: {
    path: '/admin',
    title: 'Admin Dashboard - SyncCoreAI',
    description: 'Administrative dashboard',
    category: RouteCategory.ADMIN,
    permission: RoutePermission.ADMIN,
    roles: [UserRole.OWNER],
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Admin',
    breadcrumbParent: 'DASHBOARD',
    layout: 'admin',
    meta: {
      noIndex: true,
    },
  },

  ADMIN_USERS: {
    path: '/admin/users',
    title: 'User Management - SyncCoreAI',
    description: 'Manage system users',
    category: RouteCategory.ADMIN,
    permission: RoutePermission.ADMIN,
    roles: [UserRole.OWNER],
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Users',
    breadcrumbParent: 'ADMIN',
    layout: 'admin',
    meta: {
      noIndex: true,
    },
  },

  ADMIN_DOCUMENTS: {
    path: '/admin/documents',
    title: 'Document Management - SyncCoreAI',
    description: 'Manage system documents',
    category: RouteCategory.ADMIN,
    permission: RoutePermission.ADMIN,
    roles: [UserRole.OWNER],
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Documents',
    breadcrumbParent: 'ADMIN',
    layout: 'admin',
    meta: {
      noIndex: true,
    },
  },

  ADMIN_ANALYTICS: {
    path: '/admin/analytics',
    title: 'System Analytics - SyncCoreAI',
    description: 'View system analytics and metrics',
    category: RouteCategory.ADMIN,
    permission: RoutePermission.ADMIN,
    roles: [UserRole.OWNER],
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Analytics',
    breadcrumbParent: 'ADMIN',
    layout: 'admin',
    meta: {
      noIndex: true,
    },
  },

  // Onboarding Routes
  ONBOARDING: {
    path: '/onboarding',
    title: 'Welcome to SyncCoreAI',
    description: 'Get started with SyncCoreAI',
    category: RouteCategory.ONBOARDING,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Onboarding',
    breadcrumbParent: 'DASHBOARD',
    layout: 'onboarding',
    meta: {
      noIndex: true,
    },
  },

  ONBOARDING_PROFILE: {
    path: '/onboarding/profile',
    title: 'Complete Your Profile',
    description: 'Set up your profile information',
    category: RouteCategory.ONBOARDING,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Profile Setup',
    breadcrumbParent: 'ONBOARDING',
    layout: 'onboarding',
    meta: {
      noIndex: true,
    },
  },

  ONBOARDING_PREFERENCES: {
    path: '/onboarding/preferences',
    title: 'Set Your Preferences',
    description: 'Configure your application preferences',
    category: RouteCategory.ONBOARDING,
    permission: RoutePermission.AUTHENTICATED,
    redirectIfUnauthenticated: '/login',
    breadcrumbLabel: 'Preferences',
    breadcrumbParent: 'ONBOARDING',
    layout: 'onboarding',
    meta: {
      noIndex: true,
    },
  },

  // Help and Support Routes
  HELP: {
    path: '/help',
    title: 'Help Center - SyncCoreAI',
    description: 'Get help and support',
    category: RouteCategory.HELP,
    permission: RoutePermission.PUBLIC,
    breadcrumbLabel: 'Help',
    breadcrumbParent: 'HOME',
    layout: 'help',
    cache: true,
  },

  HELP_GETTING_STARTED: {
    path: '/help/getting-started',
    title: 'Getting Started - SyncCoreAI Help',
    description: 'Learn the basics of SyncCoreAI',
    category: RouteCategory.HELP,
    permission: RoutePermission.PUBLIC,
    breadcrumbLabel: 'Getting Started',
    breadcrumbParent: 'HELP',
    layout: 'help',
    cache: true,
  },

  HELP_COLLABORATION: {
    path: '/help/collaboration',
    title: 'Collaboration Guide - SyncCoreAI Help',
    description: 'Learn about collaboration features',
    category: RouteCategory.HELP,
    permission: RoutePermission.PUBLIC,
    breadcrumbLabel: 'Collaboration',
    breadcrumbParent: 'HELP',
    layout: 'help',
    cache: true,
  },

  HELP_AI_FEATURES: {
    path: '/help/ai-features',
    title: 'AI Features Guide - SyncCoreAI Help',
    description: 'Learn about AI-powered features',
    category: RouteCategory.HELP,
    permission: RoutePermission.PUBLIC,
    breadcrumbLabel: 'AI Features',
    breadcrumbParent: 'HELP',
    layout: 'help',
    cache: true,
  },

  // Error Routes
  NOT_FOUND: {
    path: '/404',
    title: 'Page Not Found - SyncCoreAI',
    description: 'The page you are looking for does not exist',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    breadcrumbLabel: '404',
    breadcrumbParent: 'HOME',
    meta: {
      noIndex: true,
    },
  },

  SERVER_ERROR: {
    path: '/500',
    title: 'Server Error - SyncCoreAI',
    description: 'An internal server error occurred',
    category: RouteCategory.AUTH,
    permission: RoutePermission.PUBLIC,
    breadcrumbLabel: '500',
    breadcrumbParent: 'HOME',
    meta: {
      noIndex: true,
    },
  },
} as const

/**
 * Route Keys Type for Type Safety
 */
export type RouteKey = keyof typeof ROUTES

/**
 * Dynamic Route Parameters
 */
export interface RouteParams {
  id?: string
  token?: string
  slug?: string
  [key: string]: string | undefined
}

/**
 * Navigation Item Interface
 */
export interface NavigationItem {
  key: RouteKey
  label: string
  icon?: string
  children?: NavigationItem[]
  badge?: string | number
  hidden?: boolean
  divider?: boolean
}

/**
 * Main Navigation Structure
 */
export const NAVIGATION: NavigationItem[] = [
  {
    key: 'DASHBOARD',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    key: 'RECENT_DOCUMENTS',
    label: 'Recent',
    icon: 'history',
  },
  {
    key: 'SHARED_DOCUMENTS',
    label: 'Shared',
    icon: 'share',
  },
  {
    key: 'DOCUMENT_TEMPLATES',
    label: 'Templates',
    icon: 'template',
  },
  {
    key: 'AI_SUGGESTIONS',
    label: 'AI Suggestions',
    icon: 'ai',
    hidden: false, // Will be controlled by feature flags
  },
  {
    key: 'SETTINGS',
    label: 'Settings',
    icon: 'settings',
    children: [
      {
        key: 'SETTINGS_PROFILE',
        label: 'Profile',
        icon: 'user',
      },
      {
        key: 'SETTINGS_ACCOUNT',
        label: 'Account',
        icon: 'account',
      },
      {
        key: 'SETTINGS_SECURITY',
        label: 'Security',
        icon: 'security',
      },
      {
        key: 'SETTINGS_NOTIFICATIONS',
        label: 'Notifications',
        icon: 'notifications',
      },
      {
        key: 'SETTINGS_INTEGRATIONS',
        label: 'Integrations',
        icon: 'integrations',
      },
    ],
  },
  {
    key: 'BILLING',
    label: 'Billing',
    icon: 'billing',
  },
  {
    key: 'HELP',
    label: 'Help',
    icon: 'help',
  },
]

/**
 * Admin Navigation Structure
 */
export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    key: 'ADMIN',
    label: 'Admin Dashboard',
    icon: 'admin-dashboard',
  },
  {
    key: 'ADMIN_USERS',
    label: 'User Management',
    icon: 'users',
  },
  {
    key: 'ADMIN_DOCUMENTS',
    label: 'Document Management',
    icon: 'documents',
  },
  {
    key: 'ADMIN_ANALYTICS',
    label: 'System Analytics',
    icon: 'analytics',
  },
]

/**
 * Route Group Utilities
 */
export const routeGroups = {
  /**
   * Get routes by category
   */
  getByCategory(category: RouteCategory): RouteConfig[] {
    return Object.values(ROUTES).filter(route => route.category === category)
  },

  /**
   * Get routes by permission level
   */
  getByPermission(permission: RoutePermission): RouteConfig[] {
    return Object.values(ROUTES).filter(
      route => route.permission === permission
    )
  },

  /**
   * Get public routes
   */
  getPublicRoutes(): RouteConfig[] {
    return this.getByPermission(RoutePermission.PUBLIC)
  },

  /**
   * Get protected routes
   */
  getProtectedRoutes(): RouteConfig[] {
    return Object.values(ROUTES).filter(
      route => route.permission !== RoutePermission.PUBLIC
    )
  },

  /**
   * Get admin routes
   */
  getAdminRoutes(): RouteConfig[] {
    return this.getByPermission(RoutePermission.ADMIN)
  },

  /**
   * Get routes requiring specific roles
   */
  getByRole(role: UserRole): RouteConfig[] {
    return Object.values(ROUTES).filter(
      route => route.roles && route.roles.includes(role)
    )
  },
}

export default ROUTES
