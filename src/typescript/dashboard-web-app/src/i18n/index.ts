import { createI18n } from 'vue-i18n'

// Import locale messages
import en from './locales/en.json'
import zhTW from './locales/zh-TW.json'
import zhCN from './locales/zh-CN.json'

const messages = {
  en,
  'zh-TW': zhTW,
  'zh-CN': zhCN
}

// Get locale from localStorage or browser
const getLocale = (): string => {
  const stored = localStorage.getItem('synccoreai_locale')
  if (stored && messages[stored as keyof typeof messages]) {
    return stored
  }
  
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) {
    return browserLang.includes('TW') || browserLang.includes('HK') ? 'zh-TW' : 'zh-CN'
  }
  
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

export default i18n