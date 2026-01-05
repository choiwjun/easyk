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
  scheduled_at: string | null;
}

export default function MyConsultationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        setError(language === "ko" ? "데이터를 불러오는데 실패했습니다." : "Failed to load data.");
      }
    } catch (error) {
      setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ko: string; en: string }> = {
      requested: { ko: "매칭 대기 중", en: "Waiting" },
      matched: { ko: "상담 예정", en: "Scheduled" },
      scheduled: { ko: "상담 예정", en: "Scheduled" },
      in_progress: { ko: "상담 진행 중", en: "In Progress" },
      completed: { ko: "상담 완료", en: "Completed" },
      cancelled: { ko: "거절됨", en: "Rejected" },
    };
    return labels[status]?.[language as keyof typeof labels[typeof status]] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
      matched: "bg-blue-100 text-primary dark:bg-blue-900 dark:text-blue-200",
      scheduled: "bg-blue-100 text-primary dark:bg-blue-900 dark:text-blue-200",
      in_progress: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { ko: string; en: string }> = {
      visa: { ko: "이민/비자", en: "Visa" },
      labor: { ko: "노동/임금", en: "Labor" },
      contract: { ko: "계약", en: "Contract" },
      business: { ko: "사업", en: "Business" },
      other: { ko: "기타", en: "Other" },
    };
    return labels[type]?.[language as keyof typeof labels[typeof type]] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === "ko") {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getDateBox = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  const filteredConsultations = consultations.filter((consultation) => {
    const statusMatch = filterStatus === "all" || consultation.status === filterStatus;
    const searchMatch =
      searchQuery === "" ||
      consultation.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTypeLabel(consultation.consultation_type).toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-sub dark:text-gray-400">
          {language === "ko" ? "로딩 중..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
        <div className="w-full max-w-[960px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/" className="text-text-sub dark:text-gray-400 font-medium hover:text-primary">
              {language === "ko" ? "홈" : "Home"}
            </Link>
            <span className="text-text-sub dark:text-gray-500">/</span>
            <Link href="/profile" className="text-text-sub dark:text-gray-400 font-medium hover:text-primary">
              {language === "ko" ? "마이페이지" : "My Page"}
            </Link>
            <span className="text-text-sub dark:text-gray-500">/</span>
            <span className="text-text-main dark:text-gray-200 font-bold">
              {language === "ko" ? "내 상담 내역" : "My Consultations"}
            </span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              {language === "ko" ? "내 상담 내역" : "My Consultations"}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base">
              {language === "ko"
                ? "신청하신 법률 상담 내역과 진행 상태를 확인하세요."
                : "Check your legal consultation history and progress status."}
            </p>
          </div>

          {/* Toolbar: Status Filter & Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setFilterStatus("all")}
                className={`shrink-0 h-9 px-4 rounded-lg text-sm font-bold transition-colors ${
                  filterStatus === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-text-sub dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {language === "ko" ? "전체" : "All"}
              </button>
              <button
                onClick={() => setFilterStatus("requested")}
                className={`shrink-0 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "requested"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-text-sub dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {language === "ko" ? "매칭 대기 중" : "Waiting"}
              </button>
              <button
                onClick={() => setFilterStatus("scheduled")}
                className={`shrink-0 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "scheduled"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-text-sub dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {language === "ko" ? "상담 예정" : "Scheduled"}
              </button>
              <button
                onClick={() => setFilterStatus("completed")}
                className={`shrink-0 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "completed"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-text-sub dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {language === "ko" ? "상담 완료" : "Completed"}
              </button>
              <button
                onClick={() => setFilterStatus("cancelled")}
                className={`shrink-0 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "cancelled"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-text-sub dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {language === "ko" ? "거절됨" : "Rejected"}
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-sub">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                type="text"
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
                placeholder={language === "ko" ? "상담 내용 검색" : "Search consultations"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Consultation List */}
          <div className="flex flex-col gap-4">
            {filteredConsultations.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">
                    inbox
                  </span>
                  <p className="text-text-sub dark:text-gray-400 text-base">
                    {language === "ko" ? "상담 내역이 없습니다." : "No consultations found."}
                  </p>
                  <Link
                    href="/consultations"
                    className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-[#164a85] transition-colors"
                  >
                    {language === "ko" ? "상담 신청하기" : "Apply for Consultation"}
                  </Link>
                </div>
              </div>
            ) : (
              filteredConsultations.map((consultation) => {
                const dateBox = getDateBox(consultation.created_at);
                const isActive = consultation.status === "scheduled" || consultation.status === "matched";
                const isCompleted = consultation.status === "completed";
                const isRejected = consultation.status === "cancelled";

                return (
                  <div
                    key={consultation.id}
                    className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-6 ${
                      isCompleted ? "opacity-90" : isRejected ? "opacity-80 hover:opacity-100" : ""
                    }`}
                  >
                    {/* Date Box (Desktop) */}
                    <div
                      className={`hidden md:flex flex-col items-center justify-center w-20 h-20 rounded-lg shrink-0 ${
                        consultation.status === "requested"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                          : isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-primary"
                          : isCompleted
                          ? "bg-gray-50 dark:bg-gray-800 text-gray-500"
                          : "bg-red-50 dark:bg-red-900/20 text-red-500"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase">{dateBox.month}</span>
                      <span className="text-2xl font-black">{dateBox.day}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(consultation.status)}`}>
                          {getStatusLabel(consultation.status)}
                        </span>
                        <span className="text-sm text-text-sub dark:text-gray-400">
                          {getTypeLabel(consultation.consultation_type)}
                        </span>
                        <span className="md:hidden text-sm text-text-sub dark:text-gray-400 ml-auto">
                          {formatDate(consultation.created_at)}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-text-main dark:text-white group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                        {consultation.content.substring(0, 50)}
                        {consultation.content.length > 50 ? "..." : ""}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {consultation.consultant_id ? (
                          <>
                            <div className="size-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {language === "ko" ? "담당 변호사 배정됨" : "Lawyer Assigned"}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-center size-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400">
                              <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {language === "ko" ? "담당 변호사 배정 중" : "Assigning Lawyer"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center md:self-center">
                      <Link
                        href={`/consultations/${consultation.id}`}
                        className="w-full md:w-auto px-5 py-2.5 rounded-lg border border-primary text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-bold transition-colors whitespace-nowrap text-center"
                      >
                        {language === "ko" ? "상세 보기" : "View Details"}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
