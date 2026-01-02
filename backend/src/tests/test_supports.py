"""Tests for Government Supports API"""

import pytest
from fastapi import status
from datetime import date, timedelta
from uuid import uuid4
import json

from ..models.government_support import GovernmentSupport
from ..models.user import User
from ..schemas.government_support import GovernmentSupportResponse
from ..utils.auth import hash_password, create_access_token
from sqlalchemy.orm import Session


class TestGetSupports:
    """정부 지원 목록 조회 테스트"""

    @pytest.fixture(autouse=True)
    def setup_supports(self, db):
        """테스트용 정부 지원 데이터 생성"""
        today = date.today()
        tomorrow = today + timedelta(days=1)

        # Subsidy (장려금)
        subsidy1 = GovernmentSupport(
            title="외국인 장려금 지원",
            category="subsidy",
            description="외국인 근로자에게 주는 장려금",
            eligibility="재외동포 90일 이상 체류자",
            eligible_visa_types=json.dumps(["E-1", "E-2", "F-2"]),
            support_content="월 30만원 지급 (최대 6개월)",
            department="고용노동부",
            department_phone="02-1234-5678",
            department_website="https://www.moel.go.kr",
            application_period_start=today,
            application_period_end=tomorrow,
            official_link="https://apply.moel.go.kr/subsidy1",
            status="active",
        )

        subsidy2 = GovernmentSupport(
            title="주거 안정 자금 지원",
            category="subsidy",
            description="주거 안정을 위한 자금 지원",
            eligibility="만 5세 미만 자녀가 있는 외국인 근로자",
            eligible_visa_types=json.dumps(["E-1", "E-2"]),
            support_content="1회 100만원 지급",
            department="중소벤처기업부",
            department_phone="042-123-4567",
            department_website="https://www.mss.go.kr",
            application_period_start=today,
            application_period_end=tomorrow,
            official_link="https://www.mss.go.kr/apply",
            status="active",
        )

        # Education (교육)
        education1 = GovernmentSupport(
            title="한국어 교육 프로그램",
            category="education",
            description="외국인을 위한 한국어 무료 교육",
            eligibility="체류 기간 6개월 이상 외국인",
            eligible_visa_types=json.dumps(["E-1", "E-2", "F-2", "D-2"]),
            support_content="총 60시간 교육 제공",
            department="고용노동부",
            department_phone="02-1234-5678",
            department_website="https://www.moel.go.kr",
            application_period_start=today,
            application_period_end=tomorrow,
            official_link="https://www.moel.go.kr/korean",
            status="active",
        )

        # Training (훈련)
        training1 = GovernmentSupport(
            title="직업 훈련 프로그램",
            category="training",
            description="취업을 위한 직무 훈련",
            eligibility="재외동포 체류자",
            eligible_visa_types=json.dumps(["E-1", "E-2"]),
            support_content="최대 800시간 훈련 지원",
            department="고용노동부",
            department_phone="02-1234-5678",
            department_website="https://www.moel.go.kr",
            application_period_start=today,
            application_period_end=tomorrow,
            official_link="https://www.moel.go.kr/training",
            status="active",
        )

        # Inactive 지원
        inactive1 = GovernmentSupport(
            title="비활성 장려금",
            category="subsidy",
            description="비활성 상태 장려금",
            eligibility="테스트 대상",
            eligible_visa_types=json.dumps(["E-1"]),
            support_content="테스트 지원금",
            department="고용노동부",
            department_phone="02-1234-5678",
            department_website="https://www.moel.go.kr",
            application_period_start=today,
            application_period_end=tomorrow,
            official_link="https://test.com",
            status="inactive",
        )

        # Ended 지원
        ended1 = GovernmentSupport(
            title="종료된 장려금",
            category="subsidy",
            description="종료된 장려금",
            eligibility="테스트 대상",
            eligible_visa_types=json.dumps(["E-1"]),
            support_content="종료된 지원금",
            department="고용노동부",
            department_phone="02-1234-5678",
            department_website="https://www.moel.go.kr",
            application_period_start=today - timedelta(days=30),
            application_period_end=today - timedelta(days=15),
            official_link="https://test.com",
            status="ended",
        )

        db.add_all([subsidy1, subsidy2, education1, training1, inactive1, ended1])
        db.commit()

    def test_get_supports_success(self, client, test_user_token):
        """정부 지원 목록 조회 성공"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get("/api/supports", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # 기본적으로 active 상태만 조회
        supports = data["supports"]
        assert len(supports) == 4  # inactive와 ended는 제외
        assert data["total"] == 4
        assert all(s["status"] == "active" for s in supports)

    def test_get_supports_with_category_filter(self, client, test_user_token):
        """카테고리 필터링 테스트"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # subsidy 카테고리 필터
        response = client.get(
            "/api/supports?category=subsidy",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 2
        assert all(s["category"] == "subsidy" for s in supports)

        # education 카테고리 필터
        response = client.get(
            "/api/supports?category=education",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 1
        assert supports[0]["category"] == "education"

        # training 카테고리 필터
        response = client.get(
            "/api/supports?category=training",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 1
        assert supports[0]["category"] == "training"

    def test_get_supports_with_keyword_search(self, client, test_user_token):
        """키워드 검색 테스트"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # "장려금" 키워드로 검색 (1개만 매칭됨)
        response = client.get(
            "/api/supports?keyword=장려금",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 1  # "외국인 장려금 지원"만 매칭됨
        assert "장려금" in supports[0]["title"]

    def test_get_supports_with_multiple_filters(self, client, test_user_token):
        """다중 필터 테스트 (카테고리 + 키워드)"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = client.get(
            "/api/supports?category=subsidy&keyword=주거",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 1
        assert supports[0]["category"] == "subsidy"
        assert "주거" in supports[0]["title"]

    def test_get_supports_with_pagination(self, client, test_user_token):
        """페이지네이션 테스트"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # 첫 페이지 (limit=2)
        response = client.get(
            "/api/supports?limit=2&offset=0",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 2
        assert data["total"] == 4

        # 두 번째 페이지
        response = client.get(
            "/api/supports?limit=2&offset=2",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 2
        assert data["total"] == 4

        # 중복 없는지 확인
        first_page_ids = set(s["id"] for s in client.get("/api/supports?limit=2&offset=0", headers=headers).json()["supports"])
        second_page_ids = set(s["id"] for s in client.get("/api/supports?limit=2&offset=2", headers=headers).json()["supports"])
        assert first_page_ids.intersection(second_page_ids) == set()

    def test_get_supports_empty(self, client, test_user_token):
        """조건에 맞는 지원이 없는 경우"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = client.get(
            "/api/supports?keyword=존재하지않는키워드",
            headers=headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        supports = data["supports"]
        assert len(supports) == 0
        assert data["total"] == 0

    def test_get_supports_unauthorized(self, client):
        """인증 없이 접근 시 403"""
        response = client.get("/api/supports")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestGetSupportDetail:
    """정부 지원 상세 조회 테스트"""

    @pytest.fixture(autouse=True)
    def setup_support(self, db):
        """테스트용 정부 지원 데이터 생성"""
        today = date.today()
        tomorrow = today + timedelta(days=1)

        # Active 지원
        active_support = GovernmentSupport(
            title="외국인 장려금 지원",
            category="subsidy",
            description="외국인 근로자에게 주는 장려금",
            eligibility="재외동포 90일 이상 체류자",
            eligible_visa_types=json.dumps(["E-1", "E-2", "F-2"]),
            support_content="월 30만원 지급 (최대 6개월)",
            department="고용노동부",
            department_phone="02-1234-5678",
            department_website="https://www.moel.go.kr",
            application_period_start=today,
            application_period_end=tomorrow,
            official_link="https://apply.moel.go.kr/subsidy1",
            status="active",
        )

        db.add(active_support)
        db.commit()
        db.refresh(active_support)

        # 테스트에서 사용할 수 있도록 저장
        self.active_support_id = str(active_support.id)

    @pytest.fixture
    def support_id(self):
        """테스트용 지원 ID 반환"""
        return self.active_support_id

    def test_get_support_detail_success(self, client, test_user_token, support_id):
        """지원 상세 조회 성공"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = client.get(f"/api/supports/{support_id}", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # 모든 필드 확인
        assert "id" in data
        assert "title" in data
        assert "category" in data
        assert "description" in data
        assert "eligibility" in data
        assert "eligible_visa_types" in data
        assert "support_content" in data
        assert "department" in data
        assert "department_phone" in data
        assert "department_website" in data
        assert "application_period_start" in data
        assert "application_period_end" in data
        assert "official_link" in data
        assert "status" in data

    def test_get_support_detail_with_inactive_status(self, client, test_user_token, db):
        """비활성 지원도 조회 가능"""
        from ..models.government_support import GovernmentSupport
        import json
        from datetime import date, timedelta
        
        # inactive 상태 지원 생성
        inactive_support = GovernmentSupport(
            title="비활성 지원",
            category="subsidy",
            description="테스트",
            eligibility="테스트",
            eligible_visa_types=json.dumps(["E-1"]),
            department="고용노동부",
            status="inactive",
        )
        db.add(inactive_support)
        db.commit()
        db.refresh(inactive_support)
        
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = client.get(f"/api/supports/{inactive_support.id}", headers=headers)

        # inactive 상태도 조회 가능
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "inactive"

    def test_get_support_detail_not_found(self, client, test_user_token):
        """존재하지 않는 지원 조회 시 404"""
        from uuid import uuid4
        
        headers = {"Authorization": f"Bearer {test_user_token}"}
        fake_id = str(uuid4())
        
        response = client.get(f"/api/supports/{fake_id}", headers=headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_support_detail_unauthorized(self, client):
        """인증 없이 접근 시 403"""
        response = client.get(f"/api/supports/test-id")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestAdminSupportManagement:
    """관리자 정부 지원 정보 관리 테스트"""

    @pytest.fixture
    def admin_user(self, db: Session):
        """관리자 사용자 생성"""
        admin = User(
            email="admin@example.com",
            password_hash=hash_password("Admin123!@#"),
            first_name="Admin",
            last_name="User",
            nationality="KR",
            role="admin",
            preferred_language="ko",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

    @pytest.fixture
    def admin_token(self, admin_user: User):
        """관리자 토큰 생성"""
        return create_access_token(data={"sub": admin_user.email, "user_id": str(admin_user.id)})

    @pytest.fixture
    def test_support(self, db: Session):
        """테스트용 정부 지원 생성"""
        today = date.today()
        tomorrow = today + timedelta(days=1)
        
        support = GovernmentSupport(
            title="테스트 장려금",
            category="subsidy",
            description="테스트용 장려금",
            eligibility="재외동포 90일 이상",
            eligible_visa_types=json.dumps(["E-1", "E-2"]),
            support_content="월 30만원 지급",
            department="고용노동부",
            application_period_start=today,
            application_period_end=tomorrow,
            status="active",
        )
        db.add(support)
        db.commit()
        db.refresh(support)
        return support

    def test_create_support_as_admin(self, client, admin_token, db: Session):
        """관리자가 정부 지원 생성"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        payload = {
            "title": "신규 장려금",
            "category": "subsidy",
            "description": "신규 장려금 프로그램",
            "eligibility": "재외동포 90일 이상 체류자",
            "eligible_visa_types": ["E-1", "E-2", "F-2"],
            "support_content": "월 50만원 지급 (최대 12개월)",
            "department": "고용노동부",
            "department_phone": "02-1234-5678",
            "department_website": "https://www.moel.go.kr",
            "application_period_start": date.today().isoformat(),
            "application_period_end": (date.today() + timedelta(days=30)).isoformat(),
            "official_link": "https://apply.moel.go.kr/new",
            "status": "active",
        }
        
        response = client.post("/api/supports", json=payload, headers=headers)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert data["title"] == payload["title"]
        assert data["category"] == payload["category"]
        assert data["status"] == "active"
        assert "id" in data

    def test_create_support_as_regular_user(self, client, test_user_token):
        """일반 사용자는 정부 지원 생성 불가"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        payload = {
            "title": "장려금",
            "category": "subsidy",
            "description": "테스트",
            "department": "고용노동부",
            "status": "active",
        }
        
        response = client.post("/api/supports", json=payload, headers=headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_support_as_admin(self, client, admin_token, test_support, db: Session):
        """관리자가 정부 지원 수정"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        payload = {
            "title": "수정된 장려금",
            "category": "subsidy",
            "description": "수정된 설명",
            "eligibility": "재외동포 180일 이상",
            "eligible_visa_types": ["E-1"],
            "support_content": "월 40만원 지급",
            "department": "고용노동부",
            "status": "active",
        }
        
        response = client.put(f"/api/supports/{test_support.id}", json=payload, headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["title"] == payload["title"]
        assert data["description"] == payload["description"]
        assert data["eligibility"] == payload["eligibility"]

    def test_update_support_as_regular_user(self, client, test_user_token, test_support):
        """일반 사용자는 정부 지원 수정 불가"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        payload = {"title": "수정된 제목"}
        
        response = client.put(f"/api/supports/{test_support.id}", json=payload, headers=headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_support_as_admin(self, client, admin_token, test_support, db: Session):
        """관리자가 정부 지원 삭제"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = client.delete(f"/api/supports/{test_support.id}", headers=headers)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # 삭제 확인
        deleted_support = db.query(GovernmentSupport).filter(
            GovernmentSupport.id == test_support.id
        ).first()
        assert deleted_support is None

    def test_delete_support_as_regular_user(self, client, test_user_token, test_support):
        """일반 사용자는 정부 지원 삭제 불가"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = client.delete(f"/api/supports/{test_support.id}", headers=headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_nonexistent_support(self, client, admin_token):
        """존재하지 않는 지원 수정 시 404"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        fake_id = str(uuid4())
        payload = {"title": "수정"}
        
        response = client.put(f"/api/supports/{fake_id}", json=payload, headers=headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_nonexistent_support(self, client, admin_token):
        """존재하지 않는 지원 삭제 시 404"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        fake_id = str(uuid4())
        response = client.delete(f"/api/supports/{fake_id}", headers=headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_support_invalid_category(self, client, admin_token):
        """잘못된 카테고리로 생성 시 400"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        payload = {
            "title": "장려금",
            "category": "invalid_category",
            "description": "테스트",
            "department": "고용노동부",
            "status": "active",
        }
        
        response = client.post("/api/supports", json=payload, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_support_invalid_status(self, client, admin_token):
        """잘못된 상태로 생성 시 400"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        payload = {
            "title": "장려금",
            "category": "subsidy",
            "description": "테스트",
            "department": "고용노동부",
            "status": "invalid_status",
        }
        
        response = client.post("/api/supports", json=payload, headers=headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
