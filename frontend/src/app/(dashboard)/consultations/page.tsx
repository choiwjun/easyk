"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface Consultation {
  id: string;
  consultation_type: string;
  consultation_method: string;
  content: string;
  amount: number;
  status: string;
  payment_status: string;
  consultant_id: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  requested: "요청됨",
  matched: "매칭됨",
  scheduled: "예약됨",
  completed: "완료됨",
  cancelled: "취소됨",
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  requested: "default",
  matched: "info",
  scheduled: "warning",
  completed: "success",
  cancelled: "error",
};

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

export default function ConsultationsPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

      const response = await fetch("http://localhost:8000/api/consultations", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError("상담 목록을 불러오는데 실패했습니다.");
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">내 상담 신청</h1>
          <Link href="/consultations/new">
            <Button variant="primary">새 상담 신청</Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {consultations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">아직 신청한 상담이 없습니다.</p>
            <Link href="/consultations/new">
              <Button variant="primary">첫 상담 신청하기</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {CONSULTATION_TYPE_LABELS[consultation.consultation_type] || consultation.consultation_type}
                      </h2>
                      <Badge variant={STATUS_VARIANTS[consultation.status]}>
                        {STATUS_LABELS[consultation.status] || consultation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(consultation.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatAmount(consultation.amount)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-2">{consultation.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      상담 방법: {CONSULTATION_METHOD_LABELS[consultation.consultation_method] || consultation.consultation_method}
                    </span>
                    {consultation.consultant_id && (
                      <span className="text-blue-600">전문가 매칭됨</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/consultations/${consultation.id}`)}
                  >
                    상세보기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
