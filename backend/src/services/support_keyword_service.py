"""Support Keyword Service"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from uuid import UUID

from ..models.support_keyword import SupportKeyword
from ..models.user import User

# Import schemas here since they're used in function signatures
try:
    from ..schemas.support_keyword import SupportKeywordCreate
except ImportError:
    SupportKeywordCreate = None


def create_keyword(
    keyword_data: SupportKeywordCreate,
    creator_id: UUID,
    db: Session,
) -> SupportKeyword:
    """
    정부 지원 검색 키워드 생성

    Args:
        keyword_data: 키워드 생성 데이터
        creator_id: 생성한 사용자 ID
        db: 데이터베이스 세션

    Returns:
        SupportKeyword: 생성된 키워드 객체
    """
    new_keyword = SupportKeyword(
        keyword=keyword_data.keyword,
        category=keyword_data.category,
        description=keyword_data.description,
        is_active=True,
        created_by=creator_id,
    )

    db.add(new_keyword)
    db.commit()
    db.refresh(new_keyword)

    return new_keyword


def get_all_keywords(
    db: Session,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
) -> List[SupportKeyword]:
    """
    모든 키워드 목록 조회 (관리자용)

    Args:
        db: 데이터베이스 세션
        category: 카테고리 필터 (optional)
        search: 키워드 검색 (optional)
        limit: 조회할 최대 개수

    Returns:
        List[SupportKeyword]: 키워드 목록 (검색 순, 카테고리별 정렬)
    """
    query = db.query(SupportKeyword).filter(SupportKeyword.is_active == True)

    # 카테고리 필터
    if category:
        query = query.filter(SupportKeyword.category == category)

    # 키워드 검색 (keyword 또는 category)
    if search:
        query = query.filter(
            or_(
                SupportKeyword.keyword.ilike(f"%{search}%"),
                SupportKeyword.category.ilike(f"%{search}%"),
            )
        )

    # 검색 순과 카테고리별 정렬 (검색 순 높은 순서, 카테고리 우선)
    keywords = query.order_by(
        SupportKeyword.search_count.desc(),
        SupportKeyword.category.asc(),
        SupportKeyword.created_at.desc(),
    ).limit(limit).all()

    return keywords


def increment_search_count(
    keyword_id: UUID,
    db: Session,
) -> SupportKeyword:
    """
    키워드 검색 카운터 증가

    Args:
        keyword_id: 키워드 ID
        db: 데이터베이스 세션

    Returns:
        SupportKeyword: 업데이트된 키워드 객체
    """
    keyword = db.query(SupportKeyword).filter(SupportKeyword.id == keyword_id).first()

    if not keyword:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Keyword not found"
        )

    keyword.search_count += 1
    db.commit()
    db.refresh(keyword)

    return keyword

