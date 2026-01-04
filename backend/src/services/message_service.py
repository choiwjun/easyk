"""Message Service"""

from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from ..models.message import Message
from ..models.consultation import Consultation
from ..models.user import User
from ..schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse,
)


def get_consultation_messages(
    consultation_id: UUID,
    db: Session
) -> List[Message]:
    """상담 메시지 목록 조회

    Args:
        consultation_id: 상담 ID
        db: 데이터베이스 세션

    Returns:
        List[Message]: 메시지 목록
    """
    messages = db.query(Message).filter(
        Message.consultation_id == consultation_id
    ).order_by(Message.created_at.asc()).all()

    # 읽음 상태 업데이트 (상담 메시지는 조회 시 자동 읽음 처리)
    for message in messages:
        if not message.is_read:
            message.is_read = True
            db.add(message)
    
    db.commit()
    return messages


def get_unread_message_count(
    user_id: UUID,
    db: Session
) -> int:
    """사용자의 읽지 않은 메시지 수 조회

    Args:
        user_id: 사용자 ID
        db: 데이터베이스 세션

    Returns:
        int: 읽지 않은 메시지 수
    """
    return db.query(Message).filter(
        Message.sender_id != user_id,  # 상대방이 보낸 메시지만 카운트
        Message.is_read == False
    ).count()


def send_message(
    consultation_id: UUID,
    sender_id: UUID,
    content: str,
    file_attachment: Optional[str] = None,
    db: Session = None
) -> Message:
    """메시지 전송

    Args:
        consultation_id: 상담 ID
        sender_id: 보내는 사람 ID
        content: 메시지 내용
        file_attachment: 첨부 파일 URL (optional)
        db: 데이터베이스 세션

    Returns:
        Message: 생성된 메시지
    """
    new_message = Message(
        consultation_id=consultation_id,
        sender_id=sender_id,
        content=content,
        file_attachment=file_attachment,
        is_read=False
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # TODO: 실시간 알림 발송 (WebSocket 또는 SSE)
    # 현재는 이메일 알림만 구현되어 있음

    return new_message


def mark_message_as_read(
    message_id: UUID,
    user_id: UUID,
    db: Session
) -> Optional[Message]:
    """메시지 읽음 상태 업데이트

    Args:
        message_id: 메시지 ID
        user_id: 현재 사용자 ID
        db: 데이터베이스 세션

    Returns:
        Optional[Message]: 업데이트된 메시지
    """
    message = db.query(Message).filter(
        Message.id == message_id
    ).first()

    if not message:
        return None

    # 자신의 메시지만 상대방 메시지일 때만 읽음 처리 가능
    if message.sender_id == user_id:
        return None

    message.is_read = True
    db.add(message)
    db.commit()
    db.refresh(message)

    return message




