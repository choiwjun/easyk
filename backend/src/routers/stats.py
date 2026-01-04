"""Statistics Router"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.user import User
from ..models.consultation import Consultation
from ..models.job import Job
from ..models.job_application import JobApplication
from ..models.government_support import GovernmentSupport
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/api/stats", tags=["statistics"])


@router.get("/dashboard")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    관리자 대시보드 통계 조회

    Args:
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        dict: 통계 데이터

    Raises:
        HTTPException: 권한이 없는 경우
    """
    from fastapi import HTTPException

    # 관리자 권한 확인
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # 사용자 통계
    total_users = db.query(User).count()
    foreign_users = db.query(User).filter(User.role == "foreign").count()
    consultant_users = db.query(User).filter(User.role == "consultant").count()

    # 상담 통계
    total_consultations = db.query(Consultation).count()
    consultation_stats = (
        db.query(Consultation.status, func.count(Consultation.id))
        .group_by(Consultation.status)
        .all()
    )
    consultation_by_status = {status: count for status, count in consultation_stats}

    # 일자리 통계
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "active").count()
    total_applications = db.query(JobApplication).count()
    application_stats = (
        db.query(JobApplication.status, func.count(JobApplication.id))
        .group_by(JobApplication.status)
        .all()
    )
    applications_by_status = {status: count for status, count in application_stats}

    # 정부 지원 통계
    total_supports = db.query(GovernmentSupport).count()
    active_supports = db.query(GovernmentSupport).filter(GovernmentSupport.status == "active").count()

    return {
        "users": {
            "total": total_users,
            "foreign": foreign_users,
            "consultants": consultant_users,
            "admins": total_users - foreign_users - consultant_users,
        },
        "consultations": {
            "total": total_consultations,
            "by_status": consultation_by_status,
        },
        "jobs": {
            "total": total_jobs,
            "active": active_jobs,
        },
        "applications": {
            "total": total_applications,
            "by_status": applications_by_status,
        },
        "supports": {
            "total": total_supports,
            "active": active_supports,
        },
    }


@router.get("/overview")
def get_overview_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    전체 개요 통계

    Returns:
        dict: 개요 통계
    """
    from fastapi import HTTPException

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # 최근 7일 동안의 활동
    from datetime import datetime, timedelta

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    recent_users = db.query(User).filter(User.created_at >= seven_days_ago).count()
    recent_consultations = db.query(Consultation).filter(Consultation.created_at >= seven_days_ago).count()
    recent_applications = db.query(JobApplication).filter(JobApplication.applied_at >= seven_days_ago).count()

    return {
        "recent_activity": {
            "new_users_7d": recent_users,
            "new_consultations_7d": recent_consultations,
            "new_applications_7d": recent_applications,
        }
    }
