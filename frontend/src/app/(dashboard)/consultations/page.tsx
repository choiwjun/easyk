"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function ConsultationsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      requested: language === 'ko' ? "요청됨" : "Requested",
      matched: language === 'ko' ? "매칭됨" : "Matched",
      scheduled: language === 'ko' ? "예약됨" : "Scheduled",
      completed: language === 'ko' ? "완료됨" : "Completed",
      cancelled: language === 'ko' ? "취소됨" : "Cancelled",
    };
    return labels[status] || status;
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      visa: language === 'ko' ? "비자/체류" : "Visa/Residence",
      labor: language === 'ko' ? "노동/고용" : "Labor/Employment",
      contract: language === 'ko' ? "계약/법률" : "Contract/Legal",
      business: language === 'ko' ? "사업/창업" : "Business/Startup",
      other: language === 'ko' ? "기타" : "Other",
    };
    return labels[type] || type;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      email: language === 'ko' ? "이메일" : "Email",
      document: language === 'ko' ? "문서" : "Document",
      call: language === 'ko' ? "전화" : "Call",
      video: language === 'ko' ? "화상" : "Video",
    };
    return labels[method] || method;
  };

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

      const response = await fetch("/api/consultations", {
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
        setError(t('errors.networkError'));
      }
    } catch (error) {
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
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
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('consultations.myConsultations')}</h1>
          <div className="flex items-center gap-4">
            <Link href="/consultations/new">
              <Button variant="primary">{t('consultations.apply')}</Button>
            </Link>
            <LanguageSelector />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {consultations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">{t('consultations.myConsultations')} {t('common.list')}</p>
            <Link href="/consultations/new">
              <Button variant="primary">{t('consultations.apply')}</Button>
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
                        {getTypeLabel(consultation.consultation_type)}
                      </h2>
                      <Badge variant={getStatusVariant(consultation.status)}>
                        {getStatusLabel(consultation.status)}
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
                      {language === 'ko' ? "상담 방법: " : "Method: "}
                      {getMethodLabel(consultation.consultation_method)}
                    </span>
                    {consultation.consultant_id && (
                      <span className="text-blue-600">
                        {language === 'ko' ? "전문가 매칭됨" : "Expert Matched"}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/consultations/${consultation.id}`)}
                  >
                    {t('common.detail')}
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
