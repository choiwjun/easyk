"""Job Pydantic Schemas"""

import json
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class JobResponse(BaseModel):
    """일자리 응답 스키마"""

    id: UUID
    posted_by: UUID
    position: str
    company_name: str
    company_phone: Optional[str]
    company_address: Optional[str]
    location: str
    employment_type: str
    salary_range: Optional[str]
    salary_currency: Optional[str]
    description: str
    requirements: Optional[str]
    preferred_qualifications: Optional[str]
    benefits: Optional[str]
    required_languages: Optional[List[str]]
    status: str
    deadline: datetime
    created_at: datetime
    updated_at: datetime

    @field_validator("required_languages", mode="before")
    @classmethod
    def parse_required_languages(cls, v):
        """JSON 문자열을 리스트로 파싱"""
        if v is None:
            return None
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                return parsed if isinstance(parsed, list) else []
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    class Config:
        from_attributes = True  # Pydantic v2: ORM 모드 활성화


class JobDetailResponse(JobResponse):
    """일자리 상세 응답 스키마 (지원 여부 포함)"""

    has_applied: bool = Field(description="현재 사용자가 이미 지원했는지 여부")


class JobCreate(BaseModel):
    """일자리 생성 스키마"""

    position: str = Field(..., description="직종")
    company_name: str = Field(..., description="회사명")
    company_phone: Optional[str] = Field(None, description="회사 전화번호")
    company_address: Optional[str] = Field(None, description="회사 주소")
    location: str = Field(..., description="근무 지역")
    employment_type: str = Field(..., description="고용 형태: full-time, part-time, contract, temporary")
    salary_range: Optional[str] = Field(None, description="급여 범위")
    salary_currency: Optional[str] = Field("KRW", description="급여 통화")
    description: str = Field(..., description="업무 설명")
    requirements: Optional[str] = Field(None, description="필수 요구사항")
    preferred_qualifications: Optional[str] = Field(None, description="우대사항")
    benefits: Optional[str] = Field(None, description="복리후생")
    required_languages: Optional[List[str]] = Field(None, description="필수 언어")
    status: Optional[str] = Field("active", description="공고 상태: active, closed, expired, draft")
    deadline: datetime = Field(..., description="모집 마감일")


class JobUpdate(BaseModel):
    """일자리 수정 스키마"""

    position: Optional[str] = Field(None, description="직종")
    company_name: Optional[str] = Field(None, description="회사명")
    company_phone: Optional[str] = Field(None, description="회사 전화번호")
    company_address: Optional[str] = Field(None, description="회사 주소")
    location: Optional[str] = Field(None, description="근무 지역")
    employment_type: Optional[str] = Field(None, description="고용 형태")
    salary_range: Optional[str] = Field(None, description="급여 범위")
    salary_currency: Optional[str] = Field(None, description="급여 통화")
    description: Optional[str] = Field(None, description="업무 설명")
    requirements: Optional[str] = Field(None, description="필수 요구사항")
    preferred_qualifications: Optional[str] = Field(None, description="우대사항")
    benefits: Optional[str] = Field(None, description="복리후생")
    required_languages: Optional[List[str]] = Field(None, description="필수 언어")
    status: Optional[str] = Field(None, description="공고 상태")
    deadline: Optional[datetime] = Field(None, description="모집 마감일")

