"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

const CONSULTATION_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  visa: { ko: "출입국/비자", en: "Visa/Immigration" },
  labor: { ko: "근로/노동", en: "Labor/Employment" },
  contract: { ko: "계약/기타", en: "Contract/Other" },
  business: { ko: "사업/창업", en: "Business/Startup" },
  other: { ko: "기타", en: "Other" },
};

interface Consultation {
  id: string;
  consultation_type: string;
  content: string;
  status: string;
  consultant_id: string;
  consultant?: {
    office_name: string;
  };
}

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const { requireAuth } = useAuth();
  const consultationId = params.id as string;

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({
    rating: "",
    comment: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(true);

  useEffect(() => {
    requireAuth();
    fetchConsultation();
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/consultations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("상담 정보를 불러올 수 없습니다");
      }

      const consultations = await response.json();
      const consultationData = consultations.find((c: Consultation) => c.id === consultationId);

      if (!consultationData) {
        setErrors({ ...errors, general: language === "ko" ? "상담 정보를 찾을 수 없습니다" : "Consultation not found" });
        return;
      }

      if (consultationData.status !== "completed") {
        setErrors({
          ...errors,
          general: language === "ko" ? "완료된 상담만 후기를 작성할 수 있습니다" : "Only completed consultations can be reviewed",
        });
        return;
      }

      setConsultation(consultationData);
    } catch (error) {
      setErrors({
        ...errors,
        general: language === "ko" ? "상담 정보를 불러오는 중 오류가 발생했습니다" : "Error loading consultation",
      });
    } finally {
      setIsLoadingConsultation(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      rating: "",
      comment: "",
      general: "",
    };

    let isValid = true;

    if (rating < 1 || rating > 5) {
      newErrors.rating = language === "ko" ? "별점은 1~5 사이여야 합니다" : "Rating must be between 1-5";
      isValid = false;
    }

    if (comment.trim().length > 500) {
      newErrors.comment = language === "ko" ? "후기는 500자 이하여야 합니다" : "Review must be 500 characters or less";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ rating: "", comment: "", general: "" });

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consultation_id: consultationId,
          rating: rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        router.push("/consultations/my");
      } else {
        const errorData = await response.json();
        setErrors({
          ...errors,
          general:
            errorData.message ||
            errorData.detail ||
            (language === "ko" ? "후기 작성에 실패했습니다. 다시 시도해주세요." : "Failed to submit review. Please try again."),
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        general: language === "ko" ? "네트워크 오류가 발생했습니다. 다시 시도해주세요." : "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingConsultation) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-sub dark:text-gray-400">
            {language === "ko" ? "상담 정보를 불러오는 중..." : "Loading consultation..."}
          </p>
        </div>
      </div>
    );
  }

  if (!consultation || errors.general) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <DesignHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="size-20 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h1 className="text-2xl font-bold text-text-main dark:text-white mb-3">
              {language === "ko" ? "오류" : "Error"}
            </h1>
            <p className="text-text-sub dark:text-gray-400 mb-6">{errors.general}</p>
            <Link
              href="/consultations/my"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-[#164a85] text-white font-bold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {language === "ko" ? "상담 목록으로" : "Back to Consultations"}
            </Link>
          </div>
        </div>
        <DesignFooter />
      </div>
    );
  }

  const typeLabel = CONSULTATION_TYPE_LABELS[consultation.consultation_type] || CONSULTATION_TYPE_LABELS.other;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-4 py-6 lg:px-8 lg:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            {language === "ko" ? "홈" : "Home"}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/consultations/my" className="hover:text-primary transition-colors">
            {language === "ko" ? "내 상담" : "My Consultations"}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-bold text-primary">{language === "ko" ? "후기 작성" : "Write Review"}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">rate_review</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-text-main dark:text-white tracking-tight">
                {language === "ko" ? "상담 후기 작성" : "Write Consultation Review"}
              </h1>
              <p className="text-text-sub dark:text-gray-400 text-sm">
                {language === "ko" ? "상담 경험을 공유해주세요" : "Share your consultation experience"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Consultation Info */}
          <div className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-700 p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-bold text-text-sub dark:text-gray-400 mb-3 uppercase tracking-wide">
              {language === "ko" ? "상담 정보" : "Consultation Info"}
            </h2>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div>
                <p className="text-base font-bold text-text-main dark:text-white">
                  {typeLabel[language as keyof typeof typeLabel]} {language === "ko" ? "법률 상담" : "Legal Consultation"}
                </p>
                {consultation.consultant?.office_name && (
                  <p className="text-sm text-text-sub dark:text-gray-400">
                    {language === "ko" ? "담당 변호사" : "Lawyer"}: {consultation.consultant.office_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} noValidate className="p-6 md:p-8 space-y-8">
            {errors.general && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 mt-0.5">error</span>
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">
                    {language === "ko" ? "오류" : "Error"}
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Rating Section */}
            <div>
              <label className="block text-base font-bold text-text-main dark:text-white mb-3">
                {language === "ko" ? "별점 평가" : "Rating"} <span className="text-red-500">*</span>
              </label>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-5xl transition-all transform hover:scale-110 ${
                        star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600 hover:text-yellow-200"
                      }`}
                      aria-label={`${star}${language === "ko" ? "점" : " stars"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-center text-2xl font-bold text-primary">
                  {rating} {language === "ko" ? "점" : `Star${rating !== 1 ? "s" : ""}`}
                </p>
                {errors.rating && <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{errors.rating}</p>}
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-base font-bold text-text-main dark:text-white mb-3">
                {language === "ko" ? "후기 내용" : "Review Comment"}{" "}
                <span className="text-sm font-normal text-text-sub dark:text-gray-400">
                  ({language === "ko" ? "선택사항" : "Optional"})
                </span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  language === "ko"
                    ? "상담 경험에 대한 후기를 작성해주세요 (최대 500자)"
                    : "Share your consultation experience (max 500 characters)"
                }
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-main dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-text-sub dark:text-gray-400">
                  {language === "ko"
                    ? "다른 사용자들에게 도움이 되는 정보를 공유해주세요"
                    : "Share helpful information for other users"}
                </p>
                <p className="text-xs text-text-sub dark:text-gray-400">
                  {comment.length}/500
                </p>
              </div>
              {errors.comment && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/consultations/my")}
                disabled={isLoading}
                className="flex-1 h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === "ko" ? "취소" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-[#164a85] text-white text-base font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    {language === "ko" ? "작성 중..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    {language === "ko" ? "후기 작성 완료" : "Submit Review"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Note */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">info</span>
          <div className="text-sm text-text-sub dark:text-gray-400">
            <p className="font-medium text-text-main dark:text-white mb-1">
              {language === "ko" ? "후기 작성 안내" : "Review Guidelines"}
            </p>
            <p>
              {language === "ko"
                ? "작성하신 후기는 다른 사용자들에게 공개되며, 변호사 선택에 도움이 됩니다."
                : "Your review will be public and help other users choose their lawyer."}
            </p>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
