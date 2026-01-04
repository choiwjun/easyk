# 토스 페이먼츠 연동 설정 가이드

## 📋 개요

easyK 플랫폼의 상담 결제 시스템은 토스 페이먼츠(Toss Payments)를 사용합니다.

## 🔑 API 키 설정

### 1. 토스 페이먼츠 계정 생성

1. [토스 페이먼츠 개발자 센터](https://developers.tosspayments.com/)에 접속
2. 회원가입 후 로그인
3. 새 애플리케이션 생성

### 2. API 키 발급

#### 테스트 환경
- **Client Key**: `test_ck_xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret Key**: `test_sk_xxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 프로덕션 환경
- **Client Key**: `live_ck_xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret Key**: `live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. 환경 변수 설정

**Backend (.env)**
```bash
# 토스 페이먼츠 설정
TOSS_CLIENT_KEY=test_ck_xxxxxxxxxxxxxxxxxxxxxxxxxx
TOSS_SECRET_KEY=test_sk_xxxxxxxxxxxxxxxxxxxxxxxxxx
TOSS_SUCCESS_URL=https://your-domain.com/payment/success
TOSS_FAIL_URL=https://your-domain.com/payment/fail
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 📝 결제 플로우

### 1. 상담 결제 요청
```
사용자 → 상담 신청 → 결제 페이지 이동 → 토스 결제 위젯 렌더링
```

### 2. 결제 승인
```
결제 완료 → Success URL 리다이렉트 → 백엔드 승인 API 호출 → DB 업데이트
```

### 3. 결제 실패
```
결제 실패 → Fail URL 리다이렉트 → 사용자에게 에러 메시지 표시
```

## 🧪 테스트 카드 정보

토스 페이먼츠 테스트 환경에서 사용 가능한 카드:

| 카드사 | 카드번호 | 유효기간 | CVC | 비밀번호(앞2자리) |
|--------|----------|----------|-----|-------------------|
| 신한 | 4030-0000-0000-0001 | 아무거나 | 123 | 12 |
| 국민 | 5191-0000-0000-0001 | 아무거나 | 123 | 12 |
| 하나 | 5295-7800-0000-0001 | 아무거나 | 123 | 12 |

## 🔧 구현 확인 사항

### Backend

**1. Payment Router 확인** (`backend/src/routers/payments.py`)
- ✅ `POST /api/payments/ready` - 결제 준비
- ✅ `POST /api/payments/approve` - 결제 승인
- ✅ `POST /api/payments/cancel` - 결제 취소
- ✅ `GET /api/payments/{payment_id}` - 결제 조회

**2. Payment Service 확인** (`backend/src/services/payment_service.py`)
- ✅ `create_payment()` - 결제 정보 생성
- ✅ `approve_payment()` - 토스 결제 승인 API 호출
- ✅ `cancel_payment()` - 결제 취소

### Frontend

**1. 결제 페이지** (`frontend/src/app/(dashboard)/consultations/[id]/payment/page.tsx`)
- ✅ 토스 결제 위젯 렌더링
- ✅ 결제 요청 데이터 전송
- ✅ 에러 핸들링

**2. 성공/실패 페이지**
- ✅ `payment/success/page.tsx` - 결제 성공 처리
- ✅ `payment/fail/page.tsx` - 결제 실패 처리

## 📊 데이터베이스 스키마

**payments 테이블**
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    consultation_id UUID REFERENCES consultations(id),
    user_id UUID REFERENCES users(id),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'KRW',
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    toss_payment_key VARCHAR(200),
    toss_order_id VARCHAR(200),
    approved_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 배포 체크리스트

### Railway (Backend)

1. **환경 변수 설정**
```bash
TOSS_CLIENT_KEY=live_ck_xxxxxxxxxx
TOSS_SECRET_KEY=live_sk_xxxxxxxxxx
TOSS_SUCCESS_URL=https://easyk.vercel.app/payment/success
TOSS_FAIL_URL=https://easyk.vercel.app/payment/fail
```

2. **Webhook URL 설정**
   - 토스 페이먼츠 대시보드에서 Webhook URL 등록
   - `https://your-backend.up.railway.app/api/payments/webhook`

### Vercel (Frontend)

1. **환경 변수 설정**
```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_xxxxxxxxxx
NEXT_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
```

## 🧪 테스트 시나리오

### 1. 성공 시나리오
1. 상담 신청 생성
2. 결제 페이지 이동
3. 테스트 카드 정보 입력
4. 결제 승인 확인
5. 상담 상태 확인 (`payment_status: 'paid'`)

### 2. 실패 시나리오
1. 상담 신청 생성
2. 결제 페이지 이동
3. 잘못된 카드 정보 입력 또는 결제 취소
4. Fail 페이지 리다이렉트 확인
5. 에러 메시지 표시 확인

### 3. 결제 취소 시나리오
1. 결제 완료된 상담 선택
2. 취소 요청
3. 토스 결제 취소 API 호출
4. 환불 처리 확인

## 📞 지원

토스 페이먼츠 문제 발생 시:
- 개발자 센터: https://developers.tosspayments.com/
- 고객센터: 1544-7772
- 이메일: developers@toss.im

## 🔐 보안 주의사항

1. **Secret Key 보호**
   - Secret Key는 절대 프론트엔드에 노출하지 않음
   - 환경 변수로만 관리
   - GitHub에 커밋하지 않음

2. **결제 승인 검증**
   - 백엔드에서 반드시 금액 재확인
   - 사용자가 전송한 금액과 DB의 금액 비교

3. **HTTPS 사용**
   - 프로덕션 환경에서는 반드시 HTTPS 사용
   - 토스 페이먼츠는 HTTPS만 지원

## 📋 현재 상태

- ✅ 결제 모델 및 스키마 구현
- ✅ 결제 라우터 및 서비스 구현
- ✅ 프론트엔드 결제 페이지 구현
- ⚠️ **토스 API 키 설정 필요**
- ⚠️ **실제 결제 테스트 필요**

## 🎯 다음 단계

1. 토스 페이먼츠 계정 생성 및 API 키 발급
2. 환경 변수 설정 (Backend + Frontend)
3. 테스트 결제 실행
4. Webhook 설정 및 테스트
5. 프로덕션 API 키로 전환
