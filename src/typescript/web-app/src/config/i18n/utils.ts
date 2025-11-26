/**
 * i18n Utilities and Helper Functions
 *
 * Provides utility functions for language management, translation helpers,
 * and formatting functions for different locales.
 */

import {
  SupportedLanguage,
  I18N_CONFIG,
  LANGUAGE_INFO,
  DATE_TIME_FORMATS,
  NUMBER_FORMATS,
  PLURALIZATION_RULES,
  I18N_STORAGE_KEYS,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
} from './config'

/**
 * Language Detection and Management
 */
export const languageUtils = {
  /**
   * Detect user's preferred language from various sources
   */
  detectUserLanguage(): SupportedLanguage {
    // 1. Check localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(I18N_STORAGE_KEYS.CURRENT_LANGUAGE)
      if (stored && this.isValidLanguage(stored)) {
        return stored as SupportedLanguage
      }
    }

    // 2. Check browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language || (navigator as any).userLanguage
      const normalizedLang = this.normalizeBrowserLanguage(browserLang)
      if (normalizedLang && this.isValidLanguage(normalizedLang)) {
        return normalizedLang as SupportedLanguage
      }
    }

    // 3. Check HTML lang attribute
    if (typeof document !== 'undefined') {
      const htmlLang = document.documentElement.lang
      if (htmlLang && this.isValidLanguage(htmlLang)) {
        return htmlLang as SupportedLanguage
      }
    }

    // 4. Fallback to default
    return DEFAULT_LANGUAGE
  },

  /**
   * Normalize browser language to supported language code
   */
  normalizeBrowserLanguage(browserLang: string): string | null {
    const langMap: Record<string, SupportedLanguage> = {
      en: I18N_CONFIG.supportedLanguages.EN,
      'en-US': I18N_CONFIG.supportedLanguages.EN,
      'en-GB': I18N_CONFIG.supportedLanguages.EN,
      zh: I18N_CONFIG.supportedLanguages.ZH_CN,
      'zh-CN': I18N_CONFIG.supportedLanguages.ZH_CN,
      'zh-TW': I18N_CONFIG.supportedLanguages.ZH_TW,
      'zh-HK': I18N_CONFIG.supportedLanguages.ZH_TW,
      ja: I18N_CONFIG.supportedLanguages.JA,
      'ja-JP': I18N_CONFIG.supportedLanguages.JA,
      ko: I18N_CONFIG.supportedLanguages.KO,
      'ko-KR': I18N_CONFIG.supportedLanguages.KO,
      es: I18N_CONFIG.supportedLanguages.ES,
      'es-ES': I18N_CONFIG.supportedLanguages.ES,
      fr: I18N_CONFIG.supportedLanguages.FR,
      'fr-FR': I18N_CONFIG.supportedLanguages.FR,
      de: I18N_CONFIG.supportedLanguages.DE,
      'de-DE': I18N_CONFIG.supportedLanguages.DE,
      pt: I18N_CONFIG.supportedLanguages.PT,
      'pt-PT': I18N_CONFIG.supportedLanguages.PT,
      'pt-BR': I18N_CONFIG.supportedLanguages.PT,
      ru: I18N_CONFIG.supportedLanguages.RU,
      'ru-RU': I18N_CONFIG.supportedLanguages.RU,
      ar: I18N_CONFIG.supportedLanguages.AR,
      'ar-SA': I18N_CONFIG.supportedLanguages.AR,
      hi: I18N_CONFIG.supportedLanguages.HI,
      'hi-IN': I18N_CONFIG.supportedLanguages.HI,
    }

    const baseLang = browserLang.split('-')[0]
    return langMap[browserLang] || (baseLang ? langMap[baseLang] : null) || null
  },

  /**
   * Check if language code is supported
   */
  isValidLanguage(lang: string): boolean {
    return Object.values(I18N_CONFIG.supportedLanguages).includes(
      lang as SupportedLanguage
    )
  },

  /**
   * Get language display information
   */
  getLanguageInfo(lang: SupportedLanguage) {
    return LANGUAGE_INFO[lang]
  },

  /**
   * Get all available languages for selection
   */
  getAvailableLanguages() {
    return Object.entries(LANGUAGE_INFO).map(([code, info]) => ({
      code: code as SupportedLanguage,
      ...info,
    }))
  },

  /**
   * Save language preference
   */
  saveLanguagePreference(lang: SupportedLanguage): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(I18N_STORAGE_KEYS.CURRENT_LANGUAGE, lang)

      // Also save to cookie for SSR
      const cookieOptions = I18N_CONFIG.detection.cookieOptions
      const expires = new Date()
      expires.setTime(expires.getTime() + cookieOptions.maxAge * 1000)

      document.cookie = `${I18N_CONFIG.detection.cookieName}=${lang}; expires=${expires.toUTCString()}; path=${cookieOptions.path}; samesite=${cookieOptions.sameSite}${cookieOptions.secure ? '; secure' : ''}`
    }
  },

  /**
   * Get language direction (LTR/RTL)
   */
  getLanguageDirection(lang: SupportedLanguage): 'ltr' | 'rtl' {
    return LANGUAGE_INFO[lang].direction
  },

  /**
   * Check if language is RTL
   */
  isRTL(lang: SupportedLanguage): boolean {
    return this.getLanguageDirection(lang) === 'rtl'
  },
}

