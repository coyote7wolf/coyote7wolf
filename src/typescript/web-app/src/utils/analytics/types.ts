/**
 * Analytics System - Type Definitions
 *
 * Event tracking, user behavior analysis, performance monitoring,
 * and reporting dashboards with privacy compliance.
 */

/**
 * Event Types
 */
export type EventType =
  | 'page_view'
  | 'click'
  | 'form_submit'
  | 'user_action'
  | 'error'
  | 'performance'
  | 'custom'

/**
 * Event Priority
 */
export type EventPriority = 'low' | 'normal' | 'high' | 'critical'

/**
 * Analytics Event
 */
export interface AnalyticsEvent {
  id?: string
  type: EventType
  name: string
  category?: string
  timestamp: number
  sessionId: string
  userId?: string
  properties?: Record<string, any>
  metadata?: EventMetadata
  priority?: EventPriority
}

/**
 * Event Metadata
 */
export interface EventMetadata {
  url?: string
  referrer?: string
  userAgent?: string
  viewport?: { width: number; height: number }
  location?: { pathname: string; search: string; hash: string }
  performance?: PerformanceData
  environment?: string
  version?: string
  buildId?: string
}

/**
 * Performance Data
 */
export interface PerformanceData {
  navigationTiming?: {
    domContentLoaded: number
    loadComplete: number
    firstPaint?: number
    firstContentfulPaint?: number
    largestContentfulPaint?: number
    cumulativeLayoutShift?: number
    firstInputDelay?: number
  }
  resourceTiming?: ResourceTiming[]
  customMetrics?: Record<string, number>
}

/**
 * Resource Timing
 */
export interface ResourceTiming {
  name: string
  type: string
  startTime: number
  duration: number
  size?: number
  transferSize?: number
}

/**
 * User Context
 */
export interface UserContext {
  userId?: string
  sessionId: string
  isAnonymous: boolean
  properties?: {
    email?: string
    name?: string
    plan?: string
    roles?: string[]
    customAttributes?: Record<string, any>
  }
  device?: DeviceInfo
  location?: LocationInfo
  preferences?: UserPreferences
}

/**
 * Device Information
 */
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  os: string
  browser: string
  version?: string
  screenResolution?: string
  colorDepth?: number
  timezone?: string
  language?: string
}

/**
 * Location Information
 */
export interface LocationInfo {
  country?: string
  region?: string
  city?: string
  coordinates?: { lat: number; lng: number }
  ipAddress?: string // Hashed for privacy
}

/**
 * User Preferences
 */
export interface UserPreferences {
  analytics: boolean
  marketing: boolean
  personalization: boolean
  dataRetention?: number // days
}

/**
 * Analytics Configuration
 */
export interface AnalyticsConfig {
  enabled: boolean
  debug: boolean
  endpoint?: string
  apiKey?: string
  bufferSize: number
  flushInterval: number
  retryAttempts: number
  privacy: PrivacyConfig
  sampling: SamplingConfig
  destinations: DestinationConfig[]
  customDimensions?: Record<string, string>
  customMetrics?: Record<string, string>
}

/**
 * Privacy Configuration
 */
export interface PrivacyConfig {
  respectDoNotTrack: boolean
  anonymizeIp: boolean
  cookieConsent: boolean
  dataRetentionDays: number
  allowPersonalData: boolean
  hashUserId: boolean
  excludeFields?: string[]
  consentManager?: {
    required: boolean
    checkFunction?: () => boolean
    onConsentChange?: (hasConsent: boolean) => void
  }
}

/**
 * Sampling Configuration
 */
export interface SamplingConfig {
  enabled: boolean
  rate: number // 0-1
  rules?: Array<{
    condition: (event: AnalyticsEvent) => boolean
    rate: number
  }>
}

/**
 * Destination Configuration
 */
export interface DestinationConfig {
  name: string
  enabled: boolean
  endpoint?: string
  apiKey?: string
  headers?: Record<string, string>
  transform?: (event: AnalyticsEvent) => any
  batchSize?: number
  retryPolicy?: RetryPolicy
}

/**
 * Retry Policy
 */
export interface RetryPolicy {
  maxAttempts: number
  backoffMultiplier: number
  initialDelay: number
  maxDelay: number
}

/**
 * Funnel Step
 */
export interface FunnelStep {
  id: string
  name: string
  condition: (event: AnalyticsEvent) => boolean
  order: number
}

/**
 * Funnel Configuration
 */
export interface FunnelConfig {
  id: string
  name: string
  steps: FunnelStep[]
  timeWindow?: number // milliseconds
  conversionWindow?: number // milliseconds
}

/**
 * Funnel Analysis Result
 */
export interface FunnelAnalysis {
  funnelId: string
  totalUsers: number
  steps: Array<{
    stepId: string
    users: number
    conversionRate: number
    dropoffRate: number
    averageTime?: number
  }>
  overallConversionRate: number
  completionTime: {
    median: number
    average: number
    p95: number
  }
}

/**
 * Cohort Configuration
 */
export interface CohortConfig {
  id: string
  name: string
  definition: (user: UserContext) => boolean
  dateRange: { start: Date; end: Date }
  metrics: string[]
}

/**
 * Cohort Analysis Result
 */
export interface CohortAnalysis {
  cohortId: string
  size: number
  retentionRates: number[]
  metrics: Record<string, number[]>
  periods: string[]
}

/**
 * A/B Test Configuration
 */
