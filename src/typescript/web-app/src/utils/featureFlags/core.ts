/**
 * Feature Flags Core Implementation
 *
 * Main feature flag evaluation engine with targeting rules, rollout logic,
 * A/B testing, and user context evaluation.
 */

import {
  FeatureFlag,
  UserContext,
  FlagEvaluationResult,
  TargetingRule,
  ABTestVariant,
  FlagValue,
  TARGETING_OPERATORS,
  FeatureFlagUtils,
} from './types'

/**
 * Feature Flag Evaluator
 */
export class FeatureFlagEvaluator {
  /**
   * Evaluate a feature flag for a given user context
   */
  evaluate(flag: FeatureFlag, context: UserContext): FlagEvaluationResult {
    const startTime = performance.now()

    try {
      // Check if flag is enabled
      if (!flag.enabled) {
        return {
          key: flag.key,
          value: flag.defaultValue,
          reason: 'FLAG_DISABLED',
        }
      }

      // Sanitize user context
      const sanitizedContext = FeatureFlagUtils.sanitizeUserContext(context)

      // Check targeting rules
      const targetingResult = this.evaluateTargeting(flag, sanitizedContext)
      if (targetingResult.matched && targetingResult.ruleId) {
        return {
          key: flag.key,
          value: targetingResult.value ?? flag.defaultValue,
          reason: `TARGETING_RULE_${targetingResult.ruleId}`,
          ruleId: targetingResult.ruleId,
          trackingData: { evaluationTime: performance.now() - startTime },
        }
      }

      // Check A/B test
      if (flag.abTest?.enabled && sanitizedContext.userId) {
        const abTestResult = this.evaluateABTest(flag, sanitizedContext)
        if (
          abTestResult.inExperiment &&
          abTestResult.value !== undefined &&
          abTestResult.variant
        ) {
          return {
            key: flag.key,
            value: abTestResult.value,
            variant: abTestResult.variant,
            reason: 'A_B_TEST',
            inExperiment: true,
            trackingData: {
              evaluationTime: performance.now() - startTime,
              experimentId: flag.abTest.variants?.find(
                v => v.id === abTestResult.variant
              )?.id,
            },
          }
        }
      }

      // Check percentage rollout
      if (flag.rollout?.enabled && sanitizedContext.userId) {
        const rolloutResult = this.evaluateRollout(flag, sanitizedContext)
        if (rolloutResult.inRollout) {
          return {
            key: flag.key,
            value:
              rolloutResult.value !== undefined
                ? rolloutResult.value
                : flag.defaultValue,
            reason: 'PERCENTAGE_ROLLOUT',
            trackingData: { evaluationTime: performance.now() - startTime },
          } as FlagEvaluationResult
        }
      }

      // Return default value
      return {
        key: flag.key,
        value: flag.defaultValue,
        reason: 'DEFAULT_VALUE',
        trackingData: { evaluationTime: performance.now() - startTime },
      } as FlagEvaluationResult
    } catch (error) {
      return {
        key: flag.key,
        value: flag.defaultValue,
        reason: 'EVALUATION_ERROR',
        trackingData: {
          evaluationTime: performance.now() - startTime,
          error: (error as Error).message,
        },
      } as FlagEvaluationResult
    }
  }

  /**
   * Evaluate targeting rules
   */
  private evaluateTargeting(
    flag: FeatureFlag,
    context: UserContext
  ): { matched: boolean; value?: FlagValue; ruleId?: string } {
    if (!flag.rules || flag.rules.length === 0) {
      return { matched: false }
    }

    for (const rule of flag.rules) {
      if (this.evaluateRule(rule, context)) {
        return {
          matched: true,
          value: flag.defaultValue, // In real implementation, rules could have their own values
          ruleId: rule.id,
        }
      }
    }

    return { matched: false }
  }

