"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

const CONSULTATION_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  visa: { ko: "비자/출입국", en: "Visa/Immigration" },
  labor: { ko: "근로/노동", en: "Labor/Employment" },
  contract: { ko: "계약/기타", en: "Contract/Other" },
  business: { ko: "사업/창업", en: "Business/Startup" },
  other: { ko: "기타", en: "Other" },
};

const CONSULTATION_METHOD_LABELS: Record<string, { ko: string; en: string }> = {
  email: { ko: "이메일 상담", en: "Email Consultation" },
  document: { ko: "문서 검토", en: "Document Review" },
  call: { ko: "전화 상담", en: "Phone Consultation" },
  video: { ko: "화상 상담", en: "Video Consultation" },
};

interface UserInfo {
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string;
  residential_area: string | null;
}

export default function ConsultationConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get form data from URL params
  const consultationType = searchParams.get("type") || "";
  const content = searchParams.get("content") || "";
  const consultationMethod = searchParams.get("method") || "";
  const preferredLawyer = searchParams.get("lawyer") || "";

  useEffect(() => {
    requireAuth();
    fetchUserInfo();

    // Redirect if no form data
    if (!consultationType || !content || !consultationMethod) {
      router.push("/consultations");
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consultation_type: consultationType,
          content: content,
          consultation_method: consultationMethod,
          amount: 50000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/consultations/${data.id}/processing`);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.message ||
            (language === "ko" ? "상담 신청에 실패했습니다." : "Failed to submit consultation.")
        );
      }
    } catch (error) {
      setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.back();
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = CONSULTATION_TYPE_LABELS[type as keyof typeof CONSULTATION_TYPE_LABELS];
    return typeLabels?.[language as keyof typeof typeLabels] || type;
  };

  const getMethodLabel = (method: string) => {
    const methodLabels = CONSULTATION_METHOD_LABELS[method as keyof typeof CONSULTATION_METHOD_LABELS];
    return methodLabels?.[language as keyof typeof methodLabels] || method;
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "로딩 중..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4 text-text-main dark:text-white">
          <div className="size-6 text-primary">
            <span className="material-symbols-outlined !text-[24px]">gavel</span>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight dark:text-white">easyK</h2>
        </div>

        {/* Progress Stepper (Desktop) */}
        <div className="hidden md:flex flex-1 justify-center max-w-lg mx-auto">
          <div className="flex items-center w-full justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border-light dark:bg-gray-700 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-surface-light dark:bg-surface-dark px-2">
              <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-xs font-medium text-text-secondary dark:text-gray-400">
                {language === "ko" ? "유형 선택" : "Type Selection"}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-surface-light dark:bg-surface-dark px-2">
              <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-xs font-medium text-text-secondary dark:text-gray-400">
                {language === "ko" ? "내용 작성" : "Write Details"}
              </span>
            </div>

            {/* Step 3 - Active */}
            <div className="flex flex-col items-center gap-2 bg-surface-light dark:bg-surface-dark px-2">
              <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md shadow-primary/20">
                3
              </div>
              <span className="text-sm font-bold text-primary">
                {language === "ko" ? "확인 및 제출" : "Confirm & Submit"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            <Link className="text-sm font-medium hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors" href="/">
              {language === "ko" ? "서비스 소개" : "About"}
            </Link>
            <Link className="text-sm font-medium hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors" href="/profile">
              {language === "ko" ? "마이페이지" : "My Page"}
            </Link>
          </div>
          <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary/10 hover:bg-primary/20 text-primary dark:text-blue-300 text-sm font-bold transition-colors">
            <span>{language === "ko" ? "로그아웃" : "Logout"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-4 md:px-6">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          {/* Page Heading */}
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-tight">
              {language === "ko" ? "상담 내용 확인" : "Consultation Confirmation"}
            </h1>
            <p className="text-text-secondary dark:text-gray-400 text-sm md:text-base">
              {language === "ko"
                ? "전문 변호사에게 전달될 내용입니다. 작성하신 정보를 마지막으로 꼼꼼히 확인해 주세요."
                : "This information will be sent to a professional lawyer. Please review your information carefully."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </p>
            </div>
          )}

          {/* Main Card */}
          <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
            {/* Section: Basic Info */}
            <div className="p-6 md:p-8 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <span className="material-symbols-outlined !text-[20px]">person</span>
                <h3 className="font-bold text-lg dark:text-white">
                  {language === "ko" ? "신청자 기본 정보" : "Applicant Information"}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                    {language === "ko" ? "이름" : "Name"}
                  </span>
                  <span className="text-sm md:text-base font-medium text-text-main dark:text-gray-200">
                    {userInfo.last_name} {userInfo.first_name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                    {language === "ko" ? "연락처" : "Contact"}
                  </span>
                  <span className="text-sm md:text-base font-medium text-text-main dark:text-gray-200">
                    {userInfo.phone_number || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                    {language === "ko" ? "이메일" : "Email"}
                  </span>
                  <span className="text-sm md:text-base font-medium text-text-main dark:text-gray-200">
                    {userInfo.email}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                    {language === "ko" ? "거주 지역" : "Residence"}
                  </span>
                  <span className="text-sm md:text-base font-medium text-text-main dark:text-gray-200">
                    {userInfo.residential_area || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Consultation Details */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <span className="material-symbols-outlined !text-[20px]">description</span>
                <h3 className="font-bold text-lg dark:text-white">
                  {language === "ko" ? "상담 상세 내용" : "Consultation Details"}
                </h3>
              </div>
              <div className="flex flex-col gap-6">
                {/* Category & Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                      {language === "ko" ? "상담 분야" : "Category"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-primary dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-700/30">
                        {getTypeLabel(consultationType)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                      {language === "ko" ? "상담 방법" : "Consultation Method"}
                    </span>
                    <span className="text-sm md:text-base font-medium text-text-main dark:text-gray-200">
                      {getMethodLabel(consultationMethod)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                      {language === "ko" ? "희망 변호사" : "Preferred Lawyer"}
                    </span>
                    <span className="text-sm md:text-base font-medium text-text-main dark:text-gray-200">
                      {preferredLawyer
                        ? language === "ko"
                          ? "지정됨"
                          : "Selected"
                        : language === "ko"
                        ? "선택 안 함 (가장 빠른 배정)"
                        : "No preference (Auto-assign)"}
                    </span>
                  </div>
                </div>
                <div className="w-full h-px bg-border-light dark:bg-border-dark"></div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wide">
                    {language === "ko" ? "문의 내용" : "Inquiry Content"}
                  </span>
                  <div className="rounded-lg bg-background-light dark:bg-black/20 p-4 border border-border-light dark:border-border-dark">
                    <p className="text-sm leading-relaxed text-text-main dark:text-gray-300 whitespace-pre-line">
                      {content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 flex gap-3 items-start border border-blue-100 dark:border-blue-800/30">
            <span className="material-symbols-outlined text-primary dark:text-blue-400 shrink-0 mt-0.5 !text-[20px]">
              lock
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-primary dark:text-blue-300">
                {language === "ko" ? "개인정보 보호 및 보안 안내" : "Privacy & Security Notice"}
              </p>
              <p className="text-xs md:text-sm text-text-main dark:text-gray-300 leading-normal">
                {language === "ko"
                  ? "제출된 상담 내용은 변호사법 및 개인정보보호법에 따라 철저히 비밀이 보장됩니다. 상담 목적 이외의 용도로는 절대 사용되지 않으며, 상담 완료 후 일정 기간 경과 시 자동 파기됩니다."
                  : "Your consultation content is strictly protected under Attorney-Client Privilege and Personal Information Protection Act. It will never be used for purposes other than consultation, and will be automatically destroyed after a certain period."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-4 pt-4 pb-12">
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="w-full md:w-auto min-w-[160px] h-12 rounded-lg border border-border-light dark:border-gray-600 bg-white dark:bg-transparent text-text-main dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined !text-[18px]">edit</span>
              {language === "ko" ? "내용 수정" : "Edit Content"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full md:w-auto min-w-[240px] h-12 rounded-lg bg-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:bg-blue-700 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>{language === "ko" ? "제출 중..." : "Submitting..."}</span>
                </>
              ) : (
                <>
                  <span>{language === "ko" ? "상담 신청 완료" : "Complete Application"}</span>
                  <span className="material-symbols-outlined !text-[20px]">send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
