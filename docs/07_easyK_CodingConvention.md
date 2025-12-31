# easyK Coding Convention & AI Collaboration Guide

**문서 버전**: v1.0  
**작성일**: 2025-12-30  
**프로젝트**: easyK (외국인 맞춤형 정착 지원 플랫폼)  
**대상**: 개발팀, AI 코딩 파트너 (Claude Code)

---

## 문서 개요

이 문서는 **easyK 프로젝트의 모든 개발자(인간과 AI)가 따를 코딩 규칙과 협업 원칙**을 정의합니다.
목표는 고품질의 유지보수 가능하며 안전한 코드를 일관되게 생성하는 것입니다.

---

## 1. 핵심 원칙

### 1.1 "신뢰하되, 검증하라" (Trust, But Verify)

- AI 코딩 파트너가 제안한 코드를 신뢰하되, **항상 검증**합니다.
- 생성된 코드는 반드시 **테스트와 코드 리뷰**를 거칩니다.
- 보안, 성능, 가독성을 기준으로 평가합니다.

### 1.2 명확한 커뮤니케이션

- **구체적인 지시**: "버튼을 만들어"보다 "Design System의 Primary Button 컴포넌트를 구현하되, onClick 핸들러를 추가하고..."
- **컨텍스트 제공**: 이전 코드, 관련 문서, 의도를 명확하게 전달합니다.
- **개선 피드백**: "그게 아니라..."가 아닌 구체적인 이유와 함께 피드백합니다.

### 1.3 코드는 인간을 위해

- 코드는 **인간이 읽기 쉬워야** 합니다. 코드 실행은 부가 효과입니다.
- 명확한 이름, 주석, 구조를 우선합니다.
- 과도한 최적화나 "영리한" 코드는 피합니다.

---

## 2. 프로젝트 설정 및 기술 스택

### 2.1 선택된 기술 스택

| 계층 | 기술 | 버전 | 이유 |
|------|------|------|------|
| **프론트엔드** | Next.js | 14+ | React 최적화, 빠른 개발, AI 도구 학습도 높음 |
| **프론트엔드** | TypeScript | 5.0+ | 타입 안전성, 버그 조기 발견 |
| **스타일링** | Tailwind CSS | 3.0+ | 빠른 개발, 일관된 디자인 |
| **상태 관리** | React Context / Zustand | - | 간단함, 번들 크기 작음 |
| **백엔드** | Python | 3.11+ | 배우기 쉬움, 빠른 개발 |
| **프레임워크** | FastAPI | 0.104+ | 비동기, 성능, 자동 문서화 |
| **ORM** | SQLAlchemy | 2.0+ | 유연성, 표준 SQL 생성 |
| **데이터베이스** | PostgreSQL (Supabase) | 15+ | 관계형, 안정성, 확장성 |
| **배포** | Vercel (프론트엔드) | - | 최적화된 배포 |
| **배포** | Railway (백엔드) | - | 간단한 배포, 자동 스케일 |

### 2.2 개발 환경 설정

**필수 도구**:
- Node.js 18+
- Python 3.11+
- Git
- 텍스트 에디터 (VS Code 권장)

**권장 VS Code 확장**:
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

**.env 파일 구조**:

