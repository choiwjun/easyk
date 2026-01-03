"""Saved Job Service"""

from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status as http_status

from ..models.saved_job import SavedJob
from ..models.job import Job


def save_job(user_id: UUID, job_id: UUID, db: Session) -> SavedJob:
    """
    일자리 저장 (관심 목록에 추가)

    Args:
        user_id: 사용자 ID
        job_id: 일자리 ID
        db: 데이터베이스 세션

    Returns:
        SavedJob: 저장된 일자리 정보

    Raises:
        HTTPException: 일자리를 찾을 수 없거나 이미 저장된 경우
    """
    # 일자리 존재 확인
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # 이미 저장했는지 확인
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == user_id,
        SavedJob.job_id == job_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Job already saved"
        )

    # 저장
    saved_job = SavedJob(user_id=user_id, job_id=job_id)
    db.add(saved_job)
    db.commit()
    db.refresh(saved_job)

    return saved_job


def unsave_job(user_id: UUID, job_id: UUID, db: Session) -> bool:
    """
    일자리 저장 취소 (관심 목록에서 제거)

    Args:
        user_id: 사용자 ID
        job_id: 일자리 ID
        db: 데이터베이스 세션

    Returns:
        bool: 삭제 성공 여부

    Raises:
        HTTPException: 저장된 일자리를 찾을 수 없는 경우
    """
    saved_job = db.query(SavedJob).filter(
        SavedJob.user_id == user_id,
        SavedJob.job_id == job_id
    ).first()

    if not saved_job:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Saved job not found"
        )

    db.delete(saved_job)
    db.commit()

    return True


def get_saved_jobs(user_id: UUID, db: Session) -> list[tuple[SavedJob, Job]]:
    """
    사용자가 저장한 일자리 목록 조회

    Args:
        user_id: 사용자 ID
        db: 데이터베이스 세션

    Returns:
        list[tuple[SavedJob, Job]]: 저장된 일자리와 일자리 정보 튜플 리스트
    """
    saved_jobs = db.query(SavedJob, Job).join(
        Job, SavedJob.job_id == Job.id
    ).filter(
        SavedJob.user_id == user_id
    ).order_by(SavedJob.saved_at.desc()).all()

    return saved_jobs


def is_job_saved(user_id: UUID, job_id: UUID, db: Session) -> bool:
    """
    일자리가 저장되어 있는지 확인

    Args:
        user_id: 사용자 ID
        job_id: 일자리 ID
        db: 데이터베이스 세션

    Returns:
        bool: 저장 여부
    """
    saved_job = db.query(SavedJob).filter(
        SavedJob.user_id == user_id,
        SavedJob.job_id == job_id
    ).first()

    return saved_job is not None
