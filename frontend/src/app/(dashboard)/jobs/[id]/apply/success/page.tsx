"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import DesignHeader from "@/components/ui/DesignHeader";

interface ApplicationData {
  position: string;
  companyName: string;
  appliedDate: string;
}

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    position: searchParams.get("position") || "지원한 포지션",
    companyName: searchParams.get("company") || "회사명",
    appliedDate: new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, ".").replace(".", ""),
  });

  // 날짜 포맷 수정
  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    setApplicationData(prev => ({
      ...prev,
      appliedDate: formattedDate,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] text-[#121417] dark:text-white flex flex-col overflow-x-hidden">
      {/* Top Navigation Bar */}
      <DesignHeader />

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-[640px] flex flex-col items-center">
          {/* Success Card */}
          <div className="w-full bg-white dark:bg-[#1a222c] rounded-xl shadow-lg border border-[#f0f2f4] dark:border-[#2a3441] overflow-hidden p-8 md:p-12 animate-fade-in-up">
            {/* Icon & Headline */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <span
                  className="material-symbols-outlined text-[48px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#121417] dark:text-white mb-3">
                지원이 성공적으로 완료되었습니다!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
                지원서를 신중하게 검토 후 연락드리겠습니다.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-[#f6f7f8] dark:bg-[#202934] rounded-lg p-6 mb-8 border border-[#e5e7eb] dark:border-[#2a3441]">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                지원 내역 요약
              </h3>
              <div className="grid grid-cols-[100px_1fr] gap-y-4 gap-x-4 items-center">
                {/* Item 1 */}
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">지원 포지션</div>
                <div className="font-semibold text-[#121417] dark:text-white text-base">{applicationData.position}</div>
                {/* Item 2 */}
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">회사명</div>
                <div className="font-semibold text-[#121417] dark:text-white text-base">{applicationData.companyName}</div>
                {/* Item 3 */}
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">접수일</div>
                <div className="font-medium text-[#121417] dark:text-white text-base">{applicationData.appliedDate}</div>
              </div>
            </div>

            {/* Info Text */}
            <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                결과는 <strong>&apos;내 지원 내역&apos;</strong>에서 실시간으로 확인하실 수 있습니다.<br />
                서류 합격 시 이메일 및 문자로 개별 연락드립니다.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
              <Link
                href="/applications"
                className="flex-1 h-12 bg-primary hover:bg-[#15457a] text-white text-base font-bold rounded-lg transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">assignment</span>
                내 지원 내역 보기
              </Link>
              <Link
                href="/"
                className="flex-1 h-12 bg-white dark:bg-transparent border border-[#dce0e5] dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#121417] dark:text-white text-base font-bold rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                메인으로 돌아가기
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-600">
              도움이 필요하신가요?{" "}
              <Link href="/support" className="underline hover:text-primary">
                고객센터 문의하기
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
