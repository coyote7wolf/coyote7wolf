// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'author' | 'viewer'
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Document types
export interface Document {
  id: string
  title: string
  content: string
  type?: 'article' | 'page' | 'template'
  status?: 'draft' | 'review' | 'published' | 'archived'
  authorId?: string
  authorName?: string
  createdAt: string
  updatedAt: string
  lastModified?: string
  version?: number
  isOffline?: boolean
  conflictCount?: number
  collaborators?: string[]
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'offline'
  // Additional offline properties
  tags?: string[]
  isFavorite?: boolean
  wordCount?: number
  charCount?: number
}

// Collaboration types
export interface CollaborationSession {
  id: string
  documentId: string
  userId: string
  user: User
  cursor: {
    line: number
    column: number
  }
  isActive: boolean
  joinedAt: string
}

export interface Comment {
  id: string
  documentId: string
  authorId: string
  author: User
  content: string
  position?: {
    line: number
    column: number
  }
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

// Sync types
export interface SyncOperation {
  id: string
  type: 'insert' | 'delete' | 'update'
  documentId: string
  userId: string
  data: any
  timestamp: number
  version: number
}

export interface ConflictResolution {
  operationId: string
  resolution: 'accept' | 'reject' | 'merge'
  mergedContent?: string
  timestamp: number
}

// AI types
export interface AISuggestion {
  id: string
  type: 'title' | 'content' | 'grammar' | 'style' | 'translation'
  original: string
  suggestion: string
  confidence: number
  context?: string
}

export interface AIAnalysis {
  readability: number
  seoScore: number
  wordCount: number
  estimatedReadTime: number
  suggestions: AISuggestion[]
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Document: {documentId: string}
  Editor: {documentId: string}
}

export type MainTabParamList = {
  Documents: undefined
  Collaboration: undefined
  Offline: undefined
  AIAssistant: undefined
  Notifications: undefined
  Settings: undefined
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Mock mode types
export type MockMode = 'data' | 'api' | 'none'

// Theme types
export interface Theme {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    disabled: string
    info: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borderRadius: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  typography: {
    h1: any
    h2: any
    h3: any
    body: any
    caption: any
  }
}
