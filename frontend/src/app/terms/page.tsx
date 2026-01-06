"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

export default function TermsPage() {
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
            {language === "ko" ? "이용약관" : "Terms of Service"}
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
            {language === "ko" ? "이용약관" : "Terms of Service"}
          </h1>
          <p className="text-[#657486] dark:text-[#9aaebf]">
            {language === "ko" ? "최종 수정일: 2026년 1월 1일" : "Last updated: January 1, 2026"}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[#1a222d] rounded-2xl border border-[#e5e7eb] dark:border-[#333] p-6 md:p-10">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "제1조 (목적)" : "Article 1 (Purpose)"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "본 약관은 easyK(이하 '회사')가 제공하는 외국인 맞춤형 정착 지원 플랫폼 서비스(이하 '서비스')의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다."
                : "These Terms of Service govern the use of the easyK foreign settlement support platform services provided by easyK (hereinafter 'Company') and define the rights, obligations, and responsibilities between the Company and users."}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "제2조 (정의)" : "Article 2 (Definitions)"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "1. '서비스'란 회사가 제공하는 법률 상담 매칭, 일자리 검색, 정부 지원 정보 조회 등 외국인 정착 지원 관련 모든 서비스를 의미합니다.\n2. '이용자'란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.\n3. '회원'이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 계속적으로 이용할 수 있는 자를 말합니다."
                : "1. 'Service' refers to all foreign settlement support services provided by the Company, including legal consultation matching, job search, and government support information inquiry.\n2. 'User' refers to members and non-members who use the services provided by the Company in accordance with these Terms.\n3. 'Member' refers to a person who has registered as a member by providing personal information to the Company and can continuously use the Company's services."}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "제3조 (약관의 효력 및 변경)" : "Article 3 (Effect and Amendment of Terms)"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.\n2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.\n3. 변경된 약관은 서비스 내 공지사항을 통해 공지되며, 공지 후 7일이 경과한 날부터 효력이 발생합니다."
                : "1. These Terms shall be effective for all users who wish to use the Service.\n2. The Company may amend these Terms as necessary within the scope that does not violate relevant laws.\n3. Amended Terms shall be announced through the notice section within the Service and shall become effective 7 days after the announcement."}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "제4조 (서비스의 제공)" : "Article 4 (Provision of Services)"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "회사는 다음과 같은 서비스를 제공합니다:\n1. 법률 상담 신청 및 전문가 매칭 서비스\n2. 외국인 대상 일자리 정보 제공 및 지원 서비스\n3. 정부 지원 프로그램 정보 제공 서비스\n4. 기타 회사가 정하는 서비스"
                : "The Company provides the following services:\n1. Legal consultation application and expert matching service\n2. Job information provision and application service for foreigners\n3. Government support program information service\n4. Other services determined by the Company"}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "제5조 (이용자의 의무)" : "Article 5 (User Obligations)"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "이용자는 다음 행위를 하여서는 안 됩니다:\n1. 타인의 정보 도용\n2. 회사가 게시한 정보의 변경\n3. 회사가 정한 정보 이외의 정보 송신 또는 게시\n4. 회사 및 제3자의 저작권 등 지적재산권 침해\n5. 기타 불법적이거나 부당한 행위"
                : "Users shall not engage in the following activities:\n1. Misappropriation of others' information\n2. Alteration of information posted by the Company\n3. Transmission or posting of information other than that designated by the Company\n4. Infringement of intellectual property rights of the Company or third parties\n5. Other illegal or improper activities"}
            </p>

            <h2 className="text-xl font-bold mb-4">
              {language === "ko" ? "제6조 (책임의 제한)" : "Article 6 (Limitation of Liability)"}
            </h2>
            <p className="text-[#657486] dark:text-[#9aaebf] mb-6 leading-relaxed">
              {language === "ko"
                ? "1. 회사는 천재지변, 전쟁 등 불가항력적인 사유로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.\n2. 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.\n3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다."
                : "1. The Company shall be exempt from liability if it is unable to provide services due to force majeure such as natural disasters or war.\n2. The Company shall not be liable for service disruptions caused by user negligence.\n3. The Company shall not be liable for any loss of expected profits by users through the use of the Service."}
            </p>

            <div className="mt-10 p-4 bg-[#f6f7f8] dark:bg-[#121920] rounded-lg">
              <p className="text-sm text-[#657486] dark:text-[#9aaebf]">
                {language === "ko"
                  ? "본 약관에 대한 문의사항이 있으시면 고객센터로 연락해 주세요."
                  : "If you have any questions about these Terms, please contact our customer service."}
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
