"""Authentication Router"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.user import UserCreate, UserResponse
from ..services.auth_service import create_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    회원가입 엔드포인트

    Args:
        user_data: 회원가입 데이터
        db: 데이터베이스 세션

    Returns:
        UserResponse: 생성된 사용자 정보

    Raises:
        HTTPException: 이메일 중복 시 400 에러
    """
    return create_user(user_data, db)
