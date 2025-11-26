/**
 * Feature Flags and App Configuration Management
 * 
 * Centralized feature toggle system for A/B testing, beta features,
 * and experimental configurations with environment-aware defaults.
 * 
 * @module FeatureFlags
 */

import { APP_MODE, CONFIG } from './environment';

// Feature flag types
export type FeatureFlag = 
  | 'AI_SUGGESTIONS'
  | 'OFFLINE_MODE'
  | 'REAL_TIME_COLLABORATION'
  | 'ADVANCED_PERMISSIONS'
  | 'DOCUMENT_VERSIONING'
  | 'ANALYTICS_TRACKING'
  | 'PUSH_NOTIFICATIONS'
  | 'EXPORT_FEATURES'
  | 'TEMPLATE_SYSTEM'
  | 'COMMENT_SYSTEM'
  | 'WORKFLOW_AUTOMATION'
  | 'INTEGRATION_WEBHOOKS'
  | 'CUSTOM_THEMES'
  | 'MOBILE_APP'
  | 'API_V2'
  | 'BETA_UI'
  | 'EXPERIMENTAL_CRDT'
  | 'DEBUG_MODE';

// A/B test variants
export type ABTestVariant = 'A' | 'B' | 'CONTROL';

// Configuration categories
export interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage?: number;
  userSegments?: string[];
  environmentRestriction?: string[];
  abTestVariant?: ABTestVariant;
  metadata?: Record<string, any>;
}

// Default feature flag configurations
const DEFAULT_FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  AI_SUGGESTIONS: {
    enabled: true,
    rolloutPercentage: 100,
    userSegments: ['premium', 'enterprise'],
    metadata: { provider: 'openai', model: 'gpt-4' }
  },
  OFFLINE_MODE: {
    enabled: true,
    rolloutPercentage: 80,
    metadata: { storageLimit: '50MB', syncTimeout: 30000 }
  },
  REAL_TIME_COLLABORATION: {
    enabled: true,
    rolloutPercentage: 100,
    metadata: { maxConcurrentUsers: 50, presenceTimeout: 10000 }
  },
  ADVANCED_PERMISSIONS: {
    enabled: false,
    rolloutPercentage: 0,
    userSegments: ['enterprise'],
    metadata: { rolesSupported: ['owner', 'editor', 'viewer', 'commenter'] }
  },
  DOCUMENT_VERSIONING: {
    enabled: true,
    rolloutPercentage: 100,
    metadata: { maxVersions: 50, autoSaveInterval: 5000 }
  },
  ANALYTICS_TRACKING: {
    enabled: true,
    rolloutPercentage: 100,
    environmentRestriction: ['production', 'staging'],
    metadata: { providers: ['ga4', 'mixpanel'], samplingRate: 0.1 }
  },
  PUSH_NOTIFICATIONS: {
    enabled: false,
    rolloutPercentage: 30,
    abTestVariant: 'A',
    metadata: { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY }
  },
  EXPORT_FEATURES: {
    enabled: true,
    rolloutPercentage: 100,
    metadata: { formats: ['pdf', 'docx', 'markdown', 'html'] }
  },
  TEMPLATE_SYSTEM: {
    enabled: false,
    rolloutPercentage: 20,
    userSegments: ['premium', 'enterprise'],
    metadata: { maxCustomTemplates: 10 }
  },
  COMMENT_SYSTEM: {
    enabled: true,
    rolloutPercentage: 100,
    metadata: { threaded: true, reactions: true, mentions: true }
  },
  WORKFLOW_AUTOMATION: {
    enabled: false,
    rolloutPercentage: 0,
    userSegments: ['enterprise'],
    metadata: { maxWorkflows: 5, maxSteps: 20 }
  },
  INTEGRATION_WEBHOOKS: {
    enabled: false,
    rolloutPercentage: 10,
    userSegments: ['premium', 'enterprise'],
    metadata: { maxWebhooks: 10, retryAttempts: 3 }
  },
  CUSTOM_THEMES: {
    enabled: true,
    rolloutPercentage: 100,
    metadata: { maxCustomThemes: 5, darkModeSupported: true }
  },
  MOBILE_APP: {
    enabled: false,
    rolloutPercentage: 0,
    metadata: { supportedPlatforms: ['ios', 'android'] }
  },
  API_V2: {
    enabled: false,
    rolloutPercentage: 5,
    userSegments: ['beta_testers'],
    metadata: { baseUrl: '/api/v2', deprecationDate: '2024-12-31' }
  },
  BETA_UI: {
    enabled: false,
    rolloutPercentage: 15,
    abTestVariant: 'B',
    metadata: { components: ['editor', 'sidebar', 'toolbar'] }
  },
  EXPERIMENTAL_CRDT: {
    enabled: false,
    rolloutPercentage: 0,
    userSegments: ['internal'],
    environmentRestriction: ['development'],
    metadata: { algorithm: 'yjs', performanceMode: true }
  },
  DEBUG_MODE: {
    enabled: APP_MODE === 'development',
    rolloutPercentage: 100,
    environmentRestriction: ['development'],
    metadata: { verboseLogging: true, performanceMetrics: true }
  }
};

