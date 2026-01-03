"""Upload Service"""

import os
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from pathlib import Path

from ..models.user import User
from ..models.upload import Upload
from ..schemas.upload import UploadCreate, UploadResponse
from ..config import settings


ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_file(file: UploadFile, file_type: str) -> tuple[bool, Optional[str]]:
    """파일 유효성 검증

    Args:
        file: 업로드할 파일
        file_type: 파일 유형 (resume, profile_photo, document 등)

    Returns:
        tuple: (유효 여부, 에러 메시지)
    """
    # 파일 크기 검증
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return False, f"파일 크기는 {MAX_FILE_SIZE / (1024*1024)}MB 이하여야 합니다."

    # MIME 타입 검증
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False, f"지원하지 않는 파일 형식입니다: {file.content_type}"

    return True, None


def create_upload(
    file: UploadFile,
    file_type: str,
    user_id: uuid.UUID,
    db: Session
) -> Upload:
    """파일 업로드 생성

    Args:
        file: 업로드할 파일
        file_type: 파일 유형
        user_id: 사용자 ID
        db: 데이터베이스 세션

    Returns:
        Upload: 생성된 업로드 정보

    Raises:
        HTTPException: 파일이 유효하지 않을 때
    """
    # 파일 유효성 검증
    is_valid, error_message = validate_file(file, file_type)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    # 파일명 생성 (중복 방지)
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # 파일 저장 경로 생성
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / unique_filename

    # 파일 저장
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    # 파일 크기
    file_size = os.path.getsize(file_path)

    # 업로드 정보 생성
    upload = Upload(
        file_name=unique_filename,
        file_path=str(file_path),
        file_size=file_size,
        mime_type=file.content_type,
        file_type=file_type,
        uploaded_by=user_id,
        upload_status="completed"
    )

    db.add(upload)
    db.commit()
    db.refresh(upload)

    return upload


def get_user_uploads(
    user_id: uuid.UUID,
    db: Session
) -> list[Upload]:
    """사용자 업로드 목록 조회

    Args:
        user_id: 사용자 ID
        db: 데이터베이스 세션

    Returns:
        list[Upload]: 업로드 목록
    """
    return db.query(Upload).filter(
        Upload.uploaded_by == user_id
    ).order_by(Upload.created_at.desc()).all()


def get_upload_by_id(
    upload_id: uuid.UUID,
    db: Session
) -> Optional[Upload]:
    """업로드 정보 상세 조회

    Args:
        upload_id: 업로드 ID
        db: 데이터베이스 세션

    Returns:
        Optional[Upload]: 업로드 정보
    """
    return db.query(Upload).filter(
        Upload.id == upload_id
    ).first()


def delete_upload(
    upload_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session
) -> bool:
    """업로드 파일 삭제

    Args:
        upload_id: 업로드 ID
        user_id: 사용자 ID
        db: 데이터베이스 세션

    Returns:
        bool: 삭제 성공 여부
    """
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.uploaded_by == user_id
    ).first()

    if not upload:
        return False

    # 파일 삭제
    if os.path.exists(upload.file_path):
        os.remove(upload.file_path)

    db.delete(upload)
    db.commit()
    return True

