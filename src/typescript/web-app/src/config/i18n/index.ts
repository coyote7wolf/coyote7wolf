/**
 * i18n (Internationalization) System
 *
 * Centralized multi-language support with namespace organization,
 * dynamic language switching, and localization utilities.
 */

export * from './config'
export * from './utils'

// Re-export main utilities for convenience
export { i18nUtils as default } from './utils'
