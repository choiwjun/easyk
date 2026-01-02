"""Review API Tests"""

import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from decimal import Decimal

from ..models.user import User
from ..models.consultant import Consultant
from ..models.consultation import Consultation
from ..models.review import Review
from ..utils.auth import create_access_token


@pytest.fixture
def test_consultant(db: Session, test_user: User):
    """테스트용 전문가 생성"""
    consultant = Consultant(
        user_id=test_user.id,
        office_name="법률사무소 ABC",
        specialties=json.dumps(["visa", "labor"]),
        hourly_rate=Decimal("100000.00"),
        total_reviews=0,
        average_rating=Decimal("0.00"),
        is_active=True,
        is_verified=True,
    )
    db.add(consultant)
    db.commit()
    db.refresh(consultant)
    return consultant


@pytest.fixture
def test_completed_consultation(db: Session, test_user: User, test_consultant: Consultant):
    """테스트용 완료된 상담 생성 (후기 작성 가능한 상태)"""
    consultation = Consultation(
        user_id=test_user.id,
        consultant_id=test_consultant.id,
        consultation_type="visa",
        content="F-2 비자 연장 관련 상담을 원합니다.",
        consultation_method="email",
        amount=Decimal("50000.00"),
        status="completed",  # 완료된 상담만 후기 작성 가능
        payment_status="completed",
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation


@pytest.fixture
def test_user_token(test_user: User) -> str:
    """테스트용 JWT 토큰 생성"""
    return create_access_token(
        data={"sub": test_user.email, "user_id": str(test_user.id)}
    )


class TestCreateReview:
    """후기 작성 API 테스트"""

    def test_create_review_success(
        self,
        client: TestClient,
        test_user_token: str,
        test_completed_consultation: Consultation,
        db: Session,
    ):
        """유효한 데이터로 후기 작성 성공"""
        response = client.post(
            "/api/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_completed_consultation.id),
                "rating": 5,
                "comment": "매우 만족스러운 상담이었습니다. 친절하고 전문적인 답변 감사합니다.",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["consultation_id"] == str(test_completed_consultation.id)
        assert data["rating"] == 5
        assert data["comment"] == "매우 만족스러운 상담이었습니다. 친절하고 전문적인 답변 감사합니다."
        
        # 전문가 평점 업데이트 확인
        db.refresh(test_completed_consultation.consultant)
        assert test_completed_consultation.consultant.total_reviews == 1
        assert test_completed_consultation.consultant.average_rating == Decimal("5.00")

    def test_create_review_duplicate(
        self,
        client: TestClient,
        test_user_token: str,
        test_completed_consultation: Consultation,
        db: Session,
    ):
        """중복 후기 방지 (같은 상담에 대한 후기는 1개만 허용)"""
        # 첫 번째 후기 생성
        first_review = Review(
            consultation_id=test_completed_consultation.id,
            reviewer_id=test_completed_consultation.user_id,
            consultant_id=test_completed_consultation.consultant_id,
            rating=5,
            comment="첫 번째 후기",
        )
        db.add(first_review)
        db.commit()

        # 동일 상담에 대한 두 번째 후기 시도
        response = client.post(
            "/api/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_completed_consultation.id),
                "rating": 4,
                "comment": "두 번째 후기",
            },
        )

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_create_review_invalid_consultation(
        self, client: TestClient, test_user_token: str
    ):
        """존재하지 않는 상담 ID로 후기 작성 시도"""
        import uuid
        
        response = client.post(
            "/api/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(uuid.uuid4()),  # 존재하지 않는 ID
                "rating": 5,
                "comment": "테스트 후기",
            },
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_review_unauthorized(
        self,
        client: TestClient,
        test_completed_consultation: Consultation,
    ):
        """인증 없이 후기 작성 시도"""
        response = client.post(
            "/api/reviews",
            json={
                "consultation_id": str(test_completed_consultation.id),
                "rating": 5,
                "comment": "테스트 후기",
            },
        )

        assert response.status_code == 403  # HTTPBearer는 403 반환
        assert "Not authenticated" in response.json()["detail"]

    def test_create_review_invalid_rating(
        self,
        client: TestClient,
        test_user_token: str,
        test_completed_consultation: Consultation,
    ):
        """잘못된 rating 값 (범위 밖)"""
        # rating이 6인 경우
        response = client.post(
            "/api/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_completed_consultation.id),
                "rating": 6,  # 범위 초과
                "comment": "테스트 후기",
            },
        )

        assert response.status_code == 422
        
        # rating이 0인 경우
        response = client.post(
            "/api/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_completed_consultation.id),
                "rating": 0,  # 범위 미만
                "comment": "테스트 후기",
            },
        )

        assert response.status_code == 422

    def test_create_review_missing_fields(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """필수 필드 누락 시 후기 작성 시도"""
        response = client.post(
            "/api/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "rating": 5,
                # consultation_id 누락
            },
        )

        assert response.status_code == 422
        assert "Field required" in response.json()["detail"][0]["msg"]

    def test_create_review_rating_updates_average(
        self,
        client: TestClient,
        test_user_token: str,
        test_completed_consultation: Consultation,
        db: Session,
    ):
        """후기 작성 시 전문가 평균 평점 업데이트 확인"""
        # 첫 번째 후기: 5점
        response1 = client.post(
            "/api/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_completed_consultation.id),
                "rating": 5,
                "comment": "첫 번째 후기",
            },
        )
        assert response1.status_code == 201
        
        db.refresh(test_completed_consultation.consultant)
        assert test_completed_consultation.consultant.total_reviews == 1
        assert test_completed_consultation.consultant.average_rating == Decimal("5.00")


