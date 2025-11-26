/**
 * Logger Transports
 *
 * Different transport implementations for logging output including
 * console, storage, remote, and file transports.
 */

import {
  LogEntry,
  LogTransport,
  LogLevel,
  LogFormatter,
  RemoteLoggingConfig,
  LogLevelUtils,
} from './types'

/**
 * Default Log Formatter
 */
export const defaultFormatter: LogFormatter = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString()
  const level = LogLevelUtils.getName(entry.level).padEnd(9)
  const category = entry.category.toUpperCase().padEnd(12)
  const emoji = LogLevelUtils.getEmoji(entry.level)

  let message = `${emoji} ${timestamp} [${level}] [${category}] ${entry.message}`

  if (entry.context.component) {
    message += ` (${entry.context.component})`
  }

  if (entry.error) {
    message += `\n  Error: ${entry.error.name}: ${entry.error.message}`
    if (entry.error.stack) {
      message += `\n  Stack: ${entry.error.stack}`
    }
  }

  if (
    entry.context.metadata &&
    Object.keys(entry.context.metadata).length > 0
  ) {
    message += `\n  Metadata: ${JSON.stringify(entry.context.metadata, null, 2)}`
  }

  return message
}

/**
 * Console Transport
 */
export class ConsoleTransport implements LogTransport {
  name = 'console'
  level: LogLevel
  enabled: boolean
  private formatter: LogFormatter

  constructor(
    level: LogLevel = LogLevel.DEBUG,
    enabled: boolean = true,
    formatter: LogFormatter = defaultFormatter
  ) {
    this.level = level
    this.enabled = enabled
    this.formatter = formatter
  }

  log(entry: LogEntry): void {
    if (!LogLevelUtils.shouldLog(entry.level, this.level)) return

    const message = this.formatter(entry)
    const color = LogLevelUtils.getColor(entry.level)

    // Use appropriate console method based on log level
    switch (entry.level) {
      case LogLevel.EMERGENCY:
      case LogLevel.ALERT:
      case LogLevel.CRITICAL:
      case LogLevel.ERROR:
        console.error(`%c${message}`, `color: ${color}`)
        break
      case LogLevel.WARNING:
        console.warn(`%c${message}`, `color: ${color}`)
        break
      case LogLevel.INFO:
      case LogLevel.NOTICE:
        console.info(`%c${message}`, `color: ${color}`)
        break
      case LogLevel.DEBUG:
        console.debug(`%c${message}`, `color: ${color}`)
        break
      default:
        console.log(`%c${message}`, `color: ${color}`)
    }

    // Log additional data as separate console entries for better inspection
    if (
      entry.context.metadata &&
      Object.keys(entry.context.metadata).length > 0
    ) {
      console.groupCollapsed('Metadata')
      console.table(entry.context.metadata)
      console.groupEnd()
    }

    if (entry.error && entry.error.stack) {
      console.groupCollapsed('Stack Trace')
      console.error(entry.error.stack)
      console.groupEnd()
    }
  }
}

/**
 * Local Storage Transport
 */
export class LocalStorageTransport implements LogTransport {
  name = 'localStorage'
  level: LogLevel
  enabled: boolean
  private storageKey: string
  private maxEntries: number

  constructor(
    level: LogLevel = LogLevel.INFO,
    enabled: boolean = true,
    storageKey: string = 'app_logs',
    maxEntries: number = 1000
  ) {
    this.level = level
    this.enabled = enabled
    this.storageKey = storageKey
    this.maxEntries = maxEntries
  }

  log(entry: LogEntry): void {
    if (!LogLevelUtils.shouldLog(entry.level, this.level)) return

    try {
      const existingLogs = this.getLogs()
      const newLogs = [...existingLogs, entry]

      // Keep only the most recent entries
      if (newLogs.length > this.maxEntries) {
        newLogs.splice(0, newLogs.length - this.maxEntries)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(newLogs))
    } catch (error) {
      console.error('Failed to save log to localStorage:', error)
    }
  }

  getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.storageKey)
      return logs ? JSON.parse(logs) : []
    } catch (error) {
      console.error('Failed to read logs from localStorage:', error)
      return []
    }
  }

  clearLogs(): void {
    localStorage.removeItem(this.storageKey)
  }

  flush(): void {
    // No buffering in localStorage transport
  }

  close(): void {
    // Nothing to close for localStorage
  }
}

/**
 * Remote Transport (for sending logs to external service)
 */
export class RemoteTransport implements LogTransport {
  name = 'remote'
  level: LogLevel
  enabled: boolean
  private config: RemoteLoggingConfig
  private buffer: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(
    config: RemoteLoggingConfig,
    level: LogLevel = LogLevel.WARNING,
    enabled: boolean = true
  ) {
    this.level = level
    this.enabled = enabled
    const defaultConfig = {
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      batchSize: 10,
      enableCompression: false,
      enableEncryption: false,
    }

    this.config = { ...defaultConfig, ...config }

    this.setupAutoFlush()
  }

  private setupAutoFlush(): void {
    // Auto-flush every 30 seconds
    this.flushTimer = setInterval(() => {
      this.flush()
    }, 30000)
  }

  log(entry: LogEntry): void {
    if (!LogLevelUtils.shouldLog(entry.level, this.level)) return

    this.buffer.push(entry)

    // Immediate flush for critical errors
    if (entry.level <= LogLevel.CRITICAL) {
      this.flush()
    } else if (this.buffer.length >= this.config.batchSize) {
      this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const entries = [...this.buffer]
    this.buffer = []

    await this.sendLogs(entries)
  }

  private async sendLogs(entries: LogEntry[]): Promise<void> {
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await this.makeRequest(entries)

        if (response.ok) {
          return // Success
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error(`Remote logging attempt ${attempt + 1} failed:`, error)

        if (attempt < this.config.retryAttempts - 1) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt))
        }
      }
    }

    // All attempts failed, store in localStorage as fallback
    this.fallbackToLocalStorage(entries)
  }

  private async makeRequest(entries: LogEntry[]): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    const body = JSON.stringify({
      logs: entries,
      timestamp: new Date().toISOString(),
      source: 'web-app',
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private fallbackToLocalStorage(entries: LogEntry[]): void {
    try {
      const fallbackKey = `${this.name}_fallback_logs`
      const existing = JSON.parse(localStorage.getItem(fallbackKey) || '[]')
      const combined = [...existing, ...entries]

      // Keep only last 100 entries to prevent storage overflow
      if (combined.length > 100) {
        combined.splice(0, combined.length - 100)
      }

      localStorage.setItem(fallbackKey, JSON.stringify(combined))
    } catch (error) {
      console.error('Failed to save logs to fallback storage:', error)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  close(): Promise<void> {
    return new Promise(resolve => {
      if (this.flushTimer) {
        clearInterval(this.flushTimer)
      }

      this.flush().finally(() => resolve())
    })
  }
}

/**
 * Memory Transport (for testing and debugging)
 */
export class MemoryTransport implements LogTransport {
  name = 'memory'
  level: LogLevel
  enabled: boolean
  private logs: LogEntry[] = []
  private maxEntries: number

  constructor(
    level: LogLevel = LogLevel.DEBUG,
    enabled: boolean = true,
    maxEntries: number = 1000
  ) {
    this.level = level
    this.enabled = enabled
    this.maxEntries = maxEntries
  }

  log(entry: LogEntry): void {
    if (!LogLevelUtils.shouldLog(entry.level, this.level)) return

    this.logs.push(entry)

    // Keep only the most recent entries
    if (this.logs.length > this.maxEntries) {
      this.logs.shift()
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase()
    return this.logs.filter(
      entry =>
        entry.message.toLowerCase().includes(lowerQuery) ||
        entry.category.toLowerCase().includes(lowerQuery) ||
        (entry.context.component &&
          entry.context.component.toLowerCase().includes(lowerQuery))
    )
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(entry => entry.level === level)
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(entry => entry.category === category)
  }

  getLogsByTimeRange(startTime: string, endTime: string): LogEntry[] {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()

    return this.logs.filter(entry => {
      const entryTime = new Date(entry.timestamp).getTime()
      return entryTime >= start && entryTime <= end
    })
  }

  flush(): void {
    // No buffering in memory transport
  }

  close(): void {
    this.clearLogs()
  }
}

/**
 * File Transport (Node.js environment only)
 */
export class FileTransport implements LogTransport {
  name = 'file'
  level: LogLevel
  enabled: boolean
  private filePath: string
  private formatter: LogFormatter
  private writeStream?: any

  constructor(
    filePath: string,
    level: LogLevel = LogLevel.INFO,
    enabled: boolean = true,
    formatter: LogFormatter = defaultFormatter
  ) {
    this.filePath = filePath
    this.level = level
    this.enabled = enabled
    this.formatter = formatter

    this.initializeWriteStream()
  }

  private initializeWriteStream(): void {
    if (typeof window === 'undefined' && typeof require !== 'undefined') {
      try {
        const fs = require('fs')
        const path = require('path')

        // Ensure directory exists
        const dir = path.dirname(this.filePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' })
      } catch (error) {
        console.error('Failed to initialize file transport:', error)
        this.enabled = false
      }
    } else {
      console.warn('File transport is only available in Node.js environment')
      this.enabled = false
    }
  }

  log(entry: LogEntry): void {
    if (
      !this.enabled ||
      !this.writeStream ||
      !LogLevelUtils.shouldLog(entry.level, this.level)
    ) {
      return
    }

    const message = this.formatter(entry)
    this.writeStream.write(message + '\n')
  }

  flush(): Promise<void> {
    return new Promise(resolve => {
      if (this.writeStream) {
        this.writeStream.once('drain', resolve)
        this.writeStream.uncork()
      } else {
        resolve()
      }
    })
  }

  close(): Promise<void> {
    return new Promise(resolve => {
      if (this.writeStream) {
        this.writeStream.end(() => resolve())
      } else {
        resolve()
      }
    })
  }
}

/**
 * Transport Factory
 */
export class TransportFactory {
  /**
   * Create console transport
   */
  static createConsole(
    level: LogLevel = LogLevel.DEBUG,
    formatter?: LogFormatter
  ): ConsoleTransport {
    return new ConsoleTransport(level, true, formatter)
  }

  /**
   * Create localStorage transport
   */
  static createLocalStorage(
    level: LogLevel = LogLevel.INFO,
    maxEntries: number = 1000
  ): LocalStorageTransport {
    return new LocalStorageTransport(level, true, 'app_logs', maxEntries)
  }

  /**
   * Create remote transport
   */
  static createRemote(
    config: RemoteLoggingConfig,
    level: LogLevel = LogLevel.WARNING
  ): RemoteTransport {
    return new RemoteTransport(config, level, true)
  }

  /**
   * Create memory transport
   */
  static createMemory(
    level: LogLevel = LogLevel.DEBUG,
    maxEntries: number = 1000
  ): MemoryTransport {
    return new MemoryTransport(level, true, maxEntries)
  }

  /**
   * Create file transport
   */
  static createFile(
    filePath: string,
    level: LogLevel = LogLevel.INFO,
    formatter?: LogFormatter
  ): FileTransport {
    return new FileTransport(filePath, level, true, formatter)
  }

  /**
   * Create default transports for different environments
   */
  static createDefault(
    environment: 'development' | 'staging' | 'production' | 'test'
  ): LogTransport[] {
    const transports: LogTransport[] = []

    switch (environment) {
      case 'development':
        transports.push(
          this.createConsole(LogLevel.DEBUG),
          this.createLocalStorage(LogLevel.INFO),
          this.createMemory(LogLevel.DEBUG)
        )
        break

      case 'staging':
        transports.push(
          this.createConsole(LogLevel.INFO),
          this.createLocalStorage(LogLevel.WARNING)
        )
        break

      case 'production':
        transports.push(
          this.createConsole(LogLevel.ERROR),
          this.createLocalStorage(LogLevel.ERROR)
        )
        break

      case 'test':
        transports.push(this.createMemory(LogLevel.DEBUG))
        break
    }

    return transports
  }
}

export default TransportFactory