프론트엔드 (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=easyK
NEXT_PUBLIC_ANALYTICS_KEY=
```

백엔드 (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost/easyk
SUPABASE_URL=https://*.supabase.co
SUPABASE_KEY=
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SECRET_KEY=your-secret-key
DEBUG=False
```

---

## 3. 아키텍처 및 모듈성

### 3.1 프론트엔드 폴더 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   ├── (auth)/            # 인증 관련 (라우트 그룹)
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx     # 인증 페이지 레이아웃
│   ├── (dashboard)/       # 대시보드 (인증 필요)
│   │   ├── consultations/
│   │   ├── jobs/
│   │   ├── supports/
│   │   └── layout.tsx
│   └── api/               # API 라우트 (선택사항)
│
├── components/
│   ├── ui/                # Design System 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── consultations/     # 기능 컴포넌트
│   ├── jobs/
│   └── supports/
│
├── lib/
│   ├── api.ts            # API 호출 함수
│   ├── hooks.ts          # 커스텀 훅
│   ├── utils.ts          # 유틸리티 함수
│   └── constants.ts      # 상수
│
├── styles/
│   └── globals.css       # 전역 스타일
│
├── types/
│   └── index.ts          # TypeScript 타입 정의
│
└── context/
    └── AuthContext.tsx   # 전역 상태 (인증 등)
```

### 3.2 백엔드 폴더 구조

```
src/
├── main.py               # 메인 FastAPI 앱
├── config.py             # 설정 (환경 변수)
├── database.py           # DB 연결 및 세션
│
├── routers/              # API 엔드포인트
│   ├── auth.py          # 인증 (로그인, 회원가입)
│   ├── users.py         # 사용자 프로필
│   ├── consultants.py   # 전문가 관리
│   ├── consultations.py # 상담 신청
│   ├── jobs.py          # 일자리
│   ├── payments.py      # 결제
│   └── supports.py      # 정부 지원
│
├── models/               # SQLAlchemy 데이터베이스 모델
│   ├── user.py
│   ├── consultant.py
│   ├── consultation.py
│   ├── job.py
│   ├── payment.py
│   └── support.py
│
├── schemas/              # Pydantic 요청/응답 스키마
│   ├── user.py
│   ├── consultation.py
│   └── job.py
│
├── services/             # 비즈니스 로직
│   ├── auth_service.py
│   ├── matching_service.py
│   └── email_service.py
│
├── middleware/           # 미들웨어
│   └── auth.py
│
├── utils/                # 유틸리티
│   ├── validators.py
│   └── helpers.py
│
└── tests/                # 테스트
    ├── test_auth.py
    └── test_consultations.py
```

### 3.3 컴포넌트 분리 원칙

**프론트엔드**:
- **UI 컴포넌트**: Design System에 정의된 Button, Input 등 (재사용 가능, 상태 없음)
- **기능 컴포넌트**: 특정 기능 구현 (상담 폼, 일자리 카드 등)
- **페이지**: 완전한 페이지 (layout과 함께 라우팅)

**백엔드**:
- **Router**: HTTP 엔드포인트 정의
- **Model**: 데이터베이스 테이블 정의
- **Schema**: 요청/응답 검증
- **Service**: 비즈니스 로직 (라우터에서 호출)

---

## 4. AI 소통 원칙 (프롬프트 엔지니어링)

### 4.1 효과적인 지시 방법

**❌ 나쁜 예**:
```
"Button을 만들어줘"
```

**✅ 좋은 예**:
```
"Design System 섹션 4.1의 Primary Button 스펙을 따르되, 
onClick 핸들러를 받아서 로딩 상태일 때 스피너를 보여주고, 
TypeScript Props 타입도 정의해줘. 
src/components/ui/Button.tsx에 구현하고, 
index.ts에도 export해줘."
```

### 4.2 컨텍스트 제공

**지시할 때 제공해야 할 정보**:
1. **관련 문서**: "Design System 섹션 4.2", "PRD의 US-1.1"
2. **기존 코드**: 유사한 컴포넌트 또는 함수의 코드 제시
3. **의도**: 왜 이것을 만드는지
4. **제약사항**: 성능, 보안, 브라우저 호환성 등
5. **원하는 출력 형식**: 파일 경로, 함수 서명 등

**예시**:
```
"Database Design 섹션 3의 Consultations 테이블 스펙에 따라
FastAPI로 상담 신청 API를 만들어줘.

POST /api/consultations 엔드포인트로:
1. 요청: user_id, consultation_type, content, preferred_language
2. 응답: consultation_id, status, created_at
3. 검증: user_id와 consultation_type은 필수, content는 최소 10자

src/schemas/consultation.py에 Pydantic 스키마 정의하고,
src/routers/consultations.py에 엔드포인트 구현해줘."
```

### 4.3 피드백 제공 방식

**❌ 나쁜 방식**:
```
"이건 틀렸어. 다시 해."
```

**✅ 좋은 방식**:
```
"거의 다 맞는데, 한 가지 수정이 필요해.
TRD 섹션 5 보안에서 비밀번호는 bcrypt로 해싱해야 해.
현재 코드에서:
- password_hash 필드를 추가해줘
- 회원가입 시 bcrypt.hashpw()로 해싱하고
- 로그인 시 bcrypt.checkpw()로 검증해줘"
```

---

## 5. 코드 품질 및 보안

### 5.1 코드 스타일 (Linting & Formatting)

**프론트엔드**:
```bash
# .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unescaped-entities": "warn",
    "@next/next/no-img-element": "warn"
  }
}

# prettier.config.js
module.exports = {
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2
};
```

**백엔드**:
```bash
# Python style guide: PEP 8
# 도구: black, isort, flake8

