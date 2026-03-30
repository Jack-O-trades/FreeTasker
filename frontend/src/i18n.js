import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTran from './locales/en.json';
import hiTran from './locales/hi.json';
import teTran from './locales/te.json';

const resources = {
  en: { translation: enTran },
  hi: { translation: hiTran },
  te: { translation: teTran }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
