"""Upload Schemas"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UploadBase(BaseModel):
    """파일 업로드 베이스 스키마"""
    file_name: str
    file_size: int
    mime_type: str
    file_type: str


class UploadCreate(UploadBase):
    """파일 업로드 생성 스키마"""
    file_type: str


class UploadResponse(UploadBase):
    """파일 업로드 응답 스키마"""
    id: str
    file_path: str
    uploaded_by: str
    upload_status: str
    created_at: datetime

    class Config:
        from_attributes = True


