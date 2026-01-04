# 이메일 알림 시스템 테스트 가이드

## 📋 개요

easyK 플랫폼은 다음 5가지 이메일 알림을 지원합니다:
1. 상담 매칭 완료 알림
2. 상담 수락 알림
3. 상담 거절 알림
4. 결제 완료 알림
5. 일자리 지원 상태 변경 알림

## 🔧 설정

### 1. SMTP 설정 (Gmail 사용)

**Backend 환경 변수 (.env)**
```bash
# 이메일 설정
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail 앱 비밀번호
FROM_EMAIL=noreply@easyk.com
```

### 2. Gmail 앱 비밀번호 생성

1. Google 계정 설정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
   - 앱 선택: 메일
   - 기기 선택: 기타 (easyK Backend)
4. 생성된 16자리 비밀번호를 `SMTP_PASSWORD`에 입력

### 3. Railway 환경 변수 설정

Railway 대시보드에서 다음 환경 변수 추가:
```
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
FROM_EMAIL=noreply@easyk.com
```

## 📧 이메일 알림 종류

### 1. 상담 매칭 완료 알림

**트리거**: 사용자가 상담 신청 시 전문가가 자동 매칭되면 발송

**받는 사람**: 상담 신청 사용자

**내용**:
```
제목: [easyK] 상담 전문가가 매칭되었습니다

안녕하세요,

{consultant_name} 전문가가 귀하의 {consultation_type} 상담 요청에 배정되었습니다.

전문가가 상담 요청을 검토한 후 연락드릴 예정입니다.

감사합니다.
easyK 팀
```

**코드 위치**: `backend/src/services/consultation_service.py:57-69`

---

### 2. 상담 수락 알림

**트리거**: 전문가가 상담 요청을 수락하면 발송

**받는 사람**: 상담 신청 사용자

**내용**:
```
제목: [easyK] 상담 요청이 수락되었습니다

안녕하세요,

{consultant_name} 전문가가 귀하의 상담 요청을 수락했습니다.

예정된 상담 일시: {scheduled_at}

감사합니다.
easyK 팀
```

**코드 위치**: `backend/src/services/consultation_service.py:158-172`

---

### 3. 상담 거절 알림

**트리거**: 전문가가 상담 요청을 거절하면 발송

**받는 사람**: 상담 신청 사용자

**내용**:
```
제목: [easyK] 상담 요청이 거절되었습니다

안녕하세요,

죄송하지만 {consultant_name} 전문가가 현재 상담이 어렵다고 알려왔습니다.

다른 전문가를 자동으로 배정하고 있으니 잠시만 기다려주세요.

감사합니다.
easyK 팀
```

**코드 위치**: `backend/src/services/consultation_service.py:223-236`

---

### 4. 결제 완료 알림

**트리거**: 상담 결제가 완료되면 발송

**받는 사람**: 결제 사용자

**내용**:
```
제목: [easyK] 결제가 완료되었습니다

안녕하세요,

{consultation_type} 상담 결제가 완료되었습니다.

결제 금액: {amount}원

영수증은 마이페이지에서 확인하실 수 있습니다.

감사합니다.
easyK 팀
```

**코드 위치**: `backend/src/services/email_service.py`

---

### 5. 일자리 지원 상태 변경 알림

**트리거**: 관리자가 지원자 상태를 변경하면 발송

**받는 사람**: 일자리 지원자

**내용 (합격)**:
```
제목: [easyK] {job_title} 지원 결과 안내

안녕하세요,

{company_name}의 {job_title} 포지션에 합격하셨습니다!

축하드립니다. 담당자가 곧 연락드릴 예정입니다.

검토자 코멘트:
{reviewer_comment}

감사합니다.
easyK 팀
```

**내용 (불합격)**:
```
제목: [easyK] {job_title} 지원 결과 안내

안녕하세요,

죄송하지만 {company_name}의 {job_title} 포지션에 불합격하셨습니다.

검토자 코멘트:
{reviewer_comment}

다른 기회에 다시 지원해 주시기 바랍니다.

감사합니다.
easyK 팀
```

**코드 위치**: `backend/src/services/job_service.py:493-508`

---

## 🧪 테스트 시나리오

### 테스트 1: 상담 매칭 알림

**준비**:
1. 이메일 설정 활성화
2. 테스트 사용자 계정 생성 (실제 이메일 사용)

