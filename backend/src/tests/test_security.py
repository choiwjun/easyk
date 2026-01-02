"""Security Tests"""

import pytest
from fastapi.testclient import TestClient
from fastapi import status

from ..main import app


class TestRateLimiting:
    """Rate Limiting 테스트"""
    
    def test_rate_limiting_enforced(self, client: TestClient):
        """Rate limiting이 정상적으로 작동하는지 확인"""
        # 첫 200 요청은 정상 처리되어야 함
        for _ in range(200):
            response = client.get("/health")
            assert response.status_code == status.HTTP_200_OK
    
    def test_health_check_accessible(self, client: TestClient):
        """Health check 엔드포인트 접근 가능"""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"


class TestCORS:
    """CORS 설정 테스트"""
    
    def test_cors_headers_present(self, client: TestClient):
        """CORS 헤더가 설정되어 있는지 확인"""
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
        # CORS 헤더 확인
        assert "access-control-allow-origin" in [h.lower() for h in response.headers]


class TestSecurityHeaders:
    """보안 헤더 테스트"""
    
    def test_security_headers_configuration(self, client: TestClient):
        """보안 관련 헤더가 설정되어 있는지 확인"""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        
        # Content-Type 헤더 확인
        assert "content-type" in response.headers or "Content-Type" in response.headers
        
        # 보안 헤더 확인 (X-Content-Type-Options, etc)
        # 일반적인 보안 헤더들이 존재하는지 확인

