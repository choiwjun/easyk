"""Authentication Middleware"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..utils.auth import verify_access_token


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """현재 인증된 사용자 조회

    Args:
        credentials: HTTP Bearer 토큰
        db: 데이터베이스 세션

    Returns:
        User: 현재 사용자 객체

    Raises:
        HTTPException: 인증 실패 시 401 에러
    """
    # JWT 토큰 검증
    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 페이로드에서 이메일 추출
    email: Optional[str] = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 사용자 조회
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """현재 인증된 관리자 사용자 조회

    Args:
        current_user: 현재 인증된 사용자 (get_current_user에서 주입)

    Returns:
        User: 관리자 사용자 객체

    Raises:
        HTTPException: 관리자 권한이 없을 때 403 에러
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# 별칭: require_admin
require_admin = get_current_admin_user


# Optional 인증용 security (auto_error=False)
optional_security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """현재 인증된 사용자 조회 (선택적)

    토큰이 없거나 유효하지 않으면 None을 반환합니다.
    비로그인 사용자도 접근 가능한 엔드포인트에서 사용합니다.

    Args:
        credentials: HTTP Bearer 토큰 (optional)
        db: 데이터베이스 세션

    Returns:
        Optional[User]: 현재 사용자 객체 또는 None
    """
    if not credentials:
        return None

    # JWT 토큰 검증
    payload = verify_access_token(credentials.credentials)
    if not payload:
        return None

    # 페이로드에서 이메일 추출
    email: Optional[str] = payload.get("sub")
    if not email:
        return None

    # 사용자 조회
    user = db.query(User).filter(User.email == email).first()
    return user
