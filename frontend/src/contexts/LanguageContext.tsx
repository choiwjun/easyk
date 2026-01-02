"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../lib/i18n';

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('ko');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // localStorage 또는 브라우저 설정에서 언어 불러오기
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'ko' : 'ko';
    setLanguage(savedLang);
    i18n.changeLanguage(savedLang);
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    i18n.changeLanguage(lang);
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values during SSR
    return {
      language: 'ko',
      changeLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
};

