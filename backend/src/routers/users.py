"""Users Router"""

from fastapi import APIRouter, Depends

from ..models.user import User
from ..schemas.user import UserResponse
from ..middleware.auth import get_current_user


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
