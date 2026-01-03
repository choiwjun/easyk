"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

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
      visa: "🪪",
      housing: "🏠",
    };
    return icons[category] || "ℹ️";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: language === 'ko' ? "모집중" : "Open",
      inactive: language === 'ko' ? "비활성" : "Inactive",
      ended: language === 'ko' ? "마감" : "Ended",
    };
    return labels[status] || status;
  };

  useEffect(() => {
    fetchSupportDetail();
    fetchTemplates();
  }, [supportId]);

  const fetchSupportDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/supports/${supportId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSupport(data);
      } else if (response.status === 403) {
        router.push("/login");
      } else if (response.status === 404) {
        setError(t('errors.notFound'));
      } else {
        setError(t('errors.networkError'));
      }
    } catch (error) {
      setError(t('errors.networkError'));
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

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`/api/document-templates?category=support_application&language=ko`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const template = templates.find((t: any) => t.id === templateId);
      if (template) {
        const link = document.createElement("a");
        link.href = template.file_url;
        link.download = template.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      alert("다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/supports')}
            className="mb-4"
          >
            ← {t('common.back')}
          </Button>
          <LanguageSelector />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Title & Category */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getCategoryIcon(support.category)}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {getCategoryLabel(support.category)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                support.status === 'active' ? 'bg-green-100 text-green-800' :
                support.status === 'ended' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusLabel(support.status)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {support.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {support.description}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Details */}
          <div className="space-y-6">
            {/* Eligibility */}
            {support.eligibility && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('supports.fields.eligibility')}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {support.eligibility}
                </p>
              </div>
            )}

            {/* Eligible Visa Types */}
            {support.eligible_visa_types && support.eligible_visa_types.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('supports.fields.eligibleVisaTypes')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {support.eligible_visa_types.map((visa) => (
                    <span
                      key={visa}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                    >
                      {visa}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Support Content */}
            {support.support_content && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('supports.fields.supportContent')}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {support.support_content}
                </p>
              </div>
            )}

            {/* Department */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('supports.fields.department')}
              </h2>
              <p className="text-gray-700">{support.department}</p>
              {support.department_phone && (
                <p className="text-gray-600 mt-1">
                  📞 {support.department_phone}
                </p>
              )}
              {support.department_website && (
                <a
                  href={support.department_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-1 block"
                >
                  {support.department_website}
                </a>
              )}
            </div>

            {/* Application Period */}
            {(support.application_period_start || support.application_period_end) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('supports.fields.applicationPeriod')}
                </h2>
                <p className="text-gray-700">
                  {support.application_period_start && (
                    <span>{formatDate(support.application_period_start)}</span>
                  )}
                  {support.application_period_start && support.application_period_end && (
                    <span className="mx-2">~</span>
                  )}
                  {support.application_period_end && (
                    <span>{formatDate(support.application_period_end)}</span>
                  )}
                </p>
              </div>
            )}

            {/* Official Link */}
            {support.official_link && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('supports.fields.officialLink')}
                </h2>
                <a
                  href={support.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {language === 'ko' ? "공식 사이트 방문" : "Visit Official Website"}
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}

            {/* Document Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  서류 템플릿 다운로드
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplatesModal(true)}
                >
                  템플릿 보기
                </Button>
              </div>
              {templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template: any) => (
                    <div key={template.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {template.description || "서류 양식"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDownload(template.id)}
                        disabled={isDownloading === template.id}
                        className="w-full"
                      >
                        {isDownloading === template.id ? "다운로드 중..." : "다운로드"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">서류 템플릿이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/supports')}
            size="lg"
          >
            {t('common.back')}
          </Button>
        </div>
      </div>
    </div>
  );
}
