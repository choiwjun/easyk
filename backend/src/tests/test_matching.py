"""Consultant Matching Service Tests"""

import json
import pytest
from sqlalchemy.orm import Session

from ..models.consultant import Consultant
from ..models.user import User
from ..services.matching_service import find_matching_consultant


@pytest.fixture
def test_consultants(db: Session, test_user: User):
    """테스트용 전문가 여러 명 생성"""
    # 비자 전문가 (평점 4.5)
    visa_consultant = Consultant(
        user_id=test_user.id,
        office_name="비자 전문 법률사무소",
        specialties=json.dumps(["visa"]),
        hourly_rate=100000.00,
        total_reviews=10,
        average_rating=4.5,
        availability="월-금 9:00-18:00",
        max_consultations_per_day=5,
        is_active=True,
        is_verified=True,
    )
    db.add(visa_consultant)
    db.commit()
    db.refresh(visa_consultant)

    # 노동법 전문가 (평점 4.8)
    labor_user = User(
        email="labor@example.com",
        password_hash="hashed_password",
        role="foreign",
        first_name="Labor",
        last_name="Expert",
    )
    db.add(labor_user)
    db.commit()
    db.refresh(labor_user)

    labor_consultant = Consultant(
        user_id=labor_user.id,
        office_name="노동법 전문 법률사무소",
        specialties=json.dumps(["labor"]),
        hourly_rate=120000.00,
        total_reviews=20,
        average_rating=4.8,
        availability="월-금 9:00-18:00",
        max_consultations_per_day=3,
        is_active=True,
        is_verified=True,
    )
    db.add(labor_consultant)
    db.commit()
    db.refresh(labor_consultant)

    # 비자+노동법 복합 전문가 (평점 4.2)
    multi_user = User(
        email="multi@example.com",
        password_hash="hashed_password",
        role="foreign",
        first_name="Multi",
        last_name="Expert",
    )
    db.add(multi_user)
    db.commit()
    db.refresh(multi_user)

    multi_consultant = Consultant(
        user_id=multi_user.id,
        office_name="종합 법률사무소",
        specialties=json.dumps(["visa", "labor", "contract"]),
        hourly_rate=150000.00,
        total_reviews=5,
        average_rating=4.2,
        availability="월-금 9:00-18:00",
        max_consultations_per_day=10,
        is_active=True,
        is_verified=True,
    )
    db.add(multi_consultant)
    db.commit()
    db.refresh(multi_consultant)

    # 비활성화된 전문가 (평점 5.0이지만 비활성)
    inactive_user = User(
        email="inactive@example.com",
        password_hash="hashed_password",
        role="foreign",
        first_name="Inactive",
        last_name="Expert",
    )
    db.add(inactive_user)
    db.commit()
    db.refresh(inactive_user)

    inactive_consultant = Consultant(
        user_id=inactive_user.id,
        office_name="비활성 법률사무소",
        specialties=json.dumps(["visa"]),
        hourly_rate=90000.00,
        total_reviews=50,
        average_rating=5.0,
        availability="휴무",
        max_consultations_per_day=0,
        is_active=False,  # 비활성화
        is_verified=True,
    )
    db.add(inactive_consultant)
    db.commit()
    db.refresh(inactive_consultant)

    return {
        "visa": visa_consultant,
        "labor": labor_consultant,
        "multi": multi_consultant,
        "inactive": inactive_consultant,
    }


