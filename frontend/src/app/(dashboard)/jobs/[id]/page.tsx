"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Job {
  id: string;
  position: string;
  company_name: string;
  company_phone: string | null;
  company_address: string | null;
  location: string;
  employment_type: string;
  salary_range: string | null;
  salary_currency: string | null;
  description: string;
  requirements: string | null;
  preferred_qualifications: string | null;
  benefits: string | null;
  required_languages: string[] | null;
  status: string;
  deadline: string;
  created_at: string;
  has_applied: boolean;
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "정규직",
  "part-time": "파트타임",
  "contract": "계약직",
  "temporary": "임시직",
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 지원 모달 상태
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");

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

      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else if (response.status === 403) {
        router.push("/login");
      } else if (response.status === 404) {
        setError("일자리를 찾을 수 없습니다.");
      } else {
        setError("일자리 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApplyError("");

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cover_letter: coverLetter.trim() || undefined,
          resume_url: resumeUrl.trim() || undefined,
        }),
      });

      if (response.ok) {
        // 지원 성공: 모달 닫기 및 페이지 새로고침
        setShowApplyModal(false);
        setCoverLetter("");
        setResumeUrl("");
        // 일자리 정보 다시 불러오기 (has_applied 업데이트)
        await fetchJob();
      } else {
        const data = await response.json();
        setApplyError(data.message || data.detail || "지원 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setApplyError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-red-600 mb-4">{error || "일자리를 찾을 수 없습니다."}</p>
            <Link href="/jobs">
              <Button variant="outline">일자리 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              ← 목록으로
            </Button>
          </Link>
        </div>

        {/* 일자리 정보 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.position}</h1>
              <p className="text-xl text-gray-700 mb-4">{job.company_name}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>{job.location}</span>
                <span>•</span>
                <span>
                  {EMPLOYMENT_TYPE_LABELS[job.employment_type] || job.employment_type}
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

          {/* 지원 버튼 */}
          <div className="pt-4 border-t border-gray-200">
            {job.has_applied ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-700 font-medium">이미 지원하신 일자리입니다.</p>
              </div>
            ) : job.status === "active" ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setShowApplyModal(true)}
              >
                지원하기
              </Button>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">모집이 마감된 일자리입니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">모집 상세</h2>

          <div className="space-y-4">
            {/* 직무 설명 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">직무 설명</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* 자격 요건 */}
            {job.requirements && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">자격 요건</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}

            {/* 우대 사항 */}
            {job.preferred_qualifications && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">우대 사항</h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {job.preferred_qualifications}
                </p>
              </div>
            )}

            {/* 복리후생 */}
            {job.benefits && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">복리후생</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{job.benefits}</p>
              </div>
            )}

            {/* 필수 언어 */}
            {job.required_languages && job.required_languages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">필수 언어</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 회사 정보 */}
        {(job.company_phone || job.company_address) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">회사 정보</h2>
            <div className="space-y-2 text-gray-700">
              {job.company_phone && (
                <p>
                  <span className="font-medium">연락처: </span>
                  {job.company_phone}
                </p>
              )}
              {job.company_address && (
                <p>
                  <span className="font-medium">주소: </span>
                  {job.company_address}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 모집 마감일 */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          마감일: {formatDate(job.deadline)}
        </div>
      </div>

      {/* 지원 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">일자리 지원</h2>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setCoverLetter("");
                    setResumeUrl("");
                    setApplyError("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                {applyError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{applyError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자기소개서 (선택사항)
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="자기소개서를 입력해주세요..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이력서 파일 URL (선택사항)
                  </label>
                  <Input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://example.com/resume.pdf"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowApplyModal(false);
                      setCoverLetter("");
                      setResumeUrl("");
                      setApplyError("");
                    }}
                    fullWidth
                    disabled={isSubmitting}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    fullWidth
                  >
                    지원하기
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




