"""Internationalization (i18n) Tests"""

import pytest
from fastapi.testclient import TestClient
from fastapi import status

from ..main import app
from ..tests.conftest import TestClient, db


class TestI18n:
    """다국어 지원 테스트"""
    
    def test_korean_error_messages(self, client: TestClient):
        """한국어 에러 메시지 반환 확인"""
        # 존재하지 않는 사용자 로그인 시도
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            },
            headers={"Accept-Language": "ko"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "detail" in data
        assert "이메일" in data["detail"] or "Invalid email or password" in data["detail"]
    
    def test_english_error_messages(self, client: TestClient):
        """영어 에러 메시지 반환 확인"""
        # 존재하지 않는 사용자 로그인 시도
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            },
            headers={"Accept-Language": "en"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "detail" in data
        # 영어 메시지 확인
        assert "Invalid email or password" in data["detail"] or "이메일" in data["detail"]
    
    def test_default_language_korean(self, client: TestClient):
        """Accept-Language 헤더가 없으면 한국어로 기본 설정"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        # 기본 언어로 응답
    
    def test_accept_language_parsing(self, client: TestClient):
        """다양한 Accept-Language 형식 파싱 확인"""
        # ko-KR 형식
        response1 = client.post(
            "/api/auth/login",
            json={
                "email": "test1@example.com",
                "password": "wrong"
            },
            headers={"Accept-Language": "ko-KR,ko;q=0.9"}
        )
        assert response1.status_code == status.HTTP_401_UNAUTHORIZED
        
        # en-US 형식
        response2 = client.post(
            "/api/auth/login",
            json={
                "email": "test2@example.com",
                "password": "wrong"
            },
            headers={"Accept-Language": "en-US,en;q=0.9"}
        )
        assert response2.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_unsupported_language_fallback(self, client: TestClient):
        """지원하지 않는 언어는 한국어로 폴백"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            },
            headers={"Accept-Language": "fr"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        # 지원하지 않는 언어는 한국어로 폴백


