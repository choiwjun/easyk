"""Document Template Model"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

try:
    from ..database import Base
except ImportError:
    from database import Base


class DocumentTemplate(Base):
    """서류 템플릿 모델"""
    __tablename__ = "document_templates"

    id = Column(UUID, primary_key=True)
    name = Column(String, nullable=False)  # 템플릿 이름
    description = Column(Text, nullable=True)  # 설명
    category = Column(String, nullable=False)  # 카테고리 (job_application, support_application 등)
    language = Column(String, nullable=False, default="ko")  # 언어
    file_url = Column(String, nullable=False)  # 파일 URL (S3 또는 로컬 스토리지)
    file_name = Column(String, nullable=False)  # 원본 파일명
    file_size = Column(String, nullable=True)  # 파일 크기
    mime_type = Column(String, nullable=True)  # MIME 타입
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.utcnow())

