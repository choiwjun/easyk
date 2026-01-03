"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();

  // 로그인한 사용자는 일자리 페이지로 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/jobs');
    }
  }, [router]);

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
