'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  file_url: string;
  file_name: string;
  file_size: string;
  mime_type: string;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  job_application: '일자리 지원',
  support_application: '정부 지원',
  visa: '비자',
  residence: '거주',
  tax: '세금',
  legal: '법률',
  other: '기타',
};

export default function DocumentTemplatesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, [language]);

  const fetchTemplates = async (category?: string) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const categoryParam = category && category !== 'all' ? `&category=${category}` : '';
      const response = await fetch(
        `/api/document-templates?language=${language}${categoryParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else if (response.status === 403) {
        router.push('/login');
      } else {
        setError('서류 템플릿을 불러오는데 실패했습니다');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    fetchTemplates(category);
  };

  const handleDownload = (template: DocumentTemplate) => {
    // 다운로드 트리거
    window.open(template.file_url, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getFilteredTemplates = () => {
    if (categoryFilter === 'all') {
      return templates;
    }
    return templates.filter((t) => t.category === categoryFilter);
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">서류 템플릿</h1>
          <p className="text-gray-600">
            필요한 서류 템플릿을 다운로드하여 사용하세요. ({templates.length}개)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 카테고리 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={categoryFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('all')}
            >
              전체 ({templates.length})
            </Button>
            <Button
              variant={categoryFilter === 'job_application' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('job_application')}
            >
              일자리 지원 ({templates.filter((t) => t.category === 'job_application').length})
            </Button>
            <Button
              variant={categoryFilter === 'support_application' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('support_application')}
            >
              정부 지원 ({templates.filter((t) => t.category === 'support_application').length})
            </Button>
            <Button
              variant={categoryFilter === 'visa' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('visa')}
            >
              비자 ({templates.filter((t) => t.category === 'visa').length})
            </Button>
            <Button
              variant={categoryFilter === 'residence' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('residence')}
            >
              거주 ({templates.filter((t) => t.category === 'residence').length})
            </Button>
            <Button
              variant={categoryFilter === 'tax' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('tax')}
            >
              세금 ({templates.filter((t) => t.category === 'tax').length})
            </Button>
          </div>
        </div>

        {/* 서류 템플릿 목록 */}
        {getFilteredTemplates().length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">해당 카테고리에 서류 템플릿이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredTemplates().map((template) => (
              <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge variant="info" className="mb-2">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{template.file_name}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{template.file_size}</span>
                  <span>{formatDate(template.created_at)}</span>
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleDownload(template)}
                  className="w-full"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  다운로드
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
