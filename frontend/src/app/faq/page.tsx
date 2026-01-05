"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

interface FAQ {
  question: { ko: string; en: string };
  answer: { ko: string; en: string };
  category: string;
}

const FAQS: FAQ[] = [
  {
    category: "visa",
    question: {
      ko: "비자 연장을 신청했는데 거절당했어요. 어떻게 해야 하나요?",
      en: "My visa extension was rejected. What should I do?",
    },
    answer: {
      ko: "비자 거절 사유를 먼저 확인해야 합니다. 서류 미비, 체류 요건 미충족 등 다양한 이유가 있을 수 있습니다. 법률 상담을 통해 재신청 방법이나 이의신청 절차를 안내받으실 수 있습니다.",
      en: "First, you need to check the reason for visa rejection. There could be various reasons such as incomplete documents or failure to meet residence requirements. Through legal consultation, you can receive guidance on reapplication methods or appeal procedures.",
    },
  },
  {
    category: "visa",
    question: {
      ko: "체류 자격 변경은 어떻게 하나요?",
      en: "How do I change my residence status?",
    },
    answer: {
      ko: "체류 자격 변경은 출입국관리사무소에 신청하며, 변경하려는 체류 자격에 따라 필요한 서류가 다릅니다. 예를 들어 유학(D-2)에서 취업(E-7)으로 변경하는 경우 학위증명서, 고용계약서 등이 필요합니다.",
      en: "You apply for a change of residence status at the immigration office, and the required documents vary depending on the status you want to change to. For example, changing from student (D-2) to work (E-7) requires a degree certificate, employment contract, etc.",
    },
  },
  {
    category: "labor",
    question: {
      ko: "임금을 받지 못했어요. 어떻게 해야 하나요?",
      en: "I haven't received my wages. What should I do?",
    },
    answer: {
      ko: "먼저 사업주와 대화를 시도하고, 해결되지 않으면 고용노동부 또는 근로복지공단에 진정을 제기할 수 있습니다. 근로계약서, 급여명세서, 출퇴근 기록 등의 증빙자료를 준비하세요.",
      en: "First, try to communicate with your employer. If unresolved, you can file a complaint with the Ministry of Employment and Labor or the Korea Workers' Compensation & Welfare Service. Prepare evidence such as employment contract, pay stubs, and attendance records.",
    },
  },
  {
    category: "labor",
    question: {
      ko: "부당해고를 당했어요. 대응 방법이 있나요?",
      en: "I was unfairly dismissed. Is there a way to respond?",
    },
    answer: {
      ko: "부당해고 구제신청을 노동위원회에 제출할 수 있습니다. 해고통지서를 받은 날로부터 3개월 이내에 신청해야 하며, 해고 사유의 정당성, 절차의 적법성 등을 다툴 수 있습니다.",
      en: "You can file a petition for relief from unfair dismissal with the Labor Relations Commission. You must apply within 3 months from the date you received the dismissal notice, and you can dispute the legitimacy of the dismissal reason and the legality of the procedure.",
    },
  },
  {
    category: "contract",
    question: {
      ko: "전세 계약 후 집주인이 보증금을 돌려주지 않아요.",
      en: "The landlord won't return my deposit after the lease contract.",
    },
    answer: {
      ko: "계약서를 확인하고 명도일자가 지났는지, 공과금 정산이 완료되었는지 체크하세요. 집주인이 정당한 이유 없이 보증금을 돌려주지 않으면 내용증명 발송 후 소액사건심판이나 민사소송을 통해 해결할 수 있습니다.",
      en: "Check your contract to see if the move-out date has passed and utility bills have been settled. If the landlord doesn't return your deposit without valid reason, you can resolve it through small claims court or civil litigation after sending a certified mail.",
    },
  },
  {
    category: "general",
    question: {
      ko: "법률 상담 비용은 얼마인가요?",
      en: "How much does legal consultation cost?",
    },
    answer: {
      ko: "easyK의 법률 상담은 외국인 주민을 위한 무료 서비스입니다. 다만, 실제 소송 대리나 행정 절차 대행이 필요한 경우 별도 비용이 발생할 수 있으며, 이는 사전에 안내됩니다.",
      en: "Legal consultation at easyK is a free service for foreign residents. However, if actual litigation representation or administrative procedure agency is needed, separate costs may apply, which will be informed in advance.",
    },
  },
  {
    category: "general",
    question: {
      ko: "상담은 어떻게 진행되나요?",
      en: "How does the consultation proceed?",
    },
    answer: {
      ko: "온라인 신청서 제출 → 변호사 배정 → 이메일/전화/화상 상담 진행 → 필요시 추가 자료 요청 → 법적 조언 제공 순으로 진행됩니다. 평균 2-3일 내에 첫 응답을 받으실 수 있습니다.",
      en: "The process is: Online application submission → Lawyer assignment → Email/phone/video consultation → Additional documents request if needed → Legal advice provision. You can expect the first response within 2-3 days on average.",
    },
  },
  {
    category: "general",
    question: {
      ko: "영어나 다른 언어로도 상담받을 수 있나요?",
      en: "Can I receive consultation in English or other languages?",
    },
    answer: {
      ko: "네, easyK는 한국어와 영어를 기본 지원하며, 필요시 베트남어, 중국어, 태국어 등 다양한 언어로 상담 가능합니다. 신청서 작성 시 선호 언어를 선택해주세요.",
      en: "Yes, easyK supports Korean and English by default, and consultations are available in various languages such as Vietnamese, Chinese, and Thai if needed. Please select your preferred language when filling out the application form.",
    },
  },
];

