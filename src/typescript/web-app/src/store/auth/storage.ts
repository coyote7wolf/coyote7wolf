/**
 * Secure Storage for Authentication
 *
 * Provides secure storage mechanisms for authentication tokens and user data
 * with encryption, expiration handling, and cross-tab synchronization.
 */

import { AuthTokens, User, AuthStorage } from './types'

/**
 * Encryption utilities for secure storage
 */
class EncryptionUtils {
  private static readonly ALGORITHM = 'AES-GCM'
  private static readonly KEY_LENGTH = 256

  /**
   * Generate encryption key from password
   */
  private static async deriveKey(
    password: string,
    salt: ArrayBuffer
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt data with AES-GCM
   */
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const key = await this.deriveKey(password, salt.buffer)
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv,
        },
        key,
        encoder.encode(data)
      )

      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(
        salt.length + iv.length + encrypted.byteLength
      )
      combined.set(salt, 0)
      combined.set(iv, salt.length)
      combined.set(new Uint8Array(encrypted), salt.length + iv.length)

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Encryption failed:', error)
      return data // Fallback to plain text if encryption fails
    }
  }

  /**
   * Decrypt data with AES-GCM
   */
  static async decrypt(
    encryptedData: string,
    password: string
  ): Promise<string> {
    try {
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      )

      const salt = combined.slice(0, 16)
      const iv = combined.slice(16, 28)
      const encrypted = combined.slice(28)

      const key = await this.deriveKey(password, salt.buffer)
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv,
        },
        key,
        encrypted
      )

      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      return encryptedData // Return as-is if decryption fails
    }
  }

  /**
   * Generate secure random password for encryption
   */
  static generateSecureKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  }
}

/**
 * Storage Item with Expiration
 */
interface StorageItem<T> {
  data: T
  expiresAt?: number
  encrypted: boolean
  version: number
}

/**
 * Secure Storage Implementation
 */
export class SecureAuthStorage implements AuthStorage {
  private static readonly VERSION = 1
  private static readonly ENCRYPTION_KEY_STORAGE = '__auth_encryption_key__'

  private encryptionKey: string
  private useEncryption: boolean
  private storage: Storage

  constructor(useSessionStorage = false, enableEncryption = true) {
    this.storage = useSessionStorage ? sessionStorage : localStorage
    this.useEncryption = enableEncryption && this.isEncryptionSupported()
    this.encryptionKey = this.getOrCreateEncryptionKey()
  }

  /**
   * Check if encryption is supported
   */
  private isEncryptionSupported(): boolean {
    return (
      typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues !== 'undefined'
    )
  }

  /**
   * Get or create encryption key
   */
  private getOrCreateEncryptionKey(): string {
    if (!this.useEncryption) return ''

    let key = this.storage.getItem(SecureAuthStorage.ENCRYPTION_KEY_STORAGE)
    if (!key) {
      key = EncryptionUtils.generateSecureKey()
      this.storage.setItem(SecureAuthStorage.ENCRYPTION_KEY_STORAGE, key)
    }
    return key
  }

  /**
   * Set item with optional encryption and expiration
   */
  async setItem(
    key: string,
    value: string,
    expiresInMinutes?: number
  ): Promise<void> {
    try {
      const expiresAt = expiresInMinutes
        ? Date.now() + expiresInMinutes * 60 * 1000
        : undefined

      const item: StorageItem<string> = {
        data: this.useEncryption
          ? await EncryptionUtils.encrypt(value, this.encryptionKey)
          : value,
        encrypted: this.useEncryption,
        version: SecureAuthStorage.VERSION,
      }

      if (expiresAt !== undefined) {
        item.expiresAt = expiresAt
      }

      this.storage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('Failed to set storage item:', error)
      // Fallback to direct storage without encryption
      this.storage.setItem(key, value)
    }
  }

  /**
   * Get item with automatic decryption and expiration check
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const rawValue = this.storage.getItem(key)
      if (!rawValue) return null

      // Try to parse as StorageItem
      let item: StorageItem<string>
      try {
        item = JSON.parse(rawValue)
      } catch {
        // Fallback for plain string values
        return rawValue
      }

      // Check version compatibility
      if (item.version !== SecureAuthStorage.VERSION) {
        this.removeItem(key)
        return null
      }

      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.removeItem(key)
        return null
      }

      // Decrypt if necessary
      if (item.encrypted && this.useEncryption) {
        return await EncryptionUtils.decrypt(item.data, this.encryptionKey)
      }

      return item.data
    } catch (error) {
      console.error('Failed to get storage item:', error)
      return null
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    this.storage.removeItem(key)
  }

  /**
   * Clear all storage
   */
  clear(): void {
    this.storage.clear()
  }

  /**
   * Set tokens with automatic expiration
   */
  async setTokens(tokens: AuthTokens): Promise<void> {
    const expiresInMinutes = Math.floor(
      (tokens.expiresAt * 1000 - Date.now()) / (60 * 1000)
    )
    await this.setItem('auth_tokens', JSON.stringify(tokens), expiresInMinutes)
  }

