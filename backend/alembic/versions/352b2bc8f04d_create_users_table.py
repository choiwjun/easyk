"""create users table

Revision ID: 352b2bc8f04d
Revises:
Create Date: 2025-12-31 21:49:02.938505

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '352b2bc8f04d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),

        # 인증 정보
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('email_verified', sa.Boolean(), default=False),
        sa.Column('email_verified_at', sa.TIMESTAMP(timezone=True), nullable=True),

        # 역할
        sa.Column('role', sa.String(50), nullable=False, server_default='foreign'),

        # 개인정보
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('nationality', sa.String(100), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(20), nullable=True),

        # 외국인 관련
        sa.Column('visa_type', sa.String(100), nullable=True),
        sa.Column('visa_expiration', sa.Date(), nullable=True),
        sa.Column('preferred_language', sa.String(10), server_default='ko'),

        # 연락처
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('phone_verified', sa.Boolean(), default=False),

        # 프로필
        sa.Column('profile_image_url', sa.String(500), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('residential_area', sa.String(100), nullable=True),

        # 타임스탬프
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('last_login', sa.TIMESTAMP(timezone=True), nullable=True),

        # 제약조건
        sa.CheckConstraint("role IN ('foreign', 'consultant', 'admin')", name='check_role'),
    )

    # 인덱스 생성
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'])
    op.create_index('idx_users_nationality', 'users', ['nationality'])
    op.create_index('idx_users_residential_area', 'users', ['residential_area'])


def downgrade() -> None:
    # 인덱스 삭제
    op.drop_index('idx_users_residential_area', table_name='users')
    op.drop_index('idx_users_nationality', table_name='users')
    op.drop_index('idx_users_role', table_name='users')
    op.drop_index('idx_users_email', table_name='users')

    # 테이블 삭제
    op.drop_table('users')
