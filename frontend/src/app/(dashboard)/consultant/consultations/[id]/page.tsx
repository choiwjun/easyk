'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConsultantGuard } from '@/hooks/useRoleGuard';

interface Consultation {
  id: string;
  user_id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    nationality: string;
    visa_type?: string;
    preferred_language?: string;
    location?: string;
  };
  consultation_type: string;
  title?: string;
  content: string;
  consultation_method: string;
  amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  scheduled_at?: string;
  attachments?: { name: string; size: string; type: string }[];
}

// 샘플 상담 상세 데이터
const SAMPLE_CONSULTATION: Consultation = {
  id: 'sample-1',
  user_id: 'user-1',
  user: {
    first_name: 'Nguyen',
    last_name: 'Van Minh',
    email: 'nguyen.minh@email.com',
    nationality: 'Vietnam',
    visa_type: 'E-9 (비전문취업)',
    preferred_language: '한국어, 베트남어',
    location: '경기도 안산시',
  },
  consultation_type: 'labor',
  title: '3개월간 공장에서 근무했으나 임금을 받지 못했습니다.',
  content: `안녕하세요. 저는 경기도 안산의 한 제조 공장에서 지난 7월부터 근무하고 있는 베트남 국적의 근로자입니다. 근로계약서는 작성하였으나, 사본을 받지는 못했습니다.

사장님께서는 회사 사정이 어렵다며 첫 달 월급은 50%만 지급하셨고, 그 이후 8월과 9월 급여는 아직 한 번도 받지 못한 상태입니다. 생활비가 부족하여 매우 힘든 상황입니다. 사장님께 여러 번 요청드렸지만 '조금만 기다려달라'는 말만 반복하고 계십니다.

비자 문제 때문에 신고하는 것이 두려워 망설이고 있었지만, 더 이상 기다릴 수 없어 상담을 요청합니다. 제가 밀린 임금을 받을 수 있는 방법이 있을까요? 도와주세요.`,
  consultation_method: 'video',
  amount: 50000,
  status: 'matched',
  payment_status: 'completed',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  attachments: [
    { name: '통장_입출금내역.pdf', size: '2.4 MB', type: 'pdf' },
    { name: '근무_현장_사진.jpg', size: '4.1 MB', type: 'image' },
  ],
};

const CONSULTATION_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  visa: { ko: '비자/체류', en: 'Visa/Stay' },
  labor: { ko: '임금 체불', en: 'Wage Theft' },
  real_estate: { ko: '부동산/임대차', en: 'Real Estate' },
  tax: { ko: '세금', en: 'Tax' },
  legal: { ko: '법률', en: 'Legal' },
  other: { ko: '기타', en: 'Other' },
};

const STATUS_LABELS: Record<string, { ko: string; en: string }> = {
  requested: { ko: '요청됨', en: 'Requested' },
  matched: { ko: '검토 대기', en: 'Pending Review' },
  scheduled: { ko: '예약됨', en: 'Scheduled' },
  completed: { ko: '완료', en: 'Completed' },
  cancelled: { ko: '취소됨', en: 'Cancelled' },
};

