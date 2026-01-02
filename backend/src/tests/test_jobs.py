"""Job API Tests"""

import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timedelta, timezone

from ..models.user import User
from ..models.job import Job
from ..models.job_application import JobApplication
from ..utils.auth import create_access_token


@pytest.fixture
def test_admin_user(db: Session):
    """테스트용 관리자 사용자 생성 (일자리 공고 작성자)"""
    from ..models.user import User
    from ..utils.auth import hash_password
    
    user = User(
        email="admin@example.com",
        password_hash=hash_password("Admin123!@#"),
        first_name="Admin",
        last_name="User",
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin_token(test_admin_user: User) -> str:
    """테스트용 관리자 JWT 토큰 생성"""
    return create_access_token(
        data={"sub": test_admin_user.email, "user_id": str(test_admin_user.id)}
    )


@pytest.fixture
def test_jobs(db: Session, test_admin_user: User):
    """테스트용 일자리 공고 생성"""
    jobs = []
    deadline = datetime.now(timezone.utc) + timedelta(days=30)
    
    # 다양한 조건의 일자리 공고 생성
    job1 = Job(
        posted_by=test_admin_user.id,
        position="웹 개발자",
        company_name="테크 회사 A",
        location="서울시 강남구",
        employment_type="full-time",
        salary_range="3,000만원~4,000만원",
        description="웹 애플리케이션 개발",
        requirements="Python, JavaScript 경험",
        status="active",
        deadline=deadline,
    )
    db.add(job1)
    
    job2 = Job(
        posted_by=test_admin_user.id,
        position="마케팅 담당자",
        company_name="마케팅 회사 B",
        location="서울시 서초구",
        employment_type="part-time",
        salary_range="2,000만원~2,500만원",
        description="디지털 마케팅 업무",
        status="active",
        deadline=deadline,
    )
    db.add(job2)
    
    job3 = Job(
        posted_by=test_admin_user.id,
        position="영어 강사",
        company_name="교육 회사 C",
        location="부산시 해운대구",
        employment_type="contract",
        salary_range="2,500만원~3,000만원",
        description="영어 회화 강의",
        status="closed",
        deadline=deadline - timedelta(days=1),
    )
    db.add(job3)
    
    db.commit()
    db.refresh(job1)
    db.refresh(job2)
    db.refresh(job3)
    
    jobs.extend([job1, job2, job3])
    return jobs


@pytest.fixture
def test_user_token(test_user: User) -> str:
    """테스트용 JWT 토큰 생성"""
    return create_access_token(
        data={"sub": test_user.email, "user_id": str(test_user.id)}
    )


class TestGetJobs:
    """일자리 목록 조회 API 테스트"""

    def test_get_jobs_success(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """일자리 목록 조회 성공 (기본: active 상태만)"""
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # active 상태인 일자리만 반환되어야 함
        assert len(data) == 2
        assert all(job["status"] == "active" for job in data)

    def test_get_jobs_with_location_filter(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """지역 필터링 테스트"""
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"location": "서울시 강남구"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["location"] == "서울시 강남구"
        assert data[0]["status"] == "active"

    def test_get_jobs_with_employment_type_filter(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """고용 형태 필터링 테스트"""
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"employment_type": "part-time"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["employment_type"] == "part-time"
        assert data[0]["status"] == "active"

    def test_get_jobs_with_keyword_search(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """키워드 검색 테스트 (position, company_name)"""
        # position 검색
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"keyword": "웹"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert "웹" in data[0]["position"]
        assert data[0]["status"] == "active"

        # company_name 검색
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"keyword": "마케팅"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert "마케팅" in data[0]["company_name"]
        assert data[0]["status"] == "active"

    def test_get_jobs_with_multiple_filters(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """다중 필터 조합 테스트"""
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={
                "location": "서울시",
                "employment_type": "full-time",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert "서울시" in data[0]["location"]
        assert data[0]["employment_type"] == "full-time"
        assert data[0]["status"] == "active"

    def test_get_jobs_with_pagination(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """페이지네이션 테스트"""
        # limit=1, offset=0
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"limit": 1, "offset": 0},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

        # limit=1, offset=1
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            params={"limit": 1, "offset": 1},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_get_jobs_empty(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """일자리가 없는 경우 빈 리스트 반환"""
        response = client.get(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_jobs_unauthorized(
        self,
        client: TestClient,
    ):
        """인증 없이 일자리 목록 조회 시도"""
        response = client.get("/api/jobs")

        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]


class TestGetJobDetail:
    """일자리 상세 조회 API 테스트"""

    def test_get_job_detail_success(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """일자리 상세 조회 성공"""
        job = test_jobs[0]  # active 상태인 첫 번째 일자리
        response = client.get(
            f"/api/jobs/{job.id}",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(job.id)
        assert data["position"] == job.position
        assert data["company_name"] == job.company_name
        assert data["location"] == job.location
        assert "has_applied" in data
        assert data["has_applied"] is False  # 아직 지원하지 않음

    def test_get_job_detail_with_application(
        self,
        client: TestClient,
        test_user_token: str,
        test_user: User,
        test_jobs: list[Job],
        db: Session,
    ):
        """이미 지원한 일자리 상세 조회 (has_applied=True)"""
        job = test_jobs[0]  # active 상태인 첫 번째 일자리
        
        # 지원 내역 생성
        application = JobApplication(
            job_id=job.id,
            user_id=test_user.id,
            status="applied",
            cover_letter="저는 열정적인 개발자입니다.",
        )
        db.add(application)
        db.commit()
        
        response = client.get(
            f"/api/jobs/{job.id}",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(job.id)
        assert data["has_applied"] is True

    def test_get_job_detail_not_found(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """존재하지 않는 일자리 조회"""
        from uuid import uuid4
        fake_id = uuid4()
        
        response = client.get(
            f"/api/jobs/{fake_id}",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 404
        assert "Job not found" in response.json()["detail"]

    def test_get_job_detail_unauthorized(
        self,
        client: TestClient,
        test_jobs: list[Job],
    ):
        """인증 없이 일자리 상세 조회 시도"""
        job = test_jobs[0]
        response = client.get(f"/api/jobs/{job.id}")

        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]


class TestApplyToJob:
    """일자리 지원 API 테스트"""

    def test_apply_to_job_success(
        self,
        client: TestClient,
        test_user_token: str,
        test_user: User,
        test_jobs: list[Job],
    ):
        """일자리 지원 성공"""
        job = test_jobs[0]  # active 상태인 첫 번째 일자리
        
        response = client.post(
            f"/api/jobs/{job.id}/apply",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "cover_letter": "저는 열정적인 개발자입니다. 3년 이상의 경험을 가지고 있습니다.",
                "resume_url": "https://example.com/resume.pdf",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["job_id"] == str(job.id)
        assert data["user_id"] == str(test_user.id)
        assert data["status"] == "applied"
        assert data["cover_letter"] == "저는 열정적인 개발자입니다. 3년 이상의 경험을 가지고 있습니다."
        assert data["resume_url"] == "https://example.com/resume.pdf"
        assert "id" in data
        assert "applied_at" in data

    def test_apply_to_job_minimal_data(
        self,
        client: TestClient,
        test_user_token: str,
        test_user: User,
        test_jobs: list[Job],
    ):
        """최소 데이터로 일자리 지원 성공 (cover_letter, resume_url 없음)"""
        job = test_jobs[0]
        
        response = client.post(
            f"/api/jobs/{job.id}/apply",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["job_id"] == str(job.id)
        assert data["user_id"] == str(test_user.id)
        assert data["status"] == "applied"

    def test_apply_to_job_duplicate(
        self,
        client: TestClient,
        test_user_token: str,
        test_user: User,
        test_jobs: list[Job],
        db: Session,
    ):
        """중복 지원 시도 (이미 지원한 일자리)"""
        job = test_jobs[0]
        
        # 첫 번째 지원
        application = JobApplication(
            job_id=job.id,
            user_id=test_user.id,
            status="applied",
        )
        db.add(application)
        db.commit()
        
        # 두 번째 지원 시도
        response = client.post(
            f"/api/jobs/{job.id}/apply",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "cover_letter": "두 번째 지원입니다.",
            },
        )

        assert response.status_code == 400
        assert "already applied" in response.json()["detail"].lower() or "duplicate" in response.json()["detail"].lower()

    def test_apply_to_job_not_found(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """존재하지 않는 일자리에 지원 시도"""
        from uuid import uuid4
        fake_id = uuid4()
        
        response = client.post(
            f"/api/jobs/{fake_id}/apply",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "cover_letter": "지원합니다.",
            },
        )

        assert response.status_code == 404
        assert "Job not found" in response.json()["detail"]

    def test_apply_to_job_closed(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """closed 상태인 일자리에 지원 시도"""
        job = test_jobs[2]  # closed 상태인 세 번째 일자리
        
        response = client.post(
            f"/api/jobs/{job.id}/apply",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "cover_letter": "지원합니다.",
            },
        )

        assert response.status_code == 400
        assert "closed" in response.json()["detail"].lower() or "not active" in response.json()["detail"].lower()

    def test_apply_to_job_unauthorized(
        self,
        client: TestClient,
        test_jobs: list[Job],
    ):
        """인증 없이 일자리 지원 시도"""
        job = test_jobs[0]
        
        response = client.post(
            f"/api/jobs/{job.id}/apply",
            json={
                "cover_letter": "지원합니다.",
            },
        )

        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]


class TestCreateJob:
    """일자리 공고 작성 API 테스트 (관리자만 가능)"""

    def test_create_job_success(
        self,
        client: TestClient,
        test_admin_token: str,
        test_admin_user: User,
    ):
        """관리자가 일자리 공고 작성 성공"""
        deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        response = client.post(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_admin_token}"},
            json={
                "position": "프론트엔드 개발자",
                "company_name": "테크 스타트업",
                "location": "서울시 강남구",
                "employment_type": "full-time",
                "description": "React 기반 웹 애플리케이션 개발",
                "requirements": "React, TypeScript 경험 필수",
                "deadline": deadline,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["position"] == "프론트엔드 개발자"
        assert data["company_name"] == "테크 스타트업"
        assert data["location"] == "서울시 강남구"
        assert data["employment_type"] == "full-time"
        assert data["status"] == "active"
        assert data["posted_by"] == str(test_admin_user.id)

    def test_create_job_unauthorized(
        self,
        client: TestClient,
        test_user_token: str,
    ):
        """일반 사용자가 일자리 공고 작성 시도 (403)"""
        deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        response = client.post(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "position": "프론트엔드 개발자",
                "company_name": "테크 스타트업",
                "location": "서울시 강남구",
                "employment_type": "full-time",
                "description": "React 기반 웹 애플리케이션 개발",
                "deadline": deadline,
            },
        )

        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_create_job_not_authenticated(
        self,
        client: TestClient,
    ):
        """인증 없이 일자리 공고 작성 시도"""
        deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        response = client.post(
            "/api/jobs",
            json={
                "position": "프론트엔드 개발자",
                "company_name": "테크 스타트업",
                "location": "서울시 강남구",
                "employment_type": "full-time",
                "description": "React 기반 웹 애플리케이션 개발",
                "deadline": deadline,
            },
        )

        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]

    def test_create_job_missing_required_fields(
        self,
        client: TestClient,
        test_admin_token: str,
    ):
        """필수 필드 누락 시 422 에러"""
        response = client.post(
            "/api/jobs",
            headers={"Authorization": f"Bearer {test_admin_token}"},
            json={
                "position": "프론트엔드 개발자",
                # company_name, location, employment_type, description, deadline 누락
            },
        )

        assert response.status_code == 422


class TestUpdateJob:
    """일자리 공고 수정 API 테스트 (관리자만 가능)"""

    def test_update_job_success(
        self,
        client: TestClient,
        test_admin_token: str,
        test_admin_user: User,
        test_jobs: list[Job],
    ):
        """관리자가 자신이 작성한 공고 수정 성공"""
        job = test_jobs[0]
        
        response = client.put(
            f"/api/jobs/{job.id}",
            headers={"Authorization": f"Bearer {test_admin_token}"},
            json={
                "position": "수정된 직종",
                "company_name": job.company_name,
                "location": job.location,
                "employment_type": job.employment_type,
                "description": "수정된 설명",
                "deadline": job.deadline.isoformat(),
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["position"] == "수정된 직종"
        assert data["description"] == "수정된 설명"

    def test_update_job_unauthorized(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """일반 사용자가 일자리 공고 수정 시도 (403)"""
        job = test_jobs[0]
        
        response = client.put(
            f"/api/jobs/{job.id}",
            headers={"Authorization": f"Bearer {test_user_token}"},
            json={
                "position": "수정된 직종",
                "company_name": job.company_name,
                "location": job.location,
                "employment_type": job.employment_type,
                "description": "수정된 설명",
                "deadline": job.deadline.isoformat(),
            },
        )

        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_update_job_not_found(
        self,
        client: TestClient,
        test_admin_token: str,
    ):
        """존재하지 않는 일자리 공고 수정 시도"""
        from uuid import uuid4
        fake_id = uuid4()
        deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        response = client.put(
            f"/api/jobs/{fake_id}",
            headers={"Authorization": f"Bearer {test_admin_token}"},
            json={
                "position": "수정된 직종",
                "company_name": "회사명",
                "location": "서울시 강남구",
                "employment_type": "full-time",
                "description": "설명",
                "deadline": deadline,
            },
        )

        assert response.status_code == 404
        assert "Job not found" in response.json()["detail"]


class TestDeleteJob:
    """일자리 공고 삭제 API 테스트 (관리자만 가능)"""

    def test_delete_job_success(
        self,
        client: TestClient,
        test_admin_token: str,
        test_jobs: list[Job],
        db: Session,
    ):
        """관리자가 일자리 공고 삭제 성공"""
        job = test_jobs[0]
        
        response = client.delete(
            f"/api/jobs/{job.id}",
            headers={"Authorization": f"Bearer {test_admin_token}"},
        )

        assert response.status_code == 204

        # 삭제 확인
        deleted_job = db.query(Job).filter(Job.id == job.id).first()
        assert deleted_job is None

    def test_delete_job_unauthorized(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """일반 사용자가 일자리 공고 삭제 시도 (403)"""
        job = test_jobs[0]
        
        response = client.delete(
            f"/api/jobs/{job.id}",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_delete_job_not_found(
        self,
        client: TestClient,
        test_admin_token: str,
    ):
        """존재하지 않는 일자리 공고 삭제 시도"""
        from uuid import uuid4
        fake_id = uuid4()
        
        response = client.delete(
            f"/api/jobs/{fake_id}",
            headers={"Authorization": f"Bearer {test_admin_token}"},
        )

        assert response.status_code == 404
        assert "Job not found" in response.json()["detail"]


class TestGetJobApplications:
    """일자리 지원자 목록 조회 API 테스트 (관리자 전용)"""

    def test_get_applications_success(
        self,
        client: TestClient,
        test_admin_token: str,
        test_jobs: list[Job],
        test_user: User,
        db: Session,
    ):
        """관리자가 자신의 공고 지원자 목록 조회 성공"""
        job = test_jobs[0]

        # 테스트용 지원 내역 생성
        application1 = JobApplication(
            job_id=job.id,
            user_id=test_user.id,
            status="applied",
            cover_letter="지원합니다",
        )
        db.add(application1)
        db.commit()

        response = client.get(
            f"/api/jobs/{job.id}/applications",
            headers={"Authorization": f"Bearer {test_admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["status"] == "applied"
        assert data[0]["cover_letter"] == "지원합니다"

    def test_get_applications_with_status_filter(
        self,
        client: TestClient,
        test_admin_token: str,
        test_jobs: list[Job],
        test_user: User,
        db: Session,
    ):
        """상태별 필터링 테스트"""
        job = test_jobs[0]

        # 다양한 상태의 지원 내역 생성
        from ..models.user import User as UserModel
        user2 = UserModel(
            email="user2@example.com",
            password_hash="hashed",
            first_name="User",
            last_name="Two",
            role="foreign",
        )
        db.add(user2)
        db.commit()

        application1 = JobApplication(
            job_id=job.id,
            user_id=test_user.id,
            status="applied",
        )
        application2 = JobApplication(
            job_id=job.id,
            user_id=user2.id,
            status="accepted",
        )
        db.add_all([application1, application2])
        db.commit()

        # accepted 상태만 필터링
        response = client.get(
            f"/api/jobs/{job.id}/applications",
            headers={"Authorization": f"Bearer {test_admin_token}"},
            params={"status": "accepted"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "accepted"

    def test_get_applications_unauthorized(
        self,
        client: TestClient,
        test_user_token: str,
        test_jobs: list[Job],
    ):
        """일반 사용자가 지원자 목록 조회 시도 (403)"""
        job = test_jobs[0]

        response = client.get(
            f"/api/jobs/{job.id}/applications",
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_get_applications_not_found(
        self,
        client: TestClient,
        test_admin_token: str,
    ):
        """존재하지 않는 일자리의 지원자 조회 시도"""
        from uuid import uuid4
        fake_id = uuid4()

        response = client.get(
            f"/api/jobs/{fake_id}/applications",
            headers={"Authorization": f"Bearer {test_admin_token}"},
        )

        assert response.status_code == 404
        assert "Job not found" in response.json()["detail"]

    def test_get_applications_empty(
        self,
        client: TestClient,
        test_admin_token: str,
        test_jobs: list[Job],
    ):
        """지원자가 없는 경우"""
        job = test_jobs[0]

        response = client.get(
            f"/api/jobs/{job.id}/applications",
            headers={"Authorization": f"Bearer {test_admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
