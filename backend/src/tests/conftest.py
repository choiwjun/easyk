"""Common test fixtures and configuration"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from ..main import app
from ..database import Base, get_db
from ..models.user import User
from ..utils.auth import hash_password, create_access_token


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


@pytest.fixture(scope="function")
def setup_database():
    """데이터베이스 설정 및 정리"""
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client(setup_database):
    """테스트 클라이언트 픽스처"""
    return TestClient(app)


@pytest.fixture
def db(setup_database):
    """테스트용 DB 세션 픽스처"""
    session = TestingSessionLocal()
    yield session
    session.close()


@pytest.fixture
def test_user(db: Session):
    """테스트용 사용자 생성"""
    user = User(
        email="test@example.com",
        password_hash=hash_password("Test123!@#"),
        first_name="John",
        last_name="Doe",
        nationality="US",
        role="foreign",
        visa_type="E-1",
        preferred_language="en",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user: User):
    """테스트용 사용자 토큰 생성"""
    return create_access_token(data={"sub": test_user.email, "user_id": str(test_user.id)})

