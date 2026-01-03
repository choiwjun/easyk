"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

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
        const consultationData = consultations.find(
          (c: Consultation) => c.id === consultationId
        );

        if (!consultationData) {
          setErrors({ ...errors, general: "상담 정보를 찾을 수 없습니다" });
          return;
        }

        if (consultationData.status !== "completed") {
          setErrors({
            ...errors,
            general: "완료된 상담만 후기를 작성할 수 있습니다",
          });
          return;
        }

        setConsultation(consultationData);
      } catch (error) {
        setErrors({
          ...errors,
          general: "상담 정보를 불러오는 중 오류가 발생했습니다",
        });
      } finally {
        setIsLoadingConsultation(false);
      }
    };

    if (consultationId) {
      fetchConsultation();
    }
  }, [consultationId, router]);

  const validateForm = () => {
    const newErrors = {
      rating: "",
      comment: "",
      general: "",
    };

    let isValid = true;

    if (rating < 1 || rating > 5) {
      newErrors.rating = "별점은 1~5 사이여야 합니다";
      isValid = false;
    }

    if (comment.trim().length > 500) {
      newErrors.comment = "후기는 500자 이하여야 합니다";
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
        router.push("/consultations");
      } else {
        const errorData = await response.json();
        setErrors({
          ...errors,
          general:
            errorData.message ||
            errorData.detail ||
            "후기 작성에 실패했습니다. 다시 시도해주세요.",
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        general: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingConsultation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">상담 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">상담 정보를 찾을 수 없습니다</p>
          <Button onClick={() => router.push("/consultations")}>
            상담 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">후기 작성</h1>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-medium text-gray-700 mb-2">상담 정보</h2>
            <p className="text-sm text-gray-600">
              상담 유형:{" "}
              {consultation.consultation_type === "visa"
                ? "비자/체류"
                : consultation.consultation_type === "labor"
                ? "노동/고용"
                : consultation.consultation_type === "contract"
                ? "계약/법률"
                : consultation.consultation_type === "business"
                ? "사업/창업"
                : "기타"}
            </p>
            {consultation.consultant?.office_name && (
              <p className="text-sm text-gray-600">
                전문가: {consultation.consultant.office_name}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                별점 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= rating
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                    aria-label={`${star}점`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating}점</span>
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
              )}
            </div>

            <Textarea
              label="후기 내용"
              placeholder="상담 경험에 대한 후기를 작성해주세요 (선택사항, 최대 500자)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              error={errors.comment}
              rows={6}
              maxLength={500}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/consultations")}
                disabled={isLoading}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "작성 중..." : "후기 작성"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}






