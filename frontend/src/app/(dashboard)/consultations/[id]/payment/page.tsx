"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  visa: "비자/체류",
  labor: "노동/고용",
  contract: "계약/법률",
  business: "사업/창업",
  other: "기타",
};

const CONSULTATION_METHOD_LABELS: Record<string, string> = {
  email: "이메일",
  document: "문서",
  call: "전화",
  video: "화상",
};

interface Consultation {
  id: string;
  consultation_type: string;
  consultation_method: string;
  content: string;
  amount: string;
  status: string;
  payment_status: string;
  consultant_id: string | null;
  created_at: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const consultationId = params.id as string;
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance["renderPaymentMethods"]> | null>(null);

  useEffect(() => {
    fetchConsultation();
  }, [consultationId]);

  useEffect(() => {
    if (consultation && consultation.amount) {
      initializePaymentWidget();
    }
    return () => {
      if (paymentMethodsWidgetRef.current) {
        paymentMethodsWidgetRef.current.unmount();
      }
    };
  }, [consultation]);

  const fetchConsultation = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/consultations", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.find((c: Consultation) => c.id === consultationId);
        if (found) {
          setConsultation(found);
        } else {
          setError("상담 정보를 찾을 수 없습니다.");
        }
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError("상담 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const initializePaymentWidget = async () => {
    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        setError("결제 설정이 올바르지 않습니다.");
        return;
      }

      const customerKey = consultationId; // 고객 키로 상담 ID 사용
      const amount = Math.floor(parseFloat(consultation?.amount || "0"));

      const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
      paymentWidgetRef.current = paymentWidget;

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        "#payment-widget",
        { value: amount },
        { variantKey: "DEFAULT" }
      );
      paymentMethodsWidgetRef.current = paymentMethodsWidget;

      const agreementWidget = paymentWidget.renderAgreement("#agreement", {
        variantKey: "AGREEMENT",
      });
    } catch (error) {
      console.error("Payment widget initialization error:", error);
      setError("결제 위젯 초기화 중 오류가 발생했습니다.");
    }
  };

  const handlePayment = async () => {
    if (!consultation || !paymentWidgetRef.current) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // 결제 레코드 먼저 생성 (pending 상태)
      // paymentKey는 결제 완료 후에만 받을 수 있으므로 여기서는 생성하지 않음
      try {
        const createResponse = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consultation_id: consultationId,
            payment_method: "toss",
            // payment_key는 결제 완료 후 콜백에서 업데이트
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          // 이미 결제가 생성된 경우 (409 Conflict)는 계속 진행
          if (createResponse.status !== 409) {
            setError(errorData.message || "결제 생성에 실패했습니다.");
            setIsProcessing(false);
            return;
          }
        }
      } catch (e) {
        console.error("Payment creation error:", e);
        setError("결제 생성 중 오류가 발생했습니다.");
        setIsProcessing(false);
        return;
      }

      const amount = Math.floor(parseFloat(consultation.amount));
      const orderId = consultationId;
      const orderName = `${CONSULTATION_TYPE_LABELS[consultation.consultation_type] || consultation.consultation_type} 상담`;

      // 토스페이먼츠 결제 요청
      const paymentWidget = paymentWidgetRef.current;
      await paymentWidget.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/consultations/${consultationId}/payment/success`,
        failUrl: `${window.location.origin}/consultations/${consultationId}/payment/fail`,
        customerEmail: "", // 사용자 이메일 (필요시 추가)
        customerName: "", // 사용자 이름 (필요시 추가)
      });
      // requestPayment는 리다이렉트를 수행하므로 이후 코드는 실행되지 않음
    } catch (error: any) {
      console.error("Payment request error:", error);
      if (error.code === "USER_CANCEL") {
        setError("결제가 취소되었습니다.");
      } else {
        setError("결제 처리 중 오류가 발생했습니다.");
      }
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(numAmount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || "상담 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/consultations")}>상담 목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">상담료 결제</h1>
          <p className="text-gray-600">안전한 결제를 진행해주세요.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* 상담 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">상담 정보</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">상담 유형</p>
                <p className="font-medium text-gray-900">
                  {CONSULTATION_TYPE_LABELS[consultation.consultation_type] || consultation.consultation_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">상담 방법</p>
                <p className="font-medium text-gray-900">
                  {CONSULTATION_METHOD_LABELS[consultation.consultation_method] || consultation.consultation_method}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">상담 내용</p>
                <p className="text-gray-700 text-sm line-clamp-3">{consultation.content}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">상담료</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatAmount(consultation.amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 위젯 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h2>
            <div id="payment-widget" className="mb-4"></div>
            <div id="agreement" className="mb-6"></div>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handlePayment}
              disabled={isProcessing}
              loading={isProcessing}
            >
              {formatAmount(consultation.amount)} 결제하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

