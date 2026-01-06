from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # Database
    # HIGH FIX: 프로덕션에서는 반드시 환경 변수로 설정 필요
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/easyk"

    # Supabase (Alternative to local PostgreSQL)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_DB_URL: str = ""

    # Security
    # HIGH FIX: 프로덕션에서는 반드시 강력한 시크릿 키 설정 필요
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email / SMTP
    EMAIL_ENABLED: bool = False  # 이메일 기능 활성화 여부
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "noreply@easyk.com"

    # Application
    DEBUG: bool = True

    # File Upload
    UPLOAD_DIR: str = "uploads"  # 파일 업로드 경로

    # CORS 설정 (콤마로 구분된 다중 도메인 지원)
    # 로컬 개발: http://localhost:3000
    # Vercel 배포: https://your-app.vercel.app
    # 두 도메인 모두 허용: http://localhost:3000,https://your-app.vercel.app
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Payment
    TOSS_CLIENT_KEY: str = ""
    TOSS_SECRET_KEY: str = ""
    TOSS_WEBHOOK_SECRET: str = ""  # 웹훅 서명 검증용 시크릿

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # .env 파일의 추가 필드 무시
    )

    @property
    def origins_list(self) -> List[str]:
        """CORS origins를 리스트로 반환 (빈 값 무시)"""
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]


# 싱글톤 설정 인스턴스
settings = Settings()
