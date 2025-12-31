"""Authentication Service"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..models.user import User
from ..schemas.user import UserCreate
from ..utils.auth import hash_password


def create_user(user_data: UserCreate, db: Session) -> User:
    """사용자 생성

    Args:
        user_data: 회원가입 데이터
        db: 데이터베이스 세션

    Returns:
        User: 생성된 사용자 객체

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
