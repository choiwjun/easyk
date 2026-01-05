"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

interface Consultation {
  id: string;
  consultation_type: string;
  created_at: string;
  completed_at: string;
  status: string;
  consultant_id: string | null;
}

export default function ConsultationCompletePage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requireAuth();
    fetchConsultation();
  }, []);

  const fetchConsultation = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/consultations/${params.id}`, {
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
      }
    } catch (error) {
      console.error("Failed to fetch consultation:", error);
    } finally {
      setIsLoading(false);
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

  const getConsultationNumber = (id: string) => {
    const year = new Date().getFullYear();
    const shortId = id.substring(0, 8).toUpperCase();
    return `#${year}-${shortId}`;
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

  if (!consultation) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "상담 정보를 찾을 수 없습니다." : "Consultation not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[640px] flex flex-col items-center">
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center px-6 pt-10 pb-8">
              <div className="size-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <span
                  className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h1 className="text-text-main dark:text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
                {language === "ko" ? "상담이 완료되었습니다" : "Consultation Completed"}
              </h1>
              <p className="text-text-sub dark:text-gray-400 text-base font-normal leading-relaxed max-w-md mb-6">
                {language === "ko" ? (
                  <>
                    전문 변호사와의 상담이 성공적으로 완료되었습니다. <br className="hidden sm:block" />
                    상담 내역은 마이페이지에서 언제든지 확인하실 수 있습니다.
                  </>
                ) : (
                  <>
                    Your consultation with a professional lawyer has been completed. <br className="hidden sm:block" />
                    You can view the consultation history anytime in My Page.
                  </>
                )}
              </p>
            </div>

            {/* Progress Bar - All Completed */}
            <div className="px-6 py-2">
              <div className="relative flex justify-between items-center max-w-[400px] mx-auto mb-8">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary -z-10 -translate-y-1/2"></div>

                {/* Step 1: 신청 접수 (완료) */}
                <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="text-xs font-medium text-primary dark:text-blue-400">
                    {language === "ko" ? "신청 접수" : "Received"}
                  </span>
                </div>

                {/* Step 2: 매칭 완료 */}
                <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="text-xs font-medium text-primary dark:text-blue-400">
                    {language === "ko" ? "매칭 완료" : "Matched"}
                  </span>
                </div>

                {/* Step 3: 상담 완료 */}
                <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="text-xs font-bold text-primary dark:text-white">
                    {language === "ko" ? "상담 완료" : "Completed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="px-6 md:px-10 pb-8">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-bold text-text-main dark:text-white mb-3">
                  {language === "ko" ? "상담 요약" : "Consultation Summary"}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub dark:text-gray-500">
                      {language === "ko" ? "접수 번호" : "Reference No."}
                    </span>
                    <span className="text-sm font-medium text-text-main dark:text-white font-display">
                      {getConsultationNumber(consultation.id)}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub dark:text-gray-500">
                      {language === "ko" ? "신청 일자" : "Application Date"}
                    </span>
                    <span className="text-sm font-medium text-text-main dark:text-white font-display">
                      {formatDate(consultation.created_at)}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub dark:text-gray-500">
                      {language === "ko" ? "완료 일자" : "Completion Date"}
                    </span>
                    <span className="text-sm font-medium text-text-main dark:text-white font-display">
                      {consultation.completed_at ? formatDate(consultation.completed_at) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="px-6 md:px-10 pb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5">campaign</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">
                      {language === "ko" ? "후기를 남겨주세요" : "Leave a Review"}
                    </h4>
                    <p className="text-sm text-text-sub dark:text-gray-400 leading-relaxed mb-4">
                      {language === "ko"
                        ? "상담은 만족스러우셨나요? 귀하의 소중한 후기는 다른 외국인 주민들에게 큰 도움이 됩니다."
                        : "Were you satisfied with the consultation? Your valuable review helps other foreign residents."}
                    </p>
                    <Link
                      href={`/consultations/${params.id}/review`}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-[#164a85] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">rate_review</span>
                      <span>{language === "ko" ? "후기 작성하기" : "Write Review"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-10 pb-10 flex flex-col gap-3">
              <Link
                href={`/consultations/${params.id}`}
                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-[#164a85] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm"
              >
                {language === "ko" ? "상담 내역 상세 보기" : "View Consultation Details"}
              </Link>
              <Link
                href="/consultations"
                className="w-full h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-base font-medium leading-normal transition-colors"
              >
                {language === "ko" ? "내 상담 목록으로" : "Back to My Consultations"}
              </Link>
            </div>

            {/* Footer Note */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 text-center border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-text-sub dark:text-gray-500">
                {language === "ko" ? (
                  <>
                    추가 상담이 필요하신가요?{" "}
                    <Link href="/consultations/new?type=visa" className="text-primary hover:underline font-medium ml-1">
                      새로운 상담 신청하기
                    </Link>
                  </>
                ) : (
                  <>
                    Need additional consultation?{" "}
                    <Link href="/consultations/new?type=visa" className="text-primary hover:underline font-medium ml-1">
                      Apply for New Consultation
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Additional Services */}
          <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/jobs"
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">work</span>
                <div>
                  <h3 className="text-sm font-bold text-text-main dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {language === "ko" ? "일자리 찾기" : "Find Jobs"}
                  </h3>
                  <p className="text-xs text-text-sub dark:text-gray-400">
                    {language === "ko"
                      ? "외국인을 위한 맞춤 일자리를 찾아보세요"
                      : "Find jobs tailored for foreigners"}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/supports"
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">volunteer_activism</span>
                <div>
                  <h3 className="text-sm font-bold text-text-main dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {language === "ko" ? "정부 지원 조회" : "Government Support"}
                  </h3>
                  <p className="text-xs text-text-sub dark:text-gray-400">
                    {language === "ko" ? "받을 수 있는 정부 지원금을 확인하세요" : "Check available government support"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
