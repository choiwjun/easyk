"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { SAMPLE_SUPPORTS } from "@/lib/sampleData";
import DesignHeader from "@/components/ui/DesignHeader";

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
  location?: string;
  image_url?: string;
}

const CATEGORIES = [
  { value: "", label_ko: "전체", label_en: "All", icon: "check" },
  { value: "subsidy", label_ko: "장려금", label_en: "Subsidy", icon: "payments" },
  { value: "education", label_ko: "교육", label_en: "Education", icon: "school" },
  { value: "training", label_ko: "취업 훈련", label_en: "Training", icon: "work" },
  { value: "legal", label_ko: "법률 지원", label_en: "Legal", icon: "gavel" },
  { value: "medical", label_ko: "의료", label_en: "Medical", icon: "medical_services" },
];

// 카테고리별 기본 이미지
const CATEGORY_IMAGES: Record<string, string> = {
  subsidy: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
  education: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
  training: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop",
  legal: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop",
  medical: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
  visa: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop",
  housing: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
};

export default function SupportsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [supports, setSupports] = useState<Support[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 검색 및 필터 상태
  const [selectedCategory, setSelectedCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetchSupports();
  }, [selectedCategory, keyword]);

  const fetchSupports = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // Query parameters 구성
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (keyword) params.append("keyword", keyword);
      params.append("limit", "100");
      params.append("offset", "0");

      const queryString = params.toString();
      const url = `/api/supports${queryString ? `?${queryString}` : ""}`;

      // 토큰이 있으면 헤더에 추가, 없으면 헤더 없이 요청
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        const supports = data.supports || [];
        // API 응답이 비어있으면 샘플 데이터 사용
        if (supports.length === 0) {
          console.info('[Supports] API 응답이 비어있음, 샘플 데이터 사용');
          setSupports(SAMPLE_SUPPORTS);
          setTotal(SAMPLE_SUPPORTS.length);
        } else {
          setSupports(supports);
          setTotal(data.total || supports.length);
        }
      } else {
        // API 실패 시 샘플 데이터 사용
        console.warn('[Supports] API 호출 실패, 샘플 데이터 사용:', response.status);
        setSupports(SAMPLE_SUPPORTS);
        setTotal(SAMPLE_SUPPORTS.length);
      }
    } catch (error) {
      // 네트워크 오류 시 샘플 데이터 사용
      console.warn('[Supports] 네트워크 오류, 샘플 데이터 사용:', error);
      setSupports(SAMPLE_SUPPORTS);
      setTotal(SAMPLE_SUPPORTS.length);
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ko: string; en: string; style: string }> = {
      active: { ko: "모집중", en: "Open", style: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
      always: { ko: "상시 모집", en: "Always Open", style: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
      ended: { ko: "마감", en: "Closed", style: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
      closing: { ko: "마감 임박", en: "Closing Soon", style: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" },
    };
    return labels[status] || { ko: status, en: status, style: "bg-gray-100 text-gray-800" };
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return null;
    if (diff === 0) return language === 'ko' ? "오늘 마감" : "Closes Today";
    return `D-Day ${diff}`;
  };

  const getFilteredSupports = () => {
    let filtered = [...supports];

    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(lowerKeyword) ||
        s.description.toLowerCase().includes(lowerKeyword)
      );
    }

    // 정렬
    if (sortBy === "deadline") {
      filtered.sort((a, b) => {
        if (!a.application_period_end) return 1;
        if (!b.application_period_end) return -1;
        return new Date(a.application_period_end).getTime() - new Date(b.application_period_end).getTime();
      });
    }

    return filtered;
  };

  const filteredSupports = getFilteredSupports();

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] text-[#121417] dark:text-white flex flex-col">
      <DesignHeader />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-[#121417] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                {language === 'ko' ? "정부 지원 프로그램" : "Government Support Programs"}
              </h1>
              <p className="text-[#657486] dark:text-[#9aaebf] text-base font-normal leading-normal max-w-2xl">
                {language === 'ko'
                  ? "한국 생활 정착에 필요한 다양한 정부 지원 혜택을 한눈에 확인하고 신청하세요."
                  : "Discover various government support benefits for settling in Korea."}
              </p>
            </div>
            <Link
              href="/support"
              className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-[#1a222d] border border-[#dce0e5] dark:border-[#333] rounded-lg text-[#121417] dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#252e3a] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span>{language === 'ko' ? "문의하기" : "Contact"}</span>
            </Link>
          </div>
        </div>

        {/* Filter Chips & Search */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Category Chips */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-5 transition-all active:scale-95 ${
                  selectedCategory === category.value
                    ? "bg-[#121417] dark:bg-white"
                    : "bg-white dark:bg-[#1a222d] border border-[#e5e7eb] dark:border-[#333] hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/20 group"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${
                  selectedCategory === category.value
                    ? "text-white dark:text-[#121417]"
                    : "text-[#657486] group-hover:text-primary"
                }`}>
                  {category.icon}
                </span>
                <p className={`text-sm font-medium leading-normal ${
                  selectedCategory === category.value
                    ? "text-white dark:text-[#121417] font-bold"
                    : "text-[#121417] dark:text-white group-hover:text-primary"
                }`}>
                  {language === 'ko' ? category.label_ko : category.label_en}
                </p>
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#657486]">search</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-[#1a222d] border border-[#dce0e5] dark:border-[#333] h-12 pl-12 pr-4 text-base placeholder:text-[#657486] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                placeholder={language === 'ko' ? "프로그램명 또는 키워드 검색 (예: 한국어, 비자)" : "Search programs or keywords"}
              />
            </form>
            <div className="relative w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-xl bg-white dark:bg-[#1a222d] border border-[#dce0e5] dark:border-[#333] h-12 pl-4 pr-10 text-base text-[#121417] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="latest">{language === 'ko' ? "최신순" : "Latest"}</option>
                <option value="deadline">{language === 'ko' ? "마감 임박순" : "Deadline"}</option>
                <option value="popular">{language === 'ko' ? "인기순" : "Popular"}</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#657486] pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-[#657486] dark:text-[#9aaebf]">
          {language === 'ko'
            ? `총 ${filteredSupports.length}개의 지원 프로그램`
            : `${filteredSupports.length} support program(s) found`}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : filteredSupports.length === 0 ? (
          <div className="bg-white dark:bg-[#1a222d] rounded-2xl p-12 text-center border border-[#e5e7eb] dark:border-[#333]">
            <span className="material-symbols-outlined text-5xl text-[#657486] mb-4">search_off</span>
            <p className="text-[#657486] dark:text-[#9aaebf]">
              {keyword || selectedCategory
                ? (language === 'ko' ? "검색 조건에 맞는 프로그램이 없습니다." : "No programs match your criteria.")
                : (language === 'ko' ? "등록된 프로그램이 없습니다." : "No programs available.")}
            </p>
          </div>
        ) : (
          /* Program Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupports.map((support) => {
              const statusInfo = getStatusLabel(support.status);
              const daysRemaining = getDaysRemaining(support.application_period_end);
              const imageUrl = support.image_url || CATEGORY_IMAGES[support.category] || CATEGORY_IMAGES.subsidy;

              return (
                <div
                  key={support.id}
                  className="group flex flex-col bg-white dark:bg-[#1a222d] rounded-2xl border border-[#e5e7eb] dark:border-[#333] overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/supports/${support.id}`)}
                >
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url("${imageUrl}")` }}
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${statusInfo.style}`}>
                        {language === 'ko' ? statusInfo.ko : statusInfo.en}
                      </span>
                    </div>
                    {/* Location */}
                    {support.location && (
                      <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                        <span className="inline-flex items-center gap-1 text-white text-xs font-medium">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {support.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 gap-4">
                    <div className="flex-1">
                      {/* Category & Days */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">
                          {getCategoryLabel(support.category)}
                        </span>
                        {daysRemaining && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[#dce0e5]"></span>
                            <span className="text-[#657486] text-xs">{daysRemaining}</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-[#121417] dark:text-white text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {support.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[#657486] dark:text-[#9aaebf] text-sm leading-relaxed line-clamp-2">
                        {support.description}
                      </p>
                    </div>

                    {/* Eligibility */}
                    <div className="pt-4 border-t border-[#f0f2f4] dark:border-[#2a3441] flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-[#4f5b67] dark:text-[#8897a8]">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span className="line-clamp-1">
                          {support.eligibility || (support.eligible_visa_types?.length > 0
                            ? support.eligible_visa_types.join(", ") + " " + (language === 'ko' ? "비자 소지자" : "visa holders")
                            : (language === 'ko' ? "전체 외국인 대상" : "All foreigners"))}
                        </span>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      className="w-full mt-2 flex items-center justify-center rounded-lg h-10 px-4 bg-[#f0f2f4] dark:bg-[#2a3441] hover:bg-primary hover:text-white dark:hover:bg-primary text-[#121417] dark:text-white text-sm font-bold transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/supports/${support.id}`);
                      }}
                    >
                      {language === 'ko' ? "자세히 보기" : "View Details"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredSupports.length > 0 && (
          <div className="flex justify-center mt-12 mb-8">
            <div className="flex gap-2">
              <button className="flex items-center justify-center size-10 rounded-lg text-[#657486] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441]">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="flex items-center justify-center size-10 rounded-lg bg-primary text-white font-bold">1</button>
              <button className="flex items-center justify-center size-10 rounded-lg text-[#121417] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] font-medium">2</button>
              <button className="flex items-center justify-center size-10 rounded-lg text-[#121417] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] font-medium">3</button>
              <button className="flex items-center justify-center size-10 rounded-lg text-[#657486] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441]">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1a222d] border-t border-[#f0f2f4] dark:border-[#2a3441] py-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 flex items-center justify-center bg-primary/10 rounded-md text-primary">
              <span className="material-symbols-outlined text-[16px]">diversity_2</span>
            </div>
            <span className="text-[#121417] dark:text-white font-bold text-lg">easyK</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#657486] dark:text-[#9aaebf]">
            <Link href="/terms" className="hover:text-primary">{language === 'ko' ? "이용약관" : "Terms"}</Link>
            <Link href="/privacy" className="hover:text-primary">{language === 'ko' ? "개인정보처리방침" : "Privacy"}</Link>
            <Link href="/support" className="hover:text-primary">{language === 'ko' ? "고객센터" : "Support"}</Link>
          </div>
          <p className="text-xs text-[#9aaebf]">© 2024 easyK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
