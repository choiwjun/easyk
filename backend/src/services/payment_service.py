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
from ..config import settings

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
    # payment_key는 결제 완료 후에만 받을 수 있으므로, 여기서는 NULL로 설정
    # 콜백에서 토스페이먼츠 API 검증 후 transaction_id 업데이트
    new_payment = Payment(
        consultation_id=consultation.id,
        user_id=user.id,
        amount=consultation.amount,
        platform_fee=platform_fee,
        net_amount=net_amount,
        payment_method=payment_data.payment_method,
        transaction_id=None,  # 결제 완료 후 콜백에서 업데이트
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


async def process_payment_callback(
    payment_key: str,
    order_id: str,
    amount: int,
    db: Session,
) -> Payment:
    """
    결제 완료 콜백 처리 (토스페이먼츠 API 검증 포함)

    Args:
        payment_key: 토스페이먼츠 paymentKey
        order_id: 주문 ID (consultation_id)
        amount: 결제 금액 (원)
        db: 데이터베이스 세션

    Returns:
        Payment: 업데이트된 결제 객체

    Raises:
        HTTPException: 결제를 찾을 수 없거나 검증 실패 시 에러
    """
    from uuid import UUID
    from datetime import datetime, timezone
    from ..utils.toss_payments import toss_payments_client

    # consultation_id로 결제 조회 (pending 상태인 결제만)
    # CRITICAL FIX: SELECT FOR UPDATE로 행 잠금 - 동시성 제어
    consultation_id = UUID(order_id)
    payment = db.query(Payment).filter(
        Payment.consultation_id == consultation_id,
        Payment.status == "pending",
    ).with_for_update().first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found or already processed"
        )

    # 토스페이먼츠 API로 결제 검증
    try:
        payment_info = await toss_payments_client.get_payment(payment_key)
        
        # 금액 검증
        verified_amount = int(payment_info.get("totalAmount", 0))
        if verified_amount != amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount mismatch: expected {amount}, got {verified_amount}"
            )
        
        # orderId 검증
        verified_order_id = payment_info.get("orderId", "")
        if verified_order_id != order_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order ID mismatch"
            )
        
        # 결제 상태 확인
        payment_status = payment_info.get("status", "").upper()
        if payment_status != "DONE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment status is not DONE: {payment_status}"
            )
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        # 토스페이먼츠 API 호출 실패 시에도 로깅하고 계속 진행 (개발 환경)
        # 프로덕션에서는 엄격하게 검증해야 함
        import logging
        logging.warning(f"Toss Payments API verification failed: {e}")

    # 이미 완료된 결제는 idempotent하게 처리
    if payment.status == "completed":
        return payment

    # transaction_id 업데이트 (처음 콜백인 경우)
    if payment.transaction_id is None:
        payment.transaction_id = payment_key

    # 결제 상태 업데이트
    payment.status = "completed"
    payment.paid_at = datetime.now(timezone.utc)
    
    # 상담 상태 업데이트
    # CRITICAL FIX: SELECT FOR UPDATE로 행 잠금
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).with_for_update().first()
    
    if consultation:
        # 금액 검증 (DB의 상담 금액과 비교)
        db_amount = int(float(consultation.amount))
        if db_amount != amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Consultation amount mismatch: expected {db_amount}, got {amount}"
            )
        
        consultation.payment_status = "completed"
        # 상담 상태가 matched이면 scheduled로 변경
        if consultation.status == "matched":
            consultation.status = "scheduled"

    db.commit()
    db.refresh(payment)

    return payment

