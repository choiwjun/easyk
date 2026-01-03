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


@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation_detail(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    상담 상세 정보 조회

    Args:
        consultation_id: 상담 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        ConsultationResponse: 상담 상세 정보
    """
    from uuid import UUID
    from ..services.consultation_service import get_consultation_by_id as get_consultation_by_id_service
    return get_consultation_by_id_service(UUID(consultation_id), current_user, db)


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


@router.get("/dashboard/stats", response_model=dict)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    전문가 대시보드 통계

    Args:
        current_user: 현재 인증된 사용자 (전문가)
        db: 데이터베이스 세션

    Returns:
        dict: 통계 데이터 (상담 수, 수익, 평점 등)
    """
    from ..models.consultation import Consultation
    from ..models.consultant import Consultant
    from ..models.review import Review
    from sqlalchemy import func
    from datetime import datetime, timedelta

    # 전문가 정보 조회
    consultant = db.query(Consultant).filter(
        Consultant.user_id == current_user.id
    ).first()

    if not consultant:
        return {
            "total_consultations": 0,
            "requested": 0,
            "matched": 0,
            "scheduled": 0,
            "completed": 0,
            "cancelled": 0,
            "total_revenue": 0,
            "average_rating": 0,
            "total_reviews": 0,
        }

    # 전체 상담 수
    total_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.consultant_id == consultant.id
    ).scalar()

    # 상태별 수
    requested = db.query(func.count(Consultation.id)).filter(
        Consultation.consultant_id == consultant.id,
        Consultation.status == "requested"
    ).scalar()

    matched = db.query(func.count(Consultation.id)).filter(
        Consultation.consultant_id == consultant.id,
        Consultation.status == "matched"
    ).scalar()

    scheduled = db.query(func.count(Consultation.id)).filter(
        Consultation.consultant_id == consultant.id,
        Consultation.status == "scheduled"
    ).scalar()

    completed = db.query(func.count(Consultation.id)).filter(
        Consultation.consultant_id == consultant.id,
        Consultation.status == "completed"
    ).scalar()

    cancelled = db.query(func.count(Consultation.id)).filter(
        Consultation.consultant_id == consultant.id,
        Consultation.status == "cancelled"
    ).scalar()

    # 총 수익 (완료 상담 중 결제 완료된 것만)
    total_revenue = db.query(func.sum(Consultation.amount)).filter(
        Consultation.consultant_id == consultant.id,
        Consultation.status == "completed",
        Consultation.payment_status == "completed"
    ).scalar() or 0

    # 평균 평점
    avg_rating = db.query(func.avg(Review.rating)).join(
        Consultation, Review.consultation_id == Consultation.id
    ).filter(
        Consultation.consultant_id == consultant.id
    ).scalar() or 0

    # 총 리뷰 수
    total_reviews = db.query(func.count(Review.id)).join(
        Consultation, Review.consultation_id == Consultation.id
    ).filter(
        Consultation.consultant_id == consultant.id
    ).scalar() or 0

    return {
        "total_consultations": total_consultations,
        "requested": requested,
        "matched": matched,
        "scheduled": scheduled,
        "completed": completed,
        "cancelled": cancelled,
        "total_revenue": float(total_revenue),
        "average_rating": round(avg_rating, 1),
        "total_reviews": total_reviews,
    }
