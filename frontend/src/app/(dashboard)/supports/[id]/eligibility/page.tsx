"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Navbar from "@/components/ui/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

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
}

const VISA_TYPES = [
  "E-1", "E-2", "D-1", "D-2", "D-4", "F-1", "F-2", "F-5", "F-6", "H-1", "H-2"
];

export default function EligibilityCheckPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const supportId = params.id as string;

  const [support, setSupport] = useState<Support | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 자격 확인 폼 상태
  const [selectedVisaType, setSelectedVisaType] = useState("");
  const [residenceArea, setResidenceArea] = useState("");
  const [age, setAge] = useState("");
  const [hasExperience, setHasExperience] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    eligible: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchSupport();
  }, [supportId]);

  const fetchSupport = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/supports`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.supports?.find((s: Support) => s.id === supportId);
        if (found) {
          setSupport(found);
        } else {
          setError("지원 프로그램 정보를 찾을 수 없습니다.");
        }
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError("지원 프로그램 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckEligibility = () => {
    if (!support) {
      setError("지원 프로그램 정보가 없습니다.");
      return;
    }
    if (!selectedVisaType) {
      setError("비자 종류를 선택해주세요.");
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    // 비자 종류 확인
    const isEligibleVisa = support.eligible_visa_types.includes(selectedVisaType);

    let message = "";
    let eligible = true;

    if (!isEligibleVisa) {
      eligible = false;
      message = `죄송합니다. 이 프로그램은 ${selectedVisaType} 비자 소지자만 지원할 수 있습니다.`;
    } else if (support.eligibility.toLowerCase().includes("거주") && !residenceArea.trim()) {
      eligible = false;
      message = "죄송합니다. 거주 지역을 입력해주세요.";
    } else if (support.eligibility.toLowerCase().includes("경력") && !hasExperience) {
      eligible = false;
      message = "죄송합니다. 이 프로그램은 관련 경력이 필요합니다.";
    } else {
      message = "축하합니다! 자격 조건을 충족합니다. 신청할 수 있습니다.";
    }

    setTimeout(() => {
      setCheckResult({ eligible, message });
      setIsChecking(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (!support) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-red-600 mb-4">{error || "지원 프로그램 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/supports")}>
            지원 프로그램 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              ← 뒤로가기
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 지원 프로그램 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{support.title}</h1>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 mb-2">
                <span className="font-semibold">대상 조건:</span>
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {support.eligibility}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">대상 비자:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {support.eligible_visa_types.map((visa) => (
                  <span
                    key={visa}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium"
                  >
                    {visa}
                  </span>
                ))}
              </div>
            </div>

            {support.support_content && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">지원 내용:</span>
                </p>
                <p className="text-sm text-gray-700">{support.support_content}</p>
              </div>
            )}

            {support.official_link && (
              <div className="mb-6">
                <Button
                  variant="primary"
                  onClick={() => window.open(support.official_link!, "_blank")}
                >
                  공식 신청 바로가기 →
                </Button>
              </div>
            )}
          </div>

          {/* 자격 확인 폼 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">자격 확인</h2>

            {checkResult && (
              <div className={`mb-6 p-4 rounded-md ${checkResult.eligible
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
                }`}>
                <p className={`text-sm ${checkResult.eligible ? "text-green-800" : "text-red-800"
                  }`}>
                  {checkResult.message}
                </p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
              {/* 비자 종류 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보유 비자 종류 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVisaType}
                  onChange={(e) => setSelectedVisaType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">비자 종류를 선택하세요</option>
                  {VISA_TYPES.map((visa) => (
                    <option key={visa} value={visa}>
                      {visa}
                    </option>
                  ))}
                </select>
              </div>

              {/* 거주 지역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 거주 지역
                </label>
                <Input
                  type="text"
                  placeholder="예: 경기도 고양시 덕양구"
                  value={residenceArea}
                  onChange={(e) => setResidenceArea(e.target.value)}
                />
              </div>

              {/* 나이 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  만 나이
                </label>
                <Input
                  type="number"
                  placeholder="예: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>

              {/* 경력 여부 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasExperience}
                    onChange={(e) => setHasExperience(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">관련 경력이 있습니다</span>
                </label>
              </div>

              {/* 자격 확인 버튼 */}
              <Button
                type="button"
                variant="primary"
                onClick={handleCheckEligibility}
                disabled={isChecking || !selectedVisaType}
                loading={isChecking}
                fullWidth
                size="lg"
              >
                자격 확인하기
              </Button>
            </form>

            {/* 안내 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                <span className="font-semibold">안내:</span>
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>자격 확인 결과는 참고용입니다.</li>
                <li>실제 신청은 공식 신청 사이트에서 진행해주세요.</li>
                <li>필요한 서류는 미리 준비해주세요.</li>
                <li>신청 관련 문의는 {support.department}에 연락해주세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




