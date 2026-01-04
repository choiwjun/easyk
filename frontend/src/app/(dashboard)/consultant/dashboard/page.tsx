'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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
}

const STATUS_LABELS: Record<string, string> = {
  requested: '요청됨',
  matched: '매칭됨',
  scheduled: '예약됨',
  completed: '완료',
  cancelled: '취소됨',
};

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  visa: '비자',
  work_permit: '취업 허가',
  residence: '거주',
  tax: '세금',
  legal: '법률',
  other: '기타',
};

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
        setError('상담 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다');
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
        alert('상담 요청을 수락했습니다');
        fetchConsultations(statusFilter);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '상담 수락에 실패했습니다');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다');
    }
  };

  const handleReject = async (consultationId: string) => {
    if (!confirm('정말 이 상담 요청을 거절하시겠습니까?')) {
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
        alert('상담 요청을 거절했습니다');
        fetchConsultations(statusFilter);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '상담 거절에 실패했습니다');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다');
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchConsultations(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getFilteredConsultations = () => {
    if (statusFilter === 'all') {
      return consultations;
    }
    return consultations.filter((c) => c.status === statusFilter);
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">전문가 대시보드</h1>
          <p className="text-gray-600">
            총 {consultations.length}개의 상담 요청이 있습니다.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 상태 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('all')}
            >
              전체 ({consultations.length})
            </Button>
            <Button
              variant={statusFilter === 'matched' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('matched')}
            >
              매칭됨 ({consultations.filter((c) => c.status === 'matched').length})
            </Button>
            <Button
              variant={statusFilter === 'scheduled' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('scheduled')}
            >
              예약됨 ({consultations.filter((c) => c.status === 'scheduled').length})
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('completed')}
            >
              완료 ({consultations.filter((c) => c.status === 'completed').length})
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('cancelled')}
            >
              취소됨 ({consultations.filter((c) => c.status === 'cancelled').length})
            </Button>
          </div>
        </div>

        {/* 상담 요청 목록 */}
        {getFilteredConsultations().length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">표시할 상담 요청이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredConsultations().map((consultation) => (
              <Card key={consultation.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {CONSULTATION_TYPE_LABELS[consultation.consultation_type] ||
                          consultation.consultation_type}
                      </h2>
                      <Badge
                        variant={
                          consultation.status === 'scheduled'
                            ? 'success'
                            : consultation.status === 'matched'
                            ? 'warning'
                            : consultation.status === 'cancelled'
                            ? 'error'
                            : 'info'
                        }
                      >
                        {STATUS_LABELS[consultation.status] || consultation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      신청자: {consultation.user.first_name} {consultation.user.last_name} (
                      {consultation.user.nationality})
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      이메일: {consultation.user.email}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      상담 방법: {consultation.consultation_method}
                    </p>
                    <p className="text-sm text-gray-600">
                      요청일: {formatDate(consultation.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {consultation.amount.toLocaleString()}원
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      결제: {consultation.payment_status === 'paid' ? '완료' : '대기 중'}
                    </p>
                  </div>
                </div>

                {/* 상담 내용 */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{consultation.content}</p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/consultations/${consultation.id}`)}
                    className="flex-1"
                  >
                    상세 보기
                  </Button>
                  {consultation.status === 'matched' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => handleAccept(consultation.id)}
                        className="flex-1"
                      >
                        수락
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(consultation.id)}
                        className="flex-1"
                      >
                        거절
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