  /**
   * Get tokens with automatic validation
   */
  async getTokens(): Promise<AuthTokens | null> {
    const tokensJson = await this.getItem('auth_tokens')
    if (!tokensJson) return null

    try {
      const tokens = JSON.parse(tokensJson) as AuthTokens

      // Validate token structure
      if (!tokens.accessToken || !tokens.refreshToken || !tokens.expiresAt) {
        this.removeItem('auth_tokens')
        return null
      }

      return tokens
    } catch (error) {
      console.error('Failed to parse tokens:', error)
      this.removeItem('auth_tokens')
      return null
    }
  }

  /**
   * Set user data with encryption
   */
  async setUser(user: User): Promise<void> {
    await this.setItem('auth_user', JSON.stringify(user))
  }

  /**
   * Get user data with validation
   */
  async getUser(): Promise<User | null> {
    const userJson = await this.getItem('auth_user')
    if (!userJson) return null

    try {
      const user = JSON.parse(userJson) as User

      // Basic validation
      if (!user.profile?.id || !user.profile?.email) {
        this.removeItem('auth_user')
        return null
      }

      return user
    } catch (error) {
      console.error('Failed to parse user data:', error)
      this.removeItem('auth_user')
      return null
    }
  }

  /**
   * Set remember me preference
   */
  async setRememberMe(remember: boolean): Promise<void> {
    await this.setItem('auth_remember_me', remember.toString())
  }

  /**
   * Get remember me preference
   */
  async getRememberMe(): Promise<boolean> {
    const remember = await this.getItem('auth_remember_me')
    return remember === 'true'
  }

  /**
   * Set login redirect path
   */
  async setLoginRedirect(path: string): Promise<void> {
    await this.setItem('auth_redirect', path, 60) // Expire in 1 hour
  }

  /**
   * Get login redirect path
   */
  async getLoginRedirect(): Promise<string | null> {
    return await this.getItem('auth_redirect')
  }

  /**
   * Clear all auth data
   */
  async clearAuthData(): Promise<void> {
    const authKeys = [
      'auth_tokens',
      'auth_user',
      'auth_remember_me',
      'auth_redirect',
    ]

    authKeys.forEach(key => this.removeItem(key))
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      this.storage.setItem(test, test)
      this.storage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage size in bytes (approximate)
   */
  getStorageSize(): number {
    let total = 0
    for (let key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        total += key.length + (this.storage[key]?.length || 0)
      }
    }
    return total
  }

  /**
   * Clean expired items
   */
  async cleanExpiredItems(): Promise<void> {
    const keys = Object.keys(this.storage)

    for (const key of keys) {
      try {
        const rawValue = this.storage.getItem(key)
        if (!rawValue) continue

        const item = JSON.parse(rawValue) as StorageItem<any>
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.removeItem(key)
        }
      } catch {
        // Skip items that aren't in our format
        continue
      }
    }
  }
}

/**
 * Cross-tab synchronization for auth state
 */
export class AuthStorageSync {
  private listeners: Map<string, ((value: string | null) => void)[]> = new Map()
  private storage: SecureAuthStorage

  constructor(storage: SecureAuthStorage) {
    this.storage = storage
    this.setupStorageListener()
  }

  /**
   * Setup storage event listener for cross-tab sync
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', event => {
      if (!event.key) return

      const listeners = this.listeners.get(event.key)
      if (listeners) {
        listeners.forEach(listener => listener(event.newValue))
      }
    })
  }

  /**
   * Subscribe to storage changes for a specific key
   */
  subscribe(key: string, callback: (value: string | null) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }

    this.listeners.get(key)!.push(callback)

    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
        if (listeners.length === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }

  /**
   * Broadcast auth state change to other tabs
   */
  broadcastAuthChange(type: 'login' | 'logout' | 'refresh'): void {
    const event = {
      type,
      timestamp: Date.now(),
    }

    localStorage.setItem('__auth_sync__', JSON.stringify(event))
    localStorage.removeItem('__auth_sync__')
  }
}

/**
 * Storage factory for different environments
 */
export class AuthStorageFactory {
  /**
   * Create storage instance based on environment and preferences
   */
  static createStorage(
    options: {
      useSessionStorage?: boolean
      enableEncryption?: boolean
      enableSync?: boolean
    } = {}
  ): {
    storage: SecureAuthStorage
    sync?: AuthStorageSync
  } {
    const storage = new SecureAuthStorage(
      options.useSessionStorage,
      options.enableEncryption
    )

    const result: { storage: SecureAuthStorage; sync?: AuthStorageSync } = {
      storage,
    }

    if (options.enableSync && typeof window !== 'undefined') {
      result.sync = new AuthStorageSync(storage)
    }

    return result
  }

  /**
   * Create memory-only storage for testing
   */
  static createMemoryStorage(): AuthStorage {
    const memory = new Map<string, string>()

    return {
      getItem: (key: string) => memory.get(key) || null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
      clear: () => {
        memory.clear()
      },
    }
  }
}

/**
 * Default storage instance
 */
export const authStorage = AuthStorageFactory.createStorage({
  useSessionStorage: false,
  enableEncryption: true,
  enableSync: true,
})

export default authStorage
