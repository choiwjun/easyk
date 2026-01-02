"""Support Keyword Model"""

from sqlalchemy import (
    Column,
    String,
    Boolean,
    TIMESTAMP,
    Text,
    Integer,
    func,
    ForeignKey,
)
from sqlalchemy.orm import relationship
import uuid

try:
    from ..database import Base, UUID
except ImportError:
    # For Alembic migrations
    from database import Base, UUID


class SupportKeyword(Base):
    """정부 지원 검색 키워드 테이블"""

    __tablename__ = "support_keywords"

    # Primary Key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    created_by = Column(
        UUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="생성한 사용자 ID",
    )

    # 키워드 정보
    keyword = Column(
        String(100),
        nullable=False,
        index=True,
        comment="검색 키워드 (예: WorkNet)",
    )

    category = Column(
        String(50),
        nullable=False,
        comment="카테고리 (visa, labor, contract, business, other)",
    )

    description = Column(
        Text,
        nullable=True,
        comment="키워드 설명 (optional)",
    )

    # 활성 상태
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
        comment="활성 여부",
    )

    # 검색 카운터
    search_count = Column(
        Integer,
        nullable=False,
        default=0,
        comment="검색 횟수",
    )

    # 타임스탬프
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="생성 일시",
    )

    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    creator = relationship("User", back_populates="created_keywords")

    def __repr__(self):
        return f"<SupportKeyword(id={self.id}, keyword={self.keyword}, category={self.category})>"

