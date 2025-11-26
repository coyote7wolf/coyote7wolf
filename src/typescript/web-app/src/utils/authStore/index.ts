/**
 * Authentication Store Entry Point
 *
 * This module provides the main entry point for the authentication system.
 * It switches between different implementations based on the environment.
 */

import { isMockData } from '@/config/environment'

// Import implementations
import { SimpleAuthStore } from './simple'
import { ApiAuthStore } from './api'

// Export types
export * from './types'

// Choose implementation based on environment
function createAuthStore() {
  if (isMockData) {
    console.log('🎭 Using Simple Auth Store (mock data)')
    return new SimpleAuthStore()
  } else {
    console.log('🔗 Using API Auth Store (with real API)')
    return new ApiAuthStore()
  }
}

const authStore = createAuthStore()

export { authStore }
export default authStore
