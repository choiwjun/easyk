"""Government Supports Router"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.government_support import (
    GovernmentSupportResponse,
    GovernmentSupportList,
    GovernmentSupportCreate,
    GovernmentSupportUpdate,
)
from ..middleware.auth import get_current_user, require_admin
from ..services.government_support_service import (
    get_supports as get_supports_service,
    get_support_by_id,
    create_support,
    update_support,
    delete_support,
)

router = APIRouter(prefix="/api/supports", tags=["government-supports"])


@router.get("", response_model=GovernmentSupportList)
def get_supports(
    category: Optional[str] = Query(None, description="카테고리 필터 (subsidy, education, training, visa, housing)"),
    keyword: Optional[str] = Query(None, description="검색 키워드"),
    limit: int = Query(20, ge=1, le=100, description="조회할 최대 개수"),
    offset: int = Query(0, ge=0, description="조회 시작 위치"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    정부 지원 프로그램 목록 조회

    Args:
        category: 카테고리 필터 (optional)
        keyword: 검색 키워드 (optional)
        limit: 조회할 최대 개수
        offset: 조회 시작 위치 (pagination)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        GovernmentSupportList: 지원 프로그램 목록
    """
    supports, total = get_supports_service(db, category, keyword, limit, offset)

    return GovernmentSupportList(supports=supports, total=total)


@router.get("/{support_id}", response_model=GovernmentSupportResponse)
def get_support_detail(
    support_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    정부 지원 프로그램 상세 조회

    Args:
        support_id: 지원 프로그램 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        GovernmentSupportResponse: 지원 프로그램 상세 정보
    """
    support = get_support_by_id(db, support_id)

    if not support:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government support not found"
        )

    return support


@router.post("", response_model=GovernmentSupportResponse, status_code=status.HTTP_201_CREATED)
def create_new_support(
    support_data: GovernmentSupportCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    새로운 정부 지원 프로그램 생성 (관리자만)

    Args:
        support_data: 생성할 지원 데이터
        admin_user: 현재 인증된 관리자 사용자
        db: 데이터베이스 세션

    Returns:
        GovernmentSupportResponse: 생성된 지원 프로그램
    """
    new_support = create_support(support_data, db)

    return new_support


@router.put("/{support_id}", response_model=GovernmentSupportResponse)
def update_existing_support(
    support_id: UUID,
    support_data: GovernmentSupportUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    정부 지원 프로그램 수정 (관리자만)

    Args:
        support_id: 수정할 지원 프로그램 ID
        support_data: 수정할 데이터
        admin_user: 현재 인증된 관리자 사용자
        db: 데이터베이스 세션

    Returns:
        GovernmentSupportResponse: 수정된 지원 프로그램
    """
    updated_support = update_support(support_id, support_data, db)

    if not updated_support:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government support not found"
        )

    return updated_support


@router.delete("/{support_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_support(
    support_id: UUID,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    정부 지원 프로그램 삭제 (관리자만)

    Args:
        support_id: 삭제할 지원 프로그램 ID
        admin_user: 현재 인증된 관리자 사용자
        db: 데이터베이스 세션

    Returns:
        None
    """
    success = delete_support(support_id, db)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government support not found"
        )

    return None


