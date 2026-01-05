"use client";

import { useEffect, useState, useRef } from "react";
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
  status: string;
  consultant_id: string | null;
}

export default function ConsultationProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requireAuth();
    fetchConsultation();

    // 5초마다 상태 폴링 (매칭 완료 시 자동 리다이렉트)
    pollingInterval.current = setInterval(() => {
      fetchConsultation();
    }, 5000);

    // 컴포넌트 언마운트 시 폴링 중지
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
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

        // 상태에 따른 자동 리다이렉트
        if (data.status === "matched" || data.status === "scheduled") {
          // 매칭 완료 시 3초 후 결제 페이지로 이동
          setTimeout(() => {
            router.push(`/consultations/${params.id}/payment`);
          }, 3000);
        } else if (data.status === "completed") {
          // 상담 완료 시 완료 페이지로 이동
          router.push(`/consultations/${params.id}/complete`);
        }
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
    // 상담 ID를 접수번호 형식으로 변환
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

  // 상태에 따른 UI 설정
  const isMatched = consultation.status === "matched" || consultation.status === "scheduled";
  const progressWidth = isMatched ? "100%" : "50%";

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[640px] flex flex-col items-center">
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center px-6 pt-10 pb-8">
              <div
                className={`size-20 rounded-full flex items-center justify-center mb-6 ${
                  isMatched
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "bg-blue-50 dark:bg-blue-900/20 text-primary animate-pulse"
                }`}
              >
                <span className="material-symbols-outlined text-4xl" style={isMatched ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {isMatched ? "check_circle" : "manage_search"}
                </span>
              </div>
              <h1 className="text-text-main dark:text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
                {isMatched
                  ? language === "ko"
                    ? "변호사 매칭 완료!"
                    : "Lawyer Matched!"
                  : language === "ko"
                  ? "변호사 매칭 중입니다"
                  : "Matching with a Lawyer"}
              </h1>
              <p className="text-text-sub dark:text-gray-400 text-base font-normal leading-relaxed max-w-md mb-6">
                {isMatched ? (
                  language === "ko" ? (
                    <>
                      전문 변호사와의 매칭이 완료되었습니다! <br className="hidden sm:block" />
                      잠시 후 결제 페이지로 이동합니다.
                    </>
                  ) : (
                    <>
                      Successfully matched with a professional lawyer! <br className="hidden sm:block" />
                      Redirecting to payment page shortly.
                    </>
                  )
                ) : language === "ko" ? (
                  <>
                    상담 신청이 성공적으로 접수되었습니다. <br className="hidden sm:block" />
                    현재 귀하의 사건에 적합한 전문 변호사를 찾고 있습니다.
                  </>
                ) : (
                  <>
                    Your consultation request has been successfully received. <br className="hidden sm:block" />
                    We are currently finding a suitable lawyer for your case.
                  </>
                )}
              </p>
              {!isMatched && (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                  <span className="material-symbols-outlined text-primary dark:text-blue-400 text-[20px]">timer</span>
                  <span className="text-sm font-bold text-primary dark:text-blue-100 tracking-tight">
                    {language === "ko" ? "예상 대기 시간 : 약 24시간 이내" : "Expected Wait : Within 24 hours"}
                  </span>
                </div>
              )}
              {isMatched && (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 shadow-sm">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[20px]">rocket_launch</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-100 tracking-tight">
                    {language === "ko" ? "3초 후 자동 이동..." : "Auto redirect in 3 seconds..."}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-2">
              <div className="relative flex justify-between items-center max-w-[400px] mx-auto mb-8">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 dark:bg-gray-700 -z-10 -translate-y-1/2"></div>
                <div
                  className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-1000"
                  style={{ width: progressWidth }}
                ></div>

                {/* Step 1: 신청 접수 (완료) */}
                <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="text-xs font-medium text-primary dark:text-blue-400">
                    {language === "ko" ? "신청 접수" : "Received"}
                  </span>
                </div>

                {/* Step 2: 매칭 중/완료 */}
                <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center ${
                      isMatched
                        ? "bg-primary text-white"
                        : "bg-white dark:bg-gray-800 border-2 border-primary"
                    }`}
                  >
                    {isMatched ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      <div className="size-2.5 rounded-full bg-primary animate-pulse"></div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isMatched ? "text-primary dark:text-blue-400" : "text-primary dark:text-white"
                    }`}
                  >
                    {language === "ko" ? "매칭 중" : "Matching"}
                  </span>
                </div>

                {/* Step 3: 매칭 완료 */}
                <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center ${
                      isMatched
                        ? "bg-primary text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isMatched ? "check" : "person_search"}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isMatched ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {language === "ko" ? "매칭 완료" : "Completed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="px-6 md:px-10 pb-8">
              <div className={`rounded-xl p-5 border ${
                isMatched
                  ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
              }`}>
                <div className="flex items-start gap-4 mb-4">
                  <span className={`material-symbols-outlined mt-0.5 ${
                    isMatched ? "text-green-600 dark:text-green-400" : "text-primary"
                  }`}>
                    {isMatched ? "celebration" : "info"}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">
                      {isMatched
                        ? language === "ko" ? "매칭 성공!" : "Match Successful!"
                        : language === "ko" ? "다음 단계 안내" : "Next Steps"}
                    </h4>
                    <p className="text-sm text-text-sub dark:text-gray-400 leading-relaxed">
                      {isMatched ? (
                        language === "ko" ? (
                          <>
                            귀하의 사건에 가장 적합한 전문 변호사가 배정되었습니다.
                            결제를 완료하시면 상담을 시작하실 수 있습니다.
                          </>
                        ) : (
                          <>
                            A lawyer most suitable for your case has been assigned.
                            You can start the consultation after completing payment.
                          </>
                        )
                      ) : language === "ko" ? (
                        <>
                          전문 변호사가 배정되면 <strong>카카오톡 알림톡</strong>과 <strong>이메일</strong>로 즉시
                          안내해 드립니다.
                        </>
                      ) : (
                        <>
                          When a lawyer is assigned, you will be notified immediately via <strong>KakaoTalk</strong> and{" "}
                          <strong>Email</strong>.
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full my-3"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-sub dark:text-gray-500 mb-1">
                      {language === "ko" ? "접수 번호" : "Reference No."}
                    </p>
                    <p className="text-sm font-medium text-text-main dark:text-white font-display">
                      {getConsultationNumber(consultation.id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-sub dark:text-gray-500 mb-1">
                      {language === "ko" ? "신청 일자" : "Application Date"}
                    </p>
                    <p className="text-sm font-medium text-text-main dark:text-white font-display">
                      {formatDate(consultation.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-10 pb-10 flex flex-col gap-3">
              <Link
                href="/consultations/my"
                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-[#164a85] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm"
              >
                {language === "ko" ? "내 상담 내역 확인" : "View My Consultations"}
              </Link>
              <Link
                href="/"
                className="w-full h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-base font-medium leading-normal transition-colors"
              >
                {language === "ko" ? "메인으로 돌아가기" : "Back to Home"}
              </Link>
            </div>

            {/* Footer Note */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 text-center border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-text-sub dark:text-gray-500">
                {language === "ko" ? (
                  <>
                    문의사항이 있으신가요?{" "}
                    <Link href="/faq" className="text-primary hover:underline font-medium ml-1">
                      고객센터 연결하기
                    </Link>
                  </>
                ) : (
                  <>
                    Have questions?{" "}
                    <Link href="/faq" className="text-primary hover:underline font-medium ml-1">
                      Contact Support
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 flex items-center gap-2 text-text-sub dark:text-gray-500 opacity-80">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="text-sm">
              {language === "ko"
                ? "easyK는 검증된 변호사만을 연결해 드립니다."
                : "easyK connects you only with verified lawyers."}
            </span>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
