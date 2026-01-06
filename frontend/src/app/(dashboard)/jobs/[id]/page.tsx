"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Job {
  id: string;
  position: string;
  company_name: string;
  company_phone: string | null;
  company_address: string | null;
  location: string;
  employment_type: string;
  salary_range: string | null;
  salary_currency: string | null;
  description: string;
  requirements: string | null;
  preferred_qualifications: string | null;
  benefits: string | null;
  required_languages: string[] | null;
  status: string;
  deadline: string;
  created_at: string;
  has_applied: boolean;
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "정규직",
  "part-time": "파트타임",
  "contract": "계약직",
  "temporary": "임시직",
};

// 샘플 데이터 ID 체크
const isSampleJobId = (id: string): boolean => {
  return id.startsWith("00000000-0000-0000-0000-");
};

// 샘플 일자리 상세 데이터
const SAMPLE_JOBS_DETAIL: Record<string, Job> = {
  "00000000-0000-0000-0000-000000000124": {
    id: "00000000-0000-0000-0000-000000000124",
    position: "창고 관리 및 포장",
    company_name: "스마트물류",
    company_phone: "031-1234-5678",
    company_address: "경기도 용인시 처인구 포곡읍 물류단지로 123",
    location: "경기 용인시",
    employment_type: "contract",
    salary_range: "월 270만원",
    salary_currency: "KRW",
    description: `[주요 업무]
• 입고된 상품의 검수 및 분류 작업
• 출고 상품 포장 및 라벨링
• 재고 관리 및 창고 정리 정돈
• 물류 시스템(WMS) 데이터 입력
• 배송 준비 및 차량 상하차 보조

[근무 시간]
• 주간: 09:00 ~ 18:00 (휴게시간 1시간)
• 주 5일 근무 (토/일 휴무)
• 물량에 따라 연장 근무 가능 (수당 별도 지급)

[근무 환경]
• 쾌적한 냉난방 시설 완비
• 넓고 정돈된 물류센터
• 무거운 물건 리프트 사용 가능`,
    requirements: `[필수 조건]
• 만 18세 이상
• 장기 근무 가능자 (최소 3개월 이상)
• 기본적인 한국어 의사소통 가능
• 건강하고 성실한 분

[비자 조건]
• E-9, H-2, F-2, F-4, F-5, F-6 비자 소지자
• 합법적 취업 가능 비자 소지자`,
    preferred_qualifications: `• 물류센터 근무 경험자 우대
• 지게차 자격증 소지자 우대
• 컴퓨터 기본 활용 가능자 우대
• 용인 인근 거주자 우대
• 야간 근무 가능자 우대`,
    benefits: `• 4대 보험 가입
• 주휴수당 지급
• 연장/야간 수당 지급
• 중식 제공 (구내식당)
• 기숙사 지원 가능 (희망자)
• 교통비 일부 지원
• 우수 근무자 정규직 전환 기회
• 명절 선물 지급`,
    required_languages: ["한국어 (기초)"],
    status: "active",
    deadline: "2026-02-16",
    created_at: "2026-01-24",
    has_applied: false,
  },
  "00000000-0000-0000-0000-000000000101": {
    id: "00000000-0000-0000-0000-000000000101",
    position: "자동차 부품 조립 생산직",
    company_name: "(주)한성모터스",
    company_phone: "031-8765-4321",
    company_address: "경기도 평택시 포승읍 자동차산업단지로 456",
    location: "경기 평택시 포승읍",
    employment_type: "full-time",
    salary_range: "월 320만원 이상",
    salary_currency: "KRW",
    description: `[주요 업무]
• 자동차 부품 조립 라인 작업
• 품질 검사 및 불량품 선별
• 생산 라인 정리 정돈
• 안전 수칙 준수 및 작업장 관리

[근무 시간]
• 2교대 (주간/야간)
• 주간: 06:00 ~ 15:00
• 야간: 15:00 ~ 24:00
• 주 5일 근무`,
    requirements: `[필수 조건]
• 만 18세 이상
• 건강하고 체력이 좋은 분
• 교대 근무 가능자
• E-9 비자 소지자 또는 비자 지원 희망자`,
    preferred_qualifications: `• 제조업 경험자 우대
• 자동차 관련 경험자 우대
• 장기 근무 가능자 우대`,
    benefits: `• 4대 보험 완비
• 기숙사 무료 제공
• 중식/석식 무료 제공
• 비자 지원 (E-9)
• 연장/야간 수당 150%
• 명절 상여금 지급
• 우수 사원 포상`,
    required_languages: ["한국어 (기초)"],
    status: "active",
    deadline: "2026-02-28",
    created_at: "2026-01-01",
    has_applied: false,
  },
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 지원 모달 상태
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 관심 공고 저장 상태
  const [isSaved, setIsSaved] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetchJob();
    checkSavedStatus();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      // 샘플 데이터 ID인 경우 로컬 데이터 사용
      if (isSampleJobId(jobId)) {
        const sampleJob = SAMPLE_JOBS_DETAIL[jobId];
        if (sampleJob) {
          setJob(sampleJob);
        } else {
          // 샘플 데이터에 없는 ID인 경우 기본 샘플 데이터 사용
          setJob({
            ...SAMPLE_JOBS_DETAIL["00000000-0000-0000-0000-000000000124"],
            id: jobId,
          });
        }
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("access_token");

      // 인증 헤더는 선택적으로 전달 (비로그인도 접근 가능)
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/jobs/${jobId}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else if (response.status === 404) {
        setError("일자리를 찾을 수 없습니다.");
      } else {
        setError("일자리 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApplyError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cover_letter: coverLetter.trim() || undefined,
          resume_url: resumeUrl.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowApplyModal(false);
        setCoverLetter("");
        setResumeUrl("");
        await fetchJob();
      } else {
        const data = await response.json();
        setApplyError(data.message || data.detail || "지원 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setApplyError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkSavedStatus = () => {
    try {
      const savedJobs = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
      const saved = savedJobs.some((saved: { job_id: string }) => saved.job_id === jobId);
      setIsSaved(saved);
    } catch (error) {
      console.error("Failed to check saved status:", error);
    }
  };

  const handleSaveJob = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      if (isSaved) {
        const response = await fetch(`/api/jobs/${jobId}/save`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setIsSaved(false);
          const savedJobs = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
          const updated = savedJobs.filter((saved: { job_id: string }) => saved.job_id !== jobId);
          localStorage.setItem("saved_jobs", JSON.stringify(updated));
        }
      } else {
        const response = await fetch(`/api/jobs/${jobId}/save`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setIsSaved(true);
          const savedJobs = JSON.parse(localStorage.getItem("saved_jobs") || "[]");
          savedJobs.push({ job_id: jobId, saved_at: new Date().toISOString() });
          localStorage.setItem("saved_jobs", JSON.stringify(savedJobs));
        }
      }
    } catch (error) {
      alert(isSaved ? "저장 취소에 실패했습니다." : "저장하는데 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-text-secondary">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background-light py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error_outline</span>
            <p className="text-error mb-6">{error || "일자리를 찾을 수 없습니다."}</p>
            <Link href="/jobs">
              <Button variant="outline">일자리 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(job.deadline);

  return (
    <div className="min-h-screen bg-background-light">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/jobs" className="hover:text-primary transition-colors">채용 정보</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-primary font-bold truncate max-w-[200px]">{job.position}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Job Details (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100">
              <div className="flex flex-col gap-4">
                {/* Company & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">business</span>
                    </div>
                    <span className="text-text-secondary font-bold">{job.company_name}</span>
                  </div>
                  {daysRemaining > 0 ? (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                      D-{daysRemaining}일 남음
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-error bg-error/10 px-3 py-1.5 rounded-full">
                      마감됨
                    </span>
                  )}
                </div>

                {/* Job Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary leading-tight">
                  {job.position}
                </h1>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-text-secondary">
                    <span className="material-symbols-outlined text-[18px] mr-1.5">schedule</span>
                    {EMPLOYMENT_TYPE_LABELS[job.employment_type] || job.employment_type}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-text-secondary">
                    <span className="material-symbols-outlined text-[18px] mr-1.5">location_on</span>
                    {job.location}
                  </span>
                  {job.required_languages && job.required_languages.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-primary border border-blue-100">
                      <span className="material-symbols-outlined text-[18px] mr-1.5">translate</span>
                      {job.required_languages.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-text-muted font-medium">고용형태</span>
                <span className="text-sm font-bold text-text-primary">
                  {EMPLOYMENT_TYPE_LABELS[job.employment_type] || job.employment_type}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-text-muted font-medium">근무지역</span>
                <span className="text-sm font-bold text-text-primary">{job.location}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-text-muted font-medium">마감일</span>
                <span className="text-sm font-bold text-text-primary">{formatDate(job.deadline)}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-text-muted font-medium">급여</span>
                <span className="text-sm font-bold text-primary">
                  {job.salary_range || "협의 후 결정"}
                </span>
              </div>
            </div>

            {/* Detail Content */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 flex flex-col gap-10">
              {/* Job Description */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  <h3 className="text-xl font-bold text-text-primary">직무 설명</h3>
                </div>
                <div className="text-text-secondary leading-relaxed pl-3 whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>

              {/* Requirements */}
              {job.requirements && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-xl font-bold text-text-primary">자격 요건</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5">
                    <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {job.requirements}
                    </div>
                  </div>
                </section>
              )}

              {/* Preferred Qualifications */}
              {job.preferred_qualifications && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    <h3 className="text-xl font-bold text-text-primary">우대 사항</h3>
                  </div>
                  <div className="text-text-secondary leading-relaxed pl-3 whitespace-pre-wrap">
                    {job.preferred_qualifications}
                  </div>
                </section>
              )}

              {/* Benefits */}
              {job.benefits && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-6 bg-success rounded-full"></span>
                    <h3 className="text-xl font-bold text-text-primary">복리후생</h3>
                  </div>
                  <div className="text-text-secondary leading-relaxed pl-3 whitespace-pre-wrap">
                    {job.benefits}
                  </div>
                </section>
              )}

              {/* Required Languages */}
              {job.required_languages && job.required_languages.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-6 bg-info rounded-full"></span>
                    <h3 className="text-xl font-bold text-text-primary">필수 언어</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.required_languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-50 text-primary rounded-full text-sm font-medium border border-blue-100"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Company Info */}
            {(job.company_phone || job.company_address) && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-gray-400">apartment</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-primary">{job.company_name}</h4>
                      <p className="text-sm text-text-muted">회사 정보</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 border-t border-gray-100 pt-6">
                  {job.company_phone && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">연락처</p>
                      <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">call</span>
                        {job.company_phone}
                      </p>
                    </div>
                  )}
                  {job.company_address && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">주소</p>
                      <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                        {job.company_address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Action Card (4 cols) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 flex flex-col gap-4">
              {/* Main Action Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-sm font-medium text-text-muted mb-2">예상 급여</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-black text-text-primary">
                    {job.salary_range || "협의"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {job.has_applied ? (
                    <div className="w-full h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      <span className="text-primary font-bold">이미 지원 완료</span>
                    </div>
                  ) : job.status === "active" && daysRemaining > 0 ? (
                    <button
                      onClick={() => {
                        const token = localStorage.getItem("access_token");
                        if (!token) {
                          // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
                          router.push(`/login?redirect=/jobs/${jobId}/apply`);
                          return;
                        }
                        // 새 지원서 작성 페이지로 이동
                        router.push(`/jobs/${jobId}/apply`);
                      }}
                      className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-md shadow-primary/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>지원하기</span>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                  ) : (
                    <div className="w-full h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-text-muted font-medium">모집 마감</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveJob}
                      className={`flex-1 h-11 border rounded-lg transition-colors flex items-center justify-center gap-2 font-bold ${
                        isSaved
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 hover:border-primary hover:text-primary text-text-secondary bg-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isSaved ? "bookmark" : "bookmark_border"}
                      </span>
                      <span>{isSaved ? "저장됨" : "스크랩"}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: job.position,
                            text: `${job.company_name} - ${job.position}`,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert("링크가 복사되었습니다.");
                        }
                      }}
                      className="size-11 flex-shrink-0 border border-gray-200 hover:border-gray-400 text-text-muted rounded-lg transition-colors flex items-center justify-center bg-white"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">등록일</p>
                      <p className="text-sm font-bold text-text-primary">{formatDate(job.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mt-3">
                    본 채용 정보는 easyK를 통해 제공됩니다. 실제 채용 조건은 회사와 상이할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Help Banner */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="font-bold text-lg mb-1">취업 비자 도움이 필요하세요?</h4>
                  <p className="text-gray-300 text-sm mb-4">전문 상담사와 1:1 상담을 받아보세요.</p>
                  <Link
                    href="/consultations"
                    className="inline-flex items-center text-sm font-bold text-white border-b border-white/30 pb-0.5 hover:border-white transition-colors"
                  >
                    상담 신청하기
                    <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                  </Link>
                </div>
                <div className="absolute -right-4 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[120px]">gavel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 지원 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">일자리 지원</h2>
                  <p className="text-sm text-text-muted mt-1">{job.company_name} - {job.position}</p>
                </div>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setCoverLetter("");
                    setResumeUrl("");
                    setApplyError("");
                  }}
                  className="size-10 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-text-muted">close</span>
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-6">
                {applyError && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                    <span className="material-symbols-outlined text-error">error</span>
                    <p className="text-sm text-error">{applyError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    자기소개서 <span className="text-text-muted font-normal">(선택)</span>
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="자기소개서를 입력해주세요..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">
                    이력서 URL <span className="text-text-muted font-normal">(선택)</span>
                  </label>
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://example.com/resume.pdf"
                  />
                  <p className="text-xs text-text-muted mt-2">
                    Google Drive, Dropbox 등의 공유 링크를 입력해주세요.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyModal(false);
                      setCoverLetter("");
                      setResumeUrl("");
                      setApplyError("");
                    }}
                    disabled={isSubmitting}
                    className="flex-1 h-12 border border-gray-200 text-text-secondary font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>처리 중...</span>
                      </>
                    ) : (
                      <>
                        <span>지원하기</span>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
