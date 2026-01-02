"""Payment Pydantic Schemas"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class PaymentCreate(BaseModel):
    """결제 생성 스키마"""

    consultation_id: UUID = Field(..., description="상담 ID")
    payment_method: str = Field(..., description="결제 방식: toss, portone, card, transfer")
    payment_key: Optional[str] = Field(None, description="토스페이먼츠 paymentKey (선택사항, 결제 완료 후 콜백에서 업데이트)")

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        """결제 방식 검증"""
        allowed_methods = ["toss", "portone", "card", "transfer"]
        if v not in allowed_methods:
            raise ValueError(f"payment_method must be one of {allowed_methods}")
        return v


class PaymentCallbackRequest(BaseModel):
    """결제 완료 콜백 요청 스키마"""

    paymentKey: str = Field(..., description="토스페이먼츠 paymentKey")
    orderId: str = Field(..., description="주문 ID (consultation_id)")
    amount: int = Field(..., description="결제 금액 (원)")
    status: str = Field(..., description="결제 상태 (DONE, CANCELED 등)")


class PaymentResponse(BaseModel):
    """결제 응답 스키마"""

    id: UUID
    consultation_id: UUID
    user_id: UUID
    amount: Decimal
    platform_fee: Decimal
    net_amount: Decimal
    payment_method: str
    transaction_id: Optional[str]
    status: str
    paid_at: Optional[datetime]
    refunded_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: ORM 모드 활성화