/**
 * Translation and Formatting Utilities
 */
export const translationUtils = {
  /**
   * Create translation key with namespace
   */
  createKey(namespace: string, key: string): string {
    return `${namespace}:${key}`
  },

  /**
   * Extract namespace from translation key
   */
  extractNamespace(key: string): string {
    const parts = key.split(':')
    return parts.length > 1 && parts[0]
      ? parts[0]
      : I18N_CONFIG.namespaces.COMMON
  },

  /**
   * Check if translation key exists in a specific namespace
   */
  hasKey(translations: Record<string, any>, key: string): boolean {
    const keys = key.split('.')
    let current = translations

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return false
      }
    }

    return true
  },

  /**
   * Get nested translation value
   */
  getNestedValue(obj: Record<string, any>, path: string): string | undefined {
    return path.split('.').reduce((current: any, key) => {
      return current && typeof current === 'object' ? current[key] : undefined
    }, obj)
  },

  /**
   * Interpolate variables in translation string
   */
  interpolate(
    template: string,
    variables: Record<string, unknown> = {}
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key]
      return value !== undefined ? String(value) : match
    })
  },

  /**
   * Handle pluralization
   */
  pluralize(
    lang: SupportedLanguage,
    count: number,
    translations: Record<string, string>
  ): string {
    const pluralRule = PLURALIZATION_RULES[lang](count)
    return (
      translations[pluralRule] || translations.other || translations.one || ''
    )
  },
}

/**
 * Date and Time Formatting Utilities
 */
export const dateTimeUtils = {
  /**
   * Format date according to language preferences
   */
  formatDate(
    date: Date,
    lang: SupportedLanguage,
    format?: 'short' | 'long' | 'default'
  ): string {
    const formats = DATE_TIME_FORMATS[lang]
    const numberFormat = NUMBER_FORMATS[lang]

    try {
      const options: Intl.DateTimeFormatOptions = {}

      switch (format) {
        case 'short':
          options.year = '2-digit'
          options.month = 'numeric'
          options.day = 'numeric'
          break
        case 'long':
          options.weekday = 'long'
          options.year = 'numeric'
          options.month = 'long'
          options.day = 'numeric'
          break
        default:
          options.year = 'numeric'
          options.month = '2-digit'
          options.day = '2-digit'
      }

      return new Intl.DateTimeFormat(numberFormat.locale, options).format(date)
    } catch (error) {
      // Fallback to basic formatting
      return date.toLocaleDateString()
    }
  },

  /**
   * Format time according to language preferences
   */
  formatTime(date: Date, lang: SupportedLanguage, format24h?: boolean): string {
    const numberFormat = NUMBER_FORMATS[lang]

    try {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !format24h && lang === I18N_CONFIG.supportedLanguages.EN,
      }

      return new Intl.DateTimeFormat(numberFormat.locale, options).format(date)
    } catch (error) {
      return date.toLocaleTimeString()
    }
  },

  /**
   * Format date and time together
   */
  formatDateTime(date: Date, lang: SupportedLanguage): string {
    const formattedDate = this.formatDate(date, lang)
    const formattedTime = this.formatTime(date, lang)
    return `${formattedDate} ${formattedTime}`
  },

  /**
   * Get relative time (e.g., "2 hours ago", "in 3 days")
   */
  getRelativeTime(
    date: Date,
    lang: SupportedLanguage,
    baseDate: Date = new Date()
  ): string {
    const numberFormat = NUMBER_FORMATS[lang]
    const diffInSeconds = Math.floor(
      (date.getTime() - baseDate.getTime()) / 1000
    )

    try {
      const rtf = new Intl.RelativeTimeFormat(
        numberFormat.locale,
        DATE_TIME_FORMATS[lang].relativeTimeFormat
      )

      const intervals = [
        { unit: 'year' as const, seconds: 31536000 },
        { unit: 'month' as const, seconds: 2592000 },
        { unit: 'day' as const, seconds: 86400 },
        { unit: 'hour' as const, seconds: 3600 },
        { unit: 'minute' as const, seconds: 60 },
        { unit: 'second' as const, seconds: 1 },
      ]

      for (const interval of intervals) {
        const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds)
        if (count >= 1) {
          return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit)
        }
      }

      return rtf.format(0, 'second')
    } catch (error) {
      // Fallback
      const absSeconds = Math.abs(diffInSeconds)
      const isPast = diffInSeconds < 0

      if (absSeconds < 60) return isPast ? 'just now' : 'in a moment'
      if (absSeconds < 3600) {
        const minutes = Math.floor(absSeconds / 60)
        return isPast ? `${minutes}m ago` : `in ${minutes}m`
      }
      if (absSeconds < 86400) {
        const hours = Math.floor(absSeconds / 3600)
        return isPast ? `${hours}h ago` : `in ${hours}h`
      }

      const days = Math.floor(absSeconds / 86400)
      return isPast ? `${days}d ago` : `in ${days}d`
    }
  },
}

