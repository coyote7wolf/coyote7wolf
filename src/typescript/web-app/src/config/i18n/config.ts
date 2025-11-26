/**
 * Internationalization (i18n) Configuration
 *
 * Provides centralized multi-language support with namespace organization,
 * dynamic language switching, and localization utilities.
 */

import { CONFIG, isProduction, isDevelopment } from '@/config/environment'

/**
 * Supported Languages Configuration
 */
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  ZH_TW: 'zh-TW',
  ZH_CN: 'zh-CN',
  JA: 'ja',
  KO: 'ko',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  PT: 'pt',
  RU: 'ru',
  AR: 'ar',
  HI: 'hi',
} as const

export type SupportedLanguage =
  (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES]

/**
 * Language Display Information
 */
export const LANGUAGE_INFO: Record<
  SupportedLanguage,
  {
    name: string
    nativeName: string
    flag: string
    direction: 'ltr' | 'rtl'
    region: string
  }
> = {
  [SUPPORTED_LANGUAGES.EN]: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    region: 'US',
  },
  [SUPPORTED_LANGUAGES.ZH_TW]: {
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    direction: 'ltr',
    region: 'TW',
  },
  [SUPPORTED_LANGUAGES.ZH_CN]: {
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    flag: '🇨🇳',
    direction: 'ltr',
    region: 'CN',
  },
  [SUPPORTED_LANGUAGES.JA]: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    region: 'JP',
  },
  [SUPPORTED_LANGUAGES.KO]: {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    region: 'KR',
  },
  [SUPPORTED_LANGUAGES.ES]: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    region: 'ES',
  },
  [SUPPORTED_LANGUAGES.FR]: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    region: 'FR',
  },
  [SUPPORTED_LANGUAGES.DE]: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    region: 'DE',
  },
  [SUPPORTED_LANGUAGES.PT]: {
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    direction: 'ltr',
    region: 'PT',
  },
  [SUPPORTED_LANGUAGES.RU]: {
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    region: 'RU',
  },
  [SUPPORTED_LANGUAGES.AR]: {
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    region: 'SA',
  },
  [SUPPORTED_LANGUAGES.HI]: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'IN',
  },
}

/**
 * Default Language Configuration
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = SUPPORTED_LANGUAGES.EN
export const FALLBACK_LANGUAGE: SupportedLanguage = SUPPORTED_LANGUAGES.EN

/**
 * Storage Keys for Language Preferences
 */
export const I18N_STORAGE_KEYS = {
  CURRENT_LANGUAGE: 'synccoreai_current_language',
  USER_PREFERENCES: 'synccoreai_i18n_preferences',
  CACHE_VERSION: 'synccoreai_i18n_cache_version',
} as const

/**
 * Translation Namespaces
 */
export const TRANSLATION_NAMESPACES = {
  COMMON: 'common',
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
  DOCUMENT: 'document',
  EDITOR: 'editor',
  COLLABORATION: 'collaboration',
  AI: 'ai',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  ERRORS: 'errors',
  VALIDATION: 'validation',
  ADMIN: 'admin',
  ONBOARDING: 'onboarding',
  BILLING: 'billing',
  INTEGRATIONS: 'integrations',
} as const

export type TranslationNamespace =
  (typeof TRANSLATION_NAMESPACES)[keyof typeof TRANSLATION_NAMESPACES]

/**
 * Language Detection Configuration
 */
export const LANGUAGE_DETECTION_CONFIG = {
  // Order of detection priority
  detectionOrder: [
    'localStorage',
    'navigator',
    'htmlTag',
    'path',
    'subdomain',
    'querystring',
    'cookie',
  ],

  // Fallback options
  fallbackLng: [FALLBACK_LANGUAGE],

  // Browser language detection
  checkWhitelist: true,

  // Local storage detection
  localStorageKey: I18N_STORAGE_KEYS.CURRENT_LANGUAGE,

  // Cookie detection
  cookieName: 'synccoreai_language',
  cookieOptions: {
    path: '/',
    sameSite: 'strict' as const,
    secure: isProduction,
    maxAge: 365 * 24 * 60 * 60, // 1 year
  },

  // Query parameter detection
  queryLookups: ['lng', 'lang', 'language'],

  // Path detection
  lookupFromPathIndex: 0,

  // Subdomain detection
  lookupFromSubdomainIndex: 0,
} as const

/**
 * Translation Loading Configuration
 */
