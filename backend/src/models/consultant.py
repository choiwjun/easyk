"""Consultant Model"""

from sqlalchemy import (
    Boolean,
    Column,
    Integer,
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


class Consultant(Base):
    """전문가 테이블 (법률 전문가, 세무사 등)"""

    __tablename__ = "consultants"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Key
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # 사무실 정보
    office_name = Column(String(200), nullable=False)
    office_phone = Column(String(20), nullable=True)
    office_address = Column(String(300), nullable=True)
    years_experience = Column(Integer, nullable=True)

    # 전문 분야 (JSON 문자열로 저장, PostgreSQL에서는 ARRAY 사용 권장)
    # SQLite 호환을 위해 String으로 저장 (JSON 형태: '["visa", "labor"]')
    specialties = Column(
        Text,
        nullable=False,
        default="[]",
        comment="JSON 배열: [visa, labor, contract, business]",
    )

    # 요금
    hourly_rate = Column(
        Numeric(10, 2),
        nullable=False,
        server_default="100000.00",
        comment="시간당 상담료 (원)",
    )

    # 평가
    total_reviews = Column(Integer, default=0)
    average_rating = Column(
        Numeric(3, 2),
        server_default="0.00",
        comment="평균 평점 (0-5)",
    )

    # 가용성
    availability = Column(Text, nullable=True, comment='JSON: {"mon": "09:00-18:00", ...}')
    max_consultations_per_day = Column(Integer, default=5)

    # 상태
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)

    # 타임스탬프
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
            "average_rating >= 0 AND average_rating <= 5",
            name="check_average_rating",
        ),
    )

    # Relationships
    user = relationship("User", backref="consultant")

    def __repr__(self):
        return f"<Consultant(id={self.id}, user_id={self.user_id}, office_name={self.office_name})>"
