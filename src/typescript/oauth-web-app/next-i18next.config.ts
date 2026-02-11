const config = {
  debug: false,
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
};

export const i18n = config;

export default config;
