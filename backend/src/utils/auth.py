"""Authentication Utility Functions"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import jwt

from ..config import settings


def hash_password(password: str) -> str:
    """비밀번호 해싱

    Args:
        password: 해싱할 비밀번호

    Returns:
        str: 해싱된 비밀번호

    Note:
        bcrypt는 72바이트 제한이 있으므로 자동으로 잘라냄
    """
    # bcrypt는 72바이트 제한이 있으므로 잘라냄
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증

    Args:
        plain_password: 평문 비밀번호
        hashed_password: 해싱된 비밀번호

    Returns:
        bool: 비밀번호 일치 여부
    """
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """JWT 액세스 토큰 생성

    Args:
        data: 토큰에 포함할 데이터
        expires_delta: 토큰 만료 시간 (기본값: 설정된 시간)

    Returns:
        str: JWT 토큰
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
