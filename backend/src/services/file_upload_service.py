"""File Upload Service"""

import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException
import aiofiles

# Configuration
UPLOAD_DIR = os.path.join("uploads", "resumes")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}


def ensure_upload_dir():
    """업로드 디렉토리가 존재하는지 확인하고 없으면 생성"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def validate_file(file: UploadFile) -> None:
    """
    파일 검증

    Args:
        file: 업로드된 파일

    Raises:
        HTTPException: 파일이 유효하지 않을 경우
    """
    # 파일 확장자 검증
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다. 허용된 형식: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 파일 크기는 스트리밍 중에 검증


async def save_resume_file(file: UploadFile, user_id: str) -> str:
    """
    이력서 파일 저장

    Args:
        file: 업로드된 파일
        user_id: 사용자 ID

    Returns:
        str: 저장된 파일의 URL 또는 경로

    Raises:
        HTTPException: 파일 저장 실패 시
    """
    try:
        # 디렉토리 확인
        ensure_upload_dir()

        # 파일 검증
        validate_file(file)

        # 고유한 파일명 생성
        file_ext = os.path.splitext(file.filename or "")[1].lower()
        unique_filename = f"{user_id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # 파일 저장 (비동기)
        total_size = 0
        async with aiofiles.open(file_path, 'wb') as f:
            while chunk := await file.read(8192):  # 8KB 청크로 읽기
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    # 파일 크기 초과 시 삭제
                    await f.close()
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    raise HTTPException(
                        status_code=400,
                        detail=f"파일 크기가 너무 큽니다. 최대 {MAX_FILE_SIZE // (1024*1024)}MB까지 업로드 가능합니다."
                    )
                await f.write(chunk)

        # 파일 URL 반환 (프로덕션에서는 CDN URL로 변경)
        # 예: https://yourdomain.com/uploads/resumes/filename
        file_url = f"/uploads/resumes/{unique_filename}"
        return file_url

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"파일 업로드 중 오류가 발생했습니다: {str(e)}"
        )


async def delete_resume_file(file_url: str) -> bool:
    """
    이력서 파일 삭제

    Args:
        file_url: 파일 URL

    Returns:
        bool: 삭제 성공 여부
    """
    try:
        # URL에서 파일명 추출
        filename = os.path.basename(file_url)
        file_path = os.path.join(UPLOAD_DIR, filename)

        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Failed to delete file: {e}")
        return False


def get_file_info(file: UploadFile) -> dict:
    """
    파일 정보 추출

    Args:
        file: 업로드된 파일

    Returns:
        dict: 파일 정보
    """
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    return {
        "filename": file.filename,
        "extension": file_ext,
        "content_type": file.content_type,
    }
