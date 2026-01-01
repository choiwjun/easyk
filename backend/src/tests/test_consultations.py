"""Consultation API Tests"""

import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ..models.user import User
from ..models.consultant import Consultant


@pytest.fixture
def test_consultant(db: Session, test_user: User):
    """테스트용 전문가 생성"""
    consultant = Consultant(
        user_id=test_user.id,
        office_name="법률사무소 ABC",
        specialties=json.dumps(["visa", "labor"]),  # JSON 문자열로 저장
        hourly_rate=100000.00,
        total_reviews=0,
        average_rating=0.0,
        availability="월-금 9:00-18:00",
        max_consultations_per_day=5,
        is_active=True,
        is_verified=True,
    )
    db.add(consultant)
    db.commit()
    db.refresh(consultant)
    return consultant


class TestCreateConsultation:
    """상담 신청 생성 API 테스트"""

    def test_create_consultation_success(self, client: TestClient, test_user_token: str):
        """유효한 데이터로 상담 신청 성공"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "visa",
                "content": "F-2 비자 연장 관련 상담을 원합니다.",
                "consultation_method": "email",
                "amount": 50000.00,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["consultation_type"] == "visa"
        assert data["content"] == "F-2 비자 연장 관련 상담을 원합니다."
        assert data["status"] == "requested"
        assert data["payment_status"] == "pending"
        assert "id" in data
        assert "created_at" in data

    def test_create_consultation_invalid_type(self, client: TestClient, test_user_token: str):
        """잘못된 상담 유형으로 신청 시 422 에러"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "invalid_type",
                "content": "상담 내용",
                "consultation_method": "email",
                "amount": 50000.00,
            },
        )

        assert response.status_code == 422

    def test_create_consultation_missing_content(self, client: TestClient, test_user_token: str):
        """상담 내용 누락 시 422 에러"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "visa",
                "consultation_method": "email",
                "amount": 50000.00,
            },
        )

        assert response.status_code == 422

    def test_create_consultation_unauthorized(self, client: TestClient):
        """인증 없이 상담 신청 시 403 에러 (HTTPBearer)"""
        response = client.post(
            "/api/consultations",
            json={
                "consultation_type": "visa",
                "content": "상담 내용",
                "consultation_method": "email",
                "amount": 50000.00,
            },
        )

        assert response.status_code == 403

    def test_create_consultation_missing_amount(self, client: TestClient, test_user_token: str):
        """상담료 누락 시 422 에러"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "visa",
                "content": "상담 내용",
                "consultation_method": "email",
            },
        )

        assert response.status_code == 422

    def test_create_consultation_invalid_method(self, client: TestClient, test_user_token: str):
        """잘못된 상담 방법 시 422 에러"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "visa",
                "content": "상담 내용",
                "consultation_method": "invalid_method",
                "amount": 50000.00,
            },
        )

        assert response.status_code == 422

    def test_create_consultation_negative_amount(self, client: TestClient, test_user_token: str):
        """음수 상담료로 신청 시 422 에러"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "visa",
                "content": "상담 내용",
                "consultation_method": "email",
                "amount": -10000.00,
            },
        )

        assert response.status_code == 422


