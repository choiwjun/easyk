"""Consultation Pydantic Schemas"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class UserBasicInfo(BaseModel):
    """상담 응답에 포함될 사용자 기본 정보"""

    first_name: str
    last_name: str
    email: str
    nationality: Optional[str] = None

    class Config:
        from_attributes = True


class ConsultationCreate(BaseModel):
    """상담 신청 생성 스키마"""

    consultation_type: str = Field(..., description="상담 유형: visa, labor, contract, business, other")
    content: str = Field(..., min_length=10, description="상담 내용 (최소 10자)")
    consultation_method: str = Field(default="email", description="상담 방법: email, document, call, video")
    amount: Decimal = Field(..., gt=0, description="상담료 (양수)")

    @field_validator("consultation_type")
    @classmethod
    def validate_consultation_type(cls, v: str) -> str:
        """상담 유형 검증"""
        allowed_types = ["visa", "labor", "contract", "business", "other"]
        if v not in allowed_types:
            raise ValueError(f"consultation_type must be one of {allowed_types}")
        return v

    @field_validator("consultation_method")
    @classmethod
    def validate_consultation_method(cls, v: str) -> str:
        """상담 방법 검증"""
        allowed_methods = ["email", "document", "call", "video"]
        if v not in allowed_methods:
            raise ValueError(f"consultation_method must be one of {allowed_methods}")
        return v


class ConsultationResponse(BaseModel):
    """상담 응답 스키마"""

    id: UUID
    user_id: UUID
    consultant_id: Optional[UUID]
    consultation_type: str
    content: str
    status: str
    scheduled_at: Optional[datetime]
    completed_at: Optional[datetime]
    consultation_method: str
    amount: Decimal
    payment_status: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserBasicInfo] = None  # 의뢰인 정보

    class Config:
        from_attributes = True  # Pydantic v2: ORM 모드 활성화
