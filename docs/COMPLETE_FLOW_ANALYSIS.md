# easyK Complete Flow Analysis

> 외국인 맞춤형 정착 지원 플랫폼 - 전체 시스템 흐름 분석 문서
>
> **작성일**: 2026-01-04
> **버전**: 1.0.0

---

## 목차

1. [Architecture Overview](#1-architecture-overview)
2. [User Flows by Role](#2-user-flows-by-role)
3. [API Flow Diagrams](#3-api-flow-diagrams)
4. [Data Flow](#4-data-flow)
5. [Key Implementation Patterns](#5-key-implementation-patterns)
6. [File Structure Map](#6-file-structure-map)
7. [Database Schema](#7-database-schema)

---

## 1. Architecture Overview

### 1.1 System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 14<br/>App Router]
        B[React Components]
        C[API Routes<br/>Proxy Layer]
    end

    subgraph "Backend Layer"
        D[FastAPI Server]
        E[Router Layer]
        F[Service Layer]
        G[Database Layer]
    end

    subgraph "External Services"
        H[PostgreSQL/Supabase]
        I[Toss Payments]
        J[SMTP Email]
        K[File Storage]
    end

    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    F --> I
    F --> J
    F --> K
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React-based full-stack framework |
| **Frontend UI** | Tailwind CSS | Utility-first CSS framework |
| **Backend** | FastAPI (Python 3.10+) | High-performance async API framework |
| **Database** | PostgreSQL | Relational database |
| **ORM** | SQLAlchemy 2.0 | Python SQL toolkit and ORM |
| **Authentication** | JWT (HS256) | Stateless token-based auth |
| **Payment** | Toss Payments API | Korean payment gateway |
| **Email** | SMTP (Gmail) | Notification system |
| **File Storage** | Supabase Storage | Cloud file storage |

### 1.3 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Next.js API Proxy
    participant B as FastAPI Backend
    participant DB as Database

    U->>F: 1. Login Form Submit
    F->>API: 2. POST /api/auth/login
    API->>B: 3. POST /api/auth/login
    B->>DB: 4. Query User by Email
    DB-->>B: 5. User Data
    B->>B: 6. Verify Password (bcrypt)
    B->>B: 7. Generate JWT Token
    B-->>API: 8. Return Token + User Info
    API-->>F: 9. Return Token + User Info
    F->>F: 10. Store Token in localStorage
    F-->>U: 11. Redirect to Dashboard

    Note over U,DB: Subsequent API Requests
    U->>F: 12. Access Protected Page
    F->>API: 13. GET /api/... (Authorization: Bearer TOKEN)
    API->>B: 14. GET /api/... (Authorization: Bearer TOKEN)
    B->>B: 15. Verify JWT Token
    B->>DB: 16. Query User by Token.sub (email)
    DB-->>B: 17. User Data
    B-->>API: 18. Return Protected Data
    API-->>F: 19. Return Protected Data
    F-->>U: 20. Display Data
```

**JWT Token Structure:**
```json
{
  "sub": "user@example.com",
  "role": "foreign|consultant|admin|agency",
  "exp": 1704321600,
  "iat": 1704319800
}
```

**Middleware Chain:**
- `HTTPBearer` security scheme extracts token
- `verify_access_token()` validates JWT signature and expiration
- `get_current_user()` loads user from database
- Role-based guards: `get_current_admin_user()`, `require_admin`

### 1.4 Database Schema Overview

**Core Entities:**

```mermaid
erDiagram
    users ||--o{ consultations : requests
    users ||--o{ job_applications : applies
    users ||--o{ saved_jobs : saves
    users ||--o| consultant : "is a"
    consultants ||--o{ consultations : handles
    consultations ||--|| payments : "paid by"
    consultations ||--o{ reviews : "reviewed by"
    consultations ||--o{ messages : contains
    jobs ||--o{ job_applications : receives
    jobs ||--o{ saved_jobs : "saved by"

    users {
        uuid id PK
        string email UK
        string password_hash
        enum role
        string first_name
        string last_name
        string nationality
        date visa_expiration
        timestamp created_at
    }

    consultants {
        uuid id PK
        uuid user_id FK
        string office_name
        json specialties
        numeric hourly_rate
        numeric average_rating
        boolean is_active
    }

    consultations {
        uuid id PK
        uuid user_id FK
        uuid consultant_id FK
        enum consultation_type
        text content
        enum status
        numeric amount
        enum payment_status
    }

    jobs {
        uuid id PK
        uuid posted_by FK
        string position
        string company_name
        string location
        enum employment_type
        text description
        timestamp deadline
        enum status
    }

    job_applications {
        uuid id PK
        uuid job_id FK
        uuid user_id FK
        text cover_letter
        string resume_url
        enum status
    }

    payments {
        uuid id PK
        uuid consultation_id FK
        uuid user_id FK
        numeric amount
        numeric platform_fee
        string transaction_id
        enum status
    }
```

---

## 2. User Flows by Role

### 2.1 Foreign User Flow (외국인 사용자)

```mermaid
graph TD
    A[회원 가입] --> B[프로필 작성]
    B --> C{주 활동}

    C --> D1[상담 신청]
    C --> D2[일자리 검색]
    C --> D3[정부 지원 확인]

    D1 --> E1[상담 유형 선택<br/>visa/labor/contract/business]
    E1 --> F1[내용 작성 + 상담료 입력]
    F1 --> G1[자동 전문가 매칭<br/>Matching Service]
    G1 --> H1{매칭 성공?}
    H1 -->|Yes| I1[상담 상태: matched]
    H1 -->|No| I2[상담 상태: requested]
    I1 --> J1[전문가 수락 대기]
    J1 --> K1{전문가 응답}
    K1 -->|Accept| L1[결제 페이지]
    K1 -->|Reject| M1[다른 전문가 재매칭]
    L1 --> N1[토스 페이먼츠 결제]
    N1 --> O1[결제 완료 콜백]
    O1 --> P1[상담 진행<br/>status: scheduled]
    P1 --> Q1[상담 완료<br/>status: completed]
    Q1 --> R1[리뷰 작성]

    D2 --> E2[필터링<br/>location/type/keyword]
    E2 --> F2[상세 조회]
    F2 --> G2{지원 여부}
    G2 -->|지원| H2[이력서 + 자소서 작성]
    G2 -->|관심| H3[일자리 저장<br/>SavedJob]
    H2 --> I3[지원서 제출<br/>JobApplication]
    I3 --> J2[관리자 심사 대기]
    J2 --> K2{심사 결과}
    K2 -->|Accepted| L2[채용 확정 알림]
    K2 -->|Rejected| L3[불합격 알림]

    D3 --> E3[자격 조건 확인]
    E3 --> F3[프로그램 상세 조회]
    F3 --> G3[키워드 저장<br/>알림 설정]
```

**Key Pages:**
- `/signup` - 회원가입
- `/consultations` - 상담 목록
- `/consultations/new` - 상담 신청
- `/consultations/[id]` - 상담 상세
- `/consultations/[id]/payment` - 결제
- `/consultations/[id]/review` - 리뷰 작성
- `/jobs` - 일자리 목록
- `/jobs/[id]` - 일자리 상세
- `/jobs/[id]/apply` - 일자리 지원
- `/saved-jobs` - 저장한 일자리
- `/applications` - 내 지원 내역
- `/supports` - 정부 지원 프로그램
- `/supports/[id]/eligibility` - 자격 확인

### 2.2 Consultant Flow (전문가)

```mermaid
graph TD
    A[로그인] --> B[전문가 대시보드<br/>/consultant/dashboard]
    B --> C[통계 확인]
    C --> D[총 상담 수<br/>수익<br/>평균 평점]

    B --> E[상담 요청 목록]
    E --> F[matched 상태 필터링]
    F --> G{상담 수락 여부}

    G -->|Accept| H[상태 변경: scheduled]
    G -->|Reject| I[상태 변경: cancelled<br/>전문가 매칭 해제]

    H --> J[결제 대기]
    J --> K[고객 결제 완료]
    K --> L[상담 진행<br/>메시지 교환]
    L --> M[상담 완료<br/>status: completed]
    M --> N[리뷰 수신<br/>평점 업데이트]
```

**Key Features:**
- **자동 매칭 시스템**: `matching_service.py`의 `find_matching_consultant()`
  - `is_active=True`, `is_verified=True` 조건
  - `specialties` JSON 배열에서 `consultation_type` 검색
  - `average_rating` 내림차순 정렬
- **통계 대시보드**: `/api/consultations/dashboard/stats`
  - 상담 건수 (상태별)
  - 총 수익 (결제 완료된 상담만)
  - 평균 평점 및 리뷰 수

**Key APIs:**
- `GET /api/consultations?status=matched` - 매칭된 상담 조회
- `POST /api/consultations/{id}/accept` - 상담 수락
- `POST /api/consultations/{id}/reject` - 상담 거절
- `GET /api/consultations/dashboard/stats` - 대시보드 통계

### 2.3 Admin Flow (관리자)

```mermaid
graph TD
    A[로그인<br/>role: admin] --> B[관리자 대시보드<br/>/admin/stats]
    B --> C[전체 통계 조회]
    C --> D[사용자 통계<br/>상담 통계<br/>일자리 통계]

    B --> E[일자리 관리<br/>/admin/jobs]
    E --> F[일자리 CRUD]
    F --> G[생성<br/>수정<br/>삭제]

    E --> H[지원자 관리]
    H --> I[지원서 조회<br/>JobApplication]
    I --> J{심사}
    J -->|Accept| K[status: accepted<br/>이메일 알림 발송]
    J -->|Reject| L[status: rejected<br/>이메일 알림 발송]
    J -->|Review| M[status: in_review]
```

**Role Check:**
```python
@router.get("/api/stats/dashboard")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    # ... 통계 조회
```

**Admin-Only APIs:**
- `GET /api/stats/dashboard` - 전체 통계
- `POST /api/jobs` - 일자리 생성
- `PUT /api/jobs/{id}` - 일자리 수정
- `DELETE /api/jobs/{id}` - 일자리 삭제
- `GET /api/jobs/{id}/applications` - 지원자 목록
- `PUT /api/jobs/applications/{id}/status` - 지원 상태 변경

### 2.4 Agency Flow (채용 기관)

```mermaid
graph TD
    A[로그인<br/>role: agency] --> B[채용 기관 대시보드<br/>/agency]
    B --> C[내 공고 관리]
    C --> D[일자리 공고 작성]
    D --> E[공고 정보 입력]
    E --> F[직종<br/>회사명<br/>위치<br/>급여<br/>마감일]
    F --> G[공고 등록<br/>POST /api/jobs]

    B --> H[지원자 관리]
    H --> I[지원서 조회<br/>GET /api/jobs/my-jobs/applications]
    I --> J[지원자 정보 확인]
    J --> K[이력서<br/>자소서<br/>연락처]
    K --> L{심사 결정}
    L -->|Accept| M[채용 확정<br/>이메일 알림]
    L -->|Reject| N[불합격 처리<br/>이메일 알림]
    L -->|Interview| O[면접 일정 조율]

    B --> P[공고 수정/삭제]
    P --> Q[PUT /api/jobs/id]
    P --> R[DELETE /api/jobs/id]
```

**Agency Features:**
- Full CRUD on Job postings (`posted_by = current_user.id`)
- View applications for their jobs
- Update application status
- Manage job status (active/closed/draft)

---

## 3. API Flow Diagrams

### 3.1 Consultation Request Flow (상담 신청 → 결제 → 완료)

```mermaid
sequenceDiagram
    participant U as Foreign User
    participant F as Frontend
    participant API as API Proxy
    participant B as Backend
    participant MS as Matching Service
    participant ES as Email Service
    participant DB as Database
    participant TP as Toss Payments

    Note over U,DB: 1. 상담 신청
    U->>F: 상담 신청 폼 작성
    F->>API: POST /api/consultations
    API->>B: POST /api/consultations (JWT)
    B->>MS: find_matching_consultant(type)
    MS->>DB: SELECT consultants WHERE specialties LIKE %type%
    DB-->>MS: Consultant List
    MS->>MS: Sort by average_rating DESC
    MS-->>B: Matched Consultant (or null)
    B->>DB: INSERT consultation<br/>status=matched/requested
    DB-->>B: Consultation Created
    B->>ES: send_consultation_matched_email()
    ES-->>B: Email Sent
    B-->>API: Consultation Data
    API-->>F: Consultation Data
    F-->>U: 신청 완료 화면

    Note over U,DB: 2. 전문가 수락/거절
    U->>F: 상담 상세 조회
    F->>API: GET /api/consultations/{id}
    API->>B: GET /api/consultations/{id}
    B->>DB: SELECT consultation WHERE id={id}
    DB-->>B: Consultation
    B-->>API: Consultation (status: matched)
    API-->>F: Consultation
    F-->>U: 전문가 수락 대기 중

    Note over U,DB: 전문가가 수락
    B->>B: POST /api/consultations/{id}/accept
    B->>DB: UPDATE consultation SET status='scheduled'
    B->>ES: send_consultation_accepted_email()

    Note over U,DB: 3. 결제 프로세스
    U->>F: 결제 버튼 클릭
    F->>API: POST /api/payments
    API->>B: POST /api/payments
    B->>DB: INSERT payment (status=pending)
    DB-->>B: Payment Created
    B-->>API: Payment Data
    API-->>F: Payment Data
    F->>TP: 토스 결제 위젯 호출
    TP-->>F: 결제 완료 (paymentKey, orderId, amount)
    F->>API: POST /api/payments/callback
    API->>B: POST /api/payments/callback
    B->>TP: GET /v1/payments/{paymentKey}
    TP-->>B: Payment Verification
    B->>B: Verify amount, orderId
    B->>DB: UPDATE payment SET status='completed'
    B->>DB: UPDATE consultation SET payment_status='completed', status='scheduled'
    DB-->>B: Updated
    B-->>API: Payment Completed
    API-->>F: Success
    F-->>U: 결제 완료 화면

    Note over U,DB: 4. 상담 진행 및 완료
    U->>F: 메시지 교환
    F->>API: POST /api/messages/{consultationId}
    API->>B: POST /api/messages/{consultationId}
    B->>DB: INSERT message

    Note over U,DB: 상담 완료
    B->>DB: UPDATE consultation SET status='completed', completed_at=NOW()

    Note over U,DB: 5. 리뷰 작성
    U->>F: 리뷰 작성
    F->>API: POST /api/reviews
    API->>B: POST /api/reviews
    B->>DB: INSERT review
    B->>DB: UPDATE consultant SET average_rating=AVG(ratings)
    DB-->>B: Review Created
    B-->>API: Review
    API-->>F: Review
    F-->>U: 리뷰 작성 완료
```

**Status Transitions:**
```
requested → matched → scheduled → in_progress → completed
                ↓
           cancelled (if rejected)
```

**Payment Status:**
```
pending → completed
       → failed
       → refunded
       → cancelled
```

### 3.2 Job Application Flow (일자리 지원 → 심사 → 결과)

```mermaid
sequenceDiagram
    participant U as Foreign User
    participant F as Frontend
    participant API as API Proxy
    participant B as Backend
    participant DB as Database
    participant ES as Email Service
    participant A as Admin/Agency

    Note over U,DB: 1. 일자리 검색 및 조회
    U->>F: 일자리 목록 조회
    F->>API: GET /api/jobs?location=서울&type=full-time
    API->>B: GET /api/jobs
    B->>DB: SELECT jobs WHERE status='active'<br/>AND location LIKE '%서울%'<br/>ORDER BY created_at DESC
    DB-->>B: Job List
    B-->>API: Job List
    API-->>F: Job List
    F-->>U: 일자리 카드 리스트

    U->>F: 상세 조회
    F->>API: GET /api/jobs/{id}
    API->>B: GET /api/jobs/{id}
    B->>DB: SELECT jobs WHERE id={id}
    B->>DB: SELECT job_applications WHERE job_id={id} AND user_id={current_user.id}
    DB-->>B: Job + has_applied (boolean)
    B-->>API: JobDetailResponse
    API-->>F: Job Detail + has_applied
    F-->>U: 일자리 상세 페이지

    Note over U,DB: 2. 일자리 지원
    U->>F: 지원 버튼 클릭
    F-->>U: 지원서 작성 페이지
    U->>F: 이력서 + 자소서 작성
    F->>API: POST /api/jobs/{id}/apply
    API->>B: POST /api/jobs/{id}/apply
    B->>DB: CHECK unique_job_user_application
    B->>DB: INSERT job_application<br/>status='applied'
    DB-->>B: Application Created
    B-->>API: JobApplicationResponse
    API-->>F: Success
    F-->>U: 지원 완료 알림

    Note over U,DB: 3. 관리자/기관 심사
    A->>F: 지원자 목록 조회
    F->>API: GET /api/jobs/{id}/applications
    API->>B: GET /api/jobs/{id}/applications
    B->>DB: SELECT job_applications<br/>JOIN users ON user_id=users.id<br/>WHERE job_id={id}
    DB-->>B: Applications + Applicant Info
    B-->>API: JobApplicationWithApplicant[]
    API-->>F: Applications
    F-->>A: 지원자 리스트

    A->>F: 지원 상태 변경
    F->>API: PUT /api/jobs/applications/{id}/status
    API->>B: PUT /api/jobs/applications/{id}/status
    B->>DB: UPDATE job_application SET status='{new_status}', reviewed_at=NOW()
    DB-->>B: Updated
    B->>DB: SELECT user WHERE id=application.user_id
    DB-->>B: User Email
    B->>ES: send_job_application_status_email(email, status)
    ES-->>B: Email Sent
    B-->>API: Updated Application
    API-->>F: Success
    F-->>A: 상태 변경 완료

    Note over U,DB: 4. 사용자 알림 수신
    U->>F: 내 지원 내역 조회
    F->>API: GET /api/jobs/applications/my
    API->>B: GET /api/jobs/applications/my
    B->>DB: SELECT job_applications<br/>JOIN jobs ON job_id=jobs.id<br/>WHERE user_id={current_user.id}
    DB-->>B: Applications + Job Info
    B-->>API: JobApplicationWithJob[]
    API-->>F: My Applications
    F-->>U: 지원 내역 + 상태 (accepted/rejected/in_review)
```

**Application Status:**
```
applied → in_review → interview → accepted
                            ↓
                        rejected
```

### 3.3 Payment Flow (결제 흐름)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Next.js API
    participant B as Backend
    participant DB as Database
    participant TP as Toss Payments

    Note over U,TP: Phase 1: 결제 준비
    U->>F: 결제 버튼 클릭
    F->>API: POST /api/payments
    API->>B: POST /api/payments (JWT)
    B->>DB: SELECT consultation WHERE id={consultation_id}
    DB-->>B: Consultation (amount)
    B->>B: calculate_fees(amount)<br/>platform_fee = amount * 0.05<br/>net_amount = amount - platform_fee
    B->>DB: INSERT payment<br/>(consultation_id, user_id, amount, platform_fee, net_amount,<br/>payment_method, status='pending', transaction_id=NULL)
    DB-->>B: Payment Created (id, amount)
    B-->>API: Payment { id, amount, consultation_id }
    API-->>F: Payment Data

    Note over U,TP: Phase 2: 토스 페이먼츠 위젯
    F->>F: Load Toss Payments SDK
    F->>TP: Initialize Payment Widget<br/>(clientKey, orderId=consultation_id, amount)
    TP-->>F: Widget Loaded
    U->>TP: 결제 수단 선택 (카드/계좌이체/간편결제)
    U->>TP: 결제 정보 입력
    TP->>TP: Process Payment
    TP-->>F: Payment Success<br/>(paymentKey, orderId, amount)

    Note over U,TP: Phase 3: 결제 콜백 검증
    F->>API: POST /api/payments/callback<br/>{ paymentKey, orderId, amount }
    API->>B: POST /api/payments/callback<br/>Header: X-Toss-Webhook-Secret

    B->>B: Verify Webhook Secret (Production Only)
    B->>DB: SELECT payment WHERE consultation_id={orderId}<br/>AND status='pending'<br/>FOR UPDATE (행 잠금)
    DB-->>B: Payment

    B->>TP: GET /v1/payments/{paymentKey}<br/>Authorization: Basic {SECRET_KEY}
    TP-->>B: Payment Info<br/>{ orderId, totalAmount, status }

    B->>B: Verify Amount Match
    B->>B: Verify OrderId Match
    B->>B: Verify Status = 'DONE'

    alt Verification Success
        B->>DB: UPDATE payment SET<br/>status='completed',<br/>transaction_id={paymentKey},<br/>paid_at=NOW()
        B->>DB: UPDATE consultation SET<br/>payment_status='completed',<br/>status='scheduled'<br/>FOR UPDATE (행 잠금)
        DB-->>B: Updated
        B-->>API: Payment Completed
        API-->>F: Success
        F-->>U: Redirect to /consultations/{id}/payment/success
    else Verification Failed
        B-->>API: HTTP 400 Bad Request
        API-->>F: Error
        F-->>U: Redirect to /consultations/{id}/payment/fail
    end
```

**Security Measures:**

1. **Webhook Secret Verification** (Production Only):
```python
if not settings.DEBUG:
    if x_toss_webhook_secret != settings.TOSS_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
```

2. **Database Row Locking** (Concurrency Control):
```python
payment = db.query(Payment).filter(
    Payment.consultation_id == consultation_id,
    Payment.status == "pending",
).with_for_update().first()  # SELECT FOR UPDATE - 행 잠금
```

3. **Amount Verification**:
```python
verified_amount = int(payment_info.get("totalAmount", 0))
if verified_amount != amount:
    raise HTTPException(status_code=400, detail="Amount mismatch")

db_amount = int(float(consultation.amount))
if db_amount != amount:
    raise HTTPException(status_code=400, detail="Consultation amount mismatch")
```

4. **Idempotency**:
```python
if payment.status == "completed":
    return payment  # 이미 완료된 결제는 재처리하지 않음
```

### 3.4 Email Notification Flow

```mermaid
graph TD
    A[Trigger Event] --> B{Event Type}

    B --> C1[상담 매칭 완료]
    B --> C2[상담 수락]
    B --> C3[상담 거절]
    B --> C4[결제 완료]
    B --> C5[지원 상태 변경]

    C1 --> D[email_service.send_consultation_matched_email]
    C2 --> E[email_service.send_consultation_accepted_email]
    C3 --> F[email_service.send_consultation_rejected_email]
    C4 --> G[email_service.send_payment_confirmation_email]
    C5 --> H[email_service.send_job_application_status_email]

    D --> I{EMAIL_ENABLED?}
    E --> I
    F --> I
    G --> I
    H --> I

    I -->|True| J[SMTP Connection]
    I -->|False| K[Log Only]

    J --> L[Build MIME Message]
    L --> M[Text/Plain Part]
    L --> N[Text/HTML Part]

    M --> O[SMTP Send]
    N --> O

    O --> P{Success?}
    P -->|Yes| Q[Log Success]
    P -->|No| R[Log Error + Continue]

    Q --> S[Return True]
    R --> T[Return False]
```

**Email Service Configuration:**
```python
# backend/src/config.py
EMAIL_ENABLED: bool = False  # Toggle email functionality
SMTP_HOST: str = "smtp.gmail.com"
SMTP_PORT: int = 587
SMTP_USER: str = ""  # Gmail address
SMTP_PASSWORD: str = ""  # Gmail App Password
FROM_EMAIL: str = "noreply@easyk.com"
```

**Error Handling:**
```python
try:
    send_consultation_matched_email(user.email, consultant.office_name, type)
except Exception as e:
    logger.error(f"Failed to send email: {e}")
    # 이메일 발송 실패해도 상담 신청은 계속 진행
```

---

## 4. Data Flow

### 4.1 Frontend → Backend Data Flow

```mermaid
graph LR
    A[User Action] --> B[React Component]
    B --> C[Event Handler]
    C --> D{Need Auth?}
    D -->|Yes| E[localStorage.getItem<br/>'access_token']
    D -->|No| F[Build Request]
    E --> F
    F --> G[fetch /api/...]
    G --> H[Next.js API Route<br/>Proxy Layer]
    H --> I[Add Authorization Header]
    I --> J[fetch BACKEND_URL/api/...]
    J --> K[FastAPI Router]
    K --> L{Auth Required?}
    L -->|Yes| M[get_current_user<br/>Middleware]
    L -->|No| N[Service Layer]
    M --> O{Valid Token?}
    O -->|Yes| P[Load User from DB]
    O -->|No| Q[401 Unauthorized]
    P --> N
    N --> R[Database Query]
    R --> S[Response Data]
    S --> T[Return to API Proxy]
    T --> U[Return to Frontend]
    U --> V[Update UI State]
```

**Example: Consultation Creation**

```typescript
// Frontend: frontend/src/app/(dashboard)/consultations/new/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch("/api/consultations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      consultation_type: consultationType,
      consultation_method: consultationMethod,
      content: content.trim(),
      amount: parseFloat(amount),
    }),
  });

  if (response.ok) {
    router.push("/consultations");
  }
};
```

```typescript
// API Proxy: frontend/src/app/api/consultations/route.ts
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const body = await request.json();

  const response = await fetch(`${BACKEND_URL}/api/consultations`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
```

```python
# Backend Router: backend/src/routers/consultations.py
@router.post("", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation(
    consultation_data: ConsultationCreate,
    current_user: User = Depends(get_current_user),  # JWT 검증
    db: Session = Depends(get_db),
):
    return create_consultation_service(consultation_data, current_user, db)
```

```python
# Backend Service: backend/src/services/consultation_service.py
def create_consultation(consultation_data: ConsultationCreate, user: User, db: Session) -> Consultation:
    # 전문가 자동 매칭
    matched_consultant = find_matching_consultant(db, consultation_data.consultation_type)

    # 상담 생성
    new_consultation = Consultation(
        user_id=user.id,
        consultant_id=matched_consultant.id if matched_consultant else None,
        consultation_type=consultation_data.consultation_type,
        content=consultation_data.content,
        consultation_method=consultation_data.consultation_method,
        amount=consultation_data.amount,
        status="matched" if matched_consultant else "requested",
        payment_status="pending",
    )

    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)

    # 이메일 알림
    if matched_consultant and user.email:
        send_consultation_matched_email(user.email, matched_consultant.office_name, consultation_data.consultation_type)

    return new_consultation
```

### 4.2 File Upload Flow (Supabase Storage)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Proxy
    participant B as Backend
    participant S3 as Supabase Storage
    participant DB as Database

    U->>F: Select File (이력서, 프로필 사진 등)
    F->>F: Validate File (size, type)
    F->>API: POST /api/uploads/resume<br/>FormData: { file }
    API->>B: POST /api/uploads/resume (JWT)
    B->>B: Validate File Extension (.pdf, .docx, .jpg, .png)
    B->>B: Generate Unique Filename (UUID)

    alt Supabase Storage
        B->>S3: Upload File<br/>PUT /storage/v1/object/bucket-name/path
        S3-->>B: File URL
    else Local Storage
        B->>B: Save to uploads/ directory
        B-->>B: Local File Path
    end

    B->>DB: INSERT upload<br/>(file_name, file_path, file_size, mime_type, file_type, uploaded_by)
    DB-->>B: Upload Record
    B-->>API: { file_url, file_name, file_size }
    API-->>F: Upload Success
    F-->>U: Display Uploaded File

    Note over U,DB: 파일 사용 (예: 일자리 지원)
    U->>F: Submit Application (resume_url)
    F->>API: POST /api/jobs/{id}/apply<br/>{ resume_url, cover_letter }
    API->>B: POST /api/jobs/{id}/apply
    B->>DB: INSERT job_application (resume_url)
    DB-->>B: Application Created
```

**File Type Validation:**
```python
# backend/src/services/upload_service.py
ALLOWED_EXTENSIONS = {
    "resume": [".pdf", ".doc", ".docx"],
    "profile_photo": [".jpg", ".jpeg", ".png", ".gif"],
    "document": [".pdf", ".doc", ".docx", ".xlsx", ".pptx"],
}

def validate_file_extension(filename: str, file_type: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS.get(file_type, [])
```

### 4.3 Authentication Token Flow

```mermaid
graph TD
    A[User Logs In] --> B[Backend Generates JWT]
    B --> C[JWT Payload<br/>sub: email<br/>role: foreign/consultant/admin/agency<br/>exp: timestamp]
    C --> D[Sign with SECRET_KEY<br/>Algorithm: HS256]
    D --> E[Return Token to Frontend]
    E --> F[Store in localStorage<br/>key: 'access_token']

    F --> G[User Makes Protected Request]
    G --> H[Frontend Reads localStorage<br/>access_token]
    H --> I[Attach Header<br/>Authorization: Bearer TOKEN]
    I --> J[Next.js API Proxy]
    J --> K[Forward to Backend<br/>Authorization: Bearer TOKEN]
    K --> L[FastAPI Middleware<br/>HTTPBearer]
    L --> M[verify_access_token]
    M --> N{Valid?}
    N -->|Yes| O[Extract Payload<br/>email = payload.sub]
    N -->|No| P[401 Unauthorized]
    O --> Q[Query User by Email]
    Q --> R[Return User Object]
    R --> S[Proceed to Route Handler]

    S --> T{Role Check Needed?}
    T -->|Yes| U{user.role == required_role?}
    T -->|No| V[Execute Business Logic]
    U -->|Yes| V
    U -->|No| W[403 Forbidden]
```

**Token Expiration:**
- Default: 30 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES = 30`)
- No refresh token (stateless design)
- User must re-login after expiration

**Role-Based Authorization Example:**
```python
# Admin-only route
@router.get("/api/stats/dashboard")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # ... return statistics
```

---

## 5. Key Implementation Patterns

### 5.1 Service Layer Pattern

**목적**: 비즈니스 로직을 라우터에서 분리하여 재사용성과 테스트 용이성 향상

**구조:**
```
backend/src/
├── routers/          # API 엔드포인트 정의 (얇은 레이어)
│   ├── auth.py
│   ├── consultations.py
│   ├── jobs.py
│   └── payments.py
└── services/         # 비즈니스 로직 구현
    ├── auth_service.py
    ├── consultation_service.py
    ├── job_service.py
    ├── payment_service.py
    ├── matching_service.py
    └── email_service.py
```

**예시: Consultation Service**

```python
# backend/src/routers/consultations.py (Router - Thin Layer)
@router.post("", response_model=ConsultationResponse)
def create_consultation(
    consultation_data: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """API 엔드포인트 - 검증과 서비스 호출만 담당"""
    return create_consultation_service(consultation_data, current_user, db)


# backend/src/services/consultation_service.py (Service - Business Logic)
def create_consultation(
    consultation_data: ConsultationCreate,
    user: User,
    db: Session
) -> Consultation:
    """비즈니스 로직 - 매칭, 생성, 알림 등"""
    # 1. 전문가 자동 매칭
    matched_consultant = find_matching_consultant(db, consultation_data.consultation_type)

    # 2. 상담 생성
    new_consultation = Consultation(
        user_id=user.id,
        consultant_id=matched_consultant.id if matched_consultant else None,
        consultation_type=consultation_data.consultation_type,
        content=consultation_data.content,
        status="matched" if matched_consultant else "requested",
        payment_status="pending",
    )

    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)

    # 3. 이메일 알림 발송 (실패해도 상담은 유지)
    if matched_consultant and user.email:
        try:
            send_consultation_matched_email(
                user.email,
                matched_consultant.office_name,
                consultation_data.consultation_type,
            )
        except Exception as e:
            logger.error(f"Failed to send email: {e}")

    return new_consultation
```

**장점:**
- 비즈니스 로직 재사용 가능 (여러 엔드포인트에서 공통 함수 호출)
- 단위 테스트 용이 (라우터와 독립적)
- 관심사 분리 (Router: HTTP 처리, Service: 비즈니스 로직)

### 5.2 API Proxy Pattern (Next.js API Routes)

**목적**:
- CORS 문제 해결 (Same-Origin Policy)
- 환경 변수 보호 (백엔드 URL 숨김)
- 에러 메시지 다국어화
- 로깅 및 모니터링 중앙화

**구조:**
```
frontend/src/app/api/
├── auth/
│   ├── login/route.ts
│   └── signup/route.ts
├── consultations/
│   ├── route.ts           # GET /api/consultations, POST /api/consultations
│   └── [id]/route.ts      # GET /api/consultations/{id}
├── jobs/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/apply/route.ts
└── payments/
    ├── route.ts
    └── callback/route.ts
```

**패턴:**

```typescript
// frontend/src/app/api/consultations/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    // 1. 인증 헤더 추출
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 2. 백엔드로 요청 전달
    const response = await fetch(`${BACKEND_URL}/api/consultations`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // 3. 에러 메시지 다국어화
      const errorMessages: Record<string, string> = {
        'Unauthorized': '인증이 필요합니다',
        'Forbidden': '접근 권한이 없습니다',
      };

      const message = errorMessages[data.detail] || data.message || '상담 목록 조회 실패';
      return NextResponse.json({ message }, { status: response.status });
    }

    // 4. 성공 응답 전달
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    // 5. 네트워크 에러 처리
    console.error('[API Route] Consultations GET error:', error);
    return NextResponse.json(
      { message: '상담 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

**장점:**
- 클라이언트 사이드에서 백엔드 URL 숨김 (보안)
- CORS 문제 자동 해결 (Same-Origin)
- 에러 처리 중앙화
- 로깅 및 모니터링 용이

### 5.3 Error Handling Patterns

#### Backend Error Handling

```python
# 1. HTTPException (FastAPI 표준)
from fastapi import HTTPException, status

@router.get("/{consultation_id}")
def get_consultation(consultation_id: UUID, db: Session):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()

    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )

    return consultation


# 2. Service Layer에서 예외 전파
def accept_consultation(consultation_id: UUID, user: User, db: Session) -> Consultation:
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultant = db.query(Consultant).filter(Consultant.user_id == user.id).first()

    if not consultant or consultation.consultant_id != consultant.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to accept this consultation"
        )

    consultation.status = "scheduled"
    db.commit()
    return consultation


# 3. 이메일 발송 실패는 로깅만 (상담은 계속 진행)
try:
    send_consultation_matched_email(user.email, consultant.office_name, type)
except Exception as e:
    logger.error(f"Failed to send email: {e}")
    # 이메일 실패해도 상담 신청은 유지
```

#### Frontend Error Handling

```typescript
// 1. 컴포넌트 레벨 에러 상태 관리
const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  try {
    const response = await fetch("/api/consultations", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message || "상담 신청에 실패했습니다.");
      return;
    }

    router.push("/consultations");
  } catch (error) {
    setError("네트워크 오류가 발생했습니다.");
  }
};

// 2. 에러 UI 표시
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-600">{error}</p>
  </div>
)}


// 3. API Proxy 레벨 에러 변환
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/consultations`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // 백엔드 에러를 사용자 친화적 메시지로 변환
      const errorMessages: Record<string, string> = {
        'Consultation not found': '상담을 찾을 수 없습니다',
        'Unauthorized': '인증이 필요합니다',
      };

      const message = errorMessages[data.detail] || data.message || '오류가 발생했습니다';
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error:', error);
    return NextResponse.json(
      { message: '서버와 통신 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

### 5.4 Role-Based Authorization Checks

**패턴 1: Dependency Injection (FastAPI)**

```python
# backend/src/middleware/auth.py
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """JWT 토큰을 검증하고 사용자 객체 반환"""
    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """관리자 권한 검증"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# 사용 예시
@router.get("/api/stats/dashboard")
def get_dashboard_stats(
    current_user: User = Depends(get_current_admin_user),  # 자동으로 admin 검증
    db: Session = Depends(get_db),
):
    return {...}
```

**패턴 2: Manual Check in Service Layer**

```python
# backend/src/services/job_service.py
def create_job(job_data: JobCreate, user_id: UUID, db: Session) -> Job:
    # 사용자 조회
    user = db.query(User).filter(User.id == user_id).first()

    # 권한 검증: admin 또는 agency만 일자리 생성 가능
    if user.role not in ["admin", "agency"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or agency users can create jobs"
        )

    # 일자리 생성
    new_job = Job(
        posted_by=user_id,
        position=job_data.position,
        company_name=job_data.company_name,
        ...
    )

    db.add(new_job)
    db.commit()
    return new_job
```

**패턴 3: Resource Ownership Check**

```python
def update_job(job_id: UUID, job_data: JobUpdate, user_id: UUID, db: Session) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    user = db.query(User).filter(User.id == user_id).first()

    # 권한 검증: admin이거나 본인이 작성한 공고만 수정 가능
    if user.role != "admin" and job.posted_by != user_id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to update this job"
        )

    # 수정 로직
    for key, value in job_data.model_dump(exclude_unset=True).items():
        setattr(job, key, value)

    db.commit()
    return job
```

---

## 6. File Structure Map

### 6.1 Backend Structure

```
backend/src/
├── main.py                      # FastAPI 앱 초기화, 라우터 등록
├── config.py                    # 환경 변수 설정 (Pydantic BaseSettings)
├── database.py                  # SQLAlchemy 엔진, 세션, Base
│
├── models/                      # SQLAlchemy ORM 모델
│   ├── __init__.py
│   ├── user.py                  # User (foreign, consultant, admin, agency)
│   ├── consultant.py            # Consultant (전문가 정보)
│   ├── consultation.py          # Consultation (상담 신청)
│   ├── payment.py               # Payment (결제 기록)
│   ├── review.py                # Review (상담 리뷰)
│   ├── job.py                   # Job (일자리 공고)
│   ├── job_application.py       # JobApplication (일자리 지원)
│   ├── saved_job.py             # SavedJob (저장한 일자리)
│   ├── government_support.py    # GovernmentSupport (정부 지원 프로그램)
│   ├── support_keyword.py       # SupportKeyword (알림 키워드)
│   ├── message.py               # Message (상담 메시지)
│   ├── upload.py                # Upload (파일 업로드 기록)
│   └── document_template.py     # DocumentTemplate (서류 템플릿)
│
├── schemas/                     # Pydantic 스키마 (Request/Response)
│   ├── user.py                  # UserCreate, UserResponse, LoginRequest, TokenResponse
│   ├── consultation.py          # ConsultationCreate, ConsultationResponse
│   ├── payment.py               # PaymentCreate, PaymentResponse, PaymentCallbackRequest
│   ├── job.py                   # JobCreate, JobUpdate, JobResponse, JobDetailResponse
│   ├── job_application.py       # JobApplicationCreate, JobApplicationResponse, JobApplicationStatusUpdate
│   ├── review.py                # ReviewCreate, ReviewResponse
│   ├── message.py               # MessageCreate, MessageResponse
│   ├── upload.py                # UploadResponse
│   └── ...
│
├── routers/                     # API 엔드포인트 (얇은 레이어)
│   ├── auth.py                  # POST /api/auth/signup, /login, GET /check-email
│   ├── users.py                 # GET /api/users/me, PUT /api/users/me
│   ├── consultations.py         # CRUD /api/consultations, /accept, /reject
│   ├── consultants.py           # GET /api/consultants (전문가 목록)
│   ├── payments.py              # POST /api/payments, /callback
│   ├── reviews.py               # POST /api/reviews
│   ├── jobs.py                  # CRUD /api/jobs, /apply, /save
│   ├── government_supports.py   # GET /api/government-supports, /eligibility-check
│   ├── support_keywords.py      # GET /api/support-keywords
│   ├── messages.py              # GET /api/messages/{consultationId}, POST
│   ├── uploads.py               # POST /api/uploads/resume, /profile-photo
│   ├── document_templates.py    # GET /api/document-templates
│   └── stats.py                 # GET /api/stats/dashboard (관리자 통계)
│
├── services/                    # 비즈니스 로직 (서비스 레이어)
│   ├── auth_service.py          # create_user(), authenticate_user()
│   ├── consultation_service.py  # create_consultation(), accept_consultation(), reject_consultation()
│   ├── payment_service.py       # create_payment(), process_payment_callback()
│   ├── matching_service.py      # find_matching_consultant()
│   ├── email_service.py         # EmailService, send_*_email()
│   ├── job_service.py           # create_job(), update_job(), apply_to_job()
│   ├── saved_job_service.py     # save_job(), unsave_job()
│   ├── government_support_service.py  # get_supports(), check_eligibility()
│   ├── support_keyword_service.py     # create_keyword(), get_keywords()
│   ├── message_service.py       # send_message(), get_messages()
│   ├── upload_service.py        # upload_file()
│   ├── document_template_service.py   # get_templates()
│   └── review_service.py        # create_review()
│
├── middleware/                  # 미들웨어
│   ├── auth.py                  # get_current_user(), get_current_admin_user()
│   └── security.py              # rate_limiter, validate_environment_variables()
│
├── utils/                       # 유틸리티 함수
│   ├── auth.py                  # create_access_token(), verify_access_token(), hash_password()
│   ├── i18n.py                  # get_error_message() (다국어 에러 메시지)
│   └── toss_payments.py         # TossPaymentsClient
│
└── tests/                       # 테스트 파일
    ├── test_auth.py
    ├── test_consultations.py
    └── test_i18n.py
```

### 6.2 Frontend Structure

```
frontend/src/
├── app/
│   ├── (dashboard)/             # 대시보드 레이아웃 (인증 필요)
│   │   ├── layout.tsx           # Navbar 포함
│   │   ├── page.tsx             # 홈 대시보드
│   │   │
│   │   ├── consultations/       # 상담 관련 페이지
│   │   │   ├── page.tsx         # 상담 목록
│   │   │   ├── new/page.tsx     # 상담 신청
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # 상담 상세
│   │   │       ├── payment/
│   │   │       │   ├── page.tsx           # 결제 페이지
│   │   │       │   ├── success/page.tsx   # 결제 성공
│   │   │       │   └── fail/page.tsx      # 결제 실패
│   │   │       └── review/page.tsx        # 리뷰 작성
│   │   │
│   │   ├── consultant/          # 전문가 전용 페이지
│   │   │   └── dashboard/page.tsx   # 전문가 대시보드
│   │   │
│   │   ├── jobs/                # 일자리 관련 페이지
│   │   │   ├── page.tsx         # 일자리 목록
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # 일자리 상세
│   │   │       └── apply/page.tsx   # 일자리 지원
│   │   │
│   │   ├── saved-jobs/page.tsx  # 저장한 일자리
│   │   ├── applications/page.tsx # 내 지원 내역
│   │   │
│   │   ├── supports/            # 정부 지원 관련
│   │   │   ├── page.tsx         # 지원 프로그램 목록
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # 프로그램 상세
│   │   │       └── eligibility/page.tsx  # 자격 확인
│   │   │
│   │   ├── support-keywords/page.tsx  # 키워드 알림 설정
│   │   ├── document-templates/page.tsx # 서류 템플릿
│   │   ├── consultants/page.tsx # 전문가 목록
│   │   ├── profile/page.tsx     # 프로필 관리
│   │   │
│   │   ├── admin/               # 관리자 전용
│   │   │   ├── stats/page.tsx   # 통계 대시보드
│   │   │   └── jobs/page.tsx    # 일자리 관리
│   │   │
│   │   └── agency/              # 채용 기관 전용
│   │       └── page.tsx         # 기관 대시보드
│   │
│   ├── api/                     # Next.js API Routes (Proxy)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   ├── consultations/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── jobs/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/apply/route.ts
│   │   ├── jobs/applications/
│   │   │   ├── my/route.ts
│   │   │   └── [id]/status/route.ts
│   │   ├── payments/
│   │   │   ├── route.ts
│   │   │   └── callback/route.ts
│   │   ├── supports/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── eligibility-check/route.ts
│   │   ├── support-keywords/route.ts
│   │   ├── messages/[consultationId]/route.ts
│   │   ├── uploads/resume/route.ts
│   │   ├── document-templates/route.ts
│   │   ├── reviews/route.ts
│   │   ├── users/me/route.ts
│   │   └── stats/dashboard/route.ts
│   │
│   ├── login/page.tsx           # 로그인 페이지
│   ├── signup/page.tsx          # 회원가입 페이지
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 랜딩 페이지
│
├── components/
│   └── ui/                      # 재사용 가능한 UI 컴포넌트
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       ├── Navbar.tsx
│       ├── FileUpload.tsx
│       ├── Image.tsx
│       └── LanguageSelector.tsx
│
├── contexts/
│   └── LanguageContext.tsx      # 다국어 지원 (ko/en)
│
├── types/
│   └── job.ts                   # TypeScript 타입 정의
│
└── lib/
    └── sampleData.ts            # 샘플 데이터 (개발용)
```

### 6.3 Router to Service Mapping

| Router Endpoint | Service Function | Purpose |
|-----------------|------------------|---------|
| `POST /api/auth/signup` | `auth_service.create_user()` | 회원가입 |
| `POST /api/auth/login` | `auth_service.authenticate_user()` | 로그인 (JWT 발급) |
| `POST /api/consultations` | `consultation_service.create_consultation()` | 상담 신청 + 자동 매칭 |
| `GET /api/consultations` | `consultation_service.get_user_consultations()` | 내 상담 목록 |
| `POST /api/consultations/{id}/accept` | `consultation_service.accept_consultation()` | 전문가가 상담 수락 |
| `POST /api/consultations/{id}/reject` | `consultation_service.reject_consultation()` | 전문가가 상담 거절 |
| `POST /api/payments` | `payment_service.create_payment()` | 결제 생성 (pending) |
| `POST /api/payments/callback` | `payment_service.process_payment_callback()` | 토스 결제 검증 + 완료 |
| `GET /api/jobs` | `job_service.get_jobs()` | 일자리 목록 조회 (필터링) |
| `POST /api/jobs` | `job_service.create_job()` | 일자리 생성 (admin/agency) |
| `POST /api/jobs/{id}/apply` | `job_service.apply_to_job()` | 일자리 지원 |
| `GET /api/jobs/{id}/applications` | `job_service.get_job_applications()` | 지원자 목록 (admin/agency) |
| `PUT /api/jobs/applications/{id}/status` | `job_service.update_job_application_status()` | 지원 상태 변경 + 이메일 |
| `GET /api/government-supports` | `government_support_service.get_supports()` | 정부 지원 목록 |
| `POST /api/government-supports/eligibility-check` | `government_support_service.check_eligibility()` | 자격 조건 확인 |
| `POST /api/reviews` | `review_service.create_review()` | 리뷰 작성 + 평점 업데이트 |
| `POST /api/uploads/resume` | `upload_service.upload_file()` | 파일 업로드 (Supabase/로컬) |
| `GET /api/stats/dashboard` | `stats.get_dashboard_stats()` | 관리자 통계 (admin only) |

---

## 7. Database Schema

### 7.1 Tables Overview

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| `users` | `id` (UUID) | - | 사용자 (외국인, 전문가, 관리자, 기관) |
| `consultants` | `id` (UUID) | `user_id` → `users.id` | 전문가 상세 정보 |
| `consultations` | `id` (UUID) | `user_id` → `users.id`<br/>`consultant_id` → `consultants.id` | 상담 신청 |
| `payments` | `id` (UUID) | `consultation_id` → `consultations.id`<br/>`user_id` → `users.id` | 결제 기록 |
| `reviews` | `id` (UUID) | `consultation_id` → `consultations.id`<br/>`reviewer_id` → `users.id`<br/>`consultant_id` → `consultants.id` | 상담 리뷰 |
| `jobs` | `id` (UUID) | `posted_by` → `users.id` | 일자리 공고 |
| `job_applications` | `id` (UUID) | `job_id` → `jobs.id`<br/>`user_id` → `users.id` | 일자리 지원 |
| `saved_jobs` | - | `user_id` → `users.id`<br/>`job_id` → `jobs.id` | 저장한 일자리 (M:N) |
| `government_supports` | `id` (UUID) | - | 정부 지원 프로그램 |
| `support_keywords` | `id` (UUID) | `user_id` → `users.id` | 알림 키워드 |
| `messages` | `id` (UUID) | `consultation_id` → `consultations.id`<br/>`sender_id` → `users.id` | 상담 메시지 |
| `uploads` | `id` (UUID) | `uploaded_by` → `users.id` | 파일 업로드 기록 |
| `document_templates` | `id` (UUID) | - | 서류 템플릿 |

### 7.2 Key Enums and Constraints

**User Roles:**
```sql
CHECK (role IN ('foreign', 'consultant', 'admin', 'agency'))
```

**Consultation Type:**
```sql
CHECK (consultation_type IN ('visa', 'labor', 'contract', 'business', 'other'))
```

**Consultation Status:**
```sql
CHECK (status IN ('requested', 'matched', 'scheduled', 'in_progress', 'completed', 'cancelled'))
```

**Consultation Method:**
```sql
CHECK (consultation_method IN ('email', 'document', 'call', 'video'))
```

**Payment Status:**
```sql
CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'))
```

**Job Status:**
```sql
CHECK (status IN ('active', 'closed', 'expired', 'draft'))
```

**Employment Type:**
```sql
CHECK (employment_type IN ('full-time', 'contract', 'part-time', 'temporary'))
```

**Application Status:**
```sql
CHECK (status IN ('applied', 'in_review', 'interview', 'accepted', 'rejected'))
```

**Government Support Category:**
```sql
CHECK (category IN ('subsidy', 'education', 'training', 'visa', 'housing'))
```

### 7.3 Unique Constraints

```sql
-- 하나의 상담에 하나의 결제만
ALTER TABLE payments ADD CONSTRAINT unique_consultation_payment UNIQUE (consultation_id);

-- 하나의 상담에 하나의 리뷰만
ALTER TABLE reviews ADD CONSTRAINT unique_consultation_review UNIQUE (consultation_id);

-- 한 사용자는 하나의 일자리에 한 번만 지원 가능
ALTER TABLE job_applications ADD CONSTRAINT unique_job_user_application UNIQUE (job_id, user_id);

-- 이메일 중복 방지
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- 결제 transaction_id 중복 방지
ALTER TABLE payments ADD CONSTRAINT unique_transaction_id UNIQUE (transaction_id);
```

### 7.4 Indexes

```sql
-- 자주 조회되는 컬럼에 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_consultant_id ON consultations(consultant_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_payments_consultation_id ON payments(consultation_id);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_government_supports_category ON government_supports(category);
CREATE INDEX idx_government_supports_status ON government_supports(status);
```

---

## Appendix A: Environment Variables

### Backend `.env`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/easyk
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@easyk.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# Payment (Toss Payments)
TOSS_CLIENT_KEY=test_ck_xxxxxxxxxxxx
TOSS_SECRET_KEY=test_sk_xxxxxxxxxxxx
TOSS_WEBHOOK_SECRET=your-webhook-secret

# Application
DEBUG=true
UPLOAD_DIR=uploads
```

### Frontend `.env.local`

```bash
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxxxxxxxxxx
```

---

## Appendix B: API Endpoint Summary

### Authentication
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/check-email?email={email}` - 이메일 중복 확인

### Users
- `GET /api/users/me` - 내 정보 조회
- `PUT /api/users/me` - 내 정보 수정

### Consultations
- `GET /api/consultations` - 내 상담 목록
- `POST /api/consultations` - 상담 신청
- `GET /api/consultations/{id}` - 상담 상세
- `POST /api/consultations/{id}/accept` - 상담 수락 (전문가)
- `POST /api/consultations/{id}/reject` - 상담 거절 (전문가)
- `GET /api/consultations/incoming` - 전문가에게 들어온 상담 (전문가)
- `GET /api/consultations/dashboard/stats` - 전문가 통계 (전문가)

### Consultants
- `GET /api/consultants` - 전문가 목록

### Payments
- `POST /api/payments` - 결제 생성
- `POST /api/payments/callback` - 결제 콜백 (토스페이먼츠)

### Reviews
- `POST /api/reviews` - 리뷰 작성

### Jobs
- `GET /api/jobs` - 일자리 목록 (필터링 가능)
- `POST /api/jobs` - 일자리 생성 (admin/agency)
- `GET /api/jobs/{id}` - 일자리 상세
- `PUT /api/jobs/{id}` - 일자리 수정 (admin/agency)
- `DELETE /api/jobs/{id}` - 일자리 삭제 (admin/agency)
- `POST /api/jobs/{id}/apply` - 일자리 지원
- `GET /api/jobs/{id}/applications` - 지원자 목록 (admin/agency)
- `POST /api/jobs/{id}/save` - 일자리 저장
- `DELETE /api/jobs/{id}/save` - 일자리 저장 취소
- `GET /api/jobs/saved/my` - 저장한 일자리 목록
- `GET /api/jobs/applications/my` - 내 지원 내역
- `PUT /api/jobs/applications/{id}/status` - 지원 상태 변경 (admin/agency)

### Government Supports
- `GET /api/government-supports` - 정부 지원 목록
- `GET /api/government-supports/{id}` - 정부 지원 상세
- `POST /api/government-supports/eligibility-check` - 자격 확인

### Support Keywords
- `GET /api/support-keywords` - 키워드 목록
- `POST /api/support-keywords` - 키워드 추가
- `DELETE /api/support-keywords/{id}` - 키워드 삭제

### Messages
- `GET /api/messages/{consultationId}` - 메시지 목록
- `POST /api/messages/{consultationId}` - 메시지 전송

### Uploads
- `POST /api/uploads/resume` - 이력서 업로드
- `POST /api/uploads/profile-photo` - 프로필 사진 업로드
- `POST /api/uploads/document` - 문서 업로드

### Document Templates
- `GET /api/document-templates` - 서류 템플릿 목록

### Statistics (Admin Only)
- `GET /api/stats/dashboard` - 관리자 대시보드 통계
- `GET /api/stats/overview` - 전체 개요 통계

---

## Appendix C: Common Workflows

### Workflow 1: 외국인 사용자가 상담 신청하고 결제까지

1. 회원가입 (`POST /api/auth/signup`)
2. 로그인 (`POST /api/auth/login`) → JWT 토큰 저장
3. 상담 신청 (`POST /api/consultations`) → 자동 매칭
4. 상담 상세 조회 (`GET /api/consultations/{id}`) → 매칭된 전문가 확인
5. 전문가가 수락 (`POST /api/consultations/{id}/accept`) → 상태: scheduled
6. 결제 페이지 이동 (`GET /consultations/{id}/payment`)
7. 결제 생성 (`POST /api/payments`) → 토스 위젯 로드
8. 토스 결제 완료 → 콜백 (`POST /api/payments/callback`)
9. 결제 성공 페이지 (`/consultations/{id}/payment/success`)
10. 상담 진행 (메시지 교환)
11. 상담 완료 후 리뷰 작성 (`POST /api/reviews`)

### Workflow 2: 채용 기관이 공고 작성하고 지원자 관리

1. 로그인 (`POST /api/auth/login`) → role: agency
2. 일자리 생성 (`POST /api/jobs`)
3. 일자리 목록 확인 (`GET /api/jobs?posted_by=me`)
4. 지원자 조회 (`GET /api/jobs/{id}/applications`)
5. 지원서 검토 (이력서, 자소서, 연락처)
6. 지원 상태 변경 (`PUT /api/jobs/applications/{id}/status`)
   - `accepted`: 채용 확정 이메일 발송
   - `rejected`: 불합격 이메일 발송
   - `interview`: 면접 일정 조율

### Workflow 3: 관리자가 전체 통계 확인

1. 로그인 (`POST /api/auth/login`) → role: admin
2. 대시보드 통계 조회 (`GET /api/stats/dashboard`)
   - 사용자 통계 (외국인, 전문가, 관리자)
   - 상담 통계 (상태별)
   - 일자리 통계 (활성화, 총 개수)
   - 지원 통계 (상태별)
   - 정부 지원 통계
3. 개요 통계 조회 (`GET /api/stats/overview`)
   - 최근 7일 활동 (신규 사용자, 신규 상담, 신규 지원)

---

**문서 종료**

> 이 문서는 easyK 플랫폼의 전체 아키텍처, 데이터 흐름, API 흐름을 포괄적으로 설명합니다.
> 추가 질문이나 상세 설명이 필요한 부분은 개발팀에 문의하세요.
