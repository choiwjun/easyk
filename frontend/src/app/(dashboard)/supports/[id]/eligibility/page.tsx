"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { SAMPLE_SUPPORTS } from "@/lib/sampleData";

interface Support {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility: string;
  eligible_visa_types: string[];
  support_content: string | null;
  department: string;
  official_link: string | null;
  location?: string;
}

const VISA_TYPES = [
  { value: "E-7", label: "E-7 (특정활동)", label_en: "E-7 (Specific Activities)" },
  { value: "E-9", label: "E-9 (비전문취업)", label_en: "E-9 (Non-professional Employment)" },
  { value: "H-2", label: "H-2 (방문취업)", label_en: "H-2 (Working Visit)" },
  { value: "F-2", label: "F-2 (거주)", label_en: "F-2 (Residence)" },
  { value: "F-4", label: "F-4 (재외동포)", label_en: "F-4 (Overseas Korean)" },
  { value: "F-5", label: "F-5 (영주)", label_en: "F-5 (Permanent Residence)" },
  { value: "F-6", label: "F-6 (결혼이민)", label_en: "F-6 (Marriage Immigration)" },
  { value: "D-2", label: "D-2 (유학)", label_en: "D-2 (Student)" },
  { value: "D-4", label: "D-4 (일반연수)", label_en: "D-4 (General Training)" },
  { value: "G-1", label: "G-1 (기타)", label_en: "G-1 (Other)" },
  { value: "other", label: "기타", label_en: "Other" },
];

const REGIONS = [
  { value: "seoul", label: "서울", label_en: "Seoul" },
  { value: "gyeonggi", label: "경기", label_en: "Gyeonggi" },
  { value: "incheon", label: "인천", label_en: "Incheon" },
  { value: "busan", label: "부산", label_en: "Busan" },
  { value: "daegu", label: "대구", label_en: "Daegu" },
  { value: "gwangju", label: "광주", label_en: "Gwangju" },
  { value: "daejeon", label: "대전", label_en: "Daejeon" },
  { value: "ulsan", label: "울산", label_en: "Ulsan" },
  { value: "sejong", label: "세종", label_en: "Sejong" },
  { value: "gangwon", label: "강원", label_en: "Gangwon" },
  { value: "chungbuk", label: "충북", label_en: "Chungbuk" },
  { value: "chungnam", label: "충남", label_en: "Chungnam" },
  { value: "jeonbuk", label: "전북", label_en: "Jeonbuk" },
  { value: "jeonnam", label: "전남", label_en: "Jeonnam" },
  { value: "gyeongbuk", label: "경북", label_en: "Gyeongbuk" },
  { value: "gyeongnam", label: "경남", label_en: "Gyeongnam" },
  { value: "jeju", label: "제주", label_en: "Jeju" },
];

const EXPERIENCE_OPTIONS = [
  { value: "new", label: "신입 (1년 미만)", label_en: "Entry-level (Less than 1 year)" },
  { value: "1-3", label: "1년 이상 ~ 3년 미만", label_en: "1-3 years" },
  { value: "3-5", label: "3년 이상 ~ 5년 미만", label_en: "3-5 years" },
  { value: "5-7", label: "5년 이상 ~ 7년 미만", label_en: "5-7 years" },
  { value: "7+", label: "7년 이상", label_en: "7+ years" },
];

