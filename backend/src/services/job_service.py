"""Job Service"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from ..models.job import Job
from ..models.job_application import JobApplication


def get_jobs(
    db: Session,
    location: Optional[str] = None,
    employment_type: Optional[str] = None,
    keyword: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Job]:
    """
    일자리 목록 조회 (필터링, 검색, 페이지네이션)

    Args:
        db: 데이터베이스 세션
        location: 지역 필터 (optional)
        employment_type: 고용 형태 필터 (optional)
        keyword: 키워드 검색 (position, company_name) (optional)
        limit: 조회할 최대 개수 (기본값: 20)
        offset: 건너뛸 개수 (기본값: 0)

    Returns:
        List[Job]: 일자리 목록 (active 상태만, 최신순 정렬)
    """
    # 기본 쿼리: active 상태만 조회
    query = db.query(Job).filter(Job.status == "active")

    # 지역 필터
    if location:
        query = query.filter(Job.location.contains(location))

    # 고용 형태 필터
    if employment_type:
        query = query.filter(Job.employment_type == employment_type)

    # 키워드 검색 (position, company_name)
    if keyword:
        query = query.filter(
            or_(
                Job.position.contains(keyword),
                Job.company_name.contains(keyword),
            )
        )

    # 최신순 정렬 및 페이지네이션
    jobs = query.order_by(Job.created_at.desc()).offset(offset).limit(limit).all()

    return jobs


def get_job_detail(
    job_id: UUID,
    user_id: UUID,
    db: Session,
) -> tuple[Job, bool]:
    """
    일자리 상세 조회 (지원 여부 확인 포함)

    Args:
        job_id: 일자리 ID
        user_id: 현재 사용자 ID
        db: 데이터베이스 세션

    Returns:
        tuple[Job, bool]: (일자리 객체, 지원 여부)

    Raises:
        HTTPException: 일자리를 찾을 수 없을 때 404 에러
    """
    from fastapi import HTTPException, status

    # 일자리 조회
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # 지원 여부 확인
    has_applied = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.user_id == user_id,
    ).first() is not None

    return job, has_applied


def apply_to_job(
    job_id: UUID,
    user_id: UUID,
    cover_letter: Optional[str],
    resume_url: Optional[str],
    db: Session,
) -> "JobApplication":
    """
    일자리 지원

    Args:
        job_id: 일자리 ID
        user_id: 사용자 ID
        cover_letter: 자기소개서 (optional)
        resume_url: 이력서 파일 URL (optional)
        db: 데이터베이스 세션

    Returns:
        JobApplication: 생성된 지원 내역

    Raises:
        HTTPException: 일자리를 찾을 수 없거나, 이미 지원했거나, closed 상태일 때 에러
    """
    from fastapi import HTTPException, status
    from sqlalchemy.exc import IntegrityError
    from ..models.job_application import JobApplication

    # 일자리 조회 및 검증
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # active 상태인 일자리만 지원 가능
    if job.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot apply to a closed or inactive job"
        )

    # 중복 지원 확인
    existing_application = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.user_id == user_id,
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )

    # 지원 내역 생성
    new_application = JobApplication(
        job_id=job_id,
        user_id=user_id,
        status="applied",
        cover_letter=cover_letter,
        resume_url=resume_url,
    )

    db.add(new_application)
    
    try:
        db.commit()
        db.refresh(new_application)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )

    return new_application


def create_job(
    job_data: "JobCreate",
    user_id: UUID,
    db: Session,
) -> Job:
    """
    일자리 공고 생성 (관리자 전용)

    Args:
        job_data: 일자리 생성 데이터
        user_id: 생성하는 사용자 ID (admin)
        db: 데이터베이스 세션

    Returns:
        Job: 생성된 일자리

    Raises:
        HTTPException: 권한이 없을 때 403 에러
    """
    from fastapi import HTTPException, status
    from ..models.user import User
    import json

    # 사용자 조회 및 권한 검증
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # required_languages를 JSON 문자열로 변환
    required_languages_json = json.dumps(job_data.required_languages) if job_data.required_languages else "[]"

    # 일자리 생성
    new_job = Job(
        posted_by=user_id,
        position=job_data.position,
        company_name=job_data.company_name,
        company_phone=job_data.company_phone,
        company_address=job_data.company_address,
        location=job_data.location,
        employment_type=job_data.employment_type,
        salary_range=job_data.salary_range,
        salary_currency=job_data.salary_currency,
        description=job_data.description,
        requirements=job_data.requirements,
        preferred_qualifications=job_data.preferred_qualifications,
        benefits=job_data.benefits,
        required_languages=required_languages_json,
        status=job_data.status or "active",
        deadline=job_data.deadline,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


def update_job(
    job_id: UUID,
    job_data: "JobUpdate",
    user_id: UUID,
    db: Session,
) -> Job:
    """
    일자리 공고 수정 (관리자 전용)

    Args:
        job_id: 일자리 ID
        job_data: 수정할 데이터
        user_id: 수정하는 사용자 ID (admin)
        db: 데이터베이스 세션

    Returns:
        Job: 수정된 일자리

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 권한이 없을 때 에러
    """
    from fastapi import HTTPException, status
    from ..models.user import User
    import json

    # 사용자 조회 및 권한 검증
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # 일자리 조회
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # 수정할 필드만 업데이트
    update_data = job_data.model_dump(exclude_unset=True)

    # required_languages를 JSON 문자열로 변환
    if "required_languages" in update_data and update_data["required_languages"] is not None:
        update_data["required_languages"] = json.dumps(update_data["required_languages"])

    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return job


def delete_job(
    job_id: UUID,
    user_id: UUID,
    db: Session,
) -> None:
    """
    일자리 공고 삭제 (관리자 전용)

    Args:
        job_id: 일자리 ID
        user_id: 삭제하는 사용자 ID (admin)
        db: 데이터베이스 세션

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 권한이 없을 때 에러
    """
    from fastapi import HTTPException, status
    from ..models.user import User

    # 사용자 조회 및 권한 검증
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # 일자리 조회
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # 삭제
    db.delete(job)
    db.commit()


def get_job_applications(
    job_id: UUID,
    user_id: UUID,
    status: Optional[str],
    db: Session,
) -> list[tuple["JobApplication", "User"]]:
    """
    일자리 지원자 목록 조회 (관리자 전용)

    Args:
        job_id: 일자리 ID
        user_id: 조회하는 사용자 ID (admin)
        status: 지원 상태 필터 (optional)
        db: 데이터베이스 세션

    Returns:
        list[tuple[JobApplication, User]]: 지원 내역과 지원자 정보 튜플 리스트

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 권한이 없을 때 에러
    """
    from fastapi import HTTPException, status as http_status
    from ..models.user import User
    from sqlalchemy.orm import joinedload

    # 사용자 조회 및 권한 검증
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.role != "admin":
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # 일자리 조회
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # 지원 내역 조회 (User 정보와 함께)
    query = db.query(JobApplication, User).join(
        User, JobApplication.user_id == User.id
    ).filter(JobApplication.job_id == job_id)

    # 상태 필터링
    if status:
        query = query.filter(JobApplication.status == status)

    # 최신순 정렬
    applications = query.order_by(JobApplication.applied_at.desc()).all()

    return applications

