"""create_payments_table

Revision ID: e4e603326b57
Revises: 15c36782304c
Create Date: 2026-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'e4e603326b57'
down_revision: Union[str, None] = '15c36782304c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('consultation_id', UUID(as_uuid=True), sa.ForeignKey('consultations.id', ondelete='CASCADE'), nullable=False, unique=True, comment='상담 ID (1:1 관계)'),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, comment='결제한 사용자 ID'),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False, comment='결제 금액 (원)'),
        sa.Column('platform_fee', sa.Numeric(10, 2), nullable=False, comment='플랫폼 수수료 (5%)'),
        sa.Column('net_amount', sa.Numeric(10, 2), nullable=False, comment='전문가 수익 (95%)'),
        sa.Column('payment_method', sa.String(50), nullable=False, comment='결제 방식: toss, portone, card, transfer'),
        sa.Column('transaction_id', sa.String(100), nullable=True, unique=True, comment='결제 게이트웨이 거래번호'),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending', comment='결제 상태: pending, completed, failed, refunded, cancelled'),
        sa.Column('paid_at', sa.TIMESTAMP(timezone=True), nullable=True, comment='결제 완료 시각'),
        sa.Column('refunded_at', sa.TIMESTAMP(timezone=True), nullable=True, comment='환불 완료 시각'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),

        # Check constraints
        sa.CheckConstraint(
            "payment_method IN ('toss', 'portone', 'card', 'transfer')",
            name='check_payment_method'
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')",
            name='check_payment_status'
        ),
        sa.CheckConstraint(
            "amount > 0 AND net_amount >= 0 AND platform_fee >= 0",
            name='valid_amounts'
        ),
    )

    # Create indexes
    op.create_index('ix_payments_user_id', 'payments', ['user_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])
    op.create_index('ix_payments_paid_at', 'payments', [sa.text('paid_at DESC')])
    op.create_index('ix_payments_transaction_id', 'payments', ['transaction_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_payments_transaction_id', table_name='payments')
    op.drop_index('ix_payments_paid_at', table_name='payments')
    op.drop_index('ix_payments_status', table_name='payments')
    op.drop_index('ix_payments_user_id', table_name='payments')

    # Drop table
    op.drop_table('payments')