/**
 * Number and Currency Formatting Utilities
 */
export const numberUtils = {
  /**
   * Format number according to language preferences
   */
  formatNumber(
    value: number,
    lang: SupportedLanguage,
    options?: Intl.NumberFormatOptions
  ): string {
    const numberFormat = NUMBER_FORMATS[lang]

    try {
      return new Intl.NumberFormat(numberFormat.locale, options).format(value)
    } catch (error) {
      return value.toString()
    }
  },

  /**
   * Format currency amount
   */
  formatCurrency(
    amount: number,
    lang: SupportedLanguage,
    currency?: string
  ): string {
    const numberFormat = NUMBER_FORMATS[lang]
    const currencyCode = currency || numberFormat.currency

    try {
      return new Intl.NumberFormat(numberFormat.locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount)
    } catch (error) {
      return `${currencyCode} ${amount.toFixed(2)}`
    }
  },

  /**
   * Format percentage
   */
  formatPercentage(
    value: number,
    lang: SupportedLanguage,
    decimals: number = 1
  ): string {
    const numberFormat = NUMBER_FORMATS[lang]

    try {
      return new Intl.NumberFormat(numberFormat.locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)
    } catch (error) {
      return `${(value * 100).toFixed(decimals)}%`
    }
  },

  /**
   * Format file size
   */
  formatFileSize(bytes: number, lang: SupportedLanguage): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    const formattedSize = this.formatNumber(size, lang, {
      minimumFractionDigits: 0,
      maximumFractionDigits: unitIndex === 0 ? 0 : 1,
    })

    return `${formattedSize} ${units[unitIndex]}`
  },
}

/**
 * Text Direction and Layout Utilities
 */
export const layoutUtils = {
  /**
   * Get CSS direction property value
   */
  getCSSDirection(lang: SupportedLanguage): 'ltr' | 'rtl' {
    return languageUtils.getLanguageDirection(lang)
  },

  /**
   * Get text alignment for language
   */
  getTextAlign(lang: SupportedLanguage): 'left' | 'right' {
    return languageUtils.isRTL(lang) ? 'right' : 'left'
  },

  /**
   * Get flex direction for language
   */
  getFlexDirection(
    lang: SupportedLanguage,
    reverse?: boolean
  ): 'row' | 'row-reverse' {
    const isRTL = languageUtils.isRTL(lang)
    const shouldReverse = reverse ? !isRTL : isRTL
    return shouldReverse ? 'row-reverse' : 'row'
  },

  /**
   * Get margin/padding properties adjusted for direction
   */
  getDirectionalSpacing(lang: SupportedLanguage) {
    const isRTL = languageUtils.isRTL(lang)

    return {
      marginStart: isRTL ? 'marginRight' : 'marginLeft',
      marginEnd: isRTL ? 'marginLeft' : 'marginRight',
      paddingStart: isRTL ? 'paddingRight' : 'paddingLeft',
      paddingEnd: isRTL ? 'paddingLeft' : 'paddingRight',
    }
  },
}

/**
 * Main i18n utilities export
 */
export const i18nUtils = {
  language: languageUtils,
  translation: translationUtils,
  dateTime: dateTimeUtils,
  number: numberUtils,
  layout: layoutUtils,
}

export default i18nUtils
