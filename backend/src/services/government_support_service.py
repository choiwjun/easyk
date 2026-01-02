"""Government Support Service"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from uuid import UUID
import json

from ..models.government_support import GovernmentSupport
from ..models.user import User
from ..schemas.government_support import GovernmentSupportCreate, GovernmentSupportUpdate


def get_supports(
    db: Session,
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[List[GovernmentSupport], int]:
    """
    정부 지원 프로그램 목록 조회

    Args:
        db: 데이터베이스 세션
        category: 카테고리 필터 (optional)
        keyword: 검색 키워드 (optional)
        limit: 조회할 최대 개수
        offset: 조회 시작 위치 (pagination)

    Returns:
        tuple[List[GovernmentSupport], int]: (지원 목록, 전체 개수)
    """
    # 기본 필터: active 상태만 조회
    query = db.query(GovernmentSupport).filter(GovernmentSupport.status == "active")

    # 카테고리 필터
    if category:
        query = query.filter(GovernmentSupport.category == category)

    # 키워드 검색 (title 또는 description)
    if keyword:
        search_pattern = f"%{keyword}%"
        query = query.filter(
            or_(
                GovernmentSupport.title.ilike(search_pattern),
                GovernmentSupport.description.ilike(search_pattern),
            )
        )

    # 전체 개수 (pagination 전)
    total = query.count()

    # 정렬 (최신 순)
    query = query.order_by(GovernmentSupport.created_at.desc())

    # 페이지네이션
    supports = query.offset(offset).limit(limit).all()

    return supports, total


def get_support_by_id(db: Session, support_id: UUID) -> Optional[GovernmentSupport]:
    """
    ID로 정부 지원 프로그램 조회

    Args:
        db: 데이터베이스 세션
        support_id: 지원 프로그램 ID

    Returns:
        GovernmentSupport or None
    """
    return db.query(GovernmentSupport).filter(GovernmentSupport.id == support_id).first()


def create_support(
    support_data: GovernmentSupportCreate,
    db: Session,
) -> GovernmentSupport:
    """
    새로운 정부 지원 프로그램 생성

    Args:
        support_data: 생성할 지원 데이터
        db: 데이터베이스 세션

    Returns:
        GovernmentSupport: 생성된 지원 프로그램
    """
    # eligible_visa_types 리스트를 JSON 문자열로 변환
    visa_types_json = json.dumps(support_data.eligible_visa_types) if support_data.eligible_visa_types else "[]"

    new_support = GovernmentSupport(
        title=support_data.title,
        category=support_data.category,
        description=support_data.description,
        eligibility=support_data.eligibility,
        eligible_visa_types=visa_types_json,
        support_content=support_data.support_content,
        department=support_data.department,
        department_phone=support_data.department_phone,
        department_website=support_data.department_website,
        application_period_start=support_data.application_period_start,
        application_period_end=support_data.application_period_end,
        official_link=support_data.official_link,
        status=support_data.status,
    )

    db.add(new_support)
    db.commit()
    db.refresh(new_support)

    return new_support


def update_support(
    support_id: UUID,
    support_data: GovernmentSupportUpdate,
    db: Session,
) -> Optional[GovernmentSupport]:
    """
    정부 지원 프로그램 수정

    Args:
        support_id: 수정할 지원 프로그램 ID
        support_data: 수정할 데이터
        db: 데이터베이스 세션

    Returns:
        GovernmentSupport or None
    """
    support = db.query(GovernmentSupport).filter(GovernmentSupport.id == support_id).first()

    if not support:
        return None

    # 업데이트할 필드만 적용
    update_data = support_data.model_dump(exclude_unset=True)

    # eligible_visa_types가 포함된 경우 JSON으로 변환
    if "eligible_visa_types" in update_data:
        update_data["eligible_visa_types"] = json.dumps(update_data["eligible_visa_types"])

    for field, value in update_data.items():
        setattr(support, field, value)

    db.commit()
    db.refresh(support)

    return support


def delete_support(
    support_id: UUID,
    db: Session,
) -> bool:
    """
    정부 지원 프로그램 삭제

    Args:
        support_id: 삭제할 지원 프로그램 ID
        db: 데이터베이스 세션

    Returns:
        bool: 삭제 성공 여부
    """
    support = db.query(GovernmentSupport).filter(GovernmentSupport.id == support_id).first()

    if not support:
        return False

    db.delete(support)
    db.commit()

    return True


