"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import DesignHeader from "@/components/ui/DesignHeader";
import { useLanguage } from "@/contexts/LanguageContext";

interface HiredApplicationDetail {
  id: string;
  job: {
    title: string;
    company_name: string;
  };
  user_name: string;
  start_date: string;
  hired_at: string;
}

// 샘플 데이터
const SAMPLE_HIRED_DATA: HiredApplicationDetail = {
  id: "app-001",
  job: {
    title: "창고 관리 및 포장",
    company_name: "(주)스마트물류",
  },
  user_name: "홍길동",
  start_date: "2026년 2월 1일",
  hired_at: "2026-01-06T10:00:00",
};

export default function HiredConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const applicationId = params.id as string;

  const [hiredData, setHiredData] = useState<HiredApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHiredData();
  }, [applicationId]);

  const fetchHiredData = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        // 샘플 데이터 표시
        setHiredData({ ...SAMPLE_HIRED_DATA, id: applicationId });
        setIsLoading(false);
        return;
      }

      // 실제 API 호출 (추후 구현)
      // const response = await fetch(`/api/applications/${applicationId}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // 현재는 샘플 데이터 사용
      setHiredData({ ...SAMPLE_HIRED_DATA, id: applicationId });
    } catch {
      setHiredData({ ...SAMPLE_HIRED_DATA, id: applicationId });
    } finally {
      setIsLoading(false);
    }
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

  if (!hiredData) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#657486] dark:text-gray-400 mb-4">합격 정보를 찾을 수 없습니다.</p>
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

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-[640px] flex flex-col gap-6">
          {/* Success Card */}
          <div className="bg-white dark:bg-[#1a222b] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a3441] overflow-hidden relative">
            {/* Decorative Top Bar */}
            <div className="h-2 w-full bg-primary"></div>

            <div className="p-8 sm:p-12 flex flex-col items-center text-center">
              {/* Icon Animation Wrapper */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full scale-150 opacity-20 animate-pulse"></div>
                <div className="size-20 bg-blue-50 dark:bg-blue-900/50 rounded-full flex items-center justify-center relative z-10 text-primary">
                  <span className="material-symbols-outlined text-[48px]">verified</span>
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121417] dark:text-white mb-3 leading-tight">
                축하합니다!<br />채용이 확정되었습니다!
              </h1>
              <p className="text-[#657486] dark:text-gray-400 text-base sm:text-lg mb-8 font-medium">
                easyK와 함께하는 <span className="text-[#121417] dark:text-white font-bold">{hiredData.user_name}</span>님의
                <br className="sm:hidden" /> 새로운 시작을 응원합니다.
              </p>

              {/* Job Details Box */}
              <div className="w-full bg-[#f6f7f8] dark:bg-[#121920] rounded-xl p-6 sm:p-8 mb-8 border border-gray-100 dark:border-[#2a3441]">
                <div className="grid grid-cols-1 gap-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <span className="text-[#657486] dark:text-gray-400 text-sm mb-1 sm:mb-0">기업명</span>
                    <span className="text-[#121417] dark:text-white font-bold text-base">{hiredData.job.company_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                    <span className="text-[#657486] dark:text-gray-400 text-sm mb-1 sm:mb-0">직무</span>
                    <span className="text-[#121417] dark:text-white font-bold text-base">{hiredData.job.title}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-[#657486] dark:text-gray-400 text-sm mb-1 sm:mb-0">입사 예정일</span>
                    <span className="text-primary font-bold text-base">{hiredData.start_date}</span>
                  </div>
                </div>
              </div>

              {/* Body Text / Instructions */}
              <div className="flex gap-3 items-start text-left bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg mb-8 w-full border border-blue-100 dark:border-blue-800">
                <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
                <p className="text-[#121417] dark:text-gray-300 text-sm leading-relaxed">
                  입사 준비에 필요한 계약서 및 안내 사항은 <strong>가입하신 이메일</strong>로 발송되었습니다.
                  <br className="hidden sm:block" />
                  자세한 진행 상황은 마이페이지 내 [지원 내역]에서 확인하실 수 있습니다.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/applications"
                  className="w-full sm:w-auto min-w-[200px] h-12 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>내 지원 내역 확인하기</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto min-w-[140px] h-12 bg-white dark:bg-[#1a222b] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#121417] dark:text-white text-base font-bold rounded-lg transition-colors flex items-center justify-center"
                >
                  메인으로
                </Link>
              </div>
            </div>
          </div>

          {/* Help Footer */}
          <div className="text-center">
            <p className="text-xs text-[#657486] dark:text-gray-400">
              채용 과정에 대해 궁금한 점이 있으신가요?{" "}
              <Link href="/support" className="text-primary font-bold hover:underline">
                고객센터 문의하기
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