# 실행
black src/
isort src/
flake8 src/
```

### 5.2 타입 안전성

**프론트엔드 (TypeScript)**:
```typescript
// ✅ 좋은 예
interface ConsultationFormProps {
  onSubmit: (data: ConsultationData) => Promise<void>;
  isLoading: boolean;
}

function ConsultationForm({ onSubmit, isLoading }: ConsultationFormProps) {
  // ...
}

// ❌ 나쁜 예
function ConsultationForm(props: any) {
  // ...
}
```

**백엔드 (Pydantic)**:
```python
# ✅ 좋은 예
from pydantic import BaseModel, EmailStr

class UserCreateSchema(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "secure123",
                "first_name": "John"
            }
        }

# ❌ 나쁜 예
def create_user(email, password, first_name):  # 타입 정보 없음
    pass
```

### 5.3 보안 체크리스트

| 항목 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| **입력 검증** | React Hook Form | Pydantic 스키마 |
| **XSS 방지** | JSX 자동 escaping | HTML 이스케이프 |
| **CSRF 방지** | Next.js 자동 | CSRF 토큰 (필요시) |
| **SQL Injection** | N/A | SQLAlchemy ORM 사용 |
| **인증** | JWT 토큰 (쿠키) | JWT 검증 미들웨어 |
| **민감 정보** | localStorage 피함 | 환경 변수로 관리 |
| **API 보안** | CORS 설정 | Rate limiting, 로깅 |

**환경 변수 관리**:
```javascript
// ❌ 절대 금지
const API_KEY = "sk_live_abc123";

// ✅ 올바른 방식
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;  // .env.local에서 로드
```

```python
# ❌ 절대 금지
SECRET_KEY = "my-secret-key"

# ✅ 올바른 방식
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
```

### 5.4 에러 처리

**프론트엔드**:
```typescript
// ✅ 좋은 예
async function submitConsultation(data: ConsultationData) {
  try {
    const response = await fetch('/api/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Unknown error');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Consultation submission failed:', error);
    showErrorNotification(error.message);
    throw error;  // 호출자도 처리할 수 있도록
  }
}
```

**백엔드**:
```python
# ✅ 좋은 예
from fastapi import HTTPException, status

