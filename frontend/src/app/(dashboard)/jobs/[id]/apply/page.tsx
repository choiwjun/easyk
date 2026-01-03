"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Navbar from "@/components/ui/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

interface Job {
  id: string;
  position: string;
  company_name: string;
  location: string;
  employment_type: string;
  salary_range: string;
  description: string;
  requirements: string;
  preferred_qualifications: string;
  deadline: string;
}

export default function JobApplyPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 지원서 폼 상태
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");

  const [formErrors, setFormErrors] = useState({
    resume: "",
    coverLetter: "",
    general: "",
  });

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.find((j: Job) => j.id === jobId);
        if (found) {
          setJob(found);
        } else {
          setError("일자리 정보를 찾을 수 없습니다.");
        }
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError("일자리 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      resume: "",
      coverLetter: "",
      general: "",
    };

    let isValid = true;

    if (resume.trim().length < 50) {
      newErrors.resume = "이력서는 최소 50자 이상이어야 합니다.";
      isValid = false;
    }

    if (coverLetter.trim().length > 1000) {
      newErrors.coverLetter = "자기소개서는 1000자 이하여야 합니다.";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setFormErrors({ resume: "", coverLetter: "", general: "" });

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume: resume.trim(),
          cover_letter: coverLetter.trim(),
          available_from: availableFrom || null,
          available_to: availableTo || null,
        }),
      });

      if (response.ok) {
        router.push("/jobs");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "지원에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-red-600 mb-4">{error || "일자리 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/jobs")}>
            일자리 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/jobs")}
            >
              ← 일자리 목록으로 돌아가기
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 공고 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">일자리 지원</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">직종</p>
                <p className="text-lg font-semibold text-gray-900">{job.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">회사명</p>
                <p className="text-lg font-semibold text-gray-900">{job.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">근무 지역</p>
                <p className="text-gray-700">{job.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">마감일</p>
                <p className="text-gray-700">{formatDate(job.deadline)}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">업무 설명</p>
              <p className="text-gray-700">{job.description}</p>
            </div>

            {job.requirements && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">자격 요건</p>
                <p className="text-gray-700">{job.requirements}</p>
              </div>
            )}

            {job.preferred_qualifications && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">우대 사항</p>
                <p className="text-gray-700">{job.preferred_qualifications}</p>
              </div>
            )}
          </div>

          {/* 지원서 폼 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">지원서 작성</h2>

            {formErrors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                label="이력서"
                placeholder="관련 경력, 기술스킬, 자격증 등을 자세히 작성해주세요 (최소 50자)"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                error={formErrors.resume}
                rows={8}
                required
              />

              <Textarea
                label="자기소개서"
                placeholder="이 일자리에 지원하게 된 동기와 어떻게 기여할 수 있을지 작성해주세요 (최대 1000자)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                error={formErrors.coverLetter}
                rows={6}
                maxLength={1000}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="근무 가능 시작일"
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
                <Input
                  label="근무 가능 종료일"
                  type="date"
                  value={availableTo}
                  onChange={(e) => setAvailableTo(e.target.value)}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  ⚠️ 제출하기 전에 내용을 꼼 확인해주세요. 제출 후에는 수정할 수 없습니다.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "제출 중..." : "지원하기"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


