"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  visa: "비자/체류",
  labor: "노동/고용",
  contract: "계약/법률",
  business: "사업/창업",
  other: "기타",
};

const CONSULTATION_METHOD_LABELS: Record<string, string> = {
  email: "이메일",
  document: "문서",
  call: "전화",
  video: "화상",
};

const STATUS_LABELS: Record<string, string> = {
  requested: "요청됨",
  matched: "매칭됨",
  scheduled: "예약됨",
  completed: "완료됨",
  cancelled: "취소됨",
};

interface Consultation {
  id: string;
  consultation_type: string;
  consultation_method: string;
  content: string;
  amount: number;
  status: string;
  payment_status: string;
  consultant_id: string | null;
  consultant?: {
    id: string;
    office_name: string;
    years_experience: number;
    average_rating: number;
    specialties: string[];
  };
  created_at: string;
  scheduled_at?: string;
}

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const consultationId = params.id as string;

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchConsultation();
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/consultations", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.find((c: Consultation) => c.id === consultationId);
        if (found) {
          setConsultation(found);
        } else {
          setError("상담 정보를 찾을 수 없습니다.");
        }
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError("상담 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("정말 상담을 취소하시겠습니까?")) {
      return;
    }

    setIsCancelling(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push("/consultations");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "취소에 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsCancelling(false);
    }
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(language === 'ko' ? "ko-KR" : "en-US", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-red-600 mb-4">{error || "상담 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/consultations")}>
            상담 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const canCancel = consultation.status === "requested" || consultation.status === "matched";
  const canPay = consultation.status === "matched" && !consultation.payment_status || consultation.payment_status === "pending";
  const canReview = consultation.status === "completed";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/consultations")}
          >
            ← 상담 목록으로 돌아가기
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 상담 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">상담 상세</h1>

          {/* 상태 배지 */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-600">상태:</span>
            <Badge variant={getStatusVariant(consultation.status)}>
              {getStatusLabel(consultation.status)}
            </Badge>
            {consultation.payment_status && (
              <span className="text-sm text-gray-600">
                ({consultation.payment_status})
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 왼쪽: 상담 정보 */}
            <div className="space-y-6">
              {/* 상담 유형 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">상담 유형</h2>
                <p className="text-gray-700 p-3 bg-gray-50 rounded-md">
                  {CONSULTATION_TYPE_LABELS[consultation.consultation_type] || consultation.consultation_type}
                </p>
              </div>

              {/* 상담 방법 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">상담 방법</h2>
                <p className="text-gray-700 p-3 bg-gray-50 rounded-md">
                  {CONSULTATION_METHOD_LABELS[consultation.consultation_method] || consultation.consultation_method}
                </p>
              </div>

              {/* 상담 내용 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">상담 내용</h2>
                <p className="text-gray-700 whitespace-pre-wrap p-3 bg-gray-50 rounded-md">
                  {consultation.content}
                </p>
              </div>

              {/* 상담료 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">상담료</h2>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(consultation.amount)}
                </p>
              </div>
            </div>

            {/* 오른쪽: 전문가 정보 및 액션 */}
            <div className="space-y-6">
              {/* 전문가 정보 */}
              {consultation.consultant ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">전문가 정보</h2>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">사무소명</p>
                      <p className="font-medium text-gray-900">
                        {consultation.consultant.office_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">경력</p>
                      <p className="font-medium text-gray-900">
                        {consultation.consultant.years_experience}년
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">평점</p>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl text-yellow-400">⭐</span>
                        <span className="font-medium text-gray-900">
                          {consultation.consultant.average_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    {consultation.consultant.specialties && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">전문 분야</p>
                        <div className="flex flex-wrap gap-2">
                          {consultation.consultant.specialties.map((specialty: string) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">전문가 매칭 대기</h2>
                  <p className="text-sm text-gray-600">
                    현재 전문가 매칭이 진행 중입니다. 일반적으로 1~2일 내에 전문가가 배정됩니다.
                  </p>
                </div>
              )}

              {/* 예약 정보 */}
              {consultation.scheduled_at && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">상담 예정</h2>
                  <p className="font-medium text-gray-900">
                    {formatDate(consultation.scheduled_at)}
                  </p>
                </div>
              )}

              {/* 생성 일시 */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600 mb-1">신청 일시</p>
                <p className="font-medium text-gray-900">
                  {formatDate(consultation.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-4 flex-wrap">
              {/* 취소 버튼 */}
              {canCancel && (
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  loading={isCancelling}
                >
                  상담 취소
                </Button>
              )}

              {/* 결제 버튼 */}
              {canPay && (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/consultations/${consultationId}/payment`)}
                >
                  결제하기
                </Button>
              )}

              {/* 후기 작성 버튼 */}
              {canReview && (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/consultations/${consultationId}/review`)}
                >
                  후기 작성하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

