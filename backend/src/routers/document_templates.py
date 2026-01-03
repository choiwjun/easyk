"""Document Templates Router"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..schemas.document_template import (
    DocumentTemplateCreate,
    DocumentTemplateUpdate,
    DocumentTemplateResponse,
)
from ..services.document_template_service import (
    get_document_templates as get_document_templates_service,
    get_document_template_by_id as get_document_template_by_id_service,
    create_document_template as create_document_template_service,
    update_document_template as update_document_template_service,
    delete_document_template as delete_document_template_service,
)
from ..middleware.auth import get_current_user, get_current_admin


router = APIRouter(prefix="/api/document-templates", tags=["document-templates"])


@router.get("", response_model=List[DocumentTemplateResponse])
def get_document_templates(
    category: Optional[str] = Query(None, description="카테고리 필터 (job_application, support_application)"),
    language: str = Query("ko", description="언어 필터 (ko, en, vi, mn, zh)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    서류 템플릿 목록 조회 엔드포인트

    Args:
        category: 카테고리 필터 (optional)
        language: 언어 필터 (기본값: ko)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[DocumentTemplateResponse]: 템플릿 목록
    """
    return get_document_templates_service(db, category, language)


@router.get("/{template_id}", response_model=DocumentTemplateResponse)
def get_document_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    서류 템플릿 상세 조회

    Args:
        template_id: 템플릿 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        DocumentTemplateResponse: 템플릿 정보

    Raises:
        HTTPException: 템플릿을 찾을 수 없는 경우
    """
    template = get_document_template_by_id_service(template_id, db)
    if not template:
        raise status.HTTPException(
            status_code=404,
            detail="Document template not found"
        )
    return template


@router.post("", response_model=DocumentTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_document_template(
    template_data: DocumentTemplateCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    서류 템플릿 생성 (관리자 전용)

    Args:
        template_data: 템플릿 생성 데이터
        current_user: 현재 인증된 사용자 (관리자)
        db: 데이터베이스 세션

    Returns:
        DocumentTemplateResponse: 생성된 템플릿

    Raises:
        HTTPException: 관리자가 아닌 경우
    """
    return create_document_template_service(template_data, db)


@router.put("/{template_id}", response_model=DocumentTemplateResponse)
def update_document_template(
    template_id: UUID,
    template_data: DocumentTemplateUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    서류 템플릿 업데이트 (관리자 전용)

    Args:
        template_id: 템플릿 ID
        template_data: 업데이트 데이터
        current_user: 현재 인증된 사용자 (관리자)
        db: 데이터베이스 세션

    Returns:
        DocumentTemplateResponse: 업데이트된 템플릿

    Raises:
        HTTPException: 템플릿을 찾을 수 없거나 권한이 없는 경우
    """
    return update_document_template_service(template_id, template_data, db)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document_template(
    template_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    서류 템플릿 삭제 (관리자 전용)

    Args:
        template_id: 템플릿 ID
        current_user: 현재 인증된 사용자 (관리자)
        db: 데이터베이스 세션

    Raises:
        HTTPException: 템플릿을 찾을 수 없거나 권한이 없는 경우
    """
    delete_document_template_service(template_id, db)

