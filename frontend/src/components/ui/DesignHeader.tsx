"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export default function DesignHeader() {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link className="flex items-center gap-2 group" href="/">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-text-primary dark:text-white group-hover:text-primary transition-colors">
            easyK
          </span>
        </Link>

        {/* 데스크탑 네비게이션 */}
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

          {/* 로그인/로그아웃 버튼 - 데스크탑 */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-text-primary dark:text-white">
                  {user?.first_name} {user?.last_name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center justify-center h-9 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary dark:text-white text-[14px] font-bold transition-all active:scale-95"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-[14px] font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="메뉴"
          >
            <span className="material-symbols-outlined text-[24px] text-text-primary dark:text-white">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <nav className="flex flex-col p-4 gap-1">
            <Link
              href="/consultations"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold text-text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">gavel</span>
              {t('nav.consultations')}
            </Link>
            <Link
              href="/jobs"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold text-text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-purple-600">work</span>
              {t('nav.jobs')}
            </Link>
            <Link
              href="/supports"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold text-text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-green-600">payments</span>
              {t('nav.supports')}
            </Link>

            {/* 구분선 */}
            <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

            {/* 언어 전환 - 모바일 */}
            <button
              onClick={() => {
                toggleLanguage();
                closeMobileMenu();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">language</span>
              {language === 'ko' ? 'English' : '한국어'}
            </button>

            {/* 로그인/로그아웃 - 모바일 */}
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold text-text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-orange-600">person</span>
                  {user?.first_name} {user?.last_name}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 mx-4 mt-2 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-[15px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
