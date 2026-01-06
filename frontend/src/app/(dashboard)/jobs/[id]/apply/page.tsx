"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

interface Job {
  id: string;
  position: string;
  company_name: string;
  location: string;
  employment_type: string;
  salary_range: string;
  description: string;
  requirements: string;
  preferred_qualifications: string;
  deadline: string;
}

interface UserProfile {
  name: string;
  email: string;
}

// 샘플 데이터 ID 체크
const isSampleJobId = (id: string): boolean => {
  return id.startsWith("00000000-0000-0000-0000-");
};

// 샘플 일자리 데이터
const SAMPLE_JOBS: Record<string, Job> = {
  "00000000-0000-0000-0000-000000000124": {
    id: "00000000-0000-0000-0000-000000000124",
    position: "창고 관리 및 포장",
    company_name: "스마트물류",
    location: "경기 용인시",
    employment_type: "contract",
    salary_range: "월 270만원",
    description: "입고된 상품의 검수 및 분류 작업, 출고 상품 포장 및 라벨링",
    requirements: "만 18세 이상, E-9, H-2, F-2, F-4, F-5, F-6 비자 소지자",
    preferred_qualifications: "물류센터 근무 경험자 우대",
    deadline: "2026-02-16",
  },
  "00000000-0000-0000-0000-000000000101": {
    id: "00000000-0000-0000-0000-000000000101",
    position: "자동차 부품 조립 생산직",
    company_name: "(주)한성모터스",
    location: "경기 평택시 포승읍",
    employment_type: "full-time",
    salary_range: "월 320만원 이상",
    description: "자동차 부품 조립 라인 작업, 품질 검사 및 불량품 선별",
    requirements: "만 18세 이상, 건강하고 체력이 좋은 분",
    preferred_qualifications: "제조업 경험자 우대",
    deadline: "2026-02-28",
  },
};

