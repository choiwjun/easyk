"""Consultant Matching Service"""

import json
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..models.consultant import Consultant


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
    # 활성화되고 검증된 전문가만 조회
    consultants = db.query(Consultant).filter(
        Consultant.is_active == True,
        Consultant.is_verified == True
    ).all()

    # 전문 분야가 일치하는 전문가 필터링
    matching_consultants = []
    for consultant in consultants:
        try:
            specialties = json.loads(consultant.specialties)
            if consultation_type in specialties:
                matching_consultants.append(consultant)
        except (json.JSONDecodeError, TypeError):
            # JSON 파싱 실패 시 건너뛰기
            continue

    # 매칭된 전문가가 없으면 None 반환
    if not matching_consultants:
        return None

    # 평점 높은 순으로 정렬
    matching_consultants.sort(key=lambda c: c.average_rating, reverse=True)

    # 가장 높은 평점의 전문가 반환
    return matching_consultants[0]
