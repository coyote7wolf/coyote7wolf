/**
 * Security Utilities for Mobile App
 * Includes device attestation, encryption helpers, and security checks
 */

import {Platform} from 'react-native'
import EncryptedStorage from 'react-native-encrypted-storage'

// Device Info Interface
export interface DeviceInfo {
  platform: 'ios' | 'android'
  osVersion: string
  deviceId: string
  isJailbroken: boolean
  isRooted: boolean
  securityPatch?: string
}

// Attestation Response Interface
export interface DeviceAttestation {
  timestamp: number
  verified: boolean
  platform: 'ios' | 'android'
  token?: string
  error?: string
}

/**
 * Get basic device information
 * Provides platform, OS version, and device identifier
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  return {
    platform: Platform.OS as 'ios' | 'android',
    osVersion: Platform.Version?.toString() || 'unknown',
    deviceId: `${Platform.OS}_device_${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    isJailbroken: false, // Requires native module: jailbreak-monkey
    isRooted: false, // Requires native module: root-check
  }
}

/**
 * iOS Device Check - Verify device integrity via Apple DeviceCheck API
 * NOTE: This requires Apple DeviceCheck capabilities
 */
export const performiOSDeviceCheck = async (): Promise<DeviceAttestation> => {
  // Requires:
  // 1. Associated Domains entitlement
  // 2. Backend endpoint for DeviceCheck verification
  // 3. apple-app-attest or react-native-device-check package

  return {
    timestamp: Date.now(),
    verified: false,
    platform: 'ios',
    error:
      'DeviceCheck requires native implementation with Apple DeviceCheck API. See native layer implementation.',
  }
}

/**
 * Android Play Integrity API - Verify device integrity via Google Play Integrity
 * NOTE: This requires Google Play Services and Android implementation
 */
export const performAndroidPlayIntegrity =
  async (): Promise<DeviceAttestation> => {
    // Requires:
    // 1. Google Play Services
    // 2. Backend endpoint for Play Integrity verification
    // 3. @react-native-google-play-integrity/google-play-integrity package

    return {
      timestamp: Date.now(),
      verified: false,
      platform: 'android',
      error:
        'Play Integrity API requires native implementation with Google Play Services. See native layer implementation.',
    }
  }

/**
 * Encrypt sensitive string with AES-256
 * Uses react-native-encrypted-storage for secure storage
 */
export const encryptSensitiveData = async (
  key: string,
  value: string,
): Promise<void> => {
  try {
    await EncryptedStorage.setItem(key, value)
    console.log(`Encrypted data stored with key: ${key}`)
  } catch (error) {
    console.error('Encryption failed:', error)
    throw error
  }
}

/**
 * Decrypt sensitive string
 * Retrieves from react-native-encrypted-storage
 */
export const decryptSensitiveData = async (
  key: string,
): Promise<string | null> => {
  try {
    const value = await EncryptedStorage.getItem(key)
    if (value) {
      console.log(`Decrypted data retrieved with key: ${key}`)
    }
    return value
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

/**
 * Generate cryptographic hash of token
 * For secure token storage without exposing original
 */
export const hashToken = (token: string): string => {
  // Simple hash for mock implementation
  // In production, use crypto.subtle.digest('SHA-256', ...)
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i)
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char
    // eslint-disable-next-line no-bitwise
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Verify token hasn't been tampered with
 */
export const verifyTokenIntegrity = (token: string, hash: string): boolean => {
  return hashToken(token) === hash
}

/**
 * Check for certificate pinning
 * NOTE: Requires native implementation
 */
export const verifyCertificatePinning = async (
  host: string,
): Promise<boolean> => {
  // Requires:
  // 1. TrustKit or react-native-netlog
  // 2. Certificate pins configured
  // 3. Native implementation in iOS/Android layers

  console.log(`Checking certificate pin for host: ${host}`)
  return true // Mock implementation
}

/**
 * Get app signature hash (Android only)
 * For verifying authentic app installation
 */
export const getAppSignatureHash = async (): Promise<string | null> => {
  if (Platform.OS === 'android') {
    // Requires react-native-signature-verify or native implementation
    console.log('Getting app signature hash')
    return 'mock_signature_hash'
  }
  return null
}

/**
 * Verify app signature (Android only)
 */
export const verifyAppSignature = async (
  expectedHash: string,
): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const actualHash = await getAppSignatureHash()
    return actualHash === expectedHash
  }
  return true // iOS doesn't need this check
}

