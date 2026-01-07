'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';

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
  scheduled_at?: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
}

const STATUS_LABELS: Record<string, { ko: string; en: string }> = {
  requested: { ko: '요청됨', en: 'Requested' },
  matched: { ko: '매칭됨', en: 'Matched' },
  scheduled: { ko: '예약됨', en: 'Scheduled' },
  completed: { ko: '완료', en: 'Completed' },
  cancelled: { ko: '취소됨', en: 'Cancelled' },
};

const CONSULTATION_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  visa: { ko: '비자/체류', en: 'Visa/Stay' },
  work_permit: { ko: '취업 허가', en: 'Work Permit' },
  residence: { ko: '거주', en: 'Residence' },
  tax: { ko: '세금', en: 'Tax' },
  legal: { ko: '법률', en: 'Legal' },
  labor: { ko: '노무/고용', en: 'Labor' },
  real_estate: { ko: '부동산/임대차', en: 'Real Estate' },
  other: { ko: '기타', en: 'Other' },
};

const NATIONALITY_FLAGS: Record<string, string> = {
  Vietnam: '🇻🇳',
  USA: '🇺🇸',
  China: '🇨🇳',
  Japan: '🇯🇵',
  Philippines: '🇵🇭',
  Indonesia: '🇮🇩',
  Thailand: '🇹🇭',
  Russia: '🇷🇺',
  Korea: '🇰🇷',
};

