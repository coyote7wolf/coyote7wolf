/**
 * Logger System Main Entry Point
 *
 * Comprehensive logging system with multiple transports, structured logging,
 * performance monitoring, and environment-specific configurations.
 */

// Export core logger
export { Logger, defaultLogger } from './core'

// Export types and interfaces
export type {
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
  LogAggregation,
  RemoteLoggingConfig,
  LogLevelName,
  LogCategoryName,
} from './types'

// Export enums
export { LogLevel, LogCategory } from './types'

// Export utilities
export {
  LogLevelUtils,
  DEFAULT_LOGGER_CONFIG,
  LOG_LEVEL_BY_ENVIRONMENT,
  isValidLogLevel,
  isValidLogCategory,
  isLogEntry,
} from './types'

// Export transports
export {
  ConsoleTransport,
  LocalStorageTransport,
  RemoteTransport,
  MemoryTransport,
  FileTransport,
  TransportFactory,
  defaultFormatter,
} from './transports'

// Import dependencies
import { Logger, defaultLogger } from './core'
import {
  LogLevel,
  LogCategory,
  LoggerConfig,
  DEFAULT_LOGGER_CONFIG,
} from './types'
import { TransportFactory } from './transports'

/**
 * Create logger with environment-specific configuration
 */
export const createLogger = (
  config: Partial<LoggerConfig> = {},
  environment: 'development' | 'staging' | 'production' | 'test' = 'development'
): Logger => {
  const logger = new Logger({
    ...DEFAULT_LOGGER_CONFIG,
    environment,
    ...config,
  })

  // Add default transports for the environment
  const defaultTransports = TransportFactory.createDefault(environment)
  defaultTransports.forEach(transport => {
    logger.addTransport(transport)
  })

  return logger
}

/**
 * Create logger for specific component with additional context
 */
export const createComponentLogger = (
  component: string,
  config: Partial<LoggerConfig> = {},
  environment: 'development' | 'staging' | 'production' | 'test' = 'development'
): Logger => {
  const baseLogger = createLogger(config, environment)
  return baseLogger.child({ component })
}

/**
 * Logger Factory for different use cases
 */
export class LoggerFactory {
  /**
   * Create logger for API operations
   */
  static createApiLogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('api', config).child({
      feature: 'api-operations',
    })
  }

  /**
   * Create logger for authentication operations
   */
  static createAuthLogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('auth', config).child({
      feature: 'authentication',
    })
  }

  /**
   * Create logger for UI operations
   */
  static createUILogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('ui', config).child({
      feature: 'user-interface',
    })
  }

  /**
   * Create logger for performance monitoring
   */
  static createPerformanceLogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('performance', {
      enablePerformanceLogging: true,
      ...config,
    }).child({
      feature: 'performance-monitoring',
    })
  }

  /**
   * Create logger for security operations
   */
  static createSecurityLogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('security', {
      enableStackTrace: true,
      maskSensitiveData: true,
      ...config,
    }).child({
      feature: 'security-monitoring',
    })
  }

  /**
   * Create logger for business logic
   */
  static createBusinessLogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('business', config).child({
      feature: 'business-logic',
    })
  }

  /**
   * Create logger for external integrations
   */
  static createExternalLogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('external', config).child({
      feature: 'external-integrations',
    })
  }

  /**
   * Create logger for testing
   */
  static createTestLogger(config?: Partial<LoggerConfig>): Logger {
    return createComponentLogger('testing', config, 'test').child({
      feature: 'automated-testing',
    })
  }
}

/**
 * Global Logger Utilities
 */
