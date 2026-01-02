# easyK 프로젝트 코드 리뷰 리포트 v2

**작성일**: 2025-01-01
**리뷰 범위**: 현재까지 개발된 모든 소스 코드 (결제 시스템 포함)
**진행 상황**: Phase 5 (결제 시스템) 완료 (37/73 Task 완료, 51%)

---

## 🔴 심각한 문제 (Critical Issues)

### 1. 결제 플로우 논리 오류

**위치**: 
- `frontend/src/app/(dashboard)/consultations/[id]/payment/success/page.tsx` (35-55줄)
- `backend/src/services/payment_service.py` (100-157줄)

**문제**:
1. **결제 생성 시점 불일치**: 
   - `success/page.tsx`에서 결제를 생성하려고 시도하지만, 이 시점에서는 이미 토스페이먼츠 결제가 완료된 상태
   - 실제로는 결제 페이지에서 결제 버튼 클릭 전에 결제 레코드를 생성해야 함
   - 현재는 `requestPayment`만 호출하고 결제 레코드 생성이 없음

2. **콜백 처리 순서 문제**:
   - 콜백에서 `transaction_id == payment_key`로 조회하는데, 결제 생성 시점에 `payment_key`가 없음
   - 결제 생성 시 `payment_data.payment_key`를 `transaction_id`에 저장하지만, 실제 토스페이먼츠 `paymentKey`는 결제 완료 후에만 받을 수 있음

3. **토스페이먼츠 클라이언트 미사용**:
   - `backend/src/utils/toss_payments.py`에 `TossPaymentsClient` 클래스가 있지만 실제로 사용되지 않음
   - 콜백에서 토스페이먼츠 API로 결제 검증을 하지 않음

**영향**:
- 결제 플로우가 작동하지 않을 가능성이 높음
- 보안 취약점 (서버 측 검증 없이 프론트엔드에서 온 데이터만 신뢰)
- 중복 결제 방지 실패 가능성

**수정 제안**:
1. 결제 페이지에서 `requestPayment` 호출 전에 임시 결제 레코드 생성 (status: 'pending')
2. 콜백에서 토스페이먼츠 API로 결제 검증 후 `transaction_id` 업데이트
3. 또는 토스페이먼츠 Payment Widget의 동작 방식에 맞게 플로우 재설계

---

### 2. 결제 콜백 인증 부재

**위치**: 
- `backend/src/routers/payments.py` (38-57줄)

**문제**:
- `/api/payments/callback` 엔드포인트에 인증이 없음
- 누구나 이 엔드포인트를 호출할 수 있음
- 서명 검증 없이 토스페이먼츠에서 온 요청인지 확인 불가

**영향**:
- 보안 취약점: 악의적인 사용자가 가짜 결제 완료 콜백을 보낼 수 있음
- 재무적 위험

**수정 제안**:
- 토스페이먼츠 서명 검증 추가 (토스페이먼츠에서 제공하는 webhook 서명 검증)
- 또는 최소한 IP 화이트리스트 적용 (토스페이먼츠 IP만 허용)
- 또는 시크릿 토큰 기반 인증

---

### 3. 토스페이먼츠 SANDBOX_URL 설정 오류

**위치**: 
- `backend/src/utils/toss_payments.py` (11-12줄)

**문제**:
```python
BASE_URL = "https://api.tosspayments.com/v1"
SANDBOX_URL = "https://api.tosspayments.com/v1"  # ❌ SANDBOX와 PRODUCTION이 같음
```

**영향**:
- 테스트 환경과 프로덕션 환경 구분 불가
- 실제로는 토스페이먼츠가 동일한 엔드포인트를 사용하지만, 명확성을 위해 주석 추가 필요

**수정 제안**:
- 주석 추가 또는 실제 샌드박스 URL 확인 (토스페이먼츠 문서 참조)

---

## 🟡 중요한 문제 (Important Issues)

### 4. 결제 생성 시 payment_key 문제

**위치**: 
- `backend/src/services/payment_service.py` (82줄)
- `frontend/src/app/(dashboard)/consultations/[id]/payment/page.tsx`

**문제**:
- `create_payment`에서 `payment_data.payment_key`를 `transaction_id`에 저장
- 하지만 실제 토스페이먼츠 `paymentKey`는 결제 위젯에서 `requestPayment` 호출 후에만 받을 수 있음
- 결제 생성 시점에는 `paymentKey`가 아직 없음

**영향**:
- 결제 레코드 생성 시 잘못된 데이터 저장
- 콜백에서 결제를 찾을 수 없음

