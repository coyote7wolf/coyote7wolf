/**
 * i18n 多語言系統
 * 支援12種語言的國際化管理
 */

import { useState, useEffect } from 'react'

export type SupportedLanguage =
  | 'en' // English
  | 'zh-TW' // Traditional Chinese
  | 'zh-CN' // Simplified Chinese
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'pt' // Portuguese
  | 'ru' // Russian
  | 'ar' // Arabic
  | 'hi' // Hindi

export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  locale: string
}

export interface TranslationValues {
  [key: string]: string | number | boolean | null | undefined
}

export interface Translations {
  [namespace: string]: {
    [key: string]: string | Translations
  }
}

// 語言配置
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    locale: 'en-US',
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    direction: 'ltr',
    locale: 'zh-TW',
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    direction: 'ltr',
    locale: 'zh-CN',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    locale: 'ja-JP',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    locale: 'ko-KR',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    locale: 'es-ES',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    locale: 'fr-FR',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    locale: 'de-DE',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    locale: 'pt-BR',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    locale: 'ru-RU',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    locale: 'ar-SA',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    locale: 'hi-IN',
  },
}

// Mock 翻譯資料
const MOCK_TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello {{name}}',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember me',
      signInWith: 'Sign in with {{provider}}',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
    },
    navigation: {
      home: 'Home',
      dashboard: 'Dashboard',
      documents: 'Documents',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
    },
    documents: {
      title: 'Documents',
      createNew: 'Create New Document',
      myDocuments: 'My Documents',
      sharedWithMe: 'Shared with Me',
      recentlyViewed: 'Recently Viewed',
      untitled: 'Untitled Document',
    },
    dashboard: {
      title: 'Dashboard',
      welcome:
        "Welcome back! Here's an overview of your collaborative workspace.",
      myDocuments: 'My Documents',
      documentsCreated: 'documents created',
      viewAllDocuments: 'View All Documents',
      activeCollaborations: 'Active Collaborations',
      ongoingProjects: 'ongoing projects',
      viewCollaborations: 'View Collaborations',
      recentActivity: 'Recent Activity',
      actionsThisWeek: 'actions this week',
      viewActivity: 'View Activity',
      accountSettings: 'Account Settings',
      setupComplete: 'Setup',
      customizeProfile: 'customize your profile',
      manageSettings: 'Manage Settings',
      role: 'Role',
      premium: 'Premium',
      quickActions: 'Quick Actions',
      createDocument: 'Create Document',
      inviteCollaborator: 'Invite Collaborator',
      viewAnalytics: 'View Analytics',
      settings: 'Settings',
      documentCreated: 'Document created',
      justNow: 'Just now',
      collaboratorInvited: 'Collaborator invited',
      twoHoursAgo: '2 hours ago',
      profileUpdated: 'Profile updated',
      yesterday: 'Yesterday',
      viewAllActivity: 'View All Activity',
      welcomeTitle: 'Welcome to SyncCoreAI!',
      welcomeMessage:
        "You're all set up and ready to start collaborating. Create your first document or explore our features to get the most out of your experience.",
      createFirstDocument: 'Create First Document',
      takeTour: 'Take a Tour',
    },
  },
  'zh-TW': {
    common: {
      welcome: '歡迎',
      hello: '你好 {{name}}',
      loading: '載入中...',
      error: '發生錯誤',
      success: '成功',
      cancel: '取消',
      confirm: '確認',
      save: '儲存',
      delete: '刪除',
      edit: '編輯',
      create: '建立',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '關閉',
    },
    auth: {
      login: '登入',
      register: '註冊',
      logout: '登出',
      email: '電子郵件',
      password: '密碼',
      confirmPassword: '確認密碼',
      forgotPassword: '忘記密碼？',
      rememberMe: '記住我',
      signInWith: '使用 {{provider}} 登入',
      alreadyHaveAccount: '已有帳號？',
      dontHaveAccount: '還沒有帳號？',
    },
    navigation: {
      home: '首頁',
      dashboard: '儀表板',
      documents: '文件',
      profile: '個人資料',
      settings: '設定',
      help: '說明',
    },
    documents: {
      title: '文件',
      createNew: '建立新文件',
      myDocuments: '我的文件',
      sharedWithMe: '與我分享',
      recentlyViewed: '最近檢視',
      untitled: '未命名文件',
    },
  },
  'zh-CN': {
    common: {
      welcome: '欢迎',
      hello: '你好 {{name}}',
      loading: '加载中...',
      error: '发生错误',
      success: '成功',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
    },
    auth: {
      login: '登录',
      register: '注册',
      logout: '登出',
      email: '电子邮件',
      password: '密码',
      confirmPassword: '确认密码',
      forgotPassword: '忘记密码？',
      rememberMe: '记住我',
      signInWith: '使用 {{provider}} 登录',
      alreadyHaveAccount: '已有账号？',
      dontHaveAccount: '还没有账号？',
    },
    navigation: {
      home: '首页',
      dashboard: '仪表板',
      documents: '文档',
      profile: '个人资料',
      settings: '设置',
      help: '帮助',
    },
    documents: {
      title: '文档',
      createNew: '创建新文档',
      myDocuments: '我的文档',
      sharedWithMe: '与我分享',
      recentlyViewed: '最近查看',
      untitled: '未命名文档',
    },
  },
  ja: {
    common: {
      welcome: 'ようこそ',
      hello: 'こんにちは {{name}}',
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      success: '成功',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      create: '作成',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      close: '閉じる',
    },
    auth: {
      login: 'ログイン',
      register: '登録',
      logout: 'ログアウト',
      email: 'メールアドレス',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      forgotPassword: 'パスワードを忘れましたか？',
      rememberMe: 'ログイン状態を保持する',
      signInWith: '{{provider}}でサインイン',
      alreadyHaveAccount: 'アカウントをお持ちですか？',
      dontHaveAccount: 'アカウントをお持ちでない方',
    },
    navigation: {
      home: 'ホーム',
      dashboard: 'ダッシュボード',
      documents: 'ドキュメント',
      profile: 'プロフィール',
      settings: '設定',
      help: 'ヘルプ',
    },
    documents: {
      title: 'ドキュメント',
      createNew: '新しいドキュメントを作成',
      myDocuments: 'マイドキュメント',
      sharedWithMe: '共有されたドキュメント',
      recentlyViewed: '最近表示したもの',
      untitled: '無題のドキュメント',
    },
  },
  // 其他語言使用英文作為 fallback
  ko: {} as any,
  es: {} as any,
  fr: {} as any,
  de: {} as any,
  pt: {} as any,
  ru: {} as any,
  ar: {} as any,
  hi: {} as any,
}

