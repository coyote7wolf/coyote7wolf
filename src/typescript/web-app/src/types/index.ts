/**
 * Global Type Definitions
 *
 * This file contains global type definitions used throughout the application.
 * These types represent the core data structures and interfaces.
 */

import {
  DocumentStatus,
  UserRole,
  SyncStatus,
  ConflictStatus,
  AISuggestionType,
  NotificationType,
  ConnectionStatus,
} from '@/config/constants'

// Base types
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// User types
export interface User extends BaseEntity {
  email: string
  username: string
  displayName: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'zh-TW' | 'zh-CN'
  notifications: NotificationPreferences
  editor: EditorPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  desktop: boolean
  aiSuggestions: boolean
  collaboratorChanges: boolean
  comments: boolean
}

export interface EditorPreferences {
  fontSize: number
  fontFamily: string
  lineHeight: number
  showLineNumbers: boolean
  wordWrap: boolean
  autoSave: boolean
  autoSaveInterval: number
}

// Document types
export interface Document extends BaseEntity {
  title: string
  content: string
  status: DocumentStatus
  version: number
  ownerId: string
  collaborators: DocumentCollaborator[]
  tags: string[]
  metadata: DocumentMetadata
  isPublic: boolean
}

export interface DocumentCollaborator {
  userId: string
  role: UserRole
  addedAt: Date
  addedBy: string
}

export interface DocumentMetadata {
  wordCount: number
  characterCount: number
  readingTime: number
  lastEditedBy: string
  language: string
  contentType: string
}

export interface DocumentVersion extends BaseEntity {
  documentId: string
  version: number
  content: string
  summary: string
  authorId: string
  changes: DocumentChange[]
}

export interface DocumentChange {
  type: 'insert' | 'delete' | 'retain'
  position: number
  length: number
  content?: string
  attributes?: Record<string, unknown>
}

// Sync and CRDT types
export interface Delta {
  id: string
  documentId: string
  version: number
  operations: Operation[]
  authorId: string
  timestamp: Date
  checksum: string
}

export interface Operation {
  type: 'insert' | 'delete' | 'retain'
  position: number
  length?: number
  content?: string
  attributes?: Record<string, unknown>
}

export interface SyncState {
  status: SyncStatus
  lastSyncAt: Date
  pendingOperations: Operation[]
  conflictedOperations: Operation[]
  latency: number
}

export interface ConflictResolution {
  id: string
  documentId: string
  status: ConflictStatus
  conflictedOperations: Operation[]
  resolvedOperations: Operation[]
  strategy: 'manual' | 'auto' | 'ai-assisted'
  resolvedBy?: string
  resolvedAt?: Date
}

// Presence types
export interface PresenceUser {
  userId: string
  user: Partial<User>
  cursor: CursorPosition
  selection: SelectionRange
  color: string
  isActive: boolean
  lastActivity: Date
}

export interface CursorPosition {
  line: number
  column: number
  offset: number
}

export interface SelectionRange {
  start: CursorPosition
  end: CursorPosition
}

export interface PresenceState {
  connectionStatus: ConnectionStatus
  currentUsers: PresenceUser[]
  localCursor: CursorPosition
  localSelection: SelectionRange
}

// AI types
export interface AISuggestion extends BaseEntity {
  documentId: string
  type: AISuggestionType
  title: string
  description: string
  content: string
  originalText: string
  suggestedText: string
  position: CursorPosition
  confidence: number
  metadata: AISuggestionMetadata
  isApplied: boolean
  appliedAt?: Date
  appliedBy?: string
}

export interface AISuggestionMetadata {
  model: string
  language: string
  context: string
  reasoning: string
  alternatives: string[]
}

// Notification types
export interface Notification extends BaseEntity {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  userId: string
  isRead: boolean
  readAt?: Date
  actions?: NotificationAction[]
}

export interface NotificationAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  url?: string
  action?: string
}

// Authentication types
export interface AuthUser {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// API types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
  timestamp: Date
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// WebSocket types
export interface WebSocketMessage<T = unknown> {
  id: string
  type: string
  data: T
  timestamp: Date
  userId?: string
}

export interface WebSocketError {
  code: string
  message: string
  reconnectable: boolean
}

// Storage types
export interface StorageAdapter {
  get<T>(key: string, defaultValue?: T): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
  has(key: string): boolean
}

// Error types
export interface AppError extends Error {
  code: string
  context?: Record<string, unknown>
  timestamp: Date
  userId?: string
}

// Form types
export interface FormField<T = string> {
  value: T
  error: string | null
  touched: boolean
  dirty: boolean
}

export interface FormState<T extends Record<string, unknown>> {
  fields: {
    [K in keyof T]: FormField<T[K]>
  }
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  errors: Record<string, string>
}

// UI types
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type ValueOf<T> = T[keyof T]

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// Event types
export type EventHandler<T = unknown> = (event: T) => void

export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>

// Function types
export type AsyncFunction<T extends unknown[] = [], R = unknown> = (
  ...args: T
) => Promise<R>

export type Callback<T = void> = () => T

export type AsyncCallback<T = void> = () => Promise<T>

// Component types (for React)
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface PageProps {
  params: Record<string, string>
  searchParams: Record<string, string | string[] | undefined>
}

// All types are already exported above, no need for additional export type block