// 샘플 상담 요청 데이터
const SAMPLE_CONSULTATIONS: Consultation[] = [
  {
    id: 'sample-1',
    user_id: 'user-1',
    user: {
      first_name: 'Nguyen',
      last_name: 'Van Minh',
      email: 'nguyen.minh@email.com',
      nationality: 'Vietnam',
    },
    consultation_type: 'visa',
    content: 'E-9 비자 연장 절차와 필요 서류에 대해 상담 요청드립니다. 현재 체류 기간이 2개월 후 만료됩니다.',
    consultation_method: 'video',
    amount: 50000,
    status: 'matched',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-2',
    user_id: 'user-2',
    user: {
      first_name: 'Maria',
      last_name: 'Santos',
      email: 'maria.santos@email.com',
      nationality: 'Philippines',
    },
    consultation_type: 'labor',
    content: '임금 체불 문제로 상담 요청드립니다. 3개월째 급여를 받지 못하고 있으며 법적 대응 방법을 알고 싶습니다.',
    consultation_method: 'chat',
    amount: 30000,
    status: 'matched',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-3',
    user_id: 'user-3',
    user: {
      first_name: 'Zhang',
      last_name: 'Wei',
      email: 'zhang.wei@email.com',
      nationality: 'China',
    },
    consultation_type: 'real_estate',
    content: '전세 계약 만료 후 보증금 반환 문제가 발생했습니다. 집주인이 보증금 일부만 돌려주겠다고 합니다.',
    consultation_method: 'video',
    amount: 50000,
    status: 'matched',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-4',
    user_id: 'user-4',
    user: {
      first_name: 'Tanaka',
      last_name: 'Yuki',
      email: 'tanaka.yuki@email.com',
      nationality: 'Japan',
    },
    consultation_type: 'visa',
    content: 'F-2 비자(거주) 자격 변경 조건과 절차에 대해 알고 싶습니다. 현재 E-7 비자로 5년째 체류 중입니다.',
    consultation_method: 'phone',
    amount: 40000,
    status: 'scheduled',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-5',
    user_id: 'user-5',
    user: {
      first_name: 'Budi',
      last_name: 'Santoso',
      email: 'budi.santoso@email.com',
      nationality: 'Indonesia',
    },
    consultation_type: 'labor',
    content: '산업재해를 당했는데 회사에서 산재 처리를 거부하고 있습니다. 어떻게 해야 하나요?',
    consultation_method: 'video',
    amount: 50000,
    status: 'scheduled',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-6',
    user_id: 'user-6',
    user: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@email.com',
      nationality: 'USA',
    },
    consultation_type: 'tax',
    content: '한국에서 프리랜서로 일하고 있는데 세금 신고 방법과 공제 항목에 대해 알고 싶습니다.',
    consultation_method: 'chat',
    amount: 30000,
    status: 'completed',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-7',
    user_id: 'user-7',
    user: {
      first_name: 'Somchai',
      last_name: 'Prasert',
      email: 'somchai.p@email.com',
      nationality: 'Thailand',
    },
    consultation_type: 'visa',
    content: '결혼 비자(F-6) 신청 절차와 필요 서류에 대해 상담받고 싶습니다.',
    consultation_method: 'video',
    amount: 50000,
    status: 'completed',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAuthorized = useRoleGuard(['consultant', 'admin']);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isAvailable, setIsAvailable] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchConsultations();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch {
      // Silent fail for profile fetch
    }
  };

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        // 토큰이 없어도 샘플 데이터 표시
        setConsultations(SAMPLE_CONSULTATIONS);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/consultations/incoming', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // API 데이터가 비어있으면 샘플 데이터 사용
        if (data && data.length > 0) {
          setConsultations(data);
        } else {
          setConsultations(SAMPLE_CONSULTATIONS);
        }
      } else if (response.status === 403) {
        // 권한 없어도 샘플 데이터 표시
        setConsultations(SAMPLE_CONSULTATIONS);
      } else {
        // 오류 발생 시 샘플 데이터 사용
        setConsultations(SAMPLE_CONSULTATIONS);
      }
    } catch {
      // 네트워크 오류 시 샘플 데이터 사용
      setConsultations(SAMPLE_CONSULTATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (consultationId: string) => {
    try {
      // 샘플 ID인 경우 UI만 업데이트
      if (consultationId.startsWith('sample-')) {
        setConsultations(prev => prev.map(c =>
          c.id === consultationId ? { ...c, status: 'scheduled' } : c
        ));
        alert(language === 'ko' ? '상담 요청을 수락했습니다' : 'Consultation request accepted');
        return;
      }

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
        fetchConsultations();
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
      // 샘플 ID인 경우 UI만 업데이트
      if (consultationId.startsWith('sample-')) {
        setConsultations(prev => prev.filter(c => c.id !== consultationId));
        alert(language === 'ko' ? '상담 요청을 거절했습니다' : 'Consultation request rejected');
        return;
      }

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
        fetchConsultations();
      } else {
        const errorData = await response.json();
        alert(errorData.message || (language === 'ko' ? '상담 거절에 실패했습니다' : 'Failed to reject consultation'));
      }
    } catch {
      alert(language === 'ko' ? '네트워크 오류가 발생했습니다' : 'Network error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return language === 'ko' ? `${diffMins}분 전 요청` : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return language === 'ko' ? `${diffHours}시간 전 요청` : `${diffHours}h ago`;
    } else {
      return language === 'ko' ? `${diffDays}일 전 요청` : `${diffDays}d ago`;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visa':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      case 'labor':
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
      case 'real_estate':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
      case 'tax':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300';
    }
  };

  // 통계 계산
  const stats = {
    pending: consultations.filter(c => c.status === 'matched').length,
    todayScheduled: consultations.filter(c => {
      if (c.status !== 'scheduled') return false;
      const today = new Date().toDateString();
      const scheduledDate = c.scheduled_at ? new Date(c.scheduled_at).toDateString() : new Date(c.created_at).toDateString();
      return scheduledDate === today;
    }).length,
    avgRating: 4.8, // Mock data - would come from API
    completed: consultations.filter(c => c.status === 'completed').length,
  };

  // 새로운 상담 요청 (matched 상태)
  const newRequests = consultations.filter(c => c.status === 'matched');

  // 예정된 상담 (scheduled 상태)
  const scheduledConsultations = consultations.filter(c => c.status === 'scheduled');

  // 완료된 상담
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  // 검색 필터링
  const filteredNewRequests = searchQuery
    ? newRequests.filter(c =>
        `${c.user.first_name} ${c.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : newRequests;

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">
          {language === 'ko' ? '로딩 중...' : 'Loading...'}
        </div>
      </div>
    );
  }

  const consultantName = userProfile
    ? `${userProfile.last_name}${userProfile.first_name}`
    : language === 'ko' ? '전문가' : 'Consultant';

  const sidebarMenuItems = [
    { key: 'dashboard', icon: 'dashboard', label: { ko: '대시보드', en: 'Dashboard' }, badge: 0 },
    { key: 'requests', icon: 'notifications_active', label: { ko: '상담 요청', en: 'Requests' }, badge: newRequests.length },
    { key: 'schedule', icon: 'calendar_month', label: { ko: '일정 관리', en: 'Schedule' }, badge: 0 },
    { key: 'history', icon: 'history', label: { ko: '상담 내역', en: 'History' }, badge: 0 },
    { key: 'profile', icon: 'person', label: { ko: '프로필 관리', en: 'Profile' }, badge: 0 },
  ];

  return (
    <div className="flex min-h-screen w-full flex-row bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Side Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <Link href="/" className="text-primary text-xl font-extrabold leading-normal tracking-tight">
              easyK
            </Link>
            <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {language === 'ko' ? '전문가용' : 'Expert'}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
          {sidebarMenuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveMenu(item.key);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                activeMenu === item.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className={`text-sm ${activeMenu === item.key ? 'font-bold' : 'font-medium'}`}>
                {item.label[language as 'ko' | 'en']}
              </span>
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Profile Section in Mobile Sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                {consultantName.charAt(0)}
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 ${isAvailable ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-gray-800 rounded-full`}></span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {consultantName} {language === 'ko' ? '변호사' : ''}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isAvailable ? (language === 'ko' ? '온라인' : 'Online') : (language === 'ko' ? '오프라인' : 'Offline')}
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Side Navigation */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 fixed h-full z-20">
        <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-gray-700">
          <Link href="/" className="text-primary text-xl font-extrabold leading-normal tracking-tight">
            easyK
          </Link>
          <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {language === 'ko' ? '전문가용' : 'Expert'}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
          {sidebarMenuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveMenu(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                activeMenu === item.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className={`text-sm ${activeMenu === item.key ? 'font-bold' : 'font-medium'}`}>
                {item.label[language as 'ko' | 'en']}
              </span>
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Profile Section in Sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                {consultantName.charAt(0)}
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 ${isAvailable ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-gray-800 rounded-full`}></span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {consultantName} {language === 'ko' ? '변호사' : ''}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isAvailable ? (language === 'ko' ? '온라인' : 'Online') : (language === 'ko' ? '오프라인' : 'Offline')}
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-900 dark:text-white p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link href="/" className="text-primary text-lg font-bold">easyK</Link>
          </div>

          <div className="hidden lg:flex flex-col">
            <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
              {activeMenu === 'dashboard' && (language === 'ko' ? `안녕하세요, ${consultantName} 변호사님 👋` : `Hello, ${consultantName} 👋`)}
              {activeMenu === 'requests' && (language === 'ko' ? '상담 요청' : 'Consultation Requests')}
              {activeMenu === 'schedule' && (language === 'ko' ? '일정 관리' : 'Schedule Management')}
              {activeMenu === 'history' && (language === 'ko' ? '상담 내역' : 'Consultation History')}
              {activeMenu === 'profile' && (language === 'ko' ? '프로필 관리' : 'Profile Management')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeMenu === 'dashboard' && (language === 'ko' ? '오늘의 새로운 상담 요청을 확인해보세요.' : 'Check out today\'s new consultation requests.')}
              {activeMenu === 'requests' && (language === 'ko' ? '새로운 상담 요청을 관리하세요.' : 'Manage new consultation requests.')}
              {activeMenu === 'schedule' && (language === 'ko' ? '예정된 상담 일정을 확인하세요.' : 'Check your scheduled consultations.')}
              {activeMenu === 'history' && (language === 'ko' ? '완료된 상담 내역을 확인하세요.' : 'Review your completed consultations.')}
              {activeMenu === 'profile' && (language === 'ko' ? '프로필 정보를 수정하세요.' : 'Update your profile information.')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-64 p-2.5 pl-10 text-sm text-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-primary focus:border-primary dark:text-white dark:placeholder-gray-400 transition-all"
                placeholder={language === 'ko' ? '클라이언트 이름 검색...' : 'Search client name...'}
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              {newRequests.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveMenu('profile')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Dashboard View */}
          {activeMenu === 'dashboard' && (
            <>
              {/* Stats Section */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 대기 중인 요청 */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveMenu('requests')}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-primary dark:text-blue-400">
                        <span className="material-symbols-outlined">pending_actions</span>
                      </div>
                      {stats.pending > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          +{stats.pending}{language === 'ko' ? '건' : ''} ({language === 'ko' ? '오늘' : 'today'})
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      {language === 'ko' ? '대기 중인 요청' : 'Pending Requests'}
                    </p>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {stats.pending}
                      <span className="text-base font-normal ml-1 text-gray-400">{language === 'ko' ? '건' : ''}</span>
                    </h3>
                  </div>

                  {/* 오늘 예정 상담 */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveMenu('schedule')}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">event_available</span>
                      </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      {language === 'ko' ? '오늘 예정 상담' : 'Today\'s Schedule'}
                    </p>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {stats.todayScheduled}
                      <span className="text-base font-normal ml-1 text-gray-400">{language === 'ko' ? '건' : ''}</span>
                    </h3>
                  </div>

                  {/* 평균 평점 */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-lg text-yellow-600 dark:text-yellow-400">
                        <span className="material-symbols-outlined">star</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
                        <span className="text-green-500 font-bold">▲ 0.1</span> {language === 'ko' ? '지난달 대비' : 'vs last month'}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      {language === 'ko' ? '평균 평점' : 'Average Rating'}
                    </p>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {stats.avgRating}
                      <span className="text-base font-normal ml-1 text-gray-400">/ 5.0</span>
                    </h3>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: New Requests & History */}
                <div className="xl:col-span-2 flex flex-col gap-8">
                  {/* New Requests Section */}
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
                        {language === 'ko' ? '새로운 상담 요청' : 'New Consultation Requests'}
                        {filteredNewRequests.length > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {filteredNewRequests.length}
                          </span>
                        )}
                      </h2>
                      <button
                        onClick={() => setActiveMenu('requests')}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {language === 'ko' ? '모두 보기' : 'View all'}
                      </button>
                    </div>

                    {filteredNewRequests.length === 0 ? (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-3xl text-gray-400">inbox</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                          {language === 'ko' ? '새로운 상담 요청이 없습니다.' : 'No new consultation requests.'}
                        </p>
                      </div>
                    ) : (
                      filteredNewRequests.slice(0, 3).map((consultation) => (
                        <div
                          key={consultation.id}
                          onClick={() => router.push(`/consultant/consultations/${consultation.id}`)}
                          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5 transition-transform hover:scale-[1.01] cursor-pointer"
                        >
                          <div className="flex-shrink-0 relative">
                            <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden">
                              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">person</span>
                            </div>
                            <div
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-600 shadow-sm"
                              title={consultation.user.nationality}
                            >
                              <span className="text-[10px]">
                                {NATIONALITY_FLAGS[consultation.user.nationality] || '🌍'}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                {consultation.user.first_name} {consultation.user.last_name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getTypeColor(consultation.consultation_type)}`}>
                                {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language as 'ko' | 'en'] || consultation.consultation_type}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                • {getTimeSince(consultation.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-1">
                              {consultation.content}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center self-end w-full sm:w-auto mt-2 sm:mt-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(consultation.id); }}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-bold text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              {language === 'ko' ? '거절' : 'Reject'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAccept(consultation.id); }}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-sm transition-colors"
                            >
                              {language === 'ko' ? '수락' : 'Accept'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </section>

                  {/* Completed History Table */}
                  <section className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                        {language === 'ko' ? '완료된 상담 내역' : 'Completed Consultations'}
                      </h2>
                      <button
                        onClick={() => setActiveMenu('history')}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {language === 'ko' ? '모두 보기' : 'View all'}
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <th className="px-6 py-4">{language === 'ko' ? '클라이언트' : 'Client'}</th>
                            <th className="px-6 py-4">{language === 'ko' ? '상담 주제' : 'Topic'}</th>
                            <th className="px-6 py-4">{language === 'ko' ? '일시' : 'Date'}</th>
                            <th className="px-6 py-4">{language === 'ko' ? '상태' : 'Status'}</th>
                            <th className="px-6 py-4 text-right">{language === 'ko' ? '관리' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                          {completedConsultations.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                {language === 'ko' ? '완료된 상담 내역이 없습니다.' : 'No completed consultations.'}
                              </td>
                            </tr>
                          ) : (
                            completedConsultations.slice(0, 5).map((consultation) => (
                              <tr key={consultation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                  {consultation.user.first_name} {consultation.user.last_name}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                                  {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language as 'ko' | 'en'] || consultation.consultation_type}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                  {formatDate(consultation.created_at)}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                    {STATUS_LABELS[consultation.status]?.[language as 'ko' | 'en'] || consultation.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => router.push(`/consultant/consultations/${consultation.id}`)}
                                    className="text-primary hover:text-primary/80 font-medium text-xs"
                                  >
                                    {language === 'ko' ? '상세보기' : 'View'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* Right Column: Schedule & Profile */}
                <div className="flex flex-col gap-8">
                  {/* Upcoming Schedule */}
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                        {language === 'ko' ? '예정된 상담' : 'Upcoming Consultations'}
                      </h2>
                      <button
                        onClick={() => setActiveMenu('schedule')}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} ({language === 'ko' ? '오늘' : 'Today'})
                        </span>
                      </div>

                      {scheduledConsultations.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                          <p className="text-sm">{language === 'ko' ? '예정된 상담이 없습니다.' : 'No scheduled consultations.'}</p>
                        </div>
                      ) : (
                        scheduledConsultations.slice(0, 3).map((consultation, index) => (
                          <div
                            key={consultation.id}
                            className={`flex gap-4 p-3 rounded-lg ${
                              index === 0
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                            } transition-colors`}
                          >
                            <div className="flex flex-col items-center justify-center min-w-[3rem] border-r border-blue-200 dark:border-blue-800 pr-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {language === 'ko' ? '오후' : 'PM'}
                              </span>
                              <span className={`text-lg font-bold ${index === 0 ? 'text-primary dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                {formatTime(consultation.scheduled_at || consultation.created_at)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {consultation.user.first_name} {consultation.user.last_name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language as 'ko' | 'en']} • {consultation.consultation_method}
                              </p>
                            </div>
                            {consultation.consultation_method === 'video' && (
                              <button className="self-center p-2 rounded-full bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[20px]">videocam</span>
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Profile Management Preview */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                      {language === 'ko' ? '프로필 관리' : 'Profile Management'}
                    </h2>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-white dark:border-gray-600 shadow-md">
                          {consultantName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {consultantName} {language === 'ko' ? '변호사' : ''}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {language === 'ko' ? '법무법인 이지 (easy)' : 'Law Firm Easy'}
                          </p>
                          <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-bold text-gray-900 dark:text-white">{stats.avgRating}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">({stats.completed} {language === 'ko' ? '리뷰' : 'reviews'})</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full shadow-sm ${isAvailable ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400' : 'bg-white dark:bg-gray-600 text-gray-400'}`}>
                              <span className="material-symbols-outlined text-[18px]">toggle_on</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {language === 'ko' ? '상담 가능 상태' : 'Available Status'}
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAvailable}
                              onChange={(e) => setIsAvailable(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-primary"></div>
                          </label>
                        </div>

                        <button
                          onClick={() => setActiveMenu('profile')}
                          className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          {language === 'ko' ? '프로필 수정' : 'Edit Profile'}
                        </button>
                      </div>
                    </div>

                    {/* Latest Review Snippet */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10 dark:border-primary/20">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary/60 text-2xl">format_quote</span>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-200 italic mb-2">
                            {language === 'ko'
                              ? '"변호사님의 친절한 설명 덕분에 비자 연장 문제를 빠르게 해결할 수 있었습니다. 정말 감사합니다!"'
                              : '"Thanks to the lawyer\'s kind explanation, I was able to quickly resolve my visa extension issue. Thank you so much!"'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                            - {language === 'ko' ? '익명 (3일 전)' : 'Anonymous (3 days ago)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}

          {/* Requests View - 상담 요청 탭 */}
          {activeMenu === 'requests' && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ko' ? `총 ${newRequests.length}건의 요청` : `${newRequests.length} requests total`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>{language === 'ko' ? '최신순' : 'Latest'}</option>
                    <option>{language === 'ko' ? '오래된순' : 'Oldest'}</option>
                  </select>
                </div>
              </div>

              {newRequests.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl text-gray-400">inbox</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'ko' ? '새로운 상담 요청이 없습니다' : 'No new consultation requests'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'ko' ? '새로운 요청이 들어오면 여기에 표시됩니다.' : 'New requests will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {newRequests.map((consultation) => (
                    <div
                      key={consultation.id}
                      onClick={() => router.push(`/consultant/consultations/${consultation.id}`)}
                      className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                        <div className="flex-shrink-0 relative">
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl overflow-hidden">
                            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-3xl">person</span>
                          </div>
                          <div
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-600 shadow-sm"
                            title={consultation.user.nationality}
                          >
                            <span className="text-sm">
                              {NATIONALITY_FLAGS[consultation.user.nationality] || '🌍'}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              {consultation.user.first_name} {consultation.user.last_name}
                            </h4>
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${getTypeColor(consultation.consultation_type)}`}>
                              {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language as 'ko' | 'en'] || consultation.consultation_type}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              • {getTimeSince(consultation.created_at)}
                            </span>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {consultation.content}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">email</span>
                              {consultation.user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">payments</span>
                              {consultation.amount?.toLocaleString() || 0}{language === 'ko' ? '원' : ' KRW'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">
                                {consultation.consultation_method === 'video' ? 'videocam' : consultation.consultation_method === 'phone' ? 'call' : 'chat'}
                              </span>
                              {consultation.consultation_method === 'video' ? (language === 'ko' ? '화상' : 'Video') :
                               consultation.consultation_method === 'phone' ? (language === 'ko' ? '전화' : 'Phone') :
                               (language === 'ko' ? '채팅' : 'Chat')}
                            </span>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2 lg:self-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(consultation.id); }}
                            className="flex-1 lg:flex-none px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-bold text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            {language === 'ko' ? '거절' : 'Reject'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAccept(consultation.id); }}
                            className="flex-1 lg:flex-none px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-sm transition-colors"
                          >
                            {language === 'ko' ? '수락' : 'Accept'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Schedule View - 일정 관리 탭 */}
          {activeMenu === 'schedule' && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors">
                    {language === 'ko' ? '오늘' : 'Today'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">today</span>
                    {language === 'ko' ? '오늘 일정' : "Today's Schedule"}
                  </h4>

                  {scheduledConsultations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-5xl mb-3">event_busy</span>
                      <p>{language === 'ko' ? '오늘 예정된 상담이 없습니다.' : 'No consultations scheduled for today.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scheduledConsultations.map((consultation, index) => (
                        <div
                          key={consultation.id}
                          className={`flex gap-4 p-4 rounded-lg border ${
                            index === 0
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-primary'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          } transition-colors`}
                        >
                          <div className="flex flex-col items-center justify-center min-w-[4rem] text-center">
                            <span className={`text-2xl font-bold ${index === 0 ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                              {formatTime(consultation.scheduled_at || consultation.created_at)}
                            </span>
                          </div>
                          <div className="flex-1 border-l border-gray-200 dark:border-gray-600 pl-4">
                            <h5 className="font-bold text-gray-900 dark:text-white">
                              {consultation.user.first_name} {consultation.user.last_name}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language as 'ko' | 'en']}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                consultation.consultation_method === 'video'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                <span className="material-symbols-outlined text-[14px]">
                                  {consultation.consultation_method === 'video' ? 'videocam' : 'chat'}
                                </span>
                                {consultation.consultation_method === 'video' ? (language === 'ko' ? '화상' : 'Video') : (language === 'ko' ? '채팅' : 'Chat')}
                              </span>
                            </div>
                          </div>
                          {consultation.consultation_method === 'video' && (
                            <button className="self-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                              {language === 'ko' ? '입장' : 'Join'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Schedule */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">upcoming</span>
                    {language === 'ko' ? '다가오는 일정' : 'Upcoming Schedule'}
                  </h4>

                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-3">calendar_month</span>
                    <p>{language === 'ko' ? '예정된 일정이 없습니다.' : 'No upcoming schedule.'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* History View - 상담 내역 탭 */}
          {activeMenu === 'history' && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <select className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">{language === 'ko' ? '전체 상태' : 'All Status'}</option>
                    <option value="completed">{language === 'ko' ? '완료' : 'Completed'}</option>
                    <option value="scheduled">{language === 'ko' ? '예약됨' : 'Scheduled'}</option>
                    <option value="cancelled">{language === 'ko' ? '취소됨' : 'Cancelled'}</option>
                  </select>
                  <select className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">{language === 'ko' ? '전체 기간' : 'All Time'}</option>
                    <option value="week">{language === 'ko' ? '이번 주' : 'This Week'}</option>
                    <option value="month">{language === 'ko' ? '이번 달' : 'This Month'}</option>
                    <option value="year">{language === 'ko' ? '올해' : 'This Year'}</option>
                  </select>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ko' ? `총 ${consultations.length}건` : `${consultations.length} total`}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">{language === 'ko' ? '클라이언트' : 'Client'}</th>
                      <th className="px-6 py-4">{language === 'ko' ? '상담 주제' : 'Topic'}</th>
                      <th className="px-6 py-4">{language === 'ko' ? '방식' : 'Method'}</th>
                      <th className="px-6 py-4">{language === 'ko' ? '일시' : 'Date'}</th>
                      <th className="px-6 py-4">{language === 'ko' ? '상태' : 'Status'}</th>
                      <th className="px-6 py-4">{language === 'ko' ? '금액' : 'Amount'}</th>
                      <th className="px-6 py-4 text-right">{language === 'ko' ? '관리' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    {consultations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-5xl mb-3">history</span>
                          <p>{language === 'ko' ? '상담 내역이 없습니다.' : 'No consultation history.'}</p>
                        </td>
                      </tr>
                    ) : (
                      consultations.map((consultation) => (
                        <tr key={consultation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-xs">{NATIONALITY_FLAGS[consultation.user.nationality] || '🌍'}</span>
                              </div>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {consultation.user.first_name} {consultation.user.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                            {CONSULTATION_TYPE_LABELS[consultation.consultation_type]?.[language as 'ko' | 'en'] || consultation.consultation_type}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <span className="material-symbols-outlined text-[16px]">
                                {consultation.consultation_method === 'video' ? 'videocam' : 'chat'}
                              </span>
                              {consultation.consultation_method === 'video' ? (language === 'ko' ? '화상' : 'Video') : (language === 'ko' ? '채팅' : 'Chat')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                            {formatDate(consultation.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(consultation.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                consultation.status === 'completed' ? 'bg-gray-500' :
                                consultation.status === 'scheduled' ? 'bg-blue-500' :
                                consultation.status === 'cancelled' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}></span>
                              {STATUS_LABELS[consultation.status]?.[language as 'ko' | 'en'] || consultation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {consultation.amount?.toLocaleString() || 0}{language === 'ko' ? '원' : ' KRW'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => router.push(`/consultant/consultations/${consultation.id}`)}
                              className="text-primary hover:text-primary/80 font-medium text-xs"
                            >
                              {language === 'ko' ? '상세보기' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Profile View - 프로필 관리 탭 */}
          {activeMenu === 'profile' && (
            <section className="max-w-3xl mx-auto w-full">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 text-white">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                      {consultantName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {consultantName} {language === 'ko' ? '변호사' : ''}
                      </h3>
                      <p className="text-white/80">
                        {language === 'ko' ? '법무법인 이지 (easy)' : 'Law Firm Easy'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-yellow-300 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-bold">{stats.avgRating}</span>
                        </div>
                        <span className="text-white/60">•</span>
                        <span className="text-white/80">{stats.completed} {language === 'ko' ? '건 완료' : 'completed'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="p-6 space-y-6">
                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAvailable ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-600'}`}>
                        <span className="material-symbols-outlined">circle</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {language === 'ko' ? '상담 가능 상태' : 'Availability Status'}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isAvailable
                            ? (language === 'ko' ? '현재 새로운 상담 요청을 받고 있습니다.' : 'Currently accepting new consultation requests.')
                            : (language === 'ko' ? '현재 상담 요청을 받지 않습니다.' : 'Not accepting new requests.')}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      {language === 'ko' ? '기본 정보' : 'Basic Information'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {language === 'ko' ? '이름' : 'Name'}
                        </label>
                        <input
                          type="text"
                          value={consultantName}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {language === 'ko' ? '이메일' : 'Email'}
                        </label>
                        <input
                          type="email"
                          value={userProfile?.email || ''}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      {language === 'ko' ? '전문 분야' : 'Specializations'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['visa', 'labor', 'real_estate', 'tax'].map((type) => (
                        <span
                          key={type}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTypeColor(type)}`}
                        >
                          {CONSULTATION_TYPE_LABELS[type]?.[language as 'ko' | 'en'] || type}
                        </span>
                      ))}
                      <button className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
                        + {language === 'ko' ? '추가' : 'Add'}
                      </button>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      {language === 'ko' ? '자기소개' : 'Bio'}
                    </h4>
                    <textarea
                      rows={4}
                      placeholder={language === 'ko' ? '자기소개를 입력하세요...' : 'Enter your bio...'}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                      defaultValue={userProfile?.bio || ''}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {language === 'ko' ? '취소' : 'Cancel'}
                    </button>
                    <button className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                      {language === 'ko' ? '저장' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
