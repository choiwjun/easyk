"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Consultant {
  id: string;
  office_name: string;
  years_experience: number;
  average_rating: number;
  total_reviews: number;
  hourly_rate: number;
  specialties: string[];
  availability?: string;
}

interface Consultation {
  id: string;
  consultation_type: string;
  content: string;
  status: string;
  user: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  requested: "요청됨",
  matched: "매칭됨",
  scheduled: "예약됨",
  completed: "완료됨",
  cancelled: "취소됨",
};

const TYPE_LABELS: Record<string, string> = {
  visa: "비자/체류",
  labor: "노동/고용",
  contract: "계약/법률",
  business: "사업/창업",
  other: "기타",
};

export default function ConsultantsDashboard() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [incomingConsultations, setIncomingConsultations] = useState<Consultation[]>([]);
  const [acceptedConsultations, setAcceptedConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"incoming" | "accepted">("incoming");

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/consultants/incoming", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIncomingConsultations(data.incoming || []);
        setAcceptedConsultations(data.accepted || []);
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

  const handleAccept = async (consultationId: string) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/consultants/incoming/${consultationId}/accept`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchConsultations();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "수락에 실패했습니다.");
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  const handleReject = async (consultationId: string) => {
    const reason = prompt("거절 사유를 입력해주세요:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/consultants/incoming/${consultationId}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchConsultations();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "거절에 실패했습니다.");
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(language === 'ko' ? "ko-KR" : "en-US", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ko' ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "error" | "info" => {
    const variants: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
      requested: "default",
      matched: "info",
      scheduled: "warning",
      completed: "success",
      cancelled: "error",
    };
    return variants[status] || "default";
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전문가 대시보드</h1>
          <p className="text-gray-600">상담 요청을 관리하고 응답하세요.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 탭 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("incoming")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "incoming"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              진입 상담 ({incomingConsultations.length})
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "accepted"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              수락 상담 ({acceptedConsultations.length})
            </button>
          </div>
        </div>

        {/* 상담 목록 */}
        {activeTab === "incoming" && incomingConsultations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">진입 상담 요청이 없습니다.</p>
            <Button onClick={fetchConsultations} variant="outline">
              새로고침
            </Button>
          </div>
        ) : activeTab === "accepted" && acceptedConsultations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">수락한 상담이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(activeTab === "incoming" ? incomingConsultations : acceptedConsultations).map((consultation) => (
              <div
                key={consultation.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {TYPE_LABELS[consultation.consultation_type] || consultation.consultation_type}
                      </h2>
                      <Badge variant={getStatusVariant(consultation.status)}>
                        {getStatusLabel(consultation.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      신청자: {consultation.user.first_name} {consultation.user.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(consultation.created_at)}
                    </p>
                  </div>
                </div>

                {/* 내용 */}
                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-2">{consultation.content}</p>
                </div>

                {/* 액션 버튼 */}
                {activeTab === "incoming" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                      variant="primary"
                      onClick={() => handleAccept(consultation.id)}
                      className="flex-1"
                    >
                      수락
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(consultation.id)}
                      className="flex-1"
                    >
                      거절
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

