"""Email Notification Service"""

import logging
from typing import Optional
from smtplib import SMTP, SMTPException
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from ..config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """이메일 발송 서비스"""

    def __init__(self):
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', None)
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@easyk.com')
        self.enabled = getattr(settings, 'EMAIL_ENABLED', False)

    def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
    ) -> bool:
        """
        이메일 발송

        Args:
            to_email: 수신자 이메일
            subject: 제목
            body_text: 본문 (텍스트)
            body_html: 본문 (HTML, optional)

        Returns:
            bool: 발송 성공 여부
        """
        if not self.enabled:
            logger.info(f"[EMAIL] 이메일 발송 비활성화됨: {to_email} - {subject}")
            return False

        if not self.smtp_user or not self.smtp_password:
            logger.warning("[EMAIL] SMTP 인증 정보가 설정되지 않음")
            return False

        try:
            # 이메일 메시지 생성
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = to_email

            # 텍스트 파트 추가
            text_part = MIMEText(body_text, "plain", "utf-8")
            message.attach(text_part)

            # HTML 파트 추가 (있는 경우)
            if body_html:
                html_part = MIMEText(body_html, "html", "utf-8")
                message.attach(html_part)

            # SMTP 서버 연결 및 발송
            with SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)

            logger.info(f"[EMAIL] 이메일 발송 성공: {to_email} - {subject}")
            return True

        except SMTPException as e:
            logger.error(f"[EMAIL] SMTP 오류: {e}")
            return False
        except Exception as e:
            logger.error(f"[EMAIL] 이메일 발송 실패: {e}")
            return False


# 싱글톤 인스턴스
email_service = EmailService()


def send_consultation_matched_email(user_email: str, consultant_name: str, consultation_type: str):
    """상담 매칭 완료 알림"""
    subject = "[easyK] 전문가 매칭 완료"
    body_text = f"""
안녕하세요,

고객님의 {consultation_type} 상담 요청이 전문가에게 매칭되었습니다.

담당 전문가: {consultant_name}

easyK 플랫폼에서 상담 진행 상황을 확인하실 수 있습니다.

감사합니다.
easyK 팀
    """
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>전문가 매칭 완료</h2>
        <p>안녕하세요,</p>
        <p>고객님의 <strong>{consultation_type}</strong> 상담 요청이 전문가에게 매칭되었습니다.</p>
        <p><strong>담당 전문가:</strong> {consultant_name}</p>
        <p>easyK 플랫폼에서 상담 진행 상황을 확인하실 수 있습니다.</p>
        <p>감사합니다.<br>easyK 팀</p>
    </body>
    </html>
    """
    return email_service.send_email(user_email, subject, body_text, body_html)


def send_consultation_accepted_email(user_email: str, consultant_name: str, scheduled_at: Optional[str] = None):
    """상담 수락 알림"""
    subject = "[easyK] 상담 요청 수락"
    scheduled_info = f"\n예약 일시: {scheduled_at}" if scheduled_at else ""
    body_text = f"""
안녕하세요,

{consultant_name} 전문가가 고객님의 상담 요청을 수락했습니다.{scheduled_info}

결제를 완료하시면 상담이 진행됩니다.

감사합니다.
easyK 팀
    """
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>상담 요청 수락</h2>
        <p>안녕하세요,</p>
        <p><strong>{consultant_name}</strong> 전문가가 고객님의 상담 요청을 수락했습니다.</p>
        {f"<p><strong>예약 일시:</strong> {scheduled_at}</p>" if scheduled_at else ""}
        <p>결제를 완료하시면 상담이 진행됩니다.</p>
        <p>감사합니다.<br>easyK 팀</p>
    </body>
    </html>
    """
    return email_service.send_email(user_email, subject, body_text, body_html)


def send_consultation_rejected_email(user_email: str, consultant_name: str):
    """상담 거절 알림 (다른 전문가 재추천)"""
    subject = "[easyK] 상담 요청 처리 안내"
    body_text = f"""
안녕하세요,

아쉽게도 {consultant_name} 전문가가 현재 상담 요청을 수락할 수 없는 상황입니다.

다른 전문가를 찾고 있으며, 곧 연락드리겠습니다.

감사합니다.
easyK 팀
    """
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>상담 요청 처리 안내</h2>
        <p>안녕하세요,</p>
        <p>아쉽게도 <strong>{consultant_name}</strong> 전문가가 현재 상담 요청을 수락할 수 없는 상황입니다.</p>
        <p>다른 전문가를 찾고 있으며, 곧 연락드리겠습니다.</p>
        <p>감사합니다.<br>easyK 팀</p>
    </body>
    </html>
    """
    return email_service.send_email(user_email, subject, body_text, body_html)


def send_payment_confirmation_email(user_email: str, amount: float, consultation_type: str):
    """결제 완료 알림"""
    subject = "[easyK] 결제 완료"
    body_text = f"""
안녕하세요,

{consultation_type} 상담 결제가 완료되었습니다.

결제 금액: {amount:,.0f}원

상담 진행에 대한 안내는 담당 전문가로부터 별도로 연락드립니다.

감사합니다.
easyK 팀
    """
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>결제 완료</h2>
        <p>안녕하세요,</p>
        <p><strong>{consultation_type}</strong> 상담 결제가 완료되었습니다.</p>
        <p><strong>결제 금액:</strong> {amount:,.0f}원</p>
        <p>상담 진행에 대한 안내는 담당 전문가로부터 별도로 연락드립니다.</p>
        <p>감사합니다.<br>easyK 팀</p>
    </body>
    </html>
    """
    return email_service.send_email(user_email, subject, body_text, body_html)


def send_job_application_status_email(
    user_email: str,
    job_title: str,
    company_name: str,
    status: str,
    reviewer_comment: Optional[str] = None,
):
    """일자리 지원 상태 변경 알림"""
    status_labels = {
        "accepted": "채용 확정",
        "rejected": "불합격",
        "in_review": "검토 중",
    }
    status_label = status_labels.get(status, status)

    subject = f"[easyK] {company_name} - {job_title} 지원 결과"

    comment_text = f"\n\n검토자 코멘트:\n{reviewer_comment}" if reviewer_comment else ""
    body_text = f"""
안녕하세요,

{company_name}의 {job_title} 지원에 대한 결과를 알려드립니다.

결과: {status_label}{comment_text}

감사합니다.
easyK 팀
    """

    comment_html = f"<div style='background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1E5BA0; margin-top: 15px;'><strong>검토자 코멘트:</strong><br>{reviewer_comment}</div>" if reviewer_comment else ""
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>{company_name} - {job_title}</h2>
        <p>안녕하세요,</p>
        <p><strong>{company_name}</strong>의 <strong>{job_title}</strong> 지원에 대한 결과를 알려드립니다.</p>
        <p><strong>결과:</strong> <span style="color: {'#28a745' if status == 'accepted' else '#dc3545' if status == 'rejected' else '#007bff'};">{status_label}</span></p>
        {comment_html}
        <p>감사합니다.<br>easyK 팀</p>
    </body>
    </html>
    """
    return email_service.send_email(user_email, subject, body_text, body_html)
