/**
 * Next.js 安全中間件
 *
 * 在所有請求上應用安全標頭和保護措施
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  setSecurityHeaders,
  CSRFProtection,
  XSSProtection,
  SECURITY_CONFIG,
} from '@/security'

// 速率限制存儲（在生產環境中應使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// 清理過期的速率限制記錄
function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// 檢查速率限制
function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remainingRequests: number; resetTime: number } {
  cleanupRateLimit()

  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // 創建新記錄或重置過期記錄
    const newRecord = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, newRecord)

    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime: newRecord.resetTime,
    }
  }

  // 更新現有記錄
  record.count++
  rateLimitStore.set(key, record)

  return {
    allowed: record.count <= maxRequests,
    remainingRequests: Math.max(0, maxRequests - record.count),
    resetTime: record.resetTime,
  }
}

// 獲取客戶端 IP 地址
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-forwarded-for')?.split(',')[0]

  return forwarded || realIp || remoteAddr || 'unknown'
}

// 檢查是否為 API 路由
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

// 檢查是否為靜態資源
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    (pathname.includes('.') &&
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(pathname))
  )
}

// 主要中間件函數
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)

  // 跳過靜態資源的安全檢查
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // 創建響應對象
  let response = NextResponse.next()

  try {
    // 1. 設置安全標頭
    response = setSecurityHeaders(response)

    // 2. CSRF 保護（僅對 API 路由）
    if (isApiRoute(pathname)) {
      // 對於狀態改變的請求進行 CSRF 檢查
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        if (!CSRFProtection.validateToken(request)) {
          return new NextResponse('CSRF token validation failed', {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      }

      // 為 GET 請求生成新的 CSRF token
      if (request.method === 'GET') {
        const csrfToken = CSRFProtection.generateToken()
        CSRFProtection.setTokenCookie(response, csrfToken)
        response.headers.set('X-CSRF-Token', csrfToken)
      }
    }

    // 3. 速率限制
    const rateLimitKey = `${clientIP}:${pathname}`
    let maxRequests: number = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS

    // 對登入和註冊端點使用更嚴格的限制
    if (pathname.includes('/login')) {
      maxRequests = SECURITY_CONFIG.RATE_LIMIT.LOGIN_MAX
    } else if (pathname.includes('/register')) {
      maxRequests = SECURITY_CONFIG.RATE_LIMIT.REGISTER_MAX
    }

    const rateLimitResult = checkRateLimit(
      rateLimitKey,
      maxRequests,
      SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
    )

    // 設置速率限制標頭
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimitResult.remainingRequests.toString()
    )
    response.headers.set(
      'X-RateLimit-Reset',
      rateLimitResult.resetTime.toString()
    )

    if (!rateLimitResult.allowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ).toString(),
        },
      })
    }

    // 4. 請求體大小檢查（API 路由）
    if (
      isApiRoute(pathname) &&
      ['POST', 'PUT', 'PATCH'].includes(request.method)
    ) {
      const contentLength = request.headers.get('content-length')
      if (
        contentLength &&
        parseInt(contentLength) > SECURITY_CONFIG.API.MAX_PAYLOAD_SIZE
      ) {
        return new NextResponse('Payload too large', {
          status: 413,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
    }

    // 5. 用戶代理檢查（基本機器人防護）
    const userAgent = request.headers.get('user-agent')
    if (!userAgent || userAgent.length < 10) {
      // 可疑的用戶代理，可能是機器人
      response.headers.set(
        'X-Robots-Tag',
        'noindex, nofollow, nosnippet, noarchive'
      )
    }

    // 6. Referrer 檢查（防止某些類型的攻擊）
    const referer = request.headers.get('referer')
    if (referer && !XSSProtection.isValidUrl(referer)) {
      console.warn(`Suspicious referer detected: ${referer}`)
    }

    return response
  } catch (error) {
    console.error('Security middleware error:', error)

    // 發生錯誤時返回基本的安全響應
    const errorResponse = new NextResponse('Internal Security Error', {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return setSecurityHeaders(errorResponse)
  }
}

// 配置中間件匹配器
export const config = {
  matcher: [
    /*
     * 匹配除了以下路徑的所有請求：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
