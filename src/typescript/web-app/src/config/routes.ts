/**
 * Application Route Map
 *
 * Central routing configuration and navigation management
 * This file maps all available routes and their relationships
 */

export interface RouteInfo {
  path: string
  name: string
  description: string
  category: 'main' | 'demo' | 'system' | 'auth'
  component?: string
  isPublic: boolean
  requiresAuth: boolean
  features: string[]
  metadata?: {
    title: string
    description: string
    keywords: string[]
  }
}

export const APP_ROUTES: RouteInfo[] = [
  // Main Application Routes
  {
    path: '/',
    name: 'Landing Page',
    description: 'Home page with feature showcase and onboarding',
    category: 'main',
    component: 'page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Hero Section',
      'Feature Showcase',
      'Call-to-Action',
      'Responsive Design',
    ],
  },
  {
    path: '/login',
    name: 'Login',
    description: 'User authentication with OAuth integration',
    category: 'auth',
    component: 'login/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'OAuth Integration',
      'Form Validation',
      'Remember Me',
      'Error Handling',
    ],
  },
  {
    path: '/register',
    name: 'Registration',
    description: 'User registration with email verification',
    category: 'auth',
    component: 'register/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Progressive Registration',
      'Password Strength',
      'Email Verification',
      'OAuth Signup',
    ],
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    description: 'Main user dashboard with AI assistant and analytics',
    category: 'main',
    component: 'dashboard/page.tsx',
    isPublic: false,
    requiresAuth: true,
    features: ['AI Assistant', 'Analytics', 'Quick Actions', 'Recent Activity'],
  },
  {
    path: '/documents',
    name: 'Documents',
    description: 'Document management with real-time collaboration',
    category: 'main',
    component: 'documents/page.tsx',
    isPublic: false,
    requiresAuth: true,
    features: [
      'CRDT Collaboration',
      'Document Editor',
      'File Management',
      'Team Workspace',
    ],
  },
  {
    path: '/profile',
    name: 'Profile',
    description: 'User profile management and settings',
    category: 'main',
    component: 'profile/page.tsx',
    isPublic: false,
    requiresAuth: true,
    features: [
      'Profile Settings',
      'Preferences',
      'Security Settings',
      'Account Management',
    ],
  },

  // Demo Pages - Feature Showcases
  {
    path: '/file-upload-demo',
    name: 'File Upload Demo',
    description: 'Interactive file upload with drag-and-drop functionality',
    category: 'demo',
    component: 'file-upload-demo/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Drag & Drop',
      'Progress Tracking',
      'File Validation',
      'Thumbnail Generation',
    ],
  },
  {
    path: '/image-editor-demo',
    name: 'Image Editor Demo',
    description: 'Canvas-based image editor with filters and effects',
    category: 'demo',
    component: 'image-editor-demo/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Canvas Editing',
      'Filters & Effects',
      'Crop & Resize',
      'Undo/Redo',
    ],
  },
  {
    path: '/demos/media-player',
    name: 'Media Player Demo',
    description: 'Advanced media player with subtitle and playlist support',
    category: 'demo',
    component: 'demos/media-player/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Video/Audio Playback',
      'Subtitles',
      'Playlists',
      'Quality Control',
    ],
  },
  {
    path: '/touch-demo',
    name: 'Touch Optimization Demo',
    description: 'Touch-optimized components with gesture support',
    category: 'demo',
    component: 'touch-demo/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Gesture Recognition',
      'Touch Feedback',
      'Mobile Optimization',
      'Haptic Response',
    ],
  },
  {
    path: '/performance-pwa-demo',
    name: 'PWA Demo',
    description: 'Progressive Web App features demonstration',
    category: 'demo',
    component: 'performance-pwa-demo/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'PWA Installation',
      'Offline Support',
      'Push Notifications',
      'Service Worker',
    ],
  },

  // System Pages
  {
    path: '/design-system',
    name: 'Design System',
    description: 'Component library and design token showcase',
    category: 'system',
    component: 'design-system/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Component Library',
      'Design Tokens',
      'Style Guide',
      'Interactive Examples',
    ],
  },
  {
    path: '/test',
    name: 'Test Pages',
    description: 'Development and testing utilities',
    category: 'system',
    component: 'test/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Component Testing',
      'API Testing',
      'Performance Testing',
      'Accessibility Testing',
    ],
  },
  {
    path: '/test-auth',
    name: 'Auth Testing',
    description: 'Authentication flow testing',
    category: 'system',
    component: 'test-auth/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Auth Flow Testing',
      'OAuth Testing',
      'Session Management',
      'Token Validation',
    ],
  },
  {
    path: '/routes',
    name: 'Route Status',
    description: 'View app router status and navigation flows',
    category: 'system',
    component: 'routes/page.tsx',
    isPublic: true,
    requiresAuth: false,
    features: [
      'Route overview',
      'Status dashboard',
      'Navigation flow visualization',
      'Connection testing',
    ],
    metadata: {
      title: 'Route Status - SyncCoreAI',
      description: 'Complete overview of application routes and connectivity',
      keywords: ['routes', 'navigation', 'status', 'dashboard'],
    },
  },
]

// Route utilities
export const getRoutesByCategory = (category: RouteInfo['category']) => {
  return APP_ROUTES.filter(route => route.category === category)
}

export const getPublicRoutes = () => {
  return APP_ROUTES.filter(route => route.isPublic)
}

export const getProtectedRoutes = () => {
  return APP_ROUTES.filter(route => route.requiresAuth)
}

export const getRouteInfo = (path: string) => {
  return APP_ROUTES.find(route => route.path === path)
}

// Navigation flow mapping
export const NAVIGATION_FLOWS = {
  'New User Journey': [
    '/', // Landing
    '/register', // Registration
    '/dashboard', // Onboarding
    '/documents', // Main Feature
  ],
  'Returning User Journey': [
    '/', // Landing
    '/login', // Authentication
    '/dashboard', // Dashboard
    '/documents', // Documents
  ],
  'Demo Exploration Flow': [
    '/', // Landing
    '/file-upload-demo', // File Upload
    '/image-editor-demo', // Image Editor
    '/demos/media-player', // Media Player
    '/touch-demo', // Touch Demo
    '/performance-pwa-demo', // PWA Demo
  ],
  'Development Flow': [
    '/design-system', // Design System
    '/test', // Testing
    '/test-auth', // Auth Testing
    '/routes', // Route Status
  ],
}

// Route metadata for SEO and social sharing
export const ROUTE_METADATA = {
  '/': {
    title: 'SyncCoreAI - Collaborative Document Editing Platform',
    description:
      'Modern collaborative document editing with AI assistance and real-time collaboration',
    keywords: ['collaboration', 'document editing', 'AI', 'real-time'],
  },
  '/dashboard': {
    title: 'Dashboard - SyncCoreAI',
    description: 'Your personal dashboard with AI assistant and analytics',
    keywords: ['dashboard', 'AI assistant', 'analytics', 'workspace'],
  },
  '/documents': {
    title: 'Documents - SyncCoreAI',
    description: 'Collaborative document management with real-time editing',
    keywords: ['documents', 'collaboration', 'real-time editing', 'CRDT'],
  },
  // Add more metadata as needed
}

export default APP_ROUTES
