/**
 * Analytics System - Main Implementation
 *
 * Event tracking, user behavior analysis, performance monitoring,
 * and reporting with privacy compliance.
 */

import {
  AnalyticsConfig,
  AnalyticsEvent,
  AnalyticsState,
  UserContext,
  EventType,
  EventPriority,
  PerformanceData,
  DEFAULT_ANALYTICS_CONFIG,
  ConsentError,
  SamplingError,
} from './types'

/**
 * Analytics Manager
 */
export class AnalyticsManager {
  private config: AnalyticsConfig
  private state: AnalyticsState
  private flushTimer?: NodeJS.Timeout
  private performanceObserver?: PerformanceObserver

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config }
    this.state = this.initializeState()

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * Initialize analytics state
   */
  private initializeState(): AnalyticsState {
    return {
      initialized: false,
      enabled: this.config.enabled,
      sessionId: this.generateSessionId(),
      userContext: this.createUserContext(),
      eventBuffer: [],
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      consentGiven: this.checkConsent(),
      lastFlush: Date.now(),
    }
  }

  /**
   * Initialize analytics
   */
  private async initialize(): Promise<void> {
    try {
      // Check privacy settings
      if (!this.state.consentGiven) {
        if (this.config.debug) {
          console.warn('Analytics: User consent not given')
        }
        return
      }

      // Check Do Not Track
      if (this.config.privacy.respectDoNotTrack && this.isDoNotTrackEnabled()) {
        this.state.enabled = false
        return
      }

      // Set up performance monitoring
      this.initializePerformanceMonitoring()

      // Set up automatic flush
      this.startFlushTimer()

      // Listen to online/offline events
      this.setupNetworkListeners()

      // Set up page visibility listeners
      this.setupVisibilityListeners()

      this.state.initialized = true

      // Track initialization
      this.track('analytics_initialized', {
        config: {
          destinations: this.config.destinations.length,
          sampling: this.config.sampling.enabled,
          privacy: this.config.privacy.respectDoNotTrack,
        },
      })

      if (this.config.debug) {
        console.log('Analytics initialized successfully')
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Analytics initialization failed:', error)
      }
    }
  }

  /**
   * Track an event
   */
  track(
    name: string,
    properties: Record<string, any> = {},
    options: {
      type?: EventType
      category?: string
      priority?: EventPriority
      timestamp?: number
    } = {}
  ): void {
    if (!this.canTrack()) {
      return
    }

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: options.type || 'custom',
      name,
      ...(options.category ? { category: options.category } : {}),
      timestamp: options.timestamp || Date.now(),
      sessionId: this.state.sessionId,
      ...(this.state.userId ? { userId: this.state.userId } : {}),
      properties: this.sanitizeProperties(properties),
      metadata: this.gatherMetadata(),
      priority: options.priority || 'normal',
    }

    // Apply sampling
    if (!this.shouldSampleEvent(event)) {
      if (this.config.debug) {
        console.log('Event excluded by sampling:', event.name)
      }
      return
    }

    // Add to buffer
    this.state.eventBuffer.push(event)

    // Check if we need to flush
    if (this.shouldFlush()) {
      this.flush()
    }

    if (this.config.debug) {
      console.log('Event tracked:', event)
    }
  }

  /**
   * Track page view
   */
  pageView(path?: string, properties: Record<string, any> = {}): void {
    const currentPath =
      path || (typeof window !== 'undefined' ? window.location.pathname : '/')

    this.track(
      'page_view',
      {
        path: currentPath,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        title: typeof document !== 'undefined' ? document.title : '',
        ...properties,
      },
      {
        type: 'page_view',
        category: 'navigation',
      }
    )
  }

  /**
   * Track user action
   */
  action(
    action: string,
    target?: string,
    properties: Record<string, any> = {}
  ): void {
    this.track(
      'user_action',
      {
        action,
        target,
        ...properties,
      },
      {
        type: 'user_action',
        category: 'interaction',
      }
    )
  }

  /**
   * Track form submission
   */
  formSubmit(formId: string, properties: Record<string, any> = {}): void {
    this.track(
      'form_submit',
      {
        formId,
        ...properties,
      },
      {
        type: 'form_submit',
        category: 'conversion',
      }
    )
  }

  /**
   * Track error
   */
  error(error: Error | string, context?: Record<string, any>): void {
    const errorData =
      typeof error === 'string'
        ? { message: error }
        : {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }

    this.track(
      'error',
      {
        error: errorData,
        context,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
      {
        type: 'error',
        category: 'error',
        priority: 'high',
      }
    )
  }

  /**
   * Track performance metrics
   */
  performance(metrics: Record<string, number>, category = 'performance'): void {
    this.track('performance', metrics, {
      type: 'performance',
      category,
    })
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.state.userId = this.config.privacy.hashUserId
      ? this.hashUserId(userId)
      : userId
    this.state.userContext.userId = this.state.userId
    this.state.userContext.isAnonymous = false

    if (this.config.debug) {
      console.log('User ID set:', this.state.userId)
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    this.state.userContext.properties = {
      ...this.state.userContext.properties,
      ...this.sanitizeProperties(properties),
    }

    if (this.config.debug) {
      console.log('User properties updated:', this.state.userContext.properties)
    }
  }

  /**
   * Reset user (for logout)
   */
  reset(): void {
    delete this.state.userId
    this.state.sessionId = this.generateSessionId()
    this.state.userContext = this.createUserContext()

    if (this.config.debug) {
      console.log('Analytics reset')
    }
  }

  /**
   * Flush events to destinations
   */
  async flush(): Promise<void> {
    if (this.state.eventBuffer.length === 0) {
      return
    }

    const events = [...this.state.eventBuffer]
    this.state.eventBuffer = []
    this.state.lastFlush = Date.now()

    if (this.config.debug) {
      console.log(`Flushing ${events.length} events`)
    }

    // Send to each destination
    for (const destination of this.config.destinations) {
      if (destination.enabled) {
        try {
          await this.sendToDestination(destination, events)
        } catch (error) {
          if (this.config.debug) {
            console.error(`Failed to send to ${destination.name}:`, error)
          }
          // Re-queue events for retry
          this.state.eventBuffer.unshift(...events)
        }
      }
    }
  }

  /**
   * Get analytics state
   */
  getState(): AnalyticsState {
    return { ...this.state }
  }

  /**
   * Get user context
   */
  getUserContext(): UserContext {
    return { ...this.state.userContext }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config }

    if (!this.config.enabled) {
      this.disable()
    } else if (!this.state.initialized) {
      this.initialize()
    }
  }

  /**
   * Enable analytics
   */
  enable(): void {
    this.config.enabled = true
    this.state.enabled = true

    if (!this.state.initialized) {
      this.initialize()
    }
  }

  /**
   * Disable analytics
   */
  disable(): void {
    this.config.enabled = false
    this.state.enabled = false

    // Flush remaining events
    this.flush()

    // Clear timers
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
  }

  /**
   * Check if tracking is allowed
   */
  private canTrack(): boolean {
    return (
      this.state.enabled &&
      this.state.initialized &&
      this.state.consentGiven &&
      !this.isDoNotTrackEnabled()
    )
  }

  /**
   * Check user consent
   */
  private checkConsent(): boolean {
    if (!this.config.privacy.cookieConsent) {
      return true
    }

    if (this.config.privacy.consentManager?.checkFunction) {
      return this.config.privacy.consentManager.checkFunction()
    }

    // Default consent check (looking for consent cookie)
    if (typeof document !== 'undefined') {
      return document.cookie.includes('analytics_consent=true')
    }

    return false
  }

  /**
   * Check Do Not Track setting
   */
  private isDoNotTrackEnabled(): boolean {
    if (typeof navigator !== 'undefined') {
      return (
        navigator.doNotTrack === '1' ||
        (navigator as any).msDoNotTrack === '1' ||
        (window as any).doNotTrack === '1'
      )
    }
    return false
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Create user context
   */
  private createUserContext(): UserContext {
    return {
      sessionId: this.state?.sessionId || this.generateSessionId(),
      isAnonymous: true,
      device: this.gatherDeviceInfo(),
      preferences: {
        analytics: this.state?.consentGiven || false,
        marketing: false,
        personalization: false,
      },
    }
  }

  /**
   * Gather device information
   */
  private gatherDeviceInfo() {
    if (typeof navigator === 'undefined') {
      return {
        type: 'unknown' as const,
        os: 'unknown',
        browser: 'unknown',
      }
    }

    const baseInfo = {
      type: this.getDeviceType(),
      os: this.getOS(),
      browser: this.getBrowser(),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    // Add screen resolution if available
    if (typeof screen !== 'undefined') {
      return {
        ...baseInfo,
        screenResolution: `${screen.width}x${screen.height}`,
      }
    }

    return baseInfo
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
    if (typeof navigator === 'undefined') return 'unknown'

    const userAgent = navigator.userAgent.toLowerCase()

    if (/tablet|ipad/.test(userAgent)) return 'tablet'
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile'
    return 'desktop'
  }

  /**
   * Get operating system
   */
  private getOS(): string {
    if (typeof navigator === 'undefined') return 'unknown'

    const userAgent = navigator.userAgent

    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'

    return 'unknown'
  }

  /**
   * Get browser name
   */
  private getBrowser(): string {
    if (typeof navigator === 'undefined') return 'unknown'

    const userAgent = navigator.userAgent

    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'

    return 'unknown'
  }

  /**
   * Gather metadata for events
   */
  private gatherMetadata() {
    const metadata: any = {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    if (typeof window !== 'undefined') {
      metadata.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      metadata.location = {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      }
    }

    return metadata
  }

  /**
   * Sanitize properties to remove sensitive data
   */
  private sanitizeProperties(
    properties: Record<string, any>
  ): Record<string, any> {
    const sanitized = { ...properties }
    const excludeFields = this.config.privacy.excludeFields || []

    excludeFields.forEach(field => {
      delete sanitized[field]
    })

    // Remove common sensitive fields
    const sensitiveFields = [
      'password',
      'credit_card',
      'ssn',
      'token',
      'api_key',
    ]
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field]
      }
    })

    return sanitized
  }

  /**
   * Hash user ID for privacy
   */
  private hashUserId(userId: string): string {
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `user_${Math.abs(hash).toString(36)}`
  }

  /**
   * Check if event should be sampled
   */
  private shouldSampleEvent(event: AnalyticsEvent): boolean {
    if (!this.config.sampling.enabled) {
      return true
    }

    // Check custom sampling rules
    if (this.config.sampling.rules) {
      for (const rule of this.config.sampling.rules) {
        if (rule.condition(event)) {
          return Math.random() < rule.rate
        }
      }
    }

    // Default sampling rate
    return Math.random() < this.config.sampling.rate
  }

  /**
   * Check if we should flush events
   */
  private shouldFlush(): boolean {
    return (
      this.state.eventBuffer.length >= this.config.bufferSize ||
      Date.now() - this.state.lastFlush > this.config.flushInterval
    )
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.state.eventBuffer.length > 0) {
        this.flush()
      }
    }, this.config.flushInterval)
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return
    }

    try {
      // Observe navigation timing
      this.observeNavigationTiming()

      // Observe resource timing
      this.observeResourceTiming()

      // Observe paint timing
      this.observePaintTiming()
    } catch (error) {
      if (this.config.debug) {
        console.warn('Performance monitoring setup failed:', error)
      }
    }
  }

  /**
   * Observe navigation timing
   */
  private observeNavigationTiming(): void {
    if (
      typeof window !== 'undefined' &&
      window.performance &&
      window.performance.timing
    ) {
      const timing = window.performance.timing
      const navigationStart = timing.navigationStart

      setTimeout(() => {
        this.performance(
          {
            domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
            loadComplete: timing.loadEventEnd - navigationStart,
          },
          'navigation'
        )
      }, 0)
    }
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming(): void {
    if (typeof window !== 'undefined' && window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries()
          const resourceCount = entries.length
          const totalSize = entries.reduce(
            (sum, entry) => sum + (entry as any).encodedBodySize || 0,
            0
          )
          const avgDuration =
            entries.reduce((sum, entry) => sum + entry.duration, 0) /
            entries.length

          if (resourceCount > 0) {
            this.performance(
              {
                resourceCount,
                totalSize,
                avgDuration,
              },
              'resource'
            )
          }
        })

        observer.observe({ entryTypes: ['resource'] })
      } catch (error) {
        // Ignore if PerformanceObserver is not supported
      }
    }
  }

  /**
   * Observe paint timing
   */
  private observePaintTiming(): void {
    if (typeof window !== 'undefined' && window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries()
          const paintMetrics: Record<string, number> = {}

          entries.forEach(entry => {
            if (entry.name === 'first-paint') {
              paintMetrics.firstPaint = entry.startTime
            } else if (entry.name === 'first-contentful-paint') {
              paintMetrics.firstContentfulPaint = entry.startTime
            }
          })

          if (Object.keys(paintMetrics).length > 0) {
            this.performance(paintMetrics, 'paint')
          }
        })

        observer.observe({ entryTypes: ['paint'] })
      } catch (error) {
        // Ignore if paint timing is not supported
      }
    }
  }

  /**
   * Setup network listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.state.isOnline = true
        // Flush buffered events when coming back online
        if (this.state.eventBuffer.length > 0) {
          this.flush()
        }
      })

      window.addEventListener('offline', () => {
        this.state.isOnline = false
      })
    }
  }

  /**
   * Setup visibility listeners
   */
  private setupVisibilityListeners(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // Flush events before page becomes hidden
          this.flush()
        }
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // Final flush before page unload
        this.flush()
      })
    }
  }

  /**
   * Send events to destination
   */
  private async sendToDestination(
    destination: any,
    events: AnalyticsEvent[]
  ): Promise<void> {
    if (!destination.endpoint) {
      return
    }

    const payload = destination.transform
      ? events.map(destination.transform)
      : events

    const response = await fetch(destination.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...destination.headers,
        ...(destination.apiKey
          ? { Authorization: `Bearer ${destination.apiKey}` }
          : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }
}

// Create and export default instance
export const analytics = new AnalyticsManager()

// Export factory function
export const createAnalytics = (config?: Partial<AnalyticsConfig>) => {
  return new AnalyticsManager(config)
}

// Export types
export * from './types'
