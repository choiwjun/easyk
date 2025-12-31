"""Authentication Router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.user import UserCreate, UserResponse, LoginRequest, TokenResponse
from ..services.auth_service import create_user, authenticate_user

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


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    로그인 엔드포인트

    Args:
        login_data: 로그인 데이터 (이메일, 비밀번호)
        db: 데이터베이스 세션

    Returns:
        TokenResponse: JWT 액세스 토큰

    Raises:
        HTTPException: 인증 실패 시 401 에러
    """
    token = authenticate_user(login_data.email, login_data.password, db)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token
