"""User Model"""

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    String,
    Text,
    TIMESTAMP,
    func,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
import uuid

try:
    from ..database import Base, UUID
except ImportError:
    # For Alembic migrations
    from database import Base, UUID


class User(Base):
    """사용자 테이블 (외국인, 전문가, 관리자)"""

    __tablename__ = "users"

    # Primary Key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    # 인증 정보
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email_verified = Column(Boolean, default=False)
    email_verified_at = Column(TIMESTAMP(timezone=True), nullable=True)

    # 역할
    role = Column(
        String(50),
        nullable=False,
        default="foreign",
        index=True,
    )

    # 개인정보
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    nationality = Column(String(100), nullable=True, index=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)

    # 외국인 관련
    visa_type = Column(String(100), nullable=True, comment="비자 유형: E-1, D-2, F-2 등")
    visa_expiration = Column(Date, nullable=True)
    preferred_language = Column(
        String(10), default="ko", comment="선호 언어: ko, en"
    )

    # 연락처
    phone_number = Column(String(20), nullable=True)
    phone_verified = Column(Boolean, default=False)

    # 프로필
    profile_image_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    residential_area = Column(
        String(100), nullable=True, index=True, comment="거주 지역: 고양시 덕양구 등"
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
        index=True,
    )
    last_login = Column(TIMESTAMP(timezone=True), nullable=True, index=True)

    # 제약조건
    __table_args__ = (
        CheckConstraint(
            "role IN ('foreign', 'consultant', 'admin')",
            name="check_role",
        ),
    )

    # Relationships
    created_keywords = relationship("SupportKeyword", back_populates="creator")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
