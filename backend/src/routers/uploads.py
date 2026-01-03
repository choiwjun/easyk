"""Uploads Router"""

from typing import List
from fastapi import APIRouter, Depends, status, UploadFile
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..schemas.upload import UploadCreate, UploadResponse
from ..services.upload_service import (
    validate_file as validate_file_service,
    create_upload as create_upload_service,
    get_user_uploads as get_user_uploads_service,
    delete_upload as delete_upload_service,
)
from ..middleware.auth import get_current_user


router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_file(
    file: UploadFile = UploadFile(...),
    file_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    파일 업로드 엔드포인트

    Args:
        file: 업로드할 파일
        file_type: 파일 유형 (resume, profile_photo, document 등)
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        UploadResponse: 업로드된 파일 정보

    Raises:
        HTTPException: 파일이 유효하지 않거나 용량 초과 시 에러
    """
    # 파일 유효성 검증
    is_valid, error_message = validate_file_service(file, file_type)
    if not is_valid:
        raise status.HTTPException(
            status_code=400,
            detail=error_message
        )

    # 파일 업로드
    upload = create_upload_service(file, file_type, current_user.id, db)
    return UploadResponse.model_validate(upload)


@router.get("", response_model=List[UploadResponse])
def get_uploads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    사용자 업로드 목록 조회

    Args:
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[UploadResponse]: 업로드 목록
    """
    uploads = get_user_uploads_service(current_user.id, db)
    return [UploadResponse.model_validate(u) for u in uploads]


@router.delete("/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    upload_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    업로드 파일 삭제

    Args:
        upload_id: 업로드 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Raises:
        HTTPException: 파일을 찾을 수 없거나 권한이 없을 때 에러
    """
    success = delete_upload_service(upload_id, current_user.id, db)
    if not success:
        raise status.HTTPException(
            status_code=404,
            detail="Upload not found or you don't have permission"
        )
