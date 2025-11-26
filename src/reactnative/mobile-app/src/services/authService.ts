import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Keychain from 'react-native-keychain'
import {User} from '../types'
import {TEST_ACCOUNTS, STORAGE_KEYS} from '../utils/constants'
import {authRateLimiter} from '../utils/securityUtils'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

interface JWTPayload {
  sub: string
  email: string
  name: string
  role: string
  iat: number
  exp: number
}

// Mock API delay
const mockDelay = (ms: number = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Generate mock JWT token
const generateMockJWT = (user: User): string => {
  const header = {alg: 'HS256', typ: 'JWT'}
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = Buffer.from(
    `${encodedHeader}.${encodedPayload}.secret`,
  ).toString('base64')
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Generate mock refresh token
const generateMockRefreshToken = (): string => {
  return `refresh_token_${Date.now()}_${Math.random().toString(36).substr(2)}`
}

export const authService = {
  // JWT-based login with Keychain
  async login({email, password}: LoginRequest): Promise<LoginResponse> {
    // Check rate limiting
    if (authRateLimiter.isLocked(email)) {
      throw new Error(
        'Too many login attempts. Please try again in 15 minutes.',
      )
    }

    await mockDelay(800)

    const account = TEST_ACCOUNTS.find(acc => acc.email === email)

    if (!account || account.password !== password) {
      authRateLimiter.recordAttempt(email)
      throw new Error('Invalid email or password')
    }

    // Reset rate limiter on successful login
    authRateLimiter.reset(email)

    const user: User = {
      id: `user_${Date.now()}`,
      email: account.email,
      name: account.name,
      role: account.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        account.name,
      )}&background=2196F3&color=fff`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const accessToken = generateMockJWT(user)
    const refreshToken = generateMockRefreshToken()

    // Store securely in Keychain
    try {
      await Keychain.setGenericPassword(email, accessToken, {
        service: 'accessToken',
      })
      await Keychain.setGenericPassword(email, refreshToken, {
        service: 'refreshToken',
      })
    } catch (error) {
      console.error('Keychain store failed, using AsyncStorage:', error)
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
    }

    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

    return {user, accessToken, refreshToken}
  },

  // Retrieve tokens from Keychain
  async getStoredTokens(_email: string): Promise<{
    accessToken: string | null
    refreshToken: string | null
  }> {
    try {
      const accessToken = await Keychain.getGenericPassword({
        service: 'accessToken',
      })
      const refreshToken = await Keychain.getGenericPassword({
        service: 'refreshToken',
      })

      return {
        accessToken: accessToken ? accessToken.password : null,
        refreshToken: refreshToken ? refreshToken.password : null,
      }
    } catch (error) {
      console.error('Error retrieving tokens from Keychain:', error)
      // Fallback to AsyncStorage
      const fallbackToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      return {
        accessToken: fallbackToken,
        refreshToken: null,
      }
    }
  },

  // Clear credentials from Keychain
  async clearKeychain(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({service: 'accessToken'})
      await Keychain.resetGenericPassword({service: 'refreshToken'})
    } catch (error) {
      console.error('Error clearing Keychain:', error)
    }
  },

  // Refresh JWT token
  async refreshToken(): Promise<{accessToken: string; refreshToken: string}> {
    await mockDelay(600)

    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('No user found for token refresh')
    }

    // Generate new JWT and refresh token
    const newAccessToken = generateMockJWT(user)
    const newRefreshToken = generateMockRefreshToken()

    // Update tokens in Keychain
    try {
      await Keychain.setGenericPassword(user.email, newAccessToken, {
        service: 'accessToken',
      })
      await Keychain.setGenericPassword(user.email, newRefreshToken, {
        service: 'refreshToken',
      })
    } catch (error) {
      console.error('Keychain update failed, using AsyncStorage:', error)
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken)
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  },

  // Verify JWT token (mock implementation)
  verifyJWT(token: string): boolean {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      const now = Math.floor(Date.now() / 1000)

      // Check if token is expired
      return payload.exp > now
    } catch (error) {
      console.error('Error verifying JWT:', error)
      return false
    }
  },

  // Decode JWT token
  decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      return payload as JWTPayload
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return null
    }
  },

  // Mock logout
  async logout(): Promise<void> {
    await mockDelay(300)

    // Clear Keychain
    await this.clearKeychain()

    // Clear AsyncStorage
    await AsyncStorage.removeItem(STORAGE_KEYS.USER)
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  // Get current user from AsyncStorage
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER)
      if (!userJson) {
        return null
      }

      return JSON.parse(userJson) as User
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Get auth token from AsyncStorage
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken()
    const user = await this.getCurrentUser()
    return !!(token && user)
  },

  // Mock biometric authentication
  async authenticateWithBiometrics(): Promise<LoginResponse> {
    await mockDelay(500)

    // Get last logged in user
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('No previous user found for biometric authentication')
    }

    // Generate new JWT and refresh token
    const accessToken = generateMockJWT(user)
    const refreshToken = generateMockRefreshToken()

    // Store securely in Keychain
    try {
      await Keychain.setGenericPassword(user.email, accessToken, {
        service: 'accessToken',
      })
      await Keychain.setGenericPassword(user.email, refreshToken, {
        service: 'refreshToken',
      })
    } catch (error) {
      console.error('Keychain store failed, using AsyncStorage:', error)
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
    }

    return {user, accessToken, refreshToken}
  },

  // Mock registration (for future use)
  async register(data: {
    email: string
    password: string
    name: string
  }): Promise<LoginResponse> {
    await mockDelay(1200)

    // Check if email already exists
    const existingAccount = TEST_ACCOUNTS.find(acc => acc.email === data.email)
    if (existingAccount) {
      throw new Error('Email already registered')
    }

    // Create new user
    const user: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'viewer', // Default role for new users
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name,
      )}&background=2196F3&color=fff`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const accessToken = generateMockJWT(user)
    const refreshToken = generateMockRefreshToken()

    // Store securely in Keychain
    try {
      await Keychain.setGenericPassword(data.email, accessToken, {
        service: 'accessToken',
      })
      await Keychain.setGenericPassword(data.email, refreshToken, {
        service: 'refreshToken',
      })
    } catch (error) {
      console.error('Keychain store failed, using AsyncStorage:', error)
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
    }

    // Store user profile
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

    return {user, accessToken, refreshToken}
  },

  // OAuth2 login flow (mock implementation for Google/Apple/Microsoft)
  async loginWithOAuth2(
    provider: 'google' | 'apple' | 'microsoft',
  ): Promise<LoginResponse> {
    await mockDelay(1500)

    // In real implementation, would use:
    // - Google: @react-native-google-signin/google-signin
    // - Apple: @invertase/react-native-apple-authentication
    // - Microsoft: react-native-auth0 or similar

    // Mock OAuth2 flow
    const mockOAuthUsers: Record<string, User> = {
      google: {
        id: 'oauth_google_001',
        email: 'user+google@example.com',
        name: 'Google Test User',
        role: 'viewer',
        avatar:
          'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      apple: {
        id: 'oauth_apple_001',
        email: 'user+apple@example.com',
        name: 'Apple Test User',
        role: 'viewer',
        avatar:
          'https://ui-avatars.com/api/?name=Apple+User&background=000000&color=fff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      microsoft: {
        id: 'oauth_microsoft_001',
        email: 'user+microsoft@example.com',
        name: 'Microsoft Test User',
        role: 'viewer',
        avatar:
          'https://ui-avatars.com/api/?name=Microsoft+User&background=0078D4&color=fff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    const user = mockOAuthUsers[provider]
    const accessToken = generateMockJWT(user)
    const refreshToken = generateMockRefreshToken()

    // Store securely in Keychain
    try {
      await Keychain.setGenericPassword(user.email, accessToken, {
        service: 'accessToken',
      })
      await Keychain.setGenericPassword(user.email, refreshToken, {
        service: 'refreshToken',
      })
    } catch (error) {
      console.error('Keychain store failed, using AsyncStorage:', error)
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
    }

    // Store user profile
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

    return {user, accessToken, refreshToken}
  },

  // Change password (mock implementation)
  async changePassword(
    currentPassword: string,
    _newPassword: string,
  ): Promise<void> {
    await mockDelay(1000)

    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('No user authenticated')
    }

    // In real implementation, would verify current password with backend
    const account = TEST_ACCOUNTS.find(acc => acc.email === user.email)
    if (!account || account.password !== currentPassword) {
      throw new Error('Current password is incorrect')
    }

    // In real implementation, would send new password to backend
    console.log(`Password changed for user: ${user.email}`)
  },

  // Request password reset (mock implementation)
  async requestPasswordReset(email: string): Promise<void> {
    await mockDelay(800)

    const account = TEST_ACCOUNTS.find(acc => acc.email === email)
    if (!account) {
      // Don't reveal whether email exists (security best practice)
      return
    }

    // In real implementation, would send reset link to email
    console.log(`Password reset email sent to: ${email}`)
  },

  // Reset password with token (mock implementation)
  async resetPasswordWithToken(
    token: string,
    _newPassword: string,
  ): Promise<void> {
    await mockDelay(1000)

    // In real implementation, would verify token with backend
    if (!token || token.length === 0) {
      throw new Error('Invalid reset token')
    }

    // In real implementation, would update password on backend
    console.log(`Password reset with token: ${token}`)
  },
}
