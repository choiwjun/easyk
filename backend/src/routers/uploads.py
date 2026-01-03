"""Uploads Router"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..middleware.auth import get_current_user
from ..services.file_upload_service import save_resume_file, get_file_info

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    이력서 파일 업로드 엔드포인트

    Args:
        file: 업로드할 파일
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        dict: 업로드된 파일 정보 (URL 포함)

    Raises:
        HTTPException: 파일 업로드 실패 시
    """
    # 파일 정보 추출
    file_info = get_file_info(file)

    # 파일 저장
    file_url = await save_resume_file(file, str(current_user.id))

    return {
        "message": "파일 업로드 성공",
        "file_url": file_url,
        "filename": file_info["filename"],
        "content_type": file_info["content_type"],
    }