@router.post("/consultations")
async def create_consultation(data: ConsultationSchema):
    try:
        # 검증
        if not user_exists(data.user_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # 비즈니스 로직
        consultation = create_consultation_service(data)
        return consultation
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
```

---

## 6. 테스트 및 디버깅

### 6.1 테스트 전략

**프론트엔드**:
```bash
# 테스트 라이브러리
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# 테스트 실행
npm test
```

**예시**:
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**백엔드**:
```bash
# 테스트 라이브러리
pip install pytest pytest-asyncio httpx

# 테스트 실행
pytest src/tests/
```

**예시**:
```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_signup():
    response = client.post('/api/auth/signup', json={
        'email': 'test@example.com',
        'password': 'secure123',
        'first_name': 'John'
    })
    assert response.status_code == 201
    assert 'id' in response.json()

def test_signup_invalid_email():
    response = client.post('/api/auth/signup', json={
        'email': 'invalid-email',
        'password': 'secure123'
    })
    assert response.status_code == 422
```

### 6.2 디버깅 팁

**프론트엔드**:
- VS Code Debugger 사용: F5로 실행
- React DevTools 브라우저 확장
- Network 탭에서 API 호출 확인

**백엔드**:
- 로깅: `logging` 모듈 사용
- 디버거: `pdb` 또는 VS Code Debugger

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/consultations")
async def create_consultation(data: ConsultationSchema):
    logger.info(f"Creating consultation for user {data.user_id}")
    logger.debug(f"Data: {data}")
    # ...
```

---

## 7. 커밋 메시지 컨벤션

**Conventional Commits** 형식 사용:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**타입**:
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 (포맷팅, 세미콜론 등)
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `test`: 테스트 추가/수정
- `chore`: 빌드, 패키지 관리 등

**예시**:
```
feat(consultations): add consultation request form

- Implement consultation request API endpoint
- Add form validation for consultation type and content
- Integrate with matching service

Closes #123
```

---

## 8. 코드 리뷰 가이드

### 8.1 리뷰 체크리스트

- [ ] 코드가 작동하는가?
- [ ] 테스트가 통과하는가?
- [ ] 관련 문서와 일치하는가?
- [ ] 코드 스타일을 따르는가?
- [ ] 보안 취약점이 없는가?
- [ ] 성능 문제가 없는가?
- [ ] 오류 처리가 적절한가?
- [ ] 주석/문서화가 충분한가?

### 8.2 리뷰 피드백 방식

**❌ 나쁜 방식**:
```
"이 함수 이름이 구려"
```

**✅ 좋은 방식**:
```
"함수 이름을 더 명확하게 해주면 좋겠어.
`processConsultation`보다 `createAndMatchConsultation`이
함수의 역할을 더 잘 표현할 것 같아."
```

---

## 9. 배포 및 모니터링

### 9.1 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 성능 지표 확인 (로드 시간 < 2초)
- [ ] 보안 취약점 스캔

### 9.2 모니터링

**프론트엔드**:
- Google Analytics: 사용자 행동 분석
- Sentry: 클라이언트 에러 추적

**백엔드**:
- Sentry: 서버 에러 추적
- 로깅: 주요 이벤트 기록
- 성능 모니터링: API 응답 시간 추적

---

## 10. AI와의 협업 워크플로우

### 10.1 전형적인 개발 사이클

1. **요청 작성**
   ```
   "Design System 섹션 4.2의 Input 컴포넌트를 구현해줘.
   Props: label, placeholder, value, onChange, error
   상태: default, focus, error, disabled
   파일: src/components/ui/Input.tsx"
   ```

2. **코드 검토**
   - 생성된 코드를 읽고 이해합니다
   - 요구사항과 일치하는지 확인
   - 테스트 작성

3. **피드백 및 수정**
   ```
   "좋은데, 한 가지만 수정해줄래.
   에러 메시지가 input 아래에 표시되어야 해.
   현재 코드에서 error props를 받으면
   빨강 테두리 + 아래에 14px Regular 텍스트로 에러 메시지 표시"
   ```

4. **배포**
   - 최종 코드 검토
   - 테스트 확인
   - 커밋 및 푸시

### 10.2 문제 해결 패턴

**문제**: AI가 생성한 코드에 버그가 있을 때

```
"이 코드를 실행하면 에러가 나.
에러 메시지: 'Cannot read property of undefined'

문제가 뭘까?
[에러 스택 트레이스 붙여넣기]

생각해보니 consultation이 null일 수 있어.
안전하게 처리하려면 어떻게 해야 할까?"
```

---

## 11. 문서화

### 11.1 코드 주석

**필요한 곳에만** 주석을 달되, **왜**를 설명합니다:

```typescript
// ✅ 좋은 예
async function matchConsultant(consultationType: string) {
  // 사용자의 희망 언어와 상담 유형에 맞는 전문가를 찾기 위해
  // 평점이 높은 순으로 정렬합니다
  const specialists = consultants
    .filter(c => c.specialties.includes(consultationType))
    .sort((a, b) => b.rating - a.rating);
  
  return specialists[0];
}

// ❌ 나쁜 예
// 전문가 찾기
const s = consultants.filter(c => c.s.includes(consultationType)).sort(...);
return s[0];
```

### 11.2 README 작성

**프로젝트 루트의 README.md**:
```markdown
# easyK

## 개요
외국인 맞춤형 정착 지원 플랫폼

## 시작하기

### 전제 조건
- Node.js 18+
- Python 3.11+
- PostgreSQL

### 설치
1. 저장소 클론
2. 프론트엔드 설치: `cd frontend && npm install`
3. 백엔드 설치: `cd backend && pip install -r requirements.txt`

### 개발 실행
프론트엔드: `npm run dev`
백엔드: `uvicorn src.main:app --reload`

## 기술 스택
[TRD 섹션 2 참고]

## 문서
- [PRD](./docs/PRD.md)
- [TRD](./docs/TRD.md)
- [Design System](./docs/DesignSystem.md)

## 기여 가이드
[이 문서]를 참고하세요.
```

---

## 12. 최종 체크리스트

모든 개발자(인간과 AI)는 다음을 확인하고 배포합니다:

- [ ] 코드가 작동하는가?
- [ ] 테스트가 통과하는가?
- [ ] 코드 스타일을 따르는가?
- [ ] 타입 안전성이 있는가? (TypeScript, Pydantic)
- [ ] 보안 취약점이 없는가?
- [ ] 성능 요구사항을 만족하는가?
- [ ] 에러 처리가 적절한가?
- [ ] 주석과 문서화가 충분한가?
- [ ] 관련 문서 (PRD, TRD, Design System)와 일치하는가?
- [ ] 다른 개발자가 코드를 이해할 수 있는가?

---

**문서 관리**  
- 버전 관리: 코딩 규칙 변경 시 업데이트
- 변경 이력: 새로운 규칙/도구 추가 시 기록
- 피드백: 팀원들의 개선 제안 환영