class I18nManager {
  private currentLanguage: SupportedLanguage = 'zh-TW'
  private fallbackLanguage: SupportedLanguage = 'en'
  private translations: Record<SupportedLanguage, Translations> =
    MOCK_TRANSLATIONS

  constructor() {
    this.detectLanguage()
  }

  // 語言檢測
  private detectLanguage(): void {
    // 檢查是否在瀏覽器環境
    if (typeof window === 'undefined') {
      // SSR 環境，使用默認語言
      this.currentLanguage = 'en'
      return
    }

    // 1. 從 localStorage 檢查
    const savedLanguage = localStorage.getItem(
      'preferred-language'
    ) as SupportedLanguage
    if (savedLanguage && this.isValidLanguage(savedLanguage)) {
      this.currentLanguage = savedLanguage
      return
    }

    // 2. 從瀏覽器語言檢測
    const browserLanguage = navigator?.language?.toLowerCase() || 'en'
    for (const lang of Object.keys(LANGUAGE_CONFIGS) as SupportedLanguage[]) {
      if (browserLanguage.startsWith(lang.toLowerCase())) {
        this.currentLanguage = lang
        return
      }
    }

    // 3. 檢查繁體中文的特殊情況
    if (
      browserLanguage.includes('tw') ||
      browserLanguage.includes('hk') ||
      browserLanguage.includes('mo')
    ) {
      this.currentLanguage = 'zh-TW'
      return
    }

    // 4. 檢查簡體中文
    if (browserLanguage.startsWith('zh')) {
      this.currentLanguage = 'zh-CN'
      return
    }

    // 5. 預設使用繁體中文
    this.currentLanguage = 'zh-TW'
  }

  private isValidLanguage(lang: string): lang is SupportedLanguage {
    return Object.keys(LANGUAGE_CONFIGS).includes(lang)
  }

