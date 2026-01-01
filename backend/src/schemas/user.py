"""User Pydantic Schemas"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """회원가입 요청 스키마"""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    nationality: Optional[str] = Field(None, max_length=100)
    role: str = Field(default="foreign")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """비밀번호 강도 검증"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        """역할 검증"""
        allowed_roles = ["foreign", "consultant", "admin"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v


class UserResponse(BaseModel):
    """사용자 응답 스키마"""

    id: UUID
    email: str
    first_name: str
    last_name: str
    nationality: Optional[str]
    role: str
    visa_type: Optional[str]
    preferred_language: Optional[str]
    residential_area: Optional[str]
    phone_number: Optional[str]
    bio: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: ORM 모드 활성화


class LoginRequest(BaseModel):
    """로그인 요청 스키마"""

    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """토큰 응답 스키마"""

    access_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    """프로필 수정 요청 스키마"""

    nationality: Optional[str] = Field(None, max_length=100)
    visa_type: Optional[str] = Field(None, max_length=100)
    preferred_language: Optional[str] = Field("ko", max_length=10)
    residential_area: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None

    @field_validator("nationality", "phone_number", "residential_area", mode="before")
    @classmethod
    def validate_non_empty_string(cls, v: Optional[str]) -> Optional[str]:
        """빈 문자열 검증 (None으로 변환)"""
        if v is not None and v.strip() == "":
            return None
        return v
