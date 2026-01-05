"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

const CONSULTATION_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  visa: { ko: "비자/체류", en: "Visa/Residence" },
  labor: { ko: "근로/노동", en: "Labor/Employment" },
  contract: { ko: "계약/기타", en: "Contract/Other" },
  business: { ko: "사업/창업", en: "Business/Startup" },
  other: { ko: "기타", en: "Other" },
};

const CONSULTATION_METHODS = [
  { value: "email", label: { ko: "이메일 상담", en: "Email Consultation" } },
  { value: "document", label: { ko: "문서 검토", en: "Document Review" } },
  { value: "call", label: { ko: "전화 상담", en: "Phone Consultation" } },
  { value: "video", label: { ko: "화상 상담", en: "Video Consultation" } },
];

// Mock data - 실제로는 API에서 가져와야 함
const MOCK_LAWYERS = [
  { id: "", name: { ko: "변호사를 지정하지 않음 (가장 적합한 변호사 자동 배정)", en: "No preference (Auto-assign best match)" } },
  { id: "kim", name: { ko: "김철수 변호사 (출입국/비자 전문)", en: "Chulsoo Kim (Immigration/Visa Specialist)" } },
  { id: "lee", name: { ko: "이영희 변호사 (행정 소송 전문)", en: "Younghee Lee (Administrative Litigation)" } },
  { id: "park", name: { ko: "박민수 변호사 (체류 자격 변경)", en: "Minsu Park (Residence Status Change)" } },
  { id: "choi", name: { ko: "최지훈 변호사 (국적 취득)", en: "Jihoon Choi (Nationality Acquisition)" } },
];