export const TRANSLATION_CONFIG = {
  // Resource loading
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  addPath: '/locales/add/{{lng}}/{{ns}}',

  // Namespace configuration
  ns: Object.values(TRANSLATION_NAMESPACES),
  defaultNS: TRANSLATION_NAMESPACES.COMMON,
  fallbackNS: TRANSLATION_NAMESPACES.COMMON,

  // Interpolation
  interpolation: {
    escapeValue: false, // React already escapes
    format: (value: unknown, format?: string): string => {
      if (format === 'uppercase') return String(value).toUpperCase()
      if (format === 'lowercase') return String(value).toLowerCase()
      if (format === 'capitalize') {
        const str = String(value)
        return str.charAt(0).toUpperCase() + str.slice(1)
      }
      return String(value)
    },
  },

  // Loading behavior
  preload: [DEFAULT_LANGUAGE, FALLBACK_LANGUAGE],
  cleanCode: true,

  // Development
  debug: isDevelopment,

  // React specific
  react: {
    useSuspense: true,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
  },

  // Backend loading
  backend: {
    loadPath: '/api/locales/{{lng}}/{{ns}}',
    addPath: '/api/locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
    crossDomain: false,
    withCredentials: false,
    requestOptions: {
      mode: 'cors' as RequestMode,
      credentials: 'same-origin' as RequestCredentials,
      cache: 'default' as RequestCache,
    },
  },

  // Caching
  cache: {
    enabled: isProduction,
    prefix: 'i18next_res_',
    expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    versions: {},
  },
} as const

/**
 * Date and Time Formatting
 */
export const DATE_TIME_FORMATS: Record<
  SupportedLanguage,
  {
    dateFormat: string
    timeFormat: string
    dateTimeFormat: string
    shortDateFormat: string
    longDateFormat: string
    relativeTimeFormat: Intl.RelativeTimeFormatOptions
  }