  /**
   * Evaluate a single targeting rule
   */
  private evaluateRule(rule: TargetingRule, context: UserContext): boolean {
    const contextValue = this.getContextValue(rule.attribute, context)
    if (contextValue === undefined || contextValue === null) {
      return false
    }

    const operator = TARGETING_OPERATORS[rule.operator]
    if (!operator) {
      return false
    }

    try {
      // Type-safe operator call based on context value type
      if (typeof contextValue === 'string') {
        const stringOperator = operator as (
          value: string,
          targetValues: string[]
        ) => boolean
        const stringValues = rule.values.map(v => String(v))
        return stringOperator(contextValue, stringValues)
      } else if (typeof contextValue === 'number') {
        const numberOperator = operator as (
          value: number,
          targetValues: number[]
        ) => boolean
        const numberValues = rule.values
          .map(v => Number(v))
          .filter(v => !isNaN(v))
        return numberOperator(contextValue, numberValues)
      } else {
        // Generic operator for other types
        const genericOperator = operator as (
          value: any,
          targetValues: any[]
        ) => boolean
        return genericOperator(contextValue, rule.values)
      }
    } catch (error) {
      return false
    }
  }

  /**
   * Get value from user context by attribute path
   */
  private getContextValue(attribute: string, context: UserContext): any {
    const parts = attribute.split('.')
    let value: any = context

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  /**
   * Evaluate A/B test assignment
   */
  private evaluateABTest(
    flag: FeatureFlag,
    context: UserContext
  ): { inExperiment: boolean; value?: FlagValue; variant?: string } {
    if (!flag.abTest?.enabled || !flag.abTest.variants || !context.userId) {
      return { inExperiment: false }
    }

    // Check if user is in traffic allocation
    const trafficAllocation = flag.abTest.trafficAllocation || 100
    if (
      !FeatureFlagUtils.isInRollout(
        context.userId,
        flag.key,
        trafficAllocation,
        'ab_test'
      )
    ) {
      return { inExperiment: false }
    }

    // Find variant using consistent hashing
    const hash = FeatureFlagUtils.calculateBucket(
      context.userId,
      flag.key,
      'variant'
    )
    let cumulativePercentage = 0

    for (const variant of flag.abTest.variants) {
      cumulativePercentage += variant.percentage
      const threshold = (cumulativePercentage / 100) * 1000

      if (hash < threshold) {
        return {
          inExperiment: true,
          value: variant.value,
          variant: variant.id,
        }
      }
    }

    // Fallback to control group
    const controlVariant =
      flag.abTest.variants.find(v => v.isControl) || flag.abTest.variants[0]
    if (controlVariant) {
      return {
        inExperiment: true,
        value: controlVariant.value,
        variant: controlVariant.id,
      }
    }

    return {
      inExperiment: false,
      value: flag.defaultValue,
    }
  }

  /**
   * Evaluate percentage rollout
   */
  private evaluateRollout(
    flag: FeatureFlag,
    context: UserContext
  ): { inRollout: boolean; value?: FlagValue } {
    if (!flag.rollout?.enabled || !context.userId) {
      return { inRollout: false }
    }

    const percentage = flag.rollout.percentage || 0
    const salt = flag.rollout.salt || ''

    const inRollout = FeatureFlagUtils.isInRollout(
      context.userId,
      flag.key,
      percentage,
      salt
    )

    if (inRollout) {
      return {
        inRollout: true,
        value: flag.defaultValue,
      }
    }

    return {
      inRollout: false,
    }
  }

  /**
   * Batch evaluate multiple flags
   */
  evaluateAll(
    flags: FeatureFlag[],
    context: UserContext
  ): Record<string, FlagEvaluationResult> {
    const results: Record<string, FlagEvaluationResult> = {}

    for (const flag of flags) {
      results[flag.key] = this.evaluate(flag, context)
    }

    return results
  }

  /**
   * Pre-compute flag evaluations for faster access
   */
  precomputeEvaluations(
    flags: FeatureFlag[],
    contexts: UserContext[]
  ): Map<string, Map<string, FlagEvaluationResult>> {
    const precomputed = new Map<string, Map<string, FlagEvaluationResult>>()

    for (const context of contexts) {
      const contextKey = context.userId || context.sessionId || 'anonymous'
      const evaluations = new Map<string, FlagEvaluationResult>()

      for (const flag of flags) {
        evaluations.set(flag.key, this.evaluate(flag, context))
      }

      precomputed.set(contextKey, evaluations)
    }

    return precomputed
  }
}

/**
 * Feature Flag Cache
 */
export class FeatureFlagCache {
  private cache = new Map<
    string,
    { result: FlagEvaluationResult; timestamp: number }
  >()
  private ttl: number