  // 設定語言
  async setLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isValidLanguage(language)) {
      throw new Error(`Unsupported language: ${language}`)
    }

    this.currentLanguage = language

    // 只在瀏覽器環境中使用 localStorage 和 document
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language)
      // 設定 HTML lang 屬性
      document.documentElement.lang = language
    }

    // 設定文字方向
    const config = LANGUAGE_CONFIGS[language]
    document.documentElement.dir = config.direction

    // 觸發語言變更事件
    window.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: { language, config },
      })
    )
  }

  // 獲取當前語言
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  // 獲取語言配置
  getLanguageConfig(language?: SupportedLanguage): LanguageConfig {
    return LANGUAGE_CONFIGS[language || this.currentLanguage]
  }

  // 獲取所有支援的語言
  getSupportedLanguages(): LanguageConfig[] {
    return Object.values(LANGUAGE_CONFIGS)
  }

  // 翻譯函數
  t(key: string, values?: TranslationValues): string {
    const translation =
      this.getTranslation(key, this.currentLanguage) ||
      this.getTranslation(key, this.fallbackLanguage) ||
      key

    return this.interpolate(translation, values)
  }

  private getTranslation(
    key: string,
    language: SupportedLanguage
  ): string | null {
    const keys = key.split('.')
    let current: any = this.translations[language]

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return null
      }
    }

    return typeof current === 'string' ? current : null
  }

  private interpolate(template: string, values?: TranslationValues): string {
    if (!values) return template

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = values[key]
      return value !== undefined ? String(value) : match
    })
  }

  // 複數形式處理
  plural(key: string, count: number, values?: TranslationValues): string {
    const pluralKey = this.getPluralKey(key, count, this.currentLanguage)
    return this.t(pluralKey, { ...values, count })
  }

  private getPluralKey(
    key: string,
    count: number,
    language: SupportedLanguage
  ): string {
    // 簡化的複數規則
    if (language === 'en') {
      return count === 1 ? `${key}.one` : `${key}.other`
    }

    // 中文、日文、韓文等不需要複數形式
    if (['zh-TW', 'zh-CN', 'ja', 'ko'].includes(language)) {
      return key
    }

    // 其他語言暫時使用英文規則
    return count === 1 ? `${key}.one` : `${key}.other`
  }

  // 日期格式化
  formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
    const config = this.getLanguageConfig()
    return new Intl.DateTimeFormat(config.locale, options).format(date)
  }

  // 數字格式化
  formatNumber(number: number, options: Intl.NumberFormatOptions = {}): string {
    const config = this.getLanguageConfig()
    return new Intl.NumberFormat(config.locale, options).format(number)
  }

  // 貨幣格式化
  formatCurrency(
    amount: number,
    currency: string,
    options: Intl.NumberFormatOptions = {}
  ): string {
    const config = this.getLanguageConfig()
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount)
  }

  // 百分比格式化
  formatPercent(value: number, options: Intl.NumberFormatOptions = {}): string {
    const config = this.getLanguageConfig()
    return new Intl.NumberFormat(config.locale, {
      style: 'percent',
      ...options,
    }).format(value)
  }

  // 相對時間格式化
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const config = this.getLanguageConfig()
    const rtf = new Intl.RelativeTimeFormat(config.locale, { numeric: 'auto' })
    return rtf.format(value, unit)
  }

  // 檢查是否為 RTL 語言
  isRTL(language?: SupportedLanguage): boolean {
    const config = this.getLanguageConfig(language)
    return config.direction === 'rtl'
  }

  // 載入額外的翻譯
  async loadTranslations(
    language: SupportedLanguage,
    translations: Translations
  ): Promise<void> {
    if (!this.translations[language]) {
      this.translations[language] = {}
    }

    // 深度合併翻譯
    this.translations[language] = this.deepMerge(
      this.translations[language],
      translations
    )
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }
}

// 全域實例
export const i18nManager = new I18nManager()

// React Hook
export const useTranslation = () => {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const handleLanguageChange = () => forceUpdate({})
    window.addEventListener('languageChanged', handleLanguageChange)
    return () =>
      window.removeEventListener('languageChanged', handleLanguageChange)
  }, [])

  return {
    t: i18nManager.t.bind(i18nManager),
    language: i18nManager.getCurrentLanguage(),
    setLanguage: i18nManager.setLanguage.bind(i18nManager),
    isRTL: i18nManager.isRTL(),
    formatDate: i18nManager.formatDate.bind(i18nManager),
    formatNumber: i18nManager.formatNumber.bind(i18nManager),
    formatCurrency: i18nManager.formatCurrency.bind(i18nManager),
    formatPercent: i18nManager.formatPercent.bind(i18nManager),
    plural: i18nManager.plural.bind(i18nManager),
  }
}

export default i18nManager