class TestConsultationMatching:
    """상담 신청 시 자동 매칭 테스트"""

    def test_create_consultation_with_matching(
        self, client: TestClient, test_user_token: str, test_consultant: Consultant
    ):
        """전문가가 있을 때 자동 매칭되어 상태가 'matched'로 설정"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "visa",
                "content": "F-2 비자 연장 관련 상담을 원합니다.",
                "consultation_method": "email",
                "amount": 50000.00,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "matched"
        assert data["consultant_id"] is not None
        assert data["consultant_id"] == str(test_consultant.id)

    def test_create_consultation_without_matching(
        self, client: TestClient, test_user_token: str
    ):
        """일치하는 전문가가 없을 때 상태가 'requested'로 유지"""
        response = client.post(
            "/api/consultations",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_type": "business",  # 전문가가 없는 분야
                "content": "사업 관련 상담을 원합니다.",
                "consultation_method": "email",
                "amount": 50000.00,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "requested"
        assert data["consultant_id"] is None


class TestGetIncomingConsultations:
    """전문가의 상담 요청 목록 조회 API 테스트"""

    def test_get_incoming_consultations_success(
        self, client: TestClient, db: Session, test_user: User, test_consultant: Consultant
    ):
        """전문가가 자신에게 매칭된 상담 목록 조회 성공"""
        # 전문가 계정으로 토큰 생성
        from ..utils.auth import create_access_token
        consultant_token = create_access_token({"sub": test_user.email})

        # 매칭된 상담 3개 생성
        from ..models.consultation import Consultation
        for i in range(3):
            consultation = Consultation(
                user_id=test_user.id,
                consultant_id=test_consultant.id,
                consultation_type="visa",
                content=f"상담 내용 {i+1}",
                consultation_method="email",
                amount=50000.00,
                status="matched",
                payment_status="pending",
            )
            db.add(consultation)
        db.commit()

        response = client.get(
            "/api/consultations/incoming",
            headers={"Authorization": f"Bearer {consultant_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all(item["consultant_id"] == str(test_consultant.id) for item in data)

    def test_get_incoming_consultations_filtered_by_status(
        self, client: TestClient, db: Session, test_user: User, test_consultant: Consultant
    ):
        """상태별 필터링 테스트"""
        from ..utils.auth import create_access_token
        from ..models.consultation import Consultation

        consultant_token = create_access_token({"sub": test_user.email})

        # 다양한 상태의 상담 생성
        statuses = ["matched", "scheduled", "completed"]
        for status in statuses:
            consultation = Consultation(
                user_id=test_user.id,
                consultant_id=test_consultant.id,
                consultation_type="visa",
                content=f"상담 내용 - {status}",
                consultation_method="email",
                amount=50000.00,
                status=status,
                payment_status="pending",
            )
            db.add(consultation)
        db.commit()

        # matched 상태만 필터링
        response = client.get(
            "/api/consultations/incoming?status=matched",
            headers={"Authorization": f"Bearer {consultant_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "matched"

    def test_get_incoming_consultations_empty(
        self, client: TestClient, test_user_token: str
    ):
        """전문가가 아닌 사용자는 빈 목록 반환"""
        response = client.get(
            "/api/consultations/incoming",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_incoming_consultations_unauthorized(self, client: TestClient):
        """인증 없이 조회 시 403 에러"""
        response = client.get("/api/consultations/incoming")

        assert response.status_code == 403


class TestConsultationAcceptReject:
    """전문가의 상담 수락/거절 API 테스트"""

    def test_accept_consultation_success(
        self, client: TestClient, db: Session, test_user: User, test_consultant: Consultant
    ):
        """전문가가 상담 수락 성공"""
        from ..utils.auth import create_access_token
        from ..models.consultation import Consultation

        consultant_token = create_access_token({"sub": test_user.email})

        # 매칭된 상담 생성
        consultation = Consultation(
            user_id=test_user.id,
            consultant_id=test_consultant.id,
            consultation_type="visa",
            content="상담 내용",
            consultation_method="email",
            amount=50000.00,
            status="matched",
            payment_status="pending",
        )
        db.add(consultation)
        db.commit()
        db.refresh(consultation)

        response = client.post(
            f"/api/consultations/{consultation.id}/accept",
            headers={"Authorization": f"Bearer {consultant_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "scheduled"
        assert data["id"] == str(consultation.id)

    def test_reject_consultation_success(
        self, client: TestClient, db: Session, test_user: User, test_consultant: Consultant
    ):
        """전문가가 상담 거절 성공"""
        from ..utils.auth import create_access_token
        from ..models.consultation import Consultation

        consultant_token = create_access_token({"sub": test_user.email})

        # 매칭된 상담 생성
        consultation = Consultation(
            user_id=test_user.id,
            consultant_id=test_consultant.id,
            consultation_type="visa",
            content="상담 내용",
            consultation_method="email",
            amount=50000.00,
            status="matched",
            payment_status="pending",
        )
        db.add(consultation)
        db.commit()
        db.refresh(consultation)

        response = client.post(
            f"/api/consultations/{consultation.id}/reject",
            headers={"Authorization": f"Bearer {consultant_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cancelled"
        assert data["consultant_id"] is None

    def test_accept_consultation_not_assigned(
        self, client: TestClient, db: Session, test_user: User, test_consultant: Consultant
    ):
        """다른 전문가의 상담 수락 시도 시 403 에러"""
        from ..utils.auth import create_access_token
        from ..models.consultation import Consultation

        # 다른 전문가를 위한 사용자 생성
        other_user = User(
            email="other@example.com",
            password_hash="hashed",
            role="foreign",
            first_name="Other",
            last_name="User",
        )
        db.add(other_user)
        db.commit()
        db.refresh(other_user)

        other_consultant = Consultant(
            user_id=other_user.id,
            office_name="다른 법률사무소",
            specialties=json.dumps(["labor"]),
            hourly_rate=100000.00,
            total_reviews=0,
            average_rating=0.0,
            availability="월-금 9:00-18:00",
            max_consultations_per_day=5,
            is_active=True,
            is_verified=True,
        )
        db.add(other_consultant)
        db.commit()

        # 다른 전문가에게 매칭된 상담 생성
        consultation = Consultation(
            user_id=test_user.id,
            consultant_id=other_consultant.id,
            consultation_type="labor",
            content="상담 내용",
            consultation_method="email",
            amount=50000.00,
            status="matched",
            payment_status="pending",
        )
        db.add(consultation)
        db.commit()
        db.refresh(consultation)

        # test_user의 토큰으로 다른 전문가의 상담 수락 시도
        consultant_token = create_access_token({"sub": test_user.email})

        response = client.post(
            f"/api/consultations/{consultation.id}/accept",
            headers={"Authorization": f"Bearer {consultant_token}"},
        )

        assert response.status_code == 403

    def test_accept_consultation_not_found(
        self, client: TestClient, test_user_token: str
    ):
        """존재하지 않는 상담 수락 시도 시 404 에러"""
        import uuid
        fake_id = uuid.uuid4()

        response = client.post(
            f"/api/consultations/{fake_id}/accept",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 404

    def test_accept_consultation_unauthorized(self, client: TestClient):
        """인증 없이 상담 수락 시도 시 403 에러"""
        import uuid
        fake_id = uuid.uuid4()

        response = client.post(f"/api/consultations/{fake_id}/accept")

        assert response.status_code == 403
