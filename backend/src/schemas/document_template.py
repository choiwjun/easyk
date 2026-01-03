"""Document Template Schemas"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentTemplateBase(BaseModel):
    """서류 템플릿 베이스 스키마"""
    name: str
    description: Optional[str] = None
    category: str  # job_application, support_application
    language: str = "ko"
    file_url: str
    file_name: str


class DocumentTemplateCreate(DocumentTemplateBase):
    """서류 템플릿 생성 스키마"""
    pass


class DocumentTemplateUpdate(BaseModel):
    """서류 템플릿 업데이트 스키마"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    file_url: Optional[str] = None


class DocumentTemplateResponse(DocumentTemplateBase):
    """서류 템플릿 응답 스키마"""
    id: str
    file_size: Optional[str] = None
    mime_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


