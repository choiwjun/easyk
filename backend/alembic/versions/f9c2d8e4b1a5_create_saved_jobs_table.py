"""create_saved_jobs_table

Revision ID: f9c2d8e4b1a5
Revises: 5f3a5c1c3a49
Create Date: 2026-01-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f9c2d8e4b1a5'
down_revision: Union[str, None] = '5f3a5c1c3a49'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create saved_jobs table
    op.create_table(
        'saved_jobs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False, comment='사용자 ID'),
        sa.Column('job_id', sa.UUID(), nullable=False, comment='일자리 ID'),
        sa.Column('saved_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'), comment='저장일시'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'job_id', name='uq_user_job'),
        comment='관심 일자리 저장 테이블'
    )

    # Create indexes
    op.create_index('ix_saved_jobs_user_id', 'saved_jobs', ['user_id'])
    op.create_index('ix_saved_jobs_job_id', 'saved_jobs', ['job_id'])
    op.create_index('ix_saved_jobs_saved_at', 'saved_jobs', ['saved_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_saved_jobs_saved_at', table_name='saved_jobs')
    op.drop_index('ix_saved_jobs_job_id', table_name='saved_jobs')
    op.drop_index('ix_saved_jobs_user_id', table_name='saved_jobs')

    # Drop table
    op.drop_table('saved_jobs')
