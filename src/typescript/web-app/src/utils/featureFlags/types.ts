/**
 * Feature Flags Types and Interfaces
 *
 * Comprehensive feature flag system with remote configuration, A/B testing,
 * audience targeting, analytics integration, and real-time flag updates.
 */

/**
 * Feature Flag Value Types
 */
export type FlagValue = boolean | string | number | object | null

/**
 * Feature Flag Targeting Rules
 */
export interface TargetingRule {
  id: string
  attribute: string
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'in'
    | 'not_in'
    | 'greater_than'
    | 'less_than'
    | 'greater_equal'
    | 'less_equal'
    | 'regex'
    | 'semver_greater'
    | 'semver_less'
  values: (string | number)[]
  description?: string
}

/**
 * Feature Flag Rollout Configuration
 */
export interface RolloutConfiguration {
  enabled: boolean
  percentage: number
  buckets?: number
  salt?: string
  stickyBucket?: boolean
}

/**
 * Feature Flag A/B Test Configuration
 */
export interface ABTestConfiguration {
  enabled: boolean
  variants: ABTestVariant[]
  trafficAllocation: number
  winnerVariant?: string
  conversionMetric?: string
  confidenceLevel?: number
}

/**
 * A/B Test Variant
 */
export interface ABTestVariant {
  id: string
  name: string
  value: FlagValue
  percentage: number
  isControl?: boolean
  description?: string
}

/**
 * Feature Flag Audience
 */
export interface Audience {
  id: string
  name: string
  rules: TargetingRule[]
  description?: string
}

/**
 * Feature Flag Definition
 */
export interface FeatureFlag {
  key: string
  name: string
  description?: string
  enabled: boolean
  defaultValue: FlagValue
  type: 'boolean' | 'string' | 'number' | 'json'

  // Targeting
  audiences?: string[]
  rules?: TargetingRule[]

  // Rollout
  rollout?: RolloutConfiguration

  // A/B Testing
  abTest?: ABTestConfiguration

  // Metadata
  tags?: string[]
  category?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string

  // Lifecycle
  permanent?: boolean
  deprecatedAt?: string
  archiveAfter?: string

  // Analytics
  trackEvents?: boolean
  customEvents?: string[]
}

/**
 * User Context for Feature Flag Evaluation
 */
export interface UserContext {
  userId?: string
  email?: string
  username?: string
  roles?: string[]
  permissions?: string[]
  groups?: string[]

  // Demographics
  country?: string
  region?: string
  city?: string
  timezone?: string
  language?: string

  // Platform
  platform?: string
  device?: string
  browser?: string
  version?: string
  os?: string

  // Subscription
  plan?: string
  tier?: string
  subscriptionStatus?: string

  // Custom attributes
  customAttributes?: Record<string, any>

  // Session
  sessionId?: string
  isFirstVisit?: boolean
  registrationDate?: string
}

/**
 * Feature Flag Evaluation Result
 */
export interface FlagEvaluationResult {
  key: string
  value: FlagValue
  variant?: string
  reason: string
  ruleId?: string
  audienceId?: string
  inExperiment?: boolean
  trackingData?: Record<string, any>
}

/**
 * Feature Flags Configuration
 */
export interface FeatureFlagsConfig {
  // Remote configuration
  remoteUrl?: string
  apiKey?: string
  projectId?: string
  environment?: string

  // Polling
  pollingInterval?: number
  enablePolling?: boolean

  // Streaming
  enableStreaming?: boolean
  streamingUrl?: string

  // Local fallback
  fallbackFlags?: Record<string, FlagValue>
  enableLocalFallback?: boolean

  // Cache
  cacheEnabled?: boolean
  cacheTTL?: number
  cachePrefix?: string

  // Analytics
  analyticsEnabled?: boolean
  analyticsProvider?:
    | 'internal'
    | 'segment'
    | 'amplitude'
    | 'mixpanel'
    | 'custom'
  customAnalytics?: (event: AnalyticsEvent) => void

  // Error handling
  onError?: (error: Error) => void
  silentErrors?: boolean

  // Performance
  maxEvaluationTime?: number
  enableMetrics?: boolean

  // Development
  debugMode?: boolean
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'
}

/**
 * Analytics Event
 */
export interface AnalyticsEvent {
  type: 'flag_evaluated' | 'experiment_viewed' | 'conversion' | 'custom'
  timestamp: number
  flagKey?: string
  value?: FlagValue
  variant?: string
  userId?: string
  sessionId?: string
  context?: UserContext
  metadata?: Record<string, any>
}

