"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Navbar from "@/components/ui/Navbar";
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
  created_at: string;
}

const CATEGORIES = [
  { value: "", label_ko: "전체", label_en: "All", icon: "📋" },
  { value: "subsidy", label_ko: "장려금", label_en: "Subsidy", icon: "💰" },
  { value: "education", label_ko: "교육", label_en: "Education", icon: "📚" },
  { value: "training", label_ko: "훈련", label_en: "Training", icon: "🎓" },
  { value: "visa", label_ko: "비자/체류", label_en: "Visa/Residence", icon: "🪪" },
  { value: "housing", label_ko: "주거", label_en: "Housing", icon: "🏠" },
];

export default function SupportsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [supports, setSupports] = useState<Support[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [useSampleData, setUseSampleData] = useState(false); // 샘플 데이터 사용 모드

  // 검색 및 필터 상태
  const [selectedCategory, setSelectedCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchSupports();
  }, [selectedCategory, keyword]);

  const fetchSupports = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      // 샘플 데이터 사용 모드인 경우 API 호출 스킵
      if (useSampleData) {
        setSupports(SAMPLE_SUPPORTS);
        setTotal(SAMPLE_SUPPORTS.length);
        setIsLoading(false);
        return;
      }

      // Query parameters 구성
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (keyword) params.append("keyword", keyword);
      params.append("limit", "100");
      params.append("offset", "0");

      const queryString = params.toString();
      const url = `/api/supports${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSupports(data.supports || []);
        setTotal(data.total || 0);
      } else if (response.status === 403 || response.status === 401) {
        router.push("/login");
      } else {
        // API 실패 시 샘플 데이터 사용
        console.warn('[Supports] API 호출 실패, 샘플 데이터 사용:', response.status);
        setSupports(SAMPLE_SUPPORTS);
        setTotal(SAMPLE_SUPPORTS.length);
        setError(`UI 데모: 샘플 데이터를 표시합니다. (${language === 'ko' ? "지원 프로그램 목록을 불러오는데 실패했습니다." : "Failed to load support programs."})`);
      }
    } catch (error) {
      // 네트워크 오류 시 샘플 데이터 사용
      console.warn('[Supports] 네트워크 오류, 샘플 데이터 사용:', error);
      setSupports(SAMPLE_SUPPORTS);
      setTotal(SAMPLE_SUPPORTS.length);
      setError(`UI 데모: 샘플 데이터를 표시합니다. (${language === 'ko' ? "네트워크 오류가 발생했습니다." : "Network error occurred."})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setKeyword(searchInput);
  };

  const handleCategoryChange = (category: string) => {
    setIsLoading(true);
    setError("");
    setSelectedCategory(category);
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = CATEGORIES.find((c) => c.value === categoryValue);
    return language === 'ko' ? category?.label_ko : category?.label_en;
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = CATEGORIES.find((c) => c.value === categoryValue);
    return category?.icon || "ℹ️";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: language === 'ko' ? "모집중" : "Open",
      inactive: language === 'ko' ? "비활성" : "Inactive",
      ended: language === 'ko' ? "마감" : "Ended",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ko' ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading && supports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* UI 데모 토글 */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-700">🎨</span>
                <span className="text-sm font-medium text-yellow-800">
                  {language === 'ko' ? 'UI 데모: 샘플 데이터 사용' : 'UI Demo: Use Sample Data'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUseSampleData(!useSampleData);
                  setIsLoading(true);
                  setError("");
                  fetchSupports();
                }}
                className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                  useSampleData
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {useSampleData ? (language === 'ko' ? '🟢 샘플 데이터 중' : '🟢 Sample Data') : (language === 'ko' ? '⚪ API 사용 중' : '⚪ Using API')}
              </button>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              {language === 'ko' 
                ? '개발/테스트용 샘플 데이터입니다. 백엔드 API 연결 없이 UI를 확인할 수 있습니다.'
                : 'Sample data for development/testing. Check UI without backend API connection.'}
            </p>
          </div>

          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ko' ? "정부 지원 정보" : "Government Support Programs"}
            </h1>
          </div>

        {/* 카테고리 탭 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {language === 'ko' ? category.label_ko : category.label_en}
              </button>
            ))}
          </div>
        </div>

        {/* 검색창 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={language === 'ko' ? "키워드 검색 (제목, 설명)..." : "Search by keyword (title, description)..."}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {language === 'ko' ? "검색" : "Search"}
            </Button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 결과 카운트 */}
        <div className="mb-4 text-sm text-gray-600">
          {language === 'ko'
            ? `총 ${total}개의 지원 프로그램`
            : `${total} support program(s) found`}
        </div>

        {/* 프로그램 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">{t('common.loading')}</div>
          </div>
        ) : supports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">
              {keyword || selectedCategory
                ? (language === 'ko' ? "검색 조건에 맞는 지원 프로그램이 없습니다." : "No support programs match your criteria.")
                : (language === 'ko' ? "등록된 지원 프로그램이 없습니다." : "No support programs available.")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {supports.map((support) => (
              <div
                key={support.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/supports/${support.id}`)}
              >
                {/* 카테고리 & 상태 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(support.category)}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                      {getCategoryLabel(support.category)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    support.status === 'active' ? 'bg-green-100 text-green-800' :
                    support.status === 'ended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(support.status)}
                  </span>
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {support.title}
                </h3>

                {/* 설명 */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {support.description}
                </p>

                {/* 지원 내용 */}
                {support.support_content && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">
                      {language === 'ko' ? "지원 내용" : "Support Content"}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {support.support_content}
                    </p>
                  </div>
                )}

                {/* 신청 기간 */}
                {(support.application_period_start || support.application_period_end) && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">
                      {language === 'ko' ? "신청 기간" : "Application Period"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {support.application_period_start && formatDate(support.application_period_start)}
                      {support.application_period_start && support.application_period_end && " ~ "}
                      {support.application_period_end && formatDate(support.application_period_end)}
                    </p>
                  </div>
                )}

                {/* 담당 기관 */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">
                    {language === 'ko' ? "담당 기관" : "Department"}
                  </h4>
                  <p className="text-sm text-gray-600">{support.department}</p>
                  {support.department_phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      📞 {support.department_phone}
                    </p>
                  )}
                </div>

                {/* 웹사이트 & 공식 링크 */}
                <div className="flex flex-col gap-2">
                  {support.department_website && (
                    <a
                      href={support.department_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {language === 'ko' ? "기관 웹사이트 →" : "Department Website →"}
                    </a>
                  )}
                  {support.official_link && (
                    <a
                      href={support.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {language === 'ko' ? "공식 신청 바로가기" : "Apply Now"}
                      <svg
                        className="w-3 h-3"
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
