"""Message Schemas"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MessageBase(BaseModel):
    """메시지 베이스 스키마"""
    sender_id: str
    content: str
    file_attachment: Optional[str] = None
    is_read: bool = False


class MessageCreate(MessageBase):
    """메시지 생성 스키마"""
    pass


class MessageUpdate(BaseModel):
    """메시지 업데이트 스키마"""
    content: Optional[str] = None
    is_read: Optional[bool] = None


class MessageResponse(MessageBase):
    """메시지 응답 스키마"""
    id: str
    consultation_id: str
    created_at: datetime

    class Config:
        from_attributes = True



