"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import DesignHeader from "@/components/ui/DesignHeader";
import { useLanguage } from "@/contexts/LanguageContext";

interface ApplicationDetail {
  id: string;
  job_id: string;
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
    deadline: string;
  };
  status: string;
  resume_url: string;
  resume_name: string;
  resume_size: string;
  cover_letter: string;
  cover_letter_name?: string;
  cover_letter_size?: string;
  created_at: string;
  updated_at: string;
  visa_type?: string;
  korean_level?: string;
  expected_salary?: string;
  available_date?: string;
  hr_feedback?: {
    name: string;
    message: string;
    created_at: string;
  };
}

// 상태별 진행 정도 (%)
const STATUS_PROGRESS: Record<string, number> = {
  pending: 20,
  under_review: 40,
  shortlisted: 60,
  interview: 80,
  hired: 100,
  rejected: 0,
};

// 상태 라벨
const STATUS_LABELS: Record<string, { ko: string; en: string }> = {
  pending: { ko: "서류 제출 완료", en: "Submitted" },
  under_review: { ko: "서류 검토 중", en: "Under Review" },
  shortlisted: { ko: "면접 대기", en: "Interview Scheduled" },
  interview: { ko: "면접 진행 중", en: "Interviewing" },
  hired: { ko: "최종 합격", en: "Hired" },
  rejected: { ko: "불합격", en: "Rejected" },
};

