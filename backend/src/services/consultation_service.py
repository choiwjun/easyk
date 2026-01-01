"""Consultation Service"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.user import User
from ..models.consultation import Consultation
from ..models.consultant import Consultant
from ..schemas.consultation import ConsultationCreate
from .matching_service import find_matching_consultant


def create_consultation(
    consultation_data: ConsultationCreate,
    user: User,
    db: Session
) -> Consultation:
    """상담 신청 생성 및 전문가 자동 매칭

    Args:
        consultation_data: 상담 신청 데이터
        user: 현재 사용자
        db: 데이터베이스 세션

    Returns:
        Consultation: 생성된 상담 객체
    """
    # 전문가 자동 매칭
    matched_consultant = find_matching_consultant(db, consultation_data.consultation_type)

    # 매칭 결과에 따라 상태 설정
    if matched_consultant:
        consultant_id = matched_consultant.id
        status = "matched"
    else:
        consultant_id = None
        status = "requested"

    # 새 상담 신청 생성
    new_consultation = Consultation(
        user_id=user.id,
        consultant_id=consultant_id,
        consultation_type=consultation_data.consultation_type,
        content=consultation_data.content,
        consultation_method=consultation_data.consultation_method,
        amount=consultation_data.amount,
        status=status,
        payment_status="pending",
    )

    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)

    return new_consultation


def get_incoming_consultations(
    user: User,
    db: Session,
    status: Optional[str] = None
) -> List[Consultation]:
    """전문가에게 들어온 상담 요청 목록 조회

    Args:
        user: 현재 사용자 (전문가)
        db: 데이터베이스 세션
        status: 상태 필터 (optional)

    Returns:
        List[Consultation]: 상담 목록
    """
    # 사용자의 consultant 정보 조회
    consultant = db.query(Consultant).filter(
        Consultant.user_id == user.id
    ).first()

    # 전문가가 아니면 빈 목록 반환
    if not consultant:
        return []

    # 기본 쿼리: 해당 전문가에게 매칭된 상담
    query = db.query(Consultation).filter(
        Consultation.consultant_id == consultant.id
    )

    # 상태 필터 적용
    if status:
        query = query.filter(Consultation.status == status)

    # 최신순 정렬
    consultations = query.order_by(Consultation.created_at.desc()).all()

    return consultations


def accept_consultation(
    consultation_id: UUID,
    user: User,
    db: Session
) -> Consultation:
    """전문가가 상담 요청 수락

    Args:
        consultation_id: 상담 ID
        user: 현재 사용자 (전문가)
        db: 데이터베이스 세션

    Returns:
        Consultation: 수락된 상담 객체

    Raises:
        HTTPException: 상담을 찾을 수 없거나 권한이 없는 경우
    """
    from fastapi import HTTPException

    # 상담 조회
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # 전문가 정보 조회
    consultant = db.query(Consultant).filter(
        Consultant.user_id == user.id
    ).first()

    # 권한 검증: 해당 전문가에게 매칭된 상담인지 확인
    if not consultant or consultation.consultant_id != consultant.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to accept this consultation"
        )

    # 상태 업데이트
    consultation.status = "scheduled"
    db.commit()
    db.refresh(consultation)

    return consultation


def reject_consultation(
    consultation_id: UUID,
    user: User,
    db: Session
) -> Consultation:
    """전문가가 상담 요청 거절

    Args:
        consultation_id: 상담 ID
        user: 현재 사용자 (전문가)
        db: 데이터베이스 세션

    Returns:
        Consultation: 거절된 상담 객체

    Raises:
        HTTPException: 상담을 찾을 수 없거나 권한이 없는 경우
    """
    from fastapi import HTTPException

    # 상담 조회
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # 전문가 정보 조회
    consultant = db.query(Consultant).filter(
        Consultant.user_id == user.id
    ).first()

    # 권한 검증: 해당 전문가에게 매칭된 상담인지 확인
    if not consultant or consultation.consultant_id != consultant.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to reject this consultation"
        )

    # 상태 업데이트 및 전문가 매칭 해제
    consultation.status = "cancelled"
    consultation.consultant_id = None
    db.commit()
    db.refresh(consultation)

    return consultation


def get_user_consultations(
    user: User,
    db: Session,
    status: Optional[str] = None
) -> List[Consultation]:
    """사용자가 신청한 상담 목록 조회

    Args:
        user: 현재 사용자
        db: 데이터베이스 세션
        status: 상태 필터 (optional)

    Returns:
        List[Consultation]: 상담 목록
    """
    # 기본 쿼리: 해당 사용자가 신청한 상담
    query = db.query(Consultation).filter(
        Consultation.user_id == user.id
    )

    # 상태 필터 적용
    if status:
        query = query.filter(Consultation.status == status)

    # 최신순 정렬
    consultations = query.order_by(Consultation.created_at.desc()).all()

    return consultations
