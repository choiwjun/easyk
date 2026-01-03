"""Upload Model"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

try:
    from ..database import Base
except ImportError:
    from database import Base


class Upload(Base):
    """파일 업로드 모델"""
    __tablename__ = "uploads"

    id = Column(UUID, primary_key=True)
    file_name = Column(String, nullable=False)  # 원본 파일명
    file_path = Column(String, nullable=False)  # 파일 저장 경로 (S3 또는 로컬)
    file_size = Column(BigInteger, nullable=False)  # 파일 크기 (bytes)
    mime_type = Column(String, nullable=False)  # MIME 타입
    file_type = Column(String, nullable=False)  # 파일 유형 (resume, profile_photo, document 등)
    uploaded_by = Column(UUID, ForeignKey("users.id"), nullable=False)  # 업로드 사용자 ID
    upload_status = Column(String, nullable=False, default="completed")  # 업로드 상태 (completed, failed)
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

    # Relationships
    user = relationship("User", back_populates="uploads")

