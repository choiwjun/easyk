from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# 데이터베이스 엔진 생성
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # DEBUG 모드에서 SQL 쿼리 로깅
    pool_pre_ping=True,   # 연결 유효성 검사
)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 (모든 모델의 부모)
Base = declarative_base()


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
