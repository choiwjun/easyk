"""create_government_supports_table

Revision ID: 7c4f8e2d1a3b
Revises: 5f3a5c1c3a49
Create Date: 2026-01-02 17:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '7c4f8e2d1a3b'
down_revision: Union[str, None] = '5f3a5c1c3a49'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create government_supports table
    op.create_table(
        'government_supports',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False, comment='프로그램 제목'),
        sa.Column('category', sa.String(length=50), nullable=False, comment='카테고리: subsidy, education, training, visa, housing'),
        sa.Column('description', sa.Text(), nullable=False, comment='프로그램 설명'),
        sa.Column('eligibility', sa.Text(), nullable=True, comment='대상 조건 설명'),
        sa.Column('eligible_visa_types', sa.Text(), nullable=True, server_default='[]', comment='배열 형태의 JSON 문자열: [E-1, D-2, F-2, ...]'),
        sa.Column('support_content', sa.Text(), nullable=True, comment='지원 내용 (금액, 교육 시간 등)'),
        sa.Column('department', sa.String(length=100), nullable=False, comment='담당 부처 (고용노동부, 중소벤처기업부 등)'),
        sa.Column('department_phone', sa.String(length=20), nullable=True, comment='담당 부처 전화번호'),
        sa.Column('department_website', sa.String(length=300), nullable=True, comment='담당 부처 웹사이트'),
        sa.Column('application_period_start', sa.Date(), nullable=True, comment='신청 시작일'),
        sa.Column('application_period_end', sa.Date(), nullable=True, comment='신청 마감일'),
        sa.Column('official_link', sa.String(length=500), nullable=True, comment='공식 신청 링크'),
        sa.Column('status', sa.String(length=50), server_default='active', nullable=False, comment='상태: active, inactive, ended'),
        sa.Column('created_at', sa.Text(), nullable=False, comment='생성 시각'),
        sa.Column('updated_at', sa.Text(), nullable=False, comment='수정 시각'),

        # Check constraints
        sa.CheckConstraint(
            "category IN ('subsidy', 'education', 'training', 'visa', 'housing')",
            name='check_category_valid'
        ),
        sa.CheckConstraint(
            "status IN ('active', 'inactive', 'ended')",
            name='check_status_valid'
        ),
        sa.CheckConstraint(
            'application_period_end >= application_period_start OR application_period_end IS NULL',
            name='check_valid_period'
        ),

        # Primary key
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('idx_supports_category', 'government_supports', ['category'], unique=False)
    op.create_index('idx_supports_status', 'government_supports', ['status'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_supports_status', table_name='government_supports')
    op.drop_index('idx_supports_category', table_name='government_supports')

    # Drop table
    op.drop_table('government_supports')
