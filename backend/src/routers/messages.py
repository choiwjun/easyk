"""Messages Router"""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..models.message import Message
from ..schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse,
)
from ..services.message_service import (
    get_consultation_messages as get_consultation_messages_service,
    send_message as send_message_service,
    mark_message_as_read as mark_message_as_read_service,
    get_unread_message_count as get_unread_message_count_service,
)
from ..middleware.auth import get_current_user


router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/consultations/{consultation_id}", response_model=List[MessageResponse])
def get_messages(
    consultation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    상담 메시지 목록 조회

    Args:
        consultation_id: 상담 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        List[MessageResponse]: 메시지 목록 (최신순)
    """
    return get_consultation_messages_service(consultation_id, db)


@router.post("/consultations/{consultation_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    consultation_id: UUID,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    메시지 전송

    Args:
        consultation_id: 상담 ID
        message_data: 메시지 내용
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        MessageResponse: 생성된 메시지
    """
    return send_message_service(
        consultation_id,
        current_user.id,
        message_data.content,
        message_data.file_attachment,
        db
    )


@router.put("/{message_id}/read", response_model=MessageResponse)
def mark_message_as_read(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    메시지 읽음 상태 업데이트

    Args:
        message_id: 메시지 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        MessageResponse: 업데이트된 메시지

    Raises:
        HTTPException: 메시지를 찾을 수 없거나 권한이 없을 때
    """
    message = mark_message_as_read_service(message_id, current_user.id, db)
    if not message:
        raise status.HTTPException(
            status_code=404,
            detail="Message not found"
        )
    return message


@router.get("/unread/count", response_model=dict)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    읽지 않은 메시지 수 조회

    Args:
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        dict: { count: 읽지 않은 메시지 수 }
    """
    count = get_unread_message_count_service(current_user.id, db)
    return {"count": count}



