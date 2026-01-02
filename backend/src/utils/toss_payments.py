"""토스페이먼츠 API 클라이언트 유틸리티"""

import httpx
from typing import Optional, Dict, Any
from ..config import settings


class TossPaymentsClient:
    """토스페이먼츠 API 클라이언트"""

    BASE_URL = "https://api.tosspayments.com/v1"
    # 참고: 토스페이먼츠는 샌드박스와 프로덕션 모두 동일한 엔드포인트를 사용합니다.
    # 구분은 client_key와 secret_key로 이루어집니다.
    SANDBOX_URL = "https://api.tosspayments.com/v1"

    def __init__(self, client_key: Optional[str] = None, secret_key: Optional[str] = None):
        """
        토스페이먼츠 클라이언트 초기화

        Args:
            client_key: 클라이언트 키 (기본값: settings.TOSS_CLIENT_KEY)
            secret_key: 시크릿 키 (기본값: settings.TOSS_SECRET_KEY)
        """
        self.client_key = client_key or settings.TOSS_CLIENT_KEY
        self.secret_key = secret_key or settings.TOSS_SECRET_KEY
        self.base_url = self.SANDBOX_URL if settings.DEBUG else self.BASE_URL

    def _get_headers(self) -> Dict[str, str]:
        """API 요청 헤더 생성"""
        import base64

        if not self.secret_key:
            raise ValueError("TOSS_SECRET_KEY가 설정되지 않았습니다.")

        # Basic Authentication: secret_key를 base64 인코딩
        auth_string = f"{self.secret_key}:"
        auth_bytes = auth_string.encode("utf-8")
        auth_b64 = base64.b64encode(auth_bytes).decode("utf-8")

        return {
            "Authorization": f"Basic {auth_b64}",
            "Content-Type": "application/json",
        }

    async def confirm_payment(
        self,
        payment_key: str,
        order_id: str,
        amount: int,
    ) -> Dict[str, Any]:
        """
        결제 승인

        Args:
            payment_key: 결제 키 (프론트엔드에서 받은 paymentKey)
            order_id: 주문 ID (consultation_id)
            amount: 결제 금액 (원)

        Returns:
            Dict[str, Any]: 결제 승인 응답

        Raises:
            httpx.HTTPStatusError: API 요청 실패 시
        """
        url = f"{self.base_url}/payments/confirm"
        data = {
            "paymentKey": payment_key,
            "orderId": order_id,
            "amount": amount,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=self._get_headers(),
                json=data,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()

    async def cancel_payment(
        self,
        payment_key: str,
        cancel_reason: str,
        cancel_amount: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        결제 취소 (부분 취소 가능)

        Args:
            payment_key: 결제 키
            cancel_reason: 취소 사유
            cancel_amount: 취소 금액 (None이면 전체 취소)

        Returns:
            Dict[str, Any]: 취소 응답

        Raises:
            httpx.HTTPStatusError: API 요청 실패 시
        """
        url = f"{self.base_url}/payments/{payment_key}/cancel"
        data = {
            "cancelReason": cancel_reason,
        }
        if cancel_amount:
            data["cancelAmount"] = cancel_amount

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=self._get_headers(),
                json=data,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()

    async def get_payment(self, payment_key: str) -> Dict[str, Any]:
        """
        결제 조회

        Args:
            payment_key: 결제 키

        Returns:
            Dict[str, Any]: 결제 정보

        Raises:
            httpx.HTTPStatusError: API 요청 실패 시
        """
        url = f"{self.base_url}/payments/{payment_key}"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self._get_headers(),
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()


# 싱글톤 인스턴스
toss_payments_client = TossPaymentsClient()

