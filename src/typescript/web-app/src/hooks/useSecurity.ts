/**
 * 安全驗證相關的 React Hooks
 *
 * 提供客戶端安全驗證和保護功能
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { XSSProtection, DataValidation, CSRFProtection } from '@/security'

// CSRF Token Hook
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/csrf-token')
      if (response.ok) {
        const csrfToken = response.headers.get('X-CSRF-Token')
        setToken(csrfToken)
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  const refreshToken = useCallback(() => {
    fetchToken()
  }, [fetchToken])

  return { token, isLoading, refreshToken }
}

// 安全輸入驗證 Hook
export function useSecureInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue)
  const [sanitizedValue, setSanitizedValue] = useState(initialValue)
  const [isValid, setIsValid] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  const updateValue = useCallback((newValue: string) => {
    // 1. 清理輸入
    const cleaned = XSSProtection.sanitizeInput(newValue)

    // 2. 驗證輸入
    const validationErrors: string[] = []

    // 檢查是否包含潛在的惡意內容
    if (newValue !== cleaned) {
      validationErrors.push('輸入包含不安全的內容')
    }

    // 檢查長度
    if (cleaned.length > 10000) {
      validationErrors.push('輸入內容過長')
    }

    setValue(newValue)
    setSanitizedValue(cleaned)
    setErrors(validationErrors)
    setIsValid(validationErrors.length === 0)
  }, [])

  return {
    value,
    sanitizedValue,
    isValid,
    errors,
    updateValue,
  }
}

// 密碼強度檢查 Hook
export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState<{
    isValid: boolean
    errors: string[]
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong'
  }>({
    isValid: false,
    errors: [],
    score: 0,
    level: 'weak',
  })

  useEffect(() => {
    const validation = DataValidation.isStrongPassword(password)

    // 計算密碼強度分數
    let score = 0

    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    if (password.length >= 16) score += 1
    if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(
        password
      )
    )
      score += 1

    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    if (score >= 6) level = 'strong'
    else if (score >= 4) level = 'good'
    else if (score >= 2) level = 'fair'

    setStrength({
      isValid: validation.isValid,
      errors: validation.errors,
      score: Math.min(score, 8),
      level,
    })
  }, [password])

  return strength
}

// 文件上傳安全檢查 Hook
export function useSecureFileUpload() {
  const [uploadState, setUploadState] = useState<{
    isValidating: boolean
    errors: string[]
    validFiles: File[]
  }>({
    isValidating: false,
    errors: [],
    validFiles: [],
  })

  const validateFiles = useCallback(async (files: FileList | File[]) => {
    setUploadState(prev => ({ ...prev, isValidating: true }))

    const fileArray = Array.from(files)
    const errors: string[] = []
    const validFiles: File[] = []

    for (const file of fileArray) {
      // 1. 檢查文件大小
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        errors.push(`文件 ${file.name} 大小超過 10MB 限制`)
        continue
      }

      // 2. 檢查文件類型
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/json',
      ]

      if (!allowedTypes.includes(file.type)) {
        errors.push(`文件 ${file.name} 類型不被支持`)
        continue
      }

      // 3. 檢查文件名
      if (!DataValidation.isValidFileName(file.name)) {
        errors.push(`文件名 ${file.name} 包含不安全的字符`)
        continue
      }

      // 4. 簡單的文件內容檢查（圖片文件）
      if (file.type.startsWith('image/')) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const bytes = new Uint8Array(arrayBuffer)

          // 檢查文件頭部簽名
          const isValidImage = checkImageSignature(bytes, file.type)
          if (!isValidImage) {
            errors.push(`文件 ${file.name} 可能不是有效的圖片文件`)
            continue
          }
        } catch (error) {
          errors.push(`無法驗證文件 ${file.name} 的內容`)
          continue
        }
      }

      validFiles.push(file)
    }

    setUploadState({
      isValidating: false,
      errors,
      validFiles,
    })

    return { errors, validFiles }
  }, [])

  return {
    ...uploadState,
    validateFiles,
  }
}

// 檢查圖片文件簽名
function checkImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    'image/gif': [
      [0x47, 0x49, 0x46, 0x38],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  }

  const expectedSignatures = signatures[mimeType]
  if (!expectedSignatures) return true // 未知類型，跳過檢查

  return expectedSignatures.some(signature =>
    signature.every((byte, index) => bytes[index] === byte)
  )
}

// URL 安全檢查 Hook
export function useSecureUrl(url: string) {
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    // 基本 URL 驗證
    if (!XSSProtection.isValidUrl(url)) {
      setIsValid(false)
      setError('無效的 URL 格式')
      setIsLoading(false)
      return
    }

    try {
      const parsed = new URL(url)

      // 檢查協議
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setIsValid(false)
        setError('不支持的協議')
        setIsLoading(false)
        return
      }

      // 檢查是否為內部 URL 或允許的外部域名
      const allowedDomains = [
        'localhost',
        '127.0.0.1',
        'synccoreai.com',
        'www.synccoreai.com',
        'api.synccoreai.com',
      ]

      const isAllowed = allowedDomains.some(
        domain =>
          parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      )

      if (!isAllowed) {
        setIsValid(false)
        setError('不允許的域名')
        setIsLoading(false)
        return
      }

      setIsValid(true)
    } catch (error) {
      setIsValid(false)
      setError('URL 解析錯誤')
    } finally {
      setIsLoading(false)
    }
  }, [url])

  return { isValid, isLoading, error }
}

// 內容安全檢查 Hook
export function useContentSecurity() {
  const [isScanning, setIsScanning] = useState(false)

  const scanContent = useCallback(
    async (
      content: string
    ): Promise<{
      isSafe: boolean
      threats: string[]
      sanitizedContent: string
    }> => {
      setIsScanning(true)

      try {
        const threats: string[] = []
        let sanitizedContent = content

        // 1. XSS 檢查
        const originalLength = content.length
        sanitizedContent = XSSProtection.sanitizeInput(content)

        if (sanitizedContent.length !== originalLength) {
          threats.push('檢測到潛在的 XSS 攻擊內容')
        }

        // 2. SQL 注入模式檢查
        const sqlPatterns = [
          /(\bunion\b.*\bselect\b)/i,
          /(\bselect\b.*\bfrom\b.*\bwhere\b)/i,
          /(\bdrop\b.*\btable\b)/i,
          /(\binsert\b.*\binto\b)/i,
          /(\bdelete\b.*\bfrom\b)/i,
          /(\bupdate\b.*\bset\b)/i,
          /(';|";\-\-)/,
        ]

        if (sqlPatterns.some(pattern => pattern.test(content))) {
          threats.push('檢測到潛在的 SQL 注入攻擊模式')
        }

        // 3. 腳本注入檢查
        const scriptPatterns = [
          /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
          /javascript:/gi,
          /vbscript:/gi,
          /on\w+\s*=/gi,
          /eval\s*\(/gi,
          /expression\s*\(/gi,
        ]

        if (scriptPatterns.some(pattern => pattern.test(content))) {
          threats.push('檢測到潛在的腳本注入內容')
        }

        // 4. 檢查過長的內容
        if (content.length > 100000) {
          threats.push('內容長度超過安全限制')
        }

        return {
          isSafe: threats.length === 0,
          threats,
          sanitizedContent,
        }
      } finally {
        setIsScanning(false)
      }
    },
    []
  )

  return {
    isScanning,
    scanContent,
  }
}

// 會話安全檢查 Hook
export function useSessionSecurity() {
  const [sessionInfo, setSessionInfo] = useState<{
    isSecure: boolean
    warnings: string[]
    lastActivity: Date | null
    fingerprintChanged: boolean
  }>({
    isSecure: true,
    warnings: [],
    lastActivity: null,
    fingerprintChanged: false,
  })

  const checkSession = useCallback(() => {
    const warnings: string[] = []

    // 檢查連接安全性
    if (typeof window !== 'undefined') {
      if (
        window.location.protocol !== 'https:' &&
        !window.location.hostname.match(/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/)
      ) {
        warnings.push('連接未使用 HTTPS 加密')
      }

      // 檢查瀏覽器安全特性
      if (!window.crypto || !window.crypto.subtle) {
        warnings.push('瀏覽器不支持現代加密 API')
      }

      // 檢查 localStorage 可用性
      try {
        localStorage.setItem('security_test', 'test')
        localStorage.removeItem('security_test')
      } catch {
        warnings.push('本地存儲不可用，會話可能不穩定')
      }
    }

    setSessionInfo(prev => ({
      ...prev,
      isSecure: warnings.length === 0,
      warnings,
      lastActivity: new Date(),
    }))
  }, [])

  useEffect(() => {
    checkSession()

    // 定期檢查會話安全性
    const interval = setInterval(checkSession, 60000) // 每分鐘檢查一次

    return () => clearInterval(interval)
  }, [checkSession])

  return {
    ...sessionInfo,
    refreshCheck: checkSession,
  }
}
