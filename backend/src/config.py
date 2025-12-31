from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/easyk"

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
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