export default function ConsultantConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const isAuthorized = useConsultantGuard();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [remainingTime, setRemainingTime] = useState('4시간 30분');

  useEffect(() => {
    fetchConsultation();
  }, [params.id]);

  const fetchConsultation = async () => {
    try {
      const consultationId = params.id as string;

      // 샘플 ID인 경우 샘플 데이터 사용
      if (consultationId.startsWith('sample-')) {
        setConsultation({ ...SAMPLE_CONSULTATION, id: consultationId });
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setConsultation({ ...SAMPLE_CONSULTATION, id: consultationId });
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/consultations/${consultationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultation(data);
      } else {
        // 에러 시 샘플 데이터 사용
        setConsultation({ ...SAMPLE_CONSULTATION, id: consultationId });
      }
    } catch {
      setConsultation({ ...SAMPLE_CONSULTATION, id: params.id as string });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!consultation) return;

    try {
      // 샘플 ID인 경우 UI만 업데이트
      if (consultation.id.startsWith('sample-')) {
        alert(language === 'ko' ? '상담 요청을 수락했습니다. 채팅방으로 이동합니다.' : 'Consultation accepted. Moving to chat room.');
        router.push(`/consultant/consultations/${consultation.id}/chat`);
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/consultations/${consultation.id}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(language === 'ko' ? '상담 요청을 수락했습니다.' : 'Consultation accepted.');
        router.push(`/consultant/consultations/${consultation.id}/chat`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || (language === 'ko' ? '상담 수락에 실패했습니다.' : 'Failed to accept consultation.'));
      }
    } catch {
      alert(language === 'ko' ? '네트워크 오류가 발생했습니다.' : 'Network error occurred.');
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Share handler
  const handleShare = async () => {
    const shareData = {
      title: language === 'ko' ? '상담 요청 공유' : 'Consultation Request',
      text: consultation ? `${language === 'ko' ? '상담 요청' : 'Consultation'}: ${consultation.title || consultation.consultation_type}` : '',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert(language === 'ko' ? '링크가 클립보드에 복사되었습니다.' : 'Link copied to clipboard.');
      }
    } catch {
      // User cancelled or error
    }
  };

  // Notification handler
  const handleNotifications = () => {
    router.push('/consultant/dashboard?tab=requests');
  };

  // Settings handler
  const handleSettings = () => {
    router.push('/consultant/dashboard?tab=profile');
  };

  const handleReject = async () => {
    if (!consultation) return;

    try {
      // 샘플 ID인 경우 UI만 업데이트
      if (consultation.id.startsWith('sample-')) {
        alert(language === 'ko' ? '상담 요청을 거절했습니다. 의뢰인에게 거절 사유가 전달됩니다.' : 'Consultation rejected. The reason will be sent to the client.');
        setShowRejectModal(false);
        router.push('/consultant/dashboard');
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/consultations/${consultation.id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (response.ok) {
        alert(language === 'ko' ? '상담 요청을 거절했습니다.' : 'Consultation rejected.');
        setShowRejectModal(false);
        router.push('/consultant/dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.message || (language === 'ko' ? '상담 거절에 실패했습니다.' : 'Failed to reject consultation.'));
      }
    } catch {
      alert(language === 'ko' ? '네트워크 오류가 발생했습니다.' : 'Network error occurred.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '.');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visa':
        return 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300';
      case 'labor':
        return 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300';
      case 'real_estate':
        return 'bg-orange-50 text-orange-700 ring-orange-700/10 dark:bg-orange-900/30 dark:text-orange-300';
      case 'tax':
        return 'bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-700/10 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">
          {language === 'ko' ? '로딩 중...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">
          {language === 'ko' ? '상담을 찾을 수 없습니다.' : 'Consultation not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/consultant/dashboard" className="flex items-center gap-2 text-primary dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">easyK Expert</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/consultant/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white">
              {language === 'ko' ? '대시보드' : 'Dashboard'}
            </Link>
            <span className="text-sm font-bold text-primary dark:text-white">
              {language === 'ko' ? '상담 요청 관리' : 'Consultation Requests'}
            </span>
            <Link href="/consultant/dashboard?tab=cases" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white">
              {language === 'ko' ? '내 사건' : 'My Cases'}
            </Link>
            <Link href="/consultant/dashboard?tab=community" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white">
              {language === 'ko' ? '커뮤니티' : 'Community'}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={handleNotifications}
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              title={language === 'ko' ? '알림' : 'Notifications'}
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button
              onClick={handleSettings}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              title={language === 'ko' ? '설정' : 'Settings'}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-primary/20 flex items-center justify-center text-primary font-bold">
              K
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/consultant/dashboard" className="hover:text-primary dark:hover:text-white transition-colors">
            {language === 'ko' ? '홈' : 'Home'}
          </Link>
          <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
          <Link href="/consultant/dashboard" className="hover:text-primary dark:hover:text-white transition-colors">
            {language === 'ko' ? '상담 요청 목록' : 'Consultation Requests'}
          </Link>
          <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {language === 'ko' ? '상담 상세' : 'Consultation Detail'}
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {language === 'ko' ? '상담 요청 상세' : 'Consultation Request Detail'}
              </h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(consultation.status)}`}>
                {STATUS_LABELS[consultation.status]?.[language as 'ko' | 'en'] || consultation.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-display">
              {language === 'ko' ? '요청 번호' : 'Request No'}: <span className="font-mono text-slate-700 dark:text-slate-300">#{consultation.id.toUpperCase()}</span> • {language === 'ko' ? '접수일' : 'Submitted'}: {formatDate(consultation.created_at)} • {language === 'ko' ? '남은 검토 시간' : 'Review time left'}: <span className="text-red-600 dark:text-red-400 font-medium">{remainingTime}</span>
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
              {language === 'ko' ? '인쇄' : 'Print'}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              {language === 'ko' ? '공유' : 'Share'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Description Card */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-700 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'ko' ? '상담 내용' : 'Consultation Content'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {language === 'ko' ? '의뢰인이 작성한 상담 신청 내용입니다.' : 'Content submitted by the client.'}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getTypeColor(consultation.consultation_type)}`}>
                  {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language as 'ko' | 'en'] || consultation.consultation_type}
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {language === 'ko' ? '제목' : 'Title'}
                  </label>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                    {consultation.title || consultation.content.substring(0, 50) + '...'}
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {language === 'ko' ? '문제 내용' : 'Problem Description'}
                  </label>
                  <div className="rounded-lg bg-slate-50 p-5 text-base leading-relaxed text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-100 dark:border-slate-700 whitespace-pre-line break-words">
                    {consultation.content}
                  </div>
                </div>
              </div>
            </section>

            {/* Attachments Card */}
            {consultation.attachments && consultation.attachments.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {language === 'ko' ? '첨부 파일' : 'Attachments'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {consultation.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded ${
                          file.type === 'pdf'
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          <span className="material-symbols-outlined">
                            {file.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{file.size}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-white">
                        <span className="material-symbols-outlined">download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-6">
            {/* Client Info Card */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'ko' ? '의뢰인 정보' : 'Client Information'}
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[24px]">person</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {consultation.user.first_name.charAt(0)}**** ({language === 'ko' ? '익명' : 'Anonymous'})
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'ko' ? '신원 확인 완료' : 'Identity Verified'}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-green-500" title="Verified User">verified</span>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 col-span-1">
                      {language === 'ko' ? '국적' : 'Nationality'}
                    </span>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {consultation.user.nationality === 'Vietnam' ? '베트남 (Vietnam)' : consultation.user.nationality}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 col-span-1">
                      {language === 'ko' ? '비자 유형' : 'Visa Type'}
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white col-span-2">
                      {consultation.user.visa_type || 'E-9 (비전문취업)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 col-span-1">
                      {language === 'ko' ? '희망 언어' : 'Preferred Language'}
                    </span>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {(consultation.user.preferred_language || '한국어, 베트남어').split(', ').map((lang, idx) => (
                        <span key={idx} className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 col-span-1">
                      {language === 'ko' ? '거주 지역' : 'Location'}
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white col-span-2">
                      {consultation.user.location || '경기도 안산시'}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button className="w-full text-center text-sm font-medium text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300">
                    {language === 'ko' ? '이전 상담 이력 보기 (0건)' : 'View Previous Consultations (0)'}
                  </button>
                </div>
              </div>
            </section>

            {/* Action Panel */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sticky top-24">
              {(consultation.status === 'scheduled' || consultation.status === 'in_progress') ? (
                <>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    {language === 'ko' ? '상담 진행' : 'Consultation in Progress'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {language === 'ko'
                      ? '상담이 진행 중입니다. 채팅방에서 의뢰인과 소통하세요.'
                      : 'Consultation is in progress. Communicate with the client in the chat room.'}
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/consultant/consultations/${consultation.id}/chat`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                      {language === 'ko' ? '채팅방 입장' : 'Enter Chat Room'}
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    {language === 'ko' ? '검토 결정' : 'Review Decision'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {language === 'ko'
                      ? '이 사건을 수임하시겠습니까? 수락 시 의뢰인과 채팅방이 개설됩니다.'
                      : 'Would you like to accept this case? A chat room will be created upon acceptance.'}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleAccept}
                      className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                    >
                      {language === 'ko' ? '상담 수락' : 'Accept Consultation'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      {language === 'ko' ? '상담 거절' : 'Reject Consultation'}
                    </button>
                    <button className="mt-2 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      {language === 'ko' ? '나중에 다시 검토 (보류)' : 'Review Later (Hold)'}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">© 2024 easyK. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              {language === 'ko' ? '이용약관' : 'Terms'}
            </Link>
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              {language === 'ko' ? '개인정보처리방침' : 'Privacy'}
            </Link>
            <Link href="/support" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              {language === 'ko' ? '고객센터' : 'Support'}
            </Link>
          </div>
        </div>
      </footer>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/50 transition-opacity" onClick={() => setShowRejectModal(false)}></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-slate-800">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-slate-800">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900/20">
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">
                        {language === 'ko' ? '상담 거절 사유 입력' : 'Enter Rejection Reason'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          {language === 'ko'
                            ? '거절 사유를 입력하시면 의뢰인에게 전달됩니다.'
                            : 'The rejection reason will be sent to the client.'}
                        </p>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-700 dark:text-white dark:ring-slate-600"
                          placeholder={language === 'ko'
                            ? '거절 사유를 입력해주세요 (예: 전문 분야 불일치, 일정상 곤란 등)'
                            : 'Enter rejection reason (e.g., specialty mismatch, schedule conflict)'}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-slate-900/50">
                  <button
                    type="button"
                    onClick={handleReject}
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  >
                    {language === 'ko' ? '거절 확정' : 'Confirm Rejection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto dark:bg-slate-700 dark:text-white dark:ring-slate-600 dark:hover:bg-slate-600"
                  >
                    {language === 'ko' ? '취소' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