export default function JobApplyPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 파일 업로드 상태
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");

  // 파일 input refs
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      // 사용자 프로필 가져오기
      try {
        const profileResponse = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile({
            name: profileData.name || profileData.username || "",
            email: profileData.email || "",
          });
        }
      } catch {
        // 프로필 로드 실패 시 기본값 사용
        setUserProfile({ name: "", email: "" });
      }

      // 샘플 데이터인 경우 로컬 데이터 사용
      if (isSampleJobId(jobId)) {
        const sampleJob = SAMPLE_JOBS[jobId];
        if (sampleJob) {
          setJob(sampleJob);
        } else {
          setJob({
            ...SAMPLE_JOBS["00000000-0000-0000-0000-000000000124"],
            id: jobId,
          });
        }
        setIsLoading(false);
        return;
      }

      // 일자리 정보 가져오기
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        setError(
          language === "ko"
            ? "일자리 정보를 불러오는데 실패했습니다."
            : "Failed to load job information."
        );
      }
    } catch {
      setError(
        language === "ko"
          ? "네트워크 오류가 발생했습니다."
          : "A network error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(
          language === "ko"
            ? "파일 크기는 10MB 이하여야 합니다."
            : "File size must be 10MB or less."
        );
        return;
      }
      // 파일 형식 검증
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError(
          language === "ko"
            ? "PDF 또는 Word 파일만 업로드 가능합니다."
            : "Only PDF or Word files are allowed."
        );
        return;
      }
      setResumeFile(file);
      setError("");
    }
  };

  const handleCoverLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(
          language === "ko"
            ? "파일 크기는 10MB 이하여야 합니다."
            : "File size must be 10MB or less."
        );
        return;
      }
      setCoverLetterFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      setError(
        language === "ko"
          ? "이력서는 필수 첨부 사항입니다."
          : "Resume is required."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    // 파일 크기 포맷팅
    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // 최종 확인 페이지(review)로 이동 - 입력 데이터를 URL 파라미터로 전달
    const params = new URLSearchParams({
      position: job?.position || "",
      company: job?.company_name || "",
      resume: resumeFile.name,
      resumeSize: formatFileSize(resumeFile.size),
      additionalInfo: additionalInfo,
    });

    if (coverLetterFile) {
      params.set("coverLetter", coverLetterFile.name);
      params.set("coverLetterSize", formatFileSize(coverLetterFile.size));
    }

    // 사용자 정보도 전달 (실제로는 프로필에서 가져와야 함)
    if (userProfile) {
      params.set("userName", userProfile.name);
      params.set("userEmail", userProfile.email);
    }

    router.push(`/jobs/${jobId}/apply/review?${params.toString()}`);
  };

  const handleSaveDraft = () => {
    // 임시 저장 기능 (로컬 스토리지에 저장)
    const draft = {
      jobId,
      additionalInfo,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`job_apply_draft_${jobId}`, JSON.stringify(draft));
    alert(
      language === "ko" ? "임시 저장되었습니다." : "Draft saved successfully."
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error ||
              (language === "ko"
                ? "일자리 정보를 찾을 수 없습니다."
                : "Job information not found.")}
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {language === "ko" ? "일자리 목록으로 돌아가기" : "Back to Jobs"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] flex flex-col text-[#121417] dark:text-[#e0e0e0]">
      <DesignHeader />

      <main className="flex-grow flex flex-col items-center py-8 px-4 md:px-10 lg:px-40 w-full">
        <div className="w-full max-w-[960px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <Link
              href="/"
              className="text-[#657486] dark:text-gray-400 font-medium hover:text-primary"
            >
              {language === "ko" ? "홈" : "Home"}
            </Link>
            <span className="material-symbols-outlined text-[16px] text-[#657486] dark:text-gray-500">
              chevron_right
            </span>
            <Link
              href="/jobs"
              className="text-[#657486] dark:text-gray-400 font-medium hover:text-primary"
            >
              {language === "ko" ? "채용 정보" : "Jobs"}
            </Link>
            <span className="material-symbols-outlined text-[16px] text-[#657486] dark:text-gray-500">
              chevron_right
            </span>
            <span className="text-[#121417] dark:text-white font-bold">
              {language === "ko" ? "지원서 작성" : "Apply"}
            </span>
          </div>

          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[#121417] dark:text-white text-3xl md:text-[32px] font-bold leading-tight tracking-[-0.015em]">
              {language === "ko" ? "지원 폼 작성" : "Application Form"}
            </h1>
            <p className="text-[#657486] dark:text-gray-400 text-sm md:text-base font-normal">
              {language === "ko"
                ? "귀하의 역량을 보여주세요. 지원하려는 포지션에 맞춰 정보를 입력해주세요."
                : "Show your qualifications. Fill in the information for the position you are applying for."}
            </p>
          </div>

          {/* Job Info Summary */}
          <div className="bg-white dark:bg-[#1C242F] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl">
                  work
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#121417] dark:text-white truncate">
                  {job.position}
                </h3>
                <p className="text-sm text-[#657486] dark:text-gray-400">
                  {job.company_name} | {job.location}
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                  check_circle
                </span>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                  error
                </span>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white dark:bg-[#1C242F] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] p-6 md:p-8 flex flex-col gap-8"
          >
            {/* Personal Information Summary (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#f0f2f4] dark:border-[#2a3441]">
              <div className="flex flex-col gap-2">
                <label className="text-[#121417] dark:text-gray-200 text-sm font-bold">
                  {language === "ko" ? "이름" : "Name"}
                </label>
                <input
                  type="text"
                  readOnly
                  value={userProfile?.name || "-"}
                  className="bg-[#f6f7f8] dark:bg-[#121920] border-0 rounded-lg text-gray-500 dark:text-gray-400 px-4 py-3 text-sm focus:ring-0 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#121417] dark:text-gray-200 text-sm font-bold">
                  {language === "ko" ? "이메일" : "Email"}
                </label>
                <input
                  type="text"
                  readOnly
                  value={userProfile?.email || "-"}
                  className="bg-[#f6f7f8] dark:bg-[#121920] border-0 rounded-lg text-gray-500 dark:text-gray-400 px-4 py-3 text-sm focus:ring-0 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[#121417] dark:text-white text-lg font-bold">
                  {language === "ko" ? "이력서 첨부" : "Resume"}{" "}
                  <span className="text-primary text-sm font-normal ml-1">
                    *{language === "ko" ? "필수" : "Required"}
                  </span>
                </h2>
                {resumeFile && (
                  <span className="material-symbols-outlined text-green-600">
                    check_circle
                  </span>
                )}
              </div>

              {resumeFile ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                      description
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#121417] dark:text-white">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-[#657486] dark:text-gray-400">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      if (resumeInputRef.current)
                        resumeInputRef.current.value = "";
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ) : (
                <div
                  className="group relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-[#dce0e5] dark:border-gray-600 bg-[#f9fafb] dark:bg-[#121920]/50 hover:bg-[#f0f2f4] dark:hover:bg-[#121920] hover:border-primary transition-all cursor-pointer"
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <div className="p-3 bg-white dark:bg-[#1C242F] rounded-full shadow-sm text-[#657486] dark:text-gray-400 group-hover:text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">
                        upload_file
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#121417] dark:text-white text-sm font-bold">
                        {language === "ko"
                          ? "클릭하여 파일을 선택하거나 이곳에 드래그하세요"
                          : "Click to select a file or drag it here"}
                      </p>
                      <p className="text-[#657486] dark:text-gray-500 text-xs">
                        {language === "ko"
                          ? "PDF, Word 형식 (최대 10MB)"
                          : "PDF, Word format (max 10MB)"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 bg-white dark:bg-[#2a3441] border border-[#dce0e5] dark:border-gray-600 rounded-lg text-xs font-bold text-[#121417] dark:text-gray-200 shadow-sm group-hover:border-primary/50 transition-colors"
                    >
                      {language === "ko" ? "파일 선택" : "Select File"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cover Letter Upload Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[#121417] dark:text-white text-lg font-bold">
                  {language === "ko" ? "자기소개서 첨부" : "Cover Letter"}{" "}
                  <span className="text-[#657486] dark:text-gray-500 text-sm font-normal ml-1">
                    ({language === "ko" ? "선택" : "Optional"})
                  </span>
                </h2>
                {coverLetterFile && (
                  <span className="material-symbols-outlined text-green-600">
                    check_circle
                  </span>
                )}
              </div>

              {coverLetterFile ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                      description
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#121417] dark:text-white">
                        {coverLetterFile.name}
                      </p>
                      <p className="text-xs text-[#657486] dark:text-gray-400">
                        {(coverLetterFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverLetterFile(null);
                      if (coverLetterInputRef.current)
                        coverLetterInputRef.current.value = "";
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ) : (
                <div
                  className="group relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-[#dce0e5] dark:border-gray-600 bg-[#f9fafb] dark:bg-[#121920]/50 hover:bg-[#f0f2f4] dark:hover:bg-[#121920] hover:border-primary transition-all cursor-pointer"
                  onClick={() => coverLetterInputRef.current?.click()}
                >
                  <input
                    ref={coverLetterInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCoverLetterUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <div className="flex items-center gap-2 text-[#657486] dark:text-gray-400 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">
                        description
                      </span>
                      <span className="text-sm font-medium">
                        {language === "ko"
                          ? "자기소개서 파일 업로드"
                          : "Upload cover letter file"}
                      </span>
                    </div>
                    <p className="text-[#9aa2ac] dark:text-gray-600 text-xs">
                      {language === "ko"
                        ? "자유 형식, PDF 권장"
                        : "Any format, PDF recommended"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info Section */}
            <div className="flex flex-col gap-4">
              <label
                htmlFor="additional-info"
                className="text-[#121417] dark:text-white text-lg font-bold"
              >
                {language === "ko" ? "추가 정보" : "Additional Information"}
              </label>
              <div className="relative">
                <textarea
                  id="additional-info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder={
                    language === "ko"
                      ? "채용 담당자에게 전달하고 싶은 말이 있다면 적어주세요. (예: 포트폴리오 링크, 업무 가능 시작일 등)"
                      : "Write any additional information you want to share with the recruiter. (e.g., portfolio link, available start date, etc.)"
                  }
                  className="w-full rounded-xl border border-[#dce0e5] dark:border-[#2a3441] bg-white dark:bg-[#121920] p-4 text-sm text-[#121417] dark:text-gray-200 placeholder:text-[#9aa2ac] focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-shadow"
                />
                <div className="absolute bottom-3 right-4 text-xs text-[#9aa2ac]">
                  {additionalInfo.length} / 1000
                  {language === "ko" ? "자" : " chars"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#f0f2f4] dark:border-[#2a3441]">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#dce0e5] dark:border-gray-600 bg-white dark:bg-transparent text-[#121417] dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#2a3441] transition-colors disabled:opacity-50"
              >
                {language === "ko" ? "임시 저장" : "Save Draft"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !resumeFile}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary hover:bg-[#164885] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>
                      {language === "ko" ? "제출 중..." : "Submitting..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {language === "ko" ? "지원 제출" : "Submit Application"}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      send
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="flex justify-center gap-8 py-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#657486]">
                lock
              </span>
              <span className="text-xs text-[#657486] font-medium">
                {language === "ko" ? "SSL 보안 전송" : "SSL Secure"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#657486]">
                verified_user
              </span>
              <span className="text-xs text-[#657486] font-medium">
                {language === "ko" ? "개인정보 보호" : "Privacy Protected"}
              </span>
            </div>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
