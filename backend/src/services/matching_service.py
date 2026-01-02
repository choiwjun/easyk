"""Consultant Matching Service"""

import json
import logging
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, cast, Text

from ..models.consultant import Consultant

logger = logging.getLogger(__name__)


def find_matching_consultant(db: Session, consultation_type: str) -> Optional[Consultant]:
    """
    상담 유형에 맞는 전문가를 찾아 반환

    Args:
        db: 데이터베이스 세션
        consultation_type: 상담 유형 (visa, labor, contract, business, other)

    Returns:
        Optional[Consultant]: 매칭된 전문가 (없으면 None)

    매칭 로직:
        1. is_active=True, is_verified=True인 전문가만 대상
        2. specialties 배열에 consultation_type이 포함된 전문가 필터링
        3. average_rating 높은 순으로 정렬
        4. 첫 번째 전문가 반환
    """
    # HIGH FIX: N+1 쿼리 최적화 - SQL 레벨에서 필터링
    # PostgreSQL/SQLite 모두 지원하는 LIKE 검색 사용
    # JSON 배열 내 검색: specialties LIKE '%"consultation_type"%'
    search_pattern = f'%"{consultation_type}"%'

    try:
        # 데이터베이스에서 직접 필터링 (N+1 해결)
        consultant = db.query(Consultant).filter(
            Consultant.is_active == True,
            Consultant.is_verified == True,
            cast(Consultant.specialties, Text).like(search_pattern)
        ).order_by(
            desc(Consultant.average_rating)
        ).first()

        return consultant

    except Exception as e:
        # 데이터베이스 특화 기능 사용 실패 시 fallback
        logger.warning(f"Database-level JSON filtering failed, using fallback: {e}")

        # Fallback: 기존 Python 필터링 방식 (호환성 보장)
        consultants = db.query(Consultant).filter(
            Consultant.is_active == True,
            Consultant.is_verified == True
        ).all()

        matching_consultants = []
        for consultant in consultants:
            try:
                specialties = json.loads(consultant.specialties)
                if consultation_type in specialties:
                    matching_consultants.append(consultant)
            except (json.JSONDecodeError, TypeError):
                continue

        if not matching_consultants:
            return None

        matching_consultants.sort(key=lambda c: c.average_rating, reverse=True)
        return matching_consultants[0]
