"""Review Service"""

from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..models.user import User
from ..models.consultation import Consultation
from ..models.consultant import Consultant
from ..models.review import Review
from ..schemas.review import ReviewCreate


def create_review(
    review_data: ReviewCreate,
    user: User,
    db: Session,
) -> Review:
    """
    후기 작성

    Args:
        review_data: 후기 작성 데이터
        user: 현재 사용자 (리뷰 작성자)
        db: 데이터베이스 세션

    Returns:
        Review: 생성된 후기 객체

    Raises:
        HTTPException: 상담을 찾을 수 없거나, 중복 후기 시 에러
    """
    # 상담 조회
    consultation = db.query(Consultation).filter(
        Consultation.id == review_data.consultation_id
    ).first()

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )

    # 권한 검증: 자신의 상담만 후기 작성 가능
    if consultation.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to create review for this consultation"
        )

    # 상담 상태 검증: 완료된 상담만 후기 작성 가능
    if consultation.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review can only be created for completed consultations"
        )

    # 후기 생성
    new_review = Review(
        consultation_id=consultation.id,
        reviewer_id=user.id,
        consultant_id=consultation.consultant_id,
        rating=review_data.rating,
        comment=review_data.comment,
        is_anonymous=review_data.is_anonymous or False,
        helpful_count=0,
    )

    try:
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review for this consultation already exists"
        )

    # 전문가 평점 업데이트
    update_consultant_rating(consultation.consultant_id, db)

    return new_review


def update_consultant_rating(consultant_id: UUID, db: Session) -> None:
    """
    전문가의 평균 평점 및 총 후기 수 업데이트

    Args:
        consultant_id: 전문가 ID
        db: 데이터베이스 세션
    """
    consultant = db.query(Consultant).filter(
        Consultant.id == consultant_id
    ).first()

    if not consultant:
        return

    # HIGH FIX: SQL 집계 함수 사용 - N+1 쿼리 최적화
    from sqlalchemy import func

    # COUNT()와 AVG()를 한 번의 쿼리로 조회
    result = db.query(
        func.count(Review.id).label('total_reviews'),
        func.avg(Review.rating).label('average_rating')
    ).filter(
        Review.consultant_id == consultant_id
    ).first()

    total_reviews = result.total_reviews if result else 0
    average_rating = result.average_rating if result and result.average_rating else 0

    if total_reviews == 0:
        # 후기가 없으면 기본값으로 설정
        consultant.total_reviews = 0
        consultant.average_rating = Decimal("0.00")
    else:
        # 총 후기 수
        consultant.total_reviews = total_reviews

        # 평균 평점 계산 (이미 집계됨)
        consultant.average_rating = Decimal(str(average_rating)).quantize(Decimal("0.01"))

    db.commit()
    db.refresh(consultant)


def get_consultant_reviews(
    consultant_id: UUID,
    db: Session,
    limit: int = 20,
    offset: int = 0,
) -> list[Review]:
    """
    전문가별 후기 목록 조회 (최신순 정렬, 페이지네이션)

    Args:
        consultant_id: 전문가 ID
        db: 데이터베이스 세션
        limit: 조회할 최대 개수 (기본값: 20)
        offset: 건너뛸 개수 (기본값: 0)

    Returns:
        list[Review]: 후기 목록 (최신순 정렬)

    Raises:
        HTTPException: 전문가를 찾을 수 없을 때 404 에러
    """
    from ..models.consultant import Consultant

    # 전문가 존재 여부 확인
    consultant = db.query(Consultant).filter(
        Consultant.id == consultant_id
    ).first()

    if not consultant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant not found"
        )

    # 후기 목록 조회 (최신순 정렬, 페이지네이션)
    reviews = db.query(Review).filter(
        Review.consultant_id == consultant_id
    ).order_by(
        Review.created_at.desc()
    ).offset(offset).limit(limit).all()

    return reviews

