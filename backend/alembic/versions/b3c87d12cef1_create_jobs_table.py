"""create_jobs_table

Revision ID: b3c87d12cef1
Revises: 3a00342bf30b
Create Date: 2026-01-02 13:26:29.744915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b3c87d12cef1'
down_revision: Union[str, None] = '3a00342bf30b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('posted_by', sa.UUID(), nullable=False, comment='지자체 담당자'),
        sa.Column('position', sa.String(length=200), nullable=False, comment='직종'),
        sa.Column('company_name', sa.String(length=200), nullable=False, comment='회사명'),
        sa.Column('company_phone', sa.String(length=20), nullable=True, comment='회사 전화번호'),
        sa.Column('company_address', sa.String(length=300), nullable=True, comment='회사 주소'),
        sa.Column('location', sa.String(length=100), nullable=False, comment='근무 지역'),
        sa.Column('employment_type', sa.String(length=50), server_default='full-time', nullable=False, comment='고용 형태: full-time, contract, part-time, temporary'),
        sa.Column('salary_range', sa.String(length=100), nullable=True, comment='급여 범위 (예: 2,500만원~3,000만원)'),
        sa.Column('salary_currency', sa.String(length=10), server_default='KRW', nullable=True, comment='급여 통화'),
        sa.Column('description', sa.Text(), nullable=False, comment='업무 설명'),
        sa.Column('requirements', sa.Text(), nullable=True, comment='필수 요구사항'),
        sa.Column('preferred_qualifications', sa.Text(), nullable=True, comment='우대사항'),
        sa.Column('benefits', sa.Text(), nullable=True, comment='복리후생'),
        sa.Column('required_languages', postgresql.ARRAY(sa.String()), server_default='{}', nullable=True, comment='필수 언어 배열: [ko, en, zh]'),
        sa.Column('status', sa.String(length=50), server_default='active', nullable=False, comment='공고 상태: active, closed, expired, draft'),
        sa.Column('deadline', sa.TIMESTAMP(timezone=True), nullable=False, comment='모집 마감일'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Check constraints
        sa.CheckConstraint("employment_type IN ('full-time', 'contract', 'part-time', 'temporary')", name='check_employment_type'),
        sa.CheckConstraint("status IN ('active', 'closed', 'expired', 'draft')", name='check_job_status'),
        sa.CheckConstraint('deadline > created_at', name='valid_deadline'),
        
        # Foreign key constraint
        sa.ForeignKeyConstraint(['posted_by'], ['users.id'], ondelete='CASCADE'),
        
        # Primary key
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_jobs_posted_by', 'jobs', ['posted_by'], unique=False)
    op.create_index('ix_jobs_status', 'jobs', ['status'], unique=False)
    op.create_index('ix_jobs_location', 'jobs', ['location'], unique=False)
    op.create_index('ix_jobs_deadline', 'jobs', ['deadline'], unique=False)
    op.create_index('ix_jobs_employment_type', 'jobs', ['employment_type'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_jobs_employment_type', table_name='jobs')
    op.drop_index('ix_jobs_deadline', table_name='jobs')
    op.drop_index('ix_jobs_location', table_name='jobs')
    op.drop_index('ix_jobs_status', table_name='jobs')
    op.drop_index('ix_jobs_posted_by', table_name='jobs')
    
    # Drop table
    op.drop_table('jobs')
