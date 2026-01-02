"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Job, JobCreate, JobUpdate, JobApplicationWithApplicant } from "@/types/job";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "정규직",
  "part-time": "파트타임",
  "contract": "계약직",
  "temporary": "임시직",
};

const STATUS_LABELS: Record<string, string> = {
  "active": "모집중",
  "closed": "마감",
  "expired": "기한만료",
  "draft": "임시저장",
};

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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

      const response = await fetch("/api/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else if (response.status === 403) {
        router.push("/");
      } else {
        setError("일자리 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("정말로 이 일자리 공고를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchJobs();
      } else {
        const data = await response.json();
        alert(data.message || "삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  const handleViewApplicants = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowApplicants(true);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">일자리 관리</h1>
          <Button variant="primary" onClick={handleCreateJob}>
            + 새 공고 작성
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">등록된 일자리가 없습니다.</p>
            <Button variant="primary" onClick={handleCreateJob}>
              첫 공고 작성하기
            </Button>
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
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {job.position}
                      </h2>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          job.status === "active"
                            ? "bg-green-100 text-green-800"
                            : job.status === "closed"
                            ? "bg-gray-100 text-gray-800"
                            : job.status === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {STATUS_LABELS[job.status]}
                      </span>
                    </div>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplicants(job.id)}
                    >
                      지원자 ({job.id})
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showJobForm && (
        <JobFormModal
          job={editingJob}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            setShowJobForm(false);
            setEditingJob(null);
            fetchJobs();
          }}
        />
      )}

      {showApplicants && selectedJobId && (
        <ApplicantsModal
          jobId={selectedJobId}
          onClose={() => {
            setShowApplicants(false);
            setSelectedJobId(null);
          }}
        />
      )}
    </div>
  );
}

interface JobFormModalProps {
  job: Job | null;
  onClose: () => void;
  onSuccess: () => void;
}

function JobFormModal({ job, onClose, onSuccess }: JobFormModalProps) {
  const [formData, setFormData] = useState<JobCreate>({
    position: job?.position || "",
    company_name: job?.company_name || "",
    company_phone: job?.company_phone || "",
    company_address: job?.company_address || "",
    location: job?.location || "",
    employment_type: job?.employment_type || "full-time",
    salary_range: job?.salary_range || "",
    salary_currency: job?.salary_currency || "KRW",
    description: job?.description || "",
    requirements: job?.requirements || "",
    preferred_qualifications: job?.preferred_qualifications || "",
    benefits: job?.benefits || "",
    required_languages: job?.required_languages || [],
    status: job?.status || "active",
    deadline: job?.deadline ? job.deadline.split("T")[0] : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      };

      const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || "작업에 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {job ? "일자리 공고 수정" : "새 일자리 공고 작성"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직종 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회사명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회사 전화번호
              </label>
              <input
                type="text"
                value={formData.company_phone}
                onChange={(e) =>
                  setFormData({ ...formData, company_phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회사 주소
              </label>
              <input
                type="text"
                value={formData.company_address}
                onChange={(e) =>
                  setFormData({ ...formData, company_address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                근무 지역 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                고용 형태 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.employment_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employment_type: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full-time">정규직</option>
                <option value="part-time">파트타임</option>
                <option value="contract">계약직</option>
                <option value="temporary">임시직</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                급여 범위
              </label>
              <input
                type="text"
                placeholder="예: 3,000,000 - 4,000,000"
                value={formData.salary_range}
                onChange={(e) =>
                  setFormData({ ...formData, salary_range: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                마감일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                공고 상태 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">모집중</option>
                <option value="closed">마감</option>
                <option value="draft">임시저장</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                업무 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                필수 요구사항
              </label>
              <textarea
                rows={3}
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우대사항
              </label>
              <textarea
                rows={3}
                value={formData.preferred_qualifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferred_qualifications: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                복리후생
              </label>
              <textarea
                rows={3}
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="flex-1"
            >
              {job ? "수정" : "작성"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ApplicantsModalProps {
  jobId: string;
  onClose: () => void;
}

function ApplicantsModal({ jobId, onClose }: ApplicantsModalProps) {
  const [applicants, setApplicants] = useState<JobApplicationWithApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchApplicants();
  }, [statusFilter]);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      const queryString = params.toString();

      const url = `/api/jobs/${jobId}/applications${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplicants(data);
      } else {
        const data = await response.json();
        setError(data.message || "지원자 목록 조회 실패");
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">지원자 목록</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태 필터
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="applied">지원완료</option>
              <option value="in_review">검토중</option>
              <option value="accepted">합격</option>
              <option value="rejected">불합격</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">로딩 중...</div>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">지원자가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((application) => (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.applicant.last_name}
                        {application.applicant.first_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.applicant.email}
                      </p>
                      {application.applicant.phone_number && (
                        <p className="text-sm text-gray-600">
                          {application.applicant.phone_number}
                        </p>
                      )}
                      {application.applicant.nationality && (
                        <p className="text-sm text-gray-600">
                          국적: {application.applicant.nationality}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        application.status === "applied"
                          ? "bg-blue-100 text-blue-800"
                          : application.status === "in_review"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status === "applied"
                        ? "지원완료"
                        : application.status === "in_review"
                        ? "검토중"
                        : application.status === "accepted"
                        ? "합격"
                        : "불합격"}
                    </span>
                  </div>

                  {application.cover_letter && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        자기소개서
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  {application.resume_url && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        이력서
                      </p>
                      <a
                        href={application.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        이력서 보기
                      </a>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    지원일시: {formatDate(application.applied_at)}
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
