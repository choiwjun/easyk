"""Government Support Service"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from uuid import UUID
import json

from ..models.government_support import GovernmentSupport
from ..models.user import User
from ..schemas.government_support import GovernmentSupportCreate, GovernmentSupportUpdate


def _sanitize_search_input(input_str: Optional[str], max_length: int = 100) -> Optional[str]:
    """
    MEDIUM FIX: 검색 입력 값 sanitization

    Args:
        input_str: 입력 문자열
        max_length: 최대 길이

    Returns:
        Optional[str]: 정제된 문자열 또는 None
    """
    if not input_str:
        return None

    # 공백 제거 및 길이 제한
    sanitized = input_str.strip()[:max_length]

    # 빈 문자열인 경우 None 반환
    if not sanitized:
        return None

    return sanitized


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
    # MEDIUM FIX: 입력 값 sanitization
    category = _sanitize_search_input(category, max_length=50)
    keyword = _sanitize_search_input(keyword)

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


def check_eligibility(
    support_id: UUID,
    visa_type: str,
    age: Optional[int],
    residence_location: Optional[str],
    employment_status: Optional[str],
    db: Session,
) -> dict:
    """
    정부 지원 프로그램 자격 확인

    Args:
        support_id: 지원 프로그램 ID
        visa_type: 비자 종류
        age: 나이 (optional)
        residence_location: 거주 지역 (optional)
        employment_status: 고용 상태 (optional)
        db: 데이터베이스 세션

    Returns:
        dict: 자격 확인 결과
    """
    # 지원 프로그램 조회
    support = get_support_by_id(db, support_id)

    if not support:
        return {
            "eligible": False,
            "message": "해당 지원 프로그램을 찾을 수 없습니다",
            "reasons": ["프로그램 ID가 유효하지 않음"],
            "support": None,
        }

    # eligible_visa_types 파싱
    try:
        eligible_visas = json.loads(support.eligible_visa_types) if support.eligible_visa_types else []
    except (json.JSONDecodeError, TypeError):
        eligible_visas = []

    # 자격 확인 로직
    reasons = []
    eligible = True

    # 1. 비자 유형 확인 (가장 중요)
    if eligible_visas and visa_type not in eligible_visas:
        eligible = False
        reasons.append(f"비자 종류 '{visa_type}'는 지원 대상이 아닙니다 (지원 가능 비자: {', '.join(eligible_visas)})")
    elif eligible_visas and visa_type in eligible_visas:
        reasons.append(f"비자 종류 '{visa_type}'는 지원 가능합니다")

    # 2. 나이 조건 확인 (eligibility 문자열에서 파싱)
    # TODO: eligibility 텍스트에서 나이 조건을 파싱하는 로직 추가 가능
    # 예: "만 18세 이상 40세 이하" 같은 텍스트 파싱

    # 3. 거주 지역 확인 (department 또는 eligibility에서 확인)
    # TODO: 특정 지역에만 제공되는 지원의 경우 확인

    # 4. 프로그램 상태 확인
    if support.status != "active":
        eligible = False
        reasons.append(f"현재 지원이 불가능한 상태입니다 (상태: {support.status})")

    # 5. 신청 기간 확인
    if support.application_period_start or support.application_period_end:
        from datetime import date
        today = date.today()

        if support.application_period_start and today < support.application_period_start:
            eligible = False
            reasons.append(f"신청 시작일({support.application_period_start})이 아직 도래하지 않았습니다")

        if support.application_period_end and today > support.application_period_end:
            eligible = False
            reasons.append(f"신청 마감일({support.application_period_end})이 지났습니다")

    # 결과 메시지 생성
    if eligible:
        message = "✅ 자격 조건을 충족합니다! 신청 가능합니다."
    else:
        message = "❌ 아쉽게도 자격 조건을 충족하지 못합니다."

    return {
        "eligible": eligible,
        "message": message,
        "reasons": reasons if reasons else ["자격 확인 완료"],
        "support": support,
    }


