"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DesignHeader from '@/components/ui/DesignHeader';
import DesignFooter from '@/components/ui/DesignFooter';
import ChatButton from '@/components/ui/ChatButton';
import Button from '@/components/ui/Button';

export default function Home() {
  const { t } = useLanguage();
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  // 역할별로 다른 페이지로 이동
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const roleRoutes: Record<string, string> = {
        foreign: '/jobs',
        consultant: '/consultations',
        admin: '/admin/jobs',
        agency: '/agency',
      };

      const route = roleRoutes[user.role];
      if (route) {
        router.replace(route);
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-secondary">{t('common.loading')}</div>
      </div>
    );
  }

  // 비로그인 사용자: 디자인 적용된 랜딩 페이지
  if (!isAuthenticated) {
    return (
      <div className="relative flex flex-col min-h-screen w-full bg-background-light dark:bg-background-dark">
        <DesignHeader />

        <main className="flex-grow w-full max-w-[1080px] mx-auto px-5 py-8 flex flex-col gap-12">
          {/* Hero 섹션 */}
          <section className="w-full">
            <div className="relative overflow-hidden rounded-3xl bg-surface-light dark:bg-surface-dark shadow-soft min-h-[420px] md:min-h-[500px] flex items-center">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10"></div>
                <div className="w-full h-full bg-cover bg-center transition-transform duration-[10s] hover:scale-105" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBwni8_1Xzq8e2noqDIgguP7Z_TLuiBUi7KE0HNOGjUVuDWgFnWdG2uBthC8xSxLTdigRMJ21KcgYja37fQrzDomRt0iAeldHhp0_l-45uFKTsRk9KPfBiunoC7Ux4I4X1Pe_mNQV3nIfavWcIsWlgV3OsN6KekYApHDL0zeui2ki2yiN3gnp3dvaxli6rR4Pp4Xjta6O8WNSHawXAAv7pNlmBVlTN3MsW18x2H2_2fVbQocnfKuT_arcJqax0tPuw7BvorRj4EEc0A)' }}>
                </div>
              </div>
              <div className="relative z-20 px-8 md:px-12 lg:px-16 py-10 max-w-2xl flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 w-fit">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-white text-xs font-bold tracking-wide">
                    {t('home.hero.badge')}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.2] tracking-tight drop-shadow-sm">
                  {t('home.hero.title')}<br className="hidden md:block" /> {t('home.hero.titleSuffix')}
                </h1>
                <p className="text-lg text-white/90 font-medium leading-relaxed max-w-lg drop-shadow-sm">
                  {t('home.hero.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    onClick={() => router.push('/signup')}
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-[15px] shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {t('home.hero.getStarted')}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-[15px] transition-all flex items-center justify-center"
                  >
                    {t('home.hero.guide')}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* 신청 현황 섹션 */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
                {t('home.dashboard.myApplications')}
              </h2>
              <a className="text-primary text-sm font-bold hover:underline flex items-center gap-1" href="#">
                {t('home.dashboard.goToDashboard')}
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 법률 상담 카드 */}
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-soft hover:shadow-soft-hover transition-all cursor-pointer group border border-transparent hover:border-primary/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">gavel</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">
                    {t('home.dashboard.consultationMatched')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">
                  {t('home.dashboard.wageConsultation')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  {t('home.dashboard.lawyer')}
                  <span className="text-primary font-bold">김철수</span>
                </p>
              </div>

              {/* 일자리 지원 카드 */}
              <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-soft hover:shadow-soft-hover transition-all cursor-pointer group border border-transparent hover:border-primary/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">work</span>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-md">
                    {t('home.dashboard.consultationPending')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">
                  {t('home.dashboard.jobApplication')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  {t('home.dashboard.company')}
                  (주)대한정밀
                </p>
              </div>

              {/* 새 신청하기 카드 */}
              <div className="bg-gradient-to-br from-primary to-[#16447a] p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all cursor-pointer text-white flex flex-col justify-between group">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-white/20 rounded-xl text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined">add_circle</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {t('home.dashboard.newApplication')}
                  </h3>
                  <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                    {t('home.dashboard.newApplicationDesc')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 서비스 섹션 */}
          <section className="w-full py-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 px-1">
              <div>
                <h2 className="text-[28px] md:text-[32px] font-extrabold text-text-primary dark:text-white leading-tight mb-2">
                  {t('home.services.title')}<br />{t('home.services.titleSuffix')}
                </h2>
                <p className="text-text-muted dark:text-gray-400 text-[16px]">
                  {t('home.services.subtitle')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* 법률 상담 */}
              <a
                className="group flex flex-col p-5 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 h-full"
                href="/consultations"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6] dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-[28px] text-[#333d4b] dark:text-white group-hover:text-primary transition-colors">
                    balance
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">
                  {t('home.services.legalConsultation')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400 leading-snug">
                  {t('home.services.legalConsultationDesc')}
                </p>
              </a>

              {/* 일자리 매칭 */}
              <a
                className="group flex flex-col p-5 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 h-full"
                href="/jobs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6] dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-[28px] text-[#333d4b] dark:text-white group-hover:text-primary transition-colors">
                    work_outline
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">
                  {t('home.services.jobMatching')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400 leading-snug">
                  {t('home.services.jobMatchingDesc')}
                </p>
              </a>

              {/* 정부 지원 */}
              <a
                className="group flex flex-col p-5 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 h-full"
                href="/supports"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6] dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-[28px] text-[#333d4b] dark:text-white group-hover:text-primary transition-colors">
                    assured_workload
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">
                  {t('home.services.govSupport')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400 leading-snug">
                  {t('home.services.govSupportDesc')}
                </p>
              </a>
            </div>
          </section>

          {/* 생활 가이드 섹션 */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
                {t('home.lifeGuide.title')}
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
                <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-5 px-5 scrollbar-hide snap-x">
              {/* 가이드 카드 1 */}
              <div className="min-w-[280px] md:min-w-[320px] snap-center group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjnUX_MuMziJgNQnV-KxCwvFSIQDGg7eS9kNjYIR4pLGDKity5r4RxqlUYJG3yAgdajaaLCMoYEUSwENRSkceY8ZtdBeAkKAjFVVi-iS7uCAtGZvMjijjtLbV4Ry--w3Vj4iiDHLgMwM1X12Ti-bp_hGebw_Kq1OUnwaL72FcUYmZdwjb_rnXWkLtAvNT9azO5O2a-3bUpTs8dy0tA58FXVbBapxY2Nzc6apmx47fPreCTGyWW3qa_VjShuzZZCLsQl1bTn95omUyY"
                    alt={t('home.lifeGuide.laborLaw')}
                  />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                  {t('home.lifeGuide.laborLaw')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  {t('home.lifeGuide.laborLawDesc')}
                </p>
              </div>

              {/* 가이드 카드 2 */}
              <div className="min-w-[280px] md:min-w-[320px] snap-center group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOw0w29xhNI2qsSyabGxv_rXejGshR5651SnrF0LUBO6wjY2pz1Ia7LIuOW3bd5APYSct55gMHM4WnZ8N0j6mQ0nlO-wZmxCgXiJ9asLuXgnSu6iWl_6NqgfRa94tcvo96Bc4jFDF8r4AkjJH49zvDBK4SG7uPq-9MGMtzRrEGGvgpVN3NX0ZhNA13iLMWyM8tu9JxuJaOH7CWMwXyKLZEfUkscqhj9-27PmQWJ5wN_cxHYwufgajfperj16eeO1rvWIdEnW9sTqFd"
                    alt={t('home.lifeGuide.visaGuide')}
                  />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                  {t('home.lifeGuide.visaGuide')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  {t('home.lifeGuide.visaGuideDesc')}
                </p>
              </div>

              {/* 가이드 카드 3 */}
              <div className="min-w-[280px] md:min-w-[320px] snap-center group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlbrcyJ6vIZDe5RztvptSi-DPvfnxfKP-tI1EVffe8agNrzolb9_hp9om3JUkvb4LxH8ovJENv_xjVOQGnX_FI4hfeLlr1QDqzmg-D1H0BK4eZ93CZVZjmmP1PkfH0vkom50dVTaC5aLb81RFw0-8r4qEUGfEzpGf0-vy6Zz9BnmNsrzHi0hphzlIFl6flcdyGU5jERxiZgbRY2wamSMWsz51EZtzNio-6ior-wAF3woMMoqg-zlS08QiVnhCxPSryhWR7_r9wh-Ub"
                    alt={t('home.lifeGuide.familySupport')}
                  />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                  {t('home.lifeGuide.familySupport')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  {t('home.lifeGuide.familySupportDesc')}
                </p>
              </div>

              {/* 가이드 카드 4 */}
              <div className="min-w-[280px] md:min-w-[320px] snap-center group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC-L0JMyfWIVRTPkBo41iTY3_fItUR9h0g14G-UxxO8Exw28bRBQoVLq_Jq2CRblQ4-RCrb9aWLKQbR3GXo3VukOoMVDBqZj5uOf4joP71Z9bCi7sLIUy-_CVXkrvOrnaIJQZsAemz6lCmvc4qiwr-J4YU_L2-juUNbIiq8nyNLZ7rK9ebWof9T8scPLc8k_hTCXcjdiU1vzZa-YOEKpFWsvkqJYIdLW8ludlBz5kWl1cqhcGJP4hYXi40QWx4xi_H0wCEtVePyPEm"
                    alt={t('home.lifeGuide.healthInsurance')}
                  />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                  {t('home.lifeGuide.healthInsurance')}
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400">
                  {t('home.lifeGuide.healthInsuranceDesc')}
                </p>
              </div>
            </div>
          </section>
        </main>

        <DesignFooter />
        <ChatButton />
      </div>
    );
  }

  // 로그인 사용자: 대시보드 메인 페이지 (기존 디자인 유지)
  return (
    <div className="min-h-screen bg-background-light">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('home.dashboard_logged.welcome')}
            </h1>
            <p className="text-gray-600">
              {t('home.dashboard_logged.subtitle')}
            </p>
          </div>

          {/* 빠른 접근 카드 */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <a
              href="/consultations"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">⚖️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('home.dashboard_logged.consultationCard')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('home.dashboard_logged.consultationCardDesc')}
                  </p>
                </div>
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {t('home.dashboard_logged.consultationStart')}
              </div>
            </a>

            <a
              href="/jobs"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">💼</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('home.dashboard_logged.jobCard')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('home.dashboard_logged.jobCardDesc')}
                  </p>
                </div>
              </div>
              <div className="text-sm text-green-600 font-medium">
                {t('home.dashboard_logged.jobStart')}
              </div>
            </a>

            <a
              href="/supports"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">🏛️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('home.dashboard_logged.supportCard')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('home.dashboard_logged.supportCardDesc')}
                  </p>
                </div>
              </div>
              <div className="text-sm text-purple-600 font-medium">
                {t('home.dashboard_logged.supportStart')}
              </div>
            </a>
          </div>

          {/* 추가 정보 섹션 */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t('home.dashboard_logged.recentActivity')}
              </h3>
              <p className="text-gray-600">
                {t('home.dashboard_logged.recentActivityDesc')}
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                {t('home.dashboard_logged.noActivity')}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t('home.dashboard_logged.profile')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('home.dashboard_logged.profileDesc')}
              </p>
              <a
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                {t('home.dashboard_logged.editProfile')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
