"""Consultations Router"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.consultation import ConsultationCreate, ConsultationResponse
from ..middleware.auth import get_current_user
from ..services.consultation_service import (
    create_consultation as create_consultation_service,
    get_incoming_consultations as get_incoming_consultations_service,
    get_user_consultations as get_user_consultations_service,
    accept_consultation as accept_consultation_service,
    reject_consultation as reject_consultation_service,
)


router = APIRouter(prefix="/api/consultations", tags=["consultations"])


@router.post("", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation(
    consultation_data: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    상담 신청 생성 엔드포인트

    Args:
        consultation_data: 상담 신청 데이터
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        ConsultationResponse: 생성된 상담 정보
    """
    return create_consultation_service(consultation_data, current_user, db)


@router.get("", response_model=List[ConsultationResponse])
def get_user_consultations(
    status: Optional[str] = Query(None, description="상태 필터 (requested, matched, scheduled, completed 등)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    사용자가 신청한 상담 목록 조회

    Args:
        status: 상태 필터 (optional)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[ConsultationResponse]: 상담 목록
    """
    return get_user_consultations_service(current_user, db, status)


@router.get("/incoming", response_model=List[ConsultationResponse])
def get_incoming_consultations(
    status: Optional[str] = Query(None, description="상태 필터 (matched, scheduled, completed 등)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    전문가에게 들어온 상담 요청 목록 조회

    Args:
        status: 상태 필터 (optional)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[ConsultationResponse]: 상담 목록
    """
    return get_incoming_consultations_service(current_user, db, status)


@router.post("/{consultation_id}/accept", response_model=ConsultationResponse)
def accept_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    전문가가 상담 요청 수락

    Args:
        consultation_id: 상담 ID
        current_user: 현재 인증된 사용자 (전문가)
        db: 데이터베이스 세션

    Returns:
        ConsultationResponse: 수락된 상담 정보
    """
    from uuid import UUID
    return accept_consultation_service(UUID(consultation_id), current_user, db)


@router.post("/{consultation_id}/reject", response_model=ConsultationResponse)
def reject_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    전문가가 상담 요청 거절

    Args:
        consultation_id: 상담 ID
        current_user: 현재 인증된 사용자 (전문가)
        db: 데이터베이스 세션

    Returns:
        ConsultationResponse: 거절된 상담 정보
    """
    from uuid import UUID
    return reject_consultation_service(UUID(consultation_id), current_user, db)
