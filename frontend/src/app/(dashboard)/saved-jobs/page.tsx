"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  salary_min: number;
  salary_max: number;
  description: string;
  requirements: string[];
  created_at: string;
}

interface SavedJob {
  job_id: string;
  saved_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  "full-time": "정규직",
  "part-time": "비정규직",
  "temporary": "임시직",
  "contract": "계약직",
};

const SALARY_LABELS: Record<string, string> = {
  "hourly": "시급",
  "daily": "일급",
  "monthly": "월급",
  "yearly": "연봉",
};

export default function SavedJobsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      // 로컬 스토리지에서 저장된 공고 목록 가져오기
      const savedJobsData = localStorage.getItem("saved_jobs");
      if (savedJobsData) {
        const parsed = JSON.parse(savedJobsData);
        setSavedJobs(parsed);

        // 각 공고의 상세 정보 가져오기
        const jobDetails = await Promise.all(
          parsed.map(async (savedJob: SavedJob) => {
            const token = localStorage.getItem("access_token");
            if (!token) return null;

            try {
              const response = await fetch(`/api/jobs/${savedJob.job_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (response.ok) {
                return await response.json();
              }
              return null;
            } catch (error) {
              console.error("Failed to fetch job details:", error);
              return null;
            }
          })
        );

        setJobs(jobDetails.filter((job) => job !== null));
      }
    } catch (error) {
      setError("저장된 공고를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (jobId: string) => {
    if (!confirm("이 공고를 관심 목록에서 제거하시겠습니까?")) return;

    try {
      const updatedSavedJobs = savedJobs.filter((job) => job.job_id !== jobId);
      setSavedJobs(updatedSavedJobs);
      setJobs(jobs.filter((job) => job.id !== jobId));

      // 로컬 스토리지 업데이트
      localStorage.setItem("saved_jobs", JSON.stringify(updatedSavedJobs));
    } catch (error) {
      alert("삭제하는데 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  const formatSalary = (min: number, max: number) => {
    const minFormatted = min.toLocaleString();
    const maxFormatted = max.toLocaleString();
    return `${minFormatted} - ${maxFormatted}원`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            관심 공고 목록
          </h1>
          <p className="text-gray-600">
            저장한 총 {jobs.length}개의 공고가 있습니다.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 공고 목록 */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">저장된 공고가 없습니다.</p>
            <Button onClick={() => router.push("/jobs")} variant="primary">
              공고 목록으로 이동
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h2>
                      <Badge variant="info">{TYPE_LABELS[job.employment_type] || job.employment_type}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      회사: {job.company_name}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      위치: {job.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(job.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </p>
                  </div>
                </div>

                {/* 요구사항 */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">요구사항:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                    {job.requirements.length > 3 && (
                      <li>+{job.requirements.length - 3}개 항목</li>
                    )}
                  </ul>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="flex-1"
                  >
                    상세 보기
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/jobs/${job.id}/apply`)}
                    className="flex-1"
                  >
                    지원하기
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRemove(job.id)}
                    size="sm"
                  >
                    제거
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

