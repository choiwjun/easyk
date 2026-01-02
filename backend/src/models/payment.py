"""Payment Model"""

from sqlalchemy import (
    Column,
    String,
    TIMESTAMP,
    Numeric,
    func,
    CheckConstraint,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
import uuid

try:
    from ..database import Base, UUID
except ImportError:
    # For Alembic migrations
    from database import Base, UUID


class Payment(Base):
    """결제 테이블 (상담료 결제 기록 및 수익 분배 추적)"""

    __tablename__ = "payments"

    # Primary Key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    consultation_id = Column(
        UUID,
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
        comment="상담 ID (1:1 관계)",
    )
    user_id = Column(
        UUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="결제한 사용자 ID",
    )

    # 금액
    amount = Column(
        Numeric(10, 2),
        nullable=False,
        comment="결제 금액 (원)",
    )
    platform_fee = Column(
        Numeric(10, 2),
        nullable=False,
        comment="플랫폼 수수료 (5%)",
    )
    net_amount = Column(
        Numeric(10, 2),
        nullable=False,
        comment="전문가 수익 (95%)",
    )

    # 결제 방식
    payment_method = Column(
        String(50),
        nullable=False,
        comment="결제 방식: toss, portone, card, transfer",
    )
    transaction_id = Column(
        String(100),
        unique=True,
        nullable=True,
        index=True,
        comment="결제 게이트웨이 거래번호",
    )

    # 상태
    status = Column(
        String(50),
        nullable=False,
        server_default="pending",
        index=True,
        comment="결제 상태: pending, completed, failed, refunded, cancelled",
    )

    # 타임스탬프
    paid_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        index=True,
        comment="결제 완료 시각",
    )
    refunded_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        comment="환불 완료 시각",
    )
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
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
            "payment_method IN ('toss', 'portone', 'card', 'transfer')",
            name="check_payment_method",
        ),
        CheckConstraint(
            "status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')",
            name="check_payment_status",
        ),
        CheckConstraint(
            "amount > 0 AND net_amount >= 0 AND platform_fee >= 0",
            name="valid_amounts",
        ),
    )

    # Relationships
    consultation = relationship("Consultation", backref="payment")
    user = relationship("User", backref="payments")

    def __repr__(self):
        return f"<Payment(id={self.id}, consultation_id={self.consultation_id}, user_id={self.user_id}, status={self.status}, amount={self.amount})>"



