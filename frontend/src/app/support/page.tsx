"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

const FAQ_ITEMS = [
  {
    question: { ko: "회원가입은 어떻게 하나요?", en: "How do I sign up?" },
    answer: {
      ko: "홈페이지 상단의 '로그인' 버튼을 클릭한 후 '회원가입' 링크를 통해 가입할 수 있습니다. 이메일, 비밀번호, 이름, 국적, 비자 종류 등 기본 정보를 입력하시면 됩니다.",
      en: "Click the 'Login' button at the top of the page, then click 'Sign Up'. Enter your email, password, name, nationality, and visa type to complete registration."
    }
  },
  {
    question: { ko: "법률 상담 비용은 얼마인가요?", en: "How much does legal consultation cost?" },
    answer: {
      ko: "법률 상담 비용은 상담 유형과 방법에 따라 다릅니다. 이메일 상담은 30,000원부터, 전화 상담은 50,000원부터, 화상 상담은 80,000원부터 시작합니다. 정확한 비용은 상담 신청 시 확인하실 수 있습니다.",
      en: "Legal consultation fees vary by type and method. Email consultations start from 30,000 KRW, phone consultations from 50,000 KRW, and video consultations from 80,000 KRW. Exact fees can be confirmed during the application process."
    }
  },
  {
    question: { ko: "일자리 지원 후 결과는 언제 알 수 있나요?", en: "When will I know the result of my job application?" },
    answer: {
      ko: "일자리 지원 결과는 채용 담당자의 검토 후 통보됩니다. 보통 1-2주 내에 결과를 확인하실 수 있으며, 지원 내역 페이지에서 실시간으로 진행 상태를 확인하실 수 있습니다.",
      en: "Job application results will be notified after review by the hiring manager. Results are usually available within 1-2 weeks, and you can check the real-time status on your application history page."
    }
  },
  {
    question: { ko: "정부 지원 프로그램 자격 요건은 어떻게 확인하나요?", en: "How can I check eligibility for government support programs?" },
    answer: {
      ko: "각 정부 지원 프로그램 상세 페이지에서 자격 요건을 확인하실 수 있습니다. 또한 '자격 확인' 버튼을 통해 간단한 정보 입력으로 본인의 자격 여부를 미리 확인하실 수 있습니다.",
      en: "You can check eligibility requirements on each government support program's detail page. You can also use the 'Check Eligibility' button to verify your eligibility by entering simple information."
    }
  },
  {
    question: { ko: "결제 후 환불이 가능한가요?", en: "Can I get a refund after payment?" },
    answer: {
      ko: "상담 시작 전에는 전액 환불이 가능합니다. 상담 시작 후에는 환불이 어려울 수 있으니, 취소를 원하시면 상담 예정 시간 24시간 전까지 고객센터로 연락해 주세요.",
      en: "Full refunds are available before the consultation starts. Refunds may be difficult after the consultation begins, so please contact customer service at least 24 hours before the scheduled time if you wish to cancel."
    }
  },
];

