from sqlalchemy import create_engine, TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid

try:
    from .config import settings
except ImportError:
    # For Alembic migrations
    from config import settings


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses CHAR(36), storing as stringified hex values.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            else:
                return value

# 데이터베이스 엔진 생성 (성능 최적화 옵션 포함)
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # DEBUG 모드에서 SQL 쿼리 로깅
    pool_pre_ping=True,  # 연결 유효성 검사
    pool_size=10,  # 연결 풀 크기
    max_overflow=20,  # 최대 연결 수
    pool_recycle=3600,  # 1시간마다 연결 재사용
)

# 세션 팩토리 생성 (성능 최적화 옵션 포함)
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    expire_on_commit=False,  # 커밋 후 객체 만료 방지
)

# Base 클래스 (모든 모델의 부모)
Base = declarative_base()

# UUID type alias for models to use
UUID = GUID


# 의존성 주입용 DB 세션
def get_db():
    """
    FastAPI 의존성으로 사용할 DB 세션 생성

    Usage:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
