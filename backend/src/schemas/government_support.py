"""Government Support Pydantic Schemas"""

from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
import json

from pydantic import BaseModel, Field, field_validator


class GovernmentSupportBase(BaseModel):
    """정부 지원 프로그램 기본 스키마"""

    title: str = Field(..., min_length=1, max_length=200, description="지원 프로그램 제목")
    category: str = Field(..., description="카테고리 (subsidy, education, training, visa, housing)")
    description: str = Field(..., min_length=1, max_length=2000, description="프로그램 설명")
    eligibility: Optional[str] = Field(None, max_length=1000, description="자격 조건")
    eligible_visa_types: List[str] = Field(default_factory=list, description="지원 가능 비자 유형 목록")
    support_content: Optional[str] = Field(None, max_length=1000, description="지원 내용")
    department: str = Field(..., min_length=1, max_length=100, description="담당 기관명")
    department_phone: Optional[str] = Field(None, max_length=20, description="담당 기관 연락처")
    department_website: Optional[str] = Field(None, max_length=200, description="담당 기관 웹사이트")
    application_period_start: Optional[date] = Field(None, description="신청 시작일")
    application_period_end: Optional[date] = Field(None, description="신청 종료일")
    official_link: Optional[str] = Field(None, max_length=500, description="공식 링크")
    status: str = Field(default="active", description="상태 (active, inactive, ended)")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        valid_categories = ["subsidy", "education", "training", "visa", "housing"]
        if v not in valid_categories:
            raise ValueError(f"카테고리는 다음 중 하나여야 합니다: {', '.join(valid_categories)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        valid_statuses = ["active", "inactive", "ended"]
        if v not in valid_statuses:
            raise ValueError(f"상태는 다음 중 하나여야 합니다: {', '.join(valid_statuses)}")
        return v

    @field_validator("application_period_end")
    @classmethod
    def validate_period_end(cls, v, info):
        if v is not None and "application_period_start" in info.data:
            start_date = info.data["application_period_start"]
            if start_date is not None and v < start_date:
                raise ValueError("신청 종료일은 시작일 이후여야 합니다")
        return v


class GovernmentSupportCreate(GovernmentSupportBase):
    """정부 지원 프로그램 생성 스키마"""

    class Config:
        json_schema_extra = {
            "example": {
                "title": "외국인 장려금 지원",
                "category": "subsidy",
                "description": "외국인 근로자에게 주는 장려금",
                "eligibility": "재외동포 90일 이상 체류자",
                "eligible_visa_types": ["E-1", "E-2", "F-2"],
                "support_content": "월 30만원 지급 (최대 6개월)",
                "department": "고용노동부",
                "department_phone": "02-1234-5678",
                "department_website": "https://www.moel.go.kr",
                "application_period_start": "2026-01-01",
                "application_period_end": "2026-12-31",
                "official_link": "https://apply.moel.go.kr/subsidy1",
                "status": "active",
            }
        }


class GovernmentSupportUpdate(BaseModel):
    """정부 지원 프로그램 수정 스키마"""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, description="카테고리 (subsidy, education, training, visa, housing)")
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    eligibility: Optional[str] = Field(None, max_length=1000)
    eligible_visa_types: Optional[List[str]] = None
    support_content: Optional[str] = Field(None, max_length=1000)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    department_phone: Optional[str] = Field(None, max_length=20)
    department_website: Optional[str] = Field(None, max_length=200)
    application_period_start: Optional[date] = None
    application_period_end: Optional[date] = None
    official_link: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, description="상태 (active, inactive, ended)")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v is not None:
            valid_categories = ["subsidy", "education", "training", "visa", "housing"]
            if v not in valid_categories:
                raise ValueError(f"카테고리는 다음 중 하나여야 합니다: {', '.join(valid_categories)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ["active", "inactive", "ended"]
            if v not in valid_statuses:
                raise ValueError(f"상태는 다음 중 하나여야 합니다: {', '.join(valid_statuses)}")
        return v

    @field_validator("application_period_end")
    @classmethod
    def validate_period_end(cls, v, info):
        if v is not None and "application_period_start" in info.data:
            start_date = info.data["application_period_start"]
            if start_date is not None and v < start_date:
                raise ValueError("신청 종료일은 시작일 이후여야 합니다")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "title": "수정된 장려금",
                "status": "active",
            }
        }


class GovernmentSupportResponse(BaseModel):
    """정부 지원 프로그램 응답 스키마"""

    id: UUID
    title: str
    category: str
    description: str
    eligibility: Optional[str] = None
    eligible_visa_types: List[str] = Field(default_factory=list)
    support_content: Optional[str] = None
    department: str
    department_phone: Optional[str] = None
    department_website: Optional[str] = None
    application_period_start: Optional[date] = None
    application_period_end: Optional[date] = None
    official_link: Optional[str] = None
    status: str
    created_at: str
    updated_at: str

    @field_validator("eligible_visa_types", mode="before")
    @classmethod
    def parse_eligible_visa_types(cls, v):
        if v is None:
            return []
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


class GovernmentSupportList(BaseModel):
    """정부 지원 프로그램 목록 응답 스키마"""

    supports: List[GovernmentSupportResponse]
    total: int

    class Config:
        from_attributes = True


class EligibilityCheckRequest(BaseModel):
    """자격 확인 요청 스키마"""

    support_id: UUID = Field(..., description="정부 지원 프로그램 ID")
    visa_type: str = Field(..., min_length=1, max_length=10, description="비자 종류 (예: E-1, F-2)")
    age: Optional[int] = Field(None, ge=0, le=150, description="나이")
    residence_location: Optional[str] = Field(None, max_length=100, description="거주 지역")
    employment_status: Optional[str] = Field(None, max_length=50, description="고용 상태")

    class Config:
        json_schema_extra = {
            "example": {
                "support_id": "123e4567-e89b-12d3-a456-426614174000",
                "visa_type": "E-7",
                "age": 30,
                "residence_location": "서울시 강남구",
                "employment_status": "employed",
            }
        }


class EligibilityCheckResponse(BaseModel):
    """자격 확인 응답 스키마"""

    eligible: bool = Field(..., description="자격 충족 여부")
    message: str = Field(..., description="결과 메시지")
    reasons: List[str] = Field(default_factory=list, description="자격 충족/미충족 이유")
    support: Optional[GovernmentSupportResponse] = Field(None, description="지원 프로그램 정보")

    class Config:
        json_schema_extra = {
            "example": {
                "eligible": True,
                "message": "자격 조건을 충족합니다",
                "reasons": ["비자 종류가 eligible_visa_types에 포함됨"],
                "support": None,
            }
        }


