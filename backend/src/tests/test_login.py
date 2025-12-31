"""Login API Tests"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from ..main import app
from ..database import Base, get_db
from ..models.user import User
from ..utils.auth import hash_password


# SQLite 인메모리 데이터베이스 설정
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
    """테스트 클라이언트 생성"""
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(client):
    """테스트용 사용자 생성"""
    db = TestingSessionLocal()
    try:
        user = User(
            email="testuser@example.com",
            password_hash=hash_password("SecurePass123!"),
            first_name="Test",
            last_name="User",
            nationality="Korea",
            role="foreign",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        yield user
    finally:
        db.close()


class TestLogin:
    """로그인 API 테스트"""

    def test_login_success(self, client, test_user):
        """유효한 자격 증명으로 로그인 성공"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "SecurePass123!",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0

    def test_login_invalid_password(self, client, test_user):
        """잘못된 비밀번호로 로그인 시도"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "WrongPassword123!",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "incorrect" in data["detail"].lower() or "invalid" in data["detail"].lower()

    def test_login_nonexistent_user(self, client):
        """존재하지 않는 사용자로 로그인 시도"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SomePassword123!",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "incorrect" in data["detail"].lower() or "invalid" in data["detail"].lower()

    def test_login_missing_email(self, client):
        """이메일 누락 시 검증"""
        response = client.post(
            "/api/auth/login",
            json={
                "password": "SecurePass123!",
            },
        )

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_login_missing_password(self, client, test_user):
        """비밀번호 누락 시 검증"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "testuser@example.com",
            },
        )

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_login_invalid_email_format(self, client):
        """잘못된 이메일 형식으로 로그인 시도"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "invalid-email",
                "password": "SecurePass123!",
            },
        )

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