// Runtime feature flag overrides (from environment variables)
const getEnvironmentOverrides = (): Partial<Record<FeatureFlag, FeatureFlagConfig>> => {
  const overrides: Partial<Record<FeatureFlag, FeatureFlagConfig>> = {};
  
  // Check for environment variable overrides
  Object.keys(DEFAULT_FEATURE_FLAGS).forEach((flag) => {
    const envKey = `NEXT_PUBLIC_FEATURE_${flag}`;
    const envValue = process.env[envKey];
    
    if (envValue !== undefined) {
      overrides[flag as FeatureFlag] = {
        ...DEFAULT_FEATURE_FLAGS[flag as FeatureFlag],
        enabled: envValue === 'true'
      };
    }
  });
  
  return overrides;
};

// Combined feature flag configuration
const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  ...DEFAULT_FEATURE_FLAGS,
  ...getEnvironmentOverrides()
};

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = (
  flag: FeatureFlag,
  userId?: string,
  userSegment?: string
): boolean => {
  const config = FEATURE_FLAGS[flag];
  
  if (!config) {
    console.warn(`Feature flag ${flag} not found`);
    return false;
  }
  
  // Check environment restrictions
  if (config.environmentRestriction && 
      !config.environmentRestriction.includes(APP_MODE)) {
    return false;
  }
  
  // Check user segment restrictions
  if (config.userSegments && userSegment && 
      !config.userSegments.includes(userSegment)) {
    return false;
  }
  
  // Check rollout percentage (simple hash-based distribution)
  if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
    if (userId) {
      const hash = simpleHash(userId + flag);
      const userPercentile = hash % 100;
      if (userPercentile >= config.rolloutPercentage) {
        return false;
      }
    } else if (Math.random() * 100 >= config.rolloutPercentage) {
      return false;
    }
  }
  
  return config.enabled;
};

/**
 * Get feature flag configuration
 */
export const getFeatureConfig = (flag: FeatureFlag): FeatureFlagConfig | null => {
  return FEATURE_FLAGS[flag] || null;
};

/**
 * Get A/B test variant for a feature
 */
export const getABTestVariant = (
  flag: FeatureFlag,
  userId?: string
): ABTestVariant => {
  const config = FEATURE_FLAGS[flag];
  
  if (!config?.abTestVariant) {
    return 'CONTROL';
  }
  
  if (userId) {
    const hash = simpleHash(userId + flag + 'variant');
    return hash % 2 === 0 ? 'A' : 'B';
  }
  
  return config.abTestVariant;
};

/**
 * Get all enabled features for a user
 */