**절차**:
1. 테스트 계정으로 로그인
2. 상담 신청 (`/consultations/new`)
3. 전문가 자동 매칭 확인
4. 이메일 수신 확인

**예상 결과**:
- 5분 이내 이메일 수신
- 전문가 이름, 상담 유형 정보 포함

---

### 테스트 2: 상담 수락/거절 알림

**준비**:
1. 전문가 계정으로 로그인
2. 매칭된 상담 요청 확인

**절차 (수락)**:
1. 전문가 대시보드 접속 (`/consultant/dashboard`)
2. 상담 요청 "수락" 버튼 클릭
3. 클라이언트 이메일 수신 확인

**절차 (거절)**:
1. 전문가 대시보드 접속
2. 상담 요청 "거절" 버튼 클릭
3. 클라이언트 이메일 수신 확인

**예상 결과**:
- 수락: "상담이 수락되었습니다" 이메일
- 거절: "상담이 거절되었습니다" 이메일

---

### 테스트 3: 일자리 지원 상태 변경 알림

**준비**:
1. 관리자 계정으로 로그인
2. 지원자가 있는 일자리 공고 선택

**절차**:
1. 관리자 일자리 관리 페이지 접속 (`/admin/jobs`)
2. 지원자 목록에서 상태 변경 (합격/불합격)
3. 지원자 이메일 수신 확인

**예상 결과**:
- 합격: "합격하셨습니다" 이메일
- 불합격: "불합격하셨습니다" 이메일
- 검토자 코멘트 포함

---

## 🐛 문제 해결

### 1. 이메일이 발송되지 않음

**확인사항**:
- `EMAIL_ENABLED=true` 설정 확인
- SMTP 설정 (호스트, 포트, 사용자, 비밀번호) 확인
- Gmail 앱 비밀번호 생성 확인
- 2단계 인증 활성화 확인

**로그 확인**:
```bash
# Railway 로그에서 이메일 발송 로그 확인
[EMAIL] 이메일 발송 시도: user@example.com
[EMAIL] 이메일 발송 성공
```

---

### 2. Gmail SMTP 인증 실패

**원인**:
- 잘못된 앱 비밀번호
- 2단계 인증 미활성화

**해결**:
1. Google 계정 설정 확인
2. 앱 비밀번호 재생성
3. 환경 변수 업데이트

---

### 3. 이메일이 스팸으로 분류됨

**해결**:
- SPF, DKIM, DMARC 레코드 설정
- 프로덕션에서는 전문 이메일 서비스 사용 권장 (SendGrid, AWS SES)

---

## 🚀 프로덕션 배포

### 권장 서비스

**1. SendGrid** (추천)
- 무료: 100통/일
- 설정 간단
- 높은 전달률

**2. AWS SES**
- 무료: 62,000통/월
- AWS 계정 필요
- 초기 센드박스 제한

**3. Mailgun**
- 무료: 5,000통/월
- 좋은 API
- 상세한 분석

### SendGrid 설정 예시

```bash
# .env
EMAIL_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@easyk.com
```

---

## 📊 모니터링

### 이메일 발송 로그

**위치**: Railway 로그

**형식**:
```
[EMAIL] 이메일 발송 비활성화됨: user@example.com - 제목
[EMAIL] 이메일 발송 시도: user@example.com - 제목
[EMAIL] 이메일 발송 성공: user@example.com
[EMAIL] 이메일 발송 실패: {error}
```

### 통계 확인

- 발송 성공률
- 평균 발송 시간
- 반송률 (bounce rate)
- 스팸 신고율

---

## ✅ 체크리스트

### 개발 환경
- [ ] EMAIL_ENABLED=true 설정
- [ ] Gmail 앱 비밀번호 생성
- [ ] 각 알림 시나리오 테스트
- [ ] 스팸 폴더 확인

### 프로덕션 환경
- [ ] 전문 이메일 서비스 선택 (SendGrid/SES)
- [ ] API 키 설정
- [ ] 도메인 인증
- [ ] SPF/DKIM 레코드 설정
- [ ] 모니터링 설정
- [ ] 에러 알림 설정

---

## 📞 지원

문제 발생 시:
1. Railway 로그 확인
2. SMTP 설정 재확인
3. 이메일 서비스 대시보드 확인
4. GitHub Issues 등록