**수정 제안**:
- 결제 생성 시 `transaction_id`를 NULL로 설정
- 콜백에서 `paymentKey`를 받아 `transaction_id` 업데이트

---

### 5. 에러 핸들링 부족

**위치**: 
- `frontend/src/app/(dashboard)/consultations/[id]/payment/success/page.tsx` (39-55줄)

**문제**:
```typescript
try {
  const createResponse = await fetch("/api/payments", {
    // ...
  });
  // 이미 생성된 경우 에러 무시
} catch (e) {
  console.log("Payment creation error (may already exist):", e);
}
```
- 에러를 단순히 무시하고 있음
- HTTP 에러 상태 코드를 확인하지 않음

**영향**:
- 실제 에러를 놓칠 수 있음
- 디버깅 어려움

**수정 제안**:
- HTTP 상태 코드 확인 (409 Conflict 등)
- 적절한 에러 처리 및 로깅

---

### 6. 결제 성공 페이지 useEffect 의존성 배열 누락

**위치**: 
- `frontend/src/app/(dashboard)/consultations/[id]/payment/success/page.tsx` (13-15줄)

**문제**:
```typescript
useEffect(() => {
  processPaymentCallback();
}, []); // 의존성 배열에 searchParams 누락
```

**영향**:
- React 18+ strict mode에서 경고 발생 가능
- `searchParams` 변경 시 재실행되지 않음 (현재는 문제 없지만 패턴상 문제)

**수정 제안**:
- 의존성 배열에 필요한 값 추가 또는 eslint 규칙에 따라 수정

---

### 7. 결제 콜백에서 amount 검증 누락

**위치**: 
- `backend/src/services/payment_service.py` (100-157줄)

**문제**:
- 콜백에서 결제 금액을 검증하지 않음
- 토스페이먼츠에서 받은 금액과 DB에 저장된 금액 비교 없음

**영향**:
- 금액 조작 공격 가능성
- 재무적 위험

**수정 제안**:
- 토스페이먼츠 API로 결제 정보 조회 후 금액 검증
- DB의 `consultation.amount`와 토스페이먼츠 `amount` 비교

---

## 🟢 개선 권장 사항 (Recommendations)

### 8. 타입 안전성 개선

**위치**: 
- `frontend/src/app/(dashboard)/consultations/[id]/payment/page.tsx`

**문제**:
- `consultation?.amount`를 `parseFloat`로 변환할 때 타입 안전성 부족
- `amount`가 `string`인지 `number`인지 불명확

**수정 제안**:
- 타입 가드 추가
- 또는 스키마에서 타입 명확화

---

### 9. 테스트 커버리지

**문제**:
- 결제 플로우 전체에 대한 통합 테스트 부족
- 프론트엔드 결제 페이지 테스트 없음

**수정 제안**:
- E2E 테스트 추가 (Cypress, Playwright 등)
- 결제 플로우 통합 테스트

---

### 10. 환경 변수 검증

**위치**: 
- `backend/src/config.py`
- `frontend/src/app/(dashboard)/consultations/[id]/payment/page.tsx`

**문제**:
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`가 없을 때 런타임 에러만 발생
- 시작 시점에 환경 변수 검증 없음

**수정 제안**:
- 시작 시 필수 환경 변수 검증
- 명확한 에러 메시지 제공

---

## 📋 우선순위별 수정 가이드

### 즉시 수정 필요 (P0)

1. **결제 플로우 재설계**
   - 결제 생성 시점 명확화
   - 토스페이먼츠 API 검증 추가
   - 콜백 보안 강화

2. **결제 콜백 인증 추가**
   - 서명 검증 또는 IP 화이트리스트
   - 최소한 시크릿 토큰 기반 인증

3. **금액 검증 추가**
   - 콜백에서 금액 검증 로직 추가

### 빠른 시일 내 수정 (P1)

4. **에러 핸들링 개선**
   - HTTP 상태 코드 확인
   - 적절한 에러 메시지

5. **토스페이먼츠 클라이언트 활용**
   - 실제로 사용하도록 수정
   - 또는 미사용 코드 제거

### 여유 있을 때 개선 (P2)

6. **타입 안전성 개선**
7. **테스트 커버리지 향상**
8. **환경 변수 검증 추가**

---

## 결론

결제 시스템의 핵심 로직에 몇 가지 심각한 문제가 있습니다. 특히 결제 플로우의 논리적 오류와 보안 취약점은 즉시 수정이 필요합니다. 토스페이먼츠 Payment Widget의 실제 동작 방식에 맞게 플로우를 재설계하고, 서버 측 검증을 추가해야 합니다.


