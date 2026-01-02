"""Reviews Router"""

from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..schemas.review import ReviewCreate, ReviewResponse
from ..middleware.auth import get_current_user
from ..services.review_service import (
    create_review as create_review_service,
    get_consultant_reviews as get_consultant_reviews_service,
)

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    후기 작성 엔드포인트

    Args:
        review_data: 후기 작성 데이터
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        ReviewResponse: 생성된 후기 정보
    """
    return create_review_service(review_data, current_user, db)

