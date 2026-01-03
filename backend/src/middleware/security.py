"""보안 관련 미들웨어"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from collections import defaultdict
from datetime import datetime, timedelta
import time

# 요청 제한 설정 (프로덕션 vs 프로덕션)
rate_limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day"],
    storage_uri="memory://",
)

# 레이트 리밋 요청 횟수 추적
request_counts = defaultdict(int)
rate_limit_reset = time.time() + 86400  # 24시간

async def rate_limit_exceeded_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    레이트 리밋 초과 시 커스텀 응답
    
    Args:
        request: FastAPI Request 객체
        exc: 예외 객체
    
    Returns:
        JSONResponse: 에러 응답
    """
    client_ip = get_remote_address(request)
    
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": f"Rate limit exceeded. Maximum 200 requests per day allowed.",
            "error_code": "RATE_LIMIT_EXCEEDED",
            "retry_after": int((rate_limit_reset - time.time()) / 60),  # 남은 시간(분)
        }
    )


def get_client_ip(request: Request) -> str:
    """
    클라이언트 IP 주소 추출
    
    Args:
        request: FastAPI Request 객체
    
    Returns:
        str: 클라이언트 IP 주소
    """
    # X-Forwarded-For 헤더 확인 (프록시/로드밸런서)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # X-Real-IP 헤더 확인
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    
    # 직접 연결된 IP
    if request.client:
        return request.client.host
    
    return "unknown"


def validate_environment_variables() -> None:
    """
    필수 환경 변수 검증
    
    Raises:
        ValueError: 필수 환경 변수가 누락인 경우
    """
    from ..config import settings
    
    missing_vars = []
    
    # 데이터베이스 URL 확인
    if not settings.DATABASE_URL or settings.DATABASE_URL == "postgresql://user:password@localhost:5432/easyk":
        missing_vars.append("DATABASE_URL")
    
    # 시크릿 키 확인 (프로덕션 모드에서만)
    if settings.SECRET_KEY == "your-secret-key-here-change-in-production":
        missing_vars.append("SECRET_KEY (production requires secure secret key)")
    
    # Toss Payments 키 확인
    if not settings.TOSS_CLIENT_KEY or not settings.TOSS_SECRET_KEY:
        missing_vars.append("TOSS_CLIENT_KEY and TOSS_SECRET_KEY")
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        raise ValueError(error_msg)


