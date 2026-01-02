"""create_job_applications_table

Revision ID: 5f3a5c1c3a49
Revises: b3c87d12cef1
Create Date: 2026-01-02 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5f3a5c1c3a49'
down_revision: Union[str, None] = 'b3c87d12cef1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create job_applications table
    op.create_table(
        'job_applications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('job_id', sa.UUID(), nullable=False, comment='일자리 ID'),
        sa.Column('user_id', sa.UUID(), nullable=False, comment='지원자 ID (외국인)'),
        sa.Column('status', sa.String(length=50), server_default='applied', nullable=False, comment='지원 상태: applied, in_review, interview, accepted, rejected'),
        sa.Column('cover_letter', sa.Text(), nullable=True, comment='자기소개서'),
        sa.Column('resume_url', sa.String(length=500), nullable=True, comment='이력서 파일 URL'),
        sa.Column('reviewer_comment', sa.Text(), nullable=True, comment='채용담당자 피드백'),
        sa.Column('applied_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False, comment='지원 일시'),
        sa.Column('reviewed_at', sa.TIMESTAMP(timezone=True), nullable=True, comment='검토 완료 시각'),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Check constraints
        sa.CheckConstraint("status IN ('applied', 'in_review', 'interview', 'accepted', 'rejected')", name='check_application_status'),
        
        # Foreign key constraints
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        
        # Primary key
        sa.PrimaryKeyConstraint('id'),
        
        # Unique constraint
        sa.UniqueConstraint('job_id', 'user_id', name='unique_job_user_application')
    )

    # Create indexes
    op.create_index('ix_job_applications_job_id', 'job_applications', ['job_id'], unique=False)
    op.create_index('ix_job_applications_user_id', 'job_applications', ['user_id'], unique=False)
    op.create_index('ix_job_applications_status', 'job_applications', ['status'], unique=False)
    op.create_index('idx_job_applications_applied_at', 'job_applications', [sa.text('applied_at DESC')], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_job_applications_applied_at', table_name='job_applications')
    op.drop_index('ix_job_applications_status', table_name='job_applications')
    op.drop_index('ix_job_applications_user_id', table_name='job_applications')
    op.drop_index('ix_job_applications_job_id', table_name='job_applications')
    
    # Drop table
    op.drop_table('job_applications')
