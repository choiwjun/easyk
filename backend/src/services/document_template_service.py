"""Document Template Service"""

from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from ..models.document_template import DocumentTemplate
from ..schemas.document_template import (
    DocumentTemplateCreate,
    DocumentTemplateUpdate,
    DocumentTemplateResponse,
)


def get_document_templates(
    db: Session,
    category: Optional[str] = None,
    language: str = "ko"
) -> List[DocumentTemplate]:
    """서류 템플릿 목록 조회

    Args:
        db: 데이터베이스 세션
        category: 카테고리 필터 (job_application, support_application)
        language: 언어 필터 (기본값: ko)

    Returns:
        List[DocumentTemplate]: 템플릿 목록
    """
    query = db.query(DocumentTemplate).filter(
        DocumentTemplate.language == language
    )

    if category:
        query = query.filter(DocumentTemplate.category == category)

    templates = query.order_by(DocumentTemplate.name).all()
    return templates


def get_document_template_by_id(
    template_id: UUID,
    db: Session
) -> Optional[DocumentTemplate]:
    """서류 템플릿 상세 조회

    Args:
        template_id: 템플릿 ID
        db: 데이터베이스 세션

    Returns:
        Optional[DocumentTemplate]: 템플릿 정보
    """
    return db.query(DocumentTemplate).filter(
        DocumentTemplate.id == template_id
    ).first()


def create_document_template(
    template_data: DocumentTemplateCreate,
    db: Session
) -> DocumentTemplate:
    """서류 템플릿 생성

    Args:
        template_data: 템플릿 데이터
        db: 데이터베이스 세션

    Returns:
        DocumentTemplate: 생성된 템플릿
    """
    new_template = DocumentTemplate(**template_data.model_dump())
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template


def update_document_template(
    template_id: UUID,
    template_data: DocumentTemplateUpdate,
    db: Session
) -> Optional[DocumentTemplate]:
    """서류 템플릿 업데이트

    Args:
        template_id: 템플릿 ID
        template_data: 업데이트 데이터
        db: 데이터베이스 세션

    Returns:
        Optional[DocumentTemplate]: 업데이트된 템플릿
    """
    from fastapi import HTTPException

    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Document template not found")

    for field, value in template_data.model_dump(exclude_unset=True).items():
        setattr(template, field, value)

    db.commit()
    db.refresh(template)
    return template


def delete_document_template(
    template_id: UUID,
    db: Session
) -> bool:
    """서류 템플릿 삭제

    Args:
        template_id: 템플릿 ID
        db: 데이터베이스 세션

    Returns:
        bool: 삭제 성공 여부
    """
    from fastapi import HTTPException

    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Document template not found")

    db.delete(template)
    db.commit()
    return True



