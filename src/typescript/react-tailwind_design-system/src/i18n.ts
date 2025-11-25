import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      Jan: 'Jan',
      Feb: 'Feb',
      Mar: 'Mar',
      Apr: 'Apr',
      May: 'May',
      Apple: 'Apple',
      Banana: 'Banana',
      Orange: 'Orange',
    },
  },
  zh: {
    translation: {},
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
