from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .middleware.security import rate_limiter, rate_limit_exceeded_handler, validate_environment_variables
from .routers import auth, users, consultations, payments, reviews, consultants, jobs, support_keywords, government_supports

# 환경 변수 검증 (실행 시)
try:
    validate_environment_variables()
except ValueError as e:
    print(f"⚠️  Configuration Error: {e}")
    print("Please set the required environment variables in .env file")

# FastAPI 앱 생성
app = FastAPI(
    title="easyK API",
    description="외국인 맞춤형 정착 지원 플랫폼 API",
    version="0.1.0",
)

# CORS 설정 (보안 강화)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting 미들웨어
app.state.limiter = rate_limiter
app.add_exception_handler(Exception, rate_limit_exceeded_handler)

# 라우터 등록
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(consultations.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(consultants.router)
app.include_router(jobs.router)
app.include_router(support_keywords.router)
app.include_router(government_supports.router)


# Health Check 엔드포인트
@app.get("/")
async def root():
    return {
        "message": "easyK API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
