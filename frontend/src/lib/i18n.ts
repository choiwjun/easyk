import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from '../../public/locales/ko.json';
import en from '../../public/locales/en.json';

const resources = {
  ko: {
    translation: ko,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // 기본 언어: 한국어
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false, // React 이미 XSS 방지 처리
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