export interface ABTestConfig {
  id: string
  name: string
  hypothesis: string
  variants: Array<{
    id: string
    name: string
    traffic: number // percentage
  }>
  metrics: {
    primary: string[]
    secondary: string[]
  }
  duration: number // days
  minSampleSize: number
  significanceLevel: number
}

/**
 * A/B Test Result
 */
export interface ABTestResult {
  testId: string
  status: 'running' | 'completed' | 'stopped'
  startDate: Date
  endDate?: Date
  participants: number
  variants: Array<{
    id: string
    participants: number
    conversionRate: number
    confidence: number
    metrics: Record<string, number>
  }>
  winner?: string
  significance: number
  pValue: number
}

/**
 * Dashboard Widget Configuration
 */
export interface WidgetConfig {
  id: string
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'cohort' | 'custom'
  title: string
  description?: string
  query: AnalyticsQuery
  visualization?: VisualizationConfig
  refreshInterval?: number // minutes
  position: { x: number; y: number; w: number; h: number }
}

/**
 * Analytics Query
 */
export interface AnalyticsQuery {
  events?: string[]
  filters?: QueryFilter[]
  groupBy?: string[]
  metrics?: string[]
  dateRange: DateRange
  segment?: string
  limit?: number
  orderBy?: { field: string; direction: 'asc' | 'desc' }
}

/**
 * Query Filter
 */
export interface QueryFilter {
  field: string
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'contains'
    | 'regex'
  value: any
}

/**
 * Date Range
 */
export interface DateRange {
  start: Date
  end: Date
  relative?: {
    amount: number
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
  }
}

/**
 * Visualization Configuration
 */
export interface VisualizationConfig {
  type: 'line' | 'bar' | 'pie' | 'table' | 'heatmap' | 'gauge'
  options?: {
    colors?: string[]
    animation?: boolean
    legend?: boolean
    tooltip?: boolean
    zoom?: boolean
    responsive?: boolean
  }
}

/**
 * Analytics Report
 */
export interface AnalyticsReport {
  id: string
  name: string
  description?: string
  queries: AnalyticsQuery[]
  schedule?: ReportSchedule
  recipients?: string[]
  format: 'pdf' | 'csv' | 'json' | 'html'
  template?: string
}

/**
 * Report Schedule
 */
export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time?: string // HH:MM
  dayOfWeek?: number // 0-6
  dayOfMonth?: number // 1-31
  timezone?: string
}

/**
 * Analytics Segment
 */
export interface AnalyticsSegment {
  id: string
  name: string
  description?: string
  conditions: SegmentCondition[]
  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Segment Condition
 */
export interface SegmentCondition {
  type: 'event' | 'user' | 'session'
  field: string
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'contains'
  value: any
  timeframe?: DateRange
}

/**
 * Heat Map Configuration
 */
export interface HeatMapConfig {
  enabled: boolean
  sampleRate: number
  excludeSelectors?: string[]
  includeSelectors?: string[]
  clickTracking: boolean
  scrollTracking: boolean
  mouseMovement: boolean
}

/**
 * Session Recording Configuration
 */
export interface SessionRecordingConfig {
  enabled: boolean
  sampleRate: number
  maxDuration: number // minutes
  excludeSelectors?: string[]
  maskSensitiveData: boolean
  captureNetwork: boolean
  captureConsole: boolean
}

/**
 * Real-time Analytics Configuration
 */
export interface RealTimeConfig {
  enabled: boolean
  websocketEndpoint?: string
  updateInterval: number // seconds
  maxConnections: number
  heartbeatInterval: number
}

/**
 * Analytics Storage Configuration
 */
export interface StorageConfig {
  type: 'localStorage' | 'indexedDB' | 'memory'
  maxEvents: number
  maxAge: number // days
  compression: boolean
}

/**
 * Data Export Configuration
 */
export interface ExportConfig {
  enabled: boolean
  formats: Array<'json' | 'csv' | 'parquet'>
  destinations: Array<{
    type: 's3' | 'gcs' | 'azure' | 'webhook'
    config: Record<string, any>
  }>
  schedule?: {
    frequency: 'hourly' | 'daily' | 'weekly'
    time?: string
  }
}

/**
 * Analytics State
 */
export interface AnalyticsState {
  initialized: boolean
  enabled: boolean
  sessionId: string
  userId?: string
  userContext: UserContext
  eventBuffer: AnalyticsEvent[]
  isOnline: boolean
  consentGiven: boolean
  lastFlush: number
}

/**
 * Default Analytics Configuration
 */
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: false,
  bufferSize: 100,
  flushInterval: 30000, // 30 seconds
  retryAttempts: 3,
  privacy: {
    respectDoNotTrack: true,
    anonymizeIp: true,
    cookieConsent: true,
    dataRetentionDays: 365,
    allowPersonalData: false,
    hashUserId: true,
  },
  sampling: {
    enabled: false,
    rate: 1.0,
  },
  destinations: [],
}

/**
 * Analytics Errors
 */
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public event?: AnalyticsEvent,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AnalyticsError'
  }
}

export class ConsentError extends AnalyticsError {
  constructor(message = 'User consent required for analytics') {
    super(message, 'CONSENT_REQUIRED')
    this.name = 'ConsentError'
  }
}

export class SamplingError extends AnalyticsError {
  constructor(message = 'Event excluded by sampling') {
    super(message, 'SAMPLING_EXCLUDED')
    this.name = 'SamplingError'
  }
}
