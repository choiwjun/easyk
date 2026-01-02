"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

const CONSULTATION_TYPES = [
  { value: "visa", label: "비자/체류" },
  { value: "labor", label: "노동/고용" },
  { value: "contract", label: "계약/법률" },
  { value: "business", label: "사업/창업" },
  { value: "other", label: "기타" },
];

const CONSULTATION_METHODS = [
  { value: "email", label: "이메일 상담" },
  { value: "document", label: "문서 검토" },
  { value: "call", label: "전화 상담" },
  { value: "video", label: "화상 상담" },
];

export default function NewConsultationPage() {
  const router = useRouter();
  const [consultationType, setConsultationType] = useState("");
  const [consultationMethod, setConsultationMethod] = useState("");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");

  const [errors, setErrors] = useState({
    consultationType: "",
    consultationMethod: "",
    content: "",
    amount: "",
    general: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {
      consultationType: "",
      consultationMethod: "",
      content: "",
      amount: "",
      general: "",
    };

    let isValid = true;

    if (!consultationType) {
      newErrors.consultationType = "상담 유형을 선택해주세요.";
      isValid = false;
    }

    if (!consultationMethod) {
      newErrors.consultationMethod = "상담 방법을 선택해주세요.";
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = "상담 내용을 입력해주세요.";
      isValid = false;
    } else if (content.trim().length < 10) {
      newErrors.content = "상담 내용은 최소 10자 이상이어야 합니다.";
      isValid = false;
    }

    if (!amount) {
      newErrors.amount = "상담료를 입력해주세요.";
      isValid = false;
    } else if (parseFloat(amount) <= 0) {
      newErrors.amount = "상담료는 0보다 커야 합니다.";
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
    setErrors({ consultationType: "", consultationMethod: "", content: "", amount: "", general: "" });

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          consultation_type: consultationType,
          consultation_method: consultationMethod,
          content: content.trim(),
          amount: parseFloat(amount),
        }),
      });

      if (response.ok) {
        router.push("/consultations");
      } else {
        const errorData = await response.json();
        setErrors({
          ...errors,
          general: errorData.detail || "상담 신청에 실패했습니다. 다시 시도해주세요.",
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">상담 신청</h1>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Select
              label="상담 유형"
              placeholder="상담 유형을 선택하세요"
              options={CONSULTATION_TYPES}
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
              error={errors.consultationType}
              required
            />

            <Select
              label="상담 방법"
              placeholder="상담 방법을 선택하세요"
              options={CONSULTATION_METHODS}
              value={consultationMethod}
              onChange={(e) => setConsultationMethod(e.target.value)}
              error={errors.consultationMethod}
              required
            />

            <Textarea
              label="상담 내용"
              placeholder="상담하고 싶은 내용을 자세히 작성해주세요 (최소 10자)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              error={errors.content}
              rows={6}
              required
            />

            <Input
              label="상담료 (원)"
              type="number"
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
              min="0"
              step="1000"
              required
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                fullWidth
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                fullWidth
              >
                신청하기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
