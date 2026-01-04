'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';

interface DashboardStats {
  users: {
    total: number;
    foreign: number;
    consultants: number;
    admins: number;
  };
  consultations: {
    total: number;
    by_status: Record<string, number>;
  };
  jobs: {
    total: number;
    active: number;
  };
  applications: {
    total: number;
    by_status: Record<string, number>;
  };
  supports: {
    total: number;
    active: number;
  };
}

export default function AdminStatsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const isAuthorized = useRoleGuard(['admin']);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/stats/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        router.push('/');
        alert('관리자만 접근할 수 있습니다');
      } else {
        setError('통계를 불러오는데 실패했습니다');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">데이터를 불러올 수 없습니다</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            ← 뒤로가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">통계 대시보드</h1>
          <p className="text-gray-600">플랫폼 전체 통계를 확인하세요</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 사용자 통계 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">사용자 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">전체 사용자</div>
              <div className="text-3xl font-bold text-gray-900">{stats.users.total}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">외국인</div>
              <div className="text-3xl font-bold text-blue-600">{stats.users.foreign}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">전문가</div>
              <div className="text-3xl font-bold text-green-600">{stats.users.consultants}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">관리자</div>
              <div className="text-3xl font-bold text-purple-600">{stats.users.admins}</div>
            </Card>
          </div>
        </div>

        {/* 상담 통계 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">상담 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">전체 상담</div>
              <div className="text-3xl font-bold text-gray-900">{stats.consultations.total}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-2">상담 상태별</div>
              <div className="space-y-2">
                {Object.entries(stats.consultations.by_status).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-semibold">{count}건</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* 일자리 통계 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">일자리 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">전체 공고</div>
              <div className="text-3xl font-bold text-gray-900">{stats.jobs.total}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">진행중인 공고</div>
              <div className="text-3xl font-bold text-green-600">{stats.jobs.active}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">전체 지원</div>
              <div className="text-3xl font-bold text-blue-600">{stats.applications.total}</div>
            </Card>
          </div>
        </div>

        {/* 지원 상태별 통계 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">지원 상태별 통계</h2>
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.applications.by_status).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-sm text-gray-500">{status}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 정부 지원 통계 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">정부 지원 프로그램</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">전체 프로그램</div>
              <div className="text-3xl font-bold text-gray-900">{stats.supports.total}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-500 mb-1">진행중인 프로그램</div>
              <div className="text-3xl font-bold text-green-600">{stats.supports.active}</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
