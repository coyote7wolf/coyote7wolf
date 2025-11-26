/**
 * 安全性配置和工具
 *
 * 提供 CSP、XSS 防護、CSRF 保護、資料驗證等安全機制
 * 確保應用程式符合安全最佳實踐
 */

import { NextRequest, NextResponse } from 'next/server'

// CSP (Content Security Policy) 配置
export const CSP_CONFIG = {
  // 開發環境 CSP - 較寬鬆以支持開發工具
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Next.js 開發模式需要
      "'unsafe-inline'", // 開發時的內聯腳本
      'https://vercel.live', // Vercel 工具
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Tailwind CSS 需要
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // Base64 字體
    ],
    'img-src': [
      "'self'",
      'data:', // Base64 圖片
      'blob:', // 動態生成的圖片
      'https://*.vercel.app',
      'https://avatars.githubusercontent.com', // GitHub 頭像
    ],
    'media-src': ["'self'", 'data:', 'blob:'],
    'connect-src': [
      "'self'",
      'http://localhost:*', // 開發服務器
      'ws://localhost:*', // WebSocket 開發
      'https://api.github.com', // GitHub API
      'https://vercel.live', // Vercel 實時協作
    ],
    'frame-src': ["'self'", 'https://vercel.live'],
    'worker-src': [
      "'self'",
      'blob:', // Service Worker
    ],
    'manifest-src': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"], // 防止 clickjacking
    'base-uri': ["'self'"],
    'object-src': ["'none'"], // 禁用 Flash/Java 等插件
  },

  // 生產環境 CSP - 嚴格安全政策
  production: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'sha256-xxx'", // 特定腳本的 SHA256 hash
    ],
    'style-src': [
      "'self'",
      "'sha256-xxx'", // 特定樣式的 SHA256 hash
      'https://fonts.googleapis.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': [
      "'self'",
      'data:',
      'https://*.synccoreai.com', // 自己的 CDN
    ],
    'media-src': ["'self'", 'https://*.synccoreai.com'],
    'connect-src': [
      "'self'",
      'https://api.synccoreai.com',
      'wss://ws.synccoreai.com',
    ],
    'frame-src': ["'none'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': [],
  },
}

// 生成 CSP 標頭字符串
export function generateCSPHeader(
  env: 'development' | 'production' = 'production'
): string {
  const config = CSP_CONFIG[env]
  const directives = Object.entries(config)
    .map(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        return `${key} ${values.join(' ')}`
      } else if (values.length === 0) {
        return key // 對於 upgrade-insecure-requests 等沒有值的指令
      }
      return ''
    })
    .filter(Boolean)

  return directives.join('; ')
}

// CSRF Token 管理
export class CSRFProtection {
  private static readonly TOKEN_HEADER = 'X-CSRF-Token'
  private static readonly TOKEN_COOKIE = 'csrf-token'
  private static readonly TOKEN_LENGTH = 32

  // 生成 CSRF Token
  static generateToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  }

  // 驗證 CSRF Token
  static validateToken(request: NextRequest): boolean {
    if (
      request.method === 'GET' ||
      request.method === 'HEAD' ||
      request.method === 'OPTIONS'
    ) {
      return true // 安全的 HTTP 方法不需要 CSRF 保護
    }

    const headerToken = request.headers.get(this.TOKEN_HEADER)
    const cookieToken = request.cookies.get(this.TOKEN_COOKIE)?.value

    return Boolean(headerToken && cookieToken && headerToken === cookieToken)
  }

  // 設置 CSRF Token Cookie
  static setTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set(this.TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 小時
    })
  }
}

// XSS 防護工具
export class XSSProtection {
  // HTML 實體編碼
  static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\//g, '&#x2F;')
  }

  // 清理用戶輸入
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''

    // 移除潛在的腳本標籤
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // 移除事件處理器
      .replace(/expression\s*\(/gi, '') // 移除 CSS expression
      .trim()
  }

  // 驗證 URL 安全性
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }

  // 生成安全的內聯樣式
  static generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  }
}

// 資料驗證規則
export class DataValidation {
  // Email 驗證
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  // 密碼強度驗證
  static isStrongPassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('密碼長度至少需要 8 個字符')
    }
    if (password.length > 128) {
      errors.push('密碼長度不能超過 128 個字符')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('密碼必須包含至少一個小寫字母')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('密碼必須包含至少一個大寫字母')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('密碼必須包含至少一個數字')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密碼必須包含至少一個特殊字符')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // 用戶名驗證
  static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    return usernameRegex.test(username)
  }

  // 文件名驗證
  static isValidFileName(fileName: string): boolean {
    // 禁用危險的文件名模式
    const dangerousPatterns = [
      /\.\./, // 路徑遍歷
      /[<>:"|?*]/, // Windows 禁用字符
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows 保留名稱
    ]

    return (
      fileName.length > 0 &&
      fileName.length <= 255 &&
      !dangerousPatterns.some(pattern => pattern.test(fileName))
    )
  }

  // JSON 安全解析
  static safeJsonParse<T>(jsonString: string): T | null {
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }

  // 數字範圍驗證
  static isInRange(value: number, min: number, max: number): boolean {
    return (
      typeof value === 'number' && !isNaN(value) && value >= min && value <= max
    )
  }
}

// 安全標頭設置
export function setSecurityHeaders(response: NextResponse): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    generateCSPHeader(isDevelopment ? 'development' : 'production')
  )

  // X-Frame-Options - 防止 clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options - 防止 MIME 類型嗅探
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Referrer-Policy - 控制 referrer 信息
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // X-XSS-Protection - XSS 過濾器（舊瀏覽器）
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Strict-Transport-Security - 強制 HTTPS（僅生產環境）
  if (!isDevelopment) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Permissions-Policy - 功能策略
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )

  return response
}

// 安全配置常量
export const SECURITY_CONFIG = {
  // 會話配置
  SESSION: {
    MAX_AGE: 60 * 60 * 24 * 7, // 7 天
    SECURE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'strict' as const,
  },

  // 速率限制
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 分鐘
    MAX_REQUESTS: 100, // 每個窗口最大請求數
    LOGIN_MAX: 5, // 登入嘗試次數
    REGISTER_MAX: 3, // 註冊嘗試次數
  },

  // 文件上傳限制
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
    ],
    MAX_FILES: 5,
  },

  // API 安全配置
  API: {
    TIMEOUT: 30000, // 30 秒
    MAX_PAYLOAD_SIZE: 1024 * 1024, // 1MB
    CORS_ORIGINS:
      process.env.NODE_ENV === 'production'
        ? ['https://synccoreai.com', 'https://www.synccoreai.com']
        : ['http://localhost:3000'],
  },
} as const
