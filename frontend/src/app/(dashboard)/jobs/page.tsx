"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "정규직",
  "part-time": "파트타임",
  "contract": "계약직",
  "temporary": "임시직",
};

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 필터 및 검색 상태
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");

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
        setError("일자리 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
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
        setError("일자리 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">일자리 찾기</h1>

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* 키워드 검색 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드 검색
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="직종, 회사명으로 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="primary">
                    검색
                  </Button>
                </div>
              </div>

              {/* 필터 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 지역 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    지역
                  </label>
                  <Input
                    type="text"
                    placeholder="예: 서울시 강남구"
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
                    고용 형태
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => {
                      setEmploymentType(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전체</option>
                    <option value="full-time">정규직</option>
                    <option value="part-time">파트타임</option>
                    <option value="contract">계약직</option>
                    <option value="temporary">임시직</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 일자리 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">로딩 중...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">
              {keyword || location || employmentType
                ? "검색 조건에 맞는 일자리가 없습니다."
                : "등록된 일자리가 없습니다."}
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
                필터 초기화
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
                        {EMPLOYMENT_TYPE_LABELS[job.employment_type] ||
                          job.employment_type}
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
                    마감일: {formatDate(job.deadline)}
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="primary" size="sm">
                      상세보기
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

