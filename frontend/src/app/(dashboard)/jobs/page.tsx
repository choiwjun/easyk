"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

interface Job {
  id: string;
  position: string;
  company_name: string;
  location: string;
  employment_type: string;
  salary_range: string | null;
  description: string;
  deadline: string;
  created_at: string;
  is_urgent?: boolean;
  is_visa_supported?: boolean;
  is_dormitory_provided?: boolean;
  visa_type?: string;
}

// Sample jobs for UI demonstration
const SAMPLE_JOBS: Job[] = [
  {
    id: "1",
    position: "자동차 부품 조립 생산직",
    company_name: "(주)한성모터스",
    location: "경기 평택시 포승읍",
    employment_type: "full-time",
    salary_range: "월 320만원 이상",
    description: "자동차 부품 조립 및 생산 업무. 신입 가능. 기숙사 제공. 4대보험 완비.",
    deadline: "2026-02-28",
    created_at: "2026-01-01",
    is_urgent: true,
    is_visa_supported: true,
  },
  {
    id: "2",
    position: "식품 가공 및 포장 (초보가능)",
    company_name: "그린푸드 시스템",
    location: "충북 음성군",
    employment_type: "full-time",
    salary_range: "월 270만원 ~ 300만원",
    description: "식품 가공 및 포장 작업. 초보자 환영. 교대근무 가능자 우대. 기숙사 제공.",
    deadline: "2026-02-15",
    created_at: "2026-01-02",
    is_dormitory_provided: true,
  },
  {
    id: "3",
    position: "반도체 장비 배관 조공",
    company_name: "케이테크 엔지니어링",
    location: "경기 화성시",
    employment_type: "contract",
    salary_range: "일급 160,000원",
    description: "반도체 장비 배관 조공 업무. 경력자 우대. F-4 비자 소지자 환영.",
    deadline: "2026-03-10",
    created_at: "2026-01-03",
    visa_type: "F-4",
  },
  {
    id: "4",
    position: "물류센터 상하차 및 분류",
    company_name: "스피드 로지스틱스",
    location: "인천 서구",
    employment_type: "part-time",
    salary_range: "시급 12,000원",
    description: "물류센터 상하차 및 분류 작업. 파트타임 가능. 단기 근무 환영.",
    deadline: "2026-02-20",
    created_at: "2026-01-04",
  },
  {
    id: "5",
    position: "건설 현장 철근공",
    company_name: "대한건설",
    location: "서울 강서구",
    employment_type: "full-time",
    salary_range: "월 400만원 이상",
    description: "건설 현장 철근 작업. 경력 3년 이상. 비자 지원 가능.",
    deadline: "2026-03-01",
    created_at: "2026-01-05",
    is_visa_supported: true,
  },
  {
    id: "6",
    position: "제조업 기계 조작원",
    company_name: "테크산업",
    location: "경기 안산시",
    employment_type: "full-time",
    salary_range: "월 280만원",
    description: "제조업 기계 조작 및 관리. 초보 가능. 교육 제공.",
    deadline: "2026-02-25",
    created_at: "2026-01-06",
  },
];

const QUICK_FILTERS = [
  { label: { ko: "#비자지원", en: "#Visa Support" }, value: "visa_support" },
  { label: { ko: "#제조업", en: "#Manufacturing" }, value: "manufacturing" },
  { label: { ko: "#기숙사제공", en: "#Dormitory" }, value: "dormitory" },
  { label: { ko: "#초보가능", en: "#Entry Level" }, value: "entry_level" },
  { label: { ko: "#건설현장", en: "#Construction" }, value: "construction" },
];