  constructor(ttlMs = 300000) {
    // 5 minutes default
    this.ttl = ttlMs
  }

  /**
   * Get cached evaluation result
   */
  get(key: string, userId?: string): FlagEvaluationResult | null {
    const cacheKey = this.generateCacheKey(key, userId)
    const cached = this.cache.get(cacheKey)

    if (!cached) return null

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(cacheKey)
      return null
    }

    return cached.result
  }

  /**
   * Set cache entry
   */
  set(key: string, result: FlagEvaluationResult, userId?: string): void {
    const cacheKey = this.generateCacheKey(key, userId)
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear cache for specific flag or all flags
   */
  clear(flagKey?: string): void {
    if (flagKey) {
      // Clear all entries for this flag key
      for (const [key] of this.cache) {
        if (key.startsWith(`${flagKey}:`)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would track hits/misses in real implementation
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(flagKey: string, userId?: string): string {
    return `${flagKey}:${userId || 'anonymous'}`
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * Feature Flag Analytics Tracker
 */
export class FeatureFlagAnalytics {
  private events: Array<{
    type: string
    timestamp: number
    data: Record<string, any>
  }> = []

  /**
   * Track flag evaluation
   */
  trackEvaluation(result: FlagEvaluationResult, context: UserContext): void {
    this.events.push({
      type: 'flag_evaluated',
      timestamp: Date.now(),
      data: {
        flagKey: result.key,
        value: result.value,
        variant: result.variant,
        reason: result.reason,
        userId: context.userId,
        sessionId: context.sessionId,
        inExperiment: result.inExperiment,
        evaluationTime: result.trackingData?.evaluationTime,
      },
    })

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
  }

  /**
   * Track experiment view
   */
  trackExperimentView(
    flagKey: string,
    variant: string,
    context: UserContext
  ): void {
    this.events.push({
      type: 'experiment_viewed',
      timestamp: Date.now(),
      data: {
        flagKey,
        variant,
        userId: context.userId,
        sessionId: context.sessionId,
      },
    })
  }

  /**
   * Track conversion event
   */
  trackConversion(
    flagKey: string,
    variant: string,
    metric: string,
    value?: number
  ): void {
    this.events.push({
      type: 'conversion',
      timestamp: Date.now(),
      data: {
        flagKey,
        variant,
        metric,
        value,
      },
    })
  }

  /**
   * Get analytics data
   */
  getEvents(
    type?: string
  ): Array<{ type: string; timestamp: number; data: Record<string, any> }> {
    if (type) {
      return this.events.filter(event => event.type === type)
    }
    return [...this.events]
  }

  /**
   * Get flag usage statistics
   */
  getFlagStats(flagKey: string): {
    evaluations: number
    uniqueUsers: number
    variants: Record<string, number>
  } {
    const flagEvents = this.events.filter(
      event => event.type === 'flag_evaluated' && event.data.flagKey === flagKey
    )

    const uniqueUsers = new Set(flagEvents.map(event => event.data.userId)).size
    const variants: Record<string, number> = {}

    for (const event of flagEvents) {
      const variant = event.data.variant || 'default'
      variants[variant] = (variants[variant] || 0) + 1
    }

    return {
      evaluations: flagEvents.length,
      uniqueUsers,
      variants,
    }
  }

  /**
   * Export analytics data
   */
  export(): string {
    return JSON.stringify({
      exportTime: Date.now(),
      events: this.events,
    })
  }

  /**
   * Clear analytics data
   */
  clear(): void {
    this.events = []
  }
}
