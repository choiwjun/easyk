"""Review Model"""

from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    Boolean,
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


class Review(Base):

    __tablename__ = "reviews"

    # Primary Key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    consultation_id = Column(
        UUID,
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    reviewer_id = Column(
        UUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    consultant_id = Column(
        UUID,
        ForeignKey("consultants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    rating = Column(
        Integer,
        nullable=False,
        default=5,
        index=True,
        comment="별점 (1~5)",
    )
    comment = Column(
        Text,
        nullable=True,
    )

    is_anonymous = Column(
        Boolean,
        default=False,
    )
    helpful_count = Column(
        Integer,
        default=0,
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
            "rating >= 1 AND rating <= 5",
            name="check_rating_range",
        ),
        UniqueConstraint(
            "consultation_id",
            name="unique_consultation_review",
        ),
    )

    # Relationships
    consultation = relationship("Consultation", backref="review")
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviews_written")
    consultant = relationship("Consultant", backref="reviews_received")

    def __repr__(self):
        return f"<Review(id={self.id}, consultation_id={self.consultation_id}, consultant_id={self.consultant_id}, rating={self.rating})>"
