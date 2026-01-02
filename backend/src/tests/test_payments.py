"""Payment API Tests"""

import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timezone

from ..models.user import User
from ..models.consultant import Consultant
from ..models.consultation import Consultation
from ..models.payment import Payment


@pytest.fixture
def test_consultant(db: Session, test_user: User):
    """테스트용 전문가 생성"""
    consultant = Consultant(
        user_id=test_user.id,
        office_name="법률사무소 ABC",
        specialties=json.dumps(["visa", "labor"]),
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


@pytest.fixture
def test_consultation(db: Session, test_user: User, test_consultant: Consultant):
    """테스트용 상담 생성"""
    consultation = Consultation(
        user_id=test_user.id,
        consultant_id=test_consultant.id,
        consultation_type="visa",
        content="F-2 비자 연장 관련 상담을 원합니다.",
        consultation_method="email",
        amount=Decimal("50000.00"),
        status="scheduled",
        payment_status="pending",
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation


@pytest.fixture
def test_payment(db: Session, test_consultation: Consultation):
    """테스트용 결제 생성"""
    payment = Payment(
        consultation_id=test_consultation.id,
        user_id=test_consultation.user_id,
        amount=Decimal("50000.00"),
        platform_fee=Decimal("2500.00"),
        net_amount=Decimal("47500.00"),
        payment_method="toss",
        transaction_id="test_payment_key_123",
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


class TestCreatePayment:
    """결제 생성 API 테스트"""

    def test_create_payment_success(
        self,
        client: TestClient,
        test_user_token: str,
        test_consultation: Consultation,
    ):
        """유효한 데이터로 결제 생성 성공"""
        response = client.post(
            "/api/payments",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_consultation.id),
                "payment_method": "toss",
                "payment_key": "test_payment_key_123",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["consultation_id"] == str(test_consultation.id)
        assert data["payment_method"] == "toss"
        assert data["status"] == "pending"
        assert data["amount"] == "50000.00"
        # 플랫폼 수수료 5% 검증
        assert data["platform_fee"] == "2500.00"
        # 전문가 수익 95% 검증
        assert data["net_amount"] == "47500.00"

    def test_create_payment_duplicate(
        self,
        client: TestClient,
        test_user_token: str,
        test_consultation: Consultation,
        db: Session,
    ):
        """중복 결제 방지 (같은 상담에 대한 결제는 1개만 허용)"""
        from ..models.payment import Payment
        from decimal import Decimal

        # 첫 번째 결제 생성
        first_payment = Payment(
            consultation_id=test_consultation.id,
            user_id=test_consultation.user_id,
            amount=Decimal("50000.00"),
            platform_fee=Decimal("2500.00"),
            net_amount=Decimal("47500.00"),
            payment_method="toss",
            transaction_id="test_transaction_1",
            status="pending",
        )
        db.add(first_payment)
        db.commit()

        # 같은 상담에 대한 두 번째 결제 시도
        response = client.post(
            "/api/payments",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_consultation.id),
                "payment_method": "toss",
                "payment_key": "test_payment_key_456",
            },
        )

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower() or "duplicate" in response.json()["detail"].lower()

    def test_create_payment_invalid_consultation(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """존재하지 않는 상담에 대한 결제 생성 시도"""
        import uuid

        non_existent_id = str(uuid.uuid4())
        response = client.post(
            "/api/payments",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": non_existent_id,
                "payment_method": "toss",
                "payment_key": "test_payment_key_789",
            },
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_payment_unauthorized(
        self,
        client: TestClient,
        test_consultation: Consultation,
    ):
        """인증 없이 결제 생성 시도"""
        response = client.post(
            "/api/payments",
            json={
                "consultation_id": str(test_consultation.id),
                "payment_method": "toss",
                "payment_key": "test_payment_key_unauthorized",
            },
        )

        assert response.status_code == 403

    def test_create_payment_invalid_payment_method(
        self,
        client: TestClient,
        test_user_token: str,
        test_consultation: Consultation,
    ):
        """잘못된 결제 방식으로 결제 생성 시도"""
        response = client.post(
            "/api/payments",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "consultation_id": str(test_consultation.id),
                "payment_method": "invalid_method",
                "payment_key": "test_payment_key_invalid",
            },
        )

        assert response.status_code == 422

    def test_create_payment_missing_fields(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """필수 필드 누락으로 결제 생성 시도"""
        response = client.post(
            "/api/payments",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "payment_method": "toss",
                # consultation_id 누락
            },
        )

        assert response.status_code == 422


class TestPaymentCallback:
    """결제 완료 콜백 API 테스트"""

    def test_payment_callback_success(
        self,
        client: TestClient,
        test_payment: Payment,
        db: Session,
    ):
        """결제 완료 콜백 성공 - 결제 상태 및 상담 상태 업데이트"""
        # Mock 토스페이먼츠 응답 (실제로는 토스페이먼츠에서 호출)
        response = client.post(
            "/api/payments/callback",
            json={
                "paymentKey": test_payment.transaction_id,
                "orderId": str(test_payment.consultation_id),
                "status": "DONE",
            },
        )

        assert response.status_code == 200
        
        # DB에서 결제 상태 확인
        db.refresh(test_payment)
        assert test_payment.status == "completed"
        assert test_payment.paid_at is not None
        
        # 상담 상태 확인
        consultation = db.query(Consultation).filter(
            Consultation.id == test_payment.consultation_id
        ).first()
        assert consultation.payment_status == "completed"
        assert consultation.status == "scheduled"

    def test_payment_callback_invalid_payment(
        self,
        client: TestClient,
    ):
        """존재하지 않는 결제에 대한 콜백"""
        import uuid

        response = client.post(
            "/api/payments/callback",
            json={
                "paymentKey": "non_existent_payment_key",
                "orderId": str(uuid.uuid4()),
                "status": "DONE",
            },
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_payment_callback_already_completed(
        self,
        client: TestClient,
        test_payment: Payment,
        db: Session,
    ):
        """이미 완료된 결제에 대한 중복 콜백"""
        # 결제를 완료 상태로 변경
        test_payment.status = "completed"
        test_payment.paid_at = datetime.now(timezone.utc)
        db.commit()

        response = client.post(
            "/api/payments/callback",
            json={
                "paymentKey": test_payment.transaction_id,
                "orderId": str(test_payment.consultation_id),
                "status": "DONE",
            },
        )

        # 중복 콜백은 무시하거나 200 반환 (idempotent)
        assert response.status_code in [200, 400]
