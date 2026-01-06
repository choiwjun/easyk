"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { SAMPLE_SUPPORTS } from "@/lib/sampleData";

interface Support {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility: string | null;
  eligible_visa_types: string[];
  support_content: string | null;
  department: string;
  department_phone: string | null;
  department_website: string | null;
  application_period_start: string | null;
  application_period_end: string | null;
  official_link: string | null;
  status: string;
  location?: string;
  created_at: string;
}

export default function SupportsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const supportId = params.id as string;
  const [support, setSupport] = useState<Support | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      subsidy: language === 'ko' ? "장려금" : "Subsidy",
      education: language === 'ko' ? "교육" : "Education",
      training: language === 'ko' ? "훈련" : "Training",
      legal: language === 'ko' ? "법률" : "Legal",
      medical: language === 'ko' ? "의료" : "Medical",
      visa: language === 'ko' ? "비자/체류" : "Visa/Residence",
      housing: language === 'ko' ? "주거" : "Housing",
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      subsidy: "💰",
      education: "📚",
      training: "🎓",
      legal: "⚖️",
      medical: "🏥",
      visa: "🪪",
      housing: "🏠",
    };
    return icons[category] || "ℹ️";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: language === 'ko' ? "모집중" : "Open",
      always: language === 'ko' ? "상시모집" : "Always Open",
      closing: language === 'ko' ? "마감임박" : "Closing Soon",
      inactive: language === 'ko' ? "비활성" : "Inactive",
      ended: language === 'ko' ? "마감" : "Ended",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'always':
        return 'bg-blue-100 text-blue-800';
      case 'closing':
        return 'bg-orange-100 text-orange-800';
      case 'ended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = () => {
    if (!support?.application_period_end) return null;
    const end = new Date(support.application_period_end);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  useEffect(() => {
    fetchSupportDetail();
    fetchTemplates();
  }, [supportId]);

  const fetchSupportDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // 먼저 API 호출 시도
      const response = await fetch(`/api/supports/${supportId}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setSupport(data);
      } else {
        // API 실패 시 샘플 데이터에서 찾기
        const sampleSupport = SAMPLE_SUPPORTS.find(s => s.id === supportId);
        if (sampleSupport) {
          setSupport(sampleSupport as Support);
        } else {
          setError(t('errors.notFound'));
        }
      }
    } catch (error) {
      // 네트워크 오류 시 샘플 데이터에서 찾기
      const sampleSupport = SAMPLE_SUPPORTS.find(s => s.id === supportId);
      if (sampleSupport) {
        setSupport(sampleSupport as Support);
      } else {
        setError(t('errors.networkError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ko' ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ko' ? "ko-KR" : "en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/document-templates?category=support_application&language=ko`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const handleDownload = async (templateId: string) => {
    try {
      setIsDownloading(templateId);
      const template = templates.find((t: any) => t.id === templateId);
      if (template) {
        const link = document.createElement("a");
        link.href = template.file_url;
        link.download = template.file_name || template.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      alert(language === 'ko' ? "다운로드에 실패했습니다." : "Download failed.");
    } finally {
      setIsDownloading(null);
    }
  };

  // 비슷한 프로그램 가져오기 (같은 카테고리)
  const getSimilarPrograms = () => {
    if (!support) return [];
    return SAMPLE_SUPPORTS
      .filter(s => s.category === support.category && s.id !== support.id)
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <span className="text-5xl mb-4 block">😢</span>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/supports')}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!support) {
    return null;
  }

  const daysRemaining = getDaysRemaining();
  const similarPrograms = getSimilarPrograms();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="py-8 px-4 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-blue-600">
                  {language === 'ko' ? '홈' : 'Home'}
                </Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <Link href="/supports" className="text-gray-500 hover:text-blue-600">
                  {language === 'ko' ? '지원 프로그램' : 'Support Programs'}
                </Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li className="font-medium text-gray-900 truncate max-w-[200px]">
                {support.title}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Main Details (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Header Section */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col gap-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      #{getCategoryLabel(support.category)}
                    </span>
                    {support.location && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        #{support.location}
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                      {support.title}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      {support.description}
                    </p>
                  </div>
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    {support.location && (
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{support.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>🏛️</span>
                      <span>{support.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Sections */}
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {/* Eligibility */}
                {support.eligibility && (
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-blue-600">
                        <span className="text-xl">👥</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {language === 'ko' ? '신청 자격' : 'Eligibility'}
                        </h3>
                        <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                          {support.eligibility}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligible Visa Types */}
                {support.eligible_visa_types && support.eligible_visa_types.length > 0 && (
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-blue-600">
                        <span className="text-xl">🪪</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {language === 'ko' ? '신청 가능 비자' : 'Eligible Visa Types'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {support.eligible_visa_types.map((visa) => (
                            <span
                              key={visa}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                            >
                              {visa}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Support Content */}
                {support.support_content && (
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-blue-600">
                        <span className="text-xl">🎁</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {language === 'ko' ? '지원 내용' : 'Support Content'}
                        </h3>
                        <div className="space-y-3">
                          {support.support_content.split('.').filter(s => s.trim()).map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="text-blue-600 mt-0.5">✓</span>
                              <span className="text-gray-600">{item.trim()}.</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Department Info */}
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg text-blue-600">
                      <span className="text-xl">📞</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {language === 'ko' ? '문의처' : 'Contact'}
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            {language === 'ko' ? '담당 기관' : 'Department'}
                          </p>
                          <p className="text-gray-900 font-medium">{support.department}</p>
                        </div>
                        {support.department_phone && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              {language === 'ko' ? '전화번호' : 'Phone'}
                            </p>
                            <p className="text-gray-900 font-medium">{support.department_phone}</p>
                          </div>
                        )}
                        {support.department_website && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              {language === 'ko' ? '웹사이트' : 'Website'}
                            </p>
                            <a
                              href={support.department_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {support.department_website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Apply */}
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg text-blue-600">
                      <span className="text-xl">📝</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {language === 'ko' ? '신청 방법' : 'How to Apply'}
                      </h3>
                      <ol className="relative border-l border-gray-200 ml-3">
                        <li className="mb-6 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full -left-3 ring-4 ring-white text-white text-xs font-bold">1</span>
                          <h4 className="font-medium text-gray-900">
                            {language === 'ko' ? '자격 확인하기' : 'Check Eligibility'}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {language === 'ko' ? '우측의 자격 확인 버튼을 눌러 기본 요건을 확인합니다.' : 'Click the eligibility check button to verify requirements.'}
                          </p>
                        </li>
                        <li className="mb-6 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full -left-3 ring-4 ring-white text-gray-600 text-xs font-bold">2</span>
                          <h4 className="font-medium text-gray-900">
                            {language === 'ko' ? '서류 준비' : 'Prepare Documents'}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {language === 'ko' ? '필요한 서류를 다운로드하고 작성합니다.' : 'Download and fill out the required documents.'}
                          </p>
                        </li>
                        <li className="ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full -left-3 ring-4 ring-white text-gray-600 text-xs font-bold">3</span>
                          <h4 className="font-medium text-gray-900">
                            {language === 'ko' ? '신청서 제출' : 'Submit Application'}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {language === 'ko' ? '공식 사이트에서 온라인으로 신청하거나 방문 신청합니다.' : 'Apply online or visit the office in person.'}
                          </p>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Templates Section */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-blue-600">
                      <span className="text-xl">📄</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {language === 'ko' ? '서류 템플릿' : 'Document Templates'}
                    </h3>
                  </div>
                  {templates.length > 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplatesModal(true)}
                    >
                      {language === 'ko' ? '전체 보기' : 'View All'}
                    </Button>
                  )}
                </div>
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.slice(0, 4).map((template: any) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">📋</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {template.description || (language === 'ko' ? '서류 양식' : 'Document form')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(template.id)}
                          disabled={isDownloading === template.id}
                          className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {isDownloading === template.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          ) : (
                            <span>⬇️</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-gray-600">
                      {language === 'ko' ? '등록된 서류 템플릿이 없습니다.' : 'No document templates available.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Summary Card (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Status Bar */}
                <div className={`px-6 py-3 flex items-center justify-between ${
                  support.status === 'active' || support.status === 'always'
                    ? 'bg-blue-600'
                    : support.status === 'closing'
                    ? 'bg-orange-500'
                    : 'bg-gray-500'
                }`}>
                  <span className="text-white font-medium text-sm flex items-center gap-2">
                    {(support.status === 'active' || support.status === 'always') && (
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    )}
                    {getStatusLabel(support.status)}
                  </span>
                  {daysRemaining !== null && support.status !== 'always' && (
                    <span className="text-white/80 text-sm">D-{daysRemaining}</span>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">
                    {language === 'ko' ? '프로그램 요약' : 'Program Summary'}
                  </h2>
                  {/* Summary List */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">
                        {language === 'ko' ? '신청 기간' : 'Application Period'}
                      </span>
                      <span className="text-gray-900 text-sm font-medium">
                        {support.status === 'always' ? (
                          language === 'ko' ? '상시' : 'Always'
                        ) : support.application_period_start && support.application_period_end ? (
                          `${formatShortDate(support.application_period_start)} - ${formatShortDate(support.application_period_end)}`
                        ) : (
                          '-'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">
                        {language === 'ko' ? '담당 기관' : 'Department'}
                      </span>
                      <span className="text-gray-900 text-sm font-medium truncate max-w-[150px]">
                        {support.department}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">
                        {language === 'ko' ? '지역' : 'Location'}
                      </span>
                      <span className="text-gray-900 text-sm font-medium">
                        {support.location || (language === 'ko' ? '전국' : 'Nationwide')}
                      </span>
                    </div>
                    {support.department_phone && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">
                          {language === 'ko' ? '문의처' : 'Contact'}
                        </span>
                        <span className="text-gray-900 text-sm font-medium">
                          {support.department_phone}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* CTAs */}
                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/supports/${supportId}/eligibility`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <span>{language === 'ko' ? '자격 확인하기' : 'Check Eligibility'}</span>
                      <span>→</span>
                    </Link>
                    {support.official_link && (
                      <a
                        href={support.official_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <span>🔗</span>
                        <span>{language === 'ko' ? '공식 사이트 방문' : 'Visit Official Site'}</span>
                      </a>
                    )}
                  </div>
                  {/* Share */}
                  <div className="mt-6 flex justify-center gap-4 border-t border-gray-100 pt-4">
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title={language === 'ko' ? '공유하기' : 'Share'}
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: support.title,
                            url: window.location.href,
                          });
                        }
                      }}
                    >
                      <span>📤</span>
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title={language === 'ko' ? '저장하기' : 'Save'}
                    >
                      <span>🔖</span>
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title={language === 'ko' ? '인쇄하기' : 'Print'}
                      onClick={() => window.print()}
                    >
                      <span>🖨️</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex gap-3">
                  <span className="text-blue-600">ℹ️</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {language === 'ko' ? '알려드립니다' : 'Notice'}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {language === 'ko'
                        ? '지원 자격 및 내용은 정책 변경에 따라 달라질 수 있습니다. 정확한 정보는 담당 기관에 문의하시기 바랍니다.'
                        : 'Eligibility and support details may change according to policy updates. Please contact the department for accurate information.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push('/supports')}
                  className="w-full"
                >
                  ← {language === 'ko' ? '목록으로 돌아가기' : 'Back to List'}
                </Button>
              </div>
            </div>
          </div>

          {/* Similar Programs */}
          {similarPrograms.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {language === 'ko' ? '비슷한 지원 프로그램' : 'Similar Programs'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarPrograms.map((program) => (
                  <Link
                    key={program.id}
                    href={`/supports/${program.id}`}
                    className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-5xl">{getCategoryIcon(program.category)}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusColor(program.status)}`}>
                          {getStatusLabel(program.status)}
                        </span>
                        <span className="text-xs text-gray-500">{program.department}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 mb-1 line-clamp-2">
                        {program.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {program.location || (language === 'ko' ? '전국' : 'Nationwide')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Document Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                📄 {language === 'ko' ? '서류 템플릿' : 'Document Templates'}
              </h3>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {templates.length > 0 ? (
                <div className="space-y-4">
                  {templates.map((template: any) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📋</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {template.description || (language === 'ko' ? '서류 양식' : 'Document form')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDownload(template.id)}
                        disabled={isDownloading === template.id}
                      >
                        {isDownloading === template.id
                          ? (language === 'ko' ? '다운로드 중...' : 'Downloading...')
                          : (language === 'ko' ? '다운로드' : 'Download')}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">📭</span>
                  <p className="text-gray-600 mb-2">
                    {language === 'ko' ? '등록된 서류 템플릿이 없습니다.' : 'No document templates available.'}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowTemplatesModal(false)}
              >
                {language === 'ko' ? '닫기' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
