"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

function PaymentSuccessContent({ consultationId }: { consultationId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    processPaymentCallback();
  }, []);

  const processPaymentCallback = async () => {
    try {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setError(language === "ko" ? "결제 정보가 올바르지 않습니다." : "Invalid payment information.");
        setIsProcessing(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/payments/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parseInt(amount, 10),
          status: "DONE",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(
          data.message || data.detail || (language === "ko" ? "결제 처리 중 오류가 발생했습니다." : "Payment processing error.")
        );
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Payment callback error:", error);
      setError(language === "ko" ? "결제 처리 중 오류가 발생했습니다." : "Payment processing error.");
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-text-main dark:text-white text-lg font-medium">
            {language === "ko" ? "결제 처리 중..." : "Processing payment..."}
          </p>
          <p className="text-text-sub dark:text-gray-400 text-sm mt-2">
            {language === "ko" ? "잠시만 기다려주세요" : "Please wait"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <DesignHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-col items-center text-center px-6 pt-10 pb-8">
              <div className="size-20 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">error</span>
              </div>
              <h1 className="text-text-main dark:text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
                {language === "ko" ? "결제 처리 실패" : "Payment Failed"}
              </h1>
              <p className="text-text-sub dark:text-gray-400 text-base font-normal leading-relaxed max-w-md mb-8">{error}</p>
              <Link
                href="/consultations/my"
                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-[#164a85] text-white text-base font-bold transition-colors shadow-sm gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                {language === "ko" ? "내 상담 목록으로" : "Back to My Consultations"}
              </Link>
            </div>
          </div>
        </div>
        <DesignFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[640px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Success Icon & Message */}
            <div className="flex flex-col items-center text-center px-6 pt-10 pb-8">
              <div className="size-24 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-6 animate-bounce">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h1 className="text-text-main dark:text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
                {language === "ko" ? "결제 완료!" : "Payment Complete!"}
              </h1>
              <p className="text-text-sub dark:text-gray-400 text-base font-normal leading-relaxed max-w-md mb-2">
                {language === "ko" ? (
                  <>
                    결제가 성공적으로 완료되었습니다. <br className="hidden sm:block" />
                    상담 예약이 확정되었습니다.
                  </>
                ) : (
                  <>
                    Payment completed successfully. <br className="hidden sm:block" />
                    Your consultation has been confirmed.
                  </>
                )}
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 shadow-sm mt-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[20px]">email</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-100 tracking-tight">
                  {language === "ko" ? "예약 확인 이메일이 발송되었습니다" : "Confirmation email sent"}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="px-6 md:px-10 pb-8">
              <div className="rounded-xl p-5 border bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">
                      {language === "ko" ? "다음 단계" : "Next Steps"}
                    </h4>
                    <ul className="text-sm text-text-sub dark:text-gray-400 leading-relaxed space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check</span>
                        {language === "ko"
                          ? "담당 변호사가 배정되었습니다"
                          : "A lawyer has been assigned to your case"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check</span>
                        {language === "ko"
                          ? "예약 확인 이메일을 확인해주세요"
                          : "Check your confirmation email"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check</span>
                        {language === "ko"
                          ? "상담 예정일에 변호사가 연락드립니다"
                          : "Your lawyer will contact you on the scheduled date"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-10 pb-10 flex flex-col gap-3">
              <Link
                href={`/consultations/${consultationId}/chat`}
                className="w-full h-12 flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                {language === "ko" ? "상담 시작하기" : "Start Consultation"}
              </Link>
              <Link
                href="/consultations/my"
                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-[#164a85] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                {language === "ko" ? "내 상담 내역 확인" : "View My Consultations"}
              </Link>
              <Link
                href="/"
                className="w-full h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-base font-medium leading-normal transition-colors gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                {language === "ko" ? "홈으로 돌아가기" : "Back to Home"}
              </Link>
            </div>

            {/* Footer Note */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 text-center border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-text-sub dark:text-gray-400">
                {language === "ko"
                  ? "문의사항이 있으시면 고객센터로 연락해주세요"
                  : "Contact customer service if you have any questions"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <DesignFooter />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-text-secondary">로딩 중...</span>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const consultationId = params.id as string;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent consultationId={consultationId} />
    </Suspense>
  );
}
