'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import DesignHeader from '@/components/ui/DesignHeader';
import DesignFooter from '@/components/ui/DesignFooter';

interface Consultation {
  id: string;
  user_id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    nationality: string;
  };
  consultation_type: string;
  content: string;
  consultation_method: string;
  amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, { ko: string; en: string }> = {
  requested: { ko: '요청됨', en: 'Requested' },
  matched: { ko: '매칭됨', en: 'Matched' },
  scheduled: { ko: '예약됨', en: 'Scheduled' },
  completed: { ko: '완료', en: 'Completed' },
  cancelled: { ko: '취소됨', en: 'Cancelled' },
};

const CONSULTATION_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  visa: { ko: '비자', en: 'Visa' },
  work_permit: { ko: '취업 허가', en: 'Work Permit' },
  residence: { ko: '거주', en: 'Residence' },
  tax: { ko: '세금', en: 'Tax' },
  legal: { ko: '법률', en: 'Legal' },
  other: { ko: '기타', en: 'Other' },
};

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAuthorized = useRoleGuard(['consultant', 'admin']);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async (status?: string) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const statusParam = status && status !== 'all' ? `?status=${status}` : '';
      const response = await fetch(`/api/consultations/incoming${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      } else if (response.status === 403) {
        router.push('/login');
      } else {
        setError(language === 'ko' ? '상담 목록을 불러오는데 실패했습니다' : 'Failed to load consultations');
      }
    } catch {
      setError(language === 'ko' ? '네트워크 오류가 발생했습니다' : 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (consultationId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/consultations/${consultationId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(language === 'ko' ? '상담 요청을 수락했습니다' : 'Consultation request accepted');
        fetchConsultations(statusFilter);
      } else {
        const errorData = await response.json();
        alert(errorData.message || (language === 'ko' ? '상담 수락에 실패했습니다' : 'Failed to accept consultation'));
      }
    } catch {
      alert(language === 'ko' ? '네트워크 오류가 발생했습니다' : 'Network error occurred');
    }
  };

  const handleReject = async (consultationId: string) => {
    if (!confirm(language === 'ko' ? '정말 이 상담 요청을 거절하시겠습니까?' : 'Are you sure you want to reject this consultation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/consultations/${consultationId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(language === 'ko' ? '상담 요청을 거절했습니다' : 'Consultation request rejected');
        fetchConsultations(statusFilter);
      } else {
        const errorData = await response.json();
        alert(errorData.message || (language === 'ko' ? '상담 거절에 실패했습니다' : 'Failed to reject consultation'));
      }
    } catch {
      alert(language === 'ko' ? '네트워크 오류가 발생했습니다' : 'Network error occurred');
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchConsultations(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilteredConsultations = () => {
    if (statusFilter === 'all') {
      return consultations;
    }
    return consultations.filter((c) => c.status === statusFilter);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // 통계 계산
  const stats = {
    total: consultations.length,
    matched: consultations.filter(c => c.status === 'matched').length,
    scheduled: consultations.filter(c => c.status === 'scheduled').length,
    completed: consultations.filter(c => c.status === 'completed').length,
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">
          {language === 'ko' ? '로딩 중...' : 'Loading...'}
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
              {language === 'ko' ? `오늘은 ${today}입니다.` : `Today is ${today}.`}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {language === 'ko' ? (
                <>전문가 <span className="text-primary">대시보드</span> ⚖️</>
              ) : (
                <>Consultant <span className="text-primary">Dashboard</span> ⚖️</>
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              {language === 'ko'
                ? '상담 요청을 관리하고 의뢰인과 소통하세요.'
                : 'Manage consultation requests and communicate with clients.'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              {language === 'ko' ? '프로필 관리' : 'Profile'}
            </button>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 전체 상담 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-card-border dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                {language === 'ko' ? '전체 상담' : 'Total Consultations'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
                <span className="text-lg font-normal text-gray-400 ml-1">
                  {language === 'ko' ? '건' : ''}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">gavel</span>
            </div>
          </div>

          {/* 매칭 대기 */}
          <div
            onClick={() => handleStatusFilter('matched')}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-card-border dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-yellow-500/50 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                {language === 'ko' ? '승인 대기' : 'Pending Approval'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.matched}
                <span className="text-lg font-normal text-gray-400 ml-1">
                  {language === 'ko' ? '건' : ''}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>

          {/* 예약됨 */}
          <div
            onClick={() => handleStatusFilter('scheduled')}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-card-border dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                {language === 'ko' ? '예약된 상담' : 'Scheduled'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.scheduled}
                <span className="text-lg font-normal text-gray-400 ml-1">
                  {language === 'ko' ? '건' : ''}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">event</span>
            </div>
          </div>

          {/* 완료 */}
          <div
            onClick={() => handleStatusFilter('completed')}
            className="bg-primary text-white rounded-xl p-5 border border-primary shadow-sm flex flex-col justify-between relative overflow-hidden cursor-pointer"
          >
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium mb-1">
                {language === 'ko' ? '완료된 상담' : 'Completed'}
              </p>
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-sm mt-2 font-medium bg-white/20 w-fit px-2 py-0.5 rounded text-white">
                {language === 'ko' ? '누적 실적' : 'Total achievements'}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-white/10">
              <span className="material-symbols-outlined text-[100px]">verified</span>
            </div>
          </div>
        </section>

        {/* 상태 필터 */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-4 shadow-sm">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: { ko: '전체', en: 'All' } },
              { key: 'matched', label: { ko: '승인 대기', en: 'Pending' } },
              { key: 'scheduled', label: { ko: '예약됨', en: 'Scheduled' } },
              { key: 'completed', label: { ko: '완료', en: 'Completed' } },
              { key: 'cancelled', label: { ko: '취소됨', en: 'Cancelled' } },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleStatusFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter.label[language]} ({filter.key === 'all' ? stats.total : consultations.filter(c => c.status === filter.key).length})
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 상담 요청 목록 */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {language === 'ko' ? '상담 요청 목록' : 'Consultation Requests'}
            </h3>
          </div>

          {getFilteredConsultations().length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-gray-400">inbox</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ko' ? '표시할 상담 요청이 없습니다.' : 'No consultation requests to display.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {getFilteredConsultations().map((consultation) => (
                <div
                  key={consultation.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* 상담 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {consultation.user.first_name} {consultation.user.last_name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {consultation.user.nationality} • {consultation.user.email}
                          </p>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(consultation.status)}`}>
                          {STATUS_LABELS[consultation.status]?.[language] || consultation.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">category</span>
                          {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language] || consultation.consultation_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">chat</span>
                          {consultation.consultation_method}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">calendar_today</span>
                          {formatDate(consultation.created_at)}
                        </span>
                      </div>

                      {/* 상담 내용 미리보기 */}
                      <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg mb-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {consultation.content}
                        </p>
                      </div>
                    </div>

                    {/* 금액 및 버튼 */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {consultation.amount.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {consultation.payment_status === 'paid'
                            ? (language === 'ko' ? '결제 완료' : 'Paid')
                            : (language === 'ko' ? '결제 대기' : 'Pending Payment')}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/consultations/${consultation.id}`)}
                          className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          {language === 'ko' ? '상세 보기' : 'View Details'}
                        </button>
                        {consultation.status === 'matched' && (
                          <>
                            <button
                              onClick={() => handleAccept(consultation.id)}
                              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                            >
                              {language === 'ko' ? '수락' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleReject(consultation.id)}
                              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              {language === 'ko' ? '거절' : 'Reject'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => router.push('/consultants')}
            className="group bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">badge</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'ko' ? '내 프로필' : 'My Profile'}
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ko'
                ? '전문 분야, 경력, 상담료 등 프로필 정보를 관리하세요.'
                : 'Manage your profile including expertise, experience, and consultation fees.'}
            </p>
          </div>

          <div
            onClick={() => router.push('/consultations/my')}
            className="group bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-6 hover:shadow-lg hover:border-green-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">history</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'ko' ? '상담 이력' : 'Consultation History'}
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ko'
                ? '완료된 상담 기록과 의뢰인 피드백을 확인하세요.'
                : 'View completed consultations and client feedback.'}
            </p>
          </div>

          <div
            onClick={() => router.push('/profile')}
            className="group bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-6 hover:shadow-lg hover:border-orange-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">settings</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'ko' ? '설정' : 'Settings'}
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ko'
                ? '알림 설정, 계정 정보 등을 관리하세요.'
                : 'Manage notifications, account settings, and more.'}
            </p>
          </div>
        </section>
      </main>

      <DesignFooter />
    </div>
  );
}
