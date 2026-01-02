"""Payments Router"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.payment import PaymentCreate, PaymentResponse, PaymentCallbackRequest
from ..middleware.auth import get_current_user
from ..services.payment_service import (
    create_payment as create_payment_service,
    process_payment_callback as process_payment_callback_service,
)

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
def payment_callback(
    callback_data: PaymentCallbackRequest,
    db: Session = Depends(get_db),
):
    """
    결제 완료 콜백 엔드포인트

    Args:
        callback_data: 토스페이먼츠 콜백 데이터
        db: 데이터베이스 세션

    Returns:
        PaymentResponse: 업데이트된 결제 정보
    """
    return process_payment_callback_service(
        callback_data.paymentKey,
        callback_data.orderId,
        db,
    )

