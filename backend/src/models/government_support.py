"""Government Support Model"""

from sqlalchemy import Column, String, Text, Date, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from ..database import Base, UUID


class GovernmentSupport(Base):
    """정부 지원 프로그램 모델"""

    __tablename__ = "government_supports"

    # Primary Key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    # 프로그램 정보
    title = Column(String(200), nullable=False, comment="프로그램 제목")
    category = Column(
        String(50),
        nullable=False,
        comment="카테고리: subsidy, education, training, visa, housing"
    )
    description = Column(Text, nullable=False, comment="프로그램 설명")

    # 자격 조건
    eligibility = Column(Text, nullable=True, comment="대상 조건 설명")
    eligible_visa_types = Column(
        Text,
        nullable=True,
        default="[]",
        comment="배열 형태의 JSON 문자열: [E-1, D-2, F-2, ...]"
    )

    # 지원 내용
    support_content = Column(Text, nullable=True, comment="지원 내용 (금액, 교육 시간 등)")

    # 담당 기관
    department = Column(String(100), nullable=False, comment="담당 부처 (고용노동부, 중소벤처기업부 등)")
    department_phone = Column(String(20), nullable=True, comment="담당 부처 전화번호")
    department_website = Column(String(300), nullable=True, comment="담당 부처 웹사이트")

    # 신청 정보
    application_period_start = Column(Date, nullable=True, comment="신청 시작일")
    application_period_end = Column(Date, nullable=True, comment="신청 마감일")
    official_link = Column(String(500), nullable=True, comment="공식 신청 링크")

    # 상태
    status = Column(
        String(50),
        nullable=False,
        default="active",
        comment="상태: active, inactive, ended"
    )

    # 타임스탬프
    created_at = Column(
        "created_at",
        Text,
        nullable=False,
        default=lambda: datetime.utcnow().isoformat(),
        comment="생성 시각"
    )
    updated_at = Column(
        "updated_at",
        Text,
        nullable=False,
        default=lambda: datetime.utcnow().isoformat(),
        onupdate=lambda: datetime.utcnow().isoformat(),
        comment="수정 시각"
    )

    # 제약 조건
    __table_args__ = (
        CheckConstraint(
            "category IN ('subsidy', 'education', 'training', 'visa', 'housing')",
            name="check_category_valid"
        ),
        CheckConstraint(
            "status IN ('active', 'inactive', 'ended')",
            name="check_status_valid"
        ),
        CheckConstraint(
            "application_period_end >= application_period_start OR application_period_end IS NULL",
            name="check_valid_period"
        ),
        Index("idx_supports_category", "category"),
        Index("idx_supports_status", "status"),
    )

    def __repr__(self):
        return f"<GovernmentSupport(id={self.id}, title={self.title}, category={self.category})>"
