"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

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
}

export default function JobsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 필터 및 검색 상태
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "full-time": language === 'ko' ? "정규직" : "Full-time",
      "part-time": language === 'ko' ? "파트타임" : "Part-time",
      "contract": language === 'ko' ? "계약직" : "Contract",
      "temporary": language === 'ko' ? "임시직" : "Temporary",
    };
    return labels[type] || type;
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Query parameters 구성
      const params = new URLSearchParams();
      if (keyword.trim()) params.append("keyword", keyword.trim());
      if (location.trim()) params.append("location", location.trim());
      if (employmentType) params.append("employment_type", employmentType);

      const queryString = params.toString();
      const url = `/api/jobs${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError(t('errors.networkError'));
      }
    } catch (error) {
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    fetchJobs();
  };

  const handleFilterChange = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Query parameters 구성
      const params = new URLSearchParams();
      if (keyword.trim()) params.append("keyword", keyword.trim());
      if (location.trim()) params.append("location", location.trim());
      if (employmentType) params.append("employment_type", employmentType);

      const queryString = params.toString();
      const url = `/api/jobs${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else if (response.status === 403) {
        router.push("/login");
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

  if (isLoading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('jobs.title')}</h1>
          <LanguageSelector />
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* 키워드 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('jobs.filter.category')}
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={language === 'ko' ? "직종, 회사명으로 검색" : "Search by position, company"}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary">
                  {t('common.search')}
                </Button>
              </div>
            </div>

            {/* 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 지역 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('jobs.filter.location')}
                </label>
                <Input
                  type="text"
                  placeholder={language === 'ko' ? "예: 서울시 강남구" : "Ex: Gangnam-gu, Seoul"}
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>

              {/* 고용 형태 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('jobs.filter.industry')}
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => {
                    setEmploymentType(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('common.all')}</option>
                  <option value="full-time">{getEmploymentTypeLabel('full-time')}</option>
                  <option value="part-time">{getEmploymentTypeLabel('part-time')}</option>
                  <option value="contract">{getEmploymentTypeLabel('contract')}</option>
                  <option value="temporary">{getEmploymentTypeLabel('temporary')}</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 일자리 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">{t('common.loading')}</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">
              {keyword || location || employmentType
                ? (language === 'ko' ? "검색 조건에 맞는 일자리가 없습니다." : "No jobs match your search criteria.")
                : (language === 'ko' ? "등록된 일자리가 없습니다." : "No jobs available.")}
            </p>
            {(keyword || location || employmentType) && (
              <Button
                variant="outline"
                onClick={() => {
                  setKeyword("");
                  setLocation("");
                  setEmploymentType("");
                  fetchJobs();
                }}
              >
                {t('common.clear')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.position}
                    </h2>
                    <p className="text-lg text-gray-700 mb-2">{job.company_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>
                        {getEmploymentTypeLabel(job.employment_type)}
                      </span>
                      {job.salary_range && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-gray-900">
                            {job.salary_range}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-2">{job.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    {language === 'ko' ? "마감일: " : "Deadline: "}
                    {formatDate(job.deadline)}
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="primary" size="sm">
                      {t('common.detail')}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
