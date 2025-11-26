/**
 * Logger System Core Implementation
 *
 * Comprehensive logging system with multiple transports, structured logging,
 * performance monitoring, and remote logging capabilities.
 */

import {
  LogLevel,
  LogCategory,
  LogEntry,
  LogContext,
  LoggerConfig,
  LogTransport,
  LogFilter,
  LogFormatter,
  LoggerEvent,
  LoggerEventType,
  LoggerStats,
  LogSearchOptions,
  LogExportOptions,
  PerformanceMetrics,
  LogLevelUtils,
  DEFAULT_LOGGER_CONFIG,
  LOG_LEVEL_BY_ENVIRONMENT,
  isValidLogLevel,
  isLogEntry,
} from './types'

/**
 * Logger Core Class
 */
export class Logger {
  private config: LoggerConfig
  private transports: Map<string, LogTransport> = new Map()
  private buffer: LogEntry[] = []
  private filters: LogFilter[] = []
  private eventListeners: Map<
    LoggerEventType,
    ((event: LoggerEvent) => void)[]
  > = new Map()
  private stats: LoggerStats
  private flushTimer?: NodeJS.Timeout
  private performanceObserver?: PerformanceObserver
  private startTime: number

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config }
    this.startTime = Date.now()
    this.stats = this.initializeStats()

    // Set environment-based log level if not explicitly set
    if (!config.level && this.config.environment) {
      this.config.level =
        LOG_LEVEL_BY_ENVIRONMENT[this.config.environment] || LogLevel.INFO
    }

    this.setupAutoFlush()
    this.setupPerformanceMonitoring()
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): LoggerStats {
    return {
      totalLogs: 0,
      logsByLevel: Object.values(LogLevel).reduce(
        (acc, level) => {
          if (typeof level === 'number') acc[level] = 0
          return acc
        },
        {} as Record<LogLevel, number>
      ),
      logsByCategory: Object.values(LogCategory).reduce(
        (acc, category) => {
          acc[category] = 0
          return acc
        },
        {} as Record<LogCategory, number>
      ),
      errors: 0,
      warnings: 0,
      remoteLogsSent: 0,
      remoteLogsFailed: 0,
      bufferSize: 0,
      lastFlush: new Date().toISOString(),
      uptime: 0,
    }
  }

  /**
   * Setup automatic buffer flushing
   */
  private setupAutoFlush(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush()
      }, this.config.flushInterval)
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (
      this.config.enablePerformanceLogging &&
      typeof window !== 'undefined' &&
      'PerformanceObserver' in window
    ) {
      try {
        this.performanceObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.logPerformanceEntry(entry)
          }
        })

        this.performanceObserver.observe({
          entryTypes: ['navigation', 'measure', 'paint'],
        })
      } catch (error) {
        console.warn('Failed to setup performance monitoring:', error)
      }
    }
  }

  /**
   * Log performance entry
   */
  private logPerformanceEntry(entry: PerformanceEntry): void {
    const context: LogContext = {
      component: 'performance',
      metadata: {
        name: entry.name,
        entryType: entry.entryType,
        startTime: entry.startTime,
        duration: entry.duration,
      },
    }

    this.log(
      LogLevel.DEBUG,
      LogCategory.PERFORMANCE,
      `Performance: ${entry.name}`,
      context
    )
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current source location (if possible)
   */
  private getSourceLocation(): {
    file?: string
    function?: string
    line?: number
    column?: number
  } {
    if (!this.config.enableSourceMap) return {}

    try {
      const stack = new Error().stack
      if (!stack) return {}

      const lines = stack.split('\n')
      // Skip the first few lines (Error constructor, this function, log function)
      const relevantLine = lines[4] || lines[3] || lines[2]

      if (relevantLine) {
        const match =
          relevantLine.match(/\s+at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/) ||
          relevantLine.match(/\s+at\s+(.+):(\d+):(\d+)/)

        if (match) {
          const result: {
            file?: string
            function?: string
            line?: number
            column?: number
          } = {}

          if (match[1]) result.function = match[1]
          const file = match[2] || match[1]
          if (file) result.file = file

          const lineStr = match[3] || match[2]
          if (lineStr) result.line = parseInt(lineStr, 10)

          const colStr = match[4] || match[3]
          if (colStr) result.column = parseInt(colStr, 10)

          return result
        }
      }
    } catch (error) {
      // Ignore source mapping errors
    }

    return {}
  }

  /**
   * Mask sensitive data in objects
   */
  private maskSensitiveData(data: any): any {
    if (!this.config.maskSensitiveData) return data

    if (typeof data !== 'object' || data === null) return data

    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item))
    }

    const masked = { ...data }
    for (const key in masked) {
      if (
        this.config.sensitiveFields.some(field =>
          key.toLowerCase().includes(field.toLowerCase())
        )
      ) {
        masked[key] = '***MASKED***'
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key])
      }
    }

    return masked
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context: LogContext = {},
    error?: Error
  ): LogEntry {
    const now = new Date()
    const maskedContext = this.maskSensitiveData(context)

    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: now.toISOString(),
      level,
      category,
      message,
      context: {
        timestamp: now.toISOString(),
        environment: this.config.environment,
        ...maskedContext,
      },
      source: this.getSourceLocation(),
    }

    if (error && this.config.enableStackTrace) {
      entry.error = {
        name: error.name,
        message: error.message,
      }

      if (error.stack) entry.error.stack = error.stack
      if ((error as any).code) entry.error.code = (error as any).code
      if ((error as any).cause) entry.error.cause = (error as any).cause
    }

    return entry
  }

  /**
   * Apply filters to log entry
   */
  private applyFilters(entry: LogEntry): boolean {
    // Check log level
    if (!LogLevelUtils.shouldLog(entry.level, this.config.level)) {
      return false
    }

    // Check categories
    if (!this.config.categories.includes(entry.category)) {
      return false
    }

    // Apply custom filters
    return this.filters.every(filter => {
      try {
        return filter(entry)
      } catch (error) {
        console.error('Filter error:', error)
        return true // Don't filter if filter fails
      }
    })
  }

  /**
   * Process log entry through transports
   */
  private async processLogEntry(entry: LogEntry): Promise<void> {
    // Update statistics
    this.updateStats(entry)

    // Add to buffer
    this.buffer.push(entry)

    // Check buffer size
    if (this.buffer.length >= this.config.bufferSize) {
      await this.flush()
    }

    // Send to transports immediately if critical
    if (entry.level <= LogLevel.CRITICAL) {
      await this.sendToTransports([entry])
    }
  }

  /**
   * Update statistics
   */
  private updateStats(entry: LogEntry): void {
    this.stats.totalLogs++
    this.stats.logsByLevel[entry.level]++
    this.stats.logsByCategory[entry.category]++
    this.stats.bufferSize = this.buffer.length
    this.stats.uptime = Date.now() - this.startTime

    if (entry.level <= LogLevel.ERROR) {
      this.stats.errors++
    } else if (entry.level === LogLevel.WARNING) {
      this.stats.warnings++
    }
  }

  /**
   * Send entries to transports
   */
  private async sendToTransports(entries: LogEntry[]): Promise<void> {
    const promises = Array.from(this.transports.values()).map(
      async transport => {
        if (!transport.enabled) return

        try {
          for (const entry of entries) {
            if (LogLevelUtils.shouldLog(entry.level, transport.level)) {
              await transport.log(entry)
            }
          }
        } catch (error) {
          this.emitEvent('transport_error', {
            transport: transport.name,
            error,
          })
          console.error(`Transport ${transport.name} error:`, error)
        }
      }
    )

    await Promise.allSettled(promises)
  }

  /**
   * Emit logger event
   */
  private emitEvent(type: LoggerEventType, data?: any): void {
    const event: LoggerEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
    }

    const listeners = this.eventListeners.get(type) || []
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Event listener error:', error)
      }
    })
  }

  /**
   * Main logging method
   */
  async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context: LogContext = {},
    error?: Error
  ): Promise<void> {
    try {
      const entry = this.createLogEntry(
        level,
        category,
        message,
        context,
        error
      )

      if (!this.applyFilters(entry)) {
        this.emitEvent('log_filtered', { entry })
        return
      }

      await this.processLogEntry(entry)
      this.emitEvent('log_created', { entry })
    } catch (logError) {
      console.error('Logging error:', logError)
    }
  }

  /**
   * Convenience methods for different log levels
   */
  async emergency(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.EMERGENCY, category, message, context, error)
  }

  async alert(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.ALERT, category, message, context, error)
  }

  async critical(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.CRITICAL, category, message, context, error)
  }

  async error(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.ERROR, category, message, context, error)
  }

  async warn(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.WARNING, category, message, context, error)
  }

  async notice(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.NOTICE, category, message, context, error)
  }

  async info(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.INFO, category, message, context, error)
  }

  async debug(
    category: LogCategory,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    return this.log(LogLevel.DEBUG, category, message, context, error)
  }

  /**
   * Add transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.set(transport.name, transport)
  }

  /**
   * Remove transport
   */
  removeTransport(name: string): void {
    const transport = this.transports.get(name)
    if (transport && transport.close) {
      transport.close()
    }
    this.transports.delete(name)
  }

  /**
   * Add filter
   */
  addFilter(filter: LogFilter): void {
    this.filters.push(filter)
  }

  /**
   * Remove all filters
   */
  clearFilters(): void {
    this.filters = []
  }

  /**
   * Add event listener
   */
  addEventListener(
    type: LoggerEventType,
    listener: (event: LoggerEvent) => void
  ): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, [])
    }

    this.eventListeners.get(type)!.push(listener)

    return () => {
      const listeners = this.eventListeners.get(type)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  /**
   * Flush buffer to transports
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    this.emitEvent('flush_started', { bufferSize: this.buffer.length })

    const entries = [...this.buffer]
    this.buffer = []
    this.stats.bufferSize = 0
    this.stats.lastFlush = new Date().toISOString()

    await this.sendToTransports(entries)

    this.emitEvent('flush_completed', { entriesCount: entries.length })
  }

  /**
   * Get logger statistics
   */
  getStats(): LoggerStats {
    return { ...this.stats, uptime: Date.now() - this.startTime }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }

    // Restart auto-flush if interval changed
    if (config.flushInterval !== undefined) {
      if (this.flushTimer) {
        clearInterval(this.flushTimer)
      }
      this.setupAutoFlush()
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config }
  }

  /**
   * Performance timing utility
   */
  time(
    label: string,
    category: LogCategory = LogCategory.PERFORMANCE
  ): () => void {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize

    return () => {
      const endTime = performance.now()
      const endMemory = (performance as any).memory?.usedJSHeapSize
      const duration = endTime - startTime

      const context: LogContext = {
        component: 'timer',
        metadata: {
          label,
          duration,
          startTime,
          endTime,
          memoryDelta:
            endMemory && startMemory ? endMemory - startMemory : undefined,
        },
      }

      this.debug(
        category,
        `Timer: ${label} completed in ${duration.toFixed(2)}ms`,
        context
      )
    }
  }

  /**
   * Measure async function execution
   */
  async measure<T>(
    label: string,
    fn: () => Promise<T>,
    category: LogCategory = LogCategory.PERFORMANCE
  ): Promise<T> {
    const stopTimer = this.time(label, category)
    try {
      const result = await fn()
      stopTimer()
      return result
    } catch (error) {
      stopTimer()
      this.error(
        category,
        `Measured function ${label} failed`,
        { metadata: { label } },
        error as Error
      )
      throw error
    }
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    const childLogger = new Logger(this.config)

    // Copy transports
    this.transports.forEach((transport, name) => {
      childLogger.addTransport(transport)
    })

    // Copy filters
    this.filters.forEach(filter => {
      childLogger.addFilter(filter)
    })

    // Override log method to include additional context
    const originalLog = childLogger.log.bind(childLogger)
    childLogger.log = (level, category, message, context = {}, error) => {
      const mergedContext = { ...additionalContext, ...context }
      return originalLog(level, category, message, mergedContext, error)
    }

    return childLogger
  }

  /**
   * Destroy logger and clean up resources
   */
  async destroy(): Promise<void> {
    // Clear timers
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    // Disconnect performance observer
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }

    // Flush remaining logs
    await this.flush()

    // Close all transports
    const closePromises = Array.from(this.transports.values())
      .filter(transport => transport.close)
      .map(transport => transport.close!())

    await Promise.allSettled(closePromises)

    // Clear collections
    this.transports.clear()
    this.filters = []
    this.eventListeners.clear()
    this.buffer = []
  }
}

/**
 * Default logger instance
 */
export const defaultLogger = new Logger()

export default defaultLogger