export default function JobsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    requireAuth();
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchKeyword, selectedJobType, selectedSalary, selectedEmploymentType, sortBy]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Try to fetch from API
      const response = await fetch("/api/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        // Fallback to sample data
        console.warn("[Jobs] Using sample data");
        setJobs(SAMPLE_JOBS);
      }
    } catch (error) {
      console.warn("[Jobs] Network error, using sample data");
      setJobs(SAMPLE_JOBS);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search keyword filter
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.position.toLowerCase().includes(keyword) ||
          job.company_name.toLowerCase().includes(keyword) ||
          job.location.toLowerCase().includes(keyword)
      );
    }

    // Employment type filter
    if (selectedEmploymentType) {
      filtered = filtered.filter((job) => job.employment_type === selectedEmploymentType);
    }

    // Sort
    if (sortBy === "latest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "salary") {
      filtered.sort((a, b) => {
        const salaryA = extractSalary(a.salary_range || "");
        const salaryB = extractSalary(b.salary_range || "");
        return salaryB - salaryA;
      });
    }

    setFilteredJobs(filtered);
  };

  const extractSalary = (salaryString: string): number => {
    const match = salaryString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleQuickFilter = (filterValue: string) => {
    // Quick filter logic based on job properties
    switch (filterValue) {
      case "visa_support":
        setSearchKeyword("");
        const visaJobs = jobs.filter((job) => job.is_visa_supported);
        setFilteredJobs(visaJobs);
        break;
      case "manufacturing":
        setSearchKeyword("제조");
        break;
      case "dormitory":
        setSearchKeyword("");
        const dormitoryJobs = jobs.filter((job) => job.is_dormitory_provided);
        setFilteredJobs(dormitoryJobs);
        break;
      case "entry_level":
        setSearchKeyword("초보");
        break;
      case "construction":
        setSearchKeyword("건설");
        break;
      default:
        break;
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const getJobBadges = (job: Job) => {
    const badges = [];
    if (job.is_urgent) {
      badges.push(
        <span
          key="urgent"
          className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-bold border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30"
        >
          {language === "ko" ? "긴급" : "Urgent"}
        </span>
      );
    }
    if (job.is_visa_supported) {
      badges.push(
        <span
          key="visa"
          className="px-2 py-1 rounded bg-blue-50 text-primary text-xs font-bold border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30"
        >
          {language === "ko" ? "비자지원" : "Visa Support"}
        </span>
      );
    }
    if (job.employment_type === "full-time") {
      badges.push(
        <span
          key="fulltime"
          className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30"
        >
          {language === "ko" ? "정규직" : "Full-time"}
        </span>
      );
    }
    if (job.is_dormitory_provided) {
      badges.push(
        <span
          key="dormitory"
          className="px-2 py-1 rounded bg-gray-100 text-text-sub text-xs font-bold border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
        >
          {language === "ko" ? "기숙사" : "Dormitory"}
        </span>
      );
    }
    if (job.visa_type) {
      badges.push(
        <span
          key="visatype"
          className="px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/30"
        >
          {job.visa_type} {language === "ko" ? "비자" : "Visa"}
        </span>
      );
    }
    if (job.employment_type === "part-time") {
      badges.push(
        <span
          key="parttime"
          className="px-2 py-1 rounded bg-gray-100 text-text-sub text-xs font-bold border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
        >
          {language === "ko" ? "파트타임" : "Part-time"}
        </span>
      );
    }
    return badges;
  };

  const getCompanyInitial = (companyName: string) => {
    return companyName.charAt(0).toUpperCase();
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-slate-800 text-primary",
      "bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900 dark:to-emerald-950 text-green-700",
      "bg-gradient-to-br from-purple-100 to-indigo-50 dark:from-purple-900 dark:to-indigo-950 text-purple-700",
      "bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900 dark:to-amber-950 text-orange-700",
      "bg-gradient-to-br from-pink-100 to-rose-50 dark:from-pink-900 dark:to-rose-950 text-pink-700",
      "bg-gradient-to-br from-cyan-100 to-sky-50 dark:from-cyan-900 dark:to-sky-950 text-cyan-700",
    ];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-sub dark:text-gray-400">
            {language === "ko" ? "일자리 목록을 불러오는 중..." : "Loading jobs..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 lg:px-10 py-8 flex flex-col gap-8">
        {/* Page Header & Search */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              {language === "ko" ? "일자리 찾기" : "Find Jobs"}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base font-normal">
              {language === "ko"
                ? "한국에서의 새로운 시작, easyK가 검증된 일자리를 연결해드립니다."
                : "Start your new journey in Korea. easyK connects you with verified job opportunities."}
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Text Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#252f3e] text-text-main dark:text-white placeholder:text-text-sub focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder={
                    language === "ko"
                      ? "직종, 회사명 또는 지역을 입력하세요 (예: 제조업, 평택)"
                      : "Enter job title, company, or location (e.g., Manufacturing, Pyeongtaek)"
                  }
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub">
                  <span className="material-symbols-outlined">search</span>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Job Type Filter */}
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="flex items-center justify-between gap-2 h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#252f3e] text-sm font-medium hover:border-primary dark:hover:border-primary transition-colors min-w-[140px] text-text-main dark:text-white outline-none cursor-pointer"
                >
                  <option value="">{language === "ko" ? "직종 전체" : "All Types"}</option>
                  <option value="manufacturing">{language === "ko" ? "제조업" : "Manufacturing"}</option>
                  <option value="construction">{language === "ko" ? "건설" : "Construction"}</option>
                  <option value="logistics">{language === "ko" ? "물류" : "Logistics"}</option>
                </select>

                {/* Salary Filter */}
                <select
                  value={selectedSalary}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                  className="flex items-center justify-between gap-2 h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#252f3e] text-sm font-medium hover:border-primary dark:hover:border-primary transition-colors min-w-[140px] text-text-main dark:text-white outline-none cursor-pointer"
                >
                  <option value="">{language === "ko" ? "급여 전체" : "All Salaries"}</option>
                  <option value="under300">{language === "ko" ? "300만원 미만" : "Under 3M KRW"}</option>
                  <option value="300-400">{language === "ko" ? "300-400만원" : "3M-4M KRW"}</option>
                  <option value="over400">{language === "ko" ? "400만원 이상" : "Over 4M KRW"}</option>
                </select>

                {/* Employment Type Filter */}
                <select
                  value={selectedEmploymentType}
                  onChange={(e) => setSelectedEmploymentType(e.target.value)}
                  className="flex items-center justify-between gap-2 h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#252f3e] text-sm font-medium hover:border-primary dark:hover:border-primary transition-colors min-w-[140px] text-text-main dark:text-white outline-none cursor-pointer"
                >
                  <option value="">{language === "ko" ? "고용형태 전체" : "All Types"}</option>
                  <option value="full-time">{language === "ko" ? "정규직" : "Full-time"}</option>
                  <option value="part-time">{language === "ko" ? "파트타임" : "Part-time"}</option>
                  <option value="contract">{language === "ko" ? "계약직" : "Contract"}</option>
                </select>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="h-12 px-8 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                >
                  {language === "ko" ? "검색하기" : "Search"}
                </button>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
              <span className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider py-1.5 mr-2">
                {language === "ko" ? "추천 검색어:" : "Quick Filters:"}
              </span>
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleQuickFilter(filter.value)}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-text-sub dark:text-gray-300 text-sm font-medium hover:bg-primary/10 hover:text-primary dark:hover:bg-blue-900/50 transition-colors"
                >
                  {filter.label[language as keyof typeof filter.label]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Job List Section */}
        <section className="flex flex-col gap-6">
          {/* List Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              {language === "ko" ? "총" : "Total"} <span className="text-primary">{filteredJobs.length.toLocaleString()}</span>
              {language === "ko" ? "건의 일자리가 있습니다" : " jobs available"}
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-text-sub focus:ring-0 cursor-pointer pr-8 py-0 dark:text-gray-300 outline-none"
              >
                <option value="latest">{language === "ko" ? "최신순" : "Latest"}</option>
                <option value="salary">{language === "ko" ? "급여순" : "Salary"}</option>
                <option value="popular">{language === "ko" ? "인기순" : "Popular"}</option>
              </select>
            </div>
          </div>

          {/* Job Cards Grid */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark rounded-xl p-12 text-center border border-border-light dark:border-border-dark">
              <div className="size-20 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">work_off</span>
              </div>
              <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                {language === "ko" ? "검색 결과가 없습니다" : "No jobs found"}
              </h3>
              <p className="text-text-sub dark:text-gray-400 mb-6">
                {language === "ko"
                  ? "다른 검색어로 다시 시도해보세요"
                  : "Try searching with different keywords"}
              </p>
              <button
                onClick={() => {
                  setSearchKeyword("");
                  setSelectedJobType("");
                  setSelectedSalary("");
                  setSelectedEmploymentType("");
                }}
                className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-sm"
              >
                {language === "ko" ? "필터 초기화" : "Reset Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <article
                  key={job.id}
                  className="group flex flex-col bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 mb-2 flex-wrap">{getJobBadges(job)}</div>
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className="text-text-sub hover:text-primary transition-colors"
                      aria-label={language === "ko" ? "북마크" : "Bookmark"}
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: savedJobs.has(job.id) ? "'FILL' 1" : "'FILL' 0" }}>
                        {savedJobs.has(job.id) ? "bookmark" : "bookmark_border"}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                      <div className={`w-full h-full ${getGradientClass(index)} flex items-center justify-center font-bold text-lg`}>
                        {getCompanyInitial(job.company_name)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-text-main dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {job.position}
                      </h4>
                      <p className="text-sm text-text-sub dark:text-gray-400 mt-0.5 truncate">{job.company_name}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      <span className="font-semibold text-text-main dark:text-gray-200">{job.salary_range || (language === "ko" ? "협의" : "Negotiable")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>
                        {job.employment_type === "full-time"
                          ? language === "ko"
                            ? "주 5일 / 주간 고정"
                            : "5 days/week"
                          : language === "ko"
                            ? "시간협의"
                            : "Flexible"}
                      </span>
                    </div>
                  </div>

                  <Link href={`/jobs/${job.id}`}>
                    <button className="w-full py-2.5 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all duration-200">
                      {language === "ko" ? "상세 보기" : "View Details"}
                    </button>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pagination (if needed in future) */}
        {filteredJobs.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-sub hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-white font-bold">1</button>
            <button className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              2
            </button>
            <button className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              3
            </button>
            <button className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-sub hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        )}
      </main>

      <DesignFooter />
    </div>
  );
}
