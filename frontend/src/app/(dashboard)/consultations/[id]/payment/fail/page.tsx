"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const errorMessage = searchParams.get("message") || (language === "ko" ? "결제 처리 중 오류가 발생했습니다." : "Payment processing error.");

  const handleRetry = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[640px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Error Icon & Message */}
            <div className="flex flex-col items-center text-center px-6 pt-10 pb-8">
              <div className="size-24 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-6 animate-pulse">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cancel
                </span>
              </div>
              <h1 className="text-text-main dark:text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
                {language === "ko" ? "결제 실패" : "Payment Failed"}
              </h1>
              <p className="text-text-sub dark:text-gray-400 text-base font-normal leading-relaxed max-w-md mb-2">
                {language === "ko" ? (
                  <>
                    결제 처리 중 오류가 발생했습니다. <br className="hidden sm:block" />
                    다시 시도해주세요.
                  </>
                ) : (
                  <>
                    An error occurred during payment processing. <br className="hidden sm:block" />
                    Please try again.
                  </>
                )}
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 shadow-sm mt-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">error</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-100 tracking-tight">{errorMessage}</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="px-6 md:px-10 pb-8">
              <div className="rounded-xl p-5 border bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                  <div>
                    <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">
                      {language === "ko" ? "결제 실패 원인" : "Common Failure Reasons"}
                    </h4>
                    <ul className="text-sm text-text-sub dark:text-gray-400 leading-relaxed space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-text-sub mt-0.5">remove</span>
                        {language === "ko" ? "카드 정보가 잘못 입력되었습니다" : "Incorrect card information"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-text-sub mt-0.5">remove</span>
                        {language === "ko" ? "카드 한도가 초과되었습니다" : "Card limit exceeded"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-text-sub mt-0.5">remove</span>
                        {language === "ko" ? "네트워크 연결이 불안정합니다" : "Unstable network connection"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-text-sub mt-0.5">remove</span>
                        {language === "ko"
                          ? "결제 수단에 문제가 있습니다"
                          : "Issue with payment method"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-10 pb-10 flex flex-col gap-3">
              <button
                onClick={handleRetry}
                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-[#164a85] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                {language === "ko" ? "다시 시도" : "Try Again"}
              </button>
              <Link
                href="/consultations/my"
                className="w-full h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-base font-medium leading-normal transition-colors gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                {language === "ko" ? "상담 목록으로" : "Back to Consultations"}
              </Link>
            </div>

            {/* Footer Note */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 text-center border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-text-sub dark:text-gray-400">
                {language === "ko"
                  ? "문제가 계속되면 고객센터로 연락해주세요"
                  : "Contact customer service if the problem persists"}
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentFailContent />
    </Suspense>
  );
}