class TestGetConsultantReviews:
    """후기 목록 조회 API 테스트"""

    def test_get_consultant_reviews_success(
        self,
        client: TestClient,
        test_consultant: Consultant,
        test_completed_consultation: Consultation,
        db: Session,
        test_user_token: str,
    ):
        """전문가별 후기 목록 조회 성공"""
        # 후기 3개 생성
        for i, rating in enumerate([5, 4, 3]):
            if i == 0:
                review = Review(
                    consultation_id=test_completed_consultation.id,
                    reviewer_id=test_completed_consultation.user_id,
                    consultant_id=test_consultant.id,
                    rating=rating,
                    comment=f"후기 {i+1}",
                )
            else:
                # 추가 상담 생성
                consultation = Consultation(
                    user_id=test_completed_consultation.user_id,
                    consultant_id=test_consultant.id,
                    consultation_type="visa",
                    content=f"상담 {i+1}",
                    consultation_method="email",
                    amount=Decimal("50000.00"),
                    status="completed",
                    payment_status="completed",
                )
                db.add(consultation)
                db.commit()
                db.refresh(consultation)
                review = Review(
                    consultation_id=consultation.id,
                    reviewer_id=test_completed_consultation.user_id,
                    consultant_id=test_consultant.id,
                    rating=rating,
                    comment=f"후기 {i+1}",
                )
            db.add(review)
            db.commit()

        # 후기 목록 조회
        response = client.get(
            f"/api/consultants/{test_consultant.id}/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        
        # 최신순 정렬 확인 (created_at 내림차순)
        created_dates = [review["created_at"] for review in data]
        assert created_dates == sorted(created_dates, reverse=True)

    def test_get_consultant_reviews_with_pagination(
        self,
        client: TestClient,
        test_consultant: Consultant,
        test_completed_consultation: Consultation,
        db: Session,
        test_user_token: str,
    ):
        """페이지네이션 테스트"""
        # 후기 5개 생성
        for i in range(5):
            consultation = Consultation(
                user_id=test_completed_consultation.user_id,
                consultant_id=test_consultant.id,
                consultation_type="visa",
                content=f"상담 {i+1}",
                consultation_method="email",
                amount=Decimal("50000.00"),
                status="completed",
                payment_status="completed",
            )
            db.add(consultation)
            db.commit()
            db.refresh(consultation)

            review = Review(
                consultation_id=consultation.id,
                reviewer_id=test_completed_consultation.user_id,
                consultant_id=test_consultant.id,
                rating=5,
                comment=f"후기 {i+1}",
            )
            db.add(review)
            db.commit()

        # limit=2, offset=0
        response = client.get(
            f"/api/consultants/{test_consultant.id}/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"limit": 2, "offset": 0},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

        # limit=2, offset=2
        response = client.get(
            f"/api/consultants/{test_consultant.id}/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"limit": 2, "offset": 2},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_get_consultant_reviews_empty(
        self,
        client: TestClient,
        test_consultant: Consultant,
        test_user_token: str,
    ):
        """후기가 없는 전문가의 후기 목록 조회"""
        response = client.get(
            f"/api/consultants/{test_consultant.id}/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_consultant_reviews_invalid_consultant(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """존재하지 않는 전문가 ID로 후기 목록 조회"""
        import uuid
        
        response = client.get(
            f"/api/consultants/{uuid.uuid4()}/reviews",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_consultant_reviews_unauthorized(
        self,
        client: TestClient,
        test_consultant: Consultant,
    ):
        """인증 없이 후기 목록 조회 시도"""
        response = client.get(
            f"/api/consultants/{test_consultant.id}/reviews",
        )

        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]

