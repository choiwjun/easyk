"""Job Model"""

from sqlalchemy import (
    Column,
    String,
    Text,
    TIMESTAMP,
    CheckConstraint,
    ForeignKey,
    func,
)

from sqlalchemy.orm import relationship
import uuid

try:
    from ..database import Base, UUID
except ImportError:
    # For Alembic migrations
    from database import Base, UUID


class Job(Base):

    __tablename__ = "jobs"

    # Primary Key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    # Foreign Key
    posted_by = Column(
        UUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    position = Column(
        String(200),
        nullable=False,
        comment="직종",
    )
    company_name = Column(
        String(200),
        nullable=False,
    )
    company_phone = Column(
        String(20),
        nullable=True,
    )
    company_address = Column(
        String(300),
        nullable=True,
    )
    location = Column(
        String(100),
        nullable=False,
        index=True,
        comment="근무 지역",
    )

    employment_type = Column(
        String(50),
        nullable=False,
        server_default="full-time",
        index=True,
    )
    salary_range = Column(
        String(100),
        nullable=True,
        comment="급여 범위 (?? 2,500만원~3,000만원)",
    )
    salary_currency = Column(
        String(10),
        nullable=True,
        server_default="KRW",
    )

    description = Column(
        Text,
        nullable=False,
    )
    requirements = Column(
        Text,
        nullable=True,
    )
    preferred_qualifications = Column(
        Text,
        nullable=True,
    )
    benefits = Column(
        Text,
        nullable=True,
    )

    required_languages = Column(
        Text,
        nullable=True,
        server_default="[]",
        comment="JSON 배열: [ko, en, zh]",
    )

    status = Column(
        String(50),
        nullable=False,
        server_default="active",
        index=True,
    )

    # 마감
    deadline = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        index=True,
        comment="모집 마감일",
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

    __table_args__ = (
        CheckConstraint(
            "employment_type IN ('full-time', 'contract', 'part-time', 'temporary')",
            name="check_employment_type",
        ),
        CheckConstraint(
            "status IN ('active', 'closed', 'expired', 'draft')",
            name="check_job_status",
        ),
        CheckConstraint(
            "deadline > created_at",
            name="valid_deadline",
        ),
    )

    # Relationships
    poster = relationship("User", backref="jobs_posted")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(id={self.id}, position={self.position}, company_name={self.company_name}, status={self.status})>"