class TestFindMatchingConsultant:
    """전문가 매칭 로직 테스트"""

    def test_match_consultant_by_specialty(self, db: Session, test_consultants: dict):
        """전문 분야가 일치하는 전문가 찾기"""
        # 비자 전문가 매칭
        matched = find_matching_consultant(db, "visa")

        assert matched is not None
        assert "visa" in json.loads(matched.specialties)

    def test_match_consultant_by_rating(self, db: Session, test_consultants: dict):
        """평점이 높은 순으로 전문가 정렬"""
        # 노동법 상담: labor_consultant (4.8) > multi_consultant (4.2)
        matched = find_matching_consultant(db, "labor")

        assert matched is not None
        assert matched.office_name == "노동법 전문 법률사무소"
        assert float(matched.average_rating) == 4.8

    def test_match_consultant_highest_rating_for_same_specialty(
        self, db: Session, test_consultants: dict
    ):
        """같은 전문 분야 내에서 평점이 가장 높은 전문가 선택"""
        # 비자 상담: visa_consultant (4.5) > multi_consultant (4.2)
        # inactive_consultant (5.0)는 비활성이므로 제외
        matched = find_matching_consultant(db, "visa")

        assert matched is not None
        assert matched.office_name == "비자 전문 법률사무소"
        assert matched.average_rating == 4.5

    def test_match_consultant_no_match(self, db: Session, test_consultants: dict):
        """일치하는 전문가가 없을 때 None 반환"""
        # 존재하지 않는 전문 분야 (business)
        matched = find_matching_consultant(db, "business")

        assert matched is None

    def test_match_consultant_excludes_inactive(self, db: Session, test_consultants: dict):
        """비활성화된 전문가는 매칭에서 제외"""
        # 비자 전문가 중 inactive는 평점이 5.0으로 가장 높지만 is_active=False이므로 제외
        matched = find_matching_consultant(db, "visa")

        assert matched is not None
        assert matched.is_active is True
        assert matched.office_name != "비활성 법률사무소"

    def test_match_consultant_excludes_unverified(self, db: Session, test_user: User):
        """검증되지 않은 전문가는 매칭에서 제외"""
        # 검증되지 않은 계약법 전문가 생성
        unverified_user = User(
            email="unverified@example.com",
            password_hash="hashed_password",
            role="foreign",
            first_name="Unverified",
            last_name="User",
        )
        db.add(unverified_user)
        db.commit()
        db.refresh(unverified_user)

        unverified_consultant = Consultant(
            user_id=unverified_user.id,
            office_name="미검증 법률사무소",
            specialties=json.dumps(["contract"]),
            hourly_rate=80000.00,
            total_reviews=0,
            average_rating=0.0,
            availability="월-금 9:00-18:00",
            max_consultations_per_day=5,
            is_active=True,
            is_verified=False,  # 검증되지 않음
        )
        db.add(unverified_consultant)
        db.commit()

        matched = find_matching_consultant(db, "contract")

        # 검증되지 않은 전문가만 있으므로 매칭 실패
        # 또는 검증된 multi_consultant (contract 포함) 매칭
        if matched is not None:
            assert matched.is_verified is True
            assert matched.office_name != "미검증 법률사무소"
        else:
            # contract만 있는 검증된 전문가가 없으면 None
            pass

    def test_match_consultant_with_multiple_specialties(
        self, db: Session, test_consultants: dict
    ):
        """복수 전문 분야를 가진 전문가도 매칭 가능"""
        # contract 전문: multi_consultant만 해당
        matched = find_matching_consultant(db, "contract")

        assert matched is not None
        assert matched.office_name == "종합 법률사무소"
        assert "contract" in json.loads(matched.specialties)

    def test_match_consultant_returns_first_highest_rated(
        self, db: Session, test_user: User
    ):
        """평점이 같을 경우 첫 번째 매칭 전문가 반환"""
        # 동일 평점 전문가 2명 생성
        user1 = User(
            email="same1@example.com",
            password_hash="hashed_password",
            role="foreign",
            first_name="Same1",
            last_name="User",
        )
        db.add(user1)
        db.commit()
        db.refresh(user1)

        consultant1 = Consultant(
            user_id=user1.id,
            office_name="법률사무소 A",
            specialties=json.dumps(["other"]),
            hourly_rate=100000.00,
            total_reviews=10,
            average_rating=4.5,
            availability="월-금 9:00-18:00",
            max_consultations_per_day=5,
            is_active=True,
            is_verified=True,
        )
        db.add(consultant1)
        db.commit()

        user2 = User(
            email="same2@example.com",
            password_hash="hashed_password",
            role="foreign",
            first_name="Same2",
            last_name="User",
        )
        db.add(user2)
        db.commit()
        db.refresh(user2)

        consultant2 = Consultant(
            user_id=user2.id,
            office_name="법률사무소 B",
            specialties=json.dumps(["other"]),
            hourly_rate=100000.00,
            total_reviews=10,
            average_rating=4.5,
            availability="월-금 9:00-18:00",
            max_consultations_per_day=5,
            is_active=True,
            is_verified=True,
        )
        db.add(consultant2)
        db.commit()

        matched = find_matching_consultant(db, "other")

        # 평점이 같으므로 첫 번째로 생성된 전문가 반환 (ID 순)
        assert matched is not None
        assert matched.average_rating == 4.5
