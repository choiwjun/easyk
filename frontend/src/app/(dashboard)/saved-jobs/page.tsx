"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

interface Job {
  id: string;
  title: string;
  position?: string;
  company_name: string;
  location: string;
  employment_type: string;
  salary_min: number;
  salary_max: number;
  salary_range?: string;
  description: string;
  requirements: string[];
  created_at: string;
  deadline?: string;
}

interface SavedJob {
  job_id: string;
  saved_at: string;
}

const TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  "full-time": { ko: "정규직", en: "Full-time" },
  "part-time": { ko: "파트타임", en: "Part-time" },
  "temporary": { ko: "임시직", en: "Temporary" },
  "contract": { ko: "계약직", en: "Contract" },
};

export default function SavedJobsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const savedJobsData = localStorage.getItem("saved_jobs");
      if (savedJobsData) {
        const parsed = JSON.parse(savedJobsData);
        setSavedJobs(parsed);

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
      setError(language === 'ko' ? '저장된 공고를 불러오는데 실패했습니다.' : 'Failed to load saved jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (jobId: string) => {
    const confirmMsg = language === 'ko'
      ? '이 공고를 관심 목록에서 제거하시겠습니까?'
      : 'Remove this job from saved list?';
    if (!confirm(confirmMsg)) return;

    try {
      const updatedSavedJobs = savedJobs.filter((job) => job.job_id !== jobId);
      setSavedJobs(updatedSavedJobs);
      setJobs(jobs.filter((job) => job.id !== jobId));
      localStorage.setItem("saved_jobs", JSON.stringify(updatedSavedJobs));
    } catch (error) {
      alert(language === 'ko' ? '삭제하는데 실패했습니다.' : 'Failed to remove.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? "ko-KR" : "en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSalary = (job: Job) => {
    if (job.salary_range) return job.salary_range;
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}${language === 'ko' ? '원' : ' KRW'}`;
    }
    return language === 'ko' ? '협의' : 'Negotiable';
  };

  const getTypeLabel = (type: string) => {
    return TYPE_LABELS[type]?.[language as keyof typeof TYPE_LABELS[typeof type]] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <DesignHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-sub dark:text-gray-400">
              {language === 'ko' ? '로딩 중...' : 'Loading...'}
            </span>
          </div>
        </div>
        <DesignFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
        <div className="w-full max-w-[960px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/" className="text-text-sub dark:text-gray-400 font-medium hover:text-primary">
              {language === 'ko' ? '홈' : 'Home'}
            </Link>
            <span className="text-text-sub dark:text-gray-500">/</span>
            <Link href="/profile" className="text-text-sub dark:text-gray-400 font-medium hover:text-primary">
              {language === 'ko' ? '마이페이지' : 'My Page'}
            </Link>
            <span className="text-text-sub dark:text-gray-500">/</span>
            <span className="text-text-main dark:text-gray-200 font-bold">
              {language === 'ko' ? '관심 공고' : 'Saved Jobs'}
            </span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              {language === 'ko' ? '관심 공고' : 'Saved Jobs'}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base">
              {language === 'ko'
                ? `저장한 총 ${jobs.length}개의 공고가 있습니다.`
                : `You have ${jobs.length} saved job(s).`
              }
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </p>
            </div>
          )}

          {/* Job List */}
          {jobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">
                  bookmark_border
                </span>
                <p className="text-text-sub dark:text-gray-400 text-base">
                  {language === 'ko' ? '저장된 공고가 없습니다.' : 'No saved jobs.'}
                </p>
                <Link
                  href="/jobs"
                  className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-[#164a85] transition-colors"
                >
                  {language === 'ko' ? '일자리 찾아보기' : 'Browse Jobs'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Job Info */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300">
                          {getTypeLabel(job.employment_type)}
                        </span>
                        {job.deadline && (
                          <span className="text-xs text-text-sub dark:text-gray-400">
                            {language === 'ko' ? '마감' : 'Deadline'}: {formatDate(job.deadline)}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="text-lg md:text-xl font-bold text-text-main dark:text-white group-hover:text-primary transition-colors cursor-pointer"
                      >
                        {job.title || job.position}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-sub dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">business</span>
                          {job.company_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {job.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-primary">
                          {formatSalary(job)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-bold transition-colors"
                        >
                          {language === 'ko' ? '상세 보기' : 'View'}
                        </button>
                        <button
                          onClick={() => router.push(`/jobs/${job.id}/apply`)}
                          className="px-4 py-2 rounded-lg bg-primary hover:bg-[#164a85] text-white text-sm font-bold transition-colors"
                        >
                          {language === 'ko' ? '지원하기' : 'Apply'}
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(job.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        {language === 'ko' ? '삭제' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Link */}
          <div className="mt-4">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              {language === 'ko' ? '일자리 목록으로 돌아가기' : 'Back to Job List'}
            </Link>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
