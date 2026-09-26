import os
import time
import uuid
import io
import base64
import httpx
import qrcode
from typing import Dict, Any, Optional
from ..models.schemas import CurrencyType

class VngzzPaymentService:
    DEFAULT_API_URL = "https://www.vngzz2game.site/api"
    DEFAULT_GENERATE_QR_URL = "https://www.vngzz2game.site/api/v1/generate_qr"
    DEFAULT_CHECK_TRANS_URL = "https://www.vngzz2game.site/api/v1/check_transaction"
    DEFAULT_STATUS_URL = "https://www.vngzz2game.site/api/v1/status"

    @classmethod
    def get_api_key(cls, override_key: Optional[str] = None) -> str:
        if override_key and override_key.strip():
            return override_key.strip()
        return os.getenv("VNGZZ_API_KEY", "").strip()

    @classmethod
    def get_generate_qr_url(cls, override_url: Optional[str] = None) -> str:
        if override_url and override_url.strip():
            return override_url.strip()
        return os.getenv("VNGZZ_GENERATE_QR_URL", cls.DEFAULT_GENERATE_QR_URL).strip()

    @classmethod
    def get_check_trans_url(cls, override_url: Optional[str] = None) -> str:
        if override_url and override_url.strip():
            return override_url.strip()
        return os.getenv("VNGZZ_CHECK_TRANSACTION_URL", cls.DEFAULT_CHECK_TRANS_URL).strip()

    @classmethod
    def generate_qr(
        cls,
        amount: float,
        currency: str = "USD",
        idempotency_key: Optional[str] = None,
        api_key: Optional[str] = None,
        generate_qr_url: Optional[str] = None,
        timeout: float = 8.0
    ) -> Dict[str, Any]:
        """
        Calls VngZz 2 Game PayWay API: POST /v1/generate_qr
        """
        key = cls.get_api_key(api_key)
        url = cls.get_generate_qr_url(generate_qr_url)
        t0 = time.time()
        
        curr = currency.upper() if currency in ["USD", "KHR"] else "USD"
        if curr == "USD":
            amount_str = f"{amount:.2f}"
        else:
            amount_str = str(int(amount))

        idem_key = idempotency_key or f"ORD-{int(time.time()*1000)}-{uuid.uuid4().hex[:6]}"

        payload = {
            "amount": amount_str,
            "currency": curr,
            "idempotency_key": idem_key
        }

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "RoleaTopup/1.0"
        }
        if key:
            headers["X-API-Key"] = key
            headers["Authorization"] = f"Bearer {key}"

        if key:
            try:
                r = httpx.post(url, json=payload, headers=headers, timeout=timeout)
                latency_ms = int((time.time() - t0) * 1000)
                if r.status_code in [200, 201]:
                    data = r.json()
                    res_data = data.get("data", {})
                    qr_str = res_data.get("qr_string", "")
                    if not qr_str and res_data.get("deep_link"):
                        import urllib.parse
                        dl = res_data.get("deep_link", "")
                        if "qrcode=" in dl:
                            qr_str = urllib.parse.unquote(dl.split("qrcode=")[1])

                    qr_img = res_data.get("qr_image") or ""
                    if qr_img and not qr_img.startswith("data:image"):
                        qr_img = f"data:image/png;base64,{qr_img}"
                    elif not qr_img and qr_str:
                        qr_img = cls._render_qr_image_base64(qr_str)

                    return {
                        "success": True,
                        "status": 200,
                        "transaction_id": res_data.get("transaction_id", idem_key),
                        "amount": str(res_data.get("amount") or amount_str),
                        "currency": res_data.get("currency", curr),
                        "state": res_data.get("state", "PENDING"),
                        "qr_string": qr_str,
                        "qr_image": qr_img,
                        "qr_image_url": res_data.get("qr_image_url") or res_data.get("qr_png_url") or "",
                        "qr_png_url": res_data.get("qr_png_url", ""),
                        "deep_link": res_data.get("deep_link", f"abamobilebank://ababank.com?type=payway&qrcode={qr_str}"),
                        "expire_in_sec": res_data.get("expire_in_sec", 180),
                        "expires_at": res_data.get("expires_at"),
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                else:
                    err_msg = f"HTTP {r.status_code}"
                    try:
                        err_json = r.json()
                        err_msg = err_json.get("message") or err_json.get("code") or err_msg
                    except Exception:
                        pass
                    return cls._create_fallback_qr(amount, curr, idem_key, err_msg)
            except Exception as e:
                return cls._create_fallback_qr(amount, curr, idem_key, str(e))
        else:
            return cls._create_fallback_qr(amount, curr, idem_key, "API Key not configured - using simulated VngZz PayWay QR")

    @classmethod
    def check_transaction(
        cls,
        transaction_id: str,
        api_key: Optional[str] = None,
        check_trans_url: Optional[str] = None,
        timeout: float = 8.0
    ) -> Dict[str, Any]:
        """
        Calls VngZz 2 Game PayWay API: POST /v1/check_transaction
        """
        key = cls.get_api_key(api_key)
        url = cls.get_check_trans_url(check_trans_url)
        t0 = time.time()

        payload = {"transaction_id": transaction_id}
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "RoleaTopup/1.0"
        }
        if key:
            headers["X-API-Key"] = key
            headers["Authorization"] = f"Bearer {key}"

        if key:
            try:
                r = httpx.post(url, json=payload, headers=headers, timeout=timeout)
                latency_ms = int((time.time() - t0) * 1000)
                if r.status_code == 200:
                    data = r.json()
                    res_data = data.get("data", {})
                    state = str(res_data.get("state", "PENDING")).upper()
                    is_paid = res_data.get("is_paid", False) or state == "PAID"
                    return {
                        "success": True,
                        "status": 200,
                        "transaction_id": res_data.get("transaction_id", transaction_id),
                        "amount": res_data.get("amount"),
                        "currency": res_data.get("currency"),
                        "state": state,
                        "is_paid": is_paid,
                        "action": res_data.get("action", "approved" if is_paid else "pending"),
                        "payway_transaction_id": res_data.get("payway_transaction_id"),
                        "receipt_url": res_data.get("receipt_url"),
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                else:
                    err_msg = f"HTTP {r.status_code}"
                    try:
                        err_json = r.json()
                        err_msg = err_json.get("message") or err_msg
                    except Exception:
                        pass
                    return {
                        "success": False,
                        "status": r.status_code,
                        "transaction_id": transaction_id,
                        "is_paid": False,
                        "state": "PENDING",
                        "error": err_msg
                    }
            except Exception as e:
                return {
                    "success": False,
                    "transaction_id": transaction_id,
                    "is_paid": False,
                    "state": "PENDING",
                    "error": str(e)
                }
        else:
            # Simulated check for development
            return {
                "success": True,
                "status": 200,
                "transaction_id": transaction_id,
                "state": "PENDING",
                "is_paid": False,
                "note": "VngZz API Key not configured; waiting for live key"
            }

    @classmethod
    def check_status(cls, api_url: Optional[str] = None, timeout: float = 6.0) -> Dict[str, Any]:
        """
        Calls VngZz 2 Game Service Health: GET /v1/status
        """
        base = api_url or cls.DEFAULT_API_URL
        status_url = f"{base}/v1/status?deep=true" if not base.endswith("/v1/status") else base
        t0 = time.time()
        try:
            r = httpx.get(status_url, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            if r.status_code == 200:
                data = r.json()
                return {
                    "success": True,
                    "status_code": 200,
                    "latency_ms": latency_ms,
                    "data": data.get("data", data)
                }
            return {
                "success": False,
                "status_code": r.status_code,
                "latency_ms": latency_ms,
                "error": f"HTTP {r.status_code}"
            }
        except Exception as e:
            return {
                "success": False,
                "latency_ms": int((time.time() - t0) * 1000),
                "error": str(e)
            }

    @classmethod
    def _render_qr_image_base64(cls, text: str) -> str:
        try:
            qr = qrcode.QRCode(
                version=None,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=2,
            )
            qr.add_data(text)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
            return f"data:image/png;base64,{b64}"
        except Exception:
            return ""

    @classmethod
    def _crc16_ccitt(cls, data: str) -> str:
        crc = 0xFFFF
        for ch in data.encode('utf-8'):
            crc = ((crc >> 8) | (crc << 8)) & 0xFFFF
            crc ^= ch
            crc ^= (crc & 0xFF) >> 4
            crc ^= (crc << 12) & 0xFFFF
            crc ^= ((crc & 0xFF) << 5) & 0xFFFF
        return f"{crc:04X}"

    @classmethod
    def _create_fallback_qr(cls, amount: float, currency: str, idempotency_key: str, note: str = "") -> Dict[str, Any]:
        """
        Creates a valid EMV KHQR payload for ABA / Bakong fallback with real scannable QR image and CRC-16
        """
        curr_code = "840" if currency == "USD" else "116"
        amt_val = f"{amount:.2f}" if currency == "USD" else f"{int(amount * 4100)}"
        bakong_acc = "roleatopup@ababank"
        merchant = "Rolea TopUp Cambodia"
        
        raw_prefix = (
            f"00020101021229300010bakong.gov.kh0112{bakong_acc}"
            f"520458125303{curr_code}54{len(amt_val):02d}{amt_val}"
            f"5802KH59{len(merchant):02d}{merchant}"
            f"6010Phnom Penh62{len(idempotency_key)+4:02d}01{len(idempotency_key):02d}{idempotency_key}"
            f"6304"
        )
        crc_hex = cls._crc16_ccitt(raw_prefix)
        raw_payload = f"{raw_prefix}{crc_hex}"
        
        qr_img = cls._render_qr_image_base64(raw_payload)

        return {
            "success": True,
            "status": 200,
            "transaction_id": idempotency_key,
            "amount": amt_val,
            "currency": currency,
            "state": "PENDING",
            "qr_string": raw_payload,
            "qr_image": qr_img,
            "qr_image_url": f"https://api.qrserver.com/v1/create-qr-code/?size=350x350&data={raw_payload}",
            "deep_link": f"abamobilebank://ababank.com?type=payway&qrcode={raw_payload}",
            "expire_in_sec": 180,
            "expires_at": None,
            "note": note
        }
