"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";

interface ReviewData {
  position: string;
  companyName: string;
  resumeFileName: string;
  resumeFileSize: string;
  coverLetterFileName?: string;
  coverLetterFileSize?: string;
  additionalInfo: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  visaType?: string;
  visaExpiry?: string;
  dateOfBirth?: string;
  address?: string;
  portfolioLink?: string;
  profileImage?: string;
}

// 샘플 데이터 ID 체크
const isSampleJobId = (id: string): boolean => {
  return id.startsWith("00000000-0000-0000-0000-");
};

export default function ApplicationReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const jobId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // URL 파라미터에서 데이터 복원
  const [reviewData] = useState<ReviewData>({
    position: searchParams.get("position") || "",
    companyName: searchParams.get("company") || "",
    resumeFileName: searchParams.get("resume") || "",
    resumeFileSize: searchParams.get("resumeSize") || "",
    coverLetterFileName: searchParams.get("coverLetter") || undefined,
    coverLetterFileSize: searchParams.get("coverLetterSize") || undefined,
    additionalInfo: searchParams.get("additionalInfo") || "",
    userName: searchParams.get("userName") || "홍길동 (Hong Gil-dong)",
    userEmail: searchParams.get("userEmail") || "hong.gildong@example.com",
    userPhone: searchParams.get("userPhone") || "010-1234-5678",
    visaType: searchParams.get("visaType") || "D-10 (구직)",
    visaExpiry: searchParams.get("visaExpiry") || "2024.12.31",
    dateOfBirth: searchParams.get("dateOfBirth") || "1995. 05. 20",
    address: searchParams.get("address") || "서울시 마포구 (Mapo-gu, Seoul)",
    portfolioLink: searchParams.get("portfolioLink") || undefined,
    profileImage: searchParams.get("profileImage") || undefined,
  });

  const handleEdit = () => {
    // 수정하기 - 이전 페이지로 돌아가기
    router.back();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      // 샘플 데이터인 경우 바로 성공 페이지로 이동
      if (isSampleJobId(jobId)) {
        const params = new URLSearchParams({
          position: reviewData.position,
          company: reviewData.companyName,
        });
        router.push(`/jobs/${jobId}/apply/success?${params.toString()}`);
        return;
      }

      // 실제 API 호출
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cover_letter: reviewData.additionalInfo,
          resume_url: `uploads/${reviewData.resumeFileName}`,
        }),
      });

      if (response.ok) {
        const params = new URLSearchParams({
          position: reviewData.position,
          company: reviewData.companyName,
        });
        router.push(`/jobs/${jobId}/apply/success?${params.toString()}`);
      } else {
        const errorData = await response.json();
        setError(
          errorData.detail ||
            errorData.message ||
            (language === "ko"
              ? "지원에 실패했습니다. 다시 시도해주세요."
              : "Application failed. Please try again.")
        );
      }
    } catch {
      setError(
        language === "ko"
          ? "네트워크 오류가 발생했습니다."
          : "A network error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] flex flex-col">
      <DesignHeader />

      <div className="flex-1 px-4 md:px-10 lg:px-40 py-10">
        <div className="max-w-[960px] mx-auto flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-col gap-2 p-4 pb-0 text-center">
            <h1 className="text-[#121417] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              지원 정보 최종 확인
            </h1>
            <p className="text-[#657486] dark:text-gray-400 text-base font-normal leading-normal">
              제출하기 전에 입력하신 모든 정보를 정확히 확인해 주세요.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-3 px-4">
            <div className="flex gap-6 justify-between items-end">
              <p className="text-primary text-base font-bold leading-normal">Step 3. 최종 검토</p>
              <p className="text-[#121417] dark:text-white text-sm font-semibold leading-normal">3/3</p>
            </div>
            <div className="rounded-full bg-[#dce0e5] dark:bg-gray-700 h-2.5 overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: "100%" }}></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-6 px-4">
            {/* Section 1: Personal Information */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#121417] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  기본 인적 사항
                </h3>
                <button
                  onClick={handleEdit}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  수정
                </button>
              </div>
              <div className="bg-white dark:bg-[#1a222c] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Profile Photo */}
                  <div className="shrink-0">
                    <div
                      className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden bg-cover bg-center shadow-inner flex items-center justify-center"
                      style={reviewData.profileImage ? { backgroundImage: `url("${reviewData.profileImage}")` } : undefined}
                    >
                      {!reviewData.profileImage && (
                        <span className="material-symbols-outlined text-gray-400 text-4xl">person</span>
                      )}
                    </div>
                  </div>

                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 flex-1 w-full">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#657486] dark:text-gray-400 text-sm font-medium">이름 (Full Name)</p>
                      <p className="text-[#121417] dark:text-white text-base font-semibold">{reviewData.userName}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#657486] dark:text-gray-400 text-sm font-medium">생년월일 (Date of Birth)</p>
                      <p className="text-[#121417] dark:text-white text-base font-medium">{reviewData.dateOfBirth}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#657486] dark:text-gray-400 text-sm font-medium">연락처 (Contact)</p>
                      <p className="text-[#121417] dark:text-white text-base font-medium">{reviewData.userPhone}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#657486] dark:text-gray-400 text-sm font-medium">이메일 (Email)</p>
                      <p className="text-[#121417] dark:text-white text-base font-medium">{reviewData.userEmail}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#657486] dark:text-gray-400 text-sm font-medium">비자 종류 (Visa Type)</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-blue-700/10">
                          {reviewData.visaType}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">Valid until {reviewData.visaExpiry}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#657486] dark:text-gray-400 text-sm font-medium">거주지 (Address)</p>
                      <p className="text-[#121417] dark:text-white text-base font-medium">{reviewData.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Documents */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#121417] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  제출 서류
                </h3>
                <button
                  onClick={handleEdit}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  수정
                </button>
              </div>
              <div className="bg-white dark:bg-[#1a222c] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resume File */}
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-[#e5e7eb] dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="size-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-[#121417] dark:text-white text-sm font-bold truncate">
                        {reviewData.resumeFileName || "Hong_Resume_2024.pdf"}
                      </p>
                      <p className="text-[#657486] dark:text-gray-400 text-xs font-medium">
                        {reviewData.resumeFileSize || "1.2 MB"} • 업로드 완료
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                  </div>

                  {/* Cover Letter File */}
                  {reviewData.coverLetterFileName && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-[#e5e7eb] dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                        <span className="material-symbols-outlined">article</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-[#121417] dark:text-white text-sm font-bold truncate">
                          {reviewData.coverLetterFileName}
                        </p>
                        <p className="text-[#657486] dark:text-gray-400 text-xs font-medium">
                          {reviewData.coverLetterFileSize || "845 KB"} • 업로드 완료
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-green-600">check_circle</span>
                    </div>
                  )}

                  {/* Portfolio Link */}
                  {reviewData.portfolioLink && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-[#e5e7eb] dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group md:col-span-2">
                      <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0">
                        <span className="material-symbols-outlined">link</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-[#121417] dark:text-white text-sm font-bold truncate">Notion Portfolio Link</p>
                        <a
                          href={reviewData.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs font-medium hover:underline truncate"
                        >
                          {reviewData.portfolioLink}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Self Introduction Preview */}
            {reviewData.additionalInfo && (
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#121417] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    자기소개서 요약
                  </h3>
                  <button
                    onClick={handleEdit}
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    수정
                  </button>
                </div>
                <div className="bg-white dark:bg-[#1a222c] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col gap-2">
                    <p className="text-[#121417] dark:text-white text-sm font-bold">지원 동기</p>
                    <p className="text-[#657486] dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                      {reviewData.additionalInfo}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Area */}
          <div className="flex flex-col items-center gap-4 mt-8 pb-10 px-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg border border-amber-100 dark:border-amber-800 max-w-lg w-full justify-center">
              <span className="material-symbols-outlined text-sm">warning</span>
              <p className="text-xs font-medium">최종 제출 후에는 지원서를 수정할 수 없습니다.</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full max-w-[480px]">
              <button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center h-12 px-6 rounded-lg bg-white dark:bg-transparent border border-[#dce0e5] dark:border-gray-600 text-[#121417] dark:text-white text-base font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <span className="truncate">내용 수정</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center h-12 px-6 rounded-lg bg-primary text-white text-base font-bold hover:bg-[#164276] transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                    제출 중...
                  </>
                ) : (
                  <span className="truncate">최종 지원 제출</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
