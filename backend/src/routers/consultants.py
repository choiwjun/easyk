"""Consultants Router"""

from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..schemas.review import ReviewResponse
from ..middleware.auth import get_current_user
from ..services.review_service import (
    get_consultant_reviews as get_consultant_reviews_service,
)

router = APIRouter(prefix="/api/consultants", tags=["consultants"])


@router.get("/{consultant_id}/reviews", response_model=List[ReviewResponse])
def get_consultant_reviews(
    consultant_id: UUID,
    limit: int = Query(20, ge=1, le=100, description="조회할 최대 개수"),
    offset: int = Query(0, ge=0, description="건너뛸 개수"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    전문가별 후기 목록 조회 엔드포인트

    Args:
        consultant_id: 전문가 ID
        limit: 조회할 최대 개수 (기본값: 20, 최대: 100)
        offset: 건너뛸 개수 (기본값: 0)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[ReviewResponse]: 후기 목록 (최신순 정렬)
    """
    return get_consultant_reviews_service(consultant_id, db, limit, offset)


