"""Review Pydantic Schemas"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ReviewCreate(BaseModel):
    """후기 작성 요청 스키마"""

    consultation_id: UUID = Field(..., description="상담 ID")
    rating: int = Field(..., description="별점 (1~5)", ge=1, le=5)
    comment: Optional[str] = Field(None, description="리뷰 텍스트 (최대 500자)", max_length=500)
    is_anonymous: Optional[bool] = Field(False, description="익명 여부")

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        """별점 범위 검증"""
        if not (1 <= v <= 5):
            raise ValueError("rating must be between 1 and 5")
        return v


class ReviewResponse(BaseModel):
    """후기 응답 스키마"""

    id: UUID
    consultation_id: UUID
    reviewer_id: UUID
    consultant_id: UUID
    rating: int
    comment: Optional[str]
    is_anonymous: bool
    helpful_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: ORM 모드 활성화