// 샘플 데이터
const SAMPLE_APPLICATION: ApplicationDetail = {
  id: "app-001",
  job_id: "00000000-0000-0000-0000-000000000124",
  job: {
    id: "00000000-0000-0000-0000-000000000124",
    title: "창고 관리 및 포장",
    company_name: "스마트물류",
    location: "경기 용인시",
    employment_type: "계약직",
    deadline: "2026-02-16",
  },
  status: "under_review",
  resume_url: "uploads/resume_hong.pdf",
  resume_name: "이력서_홍길동.pdf",
  resume_size: "540 KB",
  cover_letter: "안녕하세요. 저는 물류 분야에서 2년간 경험을 쌓아온 외국인 근로자입니다...",
  cover_letter_name: "자기소개서_홍길동.docx",
  cover_letter_size: "128 KB",
  created_at: "2026-01-05T14:30:00",
  updated_at: "2026-01-06T09:30:00",
  visa_type: "E-9 (비전문취업)",
  korean_level: "TOPIK 3급",
  expected_salary: "회사 내규에 따름",
  available_date: "즉시 가능",
  hr_feedback: {
    name: "인사팀 김담당",
    message: "안녕하세요, 홍길동님. 스마트물류에 지원해 주셔서 감사합니다. 현재 보내주신 이력서를 관련 부서에서 긍정적으로 검토하고 있습니다. 추가적인 서류가 필요할 경우 연락드리겠습니다.",
    created_at: "2026-01-06T09:30:00",
  },
};

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        // 샘플 데이터 표시
        setApplication({ ...SAMPLE_APPLICATION, id: applicationId });
        setIsLoading(false);
        return;
      }

      // 실제 API 호출 (추후 구현)
      // const response = await fetch(`/api/applications/${applicationId}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // 현재는 샘플 데이터 사용
      setApplication({ ...SAMPLE_APPLICATION, id: applicationId });
    } catch {
      setApplication({ ...SAMPLE_APPLICATION, id: applicationId });
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\. /g, ". ");
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status]?.[language === "ko" ? "ko" : "en"] || status;
  };

  const getProgressWidth = (status: string) => {
    return STATUS_PROGRESS[status] || 0;
  };

  const handleCancelApplication = () => {
    // 지원 취소 처리
    setShowCancelModal(false);
    router.push("/applications");
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

  if (!application) {
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

  const isRejected = application.status === "rejected";
  const canCancel = ["pending", "under_review"].includes(application.status);

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] text-[#121417] dark:text-white flex flex-col">
      <DesignHeader />

      <main className="flex-1 py-8 px-4 md:px-40">
        <div className="flex justify-center">
          <div className="max-w-[960px] flex-1 flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
              <Link
                href="/applications"
                className="flex items-center gap-2 text-sm text-[#657486] dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors w-fit"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                지원 내역 목록으로 돌아가기
              </Link>
              <h1 className="text-[#121417] dark:text-white text-3xl font-extrabold leading-tight tracking-[-0.033em] mt-2">
                지원 상세 보기
              </h1>
              <p className="text-[#657486] dark:text-gray-400 text-base font-normal leading-normal">
                지원하신 공고의 상세 내역과 진행 상태를 투명하게 확인하세요.
              </p>
            </div>

            {/* Progress Status Card */}
            <section className="rounded-xl border border-[#dce0e5] dark:border-[#2a3441] bg-white dark:bg-[#1a222b] p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <p className="text-[#657486] dark:text-gray-400 text-sm font-medium mb-1">현재 진행 상태</p>
                  <div className="flex items-center gap-2">
                    {!isRejected && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    )}
                    <p className={`tracking-tight text-2xl font-bold leading-tight ${isRejected ? "text-red-500" : "text-primary"}`}>
                      {getStatusLabel(application.status)}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm text-[#657486] dark:text-gray-400">
                    최종 업데이트: {formatDate(application.updated_at)}
                  </p>
                </div>
              </div>

              {/* Progress Bar Visual */}
              {!isRejected && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-[#657486] dark:text-gray-400 mb-1 px-1">
                    <span className={getProgressWidth(application.status) >= 20 ? "text-primary" : ""}>서류 제출</span>
                    <span className={getProgressWidth(application.status) >= 40 ? "text-primary" : ""}>검토 중</span>
                    <span className={getProgressWidth(application.status) >= 60 ? "text-primary" : ""}>면접</span>
                    <span className={getProgressWidth(application.status) >= 100 ? "text-primary" : ""}>최종 합격</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-[#f0f2f4] dark:bg-gray-700">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${getProgressWidth(application.status)}%` }}
                    ></div>
                    {/* Steps Dots */}
                    <div className="absolute top-0 left-0 h-full w-full flex justify-between items-center px-0">
                      <div className={`h-3 w-3 rounded-full border-2 border-white dark:border-[#1a222b] ${getProgressWidth(application.status) >= 20 ? "bg-primary" : "bg-[#dce0e5] dark:bg-gray-600"}`}></div>
                      <div className={`h-3 w-3 rounded-full border-2 border-white dark:border-[#1a222b] ${getProgressWidth(application.status) >= 40 ? "bg-primary" : "bg-[#dce0e5] dark:bg-gray-600"}`}></div>
                      <div className={`h-3 w-3 rounded-full border-2 border-white dark:border-[#1a222b] ${getProgressWidth(application.status) >= 60 ? "bg-primary" : "bg-[#dce0e5] dark:bg-gray-600"}`}></div>
                      <div className={`h-3 w-3 rounded-full border-2 border-white dark:border-[#1a222b] ${getProgressWidth(application.status) >= 100 ? "bg-primary" : "bg-[#dce0e5] dark:bg-gray-600"}`}></div>
                    </div>
                  </div>
                  <p className="text-[#657486] dark:text-gray-400 text-sm font-normal leading-normal mt-2">
                    {application.status === "pending" && "서류가 성공적으로 제출되었습니다. 곧 검토가 시작됩니다."}
                    {application.status === "under_review" && "현재 인사담당자가 제출하신 서류를 꼼꼼히 검토하고 있습니다. 검토 결과는 약 1주일 내로 안내될 예정입니다."}
                    {application.status === "shortlisted" && "서류 검토 통과! 곧 면접 일정을 안내해 드리겠습니다."}
                    {application.status === "interview" && "면접이 진행 중입니다. 최종 결과를 기다려 주세요."}
                    {application.status === "hired" && "축하합니다! 최종 합격되셨습니다. 입사 관련 안내를 확인해 주세요."}
                  </p>
                </div>
              )}

              {isRejected && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    안타깝게도 이번 채용에서 함께하지 못하게 되었습니다. 더 좋은 기회로 다시 만나뵙길 바랍니다.
                  </p>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Job Info & Feedback */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Job Info Section */}
                <section className="rounded-xl border border-[#dce0e5] dark:border-[#2a3441] bg-white dark:bg-[#1a222b] p-6 shadow-sm">
                  <h2 className="text-[#121417] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">domain</span>
                    지원한 공고 정보
                  </h2>
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 border border-[#e5e7eb] dark:border-gray-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl text-gray-400">apartment</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[#121417] dark:text-white text-xl font-bold">{application.job.title}</h3>
                      <p className="text-[#121417] dark:text-gray-300 font-medium">{application.job.company_name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 rounded bg-[#f6f7f8] dark:bg-gray-700 px-2 py-1 text-xs font-medium text-[#657486] dark:text-gray-300">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {application.job.location}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-[#f6f7f8] dark:bg-gray-700 px-2 py-1 text-xs font-medium text-[#657486] dark:text-gray-300">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {application.job.employment_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#f0f2f4] dark:border-gray-700 pt-4">
                    <div>
                      <p className="text-xs text-[#657486] dark:text-gray-400 mb-1">지원 일시</p>
                      <p className="text-sm font-semibold dark:text-white">{formatDateTime(application.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#657486] dark:text-gray-400 mb-1">마감일</p>
                      <p className="text-sm font-semibold dark:text-white">{formatDate(application.job.deadline)}</p>
                    </div>
                  </div>
                </section>

                {/* Documents Section */}
                <section className="rounded-xl border border-[#dce0e5] dark:border-[#2a3441] bg-white dark:bg-[#1a222b] p-6 shadow-sm">
                  <h2 className="text-[#121417] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">folder_open</span>
                    제출한 서류
                  </h2>
                  <div className="flex flex-col gap-3">
                    {/* Resume */}
                    <div className="flex items-center justify-between rounded-lg border border-[#f0f2f4] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800 p-3 hover:bg-[#f0f2f4] dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-white dark:bg-gray-700 text-red-500 shadow-sm border border-[#f0f2f4] dark:border-gray-600">
                          <span className="material-symbols-outlined">picture_as_pdf</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-[#121417] dark:text-white">{application.resume_name}</p>
                          <p className="text-xs text-[#657486] dark:text-gray-400">{application.resume_size}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-600 text-[#657486] dark:text-gray-400 hover:text-primary transition-colors" title="미리보기">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-600 text-[#657486] dark:text-gray-400 hover:text-primary transition-colors" title="다운로드">
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    {application.cover_letter_name && (
                      <div className="flex items-center justify-between rounded-lg border border-[#f0f2f4] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800 p-3 hover:bg-[#f0f2f4] dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-white dark:bg-gray-700 text-blue-500 shadow-sm border border-[#f0f2f4] dark:border-gray-600">
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-[#121417] dark:text-white">{application.cover_letter_name}</p>
                            <p className="text-xs text-[#657486] dark:text-gray-400">{application.cover_letter_size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-600 text-[#657486] dark:text-gray-400 hover:text-primary transition-colors" title="미리보기">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-600 text-[#657486] dark:text-gray-400 hover:text-primary transition-colors" title="다운로드">
                            <span className="material-symbols-outlined text-[20px]">download</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* HR Feedback Section */}
                {application.hr_feedback && (
                  <section className="rounded-xl border border-[#dce0e5] dark:border-[#2a3441] bg-white dark:bg-[#1a222b] p-6 shadow-sm">
                    <h2 className="text-[#121417] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">chat</span>
                      채용 담당자 피드백
                    </h2>
                    <div className="rounded-lg bg-primary/5 dark:bg-primary/10 p-4 border border-primary/10 dark:border-primary/20">
                      <div className="flex gap-3">
                        <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-sm">person</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#121417] dark:text-white mb-1">{application.hr_feedback.name}</p>
                          <p className="text-sm text-[#121417] dark:text-gray-300 leading-relaxed">
                            {application.hr_feedback.message}
                          </p>
                          <p className="text-xs text-[#657486] dark:text-gray-400 mt-2">
                            {formatDateTime(application.hr_feedback.created_at)} 작성됨
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Additional Info & Actions */}
              <div className="flex flex-col gap-6">
                {/* Additional Info */}
                <section className="rounded-xl border border-[#dce0e5] dark:border-[#2a3441] bg-white dark:bg-[#1a222b] p-6 shadow-sm h-fit">
                  <h2 className="text-[#121417] dark:text-white text-lg font-bold leading-tight mb-4">추가 정보</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-[#f0f2f4] dark:border-gray-700 pb-3">
                      <span className="text-sm text-[#657486] dark:text-gray-400">비자 타입</span>
                      <span className="text-sm font-bold text-[#121417] dark:text-white">{application.visa_type || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#f0f2f4] dark:border-gray-700 pb-3">
                      <span className="text-sm text-[#657486] dark:text-gray-400">한국어 능력</span>
                      <span className="text-sm font-bold text-[#121417] dark:text-white">{application.korean_level || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#f0f2f4] dark:border-gray-700 pb-3">
                      <span className="text-sm text-[#657486] dark:text-gray-400">희망 연봉</span>
                      <span className="text-sm font-bold text-[#121417] dark:text-white">{application.expected_salary || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#657486] dark:text-gray-400">근무 가능일</span>
                      <span className="text-sm font-bold text-[#121417] dark:text-white">{application.available_date || "-"}</span>
                    </div>
                  </div>
                </section>

                {/* Actions Box */}
                <section className="rounded-xl border border-[#dce0e5] dark:border-[#2a3441] bg-white dark:bg-[#1a222b] p-6 shadow-sm h-fit">
                  <h2 className="text-[#121417] dark:text-white text-lg font-bold leading-tight mb-4">관리</h2>
                  <p className="text-xs text-[#657486] dark:text-gray-400 mb-4 leading-normal">
                    서류 검토 단계에서는 지원 취소가 가능합니다. 면접 단계 이후에는 인사담당자에게 문의해주세요.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white dark:bg-transparent border border-[#dce0e5] dark:border-gray-600 px-4 py-3 text-sm font-bold text-[#121417] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-gray-700 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                      담당자에게 문의하기
                    </button>
                    {canCancel && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        지원 취소하기
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a222b] rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-2">지원 취소</h3>
            <p className="text-sm text-[#657486] dark:text-gray-400 mb-6">
              정말로 이 공고에 대한 지원을 취소하시겠습니까? 취소 후에는 다시 지원할 수 있습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-10 rounded-lg border border-[#dce0e5] dark:border-gray-600 text-[#121417] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                아니오
              </button>
              <button
                onClick={handleCancelApplication}
                className="flex-1 h-10 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                예, 취소합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
