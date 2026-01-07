"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserGuard } from "@/hooks/useRoleGuard";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

interface Message {
  id: string;
  sender_type: "client" | "consultant";
  sender_name: string;
  content: string;
  created_at: string;
  attachments?: { name: string; url: string; type: string }[];
}

interface Consultation {
  id: string;
  consultation_type: string;
  content: string;
  created_at: string;
  status: string;
  consultant_id: string | null;
  consultant_name?: string;
}

// 샘플 메시지 데이터
const SAMPLE_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender_type: "consultant",
    sender_name: "김변호사",
    content: "안녕하세요, 상담 요청해 주셔서 감사합니다. 제출해 주신 내용을 검토했습니다. 비자 문제에 대해 자세히 상담드리겠습니다.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "msg-2",
    sender_type: "client",
    sender_name: "의뢰인",
    content: "네, 감사합니다. E-7 비자 연장에 대해 궁금한 점이 있어서 문의드렸습니다.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg-3",
    sender_type: "consultant",
    sender_name: "김변호사",
    content: "E-7 비자 연장의 경우, 만료 4개월 전부터 신청 가능합니다. 현재 비자 상태와 고용계약서를 확인해 주시면 더 정확한 안내가 가능합니다.",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export default function ConsultationChatPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const isAuthorized = useUserGuard();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthorized) {
      fetchConsultation();
    }
  }, [isAuthorized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConsultation = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/consultations/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultation(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch consultation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    // 새 메시지 추가 (로컬)
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_type: "client",
      sender_name: "의뢰인",
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === "ko" ? "ko-KR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === "ko") {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getConsultationNumber = (id: string) => {
    const year = new Date().getFullYear();
    const shortId = id.substring(0, 8).toUpperCase();
    return `#${year}-${shortId}`;
  };

  const getConsultationType = (type: string) => {
    const types: Record<string, { ko: string; en: string }> = {
      visa: { ko: "비자 상담", en: "Visa Consultation" },
      labor: { ko: "근로 상담", en: "Labor Consultation" },
      contract: { ko: "계약 상담", en: "Contract Consultation" },
      other: { ko: "기타 상담", en: "Other Consultation" },
    };
    return types[type]?.[language as "ko" | "en"] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "로딩 중..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "상담 정보를 찾을 수 없습니다." : "Consultation not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-grow flex flex-col max-w-5xl mx-auto w-full p-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-primary">
            {language === "ko" ? "홈" : "Home"}
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/consultations/my" className="hover:text-primary">
            {language === "ko" ? "내 상담" : "My Consultations"}
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-text-main dark:text-white">
            {language === "ko" ? "상담 진행" : "Consultation"}
          </span>
        </nav>

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">chat</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg font-bold text-text-main dark:text-white">
                    {getConsultationType(consultation.consultation_type)}
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    {language === "ko" ? "진행중" : "In Progress"}
                  </span>
                </div>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {getConsultationNumber(consultation.id)} · {consultation.consultant_name || (language === "ko" ? "김변호사" : "Lawyer Kim")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/consultations/${params.id}`}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-lg">description</span>
                <span>{language === "ko" ? "상담 정보" : "Details"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col lg:flex-row gap-4">
          {/* Chat Section */}
          <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-400px)] min-h-[400px]">
              {/* Date Separator */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-xs text-text-sub dark:text-gray-500 font-medium">
                  {formatDate(messages[0]?.created_at || new Date().toISOString())}
                </span>
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === "client" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.sender_type === "client" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div
                      className={`size-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender_type === "consultant"
                          ? "bg-primary text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-text-sub dark:text-gray-400"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {message.sender_type === "consultant" ? "gavel" : "person"}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col ${message.sender_type === "client" ? "items-end" : "items-start"}`}>
                      <span className="text-xs text-text-sub dark:text-gray-500 mb-1">{message.sender_name}</span>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.sender_type === "client"
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-gray-100 dark:bg-gray-700 text-text-main dark:text-white rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <span className="text-[11px] text-text-sub dark:text-gray-500 mt-1">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="size-10 flex items-center justify-center text-text-sub dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                />
                <div className="flex-grow relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={language === "ko" ? "메시지를 입력하세요..." : "Type your message..."}
                    rows={1}
                    className="w-full px-4 py-2.5 pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-text-main dark:text-white placeholder-text-sub dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="size-10 flex items-center justify-center bg-primary hover:bg-[#164a85] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Alternative Contact Methods */}
          <div className="lg:w-80 flex flex-col gap-4">
            {/* Contact Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_support</span>
                {language === "ko" ? "상담 안내" : "Consultation Guide"}
              </h3>

              <div className="space-y-4">
                {/* Chat Method */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                  <span className="material-symbols-outlined text-primary mt-0.5">chat</span>
                  <div>
                    <p className="text-sm font-medium text-text-main dark:text-white mb-1">
                      {language === "ko" ? "채팅 상담" : "Chat Consultation"}
                    </p>
                    <p className="text-xs text-text-sub dark:text-gray-400 leading-relaxed">
                      {language === "ko"
                        ? "실시간 채팅으로 변호사와 상담할 수 있습니다."
                        : "Chat with your lawyer in real-time."}
                    </p>
                  </div>
                </div>

                {/* Email Method */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="material-symbols-outlined text-text-sub dark:text-gray-400 mt-0.5">mail</span>
                  <div>
                    <p className="text-sm font-medium text-text-main dark:text-white mb-1">
                      {language === "ko" ? "이메일 상담" : "Email Consultation"}
                    </p>
                    <p className="text-xs text-text-sub dark:text-gray-400 leading-relaxed mb-2">
                      {language === "ko"
                        ? "상세한 문의는 이메일로 보내주세요."
                        : "Send detailed inquiries via email."}
                    </p>
                    <a
                      href="mailto:consult@easyk.kr"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      consult@easyk.kr
                    </a>
                  </div>
                </div>

                {/* Phone Method */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="material-symbols-outlined text-text-sub dark:text-gray-400 mt-0.5">call</span>
                  <div>
                    <p className="text-sm font-medium text-text-main dark:text-white mb-1">
                      {language === "ko" ? "전화 상담" : "Phone Consultation"}
                    </p>
                    <p className="text-xs text-text-sub dark:text-gray-400 leading-relaxed mb-2">
                      {language === "ko"
                        ? "긴급한 경우 전화 상담을 이용하세요."
                        : "Use phone consultation for urgent matters."}
                    </p>
                    <a
                      href="tel:1588-0000"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      1588-0000
                    </a>
                    <p className="text-[11px] text-text-sub dark:text-gray-500 mt-1">
                      {language === "ko" ? "평일 09:00 - 18:00" : "Weekdays 09:00 - 18:00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-bold text-text-main dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">lightbulb</span>
                {language === "ko" ? "상담 팁" : "Consultation Tips"}
              </h3>
              <ul className="space-y-2 text-xs text-text-sub dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {language === "ko"
                    ? "궁금한 점을 미리 정리해두세요."
                    : "Prepare your questions in advance."}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {language === "ko"
                    ? "관련 서류는 첨부파일로 공유해주세요."
                    : "Share relevant documents as attachments."}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {language === "ko"
                    ? "상담 내용은 저장됩니다."
                    : "Consultation history is saved."}
                </li>
              </ul>
            </div>

            {/* Complete Consultation Button */}
            <Link
              href={`/consultations/${params.id}/complete`}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {language === "ko" ? "상담 완료하기" : "Complete Consultation"}
            </Link>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
