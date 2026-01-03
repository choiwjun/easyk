"""Job Application Pydantic Schemas"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class JobApplicationCreate(BaseModel):
    """일자리 지원 생성 스키마"""

    cover_letter: Optional[str] = Field(None, description="자기소개서")
    resume_url: Optional[str] = Field(None, max_length=500, description="이력서 파일 URL")


class JobApplicationResponse(BaseModel):
    """일자리 지원 응답 스키마"""

    id: UUID
    job_id: UUID
    user_id: UUID
    status: str
    cover_letter: Optional[str]
    resume_url: Optional[str]
    reviewer_comment: Optional[str]
    applied_at: datetime
    reviewed_at: Optional[datetime]
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: ORM 모드 활성화


class ApplicantInfo(BaseModel):
    """지원자 정보 (관리자용)"""

    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str]
    nationality: Optional[str]


class JobApplicationWithApplicant(JobApplicationResponse):
    """지원자 정보가 포함된 일자리 지원 응답 스키마 (관리자용)"""

    applicant: ApplicantInfo


class JobApplicationStatusUpdate(BaseModel):
    """일자리 지원 상태 업데이트 스키마 (관리자용)"""

    status: str = Field(..., description="지원 상태 (in_review, accepted, rejected)")
    reviewer_comment: Optional[str] = Field(None, max_length=1000, description="검토자 코멘트")


class JobInfo(BaseModel):
    """일자리 정보 (지원 내역용)"""

    id: UUID
    position: str
    company_name: str
    location: str
    employment_type: str
    salary_range: Optional[str]
    status: str
    deadline: datetime

    class Config:
        from_attributes = True


class JobApplicationWithJob(JobApplicationResponse):
    """일자리 정보가 포함된 지원 내역 응답 스키마 (사용자용)"""

    job: JobInfo






