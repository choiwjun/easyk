"""create_reviews_table

Revision ID: 3a00342bf30b
Revises: e4e603326b57
Create Date: 2026-01-02 13:05:41.699290

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3a00342bf30b'
down_revision: Union[str, None] = 'e4e603326b57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create reviews table
    op.create_table(
        'reviews',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('consultation_id', sa.UUID(), nullable=False, comment='상담 ID (1:1 관계, 상담당 1개 평가만)'),
        sa.Column('reviewer_id', sa.UUID(), nullable=False, comment='평가 작성자 ID (외국인)'),
        sa.Column('consultant_id', sa.UUID(), nullable=False, comment='평가받는 전문가 ID'),
        sa.Column('rating', sa.Integer(), nullable=False, server_default='5', comment='별점 (1~5)'),
        sa.Column('comment', sa.Text(), nullable=True, comment='리뷰 텍스트 (최대 500자)'),
        sa.Column('is_anonymous', sa.Boolean(), nullable=True, server_default='false', comment='익명 여부'),
        sa.Column('helpful_count', sa.Integer(), nullable=True, server_default='0', comment='도움됨 카운트'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Check constraints
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
        
        # Foreign key constraints
        sa.ForeignKeyConstraint(['consultant_id'], ['consultants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['consultation_id'], ['consultations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id'], ondelete='CASCADE'),
        
        # Primary key
        sa.PrimaryKeyConstraint('id'),
        
        # Unique constraint
        sa.UniqueConstraint('consultation_id', name='unique_consultation_review')
    )

    # Create indexes
    op.create_index('ix_reviews_consultant_id', 'reviews', ['consultant_id'], unique=False)
    op.create_index('ix_reviews_consultation_id', 'reviews', ['consultation_id'], unique=True)
    op.create_index('idx_reviews_created_at', 'reviews', [sa.text('created_at DESC')], unique=False)
    op.create_index('ix_reviews_rating', 'reviews', ['rating'], unique=False)
    op.create_index('ix_reviews_reviewer_id', 'reviews', ['reviewer_id'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_reviews_created_at', table_name='reviews')
    op.drop_index('ix_reviews_reviewer_id', table_name='reviews')
    op.drop_index('ix_reviews_rating', table_name='reviews')
    op.drop_index('ix_reviews_consultation_id', table_name='reviews')
    op.drop_index('ix_reviews_consultant_id', table_name='reviews')
    
    # Drop table
    op.drop_table('reviews')
