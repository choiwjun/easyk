"""Initial data seeding script for easyK"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from contextlib import asynccontextmanager
import json
import uuid

from src.models import User, Consultant, Job, GovernmentSupport
from src.config import settings
from src.utils.auth import hash_password


@asynccontextmanager
async def get_db_session():
    """Database session context manager"""
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await engine.dispose()


async def seed_users_and_consultants(session: AsyncSession):
    """Create 5 consultants with their user accounts"""
    
    # Check if users already exist
    result = await session.execute(select(func.count()).select_from(User))
    user_count = result.scalar()
    
    if user_count > 0:
        print(f"ℹ️  Users already exist (count: {user_count}). Skipping user seeding.")
        return
    
    consultants_data = [
        {
            "email": "consultant1@easyk.com",
            "password": "Consultant123!",
            "first_name": "김",
            "last_name": "변호사",
            "phone_number": "010-1234-5678",
            "specialties": ["visa", "labor"],
            "office_name": "김법률사무소",
            "office_phone": "02-1234-5678",
            "office_address": "서울특별시 강남구 테헤란로 123",
            "years_experience": 10,
            "hourly_rate": 150000
        },
        {
            "email": "consultant2@easyk.com",
            "password": "Consultant123!",
            "first_name": "이",
            "last_name": "세무사",
            "phone_number": "010-2345-6789",
            "specialties": ["business", "contract"],
            "office_name": "이세무회계",
            "office_phone": "02-2345-6789",
            "office_address": "서울특별시 서초구 서초대로 456",
            "years_experience": 8,
            "hourly_rate": 120000
        },
        {
            "email": "consultant3@easyk.com",
            "password": "Consultant123!",
            "first_name": "박",
            "last_name": "변호사",
            "phone_number": "010-3456-7890",
            "specialties": ["visa", "immigration"],
            "office_name": "박이민법률사무소",
            "office_phone": "02-3456-7890",
            "office_address": "서울특별시 용산구 한강대로 789",
            "years_experience": 12,
            "hourly_rate": 180000
        },
        {
            "email": "consultant4@easyk.com",
            "password": "Consultant123!",
            "first_name": "최",
            "last_name": "노무사",
            "phone_number": "010-4567-8901",
            "specialties": ["labor", "social"],
            "office_name": "최노무사무소",
            "office_phone": "02-4567-8901",
            "office_address": "서울특별시 마포구 마포대로 101",
            "years_experience": 7,
            "hourly_rate": 100000
        },
        {
            "email": "consultant5@easyk.com",
            "password": "Consultant123!",
            "first_name": "정",
            "last_name": "변호사",
            "phone_number": "010-5678-9012",
            "specialties": ["visa", "contract", "business"],
            "office_name": "정종합법률",
            "office_phone": "02-5678-9012",
            "office_address": "서울특별시 송파구 올림픽로 202",
            "years_experience": 15,
            "hourly_rate": 200000
        }
    ]
    
    for idx, data in enumerate(consultants_data, 1):
        # Create User
        user = User(
            email=data["email"],
            password_hash=hash_password(data["password"]),
            role="consultant",
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone_number=data["phone_number"],
            nationality="한국",
            preferred_language="ko",
            email_verified=True
        )
        session.add(user)
        await session.flush()
        
        # Create Consultant
        consultant = Consultant(
            user_id=user.id,
            specialties=json.dumps(data["specialties"], ensure_ascii=False),
            office_name=data["office_name"],
            office_phone=data["office_phone"],
            office_address=data["office_address"],
            years_experience=data["years_experience"],
            hourly_rate=data["hourly_rate"],
            is_active=True,
            is_verified=True,
            total_reviews=0,
            average_rating=4.5,
            availability=json.dumps({
                "mon": "09:00-18:00",
                "tue": "09:00-18:00",
                "wed": "09:00-18:00",
                "thu": "09:00-18:00",
                "fri": "09:00-18:00"
            }, ensure_ascii=False)
        )
        session.add(consultant)
        
        print(f"✅ Created consultant {idx}: {data['first_name']}{data['last_name']} ({data['email']})")
    
    print(f"✅ Created {len(consultants_data)} consultants")


async def seed_jobs(session: AsyncSession):
    """Create 15 job postings"""
    
    # Check if jobs already exist
    result = await session.execute(select(func.count()).select_from(Job))
    job_count = result.scalar()
    
    if job_count > 0:
        print(f"ℹ️  Jobs already exist (count: {job_count}). Skipping job seeding.")
        return
    
    # Get a user for posted_by
    result = await session.execute(select(User).where(User.role == "admin").limit(1))
    admin_user = result.scalar_one_or_none()
    
    if not admin_user:
        # Create an admin user if none exists
        admin_user = User(
            email="admin@easyk.com",
            password_hash=hash_password("Admin123!"),
            role="admin",
            first_name="관리자",
            last_name="시스템",
            nationality="한국",
            email_verified=True
        )
        session.add(admin_user)
        await session.flush()
        print(f"✅ Created admin user for job postings")
    
    jobs_data = [
        {
            "position": "외국인 고용 담당자",
            "company_name": "고양시청",
            "location": "경기도 고양시",
            "employment_type": "full-time",
            "salary_range": "연봉 3,500만원~4,000만원",
            "description": "외국인 근로자 지원 및 관리 업무",
            "requirements": "외국어 능력 우대, 행정 업무 경력 3년 이상",
            "preferred_qualifications": "중국어, 영어, 베트남어 능력",
            "benefits": "4대 보험, 연차 수당, 퇴직금",
            "required_languages": ["ko", "en", "zh"]
        },
        {
            "position": "다국어 상담원",
            "company_name": "고양시 다문화가족지원센터",
            "location": "경기도 고양시 덕양구",
            "employment_type": "full-time",
            "salary_range": "연봉 3,000만원~3,500만원",
            "description": "다문화 가족 상담 및 지원 업무",
            "requirements": "최소 2개 이상 외국어 능력",
            "preferred_qualifications": "상담 자격증 소지자 우대",
            "benefits": "야간 근무 수당, 건강검진",
            "required_languages": ["ko", "zh", "en"]
        },
        {
            "position": "생산직 근로자",
            "company_name": "삼성전자",
            "location": "경기도 고양시 일산동구",
            "employment_type": "full-time",
            "salary_range": "시급 12,000원",
            "description": "전자부품 생산 및 조립 업무",
            "requirements": "특별한 자격 불필요, 건강한 신체",
            "preferred_qualifications": "제조업 경력 우대",
            "benefits": "야간 근무 수당, 식대 지급",
            "required_languages": ["ko"]
        },
        {
            "position": "패스트푸드 알바",
            "company_name": "맥도날드",
            "location": "경기도 고양시 일산서구",
            "employment_type": "part-time",
            "salary_range": "시급 10,000원",
            "description": "주문 접수 및 배달 서비스",
            "requirements": "고등학교 졸업 이상",
            "preferred_qualifications": "서비스 업무 경력",
            "benefits": "시간 외 근무 수당, 식사 제공",
            "required_languages": ["ko"]
        },
        {
            "position": "청소원",
            "company_name": "고양시청",
            "location": "경기도 고양시",
            "employment_type": "full-time",
            "salary_range": "연봉 2,800만원~3,200만원",
            "description": "공공시설 청소 및 관리",
            "requirements": "특별한 자격 불필요",
            "preferred_qualifications": "청소 경력 우대",
            "benefits": "4대 보험, 연차 수당",
            "required_languages": ["ko"]
        },
        {
            "position": "외국인 교사",
            "company_name": "고양국제고등학교",
            "location": "경기도 고양시 덕양구",
            "employment_type": "full-time",
            "salary_range": "연봉 4,000만원~5,000만원",
            "description": "영어 수업 및 학생 멘토링",
            "requirements": "교사 자격증, 원어민 수준 영어 능력",
            "preferred_qualifications": "교육 경력 3년 이상",
            "benefits": "방 지원, 비자 비용 지원",
            "required_languages": ["en", "ko"]
        },
        {
            "position": "번역가",
            "company_name": "고양시 다문화가족지원센터",
            "location": "경기도 고양시",
            "employment_type": "contract",
            "salary_range": "건당 10~15만원",
            "description": "공문서 및 서류 번역",
            "requirements": "한국어-외국어 번역 능력",
            "preferred_qualifications": "번역 자격증 소지",
            "benefits": "재택 근무 가능",
            "required_languages": ["ko", "zh"]
        },
        {
            "position": "운전 기사",
            "company_name": "고양시 시설관리공단",
            "location": "경기도 고양시",
            "employment_type": "full-time",
            "salary_range": "연봉 3,000만원~3,500만원",
            "description": "시설 이동 및 물품 운송",
            "requirements": "1종 대형 운전면허",
            "preferred_qualifications": "운전 경력 2년 이상",
            "benefits": "야간 근무 수당, 4대 보험",
            "required_languages": ["ko"]
        },
        {
            "position": "요식업 서비스원",
            "company_name": "일산 롯데백화점",
            "location": "경기도 고양시 일산동구",
            "employment_type": "full-time",
            "salary_range": "연봉 2,500만원~3,000만원",
            "description": "식당 서비스 및 고객 응대",
            "requirements": "서비스 마인드",
            "preferred_qualifications": "호텔 경력 우대",
            "benefits": "휴가비, 피복 지급",
            "required_languages": ["ko"]
        },
        {
            "position": "창업 지원 상담원",
            "company_name": "고양시 창업지원센터",
            "location": "경기도 고양시",
            "employment_type": "full-time",
            "salary_range": "연봉 3,500만원~4,000만원",
            "description": "외국인 창업 상담 및 지원",
            "requirements": "행정 또는 경영학 전공",
            "preferred_qualifications": "창업 지원 경험 우대",
            "benefits": "연구비 지원, 교육 프로그램",
            "required_languages": ["ko", "en"]
        },
        {
            "position": "보육 교사",
            "company_name": "고양시 다문화가족지원센터",
            "location": "경기도 고양시 덕양구",
            "employment_type": "full-time",
            "salary_range": "연봉 2,800만원~3,200만원",
            "description": "다문화 아동 교육 및 보육",
            "requirements": "보육 교사 자격증",
            "preferred_qualifications": "다문화 가족 지원 경험",
            "benefits": "야간 근무 수당, 건강검진",
            "required_languages": ["ko", "zh"]
        },
        {
            "position": "IT 개발자",
            "company_name": "고양시 정보통신과",
            "location": "경기도 고양시",
            "employment_type": "full-time",
            "salary_range": "연봉 5,000만원~6,000만원",
            "description": "시스템 개발 및 유지보수",
            "requirements": "Python, JavaScript 능력",
            "preferred_qualifications": "공공기관 프로젝트 경험",
            "benefits": "연구비, 퇴직금, 4대 보험",
            "required_languages": ["ko", "en"]
        },
        {
            "position": "간병인",
            "company_name": "고양시 보건소",
            "location": "경기도 고양시",
            "employment_type": "full-time",
            "salary_range": "연봉 3,000만원~3,500만원",
            "description": "요양 간병 및 환자 케어",
            "requirements": "간병 자격증",
            "preferred_qualifications": "간병 경력 2년 이상",
            "benefits": "야간 근무 수당, 4대 보험",
            "required_languages": ["ko"]
        },
        {
            "position": "건설 현장 인부",
            "company_name": "GS건설",
            "location": "경기도 고양시 일산서구",
            "employment_type": "temporary",
            "salary_range": "일당 15~20만원",
            "description": "건설 현장 단순 노무",
            "requirements": "특별한 자격 불필요",
            "preferred_qualifications": "건설 경험 우대",
            "benefits": "야간 근무 수당",
            "required_languages": ["ko"]
        },
        {
            "position": "외국인 지원 통역사",
            "company_name": "고양시 다문화가족지원센터",
            "location": "경기도 고양시",
            "employment_type": "full-time",
            "salary_range": "연봉 3,200만원~3,700만원",
            "description": "다국어 통역 및 지원 서비스",
            "requirements": "최소 3개 국어 능력",
            "preferred_qualifications": "통역 자격증 소지",
            "benefits": "교육비 지원, 4대 보험",
            "required_languages": ["ko", "en", "zh", "vi"]
        }
    ]
    
    now = datetime.utcnow()
    
    for idx, data in enumerate(jobs_data, 1):
        job = Job(
            posted_by=admin_user.id,
            position=data["position"],
            company_name=data["company_name"],
            location=data["location"],
            employment_type=data["employment_type"],
            salary_range=data["salary_range"],
            salary_currency="KRW",
            description=data["description"],
            requirements=data["requirements"],
            preferred_qualifications=data["preferred_qualifications"],
            benefits=data["benefits"],
            required_languages=json.dumps(data["required_languages"], ensure_ascii=False),
            status="active",
            deadline=now + timedelta(days=30 + idx * 2)
        )
        session.add(job)
        print(f"✅ Created job {idx}: {data['position']} at {data['company_name']}")
    
    print(f"✅ Created {len(jobs_data)} job postings")


async def seed_government_supports(session: AsyncSession):
    """Create 10 government support programs"""
    
    # Check if supports already exist
    result = await session.execute(select(func.count()).select_from(GovernmentSupport))
    support_count = result.scalar()
    
    if support_count > 0:
        print(f"ℹ️  Government supports already exist (count: {support_count}). Skipping support seeding.")
        return
    
    supports_data = [
        {
            "title": "외국인 정착 지원금",
            "category": "subsidy",
            "description": "한국에 정착하는 외국인 가정에 정착 비용을 지원합니다.",
            "eligibility": "거주 허가(F-2, F-5, F-6)를 받은 외국인 가정",
            "eligible_visa_types": ["F-2", "F-5", "F-6"],
            "support_content": "가구당 월 50만원 최대 6개월 지원",
            "department": "법무부",
            "department_phone": "02-2110-3000",
            "department_website": "https://www.moj.go.kr",
            "status": "active"
        },
        {
            "title": "다문화 가족 한국어 교육",
            "category": "education",
            "description": "다문화 가족 구성원을 위한 무료 한국어 교육 프로그램입니다.",
            "eligibility": "결혼 이민자, 귀화자, 영주권자",
            "eligible_visa_types": ["F-1", "F-2", "F-5", "F-6"],
            "support_content": "주 2회, 6개월 과정 무료 제공",
            "department": "여성가족부",
            "department_phone": "02-2100-6000",
            "department_website": "https://www.mogef.go.kr",
            "status": "active"
        },
        {
            "title": "외국인 취업 기술 훈련",
            "category": "training",
            "description": "외국인 근로자를 위한 직업 기술 교육 프로그램입니다.",
            "eligibility": "고용 허가(E-9) 비자 소지자",
            "eligible_visa_types": ["E-9"],
            "support_content": "직종별 기술 훈련 3개월 과정, 훈련비 지원",
            "department": "고용노동부",
            "department_phone": "044-202-7000",
            "department_website": "https://www.moel.go.kr",
            "status": "active"
        },
        {
            "title": "비자 연장 지원",
            "category": "visa",
            "description": "외국인의 비자 연장 절차를 지원하고 안내합니다.",
            "eligibility": "모든 체류 비자 소지자",
            "eligible_visa_types": ["E-1", "E-2", "D-2", "F-1", "F-2", "H-1"],
            "support_content": "비자 연장 서류 검토, 접수 대행 지원",
            "department": "법무부 출입국관리사무소",
            "department_phone": "1345",
            "department_website": "https://www.immigration.go.kr",
            "status": "active"
        },
        {
            "title": "다문화 자녀 교육 장려금",
            "category": "subsidy",
            "description": "다문화 가정 자녀의 교육비를 지원합니다.",
            "eligibility": "다문화 가정 자녀 (만 18세 미만)",
            "eligible_visa_types": ["F-2", "F-5", "F-6"],
            "support_content": "월 교육비 20만원, 학용품비 연 30만원",
            "department": "교육부",
            "department_phone": "044-203-6000",
            "department_website": "https://www.moe.go.kr",
            "status": "active"
        },
        {
            "title": "외국인 창업 자금 지원",
            "category": "subsidy",
            "description": "외국인 창업자에게 창업 자금을 지원합니다.",
            "eligibility": "영주권자, 결혼 이민자 창업자",
            "eligible_visa_types": ["F-2", "F-5", "D-8"],
            "support_content": "최대 5,000만원 저리 대출, 경영 컨설팅",
            "department": "중소벤처기업부",
            "department_phone": "042-481-4114",
            "department_website": "https://www.mss.go.kr",
            "status": "active"
        },
        {
            "title": "다문화 가정 주거 지원",
            "category": "housing",
            "description": "다문화 가정을 위한 주거 안정 지원 프로그램입니다.",
            "eligibility": "거주허가(F-2) 및 영주(F-5) 소지자",
            "eligible_visa_types": ["F-2", "F-5"],
            "support_content": "공공임대주택 우선 입주, 주거 비용 지원",
            "department": "국토교통부",
            "department_phone": "044-201-3000",
            "department_website": "https://www.molit.go.kr",
            "status": "active"
        },
        {
            "title": "외국인 노무 상담 지원",
            "category": "education",
            "description": "외국인 근로자의 노무 권익 보호를 위한 상담 서비스입니다.",
            "eligibility": "모든 외국인 근로자",
            "eligible_visa_types": ["E-9", "H-2", "F-1", "F-2"],
            "support_content": "무료 노무 상담, 법률 자문 제공",
            "department": "고용노동부",
            "department_phone": "1544-0077",
            "department_website": "https://www.moel.go.kr",
            "status": "active"
        },
        {
            "title": "다문화 가족 건강 검진",
            "category": "subsidy",
            "description": "다문화 가족을 위한 무료 건강 검진 프로그램입니다.",
            "eligibility": "결혼 이민자 및 그 가족",
            "eligible_visa_types": ["F-1", "F-2", "F-6"],
            "support_content": "기본 건강 검진 무료, 전문 진료 비용 할인",
            "department": "보건복지부",
            "department_phone": "129",
            "department_website": "https://www.mohw.go.kr",
            "status": "active"
        },
        {
            "title": "한국 사회 적응 프로그램",
            "category": "training",
            "description": "외국인이 한국 사회에 잘 적응할 수 있도록 돕는 교육입니다.",
            "eligibility": "입국 1년 미만 외국인",
            "eligible_visa_types": ["E-1", "E-2", "D-2", "F-1", "F-2"],
            "support_content": "한국 문화, 법률, 사회 시스템 교육",
            "department": "법무부",
            "department_phone": "02-2110-3000",
            "department_website": "https://www.moj.go.kr",
            "status": "active"
        }
    ]
    
    now = datetime.utcnow()
    
    for idx, data in enumerate(supports_data, 1):
        support = GovernmentSupport(
            title=data["title"],
            category=data["category"],
            description=data["description"],
            eligibility=data["eligibility"],
            eligible_visa_types=json.dumps(data["eligible_visa_types"], ensure_ascii=False),
            support_content=data["support_content"],
            department=data["department"],
            department_phone=data["department_phone"],
            department_website=data["department_website"],
            application_period_start=now.date(),
            application_period_end=(now + timedelta(days=180)).date(),
            status=data["status"]
        )
        session.add(support)
        print(f"✅ Created support {idx}: {data['title']} ({data['category']})")
    
    print(f"✅ Created {len(supports_data)} government support programs")


async def seed_all_data():
    """Run all data seeding operations"""
    print("=" * 60)
    print("🌱 Starting database seeding for easyK")
    print("=" * 60)
    
    async with get_db_session() as session:
        try:
            # Seed users and consultants
            print("\n📋 Seeding users and consultants...")
            await seed_users_and_consultants(session)
            
            # Seed jobs
            print("\n📋 Seeding jobs...")
            await seed_jobs(session)
            
            # Seed government supports
            print("\n📋 Seeding government supports...")
            await seed_government_supports(session)
            
            print("\n" + "=" * 60)
            print("✅ Database seeding completed successfully!")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_all_data())

