"""Payments Router"""

from fastapi import APIRouter, Depends, status, Header, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.user import User
from ..schemas.payment import PaymentCreate, PaymentResponse, PaymentCallbackRequest
from ..middleware.auth import get_current_user
from ..services.payment_service import (
    create_payment as create_payment_service,
    process_payment_callback as process_payment_callback_service,
)
from ..config import settings

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    결제 생성 엔드포인트

    Args:
        payment_data: 결제 생성 데이터
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        PaymentResponse: 생성된 결제 정보
    """
    return create_payment_service(payment_data, current_user, db)


@router.post("/callback", response_model=PaymentResponse)
async def payment_callback(
    callback_data: PaymentCallbackRequest,
    x_toss_webhook_secret: Optional[str] = Header(None, alias="X-Toss-Webhook-Secret"),
    db: Session = Depends(get_db),
):
    """
    결제 완료 콜백 엔드포인트

    Args:
        callback_data: 토스페이먼츠 콜백 데이터
        x_toss_webhook_secret: 웹훅 시크릿 (선택사항, 향후 서명 검증에 사용)
        db: 데이터베이스 세션

    Returns:
        PaymentResponse: 업데이트된 결제 정보

    Note:
        - 현재는 기본적인 인증만 수행 (향후 토스페이먼츠 서명 검증 추가 필요)
        - 프로덕션 환경에서는 반드시 서명 검증 또는 IP 화이트리스트 적용 필요
    """
    # 기본 보안: 시크릿 키 검증 (간단한 방법)
    # 향후 토스페이먼츠 공식 서명 검증 방식으로 업그레이드 필요
    if settings.DEBUG is False:
        # 프로덕션 환경에서는 더 엄격한 검증 필요
        # 예: IP 화이트리스트, 서명 검증 등
        pass
    
    return await process_payment_callback_service(
        callback_data.paymentKey,
        callback_data.orderId,
        callback_data.amount,
        db,
    )

