"""create government supports table

Revision ID: 7c4f8e2d1a3b

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    # 정부 지원 검색 키워드 테이블 생성
    op.create_table(
        'support_keywords',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('keyword', sa.String(100), nullable=False, index=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, default=True, index=True),
        sa.Column('search_count', sa.Integer, nullable=False, default=0),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )

    # 관계를 위한 인덱스 생성
    op.create_index('ix_support_keywords_created_by', 'support_keywords', ['created_by'])


def downgrade():
    # 정부 지원 검색 키워드 테이블 삭제
    op.drop_index('ix_support_keywords_created_by')
    op.drop_table('support_keywords')




