"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

interface Consultation {
  id: string;
  consultation_type: string;
  consultation_method: string;
  content: string;
  amount: number;
  status: string;
  payment_status: string;
  consultant_id: string | null;
  created_at: string;
}

export default function ConsultationsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated, requireAuth } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewConsultation, setShowNewConsultation] = useState(false);

  useEffect(() => {
    requireAuth();
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/consultations", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      } else if (response.status === 401 || response.status === 403) {
        // 인증 실패 시 로그인 페이지로 리다이렉트
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        setError(language === 'ko' ? '데이터를 불러오는데 실패했습니다.' : 'Failed to load data.');
      }
    } catch (error) {
      setError(language === 'ko' ? '네트워크 오류가 발생했습니다.' : 'Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        <div className="w-full max-w-[960px] flex flex-col gap-8">
          {/* Progress Bar */}
          <div className="flex flex-col gap-3 px-4">
            <div className="flex gap-6 justify-between items-end">
              <p className="text-primary text-sm font-bold leading-normal tracking-wide">
                {language === 'ko' ? 'STEP 01' : 'STEP 01'}
              </p>
              <p className="text-text-sub dark:text-gray-400 text-sm font-medium leading-normal">
                {language === 'ko' ? '단계 1 / 3' : 'Step 1 / 3'}
              </p>
            </div>
            <div className="rounded-full bg-[#dce0e5] dark:bg-gray-700 h-2 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>

          {/* Header Section */}
          <div className="flex flex-col gap-3 px-4 mt-2">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-[-0.033em]">
              {language === 'ko' ? '법률 상담 신청' : 'Legal Consultation Application'}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base md:text-lg font-normal leading-relaxed">
              {language === 'ko' ? (
                <>
                  어떤 도움이 필요하신가요? 아래에서 상담 분야를 선택해주세요.<br className="hidden sm:block"/>
                  전문 변호사가 빠르고 정확하게 도와드립니다.
                </>
              ) : (
                <>
                  What kind of help do you need? Please select a consultation area below.<br className="hidden sm:block"/>
                  Professional lawyers will help you quickly and accurately.
                </>
              )}
            </p>
          </div>

          {/* Info Box */}
          <div className="px-4">
            <div className="w-full bg-primary-light dark:bg-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="hidden md:flex items-center justify-center size-14 rounded-full bg-white dark:bg-slate-700 text-primary shrink-0 shadow-sm">
                <span className="material-symbols-outlined !text-[32px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  support_agent
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg md:text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
                  <span className="md:hidden material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    support_agent
                  </span>
                  {language === 'ko' ? '외국인 주민을 위한 든든한 법률 파트너, easyK' : 'A Reliable Legal Partner for Foreign Residents, easyK'}
                </h2>
                <p className="text-text-sub dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  {language === 'ko' ? (
                    <>
                      easyK 법률 상담 서비스에 오신 것을 환영합니다. 한국 생활 중 겪는 비자, 근로, 계약 등 복잡하고 어려운 법적 문제, 이제 혼자 고민하지 마세요.
                      저희는 외국인 주민 여러분의 권리 보호와 안정적인 정착을 위해 전문 변호사의 1:1 맞춤형 법률 자문을 무료로 지원하고 있습니다.
                    </>
                  ) : (
                    <>
                      Welcome to easyK legal consultation service. Don't struggle alone with complex legal issues such as visas, employment, and contracts.
                      We provide free professional legal consultation to protect your rights and ensure stable settlement.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Consultation Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            {/* Visa Card */}
            <button
              onClick={() => router.push('/consultations/new?type=visa')}
              className="group relative flex flex-col items-start gap-4 p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="size-14 rounded-xl bg-primary-light/50 dark:bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined !text-[32px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  flight_takeoff
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-text-main dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {language === 'ko' ? '비자/체류' : 'Visa/Residence'}
                </h3>
                <p className="text-text-sub dark:text-gray-400 text-sm font-normal leading-relaxed">
                  {language === 'ko' ? (
                    <>
                      비자 연장, 자격 변경,<br/>
                      불법 체류 및 추방 구제 상담
                    </>
                  ) : (
                    <>
                      Visa extension, status change,<br/>
                      illegal stay and deportation relief consultation
                    </>
                  )}
                </p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </button>

            {/* Labor Card */}
            <button
              onClick={() => router.push('/consultations/new?type=labor')}
              className="group relative flex flex-col items-start gap-4 p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="size-14 rounded-xl bg-primary-light/50 dark:bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined !text-[32px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  work
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-text-main dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {language === 'ko' ? '근로/노동' : 'Labor/Employment'}
                </h3>
                <p className="text-text-sub dark:text-gray-400 text-sm font-normal leading-relaxed">
                  {language === 'ko' ? (
                    <>
                      임금 체불, 부당 해고,<br/>
                      산업 재해 보상 및 근로 계약
                    </>
                  ) : (
                    <>
                      Wage arrears, unfair dismissal,<br/>
                      industrial accident compensation and labor contracts
                    </>
                  )}
                </p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </button>

            {/* Contract Card */}
            <button
              onClick={() => router.push('/consultations/new?type=contract')}
              className="group relative flex flex-col items-start gap-4 p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="size-14 rounded-xl bg-primary-light/50 dark:bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined !text-[32px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  gavel
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-text-main dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {language === 'ko' ? '계약/기타' : 'Contract/Other'}
                </h3>
                <p className="text-text-sub dark:text-gray-400 text-sm font-normal leading-relaxed">
                  {language === 'ko' ? (
                    <>
                      부동산 계약, 생활 법률,<br/>
                      형사 사건 및 기타 법적 문제
                    </>
                  ) : (
                    <>
                      Real estate contracts, living law,<br/>
                      criminal cases and other legal issues
                    </>
                  )}
                </p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </button>
          </div>

          {/* FAQ Box */}
          <div className="px-4 mt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-2xl border border-[#dce0e5] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-text-main dark:text-white">
                  <span className="material-symbols-outlined text-primary">help</span>
                  <p className="text-lg font-bold leading-tight">
                    {language === 'ko' ? '아직 무엇을 선택해야 할지 모르시겠나요?' : 'Not sure what to choose yet?'}
                  </p>
                </div>
                <p className="text-text-sub dark:text-gray-400 text-base font-normal leading-normal pl-8">
                  {language === 'ko' ?
                    '자주 묻는 질문(FAQ)을 확인하거나 고객센터에 직접 문의하실 수 있습니다.' :
                    'You can check the FAQ or contact customer service directly.'
                  }
                </p>
              </div>
              <Link
                href="/faq"
                className="flex items-center justify-center gap-2 bg-[#f0f2f4] dark:bg-gray-700 hover:bg-[#e2e4e8] dark:hover:bg-gray-600 text-text-main dark:text-white px-5 py-3 rounded-lg font-bold text-sm transition-colors min-w-fit w-full md:w-auto"
              >
                <span>{language === 'ko' ? '자주 묻는 질문 보기' : 'View FAQ'}</span>
                <span className="material-symbols-outlined !text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
