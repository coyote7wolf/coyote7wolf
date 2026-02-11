/**
 * next-i18next Configuration
 *
 * Configures server-side internationalization
 * Prevents hydration mismatch by loading translations on server
 */

const config = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh-CN", "zh-TW", "ar"],
  },
  ns: ["common"],
  defaultNS: "common",
  backend: {
    loadPath: "./public/locales/{{lng}}/{{ns}}.json",
  },
  react: {
    useSuspense: false,
  },
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
};

export default config;
