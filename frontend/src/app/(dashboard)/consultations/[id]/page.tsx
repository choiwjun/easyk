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
  consultant_name?: string;
  created_at: string;
  scheduled_at: string | null;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    nationality?: string;
  };
}

// 샘플 상담 상세 데이터
const SAMPLE_CONSULTATIONS: Record<string, Consultation> = {
  "sample-1": {
    id: "sample-1",
    consultation_type: "visa",
    consultation_method: "video",
    content: "E-9 비자 연장 절차와 필요 서류에 대해 상담 요청드립니다. 현재 체류 기간이 2개월 후 만료됩니다.\n\n구체적으로 알고 싶은 내용:\n1. 비자 연장 신청 가능 시기\n2. 필요한 서류 목록\n3. 처리 소요 기간\n4. 수수료 및 비용\n\n현재 제조업체에서 근무 중이며, 고용주가 연장을 지원해 줄 예정입니다.",
    amount: 50000,
    status: "matched",
    payment_status: "completed",
    consultant_id: "consultant-1",
    consultant_name: "김민수 변호사",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    user: {
      first_name: "Nguyen",
      last_name: "Van Minh",
      email: "nguyen.minh@email.com",
      nationality: "Vietnam",
    },
  },
  "sample-2": {
    id: "sample-2",
    consultation_type: "labor",
    consultation_method: "chat",
    content: "임금 체불 문제로 상담 요청드립니다. 3개월째 급여를 받지 못하고 있으며 법적 대응 방법을 알고 싶습니다.\n\n상황 설명:\n- 근무 기간: 2023년 3월 ~ 현재\n- 체불 기간: 2025년 10월, 11월, 12월 (3개월)\n- 총 체불 금액: 약 650만원\n- 회사 측 반응: 자금 사정이 어렵다며 기다려달라고 함\n\n노동청 진정이나 소송을 고려하고 있는데, 어떤 방법이 효과적일지 조언 부탁드립니다.",
    amount: 30000,
    status: "matched",
    payment_status: "completed",
    consultant_id: "consultant-2",
    consultant_name: "박지영 변호사",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    scheduled_at: null,
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    user: {
      first_name: "Maria",
      last_name: "Santos",
      email: "maria.santos@email.com",
      nationality: "Philippines",
    },
  },
  "sample-3": {
    id: "sample-3",
    consultation_type: "real_estate",
    consultation_method: "video",
    content: "전세 계약 만료 후 보증금 반환 문제가 발생했습니다. 집주인이 보증금 일부만 돌려주겠다고 합니다.\n\n계약 정보:\n- 보증금: 5,000만원\n- 계약 기간: 2023년 2월 ~ 2025년 2월\n- 집주인 주장: 벽지 훼손, 바닥 스크래치로 500만원 공제\n\n입주 시 사진을 찍어두었고, 정상적인 사용에 의한 마모라고 생각합니다. 어떻게 대응해야 할까요?",
    amount: 50000,
    status: "matched",
    payment_status: "completed",
    consultant_id: "consultant-3",
    consultant_name: "이준호 변호사",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    user: {
      first_name: "Zhang",
      last_name: "Wei",
      email: "zhang.wei@email.com",
      nationality: "China",
    },
  },
  "sample-4": {
    id: "sample-4",
    consultation_type: "visa",
    consultation_method: "phone",
    content: "F-2 비자(거주) 자격 변경 조건과 절차에 대해 알고 싶습니다. 현재 E-7 비자로 5년째 체류 중입니다.\n\n현재 상황:\n- 현재 비자: E-7 (특정활동)\n- 체류 기간: 5년 2개월\n- 연봉: 약 5,500만원\n- 한국어 능력: TOPIK 4급\n\n사회통합프로그램(KIIP)은 아직 이수하지 않았는데, 필수인지 궁금합니다.",
    amount: 40000,
    status: "scheduled",
    payment_status: "completed",
    consultant_id: "consultant-1",
    consultant_name: "김민수 변호사",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      first_name: "Tanaka",
      last_name: "Yuki",
      email: "tanaka.yuki@email.com",
      nationality: "Japan",
    },
  },
  "sample-5": {
    id: "sample-5",
    consultation_type: "labor",
    consultation_method: "video",
    content: "산업재해를 당했는데 회사에서 산재 처리를 거부하고 있습니다. 어떻게 해야 하나요?\n\n사고 내용:\n- 발생일: 2025년 12월 15일\n- 장소: 공장 내 작업장\n- 부상: 왼쪽 손목 골절\n- 치료 중: 현재 깁스 착용, 6주 진단\n\n회사 측에서는 개인 부주의라며 산재 신청을 해주지 않고 있습니다. 직접 신청이 가능한지, 어떤 절차를 밟아야 하는지 알고 싶습니다.",
    amount: 50000,
    status: "scheduled",
    payment_status: "completed",
    consultant_id: "consultant-2",
    consultant_name: "박지영 변호사",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      first_name: "Budi",
      last_name: "Santoso",
      email: "budi.santoso@email.com",
      nationality: "Indonesia",
    },
  },
  "sample-6": {
    id: "sample-6",
    consultation_type: "tax",
    consultation_method: "chat",
    content: "한국에서 프리랜서로 일하고 있는데 세금 신고 방법과 공제 항목에 대해 알고 싶습니다.\n\n현재 상황:\n- 직업: IT 프리랜서 (웹 개발)\n- 연 소득: 약 8,000만원\n- 비자: E-7\n- 사업자등록: 미등록\n\n질문:\n1. 사업자등록을 해야 하나요?\n2. 종합소득세 신고 방법\n3. 공제받을 수 있는 항목\n4. 미국과의 이중과세 방지 협정 적용 여부",
    amount: 30000,
    status: "completed",
    payment_status: "completed",
    consultant_id: "consultant-4",
    consultant_name: "최서연 변호사",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@email.com",
      nationality: "USA",
    },
  },
  "sample-7": {
    id: "sample-7",
    consultation_type: "visa",
    consultation_method: "video",
    content: "결혼 비자(F-6) 신청 절차와 필요 서류에 대해 상담받고 싶습니다.\n\n상황:\n- 현재 비자: 관광 (B-2)\n- 한국인 배우자와 결혼 예정\n- 결혼 예정일: 2026년 3월\n\n궁금한 점:\n1. F-6 비자 신청 시기\n2. 필요 서류 목록 (태국 측, 한국 측)\n3. 초청장 작성 방법\n4. 심사 기간 및 통과율",
    amount: 50000,
    status: "completed",
    payment_status: "completed",
    consultant_id: "consultant-1",
    consultant_name: "김민수 변호사",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      first_name: "Somchai",
      last_name: "Prasert",
      email: "somchai.p@email.com",
      nationality: "Thailand",
    },
  },
};

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
      // 샘플 ID인 경우 샘플 데이터 사용
      if (consultationId.startsWith("sample-")) {
        const sampleData = SAMPLE_CONSULTATIONS[consultationId];
        if (sampleData) {
          setConsultation(sampleData);
          setIsLoading(false);
          return;
        }
      }

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
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-10 py-6 lg:py-10">
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
              <div className="prose max-w-none text-text-main text-sm leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">
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
                {(consultation.status === "matched" || consultation.status === "scheduled" || consultation.status === "in_progress") && consultation.consultant_name && (
                  <Link
                    href={`/consultations/${consultation.id}/chat`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    {language === "ko" ? "채팅방 입장" : "Enter Chat"}
                  </Link>
                )}
              </div>
              {(consultation.status === "matched" || consultation.status === "scheduled" || consultation.status === "in_progress") && consultation.consultant_name ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">chat</span>
                  </div>
                  <p className="text-text-main font-bold mb-2">
                    {language === "ko" ? "채팅방이 개설되었습니다!" : "Chat room is ready!"}
                  </p>
                  <p className="text-text-sub text-sm mb-4">
                    {language === "ko"
                      ? "담당 변호사와 실시간으로 상담을 진행할 수 있습니다."
                      : "You can now chat with your assigned lawyer in real-time."}
                  </p>
                  <Link
                    href={`/consultations/${consultation.id}/chat`}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    {language === "ko" ? "상담 시작하기" : "Start Consultation"}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-gray-300 text-5xl mb-4">chat_bubble_outline</span>
                  <p className="text-text-sub text-sm">
                    {language === "ko"
                      ? "아직 메시지가 없습니다. 변호사 배정 후 메시지를 주고받을 수 있습니다."
                      : "No messages yet. You can exchange messages after lawyer assignment."}
                  </p>
                </div>
              )}
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
                    {Math.floor(consultation.amount).toLocaleString()}
                    {language === "ko" ? "원" : " KRW"}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Info (for consultants) */}
            {consultation.user && (
              <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
                <h3 className="text-lg font-bold mb-4">
                  {language === "ko" ? "의뢰인 정보" : "Client Information"}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      {consultation.user.first_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-text-main">
                        {consultation.user.first_name} {consultation.user.last_name}
                      </p>
                      <p className="text-sm text-text-sub">{consultation.user.email}</p>
                    </div>
                  </div>
                  {consultation.user.nationality && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-sub">{language === "ko" ? "국적" : "Nationality"}</span>
                      <span className="text-sm font-medium text-text-main">{consultation.user.nationality}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Consultant Info */}
            {consultation.consultant_name && (
              <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
                <h3 className="text-lg font-bold mb-4">
                  {language === "ko" ? "담당 변호사" : "Assigned Lawyer"}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                    <span className="material-symbols-outlined">gavel</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main">{consultation.consultant_name}</p>
                    <p className="text-sm text-text-sub">{language === "ko" ? "법률 전문가" : "Legal Expert"}</p>
                  </div>
                </div>
              </div>
            )}

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