export default function EligibilityCheckPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const supportId = params.id as string;

  const [support, setSupport] = useState<Support | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 폼 상태
  const [selectedVisaType, setSelectedVisaType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    eligible: boolean;
    message: string;
    details: string[];
  } | null>(null);

  useEffect(() => {
    fetchSupport();
  }, [supportId]);

  const fetchSupport = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // API 호출 시도
      const response = await fetch(`/api/supports/${supportId}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setSupport(data);
      } else {
        // API 실패 시 샘플 데이터에서 찾기
        const sampleSupport = SAMPLE_SUPPORTS.find(s => s.id === supportId);
        if (sampleSupport) {
          setSupport(sampleSupport as Support);
        }
      }
    } catch (error) {
      // 네트워크 오류 시 샘플 데이터에서 찾기
      const sampleSupport = SAMPLE_SUPPORTS.find(s => s.id === supportId);
      if (sampleSupport) {
        setSupport(sampleSupport as Support);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckEligibility = () => {
    if (!support) return;

    setIsChecking(true);
    setCheckResult(null);

    // 검증 로직
    const details: string[] = [];
    let eligible = true;

    // 비자 종류 확인
    if (selectedVisaType && selectedVisaType !== "other") {
      const isEligibleVisa = support.eligible_visa_types.includes(selectedVisaType);
      if (isEligibleVisa) {
        details.push(language === 'ko'
          ? `✓ ${selectedVisaType} 비자는 신청 가능한 비자입니다.`
          : `✓ ${selectedVisaType} visa is eligible for this program.`);
      } else {
        eligible = false;
        details.push(language === 'ko'
          ? `✗ ${selectedVisaType} 비자는 이 프로그램의 대상이 아닙니다.`
          : `✗ ${selectedVisaType} visa is not eligible for this program.`);
      }
    }

    // 지역 확인 (프로그램에 location이 있는 경우)
    if (selectedRegion && support.location) {
      const regionLabel = REGIONS.find(r => r.value === selectedRegion)?.label || selectedRegion;
      if (support.location === "전국" || support.location.includes(regionLabel)) {
        details.push(language === 'ko'
          ? `✓ ${regionLabel} 지역은 신청 가능 지역입니다.`
          : `✓ ${regionLabel} is an eligible region.`);
      } else {
        eligible = false;
        details.push(language === 'ko'
          ? `✗ 이 프로그램은 ${support.location} 지역 거주자만 신청 가능합니다.`
          : `✗ This program is only available for residents of ${support.location}.`);
      }
    }

    // 나이 확인 (프로그램 자격조건에 나이 관련 내용이 있는 경우)
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum >= 18 && ageNum <= 65) {
        details.push(language === 'ko'
          ? `✓ 만 ${ageNum}세는 신청 가능 연령입니다.`
          : `✓ Age ${ageNum} is eligible.`);
      } else if (ageNum < 18) {
        eligible = false;
        details.push(language === 'ko'
          ? `✗ 만 18세 이상부터 신청 가능합니다.`
          : `✗ You must be at least 18 years old.`);
      }
    }

    const message = eligible
      ? (language === 'ko'
          ? "축하합니다! 기본 자격 조건을 충족합니다."
          : "Congratulations! You meet the basic eligibility requirements.")
      : (language === 'ko'
          ? "일부 조건을 충족하지 못했습니다. 아래 내용을 확인해주세요."
          : "Some requirements are not met. Please check the details below.");

    setTimeout(() => {
      setCheckResult({ eligible, message, details });
      setIsChecking(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'ko' ? '로딩 중...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!support) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
          <span className="text-5xl mb-4 block">😢</span>
          <p className="text-red-600 mb-4">
            {language === 'ko' ? "지원 프로그램 정보를 찾을 수 없습니다." : "Support program not found."}
          </p>
          <Button onClick={() => router.push("/supports")}>
            {language === 'ko' ? "지원 프로그램 목록으로" : "Back to Programs"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-10 pb-20 px-4 md:px-6">
        {/* Page Heading */}
        <div className="w-full max-w-[800px] flex flex-col items-center text-center mb-10 gap-3">
          <h1 className="text-gray-900 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            {language === 'ko' ? '정부 지원 프로그램 자격 확인' : 'Government Support Eligibility Check'}
          </h1>
          <p className="text-gray-500 text-base md:text-lg font-normal leading-relaxed max-w-[600px]">
            {language === 'ko' ? (
              <>
                간단한 정보를 입력하고 신청 가능한 지원 혜택을 확인해보세요.<br className="hidden md:block" />
                입력하신 정보는 자격 확인 용도로만 사용됩니다.
              </>
            ) : (
              <>
                Enter your information to check your eligibility for support benefits.<br className="hidden md:block" />
                Your information is only used for eligibility verification.
              </>
            )}
          </p>
        </div>

        {/* Program Info Card */}
        <div className="w-full max-w-[800px] bg-blue-50 rounded-xl border border-blue-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{support.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{support.description}</p>
              <div className="flex flex-wrap gap-2">
                {support.eligible_visa_types.map((visa) => (
                  <span
                    key={visa}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                  >
                    {visa}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-[800px] bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10">
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* 비자 종류 */}
              <label className="flex flex-col gap-2">
                <span className="text-gray-900 text-sm font-bold flex items-center gap-1">
                  {language === 'ko' ? '비자 종류' : 'Visa Type'}
                  <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <select
                    value={selectedVisaType}
                    onChange={(e) => setSelectedVisaType(e.target.value)}
                    className="appearance-none w-full h-12 md:h-14 pl-4 pr-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
                  >
                    <option value="">
                      {language === 'ko' ? '비자 타입을 선택하세요' : 'Select visa type'}
                    </option>
                    {VISA_TYPES.map((visa) => (
                      <option key={visa.value} value={visa.value}>
                        {language === 'ko' ? visa.label : visa.label_en}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </label>

              {/* 거주지 */}
              <label className="flex flex-col gap-2">
                <span className="text-gray-900 text-sm font-bold flex items-center gap-1">
                  {language === 'ko' ? '거주지' : 'Residence'}
                  <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="appearance-none w-full h-12 md:h-14 pl-4 pr-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
                  >
                    <option value="">
                      {language === 'ko' ? '거주 지역을 선택하세요' : 'Select region'}
                    </option>
                    {REGIONS.map((region) => (
                      <option key={region.value} value={region.value}>
                        {language === 'ko' ? region.label : region.label_en}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </label>

              {/* 나이 */}
              <label className="flex flex-col gap-2">
                <span className="text-gray-900 text-sm font-bold flex items-center gap-1">
                  {language === 'ko' ? '나이' : 'Age'}
                  <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={language === 'ko' ? '만 나이를 입력하세요 (예: 28)' : 'Enter your age (e.g., 28)'}
                    min="1"
                    max="100"
                    className="w-full h-12 md:h-14 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
                  />
                </div>
              </label>

              {/* 경력 */}
              <label className="flex flex-col gap-2">
                <span className="text-gray-900 text-sm font-bold">
                  {language === 'ko' ? '경력' : 'Experience'}
                </span>
                <div className="relative">
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="appearance-none w-full h-12 md:h-14 pl-4 pr-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
                  >
                    <option value="">
                      {language === 'ko' ? '경력 기간을 선택하세요' : 'Select experience'}
                    </option>
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <option key={exp.value} value={exp.value}>
                        {language === 'ko' ? exp.label : exp.label_en}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </label>
            </div>

            {/* 결과 표시 */}
            {checkResult && (
              <div className={`rounded-lg p-5 ${
                checkResult.eligible
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {checkResult.eligible ? "🎉" : "⚠️"}
                  </span>
                  <div className="flex-1">
                    <p className={`font-bold mb-2 ${
                      checkResult.eligible ? "text-green-800" : "text-red-800"
                    }`}>
                      {checkResult.message}
                    </p>
                    {checkResult.details.length > 0 && (
                      <ul className="space-y-1">
                        {checkResult.details.map((detail, index) => (
                          <li key={index} className={`text-sm ${
                            detail.startsWith("✓") ? "text-green-700" : "text-red-700"
                          }`}>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                    {checkResult.eligible && support.official_link && (
                      <a
                        href={support.official_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        {language === 'ko' ? '공식 사이트에서 신청하기' : 'Apply on Official Site'}
                        <span>→</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 안내 박스 */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">ℹ️</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-gray-900">
                  {language === 'ko' ? '안내사항' : 'Notice'}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ko'
                    ? '제출된 정보는 프로그램 매칭 알고리즘을 위해서만 사용되며, 외부에 공개되지 않습니다. 정확한 매칭을 위해 실제 정보를 입력해주세요.'
                    : 'Your information is only used for program matching and is not shared externally. Please enter accurate information for better matching.'}
                </p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCheckEligibility}
                disabled={isChecking || !selectedVisaType || !selectedRegion || !age}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{language === 'ko' ? '확인 중...' : 'Checking...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'ko' ? '자격 확인하기' : 'Check Eligibility'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
              <p className="text-center mt-4 text-sm text-gray-500">
                {language === 'ko' ? (
                  <>
                    버튼을 누르면 <Link href="/terms" className="underline hover:text-blue-600">이용약관</Link> 및{' '}
                    <Link href="/privacy" className="underline hover:text-blue-600">개인정보처리방침</Link>에 동의하게 됩니다.
                  </>
                ) : (
                  <>
                    By clicking, you agree to our <Link href="/terms" className="underline hover:text-blue-600">Terms of Service</Link> and{' '}
                    <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
                  </>
                )}
              </p>
            </div>
          </form>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="w-full max-w-[800px] mt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/supports/${supportId}`)}
            className="w-full"
          >
            ← {language === 'ko' ? '프로그램 상세로 돌아가기' : 'Back to Program Details'}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-[960px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 font-bold text-sm">easyK</span>
            </div>
            <p className="text-xs text-gray-400">© 2024 easyK. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              {language === 'ko' ? '이용약관' : 'Terms'}
            </Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              {language === 'ko' ? '개인정보처리방침' : 'Privacy'}
            </Link>
            <Link href="/support" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              {language === 'ko' ? '고객센터' : 'Support'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