/**
 * Feature Flag Store State
 */
export interface FeatureFlagStore {
  flags: Record<string, FeatureFlag>
  audiences: Record<string, Audience>
  userContext: UserContext | null
  evaluationCache: Record<string, FlagEvaluationResult>
  lastUpdated: number
  isLoading: boolean
  error: string | null
  connected: boolean
}

/**
 * Remote Feature Flags Response
 */
export interface RemoteFlagsResponse {
  flags: FeatureFlag[]
  audiences?: Audience[]
  etag?: string
  lastModified?: string
  ttl?: number
}

/**
 * Feature Flag Event Types
 */
export type FeatureFlagEvent =
  | 'flags_updated'
  | 'flag_evaluated'
  | 'context_changed'
  | 'connection_status'
  | 'error'
  | 'ready'

/**
 * Feature Flag Event Handler
 */
export interface FeatureFlagEventHandler {
  (event: FeatureFlagEvent, data: any): void
}

/**
 * Feature Flag Provider Interface
 */
export interface FeatureFlagProvider {
  fetchFlags(config: FeatureFlagsConfig): Promise<RemoteFlagsResponse>
  subscribeToUpdates?(
    config: FeatureFlagsConfig,
    callback: (flags: RemoteFlagsResponse) => void
  ): () => void
}

/**
 * Built-in Feature Flag Providers
 */
export type BuiltInProvider =
  | 'launchdarkly'
  | 'split'
  | 'optimizely'
  | 'unleash'
  | 'flagsmith'
  | 'configcat'
  | 'growthbook'

/**
 * Hash Algorithm for Bucketing
 */
export type HashAlgorithm = 'sha1' | 'sha256' | 'md5' | 'murmur3'

/**
 * Feature Flag Metrics
 */
export interface FeatureFlagMetrics {
  totalFlags: number
  enabledFlags: number
  evaluationsCount: number
  cacheHitRate: number
  averageEvaluationTime: number
  errorRate: number
  lastUpdateTime: number
  connectionStatus: 'connected' | 'disconnected' | 'error'
}

/**
 * Feature Flag Validation Rules
 */
export interface FlagValidationRule {
  key: string
  validator: (value: FlagValue) => boolean | string
  message?: string
}

/**
 * Feature Flag Middleware
 */
export interface FeatureFlagMiddleware {
  beforeEvaluation?: (
    key: string,
    context: UserContext
  ) => UserContext | Promise<UserContext>
  afterEvaluation?: (
    result: FlagEvaluationResult,
    context: UserContext
  ) => void | Promise<void>
  onError?: (
    error: Error,
    key: string,
    context: UserContext
  ) => FlagValue | void
}

/**
 * Default Values
 */
export const DEFAULT_FEATURE_FLAGS_CONFIG: Required<FeatureFlagsConfig> = {
  remoteUrl: '',
  apiKey: '',
  projectId: '',
  environment: 'production',
  pollingInterval: 60000, // 1 minute
  enablePolling: true,
  enableStreaming: false,
  streamingUrl: '',
  fallbackFlags: {},
  enableLocalFallback: true,
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes
  cachePrefix: 'ff_',
  analyticsEnabled: true,
  analyticsProvider: 'internal',
  customAnalytics: () => {},
  onError: () => {},
  silentErrors: false,
  maxEvaluationTime: 100, // 100ms
  enableMetrics: true,
  debugMode: false,
  logLevel: 'warn',
}

/**
 * Targeting Operators
 */
export const TARGETING_OPERATORS = {
  equals: (value: any, targetValues: any[]) => targetValues.includes(value),
  not_equals: (value: any, targetValues: any[]) =>
    !targetValues.includes(value),
  contains: (value: string, targetValues: string[]) =>
    targetValues.some(target => value.includes(target)),
  not_contains: (value: string, targetValues: string[]) =>
    !targetValues.some(target => value.includes(target)),
  in: (value: any, targetValues: any[]) => targetValues.includes(value),
  not_in: (value: any, targetValues: any[]) => !targetValues.includes(value),
  greater_than: (value: number, targetValues: number[]) =>
    targetValues.some(target => value > target),
  less_than: (value: number, targetValues: number[]) =>
    targetValues.some(target => value < target),
  greater_equal: (value: number, targetValues: number[]) =>
    targetValues.some(target => value >= target),
  less_equal: (value: number, targetValues: number[]) =>
    targetValues.some(target => value <= target),
  regex: (value: string, targetValues: string[]) => {
    return targetValues.some(pattern => {
      try {
        return new RegExp(pattern).test(value)
      } catch {
        return false
      }
    })
  },
  semver_greater: (value: string, targetValues: string[]) => {
    // Simplified semver comparison - would use a proper semver library in production
    return targetValues.some(target => value > target)
  },
  semver_less: (value: string, targetValues: string[]) => {
    // Simplified semver comparison - would use a proper semver library in production
    return targetValues.some(target => value < target)
  },
} as const