export default function SupportPage() {
  const { language } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setSubmitSuccess(false), 5000);
  };

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
            {language === "ko" ? "고객센터" : "Support"}
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
            {language === "ko" ? "고객센터" : "Customer Support"}
          </h1>
          <p className="text-[#657486] dark:text-[#9aaebf] max-w-2xl mx-auto">
            {language === "ko"
              ? "궁금한 점이 있으시면 자주 묻는 질문을 확인하시거나, 문의 양식을 통해 연락해 주세요."
              : "Check our FAQ or contact us through the inquiry form if you have any questions."}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-[#1a222d] rounded-xl border border-[#e5e7eb] dark:border-[#333] p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">call</span>
            </div>
            <h3 className="font-bold mb-2">{language === "ko" ? "전화 문의" : "Phone"}</h3>
            <p className="text-[#657486] dark:text-[#9aaebf] text-sm mb-1">02-1234-5678</p>
            <p className="text-[#657486] dark:text-[#9aaebf] text-xs">
              {language === "ko" ? "평일 09:00 - 18:00" : "Mon-Fri 09:00 - 18:00"}
            </p>
          </div>
          <div className="bg-white dark:bg-[#1a222d] rounded-xl border border-[#e5e7eb] dark:border-[#333] p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">mail</span>
            </div>
            <h3 className="font-bold mb-2">{language === "ko" ? "이메일 문의" : "Email"}</h3>
            <p className="text-[#657486] dark:text-[#9aaebf] text-sm mb-1">support@easyk.kr</p>
            <p className="text-[#657486] dark:text-[#9aaebf] text-xs">
              {language === "ko" ? "24시간 접수 가능" : "24/7 Available"}
            </p>
          </div>
          <div className="bg-white dark:bg-[#1a222d] rounded-xl border border-[#e5e7eb] dark:border-[#333] p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">chat</span>
            </div>
            <h3 className="font-bold mb-2">{language === "ko" ? "카카오톡 상담" : "KakaoTalk"}</h3>
            <p className="text-[#657486] dark:text-[#9aaebf] text-sm mb-1">@easyK</p>
            <p className="text-[#657486] dark:text-[#9aaebf] text-xs">
              {language === "ko" ? "평일 09:00 - 18:00" : "Mon-Fri 09:00 - 18:00"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">help</span>
              {language === "ko" ? "자주 묻는 질문" : "FAQ"}
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#1a222d] rounded-xl border border-[#e5e7eb] dark:border-[#333] overflow-hidden"
                >
                  <button
                    onClick={() => handleFaqToggle(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-[#252e3a] transition-colors"
                  >
                    <span className="font-medium pr-4">
                      {faq.question[language as keyof typeof faq.question]}
                    </span>
                    <span className={`material-symbols-outlined text-[#657486] transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-[#657486] dark:text-[#9aaebf] text-sm leading-relaxed whitespace-pre-line">
                        {faq.answer[language as keyof typeof faq.answer]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              {language === "ko" ? "문의하기" : "Contact Us"}
            </h2>
            <div className="bg-white dark:bg-[#1a222d] rounded-xl border border-[#e5e7eb] dark:border-[#333] p-6">
              {submitSuccess && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {language === "ko"
                      ? "문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다."
                      : "Your inquiry has been submitted. We will respond as soon as possible."}
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {language === "ko" ? "이름" : "Name"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#dce0e5] dark:border-[#333] bg-white dark:bg-[#121920] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                    placeholder={language === "ko" ? "이름을 입력하세요" : "Enter your name"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {language === "ko" ? "이메일" : "Email"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#dce0e5] dark:border-[#333] bg-white dark:bg-[#121920] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                    placeholder={language === "ko" ? "이메일을 입력하세요" : "Enter your email"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {language === "ko" ? "문의 유형" : "Subject"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#dce0e5] dark:border-[#333] bg-white dark:bg-[#121920] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                  >
                    <option value="">{language === "ko" ? "문의 유형을 선택하세요" : "Select subject"}</option>
                    <option value="general">{language === "ko" ? "일반 문의" : "General Inquiry"}</option>
                    <option value="consultation">{language === "ko" ? "법률 상담 관련" : "Legal Consultation"}</option>
                    <option value="job">{language === "ko" ? "일자리 관련" : "Job Related"}</option>
                    <option value="support">{language === "ko" ? "정부 지원 관련" : "Government Support"}</option>
                    <option value="payment">{language === "ko" ? "결제/환불 문의" : "Payment/Refund"}</option>
                    <option value="technical">{language === "ko" ? "기술 지원" : "Technical Support"}</option>
                    <option value="other">{language === "ko" ? "기타" : "Other"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {language === "ko" ? "문의 내용" : "Message"} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-[#dce0e5] dark:border-[#333] bg-white dark:bg-[#121920] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none"
                    placeholder={language === "ko" ? "문의 내용을 상세히 작성해 주세요" : "Please describe your inquiry in detail"}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      {language === "ko" ? "전송 중..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      {language === "ko" ? "문의 보내기" : "Send Inquiry"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
