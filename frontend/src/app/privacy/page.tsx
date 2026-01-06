"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#121920] text-[#121417] dark:text-white flex flex-col">
      <DesignHeader />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#657486] mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            {language === "ko" ? "홈" : "Home"}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-bold text-primary">
            {language === "ko" ? "개인정보처리방침" : "Privacy Policy"}
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
            {language === "ko" ? "개인정보처리방침" : "Privacy Policy"}
          </h1>
          <p className="text-[#657486] dark:text-[#9aaebf]">
            {language === "ko" ? "최종 수정일: 2026년 1월 1일" : "Last updated: January 1, 2026"}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[#1a222d] rounded-2xl border border-[#e5e7eb] dark:border-[#333] p-6 md:p-10">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "1. 개인정보의 수집 및 이용 목적" : "1. Purpose of Collecting and Using Personal Information"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "easyK(이하 '회사')는 다음의 목적을 위하여 개인정보를 처리합니다:\n\n• 회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증\n• 서비스 제공: 법률 상담 매칭, 일자리 지원, 정부 지원 정보 제공\n• 마케팅 및 광고: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 정보 제공"
                : "easyK (hereinafter 'Company') processes personal information for the following purposes:\n\n• Member registration and management: Confirmation of membership intention, identification and authentication for membership services\n• Service provision: Legal consultation matching, job application support, government support information\n• Marketing and advertising: Development of new services, personalized services, event information"}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "2. 수집하는 개인정보 항목" : "2. Personal Information Collected"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:\n\n• 필수항목: 이메일, 비밀번호, 이름, 국적, 비자 종류\n• 선택항목: 전화번호, 거주지역, 한국어 능력 수준\n• 자동수집: 접속 IP, 쿠키, 서비스 이용 기록"
                : "The Company collects the following personal information for service provision:\n\n• Required: Email, password, name, nationality, visa type\n• Optional: Phone number, residence area, Korean language proficiency\n• Automatically collected: Access IP, cookies, service usage records"}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "3. 개인정보의 보유 및 이용 기간" : "3. Retention and Use Period of Personal Information"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다:\n\n• 회원 정보: 회원 탈퇴 시까지\n• 상담 기록: 상담 완료 후 3년\n• 결제 정보: 거래 완료 후 5년 (전자상거래법)"
                : "The Company processes and retains personal information within the retention period stipulated by law or agreed upon at the time of collection:\n\n• Member information: Until membership withdrawal\n• Consultation records: 3 years after consultation completion\n• Payment information: 5 years after transaction completion (E-Commerce Act)"}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "4. 개인정보의 제3자 제공" : "4. Provision of Personal Information to Third Parties"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "회사는 정보주체의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:\n\n• 정보주체가 사전에 동의한 경우\n• 법률의 규정 또는 법적 의무 준수를 위해 불가피한 경우\n• 서비스 제공을 위해 필요한 경우 (예: 법률 상담 매칭 시 변호사에게 상담 내용 전달)"
                : "The Company does not provide personal information to third parties as a rule. However, exceptions are made in the following cases:\n\n• When the data subject has given prior consent\n• When unavoidable for compliance with legal obligations\n• When necessary for service provision (e.g., providing consultation details to lawyers for matching)"}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "5. 정보주체의 권리·의무 및 행사방법" : "5. Rights and Obligations of Data Subjects"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:\n\n• 개인정보 열람 요구\n• 오류 등이 있을 경우 정정 요구\n• 삭제 요구\n• 처리정지 요구\n\n위 권리 행사는 회사에 대해 서면, 전화, 이메일 등을 통하여 하실 수 있습니다."
                : "Data subjects may exercise the following rights regarding personal information protection at any time:\n\n• Request to access personal information\n• Request for correction of errors\n• Request for deletion\n• Request to suspend processing\n\nThese rights can be exercised through written request, phone, or email to the Company."}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "6. 개인정보의 안전성 확보 조치" : "6. Measures to Ensure Security of Personal Information"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:\n\n• 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육\n• 기술적 조치: 개인정보처리시스템 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화\n• 물리적 조치: 전산실, 자료보관실 등의 접근통제"
                : "The Company takes the following measures to ensure the security of personal information:\n\n• Administrative measures: Establishment and implementation of internal management plans, regular employee training\n• Technical measures: Access rights management for personal information processing systems, installation of access control systems, encryption of personal information\n• Physical measures: Access control to computer rooms and data storage facilities"}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "7. 개인정보 보호책임자" : "7. Personal Information Protection Officer"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:\n\n• 개인정보 보호책임자: 홍길동\n• 연락처: privacy@easyk.kr\n• 전화: 02-1234-5678"
                : "The Company designates a Personal Information Protection Officer to oversee personal information processing and handle complaints and remedies:\n\n• Personal Information Protection Officer: Hong Gildong\n• Contact: privacy@easyk.kr\n• Phone: 02-1234-5678"}
            </p>

            <div className="mt-10 p-4 bg-[#f6f7f8] dark:bg-[#121920] rounded-lg">
              <p className="text-sm text-[#657486] dark:text-[#9aaebf]">
                {language === "ko"
                  ? "개인정보처리방침에 대한 문의사항이 있으시면 고객센터로 연락해 주세요."
                  : "If you have any questions about this Privacy Policy, please contact our customer service."}
              </p>
              <Link href="/support" className="text-primary font-bold text-sm hover:underline">
                {language === "ko" ? "고객센터 바로가기 →" : "Go to Support →"}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
