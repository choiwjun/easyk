"""Support Keywords Router"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..schemas.support_keyword import SupportKeywordCreate, SupportKeywordResponse, SupportKeywordList
from ..middleware.auth import get_current_user, get_current_admin_user
from ..services.support_keyword_service import (
    create_keyword as create_keyword_service,
    get_all_keywords as get_all_keywords_service,
    increment_search_count as increment_search_count_service,
)

router = APIRouter(prefix="/api/support-keywords", tags=["support-keywords"])


@router.get("", response_model=SupportKeywordList)
def get_keywords(
    category: Optional[str] = Query(None, description="카테고리 필터 (visa, labor, contract, business, other)"),
    search: Optional[str] = Query(None, description="키워드 검색"),
    limit: int = Query(100, ge=1, le=500, description="조회할 최대 개수"),
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    정부 지원 검색 키워드 목록 조회 (관리자 전용)

    Args:
        category: 카테고리 필터 (optional)
        search: 키워드 검색 (optional)
        limit: 조회할 최대 개수
        admin_user: 현재 인증된 관리자
        db: 데이터베이스 세션

    Returns:
        SupportKeywordList: 키워드 목록
    """
    keywords = get_all_keywords_service(db, category, search, limit)
    return SupportKeywordList(keywords=keywords, total=len(keywords))


@router.post("", response_model=SupportKeywordResponse, status_code=status.HTTP_201_CREATED)
def create_keyword(
    keyword_data: SupportKeywordCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    정부 지원 검색 키워드 생성 (관리자 전용)

    Args:
        keyword_data: 키워드 생성 데이터
        admin_user: 현재 인증된 관리자
        db: 데이터베이스 세션

    Returns:
        SupportKeywordResponse: 생성된 키워드 정보
    """
    return create_keyword_service(keyword_data, admin_user.id, db)


@router.post("/{keyword_id}/search", response_model=SupportKeywordResponse, status_code=status.HTTP_200_OK)
def increment_search_count(
    keyword_id: UUID,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    키워드 검색 카운터 증가 (검색 수 +1)

    Args:
        keyword_id: 키워드 ID
        admin_user: 현재 인증된 관리자
        db: 데이터베이스 세션

    Returns:
        SupportKeywordResponse: 업데이트된 키워드 정보
    """
    return increment_search_count_service(keyword_id, db)