export default function FAQPage() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categories = [
    { value: "all", label: { ko: "전체", en: "All" } },
    { value: "visa", label: { ko: "비자/체류", en: "Visa/Residence" } },
    { value: "labor", label: { ko: "근로/노동", en: "Labor/Employment" } },
    { value: "contract", label: { ko: "계약/기타", en: "Contract/Other" } },
    { value: "general", label: { ko: "일반", en: "General" } },
  ];

  const filteredFAQs =
    selectedCategory === "all"
      ? FAQS
      : FAQS.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-1 flex flex-col items-center py-8 md:py-12 px-4 sm:px-6">
        <div className="w-full max-w-[960px] flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-3 px-4">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-[-0.033em]">
              {language === "ko" ? "자주 묻는 질문" : "Frequently Asked Questions"}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base md:text-lg font-normal leading-relaxed">
              {language === "ko"
                ? "외국인 주민들이 자주 궁금해하는 법률 문제들을 정리했습니다. 원하는 답변을 찾지 못하셨다면 직접 상담을 신청해주세요."
                : "We've compiled common legal questions from foreign residents. If you can't find the answer you're looking for, please apply for a direct consultation."}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 px-4">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedCategory === category.value
                    ? "bg-primary text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-text-main dark:text-white border border-[#dce0e5] dark:border-gray-700 hover:border-primary"
                }`}
              >
                {category.label[language as keyof typeof category.label]}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="flex flex-col gap-4 px-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12 text-text-sub dark:text-gray-400">
                {language === "ko"
                  ? "해당 카테고리에 질문이 없습니다."
                  : "No questions in this category."}
              </div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-[#dce0e5] dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors hover:bg-[#f8fafc] dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="material-symbols-outlined text-primary mt-1 shrink-0">
                        help
                      </span>
                      <h3 className="text-text-main dark:text-white font-bold text-base md:text-lg leading-tight">
                        {faq.question[language as keyof typeof faq.question]}
                      </h3>
                    </div>
                    <span
                      className={`material-symbols-outlined text-text-sub transition-transform ${
                        expandedIndex === index ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {expandedIndex === index && (
                    <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2 border-t border-[#f0f2f4] dark:border-gray-700">
                      <div className="flex gap-3">
                        <span className="material-symbols-outlined text-primary mt-1 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                          campaign
                        </span>
                        <p className="text-text-sub dark:text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {faq.answer[language as keyof typeof faq.answer]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* CTA Section */}
          <div className="px-4 mt-6">
            <div className="bg-primary-light dark:bg-slate-800 rounded-2xl p-6 md:p-8 flex flex-col items-center gap-4 text-center">
              <div className="size-14 rounded-full bg-white dark:bg-slate-700 text-primary flex items-center justify-center shadow-sm">
                <span
                  className="material-symbols-outlined !text-[32px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  support_agent
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg md:text-xl font-bold text-text-main dark:text-white">
                  {language === "ko"
                    ? "더 자세한 상담이 필요하신가요?"
                    : "Need more detailed consultation?"}
                </h2>
                <p className="text-text-sub dark:text-gray-300 text-sm md:text-base">
                  {language === "ko"
                    ? "전문 변호사가 직접 여러분의 상황에 맞는 법률 자문을 제공합니다."
                    : "Professional lawyers will provide legal advice tailored to your situation."}
                </p>
              </div>
              <a
                href="/consultations"
                className="bg-primary hover:bg-[#164a85] text-white font-bold text-base px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>{language === "ko" ? "법률 상담 신청하기" : "Apply for Legal Consultation"}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