export class LoggerUtils {
  /**
   * Set up global error handling with logging
   */
  static setupGlobalErrorHandling(logger: Logger): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', event => {
        logger.error(
          LogCategory.SYSTEM,
          'Unhandled promise rejection',
          {
            component: 'global-error-handler',
            metadata: {
              reason: event.reason,
              promise: event.promise.toString(),
            },
          },
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason))
        )
      })

      // Handle uncaught errors
      window.addEventListener('error', event => {
        logger.error(
          LogCategory.SYSTEM,
          'Uncaught error',
          {
            component: 'global-error-handler',
            metadata: {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
            },
          },
          event.error
        )
      })
    }

    // Node.js error handling
    if (typeof process !== 'undefined') {
      process.on('unhandledRejection', (reason, promise) => {
        logger.error(
          LogCategory.SYSTEM,
          'Unhandled promise rejection',
          {
            component: 'global-error-handler',
            metadata: {
              reason: String(reason),
              promise: promise.toString(),
            },
          },
          reason instanceof Error ? reason : new Error(String(reason))
        )
      })

      process.on('uncaughtException', error => {
        logger.critical(
          LogCategory.SYSTEM,
          'Uncaught exception',
          {
            component: 'global-error-handler',
          },
          error
        )
      })
    }
  }

  /**
   * Create request/response logging middleware
   */
  static createRequestLogger(logger: Logger) {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now()
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Log request
      logger.info(LogCategory.API, 'HTTP Request', {
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        metadata: {
          headers: req.headers,
          query: req.query,
          body: req.body,
        },
      })

      // Override res.end to log response
      const originalEnd = res.end
      res.end = function (chunk: any, encoding: any) {
        const duration = Date.now() - startTime
        const statusCode = res.statusCode

        logger.info(LogCategory.API, 'HTTP Response', {
          requestId,
          method: req.method,
          url: req.url,
          duration,
          metadata: {
            statusCode,
            contentLength: res.get('Content-Length'),
            responseTime: `${duration}ms`,
          },
        })

        originalEnd.call(this, chunk, encoding)
      }

      next()
    }
  }

  /**
   * Create performance monitoring decorator
   */
  static performanceMonitor(
    logger: Logger,
    category: LogCategory = LogCategory.PERFORMANCE
  ) {
    return function (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor
    ) {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const stopTimer = logger.time(
          `${target.constructor.name}.${propertyName}`,
          category
        )

        try {
          const result = await method.apply(this, args)
          stopTimer()
          return result
        } catch (error) {
          stopTimer()
          logger.error(
            category,
            `Method ${target.constructor.name}.${propertyName} failed`,
            {
              component: target.constructor.name,
              metadata: {
                method: propertyName,
                args: args.length,
              },
            },
            error as Error
          )
          throw error
        }
      }

      return descriptor
    }
  }

  /**
   * Create audit logging utility
   */
  static createAuditLogger(logger: Logger) {
    return {
      logUserAction: (
        userId: string,
        action: string,
        resource: string,
        metadata?: Record<string, any>
      ) => {
        logger.info(LogCategory.BUSINESS, `User action: ${action}`, {
          userId,
          component: 'audit',
          metadata: {
            action,
            resource,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        })
      },

      logSystemEvent: (
        event: string,
        component: string,
        metadata?: Record<string, any>
      ) => {
        logger.info(LogCategory.SYSTEM, `System event: ${event}`, {
          component,
          metadata: {
            event,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        })
      },

      logSecurityEvent: (
        event: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        metadata?: Record<string, any>
      ) => {
        const level =
          severity === 'critical'
            ? LogLevel.CRITICAL
            : severity === 'high'
              ? LogLevel.ERROR
              : severity === 'medium'
                ? LogLevel.WARNING
                : LogLevel.INFO

        logger.log(level, LogCategory.SECURITY, `Security event: ${event}`, {
          component: 'security-audit',
          metadata: {
            event,
            severity,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        })
      },
    }
  }
}

/**
 * Initialize logging system with environment detection
 */
export const initializeLogging = (config: Partial<LoggerConfig> = {}) => {
  const environment = (process.env.NODE_ENV as any) || 'development'
  const logger = createLogger(config, environment)

  // Setup global error handling
  LoggerUtils.setupGlobalErrorHandling(logger)

  return {
    logger,
    apiLogger: LoggerFactory.createApiLogger(config),
    authLogger: LoggerFactory.createAuthLogger(config),
    uiLogger: LoggerFactory.createUILogger(config),
    performanceLogger: LoggerFactory.createPerformanceLogger(config),
    securityLogger: LoggerFactory.createSecurityLogger(config),
    businessLogger: LoggerFactory.createBusinessLogger(config),
    externalLogger: LoggerFactory.createExternalLogger(config),
    auditLogger: LoggerUtils.createAuditLogger(logger),
  }
}

/**
 * Default export with main logger instance
 */
export default {
  // Core components
  Logger,
  defaultLogger,

  // Factories
  createLogger,
  createComponentLogger,
  LoggerFactory,

  // Utilities
  LoggerUtils,
  TransportFactory,

  // Types and enums
  LogLevel,
  LogCategory,

  // Initialization
  initializeLogging,
}
