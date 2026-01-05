"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export default function DesignHeader() {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1080px] mx-auto px-5 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link className="flex items-center gap-2 group" href="/">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-text-primary dark:text-white group-hover:text-primary transition-colors">
            easyK
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            className="text-[15px] font-bold text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            href="/consultations"
          >
            {t('nav.consultations')}
          </Link>
          <Link
            className="text-[15px] font-bold text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            href="/jobs"
          >
            {t('nav.jobs')}
          </Link>
          <Link
            className="text-[15px] font-bold text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            href="/supports"
          >
            {t('nav.supports')}
          </Link>
        </nav>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-3">
          {/* 언어 전환 버튼 */}
          <button
            onClick={toggleLanguage}
            className="hidden sm:flex items-center justify-center h-9 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-300 text-[13px] font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('language.switch')}
          >
            <span className="material-symbols-outlined text-[16px] mr-1">language</span>
            {language === 'ko' ? t('language.english') : t('language.korean')}
          </button>

          {/* 로그인/로그아웃 버튼 */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* 사용자 이름 */}
              <span className="hidden md:block text-sm text-text-primary dark:text-white">
                {user?.first_name} {user?.last_name}
              </span>
              {/* 로그아웃 버튼 */}
              <button
                onClick={logout}
                className="flex items-center justify-center h-9 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary dark:text-white text-[14px] font-bold transition-all active:scale-95"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-[14px] font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
