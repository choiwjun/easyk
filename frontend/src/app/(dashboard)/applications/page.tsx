"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Application {
  id: string;
  job_id: string;
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary_min: number;
    salary_max: number;
  };
  applicant_id: string;
  applicant: {
    first_name: string;
    last_name: string;
    email: string;
  };
  status: string;
  resume: string;
  cover_letter: string;
  available_from: string;
  available_to: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "검토 중",
  under_review: "검토 중",
  shortlisted: "면접 대기",
  rejected: "거절",
  hired: "채용됨",
};

const STATUS_VARIANTS: Record<string, "info" | "warning" | "success" | "error"> = {
  pending: "info",
  under_review: "info",
  shortlisted: "warning",
  rejected: "error",
  hired: "success",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async (status?: string) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const statusParam = status && status !== "all" ? `?status=${status}` : "";
      const response = await fetch(`/api/applications${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
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

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchApplications(status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  const getFilteredApplications = () => {
    if (statusFilter === "all") {
      return applications;
    }
    return applications.filter((app) => app.status === statusFilter);
  };

  const getStatusVariant = (status: string): "info" | "warning" | "success" | "error" => {
    return STATUS_VARIANTS[status] || "info";
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
            지원 내역
          </h1>
          <p className="text-gray-600">
            총 {applications.length}개의 지원 내역이 있습니다.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 상태 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter("all")}
            >
              전체 ({applications.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter("pending")}
            >
              검토 중 ({applications.filter((a) => a.status === "pending").length})
            </Button>
            <Button
              variant={statusFilter === "under_review" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter("under_review")}
            >
              검토 진행 중 ({applications.filter((a) => a.status === "under_review").length})
            </Button>
            <Button
              variant={statusFilter === "shortlisted" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter("shortlisted")}
            >
              면접 대기 ({applications.filter((a) => a.status === "shortlisted").length})
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter("rejected")}
            >
              거절 ({applications.filter((a) => a.status === "rejected").length})
            </Button>
            <Button
              variant={statusFilter === "hired" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter("hired")}
            >
              채용됨 ({applications.filter((a) => a.status === "hired").length})
            </Button>
          </div>
        </div>

        {/* 지원 내역 목록 */}
        {getFilteredApplications().length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">표시할 지원 내역이 없습니다.</p>
            <Button onClick={() => router.push("/jobs")} variant="primary">
              공고 목록으로 이동
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredApplications().map((application) => (
              <Card
                key={application.id}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {application.job.title}
                      </h2>
                      <Badge variant={getStatusVariant(application.status)}>
                        {STATUS_LABELS[application.status] || application.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      회사: {application.job.company_name}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      위치: {application.job.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(application.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {application.job.salary_min.toLocaleString()} -
                      {application.job.salary_max.toLocaleString()}원
                    </p>
                  </div>
                </div>

                {/* 이력서 및 자기소개서 요약 */}
                <div className="mb-4">
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">이력서:</span> {application.resume.substring(0, 100)}...
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">자기소개서:</span> {application.cover_letter.substring(0, 100)}...
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/jobs/${application.job_id}`)}
                    className="flex-1"
                  >
                    공고 보기
                  </Button>
                  {application.status === "hired" && (
                    <Button
                      variant="primary"
                      onClick={() => alert("축하합니다! 채용이 확정되었습니다.")}
                      className="flex-1"
                    >
                      🎉 채용 확정
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
