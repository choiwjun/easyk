from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # Database
    # HIGH FIX: 프로덕션에서는 반드시 환경 변수로 설정 필요
    DATABASE_URL: str

    # Supabase (Alternative to local PostgreSQL)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_DB_URL: str = ""

    # Security
    # HIGH FIX: 프로덕션에서는 반드시 강력한 시크릿 키 설정 필요
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # SMTP
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # Application
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Payment
    TOSS_CLIENT_KEY: str = ""
    TOSS_SECRET_KEY: str = ""
    TOSS_WEBHOOK_SECRET: str = ""  # 웹훅 서명 검증용 시크릿

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    @property
    def origins_list(self) -> List[str]:
        """CORS origins를 리스트로 반환"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# 싱글톤 설정 인스턴스
settings = Settings()
