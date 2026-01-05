"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DesignFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 py-10">
      <div className="max-w-[1080px] mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* 로고 및 설명 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">flight_takeoff</span>
              <span className="text-lg font-bold text-text-primary dark:text-white">easyK</span>
            </div>
            <p className="text-sm text-text-muted dark:text-gray-500 max-w-xs">
              {t('home.hero.description')}
            </p>
          </div>

          {/* 서비스 및 회사 링크 */}
          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="text-sm font-bold text-text-primary dark:text-white mb-3">
                {t('nav.home')}
              </h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                    href="/consultations"
                  >
                    {t('nav.consultations')}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                    href="/jobs"
                  >
                    {t('nav.jobs')}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                    href="/supports"
                  >
                    {t('nav.supports')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-text-primary dark:text-white mb-3">
                {t('common.about')}
              </h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                    href="#"
                  >
                    {t('common.company')}
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                    href="#"
                  >
                    {t('common.contact')}
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                    href="#"
                  >
                    {t('common.privacy')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 저작권 및 소셜 미디어 */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs text-text-muted dark:text-gray-500">
          <p>© 2024 easyK Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
