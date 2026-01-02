"""Job Application Model"""

from sqlalchemy import (
    Column,
    String,
    Text,
    TIMESTAMP,
    CheckConstraint,
    ForeignKey,
    UniqueConstraint,
    func,
)

from sqlalchemy.orm import relationship
import uuid

try:
    from ..database import Base, UUID
except ImportError:
    # For Alembic migrations
    from database import Base, UUID


class JobApplication(Base):

    __tablename__ = "job_applications"

    # Primary Key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    job_id = Column(
        UUID,
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status = Column(
        String(50),
        nullable=False,
        server_default="applied",
        index=True,
    )

    cover_letter = Column(
        Text,
        nullable=True,
    )
    resume_url = Column(
        String(500),
        nullable=True,
    )

    # 반응
    reviewer_comment = Column(
        Text,
        nullable=True,
    )

    applied_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
    reviewed_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('applied', 'in_review', 'interview', 'accepted', 'rejected')",
            name="check_application_status",
        ),
        UniqueConstraint(
            "job_id",
            "user_id",
            name="unique_job_user_application",
        ),
    )

    # Relationships
    job = relationship("Job", back_populates="applications")
    user = relationship("User", backref="job_applications")

    def __repr__(self):
        return f"<JobApplication(id={self.id}, job_id={self.job_id}, user_id={self.user_id}, status={self.status})>"

