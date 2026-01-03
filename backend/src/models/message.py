"""Message Model"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

try:
    from ..database import Base
except ImportError:
    from database import Base


class Message(Base):
    """메시지 모델"""
    __tablename__ = "messages"

    id = Column(UUID, primary_key=True)
    consultation_id = Column(UUID, ForeignKey("consultations.id"), nullable=False)  # 상담 ID
    sender_id = Column(UUID, ForeignKey("users.id"), nullable=False)  # 보내는 사람 ID
    content = Column(Text, nullable=False)  # 메시지 내용
    is_read = Column(Boolean, default=False)  # 읽음 여부
    file_attachment = Column(String, nullable=True)  # 첨부 파일 URL
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

    # Relationships
    sender = relationship("User", back_populates="sent_messages")
    consultation = relationship("Consultation", back_populates="messages")



