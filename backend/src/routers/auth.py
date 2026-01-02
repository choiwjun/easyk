"""Authentication Router"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.user import UserCreate, UserResponse, LoginRequest, TokenResponse
from ..services.auth_service import create_user, authenticate_user
from ..utils.i18n import get_error_message

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db), request: Request = None):
    """
    회원가입 엔드포인트

    Args:
        user_data: 회원가입 데이터
        db: 데이터베이스 세션
        request: FastAPI Request 객체

    Returns:
        UserResponse: 생성된 사용자 정보

    Raises:
        HTTPException: 이메일 중복 시 400 에러
    """
    return create_user(user_data, db, request)


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db), request: Request = None):
    """
    로그인 엔드포인트

    Args:
        login_data: 로그인 데이터 (이메일, 비밀번호)
        db: 데이터베이스 세션
        request: FastAPI Request 객체

    Returns:
        TokenResponse: JWT 액세스 토큰

    Raises:
        HTTPException: 인증 실패 시 401 에러
    """
    # 언어 추출
    language = request.headers.get("Accept-Language", "ko").split("-")[0].lower() if request else "ko"
    
    token = authenticate_user(login_data.email, login_data.password, db, request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=get_error_message("invalid_credentials", language),
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token
