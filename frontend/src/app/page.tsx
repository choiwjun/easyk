"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';

export default function Home() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  // 비로그인 사용자: 랜딩 페이지
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold text-[#1E5BA0] mb-6">
            easyK
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            {t('home.title')}
          </p>
          <p className="text-lg text-gray-600 mb-12">
            {t('home.subtitle')}
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Button
              onClick={() => router.push('/signup')}
              className="bg-[#1E5BA0] hover:bg-[#1a4d8a] text-white px-8 py-3 text-lg"
            >
              {t('home.cta')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/login')}
              className="px-8 py-3 text-lg"
            >
              {t('auth.login')}
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/consultations" className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold mb-2 text-[#1E5BA0]">
                {t('home.features.consultations.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.consultations.description')}
              </p>
            </Link>

            <Link href="/jobs" className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2 text-[#1E5BA0]">
                {t('home.features.jobs.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.jobs.description')}
              </p>
            </Link>

            <Link href="/supports" className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold mb-2 text-[#1E5BA0]">
                {t('home.features.supports.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.supports.description')}
              </p>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 로그인 사용자: 대시보드 메인 페이지
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'ko' ? '안녕하세요!' : 'Welcome back!'}
            </h1>
            <p className="text-gray-600">
              {language === 'ko'
                ? 'easyK에서 편리한 정착 생활을 시작하세요.'
                : 'Start your settlement life with easyK.'}
            </p>
          </div>

          {/* 빠른 접근 카드 */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Link
              href="/consultations"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">⚖️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === 'ko' ? '법률 상담' : 'Legal Consultation'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ? '전문가와 상담하기' : 'Consult with experts'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {language === 'ko' ? '상담 시작하기 →' : 'Start consultation →'}
              </div>
            </Link>

            <Link
              href="/jobs"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">💼</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === 'ko' ? '일자리 찾기' : 'Find Jobs'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ? '지자체 채용 공고' : 'Local government jobs'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-green-600 font-medium">
                {language === 'ko' ? '일자리 찾기 →' : 'Find jobs →'}
              </div>
            </Link>

            <Link
              href="/supports"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">🏛️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === 'ko' ? '정부 지원' : 'Government Support'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ? '장려금, 교육, 훈련' : 'Subsidies, education, training'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-purple-600 font-medium">
                {language === 'ko' ? '지원 프로그램 보기 →' : 'View programs →'}
              </div>
            </Link>
          </div>

          {/* 추가 정보 섹션 */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'ko' ? '최근 활동' : 'Recent Activity'}
              </h3>
              <p className="text-gray-600">
                {language === 'ko'
                  ? '최근 활동 내역이 여기에 표시됩니다.'
                  : 'Your recent activities will be displayed here.'}
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                {language === 'ko' ? '아직 활동이 없습니다.' : 'No activities yet.'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'ko' ? '프로필' : 'Profile'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'ko'
                  ? '프로필 정보를 관리하세요.'
                  : 'Manage your profile information.'}
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {language === 'ko' ? '프로필 수정' : 'Edit Profile'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
