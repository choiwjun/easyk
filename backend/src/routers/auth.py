"""Authentication Router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import bcrypt

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    # bcrypt는 72바이트 제한이 있으므로 잘라냄
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


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
    # 비밀번호 해싱
    hashed_password = hash_password(user_data.password)

    # User 모델 생성
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        nationality=user_data.nationality,
        role=user_data.role,
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    return db_user
