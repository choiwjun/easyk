# 이메일 알림 설정 가이드

## 📧 개요

easyK 플랫폼에서 다음과 같은 이메일 알림 기능이 구현되었습니다:

### 구현된 알림

- ✅ **상담 매칭 완료**: 전문가가 자동 매칭되었을 때
- ✅ **상담 수락 알림**: 전문가가 상담 요청을 수락했을 때
- ✅ **상담 거절 알림**: 전문가가 상담 요청을 거절했을 때 (다른 전문가 찾는 중)
- ✅ **결제 완료 알림**: 상담료 결제가 완료되었을 때
- ✅ **지원 결과 알림**: 일자리 지원에 대한 채용/거절 결과

---

## 🔧 환경 설정

### 1. 백엔드 `.env` 파일 수정

`backend/.env` 파일에 다음 환경 변수를 추가합니다:

```bash
# Email / SMTP 설정
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@easyk.com
```

### 2. Gmail 앱 비밀번호 생성 (권장)

Gmail을 사용하는 경우:

1. Google 계정 설정 → 보안 → 2단계 인증 활성화
2. [앱 비밀번호 생성](https://myaccount.google.com/apppasswords)
3. "앱 선택" → "기타(맞춤 이름)" → "easyK"
4. 생성된 16자리 비밀번호를 `SMTP_PASSWORD`에 입력

⚠️ **중요**: 일반 Gmail 비밀번호가 아닌 앱 비밀번호를 사용해야 합니다!

### 3. 다른 SMTP 서비스 사용

#### AWS SES (프로덕션 권장)

```bash
EMAIL_ENABLED=true
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-access-key
SMTP_PASSWORD=your-ses-secret-key
FROM_EMAIL=verified-email@yourdomain.com
```

#### SendGrid

```bash
EMAIL_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=verified-sender@yourdomain.com
```

---

## 🧪 테스트

### 로컬 테스트

```bash
# 백엔드 디렉토리에서
cd backend

# Python 가상환경 활성화
source venv/bin/activate  # Mac/Linux
.\venv\Scripts\activate    # Windows

# 백엔드 서버 실행
uvicorn src.main:app --reload
```

### 이메일 발송 테스트

1. **상담 신청 테스트**
   - 프론트엔드에서 상담 신청
   - 자동 매칭되면 이메일 발송 확인

2. **일자리 지원 상태 변경 테스트**
   - 관리자로 로그인
   - 지원자 목록에서 "채용" 또는 "거절" 선택
   - 지원자에게 이메일 발송 확인

3. **로그 확인**
   ```bash
   # 백엔드 콘솔에서 다음과 같은 로그 확인
   [EMAIL] 이메일 발송 성공: user@example.com - [easyK] 전문가 매칭 완료
   ```

---

## 🐛 문제 해결

### 이메일이 발송되지 않는 경우

1. **환경 변수 확인**
   ```python
   # backend/src/config.py에서 확인
   from src.config import settings
   print(f"EMAIL_ENABLED: {settings.EMAIL_ENABLED}")
   print(f"SMTP_USER: {settings.SMTP_USER}")
   ```

2. **SMTP 연결 테스트**
   ```python
   # Python 인터프리터에서 실행
   from src.services.email_service import email_service
   result = email_service.send_email(
       "test@example.com",
       "테스트 이메일",
       "이것은 테스트 메시지입니다."
   )
   print(f"발송 성공: {result}")
   ```

3. **일반적인 오류**

   | 오류 메시지 | 원인 | 해결 방법 |
   |------------|------|----------|
   | `SMTPAuthenticationError` | 잘못된 비밀번호 | 앱 비밀번호 재생성 |
   | `SMTPConnectError` | 네트워크 차단 | 방화벽/안티바이러스 확인 |
   | `SMTPServerDisconnected` | STARTTLS 실패 | SMTP_PORT=587 확인 |
   | `No module named email` | 패키지 누락 | `pip install email` |

---

## 📊 프로덕션 배포

### Railway 배포 시

Railway 대시보드에서 환경 변수 추가:

```
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@easyk.com
```

### Docker 배포 시

`docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - EMAIL_ENABLED=true
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - FROM_EMAIL=${FROM_EMAIL}
```

---

## 📋 이메일 템플릿 수정

이메일 내용을 수정하려면 `backend/src/services/email_service.py` 파일을 편집합니다:

```python
# 예: 상담 매칭 완료 이메일
def send_consultation_matched_email(user_email, consultant_name, consultation_type):
    subject = "[easyK] 전문가 매칭 완료"  # 제목 수정
    body_text = f"""
    안녕하세요,

    고객님의 {consultation_type} 상담 요청이
    {consultant_name} 전문가에게 매칭되었습니다.

    감사합니다.
    """  # 본문 수정
```

---

## ✅ 체크리스트

배포 전 확인 사항:

- [ ] `.env` 파일에 SMTP 설정 추가
- [ ] `EMAIL_ENABLED=true` 설정
- [ ] Gmail 앱 비밀번호 생성 (Gmail 사용 시)
- [ ] 로컬에서 이메일 발송 테스트
- [ ] 프로덕션 환경 변수 설정 (Railway/Vercel)
- [ ] 발신 이메일 주소 인증 (AWS SES 사용 시)

---

## 📞 지원

이메일 기능 관련 문의:
- GitHub Issues: https://github.com/your-repo/easyk/issues
- 문서: `backend/src/services/email_service.py`
