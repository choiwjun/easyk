'use client';

import { useState, useEffect } from 'react';
import { JobApplicationWithJob } from '@/types/job';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, useAuthFetch } from '@/hooks/useAuth';

export default function ApplicationsPage() {
  const { t } = useLanguage();
  const { isLoading: authLoading, requireAuth } = useAuth();
  const authFetch = useAuthFetch();
  const [applications, setApplications] = useState<JobApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Require authentication
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    if (!authLoading) {
      fetchApplications();
    }
  }, [statusFilter, authLoading]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = statusFilter ? `?status=${statusFilter}` : '';
      const response = await authFetch(`/api/jobs/applications/my${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '지원 내역을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || '지원 내역을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied':
        return '지원 완료';
      case 'in_review':
        return '검토 중';
      case 'accepted':
        return '합격';
      case 'rejected':
        return '불합격';
      default:
        return status;
    }
  };

  const getEmploymentTypeText = (type: string) => {
    switch (type) {
      case 'full-time':
        return '정규직';
      case 'part-time':
        return '아르바이트';
      case 'contract':
        return '계약직';
      case 'temporary':
        return '임시직';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내 지원 내역</h1>
        <p className="text-gray-600">지원한 일자리 현황을 확인하세요</p>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          상태 필터:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">전체</option>
          <option value="applied">지원 완료</option>
          <option value="in_review">검토 중</option>
          <option value="accepted">합격</option>
          <option value="rejected">불합격</option>
        </select>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 지원 내역 목록 */}
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {statusFilter ? '해당 상태의 지원 내역이 없습니다' : '아직 지원한 일자리가 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {application.job.position}
                  </h3>
                  <p className="text-gray-600 mb-2">{application.job.company_name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {application.job.location}
                    </span>
                    <span>•</span>
                    <span>{getEmploymentTypeText(application.job.employment_type)}</span>
                    {application.job.salary_range && (
                      <>
                        <span>•</span>
                        <span>{application.job.salary_range}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      application.status
                    )}`}
                  >
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">지원일:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(application.applied_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">마감일:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(application.job.deadline).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {application.reviewed_at && (
                    <div>
                      <span className="text-gray-500">검토일:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(application.reviewed_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  )}
                </div>

                {application.cover_letter && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">자기소개서:</p>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {application.cover_letter}
                    </p>
                  </div>
                )}

                {application.reviewer_comment && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">검토자 코멘트:</p>
                    <p className="text-gray-700 text-sm">{application.reviewer_comment}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <a
                  href={`/jobs/${application.job.id}`}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  공고 보기
                </a>
                {application.resume_url && (
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    제출한 이력서 보기
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
