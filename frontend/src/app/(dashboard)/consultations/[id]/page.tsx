"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import DesignHeader from "@/components/ui/DesignHeader";

const CONSULTATION_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  visa: { ko: "출입국/비자", en: "Visa/Immigration" },
  labor: { ko: "근로/노동", en: "Labor/Employment" },
  contract: { ko: "계약/기타", en: "Contract/Other" },
  business: { ko: "사업/창업", en: "Business/Startup" },
  other: { ko: "기타", en: "Other" },
};

const CONSULTATION_METHOD_LABELS: Record<string, { ko: string; en: string }> = {
  email: { ko: "이메일 상담", en: "Email" },
  document: { ko: "문서 검토", en: "Document" },
  call: { ko: "전화 상담 (15분)", en: "Phone (15 min)" },
  video: { ko: "화상 상담", en: "Video" },
};

const STATUS_LABELS: Record<string, { ko: string; en: string; color: string }> = {
  requested: { ko: "요청됨", en: "Requested", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  matched: { ko: "매칭됨", en: "Matched", color: "bg-blue-50 text-blue-700 border-blue-100" },
  scheduled: { ko: "예정", en: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-100" },
  in_progress: { ko: "진행 중", en: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-100" },
  completed: { ko: "완료됨", en: "Completed", color: "bg-green-50 text-green-700 border-green-100" },
  cancelled: { ko: "취소됨", en: "Cancelled", color: "bg-red-50 text-red-700 border-red-100" },
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
  created_at: string;
  scheduled_at: string | null;
  updated_at: string;
}

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();
  const consultationId = params.id as string;

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    requireAuth();
    fetchConsultation();
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/consultations/${consultationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultation(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        setError(language === "ko" ? "상담 정보를 불러오는데 실패했습니다." : "Failed to load consultation.");
      }
    } catch (error) {
      console.error("Failed to fetch consultation:", error);
      setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConsultation = async () => {
    if (!confirm(language === "ko" ? "정말로 상담을 취소하시겠습니까?" : "Are you sure you want to cancel this consultation?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        alert(language === "ko" ? "상담이 취소되었습니다." : "Consultation cancelled.");
        fetchConsultation();
      } else {
        alert(language === "ko" ? "취소에 실패했습니다." : "Failed to cancel.");
      }
    } catch (error) {
      console.error("Failed to cancel consultation:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === "ko") {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (language === "ko") {
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return language === "ko" ? "방금 전" : "Just now";
    if (diffHours < 24) return language === "ko" ? `${diffHours}시간 전` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return language === "ko" ? `${diffDays}일 전` : `${diffDays}d ago`;
  };

  const getCaseNumber = (id: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const shortId = id.substring(0, 3).toUpperCase();
    return `#${year}${month}${day}-${shortId}`;
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: "requested", label: { ko: "상담 접수", en: "Received" } },
      { key: "matched", label: { ko: "변호사 매칭", en: "Matched" } },
      { key: "in_progress", label: { ko: "상담 진행", en: "In Progress" } },
      { key: "completed", label: { ko: "상담 완료", en: "Completed" } },
    ];

    const currentIndex = steps.findIndex((s) => s.key === status);
    return steps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? "completed" : index === currentIndex ? "active" : "pending",
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "로딩 중..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center gap-4">
        <div className="text-text-sub dark:text-gray-400">
          {error || (language === "ko" ? "상담을 찾을 수 없습니다." : "Consultation not found.")}
        </div>
        <Link
          href="/consultations/my"
          className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-[#164a85] transition-colors"
        >
          {language === "ko" ? "목록으로 돌아가기" : "Back to List"}
        </Link>
      </div>
    );
  }

  const progressSteps = getProgressSteps(consultation.status);
  const statusInfo = STATUS_LABELS[consultation.status] || STATUS_LABELS.requested;
  const typeLabel = CONSULTATION_TYPE_LABELS[consultation.consultation_type];
  const methodLabel = CONSULTATION_METHOD_LABELS[consultation.consultation_method];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6 lg:px-8 lg:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-text-sub mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            {language === "ko" ? "홈" : "Home"}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/profile" className="hover:text-primary transition-colors">
            {language === "ko" ? "마이페이지" : "My Page"}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/consultations/my" className="hover:text-primary transition-colors">
            {language === "ko" ? "상담 내역" : "Consultations"}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-bold text-primary">{language === "ko" ? "상담 상세" : "Detail"}</span>
        </nav>

        {/* Page Heading & Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded text-xs font-bold font-display">
                {getCaseNumber(consultation.id, consultation.created_at)}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${statusInfo.color}`}>
                {statusInfo[language as keyof typeof statusInfo]}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#121417] tracking-tight mb-2">
              {typeLabel?.[language as keyof typeof typeLabel] || consultation.consultation_type}{" "}
              {language === "ko" ? "법률 상담" : "Legal Consultation"}
            </h1>
            <p className="text-text-sub text-sm">
              {language === "ko" ? "상담 요청일" : "Requested"}:{" "}
              {formatDate(consultation.created_at)} | {language === "ko" ? "최근 업데이트" : "Updated"}:{" "}
              {getTimeAgo(consultation.updated_at)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-text-main hover:bg-gray-50 font-bold text-sm transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              {language === "ko" ? "인쇄하기" : "Print"}
            </button>
            {consultation.status !== "cancelled" && consultation.status !== "completed" && (
              <button
                onClick={handleCancelConsultation}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 font-bold text-sm transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                {language === "ko" ? "상담 취소" : "Cancel"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Status Tracker (Horizontal) */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
              <h3 className="text-lg font-bold mb-6">{language === "ko" ? "진행 상태" : "Progress Status"}</h3>
              <div className="relative flex justify-between w-full">
                {/* Line */}
                <div className="absolute top-[15px] left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                <div
                  className="absolute top-[15px] left-0 h-0.5 bg-primary -z-0 transition-all duration-500"
                  style={{
                    width: `${(progressSteps.filter((s) => s.status === "completed").length / (progressSteps.length - 1)) * 100}%`,
                  }}
                ></div>
                {/* Steps */}
                {progressSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center gap-2 z-10 w-24">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                        step.status === "completed"
                          ? "bg-primary text-white"
                          : step.status === "active"
                          ? "bg-white border-2 border-primary text-primary shadow-sm"
                          : "bg-gray-100 border-2 border-gray-200 text-gray-400"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      ) : step.status === "active" ? (
                        <span className="material-symbols-outlined text-[18px] animate-pulse">pending</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">
                          {index === progressSteps.length - 1 ? "flag" : "radio_button_unchecked"}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        step.status === "completed" || step.status === "active" ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {step.label[language as keyof typeof step.label]}
                    </span>
                    {step.status === "active" && (
                      <span className="text-[10px] text-text-sub">{language === "ko" ? "현재 단계" : "Current"}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-4">
                <span className="material-symbols-outlined text-primary">description</span>
                <h3 className="text-lg font-bold">{language === "ko" ? "문제 내용" : "Problem Description"}</h3>
              </div>
              <div className="prose max-w-none text-text-main text-sm leading-relaxed whitespace-pre-line">
                {consultation.content}
              </div>
            </div>

            {/* Messages / Communication History */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">chat</span>
                  <h3 className="text-lg font-bold">{language === "ko" ? "상담 메시지" : "Messages"}</h3>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-gray-300 text-5xl mb-4">chat_bubble_outline</span>
                <p className="text-text-sub text-sm">
                  {language === "ko"
                    ? "아직 메시지가 없습니다. 변호사 배정 후 메시지를 주고받을 수 있습니다."
                    : "No messages yet. You can exchange messages after lawyer assignment."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Lawyer (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Consultation Summary Grid */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
              <h3 className="text-lg font-bold mb-4">
                {language === "ko" ? "상담 정보 요약" : "Consultation Summary"}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-text-sub">{language === "ko" ? "상담 유형" : "Type"}</span>
                  <span className="text-sm font-bold text-text-main flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">call</span>{" "}
                    {methodLabel?.[language as keyof typeof methodLabel]}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-text-sub">{language === "ko" ? "상담 분야" : "Category"}</span>
                  <span className="text-sm font-bold text-text-main bg-gray-100 px-2 py-0.5 rounded">
                    {typeLabel?.[language as keyof typeof typeLabel]}
                  </span>
                </div>
                {consultation.scheduled_at && (
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="text-sm text-text-sub">{language === "ko" ? "상담 예정일" : "Scheduled"}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-main font-display">
                        {formatDateTime(consultation.scheduled_at)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm text-text-sub">{language === "ko" ? "결제 상태" : "Payment"}</span>
                  <span className="text-sm font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      {consultation.payment_status === "completed" ? "check_circle" : "pending"}
                    </span>{" "}
                    {consultation.payment_status === "completed"
                      ? language === "ko"
                        ? "결제 완료"
                        : "Paid"
                      : language === "ko"
                      ? "결제 대기"
                      : "Pending"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mt-2 flex justify-between items-center">
                  <span className="text-sm font-medium">{language === "ko" ? "결제 금액" : "Amount"}</span>
                  <span className="text-lg font-bold font-display">
                    {consultation.amount.toLocaleString()}
                    {language === "ko" ? "원" : " KRW"}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Box */}
            <div className="bg-[#f0f4fa] rounded-xl p-5 border border-blue-100">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">help</span>
                <div>
                  <h4 className="text-sm font-bold text-primary mb-1">
                    {language === "ko" ? "도움이 필요하신가요?" : "Need Help?"}
                  </h4>
                  <p className="text-xs text-text-sub leading-relaxed mb-3">
                    {language === "ko"
                      ? "상담 진행에 어려움이 있거나 변호사 변경을 원하시면 고객센터로 문의해주세요."
                      : "Contact customer service if you need assistance or want to change your lawyer."}
                  </p>
                  <Link href="/faq" className="text-xs font-bold text-primary hover:underline">
                    {language === "ko" ? "고객센터 바로가기 →" : "Go to Support →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