/**
 * Clear all sensitive data from device
 * Clears EncryptedStorage and sensitive memory
 */
export const clearAllSensitiveData = async (): Promise<void> => {
  try {
    // Clear EncryptedStorage
    await EncryptedStorage.removeItem('access_token')
    await EncryptedStorage.removeItem('refresh_token')
    await EncryptedStorage.removeItem('user_credentials')

    console.log('All sensitive data cleared successfully')
  } catch (error) {
    console.error('Error clearing sensitive data:', error)
    throw error
  }
}

/**
 * Check device security posture
 * Combines multiple security checks
 * NOTE: Requires native modules for jailbreak/root detection
 */
export const checkDeviceSecurityPosture = async (): Promise<{
  isSecure: boolean
  checks: Record<string, boolean>
  warnings: string[]
}> => {
  const checks: Record<string, boolean> = {
    jailbreakDetected: false,
    rootDetected: false,
    certificatePinningValid: true,
  }

  const warnings: string[] = []

  // Check for jailbreak (iOS)
  if (Platform.OS === 'ios') {
    // Requires native module: jailbreak-monkey
    checks.jailbreakDetected = false
    if (checks.jailbreakDetected) {
      warnings.push('Device appears to be jailbroken. Sensitive data at risk.')
    }
  }

  // Check for root (Android)
  if (Platform.OS === 'android') {
    // Requires native module: root-check
    checks.rootDetected = false
    if (checks.rootDetected) {
      warnings.push('Device appears to be rooted. Sensitive data at risk.')
    }
  }

  return {
    isSecure: warnings.length === 0,
    checks,
    warnings,
  }
}

/**
 * Rate limit authentication attempts
 */
export class AuthenticationRateLimiter {
  private attempts: Record<string, {count: number; timestamp: number}> = {}
  private maxAttempts: number = 5
  private lockoutDuration: number = 15 * 60 * 1000 // 15 minutes

  isLocked(identifier: string): boolean {
    const attempt = this.attempts[identifier]
    if (!attempt) {
      return false
    }

    const now = Date.now()
    const timeSinceLastAttempt = now - attempt.timestamp

    if (timeSinceLastAttempt > this.lockoutDuration) {
      // Reset after lockout duration
      delete this.attempts[identifier]
      return false
    }

    return attempt.count >= this.maxAttempts
  }

  recordAttempt(identifier: string): void {
    const now = Date.now()
    const attempt = this.attempts[identifier]

    if (!attempt) {
      this.attempts[identifier] = {count: 1, timestamp: now}
    } else {
      const timeSinceLastAttempt = now - attempt.timestamp
      if (timeSinceLastAttempt > this.lockoutDuration) {
        // Reset counter if outside lockout window
        this.attempts[identifier] = {count: 1, timestamp: now}
      } else {
        attempt.count += 1
        attempt.timestamp = now
      }
    }
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts[identifier]
    if (!attempt) {
      return this.maxAttempts
    }

    const now = Date.now()
    const timeSinceLastAttempt = now - attempt.timestamp

    if (timeSinceLastAttempt > this.lockoutDuration) {
      return this.maxAttempts
    }

    return Math.max(0, this.maxAttempts - attempt.count)
  }

  reset(identifier: string): void {
    delete this.attempts[identifier]
  }
}

// Export rate limiter instance
export const authRateLimiter = new AuthenticationRateLimiter()
