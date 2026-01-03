"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function PaymentFailPage() {
  const router = useRouter();

  const handleGoToConsultations = () => {
    router.push("/consultations");
  };

  const handleRetry = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-4 text-red-500 text-5xl">✕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-600 mb-6">
          결제 처리 중 오류가 발생했습니다.<br />
          다시 시도해주세요.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleGoToConsultations}>
            상담 목록으로
          </Button>
          <Button variant="primary" onClick={handleRetry}>
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}




