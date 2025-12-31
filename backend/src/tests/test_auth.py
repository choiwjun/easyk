"""Authentication API Tests"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from ..main import app
from ..database import Base, get_db

# 테스트용 인메모리 SQLite 데이터베이스 설정
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """테스트용 DB 세션 오버라이드"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    """테스트 클라이언트 픽스처"""
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


class TestSignup:
    """회원가입 API 테스트"""

    def test_signup_success(self, client):
        """유효한 데이터로 회원가입 성공"""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!",
                "first_name": "John",
                "last_name": "Doe",
                "nationality": "USA",
                "role": "foreign",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["first_name"] == "John"
        assert data["last_name"] == "Doe"
        assert data["role"] == "foreign"
        assert "id" in data
        assert "password" not in data  # 비밀번호는 응답에 포함되지 않아야 함
        assert "password_hash" not in data

    def test_signup_invalid_email(self, client):
        """잘못된 이메일 형식으로 회원가입 시도"""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "invalid-email",
                "password": "SecurePass123!",
                "first_name": "John",
                "last_name": "Doe",
                "nationality": "USA",
                "role": "foreign",
            },
        )
        assert response.status_code == 422  # Validation Error
        data = response.json()
        assert "detail" in data

    def test_signup_duplicate_email(self, client):
        """중복 이메일로 회원가입 시도"""
        # 첫 번째 사용자 생성
        client.post(
            "/api/auth/signup",
            json={
                "email": "duplicate@example.com",
                "password": "SecurePass123!",
                "first_name": "John",
                "last_name": "Doe",
                "nationality": "USA",
                "role": "foreign",
            },
        )

        # 동일한 이메일로 두 번째 사용자 생성 시도
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "duplicate@example.com",
                "password": "AnotherPass456!",
                "first_name": "Jane",
                "last_name": "Smith",
                "nationality": "UK",
                "role": "foreign",
            },
        )
        assert response.status_code == 400  # Bad Request
        data = response.json()
        assert "detail" in data
        assert "already exists" in data["detail"].lower() or "duplicate" in data["detail"].lower()

    def test_signup_missing_required_fields(self, client):
        """필수 필드 누락 시 회원가입 실패"""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!",
                # first_name, last_name 누락
            },
        )
        assert response.status_code == 422  # Validation Error

    def test_signup_weak_password(self, client):
        """약한 비밀번호로 회원가입 시도"""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "test@example.com",
                "password": "123",  # 너무 짧은 비밀번호
                "first_name": "John",
                "last_name": "Doe",
                "nationality": "USA",
                "role": "foreign",
            },
        )
        assert response.status_code == 422  # Validation Error
