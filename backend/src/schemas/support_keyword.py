"""Support Keyword Pydantic Schemas"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class SupportKeywordCreate(BaseModel):
    """정부 지원 검색 키워드 생성 스키마"""

    keyword: str = Field(..., min_length=1, max_length=100, description="검색 키워드")
    category: str = Field(..., description="카테고리 (visa, labor, contract, business, other)")
    description: Optional[str] = Field(None, max_length=500, description="키워드 설명")


class SupportKeywordResponse(BaseModel):
    """정부 지원 검색 키워드 응답 스키마"""

    id: UUID
    keyword: str
    category: str
    description: Optional[str]
    is_active: bool
    search_count: int
    created_at: datetime
    created_by: UUID
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: ORM 모드 활성화


class SupportKeywordList(BaseModel):
    """정부 지원 검색 키워드 목록 응답 스키마"""

    keywords: List[SupportKeywordResponse]
    total: int

    class Config:
        from_attributes = True







