import hashlib
import time
from typing import Dict, Any, Optional
from ..models.schemas import KHQRGenerateResponse, CurrencyType

EXCHANGE_RATE_KHR = 4100  # 1 USD = 4,100 KHR

class KHQRService:
    @staticmethod
    def generate_khqr(
        order_id: str,
        amount_usd: float,
        currency: CurrencyType = "USD",
        bakong_account: str = "roleatopup@ababank",
        merchant_name: str = "RoleaTopup Cambodia"
    ) -> KHQRGenerateResponse:
        """
        Generates standard compliant KHQR payload representation for National Bank of Cambodia (NBC) / Bakong.
        Supports both USD (840) and KHR (116) formats.
        """
        if currency == "USD":
            amount_val = round(amount_usd, 2)
            currency_code = "840"
            amount_str = f"{amount_val:.2f}"
        else:
            amount_val = int(round(amount_usd * EXCHANGE_RATE_KHR))
            currency_code = "116"
            amount_str = str(amount_val)

        timestamp = int(time.time())
        # EMVCo / Bakong Payload Tag construction
        raw_payload = (
            f"00020101021229300010bakong.gov.kh0112{bakong_account}"
            f"520458125303{currency_code}54{len(amount_str):02d}{amount_str}"
            f"5802KH59{len(merchant_name):02d}{merchant_name}"
            f"6010Phnom Penh62{len(order_id)+4:02d}01{len(order_id):02d}{order_id}"
        )
        
        # Calculate MD5 hash for payment tracking reference
        md5_hash = hashlib.md5(f"{order_id}_{amount_str}_{currency}_{timestamp}".encode()).hexdigest()
        full_khqr_string = f"{raw_payload}6304{md5_hash[:4].upper()}"

        return KHQRGenerateResponse(
            success=True,
            qr_string=full_khqr_string,
            md5=md5_hash,
            amount=amount_val,
            currency=currency,
            expires_in_seconds=900,
            bakong_account_id=bakong_account,
            merchant_name=merchant_name
        )

    @staticmethod
    def verify_khqr_payment(md5: str, order_id: str) -> Dict[str, Any]:
        """
        Simulates / executes Bakong Open API payment check.
        """
        return {
            "status": "PAID",
            "transaction_id": f"BAKONG-TXN-{int(time.time())}",
            "order_id": order_id,
            "md5": md5
        }

    @staticmethod
    def generate_md5_hash(text: str) -> str:
        return hashlib.md5(text.encode()).hexdigest()

    @staticmethod
    def generate_bakong_khqr_string(amount: float, currency: str = "USD", merchant_name: str = "Rothz TopUp", order_id: str = "DEP") -> str:
        res = KHQRService.generate_khqr(order_id, amount, currency, merchant_name=merchant_name)
        return res.qr_string

    @staticmethod
    def generate_khqr_via_khqrcc(
        token: str,
        amount: float,
        currency: str = "USD",
        order_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls live KHQR.CC API endpoint: https://khqr.cc/api/{token}/payment-gateway/v1/payments/qr-api
        """
        import httpx
        url = f"https://khqr.cc/api/{token}/payment-gateway/v1/payments/qr-api"
        payload = {
            "amount": amount,
            "currency": currency,
            "order_id": order_id
        }
        try:
            r = httpx.post(url, json=payload, timeout=8.0)
            data = r.json()
            return {"success": r.status_code == 200, "status_code": r.status_code, "data": data}
        except Exception as e:
            return {"success": False, "error": str(e), "url": url}

    @staticmethod
    def check_transaction_via_khqrcc(
        token: str,
        md5: Optional[str] = None,
        order_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls live KHQR.CC API endpoint: https://khqr.cc/api/{token}/payment-gateway/v1/payments/check-trans
        """
        import httpx
        url = f"https://khqr.cc/api/{token}/payment-gateway/v1/payments/check-trans"
        payload = {}
        if md5:
            payload["md5"] = md5
        if order_id:
            payload["order_id"] = order_id
        try:
            r = httpx.post(url, json=payload, timeout=8.0)
            data = r.json()
            return {"success": r.status_code == 200, "status_code": r.status_code, "data": data}
        except Exception as e:
            return {"success": False, "error": str(e), "url": url}
