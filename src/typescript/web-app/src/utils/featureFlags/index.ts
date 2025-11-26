/**
 * Feature Flags Enhancement - Simple Implementation
 *
 * Basic feature flag system with targeting, A/B testing, and rollouts.
 */

import {
  FeatureFlag,
  UserContext,
  FlagEvaluationResult,
  FlagValue,
} from './types'

/**
 * Feature Flag Manager
 */
export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map()
  private cache: Map<string, FlagEvaluationResult> = new Map()

  /**
   * Register feature flags
   */
  registerFlags(flags: FeatureFlag[]): void {
    flags.forEach(flag => {
      this.flags.set(flag.key, flag)
    })
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(flagKey: string, context: UserContext = {}): boolean {
    const result = this.evaluate(flagKey, context)
    return Boolean(result.value)
  }

  /**
   * Get feature flag value with type safety
   */
  getValue<T extends FlagValue>(
    flagKey: string,
    context: UserContext = {},
    defaultValue?: T
  ): T | undefined {
    const result = this.evaluate(flagKey, context)
    if (result.value !== undefined && result.value !== null) {
      return result.value as T
    }
    return defaultValue
  }

  /**
   * Evaluate feature flag
   */
  evaluate(flagKey: string, context: UserContext): FlagEvaluationResult {
    const cacheKey = `${flagKey}:${context.userId || 'anonymous'}`

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    const flag = this.flags.get(flagKey)
    if (!flag) {
      return {
        key: flagKey,
        value: false,
        reason: 'FLAG_NOT_FOUND',
      }
    }

    const result = this.evaluateFlag(flag, context)

    // Cache result
    this.cache.set(cacheKey, result)

    return result
  }

  /**
   * Internal flag evaluation
   */
  private evaluateFlag(
    flag: FeatureFlag,
    context: UserContext
  ): FlagEvaluationResult {
    if (!flag.enabled) {
      return {
        key: flag.key,
        value: flag.defaultValue,
        reason: 'FLAG_DISABLED',
      }
    }

    // Check targeting rules
    if (flag.rules && flag.rules.length > 0) {
      for (const rule of flag.rules) {
        if (this.evaluateRule(rule, context)) {
          return {
            key: flag.key,
            value: flag.defaultValue,
            reason: 'TARGETING_RULE',
            ruleId: rule.id,
          }
        }
      }
    }

    // Check A/B test
    if (flag.abTest && flag.abTest.enabled && context.userId) {
      const variant = this.getABTestVariant(flag, context.userId)
      if (variant) {
        return {
          key: flag.key,
          value: variant.value,
          reason: 'A_B_TEST',
          variant: variant.id,
          inExperiment: true,
        }
      }
    }

    // Check percentage rollout
    if (flag.rollout && flag.rollout.enabled && context.userId) {
      const inRollout = this.isInRollout(flag, context.userId)
      if (inRollout) {
        return {
          key: flag.key,
          value: flag.defaultValue,
          reason: 'PERCENTAGE_ROLLOUT',
        }
      }
    }

    // Return default value
    return {
      key: flag.key,
      value: flag.defaultValue,
      reason: 'DEFAULT_VALUE',
    }
  }

  /**
   * Evaluate targeting rule
   */
  private evaluateRule(rule: any, context: UserContext): boolean {
    const contextValue = this.getContextValue(rule.attribute, context)
    if (contextValue === undefined) {
      return false
    }

    switch (rule.operator) {
      case 'equals':
        return rule.values.includes(contextValue)
      case 'not_equals':
        return !rule.values.includes(contextValue)
      case 'contains':
        return (
          typeof contextValue === 'string' &&
          rule.values.some((val: string) => contextValue.includes(val))
        )
      case 'greater_than':
        return (
          typeof contextValue === 'number' &&
          rule.values.some((val: number) => contextValue > val)
        )
      case 'less_than':
        return (
          typeof contextValue === 'number' &&
          rule.values.some((val: number) => contextValue < val)
        )
      case 'in':
        return rule.values.some((val: any) =>
          Array.isArray(contextValue)
            ? contextValue.includes(val)
            : contextValue === val
        )
      default:
        return false
    }
  }

  /**
   * Get A/B test variant
   */
  private getABTestVariant(flag: FeatureFlag, userId: string) {
    if (!flag.abTest) return null

    const hash = this.simpleHash(`${userId}:${flag.key}`)
    const bucket = hash % 100

    let currentPercentage = 0
    for (const variant of flag.abTest.variants) {
      currentPercentage += variant.percentage
      if (bucket < currentPercentage) {
        return variant
      }
    }

    return null
  }

  /**
   * Check if user is in rollout
   */
  private isInRollout(flag: FeatureFlag, userId: string): boolean {
    if (!flag.rollout) return false

    const hash = this.simpleHash(`${userId}:${flag.key}:rollout`)
    const bucket = hash % 100

    return bucket < flag.rollout.percentage
  }

  /**
   * Get value from context
   */
  private getContextValue(attribute: string, context: UserContext): any {
    const parts = attribute.split('.')
    let value: any = context

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get all flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  /**
   * Remove flag
   */
  removeFlag(flagKey: string): void {
    this.flags.delete(flagKey)
    // Clear related cache entries
    const keysToDelete = Array.from(this.cache.keys()).filter(key =>
      key.startsWith(flagKey)
    )
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

// Create and export default instance
export const featureFlags = new FeatureFlagManager()

// Export utilities
export const createFeatureFlagManager = (flags?: FeatureFlag[]) => {
  const manager = new FeatureFlagManager()
  if (flags) {
    manager.registerFlags(flags)
  }
  return manager
}

// Export types
export * from './types'
