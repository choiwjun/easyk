"""JWT Authentication Middleware Tests"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from ..main import app
from ..database import Base, get_db
from ..models.user import User
from ..utils.auth import hash_password, create_access_token


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


@pytest.fixture
def valid_token(test_user):
    """유효한 JWT 토큰 생성"""
    token = create_access_token(data={"sub": test_user.email, "user_id": str(test_user.id)})
    return token


class TestJWTMiddleware:
    """JWT 인증 미들웨어 테스트"""

    def test_protected_route_with_valid_token(self, client, test_user, valid_token):
        """유효한 토큰으로 보호된 라우트 접근 성공"""
        response = client.get(
            "/api/users/me",
            headers={"Authorization": f"Bearer {valid_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["id"] == str(test_user.id)

    def test_protected_route_without_token(self, client):
        """토큰 없이 보호된 라우트 접근 시 401 에러"""
        response = client.get("/api/users/me")

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "not authenticated" in data["detail"].lower() or "credentials" in data["detail"].lower()

    def test_protected_route_with_invalid_token(self, client):
        """잘못된 토큰으로 보호된 라우트 접근 시 401 에러"""
        response = client.get(
            "/api/users/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_protected_route_with_expired_token(self, client, test_user):
        """만료된 토큰으로 보호된 라우트 접근 시 401 에러"""
        from datetime import timedelta

        # 만료된 토큰 생성 (음수 시간)
        expired_token = create_access_token(
            data={"sub": test_user.email, "user_id": str(test_user.id)},
            expires_delta=timedelta(minutes=-10)
        )

        response = client.get(
            "/api/users/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "expired" in data["detail"].lower() or "invalid" in data["detail"].lower()

    def test_protected_route_with_malformed_header(self, client, valid_token):
        """잘못된 형식의 Authorization 헤더로 접근 시 401 에러"""
        # "Bearer" 누락
        response = client.get(
            "/api/users/me",
            headers={"Authorization": valid_token}
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_protected_route_with_nonexistent_user(self, client):
        """존재하지 않는 사용자의 토큰으로 접근 시 401 에러"""
        # 존재하지 않는 이메일로 토큰 생성
        fake_token = create_access_token(
            data={"sub": "nonexistent@example.com", "user_id": "00000000-0000-0000-0000-000000000000"}
        )

        response = client.get(
            "/api/users/me",
            headers={"Authorization": f"Bearer {fake_token}"}
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
