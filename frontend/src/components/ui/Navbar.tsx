"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "./Button";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/jobs" className="flex items-center">
            <span className="text-2xl font-bold text-[#1E5BA0]">easyK</span>
          </Link>

          {/* 네비게이션 링크 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/jobs"
              className="text-gray-700 hover:text-[#1E5BA0] transition-colors"
            >
              💼 {t('nav.jobs') || '일자리'}
            </Link>
            <Link
              href="/consultations"
              className="text-gray-700 hover:text-[#1E5BA0] transition-colors"
            >
              ⚖️ {t('nav.consultations') || '법률 상담'}
            </Link>
            <Link
              href="/supports"
              className="text-gray-700 hover:text-[#1E5BA0] transition-colors"
            >
              🏛️ {t('nav.supports') || '정부 지원'}
            </Link>
          </div>

          {/* 우측 버튼 */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="px-4 py-2"
            >
              {t('auth.logout') || '로그아웃'}
            </Button>
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link
            href="/jobs"
            className="flex flex-col items-center text-gray-700 hover:text-[#1E5BA0] py-2"
          >
            <span className="text-xl">💼</span>
            <span className="text-xs mt-1">{t('nav.jobs') || '일자리'}</span>
          </Link>
          <Link
            href="/consultations"
            className="flex flex-col items-center text-gray-700 hover:text-[#1E5BA0] py-2"
          >
            <span className="text-xl">⚖️</span>
            <span className="text-xs mt-1">{t('nav.consultations') || '상담'}</span>
          </Link>
          <Link
            href="/supports"
            className="flex flex-col items-center text-gray-700 hover:text-[#1E5BA0] py-2"
          >
            <span className="text-xl">🏛️</span>
            <span className="text-xs mt-1">{t('nav.supports') || '지원'}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