> = {
  [SUPPORTED_LANGUAGES.EN]: {
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    dateTimeFormat: 'MM/dd/yyyy h:mm a',
    shortDateFormat: 'M/d/yy',
    longDateFormat: 'EEEE, MMMM do, yyyy',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.ZH_TW]: {
    dateFormat: 'yyyy/MM/dd',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'yyyy/MM/dd HH:mm',
    shortDateFormat: 'yy/M/d',
    longDateFormat: 'yyyy年MM月dd日 EEEE',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.ZH_CN]: {
    dateFormat: 'yyyy/MM/dd',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'yyyy/MM/dd HH:mm',
    shortDateFormat: 'yy/M/d',
    longDateFormat: 'yyyy年MM月dd日 EEEE',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.JA]: {
    dateFormat: 'yyyy/MM/dd',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'yyyy/MM/dd HH:mm',
    shortDateFormat: 'yy/M/d',
    longDateFormat: 'yyyy年MM月dd日（EEEE）',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.KO]: {
    dateFormat: 'yyyy. MM. dd.',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'yyyy. MM. dd. HH:mm',
    shortDateFormat: 'yy. M. d.',
    longDateFormat: 'yyyy년 MM월 dd일 EEEE',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.ES]: {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    shortDateFormat: 'd/M/yy',
    longDateFormat: "EEEE, d 'de' MMMM 'de' yyyy",
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.FR]: {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    shortDateFormat: 'd/M/yy',
    longDateFormat: 'EEEE d MMMM yyyy',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.DE]: {
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd.MM.yyyy HH:mm',
    shortDateFormat: 'd.M.yy',
    longDateFormat: 'EEEE, d. MMMM yyyy',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.PT]: {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    shortDateFormat: 'd/M/yy',
    longDateFormat: "EEEE, d 'de' MMMM 'de' yyyy",
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.RU]: {
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd.MM.yyyy HH:mm',
    shortDateFormat: 'd.M.yy',
    longDateFormat: 'EEEE, d MMMM yyyy г.',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.AR]: {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    shortDateFormat: 'd/M/yy',
    longDateFormat: 'EEEE، d MMMM yyyy',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
  [SUPPORTED_LANGUAGES.HI]: {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    shortDateFormat: 'd/M/yy',
    longDateFormat: 'EEEE, d MMMM yyyy',
    relativeTimeFormat: { numeric: 'auto', style: 'long' },
  },
}

/**
 * Number and Currency Formatting
 */
export const NUMBER_FORMATS: Record<
  SupportedLanguage,
  {
    locale: string
    decimal: string
    thousands: string
    currency: string
    currencyFormat: Intl.NumberFormatOptions
  }
> = {
  [SUPPORTED_LANGUAGES.EN]: {
    locale: 'en-US',
    decimal: '.',
    thousands: ',',
    currency: 'USD',
    currencyFormat: { style: 'currency', currency: 'USD' },
  },
  [SUPPORTED_LANGUAGES.ZH_TW]: {
    locale: 'zh-TW',
    decimal: '.',
    thousands: ',',
    currency: 'TWD',
    currencyFormat: { style: 'currency', currency: 'TWD' },
  },
  [SUPPORTED_LANGUAGES.ZH_CN]: {
    locale: 'zh-CN',
    decimal: '.',
    thousands: ',',
    currency: 'CNY',
    currencyFormat: { style: 'currency', currency: 'CNY' },
  },
  [SUPPORTED_LANGUAGES.JA]: {
    locale: 'ja-JP',
    decimal: '.',
    thousands: ',',
    currency: 'JPY',
    currencyFormat: { style: 'currency', currency: 'JPY' },
  },
  [SUPPORTED_LANGUAGES.KO]: {
    locale: 'ko-KR',
    decimal: '.',
    thousands: ',',
    currency: 'KRW',
    currencyFormat: { style: 'currency', currency: 'KRW' },
  },
  [SUPPORTED_LANGUAGES.ES]: {
    locale: 'es-ES',
    decimal: ',',
    thousands: '.',
    currency: 'EUR',
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  [SUPPORTED_LANGUAGES.FR]: {
    locale: 'fr-FR',
    decimal: ',',
    thousands: ' ',
    currency: 'EUR',
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  [SUPPORTED_LANGUAGES.DE]: {
    locale: 'de-DE',
    decimal: ',',
    thousands: '.',
    currency: 'EUR',
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  [SUPPORTED_LANGUAGES.PT]: {
    locale: 'pt-PT',
    decimal: ',',
    thousands: '.',
    currency: 'EUR',
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  [SUPPORTED_LANGUAGES.RU]: {
    locale: 'ru-RU',
    decimal: ',',
    thousands: ' ',
    currency: 'RUB',
    currencyFormat: { style: 'currency', currency: 'RUB' },
  },
  [SUPPORTED_LANGUAGES.AR]: {
    locale: 'ar-SA',
    decimal: '.',
    thousands: ',',
    currency: 'SAR',
    currencyFormat: { style: 'currency', currency: 'SAR' },
  },
  [SUPPORTED_LANGUAGES.HI]: {
    locale: 'hi-IN',
    decimal: '.',
    thousands: ',',
    currency: 'INR',
    currencyFormat: { style: 'currency', currency: 'INR' },
  },
}

/**
 * Pluralization Rules
 */
export const PLURALIZATION_RULES: Record<
  SupportedLanguage,
  (count: number) => string
> = {
  [SUPPORTED_LANGUAGES.EN]: (count: number) => (count === 1 ? 'one' : 'other'),
  [SUPPORTED_LANGUAGES.ZH_TW]: () => 'other',
  [SUPPORTED_LANGUAGES.ZH_CN]: () => 'other',
  [SUPPORTED_LANGUAGES.JA]: () => 'other',
  [SUPPORTED_LANGUAGES.KO]: () => 'other',
  [SUPPORTED_LANGUAGES.ES]: (count: number) => (count === 1 ? 'one' : 'other'),
  [SUPPORTED_LANGUAGES.FR]: (count: number) =>
    count === 0 || count === 1 ? 'one' : 'other',
  [SUPPORTED_LANGUAGES.DE]: (count: number) => (count === 1 ? 'one' : 'other'),
  [SUPPORTED_LANGUAGES.PT]: (count: number) => (count === 1 ? 'one' : 'other'),
  [SUPPORTED_LANGUAGES.RU]: (count: number) => {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'one'
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
      return 'few'
    return 'many'
  },
  [SUPPORTED_LANGUAGES.AR]: (count: number) => {
    if (count === 0) return 'zero'
    if (count === 1) return 'one'
    if (count === 2) return 'two'
    if (count >= 3 && count <= 10) return 'few'
    if (count >= 11 && count <= 99) return 'many'
    return 'other'
  },
  [SUPPORTED_LANGUAGES.HI]: (count: number) => (count === 1 ? 'one' : 'other'),
}

/**
 * I18n Configuration Export
 */
export const I18N_CONFIG = {
  supportedLanguages: SUPPORTED_LANGUAGES,
  languageInfo: LANGUAGE_INFO,
  defaultLanguage: DEFAULT_LANGUAGE,
  fallbackLanguage: FALLBACK_LANGUAGE,
  storageKeys: I18N_STORAGE_KEYS,
  namespaces: TRANSLATION_NAMESPACES,
  detection: LANGUAGE_DETECTION_CONFIG,
  translation: TRANSLATION_CONFIG,
  dateTimeFormats: DATE_TIME_FORMATS,
  numberFormats: NUMBER_FORMATS,
  pluralizationRules: PLURALIZATION_RULES,
} as const

export default I18N_CONFIG