export default function NewConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();

  const [consultationType, setConsultationType] = useState("");
  const [content, setContent] = useState("");
  const [consultationMethod, setConsultationMethod] = useState("email");
  const [preferredLawyer, setPreferredLawyer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    requireAuth();

    // URL 파라미터에서 상담 유형 가져오기
    const type = searchParams.get('type');
    if (type && CONSULTATION_TYPE_LABELS[type]) {
      setConsultationType(type);
    }
  }, [searchParams]);

  const getTypeLabel = (type: string) => {
    const typeLabels = CONSULTATION_TYPE_LABELS[type as keyof typeof CONSULTATION_TYPE_LABELS];
    return typeLabels?.[language as keyof typeof typeLabels] || type;
  };

  const getPlaceholder = () => {
    if (language === 'ko') {
      return `예시)
- 비자 종류: E-7
- 현재 상황: 비자 연장을 신청했으나 서류 미비로 보완 요청을 받았습니다.
- 궁금한 점: 회사 측에서 제공해주지 않는 서류가 있는데 대체할 수 있는 방법이 있을까요?`;
    } else {
      return `Example)
- Visa type: E-7
- Current situation: Applied for visa extension but received a request for supplementary documents.
- Question: Is there an alternative way to obtain documents that the company doesn't provide?`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!consultationType) {
      setError(language === 'ko' ? '상담 유형을 선택해주세요.' : 'Please select a consultation type.');
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setError(language === 'ko' ? '상담 내용은 최소 10자 이상 입력해주세요.' : 'Please enter at least 10 characters.');
      return;
    }

    if (!consultationMethod) {
      setError(language === 'ko' ? '상담 방법을 선택해주세요.' : 'Please select a consultation method.');
      return;
    }

    // Redirect to confirmation page with form data
    const params = new URLSearchParams({
      type: consultationType,
      content: content.trim(),
      method: consultationMethod,
      lawyer: preferredLawyer,
    });

    router.push(`/consultations/confirm?${params.toString()}`);
  };

  if (!consultationType) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-sub">{language === 'ko' ? '로딩 중...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-1 flex flex-col items-center py-8 md:py-12 px-4 sm:px-6">
        <div className="w-full max-w-[800px] flex flex-col gap-8">
          {/* Progress Bar */}
          <div className="flex flex-col gap-3 px-1 md:px-4">
            <div className="flex gap-6 justify-between items-end">
              <p className="text-primary text-sm font-bold leading-normal tracking-wide">
                {language === 'ko' ? 'STEP 02' : 'STEP 02'}
              </p>
              <p className="text-text-sub dark:text-gray-400 text-sm font-medium leading-normal">
                {language === 'ko' ? '단계 2 / 3' : 'Step 2 / 3'}
              </p>
            </div>
            <div className="rounded-full bg-[#dce0e5] dark:bg-gray-700 h-2 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: '66%' }}></div>
            </div>
          </div>

          {/* Header Section */}
          <div className="flex flex-col gap-3 px-1 md:px-4 mt-2 text-center md:text-left">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-[-0.033em]">
              {getTypeLabel(consultationType)} {language === 'ko' ? '상담 신청' : 'Consultation Application'}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base md:text-lg font-normal leading-relaxed">
              {language === 'ko' ? (
                <>
                  구체적인 상황을 작성해주시면 전문 변호사가 더 정확하게 상담해드릴 수 있습니다.<br className="hidden sm:block"/>
                  작성하신 내용은 변호사 비밀유지권에 의해 철저히 보호됩니다.
                </>
              ) : (
                <>
                  Detailed information helps our lawyers provide more accurate consultation.<br className="hidden sm:block"/>
                  Your information is strictly protected by attorney-client privilege.
                </>
              )}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-10 shadow-sm border border-[#dce0e5] dark:border-gray-700 mt-2">
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Problem Description */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1 text-text-main dark:text-white font-bold text-lg" htmlFor="problem-description">
                  {language === 'ko' ? '문제 내용 입력' : 'Problem Description'} <span className="text-primary">*</span>
                </label>
                <p className="text-text-sub dark:text-gray-400 text-sm mb-1">
                  {language === 'ko'
                    ? `현재 겪고 계신 ${getTypeLabel(consultationType)} 관련 문제 상황, 발생 일시, 거절 사유 등을 상세히 적어주세요.`
                    : `Please describe in detail the ${getTypeLabel(consultationType)}-related issues you're experiencing, when they occurred, reasons for rejection, etc.`
                  }
                </p>
                <textarea
                  className="w-full min-h-[300px] p-5 rounded-xl border border-[#dce0e5] dark:border-gray-600 bg-[#f8fafc] dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-400 text-base leading-relaxed"
                  id="problem-description"
                  placeholder={getPlaceholder()}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {/* Consultation Method */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1 text-text-main dark:text-white font-bold text-lg" htmlFor="consultation-method">
                  {language === 'ko' ? '상담 방법 선택' : 'Consultation Method'} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 pr-12 rounded-xl border border-[#dce0e5] dark:border-gray-600 bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer transition-shadow"
                    id="consultation-method"
                    value={consultationMethod}
                    onChange={(e) => setConsultationMethod(e.target.value)}
                    required
                  >
                    {CONSULTATION_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label[language as keyof typeof method.label]}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Preferred Lawyer */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-text-main dark:text-white font-bold text-lg" htmlFor="lawyer-select">
                  {language === 'ko' ? '희망 변호사 선택' : 'Preferred Lawyer'}
                  <span className="text-text-sub dark:text-gray-500 font-normal text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {language === 'ko' ? '선택사항' : 'Optional'}
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 pr-12 rounded-xl border border-[#dce0e5] dark:border-gray-600 bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer transition-shadow"
                    id="lawyer-select"
                    value={preferredLawyer}
                    onChange={(e) => setPreferredLawyer(e.target.value)}
                  >
                    {MOCK_LAWYERS.map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.name[language as keyof typeof lawyer.name]}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
                <p className="text-text-sub dark:text-gray-500 text-sm mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined !text-base">info</span>
                  {language === 'ko'
                    ? '희망 변호사를 선택하지 않으시면 상담 내용에 가장 적합한 전문 변호사가 배정됩니다.'
                    : 'If you don\'t select a lawyer, the most suitable specialist will be automatically assigned.'}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#f0f2f4] dark:border-gray-700 my-2"></div>

              {/* Submit Button */}
              <div className="flex flex-col gap-4 items-center">
                <button
                  className="w-full bg-primary hover:bg-[#164a85] text-white font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  <span>{language === 'ko' ? '다음 단계 (내용 확인)' : 'Next (Confirm)'}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <p className="text-text-sub dark:text-gray-500 text-xs text-center">
                  {language === 'ko' ? (
                    <>
                      제출 버튼을 누르면 <a className="underline hover:text-primary" href="#">개인정보 수집 및 이용</a>에 동의하는 것으로 간주됩니다.
                    </>
                  ) : (
                    <>
                      By clicking submit, you agree to our <a className="underline hover:text-primary" href="#">Privacy Policy</a>.
                    </>
                  )}
                </p>
              </div>
            </form>
          </div>

          {/* Back Link */}
          <div className="flex justify-center">
            <Link
              href="/consultations"
              className="text-text-sub hover:text-text-main dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined !text-lg">arrow_back</span>
              {language === 'ko' ? '이전 단계로 돌아가기' : 'Go back to previous step'}
            </Link>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
