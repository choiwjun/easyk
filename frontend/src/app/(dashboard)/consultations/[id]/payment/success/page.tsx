"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    processPaymentCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processPaymentCallback = async () => {
    try {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setError("결제 정보가 올바르지 않습니다.");
        setIsProcessing(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // 결제 콜백 처리 (토스페이먼츠 API 검증 포함)
      // 결제 레코드는 이미 결제 페이지에서 생성되었으므로 여기서는 콜백만 처리
      const response = await fetch("/api/payments/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parseInt(amount, 10),
          status: "DONE",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || data.detail || "결제 처리 중 오류가 발생했습니다.");
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Payment callback error:", error);
      setError("결제 처리 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  const handleGoToConsultations = () => {
    router.push("/consultations");
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4 text-red-500 text-5xl">✕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 처리 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleGoToConsultations}>상담 목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-4 text-green-500 text-5xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료</h1>
        <p className="text-gray-600 mb-6">
          결제가 성공적으로 완료되었습니다.<br />
          상담 예약이 완료되었습니다.
        </p>
        <Button variant="primary" onClick={handleGoToConsultations}>
          상담 목록으로 돌아가기
        </Button>
      </div>
    </div>
  );
}

