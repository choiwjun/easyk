"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

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
  user_id: string;
  user_name?: string;
  user_nationality?: string;
  user_visa_type?: string;
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

// 샘플 상담 데이터
const SAMPLE_CONSULTATION: Consultation = {
  id: "sample-1",
  consultation_type: "visa",
  content: "E-7 비자 연장 관련 문의드립니다.",
  created_at: new Date(Date.now() - 86400000).toISOString(),
  status: "in_progress",
  user_id: "user-1",
  user_name: "John Smith",
  user_nationality: "미국",
  user_visa_type: "E-7",
};

export default function ConsultantChatPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requireAuth();
    fetchConsultation();
  }, []);

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

      // 샘플 ID 처리
      if (params.id?.toString().startsWith("sample-")) {
        setConsultation(SAMPLE_CONSULTATION);
        setIsLoading(false);
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
      // 에러 시 샘플 데이터 사용
      setConsultation(SAMPLE_CONSULTATION);
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
      sender_type: "consultant",
      sender_name: "김변호사",
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

  const handleCompleteConsultation = async () => {
    // 실제로는 API 호출
    router.push(`/consultant/consultations/${params.id}`);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "로딩 중..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "상담 정보를 찾을 수 없습니다." : "Consultation not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/consultant/dashboard" className="flex items-center gap-2">
              <span className="text-primary text-xl font-bold">easyK</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Expert
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="size-9 flex items-center justify-center text-text-sub dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="size-9 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
              김
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-6xl mx-auto w-full p-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400 mb-4">
          <Link href="/consultant/dashboard" className="hover:text-primary">
            {language === "ko" ? "대시보드" : "Dashboard"}
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href={`/consultant/consultations/${params.id}`} className="hover:text-primary">
            {language === "ko" ? "상담 상세" : "Consultation Details"}
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-text-main dark:text-white">
            {language === "ko" ? "상담 진행" : "Chat"}
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
                    {consultation.user_name || "의뢰인"}
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    {language === "ko" ? "진행중" : "In Progress"}
                  </span>
                </div>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {getConsultationNumber(consultation.id)} · {getConsultationType(consultation.consultation_type)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/consultant/consultations/${params.id}`}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-lg">description</span>
                <span>{language === "ko" ? "상담 정보" : "Details"}</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowCompleteModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>{language === "ko" ? "상담 완료" : "Complete"}</span>
              </button>
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
                  className={`flex ${message.sender_type === "consultant" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.sender_type === "consultant" ? "flex-row-reverse" : ""}`}>
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
                    <div className={`flex flex-col ${message.sender_type === "consultant" ? "items-end" : "items-start"}`}>
                      <span className="text-xs text-text-sub dark:text-gray-500 mb-1">{message.sender_name}</span>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.sender_type === "consultant"
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

          {/* Sidebar - Client Info */}
          <div className="lg:w-80 flex flex-col gap-4">
            {/* Client Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                {language === "ko" ? "의뢰인 정보" : "Client Info"}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-text-sub dark:text-gray-500">
                    {language === "ko" ? "이름" : "Name"}
                  </span>
                  <span className="text-sm font-medium text-text-main dark:text-white">
                    {consultation.user_name || "John Smith"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-text-sub dark:text-gray-500">
                    {language === "ko" ? "국적" : "Nationality"}
                  </span>
                  <span className="text-sm font-medium text-text-main dark:text-white">
                    {consultation.user_nationality || "미국"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-text-sub dark:text-gray-500">
                    {language === "ko" ? "비자 종류" : "Visa Type"}
                  </span>
                  <span className="text-sm font-medium text-text-main dark:text-white">
                    {consultation.user_visa_type || "E-7"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-text-sub dark:text-gray-500">
                    {language === "ko" ? "상담 유형" : "Type"}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {getConsultationType(consultation.consultation_type)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-bold text-text-main dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">bolt</span>
                {language === "ko" ? "빠른 응답" : "Quick Responses"}
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setNewMessage(language === "ko" ? "확인했습니다. 관련 서류를 검토 후 답변드리겠습니다." : "I've received your message. I'll review the documents and get back to you.")}
                  className="w-full text-left px-3 py-2 text-xs text-text-sub dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {language === "ko" ? "📄 서류 검토 후 답변" : "📄 Will review documents"}
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessage(language === "ko" ? "추가 서류가 필요합니다. 다음 서류를 준비해 주세요:" : "Additional documents are needed. Please prepare:")}
                  className="w-full text-left px-3 py-2 text-xs text-text-sub dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {language === "ko" ? "📋 추가 서류 요청" : "📋 Request more docs"}
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessage(language === "ko" ? "자세한 상담을 위해 전화 상담을 진행하면 좋겠습니다. 가능한 시간을 알려주세요." : "I'd recommend a phone consultation for details. Please let me know your availability.")}
                  className="w-full text-left px-3 py-2 text-xs text-text-sub dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {language === "ko" ? "📞 전화 상담 요청" : "📞 Request phone call"}
                </button>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
              <h4 className="text-xs font-bold text-text-main dark:text-white mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">info</span>
                {language === "ko" ? "대체 연락 방법" : "Alternative Contact"}
              </h4>
              <p className="text-xs text-text-sub dark:text-gray-400 leading-relaxed">
                {language === "ko"
                  ? "긴급한 경우 이메일(consult@easyk.kr) 또는 전화(1588-0000)로 연락하실 수 있습니다."
                  : "For urgent matters, you can contact via email (consult@easyk.kr) or phone (1588-0000)."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Complete Consultation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCompleteModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                  check_circle
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main dark:text-white">
                  {language === "ko" ? "상담 완료" : "Complete Consultation"}
                </h3>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {language === "ko" ? "상담을 완료하시겠습니까?" : "Are you sure you want to complete this consultation?"}
                </p>
              </div>
            </div>

            <p className="text-sm text-text-sub dark:text-gray-400 mb-6 leading-relaxed">
              {language === "ko"
                ? "상담 완료 시 의뢰인에게 알림이 전송되며, 후기 작성을 요청하게 됩니다."
                : "The client will be notified and asked to leave a review."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                {language === "ko" ? "취소" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleCompleteConsultation}
                className="flex-1 h-11 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors"
              >
                {language === "ko" ? "완료하기" : "Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