/**
 * Utility Functions
 */
export const FeatureFlagUtils = {
  /**
   * Generate consistent hash for bucketing
   */
  generateHash: (input: string, algorithm: HashAlgorithm = 'sha1'): number => {
    // Simple hash function - would use crypto in production
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  },

  /**
   * Calculate bucket for percentage rollouts
   */
  calculateBucket: (
    userId: string,
    flagKey: string,
    salt = '',
    buckets = 1000
  ): number => {
    const hashInput = `${userId}:${flagKey}:${salt}`
    const hash = FeatureFlagUtils.generateHash(hashInput)
    return hash % buckets
  },

  /**
   * Check if user is in percentage rollout
   */
  isInRollout: (
    userId: string,
    flagKey: string,
    percentage: number,
    salt = ''
  ): boolean => {
    if (percentage <= 0) return false
    if (percentage >= 100) return true

    const bucket = FeatureFlagUtils.calculateBucket(userId, flagKey, salt)
    const threshold = (percentage / 100) * 1000
    return bucket < threshold
  },

  /**
   * Validate feature flag structure
   */
  validateFlag: (flag: Partial<FeatureFlag>): string[] => {
    const errors: string[] = []

    if (!flag.key) errors.push('Flag key is required')
    if (!flag.name) errors.push('Flag name is required')
    if (flag.defaultValue === undefined)
      errors.push('Default value is required')

    if (flag.rollout && flag.rollout.enabled) {
      if (flag.rollout.percentage < 0 || flag.rollout.percentage > 100) {
        errors.push('Rollout percentage must be between 0 and 100')
      }
    }

    if (flag.abTest && flag.abTest.enabled) {
      const totalPercentage =
        flag.abTest.variants?.reduce(
          (sum, variant) => sum + variant.percentage,
          0
        ) || 0
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push('A/B test variant percentages must sum to 100')
      }
    }

    return errors
  },

  /**
   * Sanitize user context for safe evaluation
   */
  sanitizeUserContext: (context: UserContext): UserContext => {
    // Remove sensitive information and ensure safe types
    const sanitized: UserContext = {}

    // Copy safe fields
    const safeFields = [
      'userId',
      'email',
      'username',
      'roles',
      'permissions',
      'groups',
      'country',
      'region',
      'city',
      'timezone',
      'language',
      'platform',
      'device',
      'browser',
      'version',
      'os',
      'plan',
      'tier',
      'subscriptionStatus',
      'sessionId',
      'isFirstVisit',
      'registrationDate',
    ]

    for (const field of safeFields) {
      if (context[field as keyof UserContext] !== undefined) {
        ;(sanitized as any)[field] = context[field as keyof UserContext]
      }
    }

    // Sanitize custom attributes
    if (context.customAttributes) {
      sanitized.customAttributes = {}
      for (const [key, value] of Object.entries(context.customAttributes)) {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          sanitized.customAttributes[key] = value
        }
      }
    }

    return sanitized
  },

  /**
   * Generate flag evaluation reason
   */
  generateEvaluationReason: (
    flag: FeatureFlag,
    result: { matched: boolean; source: string; ruleId?: string }
  ): string => {
    if (!flag.enabled) return 'FLAG_DISABLED'
    if (result.source === 'default') return 'DEFAULT_VALUE'
    if (result.source === 'targeting') return `TARGETING_RULE_${result.ruleId}`
    if (result.source === 'rollout') return 'PERCENTAGE_ROLLOUT'
    if (result.source === 'experiment') return 'A_B_TEST'
    return 'UNKNOWN'
  },
}

/**
 * Type Guards
 */
export const isFeatureFlag = (obj: any): obj is FeatureFlag => {
  return obj && typeof obj.key === 'string' && typeof obj.enabled === 'boolean'
}

export const isUserContext = (obj: any): obj is UserContext => {
  return obj && typeof obj === 'object'
}

export const isFlagEvaluationResult = (
  obj: any
): obj is FlagEvaluationResult => {
  return (
    obj &&
    typeof obj.key === 'string' &&
    obj.value !== undefined &&
    typeof obj.reason === 'string'
  )
}
