"""Users Router"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.user import UserResponse, UserUpdate
from ..middleware.auth import get_current_user
from ..database import get_db


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    현재 로그인한 사용자 정보 조회

    Args:
        current_user: 현재 인증된 사용자

    Returns:
        UserResponse: 사용자 정보
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    현재 로그인한 사용자 프로필 수정

    Args:
        update_data: 수정할 프로필 데이터
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        UserResponse: 업데이트된 사용자 정보
    """
    # 제공된 필드만 업데이트
    # HIGH FIX: 화이트리스트 방식으로 허용된 필드만 업데이트
    update_dict = update_data.model_dump(exclude_unset=True)

    # UserUpdate 스키마에 정의된 필드만 허용
    allowed_fields = {"nationality", "visa_type", "preferred_language",
                     "residential_area", "phone_number", "bio"}

    for field, value in update_dict.items():
        if field in allowed_fields:
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user
