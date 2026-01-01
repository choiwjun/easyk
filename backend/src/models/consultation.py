"""Consultation Model"""

from sqlalchemy import (
    Column,
    String,
    Text,
    TIMESTAMP,
    Numeric,
    func,
    CheckConstraint,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

try:
    from ..database import Base
except ImportError:
    # For Alembic migrations
    from database import Base


class Consultation(Base):
    """상담 신청 테이블 (외국인과 전문가 간의 상담 신청 및 진행 상황 추적)"""

    __tablename__ = "consultations"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    consultant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("consultants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # 상담 정보
    consultation_type = Column(
        String(100),
        nullable=False,
        comment="상담 유형: visa, labor, contract, business, other",
    )
    content = Column(Text, nullable=False, comment="상담 요청 내용")

    # 상태 추적
    status = Column(
        String(50),
        nullable=False,
        server_default="requested",
        index=True,
        comment="상태: requested, matched, scheduled, in_progress, completed, cancelled",
    )

    # 예약 정보
    scheduled_at = Column(TIMESTAMP(timezone=True), nullable=True, comment="예약된 상담 날짜/시간")
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True, comment="상담 완료 날짜/시간")
    consultation_method = Column(
        String(50),
        nullable=False,
        server_default="email",
        comment="상담 방법: email, document, call, video",
    )

    # 요금
    amount = Column(
        Numeric(10, 2),
        nullable=False,
        comment="상담료",
    )

    # 결제 상태
    payment_status = Column(
        String(50),
        nullable=False,
        server_default="pending",
        index=True,
        comment="결제 상태: pending, completed, failed, refunded",
    )

    # 타임스탬프
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # 제약조건
    __table_args__ = (
        CheckConstraint(
            "consultation_type IN ('visa', 'labor', 'contract', 'business', 'other')",
            name="check_consultation_type",
        ),
        CheckConstraint(
            "status IN ('requested', 'matched', 'scheduled', 'in_progress', 'completed', 'cancelled')",
            name="check_status",
        ),
        CheckConstraint(
            "consultation_method IN ('email', 'document', 'call', 'video')",
            name="check_consultation_method",
        ),
        CheckConstraint(
            "payment_status IN ('pending', 'completed', 'failed', 'refunded')",
            name="check_payment_status",
        ),
        CheckConstraint(
            "scheduled_at > created_at OR scheduled_at IS NULL",
            name="valid_dates",
        ),
    )

    # Relationships
    user = relationship("User", backref="consultations")
    consultant = relationship("Consultant", backref="consultations")

    def __repr__(self):
        return f"<Consultation(id={self.id}, user_id={self.user_id}, consultant_id={self.consultant_id}, status={self.status})>"


