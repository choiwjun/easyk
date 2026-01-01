"""create_consultations_table

Revision ID: 15c36782304c
Revises: a716a520a00a
Create Date: 2026-01-02 01:02:42.939722

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = '15c36782304c'
down_revision: Union[str, None] = 'a716a520a00a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create consultations table
    op.create_table(
        'consultations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('consultant_id', UUID(as_uuid=True), sa.ForeignKey('consultants.id', ondelete='SET NULL'), nullable=True),
        sa.Column('consultation_type', sa.String(100), nullable=False, comment='상담 유형: visa, labor, contract, business, other'),
        sa.Column('content', sa.Text, nullable=False, comment='상담 요청 내용'),
        sa.Column('status', sa.String(50), nullable=False, server_default='requested', comment='상태: requested, matched, scheduled, in_progress, completed, cancelled'),
        sa.Column('scheduled_at', sa.TIMESTAMP(timezone=True), nullable=True, comment='예약된 상담 날짜/시간'),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True), nullable=True, comment='상담 완료 날짜/시간'),
        sa.Column('consultation_method', sa.String(50), nullable=False, server_default='email', comment='상담 방법: email, document, call, video'),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False, comment='상담료'),
        sa.Column('payment_status', sa.String(50), nullable=False, server_default='pending', comment='결제 상태: pending, completed, failed, refunded'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),

        # Check constraints
        sa.CheckConstraint(
            "consultation_type IN ('visa', 'labor', 'contract', 'business', 'other')",
            name='check_consultation_type'
        ),
        sa.CheckConstraint(
            "status IN ('requested', 'matched', 'scheduled', 'in_progress', 'completed', 'cancelled')",
            name='check_status'
        ),
        sa.CheckConstraint(
            "consultation_method IN ('email', 'document', 'call', 'video')",
            name='check_consultation_method'
        ),
        sa.CheckConstraint(
            "payment_status IN ('pending', 'completed', 'failed', 'refunded')",
            name='check_payment_status'
        ),
        sa.CheckConstraint(
            "scheduled_at > created_at OR scheduled_at IS NULL",
            name='valid_dates'
        ),
    )

    # Create indexes
    op.create_index('ix_consultations_user_id', 'consultations', ['user_id'])
    op.create_index('ix_consultations_consultant_id', 'consultations', ['consultant_id'])
    op.create_index('ix_consultations_status', 'consultations', ['status'])
    op.create_index('ix_consultations_payment_status', 'consultations', ['payment_status'])
    op.create_index('ix_consultations_created_at', 'consultations', ['created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_consultations_created_at', table_name='consultations')
    op.drop_index('ix_consultations_payment_status', table_name='consultations')
    op.drop_index('ix_consultations_status', table_name='consultations')
    op.drop_index('ix_consultations_consultant_id', table_name='consultations')
    op.drop_index('ix_consultations_user_id', table_name='consultations')

    # Drop table
    op.drop_table('consultations')