export const getEnabledFeatures = (
  userId?: string,
  userSegment?: string
): FeatureFlag[] => {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter(flag =>
    isFeatureEnabled(flag, userId, userSegment)
  );
};

/**
 * App configuration derived from feature flags
 */
export const getAppConfig = (userId?: string, userSegment?: string) => {
  const enabledFeatures = getEnabledFeatures(userId, userSegment);
  
  return {
    features: enabledFeatures,
    ai: {
      enabled: enabledFeatures.includes('AI_SUGGESTIONS'),
      provider: getFeatureConfig('AI_SUGGESTIONS')?.metadata?.provider || 'openai',
      model: getFeatureConfig('AI_SUGGESTIONS')?.metadata?.model || 'gpt-3.5-turbo'
    },
    offline: {
      enabled: enabledFeatures.includes('OFFLINE_MODE'),
      storageLimit: getFeatureConfig('OFFLINE_MODE')?.metadata?.storageLimit || '10MB',
      syncTimeout: getFeatureConfig('OFFLINE_MODE')?.metadata?.syncTimeout || 15000
    },
    collaboration: {
      enabled: enabledFeatures.includes('REAL_TIME_COLLABORATION'),
      maxUsers: getFeatureConfig('REAL_TIME_COLLABORATION')?.metadata?.maxConcurrentUsers || 10,
      presenceTimeout: getFeatureConfig('REAL_TIME_COLLABORATION')?.metadata?.presenceTimeout || 5000
    },
    analytics: {
      enabled: enabledFeatures.includes('ANALYTICS_TRACKING'),
      providers: getFeatureConfig('ANALYTICS_TRACKING')?.metadata?.providers || [],
      samplingRate: getFeatureConfig('ANALYTICS_TRACKING')?.metadata?.samplingRate || 1.0
    },
    ui: {
      betaMode: enabledFeatures.includes('BETA_UI'),
      variant: getABTestVariant('BETA_UI', userId),
      customThemes: enabledFeatures.includes('CUSTOM_THEMES'),
      debugMode: enabledFeatures.includes('DEBUG_MODE')
    },
    export: {
      enabled: enabledFeatures.includes('EXPORT_FEATURES'),
      formats: getFeatureConfig('EXPORT_FEATURES')?.metadata?.formats || ['pdf', 'docx']
    }
  };
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Override feature flag for development/testing
   */
  overrideFeature: (flag: FeatureFlag, enabled: boolean) => {
    if (APP_MODE === 'development') {
      FEATURE_FLAGS[flag] = { ...FEATURE_FLAGS[flag], enabled };
    }
  },
  
  /**
   * Get all feature flags (development only)
   */
  getAllFlags: () => {
    if (APP_MODE === 'development') {
      return FEATURE_FLAGS;
    }
    return {};
  },
  
  /**
   * Reset feature flags to defaults
   */
  resetFlags: () => {
    if (APP_MODE === 'development') {
      Object.assign(FEATURE_FLAGS, DEFAULT_FEATURE_FLAGS);
    }
  }
};

// Simple hash function for consistent user-based rollouts
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Export commonly used feature checks as convenience functions
export const Features = {
  isAIEnabled: (userId?: string, userSegment?: string) => 
    isFeatureEnabled('AI_SUGGESTIONS', userId, userSegment),
  
  isOfflineEnabled: (userId?: string, userSegment?: string) => 
    isFeatureEnabled('OFFLINE_MODE', userId, userSegment),
  
  isCollaborationEnabled: (userId?: string, userSegment?: string) => 
    isFeatureEnabled('REAL_TIME_COLLABORATION', userId, userSegment),
  
  isAnalyticsEnabled: (userId?: string, userSegment?: string) => 
    isFeatureEnabled('ANALYTICS_TRACKING', userId, userSegment),
  
  isBetaUI: (userId?: string, userSegment?: string) => 
    isFeatureEnabled('BETA_UI', userId, userSegment),
  
  isDebugMode: () => 
    isFeatureEnabled('DEBUG_MODE')
};