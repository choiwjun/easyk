from typing import Dict, Any
from fastapi import Request

# 다국어 에러 메시지
ERROR_MESSAGES: Dict[str, Dict[str, str]] = {
    "ko": {
        # 인증 관련
        "invalid_credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "token_invalid": "토큰이 유효하지 않습니다.",
        "token_expired": "토큰이 만료되었습니다. 다시 로그인해주세요.",
        "unauthorized": "인증이 필요합니다.",
        "forbidden": "접근 권한이 없습니다.",
        "admin_required": "관리자 권한이 필요합니다.",
        
        # 사용자 관련
        "user_not_found": "사용자를 찾을 수 없습니다.",
        "user_already_exists": "이미 존재하는 이메일입니다.",
        "invalid_email": "올바른 이메일 주소를 입력해주세요.",
        "invalid_password": "비밀번호는 최소 8자 이상이어야 합니다.",
        
        # 상담 관련
        "consultation_not_found": "상담을 찾을 수 없습니다.",
        "consultation_already_applied": "이미 신청한 상담입니다.",
        "consultation_not_active": "상담이 활성 상태가 아닙니다.",
        "consultation_already_matched": "이미 매칭된 상담입니다.",
        "consultation_not_matched": "매칭되지 않은 상담입니다.",
        "consultation_already_completed": "이미 완료된 상담입니다.",
        
        # 전문가 관련
        "consultant_not_found": "전문가를 찾을 수 없습니다.",
        "consultant_not_available": "전문가가 현재 이용 불가능합니다.",
        
        # 일자리 관련
        "job_not_found": "일자리를 찾을 수 없습니다.",
        "job_not_active": "일자리가 활성 상태가 아닙니다.",
        "job_already_applied": "이미 지원한 일자리입니다.",
        "job_application_not_found": "지원 내역을 찾을 수 없습니다.",
        
        # 결제 관련
        "payment_not_found": "결제 정보를 찾을 수 없습니다.",
        "payment_already_completed": "이미 완료된 결제입니다.",
        "payment_failed": "결제에 실패했습니다.",
        "invalid_payment_amount": "유효하지 않은 결제 금액입니다.",
        
        # 리뷰 관련
        "review_not_found": "리뷰를 찾을 수 없습니다.",
        "review_already_exists": "이미 작성된 리뷰입니다.",
        "review_not_allowed": "리뷰 작성 권한이 없습니다.",
        
        # 정부 지원 관련
        "support_not_found": "정부 지원을 찾을 수 없습니다.",
        "support_not_active": "정부 지원이 활성 상태가 아닙니다.",
        
        # 일반 에러
        "invalid_request": "잘못된 요청입니다.",
        "internal_server_error": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        "validation_error": "입력 정보를 확인해주세요.",
        "network_error": "네트워크 오류가 발생했습니다.",
    },
    "en": {
        # Authentication related
        "invalid_credentials": "Invalid email or password.",
        "token_invalid": "Invalid token.",
        "token_expired": "Token has expired. Please login again.",
        "unauthorized": "Authentication required.",
        "forbidden": "Access forbidden.",
        "admin_required": "Admin access required.",
        
        # User related
        "user_not_found": "User not found.",
        "user_already_exists": "Email already exists.",
        "invalid_email": "Please enter a valid email address.",
        "invalid_password": "Password must be at least 8 characters.",
        
        # Consultation related
        "consultation_not_found": "Consultation not found.",
        "consultation_already_applied": "You have already applied for this consultation.",
        "consultation_not_active": "Consultation is not active.",
        "consultation_already_matched": "Consultation is already matched.",
        "consultation_not_matched": "Consultation is not matched.",
        "consultation_already_completed": "Consultation is already completed.",
        
        # Consultant related
        "consultant_not_found": "Consultant not found.",
        "consultant_not_available": "Consultant is not currently available.",
        
        # Job related
        "job_not_found": "Job not found.",
        "job_not_active": "Job is not active.",
        "job_already_applied": "You have already applied to this job.",
        "job_application_not_found": "Job application not found.",
        
        # Payment related
        "payment_not_found": "Payment not found.",
        "payment_already_completed": "Payment already completed.",
        "payment_failed": "Payment failed.",
        "invalid_payment_amount": "Invalid payment amount.",
        
        # Review related
        "review_not_found": "Review not found.",
        "review_already_exists": "Review already exists.",
        "review_not_allowed": "You are not allowed to write a review.",
        
        # Government support related
        "support_not_found": "Government support not found.",
        "support_not_active": "Government support is not active.",
        
        # General errors
        "invalid_request": "Invalid request.",
        "internal_server_error": "An internal server error occurred. Please try again later.",
        "validation_error": "Please check your input.",
        "network_error": "A network error occurred.",
    },
}


def get_language_from_request(request: Request) -> str:
    """
    Accept-Language 헤더에서 언어를 추출합니다.
    기본값은 'ko'입니다.
    """
    accept_language = request.headers.get("Accept-Language", "")
    
    # Accept-Language 헤더 파싱 (예: "ko-KR,ko;q=0.9,en;q=0.8")
    languages = [lang.split(";")[0].strip() for lang in accept_language.split(",")]
    
    for lang in languages:
        # 언어 코드에서 첫 2자만 추출 (예: ko-KR -> ko, en-US -> en)
        lang_code = lang.split("-")[0].lower()
        
        # 지원하는 언어인지 확인
        if lang_code in ERROR_MESSAGES:
            return lang_code
    
    # 기본값: 한국어
    return "ko"


def get_error_message(key: str, language: str = "ko", **kwargs: Any) -> str:
    """
    다국어 에러 메시지를 반환합니다.
    
    Args:
        key: 에러 메시지 키
        language: 언어 코드 (ko 또는 en)
        **kwargs: 메시지 포맷에 전달할 인자
    
    Returns:
        다국어 에러 메시지
    """
    lang = language if language in ERROR_MESSAGES else "ko"
    message = ERROR_MESSAGES[lang].get(key, ERROR_MESSAGES["ko"].get(key, key))
    
    # 포맷팅이 필요한 경우
    if kwargs:
        try:
            return message.format(**kwargs)
        except (KeyError, ValueError):
            return message
    
    return message



