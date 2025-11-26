/**
 * Common Utility Functions
 *
 * This module contains commonly used utility functions that can be
 * used throughout the application for various operations.
 */

// Type utilities
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (isString(value) || isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 9)
  return prefix
    ? `${prefix}_${timestamp}_${randomStr}`
    : `${timestamp}_${randomStr}`
}

// Object utilities
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array)
    return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: unknown }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function merge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  const result = { ...target }
  sources.forEach(source => {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key as keyof T]
      const targetValue = result[key as keyof T]

      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key as keyof T] = merge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[keyof T]
      } else {
        result[key as keyof T] = sourceValue as T[keyof T]
      }
    })
  })
  return result
}

// Array utilities
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item).toString()
      groups[key] = groups[key] || []
      groups[key].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => string | number,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a)
    const bVal = keyFn(b)

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Function utilities
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args) as ReturnType<T>
    cache.set(key, result)
    return result
  }) as T
}

// Date utilities
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  return dateObj.toLocaleDateString(undefined, {
    ...defaultOptions,
    ...options,
  })
}

export function formatTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  return dateObj.toLocaleTimeString(undefined, {
    ...defaultOptions,
    ...options,
  })
}

export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(target)
}

// Error utilities
export function createError(
  message: string,
  code?: string,
  cause?: Error
): Error {
  const error = new Error(message)
  if (code) {
    ;(error as any).code = code
  }
  if (cause) {
    ;(error as any).cause = cause
  }
  return error
}

export function isErrorWithCode(error: unknown, code: string): boolean {
  return error instanceof Error && (error as any).code === code
}

// Promise utilities
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxAttempts) {
        throw lastError
      }

      await sleep(delay * attempt) // Exponential backoff
    }
  }

  throw lastError!
}

// URL utilities
export function buildUrl(
  base: string,
  params?: Record<string, unknown>
): string {
  if (!params || Object.keys(params).length === 0) {
    return base
  }

  const url = new URL(base, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

export function parseQueryString(search: string): Record<string, string> {
  const params = new URLSearchParams(search)
  const result: Record<string, string> = {}

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}

// Storage utilities
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function safeJsonStringify(value: unknown, fallback = '{}'): string {
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

export default {
  // Type utilities
  isString,
  isNumber,
  isObject,
  isArray,
  isEmpty,

  // String utilities
  capitalize,
  truncate,
  slugify,
  generateId,

  // Object utilities
  deepClone,
  omit,
  pick,
  merge,

  // Array utilities
  unique,
  groupBy,
  sortBy,
  chunk,

  // Function utilities
  debounce,
  throttle,
  memoize,

  // Date utilities
  formatDate,
  formatTime,
  formatRelativeTime,

  // Error utilities
  createError,
  isErrorWithCode,

  // Promise utilities
  sleep,
  withTimeout,
  retry,

  // URL utilities
  buildUrl,
  parseQueryString,

  // Storage utilities
  safeJsonParse,
  safeJsonStringify,
}
