"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import DesignHeader from "@/components/ui/DesignHeader";
import { useLanguage } from "@/contexts/LanguageContext";

interface RejectedApplicationDetail {
  id: string;
  job: {
    title: string;
    company_name: string;
    logo_url?: string;
  };
  created_at: string;
  rejected_at: string;
}

// 샘플 데이터
const SAMPLE_REJECTED_DATA: RejectedApplicationDetail = {
  id: "app-002",
  job: {
    title: "웹 개발자 (Web Developer)",
    company_name: "삼성물산 (Samsung C&T)",
    logo_url: "",
  },
  created_at: "2026-01-05T10:00:00",
  rejected_at: "2026-01-10T14:00:00",
};

export default function RejectedResultPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const applicationId = params.id as string;

  const [rejectedData, setRejectedData] = useState<RejectedApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRejectedData();
  }, [applicationId]);

  const fetchRejectedData = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setRejectedData({ ...SAMPLE_REJECTED_DATA, id: applicationId });
        setIsLoading(false);
        return;
      }

      // 실제 API 호출 (추후 구현)
      setRejectedData({ ...SAMPLE_REJECTED_DATA, id: applicationId });
    } catch {
      setRejectedData({ ...SAMPLE_REJECTED_DATA, id: applicationId });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, ". ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="text-[#657486] dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!rejectedData) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#657486] dark:text-gray-400 mb-4">지원 정보를 찾을 수 없습니다.</p>
          <Link href="/applications" className="text-primary hover:underline">
            지원 내역으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] text-[#121417] dark:text-white flex flex-col">
      <DesignHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-[560px] flex flex-col gap-6">
          {/* Notification Card */}
          <div className="bg-white dark:bg-[#1e2732] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 p-8 md:p-10 text-center">
            {/* Icon Status */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400">
              <span className="material-symbols-outlined text-[32px]">info</span>
            </div>

            <h1 className="mb-3 text-2xl md:text-[28px] font-bold text-[#121417] dark:text-white">
              지원 결과 안내
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8 px-2">
              아쉽지만, 지원하신 공고에 대한 결과가 거절되었습니다.
              <br className="hidden md:block" />
              더 좋은 기회가 회원님을 기다리고 있을 거예요.
              <br className="hidden md:block" />
              easyK가 회원님의 앞날을 항상 응원합니다.
            </p>

            {/* Job Summary Box */}
            <div className="mb-8 rounded-xl bg-gray-50 dark:bg-[#121820] border border-gray-100 dark:border-gray-700 p-4 text-left">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                  {rejectedData.job.logo_url ? (
                    <div
                      className="h-full w-full bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url("${rejectedData.job.logo_url}")` }}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-gray-400">apartment</span>
                  )}
                </div>
                <div className="flex flex-col justify-center h-16">
                  <h3 className="font-bold text-[#121417] dark:text-white text-base md:text-lg truncate line-clamp-1">
                    {rejectedData.job.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {rejectedData.job.company_name}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="material-symbols-outlined text-gray-400 text-[16px]">calendar_today</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  지원일: {formatDate(rejectedData.created_at)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/jobs"
                className="flex w-full items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-white h-12 md:h-14 px-6 text-base font-bold transition-all shadow-md hover:shadow-lg group"
              >
                <span className="mr-2">새로운 일자리 검색</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link
                href="/applications"
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 h-12 md:h-14 px-6 text-base font-bold transition-all"
              >
                내 지원 내역 확인
              </Link>
            </div>
          </div>

          {/* Footer / Help Link */}
          <div className="text-center">
            <Link
              href="/support"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
            >
              채용 결과에 대해 궁금한 점이 있으신가요?
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
