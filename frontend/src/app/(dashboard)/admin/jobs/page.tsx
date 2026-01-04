"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRoleGuard } from "@/hooks/useRoleGuard";

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
  benefits: string;
  status: string;
  deadline: string;
  created_at: string;
}

interface Applicant {
  id: string;
  job_id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  };
  resume?: string;
  cover_letter?: string;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: "모집중",
  closed: "마감",
  expired: "만료",
  draft: "임시저장",
};

const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "정규직" },
  { value: "part-time", label: "파트타임" },
  { value: "contract", label: "계약직" },
  { value: "temporary", label: "임시직" },
];

const APPLICANT_STATUS_LABELS: Record<string, string> = {
  pending: "검토중",
  interview_scheduled: "면접대기",
  hired: "채용됨",
  rejected: "거절됨",
};

export default function AdminJobsDashboard() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isAuthorized = useRoleGuard(['admin']);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicants, setShowApplicants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [showEditJobForm, setShowEditJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // 새 공고 폼 상태
  const [newJob, setNewJob] = useState({
    position: "",
    company_name: "고양시청",
    location: "경기도 고양시",
    employment_type: "full-time",
    salary_range: "",
    description: "",
    requirements: "",
    preferred_qualifications: "",
    benefits: "",
  });

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

      const response = await fetch("/api/jobs/admin", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
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

  const fetchApplicants = async (jobId: string) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplicants(data.applications || []);
      } else {
        setError("지원자 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newJob,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (response.ok) {
        setShowNewJobForm(false);
        setNewJob({
          position: "",
          company_name: "고양시청",
          location: "경기도 고양시",
          employment_type: "full-time",
          salary_range: "",
          description: "",
          requirements: "",
          preferred_qualifications: "",
          benefits: "",
        });
        fetchJobs();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "공고 등록에 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingJob) return;

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newJob),
      });

      if (response.ok) {
        setShowEditJobForm(false);
        setEditingJob(null);
        fetchJobs();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "공고 수정에 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("정말 이 공고를 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(jobId);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        if (selectedJob?.id === jobId) {
          setSelectedJob(null);
          setShowApplicants(false);
        }
        fetchJobs();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "공고 삭제에 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCloseJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "closed" }),
      });

      if (response.ok) {
        fetchJobs();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "공고 마감에 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const handleViewApplicants = (job: Job) => {
    setSelectedJob(job);
    setShowApplicants(true);
    fetchApplicants(job.id);
  };

  const handleUpdateApplicantStatus = async (applicantId: string, newStatus: string, reviewerComment?: string) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/applications/${applicantId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          reviewer_comment: reviewerComment || null
        }),
      });

      if (response.ok) {
        alert("지원자 상태가 업데이트되었습니다.");
        if (selectedJob) {
          fetchApplicants(selectedJob.id);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "상태 업데이트에 실패했습니다.");
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
  };

  const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" | "default" => {
    const variants: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
      active: "success",
      closed: "warning",
      expired: "error",
      draft: "default",
    };
    return variants[status] || "default";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ko' ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (!isAuthorized || isLoading) {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">일자리 공고 관리</h1>
          <Button onClick={() => setShowNewJobForm(true)}>
            + 새 공고 등록
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 새 공고 등록 폼 */}
        {showNewJobForm && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">새 공고 등록</h2>
              <Button variant="outline" onClick={() => setShowNewJobForm(false)}>
                닫기
              </Button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-6">
              <Input
                label="직종"
                required
                value={newJob.position}
                onChange={(e) => setNewJob({ ...newJob, position: e.target.value })}
                placeholder="예: 외국인 고용 담당자"
              />
              <Input
                label="회사명"
                required
                value={newJob.company_name}
                onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
              />
              <Input
                label="근무 지역"
                required
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
              />
              <Select
                label="고용 형태"
                options={EMPLOYMENT_TYPES}
                value={newJob.employment_type}
                onChange={(e) => setNewJob({ ...newJob, employment_type: e.target.value })}
                required
              />
              <Input
                label="급여 범위"
                value={newJob.salary_range}
                onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                placeholder="예: 연봉 3,500만원~4,000만원"
              />
              <Textarea
                label="업무 설명"
                required
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                rows={4}
              />
              <Textarea
                label="자격 요건"
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                rows={3}
              />
              <Textarea
                label="우대 사항"
                value={newJob.preferred_qualifications}
                onChange={(e) => setNewJob({ ...newJob, preferred_qualifications: e.target.value })}
                rows={2}
              />
              <Textarea
                label="복지"
                value={newJob.benefits}
                onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                rows={2}
              />
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewJobForm(false)}
                >
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  공고 등록
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 공고 수정 폼 */}
        {showEditJobForm && editingJob && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">공고 수정</h2>
              <Button variant="outline" onClick={() => {
                setShowEditJobForm(false);
                setEditingJob(null);
              }}>
                닫기
              </Button>
            </div>
            <form onSubmit={handleUpdateJob} className="space-y-6">
              <Input
                label="직종"
                required
                value={newJob.position}
                onChange={(e) => setNewJob({ ...newJob, position: e.target.value })}
              />
              <Input
                label="회사명"
                required
                value={newJob.company_name}
                onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
              />
              <Input
                label="근무 지역"
                required
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
              />
              <Select
                label="고용 형태"
                options={EMPLOYMENT_TYPES}
                value={newJob.employment_type}
                onChange={(e) => setNewJob({ ...newJob, employment_type: e.target.value })}
                required
              />
              <Input
                label="급여 범위"
                value={newJob.salary_range}
                onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
              />
              <Textarea
                label="업무 설명"
                required
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                rows={4}
              />
              <Textarea
                label="자격 요건"
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                rows={3}
              />
              <Textarea
                label="우대 사항"
                value={newJob.preferred_qualifications}
                onChange={(e) => setNewJob({ ...newJob, preferred_qualifications: e.target.value })}
                rows={2}
              />
              <Textarea
                label="복지"
                value={newJob.benefits}
                onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                rows={2}
              />
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditJobForm(false);
                    setEditingJob(null);
                  }}
                >
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  저장
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 공고 목록 또는 지원자 목록 */}
        {showApplicants && selectedJob ? (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowApplicants(false);
                setSelectedJob(null);
              }}
            >
              ← 공고 목록으로 돌아가기
            </Button>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedJob.position} - 지원자 목록
              </h2>

              {applicants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">지원자가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {applicant.user.first_name} {applicant.user.last_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {applicant.user.email}
                          </p>
                          {applicant.user.phone_number && (
                            <p className="text-sm text-gray-600">
                              {applicant.user.phone_number}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            지원일: {formatDate(applicant.created_at)}
                          </p>
                        </div>
                        <div>
                          <Badge variant={applicant.status === "hired" ? "success" : "default"}>
                            {APPLICANT_STATUS_LABELS[applicant.status] || applicant.status}
                          </Badge>
                        </div>
                      </div>

                      {applicant.resume && (
                        <div className="mb-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-xs text-gray-600 mb-1">이력서</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicant.resume}</p>
                        </div>
                      )}

                      {applicant.cover_letter && (
                        <div className="mb-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-xs text-gray-600 mb-1">자기소개서</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicant.cover_letter}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        {applicant.status === "pending" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleUpdateApplicantStatus(applicant.id, "interview_scheduled")}
                            >
                              면접 예정
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUpdateApplicantStatus(applicant.id, "rejected")}
                            >
                              거절
                            </Button>
                          </>
                        )}
                        {applicant.status === "interview_scheduled" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleUpdateApplicantStatus(applicant.id, "hired")}
                            >
                              채용 확정
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUpdateApplicantStatus(applicant.id, "rejected")}
                            >
                              거절
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                전체 공고 ({jobs.length}건)
              </h2>
            </div>

            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">등록된 공고가 없습니다.</p>
                <Button
                  onClick={() => setShowNewJobForm(true)}
                  variant="primary"
                  className="mt-4"
                >
                  첫 공고 등록
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {job.position}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{job.company_name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>
                            {EMPLOYMENT_TYPES.find(
                              (t) => t.value === job.employment_type
                            )?.label || job.employment_type}
                          </span>
                          {job.salary_range && (
                            <>
                              <span>•</span>
                              <span className="font-semibold">{job.salary_range}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(job.status)}>
                          {getStatusLabel(job.status)}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-700 line-clamp-2 mb-4">
                      {job.description}
                    </p>

                    <div className="text-sm text-gray-500 mb-4">
                      마감일: {formatDate(job.deadline)}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingJob(job);
                          setNewJob({
                            position: job.position,
                            company_name: job.company_name,
                            location: job.location,
                            employment_type: job.employment_type,
                            salary_range: job.salary_range,
                            description: job.description,
                            requirements: job.requirements,
                            preferred_qualifications: job.preferred_qualifications,
                            benefits: job.benefits,
                          });
                          setShowEditJobForm(true);
                        }}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplicants(job)}
                      >
                        지원자 ({applicants.length})
                      </Button>
                      {job.status === "active" && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleCloseJob(job.id)}
                        >
                          모집 마감
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={isDeleting === job.id}
                        loading={isDeleting === job.id}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
