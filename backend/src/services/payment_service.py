"""Payment Service"""

from decimal import Decimal
from typing import Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..models.user import User
from ..models.consultation import Consultation
from ..models.payment import Payment
from ..schemas.payment import PaymentCreate

# 플랫폼 수수료율 (5%)
PLATFORM_FEE_RATE = Decimal("0.05")


def calculate_fees(amount: Decimal) -> Tuple[Decimal, Decimal]:
    """
    플랫폼 수수료와 전문가 수익 계산

    Args:
        amount: 결제 금액

    Returns:
        tuple[Decimal, Decimal]: (platform_fee, net_amount)
    """
    platform_fee = amount * PLATFORM_FEE_RATE
    net_amount = amount - platform_fee
    return (platform_fee, net_amount)


def create_payment(
    payment_data: PaymentCreate,
    user: User,
    db: Session,
) -> Payment:
    """
    결제 생성

    Args:
        payment_data: 결제 생성 데이터
        user: 현재 사용자
        db: 데이터베이스 세션

    Returns:
        Payment: 생성된 결제 객체

    Raises:
        HTTPException: 상담을 찾을 수 없거나, 중복 결제 시 400 에러
    """
    # 상담 조회
    consultation = db.query(Consultation).filter(
        Consultation.id == payment_data.consultation_id
    ).first()

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )

    # 권한 검증: 자신의 상담만 결제 가능
    if consultation.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to create payment for this consultation"
        )

    # 수수료 계산
    platform_fee, net_amount = calculate_fees(consultation.amount)

    # 결제 생성
    new_payment = Payment(
        consultation_id=consultation.id,
        user_id=user.id,
        amount=consultation.amount,
        platform_fee=platform_fee,
        net_amount=net_amount,
        payment_method=payment_data.payment_method,
        transaction_id=payment_data.payment_key,  # 임시로 payment_key를 transaction_id에 저장
        status="pending",
    )

    try:
        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment for this consultation already exists"
        )

    return new_payment


def process_payment_callback(
    payment_key: str,
    order_id: str,
    db: Session,
) -> Payment:
    """
    결제 완료 콜백 처리

    Args:
        payment_key: 토스페이먼츠 paymentKey
        order_id: 주문 ID (consultation_id)
        db: 데이터베이스 세션

    Returns:
        Payment: 업데이트된 결제 객체

    Raises:
        HTTPException: 결제를 찾을 수 없을 때 404 에러
    """
    from uuid import UUID
    from datetime import datetime, timezone

    # consultation_id로 결제 조회
    consultation_id = UUID(order_id)
    payment = db.query(Payment).filter(
        Payment.consultation_id == consultation_id,
        Payment.transaction_id == payment_key,
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # 이미 완료된 결제는 idempotent하게 처리
    if payment.status == "completed":
        return payment

    # 결제 상태 업데이트
    payment.status = "completed"
    payment.paid_at = datetime.now(timezone.utc)
    
    # 상담 상태 업데이트
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()
    
    if consultation:
        consultation.payment_status = "completed"
        # 상담 상태가 matched이면 scheduled로 변경
        if consultation.status == "matched":
            consultation.status = "scheduled"

    db.commit()
    db.refresh(payment)

    return payment

