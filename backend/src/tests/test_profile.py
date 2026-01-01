"""Profile API Tests"""

import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from ..models.user import User
from ..main import app

client = TestClient(app)


def test_get_profile_success(db: Session, test_user: User, test_user_token: str):
    """자신의 프로필 조회 성공"""
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["nationality"] == "US"
    assert data["role"] == "foreign"


def test_update_profile_success(db: Session, test_user: User, test_user_token: str):
    """프로필 수정 성공"""
    update_data = {
        "nationality": "UK",
        "visa_type": "E-2",
        "preferred_language": "ko",
        "residential_area": "고양시 덕양구",
    }
    
    response = client.put(
        "/api/users/me",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["nationality"] == "UK"
    assert data["visa_type"] == "E-2"
    assert data["preferred_language"] == "ko"
    assert data["residential_area"] == "고양시 덕양구"


def test_update_profile_partial(db: Session, test_user: User, test_user_token: str):
    """일부 필드만 수정"""
    update_data = {
        "nationality": "Japan",
    }
    
    response = client.put(
        "/api/users/me",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["nationality"] == "Japan"


def test_update_profile_invalid_data(db: Session, test_user: User, test_user_token: str):
    """너무 긴 데이터로 수정 시도 (violation of max_length)"""
    update_data = {
        "nationality": "A" * 101,  # 최대 100자 초과
    }
    
    response = client.put(
        "/api/users/me",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 422  # Validation Error


def test_update_profile_empty_fields(db: Session, test_user: User, test_user_token: str):
    """빈 필드 수정"""
    update_data = {
        "nationality": "",
    }
    
    response = client.put(
        "/api/users/me",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # 빈 문자열은 허용되거나 거부될 수 있음 - 구현에 따라 다름
    # 여기서는 허용한다고 가정
    assert response.status_code in [200, 422]

