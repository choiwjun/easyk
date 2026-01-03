"""Jobs Router"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..schemas.job import JobResponse, JobDetailResponse, JobCreate, JobUpdate
from ..middleware.auth import get_current_user
from ..services.job_service import (
    get_jobs as get_jobs_service,
    get_job_detail as get_job_detail_service,
    apply_to_job as apply_to_job_service,
    create_job as create_job_service,
    update_job as update_job_service,
    delete_job as delete_job_service,
    get_job_applications as get_job_applications_service,
    update_job_application_status as update_job_application_status_service,
    get_user_job_applications as get_user_job_applications_service,
)
from ..services.saved_job_service import (
    save_job as save_job_service,
    unsave_job as unsave_job_service,
    get_saved_jobs as get_saved_jobs_service,
)
from ..schemas.job_application import (
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationWithApplicant,
    JobApplicationStatusUpdate,
    ApplicantInfo,
    JobApplicationWithJob,
    JobInfo,
)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("", response_model=List[JobResponse])
def get_jobs(
    location: Optional[str] = Query(None, description="지역 필터 (예: 서울시 강남구)"),
    employment_type: Optional[str] = Query(None, description="고용 형태 필터 (full-time, contract, part-time, temporary)"),
    keyword: Optional[str] = Query(None, description="키워드 검색 (직종, 회사명)"),
    limit: int = Query(20, ge=1, le=100, description="조회할 최대 개수"),
    offset: int = Query(0, ge=0, description="건너뛸 개수"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 목록 조회 엔드포인트

    Args:
        location: 지역 필터 (optional)
        employment_type: 고용 형태 필터 (optional)
        keyword: 키워드 검색 (position, company_name) (optional)
        limit: 조회할 최대 개수 (기본값: 20, 최대: 100)
        offset: 건너뛸 개수 (기본값: 0)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[JobResponse]: 일자리 목록 (active 상태만, 최신순 정렬)
    """
    return get_jobs_service(db, location, employment_type, keyword, limit, offset)


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job_detail(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 상세 조회 엔드포인트

    Args:
        job_id: 일자리 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        JobDetailResponse: 일자리 상세 정보 (지원 여부 포함)
    """
    job, has_applied = get_job_detail_service(job_id, current_user.id, db)
    
    # JobDetailResponse로 변환
    job_response = JobResponse.model_validate(job)
    return JobDetailResponse(**job_response.model_dump(), has_applied=has_applied)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 공고 생성 엔드포인트 (관리자 전용)

    Args:
        job_data: 일자리 생성 데이터
        current_user: 현재 인증된 사용자 (admin)
        db: 데이터베이스 세션

    Returns:
        JobResponse: 생성된 일자리

    Raises:
        HTTPException: 권한이 없을 때 403 에러
    """
    return create_job_service(job_data, current_user.id, db)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: UUID,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 공고 수정 엔드포인트 (관리자 전용)

    Args:
        job_id: 일자리 ID
        job_data: 수정할 데이터
        current_user: 현재 인증된 사용자 (admin)
        db: 데이터베이스 세션

    Returns:
        JobResponse: 수정된 일자리

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 권한이 없을 때 에러
    """
    return update_job_service(job_id, job_data, current_user.id, db)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 공고 삭제 엔드포인트 (관리자 전용)

    Args:
        job_id: 일자리 ID
        current_user: 현재 인증된 사용자 (admin)
        db: 데이터베이스 세션

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 권한이 없을 때 에러
    """
    delete_job_service(job_id, current_user.id, db)


@router.get("/{job_id}/applications", response_model=List[JobApplicationWithApplicant])
def get_job_applications(
    job_id: UUID,
    status_filter: Optional[str] = Query(None, alias="status", description="지원 상태 필터 (applied, in_review, accepted, rejected)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 지원자 목록 조회 엔드포인트 (관리자 전용)

    Args:
        job_id: 일자리 ID
        status_filter: 지원 상태 필터 (optional)
        current_user: 현재 인증된 사용자 (admin)
        db: 데이터베이스 세션

    Returns:
        List[JobApplicationWithApplicant]: 지원자 정보가 포함된 지원 내역 목록

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 권한이 없을 때 에러
    """
    applications = get_job_applications_service(job_id, current_user.id, status_filter, db)

    # 응답 포맷 변환
    result = []
    for application, user in applications:
        app_dict = JobApplicationResponse.model_validate(application).model_dump()
        app_dict["applicant"] = ApplicantInfo(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone_number=user.phone_number,
            nationality=user.nationality,
        )
        result.append(JobApplicationWithApplicant(**app_dict))

    return result


@router.post("/{job_id}/apply", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    job_id: UUID,
    application_data: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 지원 엔드포인트

    Args:
        job_id: 일자리 ID
        application_data: 지원 데이터 (cover_letter, resume_url)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        JobApplicationResponse: 생성된 지원 내역
    """
    return apply_to_job_service(
        job_id,
        current_user.id,
        application_data.cover_letter,
        application_data.resume_url,
        db,
    )


@router.put("/applications/{application_id}/status", response_model=JobApplicationResponse)
def update_application_status(
    application_id: UUID,
    status_update: JobApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 지원 상태 업데이트 엔드포인트 (관리자 전용)

    Args:
        application_id: 지원 내역 ID
        status_update: 상태 업데이트 데이터
        current_user: 현재 인증된 사용자 (admin)
        db: 데이터베이스 세션

    Returns:
        JobApplicationResponse: 업데이트된 지원 내역

    Raises:
        HTTPException: 지원 내역을 찾을 수 없거나 권한이 없을 때 에러
    """
    return update_job_application_status_service(
        application_id,
        status_update,
        current_user.id,
        db,
    )


@router.get("/applications/my", response_model=List[JobApplicationWithJob])
def get_my_applications(
    status_filter: Optional[str] = Query(None, alias="status", description="지원 상태 필터 (applied, in_review, accepted, rejected)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    내 일자리 지원 내역 조회 엔드포인트

    Args:
        status_filter: 지원 상태 필터 (optional)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[JobApplicationWithJob]: 일자리 정보가 포함된 지원 내역 목록
    """
    applications = get_user_job_applications_service(current_user.id, status_filter, db)

    # 응답 포맷 변환
    result = []
    for application, job in applications:
        app_dict = JobApplicationResponse.model_validate(application).model_dump()
        app_dict["job"] = JobInfo(
            id=job.id,
            position=job.position,
            company_name=job.company_name,
            location=job.location,
            employment_type=job.employment_type,
            salary_range=job.salary_range,
            status=job.status,
            deadline=job.deadline,
        )
        result.append(JobApplicationWithJob(**app_dict))

    return result


@router.post("/{job_id}/save", status_code=status.HTTP_201_CREATED)
def save_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 저장 (관심 목록에 추가) 엔드포인트

    Args:
        job_id: 일자리 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        dict: 저장 성공 메시지

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 이미 저장된 경우
    """
    save_job_service(current_user.id, job_id, db)
    return {"message": "일자리가 저장되었습니다"}


@router.delete("/{job_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def unsave_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    일자리 저장 취소 (관심 목록에서 제거) 엔드포인트

    Args:
        job_id: 일자리 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Raises:
        HTTPException: 저장된 일자리를 찾을 수 없는 경우
    """
    unsave_job_service(current_user.id, job_id, db)


@router.get("/saved/my", response_model=List[JobResponse])
def get_my_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    내가 저장한 일자리 목록 조회 엔드포인트

    Args:
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[JobResponse]: 저장된 일자리 목록
    """
    saved_jobs = get_saved_jobs_service(current_user.id, db)

    # Job 정보만 추출하여 반환
    result = []
    for saved_job, job in saved_jobs:
        result.append(JobResponse.model_validate(job))

    return result

