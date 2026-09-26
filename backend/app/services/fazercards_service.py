import os
import time
import uuid
import httpx
from typing import Dict, Any, Optional, List

class FazerCardsService:
    @staticmethod
    def get_base_url(override_url: Optional[str] = None) -> str:
        url = (override_url or os.getenv("FAZERCARDS_API_URL") or "https://api.fzr.cards/api/v2").rstrip("/")
        if not url.startswith("http"):
            url = f"https://{url}"
        return url

    @staticmethod
    def get_api_key(override_key: Optional[str] = None) -> str:
        key = (override_key or os.getenv("FAZERCARDS_API_KEY") or "fc_121f96513332ffa0949d7eae").strip()
        return key

    @staticmethod
    def get_headers(api_key: Optional[str] = None) -> Dict[str, str]:
        key = FazerCardsService.get_api_key(api_key)
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-API-Key": key,
            "Authorization": f"Bearer {key}"
        }

    @staticmethod
    def get_profile(api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 8.0) -> Dict[str, Any]:
        """
        Retrieves user reseller profile and balance: GET /balance or /api/v2/balance
        """
        base_url = FazerCardsService.get_base_url(api_url)
        headers = FazerCardsService.get_headers(api_key)
        
        # Format endpoint path
        endpoint = "/balance" if base_url.endswith("/v2") else "/api/v2/balance"
        url = f"{base_url}{endpoint}"
        t0 = time.time()

        try:
            r = httpx.get(url, headers=headers, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            print(f"[FAZERCARDS_DEBUG] GET {url} Status: {r.status_code}, Response: {r.text}")

            if r.status_code in [200, 201]:
                data = r.json()
                ok = data.get("ok", True) or data.get("success", True)
                if ok:
                    balance = float(data.get("balance") or data.get("wallet", 0.0))
                    currency = data.get("currency", "USD")
                    return {
                        "success": True,
                        "balance_usd": balance,
                        "currency": currency,
                        "username": data.get("username", "FazerCards Reseller"),
                        "status": "active",
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("message") or "Failed to fetch balance from FazerCards",
                        "latency_ms": latency_ms
                    }
            else:
                return {
                    "success": False,
                    "error": f"FazerCards API Error (HTTP {r.status_code})",
                    "latency_ms": latency_ms
                }
        except httpx.TimeoutException:
            return {"success": False, "error": "FazerCards API connection timed out", "latency_ms": int((time.time() - t0) * 1000)}
        except Exception as e:
            return {"success": False, "error": f"FazerCards connection error: {str(e)}", "latency_ms": int((time.time() - t0) * 1000)}

    @staticmethod
    def get_topups(api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 10.0) -> Dict[str, Any]:
        """
        Retrieves topup categories (games catalog) from FazerCards API: GET /api/v2/topups (OpenAPI Spec)
        """
        base_url = FazerCardsService.get_base_url(api_url)
        headers = FazerCardsService.get_headers(api_key)
        endpoint = "/topups" if base_url.endswith("/v2") else "/api/v2/topups"
        url = f"{base_url}{endpoint}"
        t0 = time.time()

        try:
            r = httpx.get(url, headers=headers, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            if r.status_code in [200, 201]:
                data = r.json()
                items = data.get("items") or data.get("categories") or data.get("data") or []
                return {
                    "success": True,
                    "items": items,
                    "total": len(items),
                    "latency_ms": latency_ms
                }
            return {"success": False, "error": f"HTTP {r.status_code}", "items": []}
        except Exception as e:
            return {"success": False, "error": str(e), "items": []}

    @staticmethod
    def get_topup_offers(category_id: str, include_ui: bool = True, api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 10.0) -> Dict[str, Any]:
        """
        Retrieves topup offers/packages for a category from FazerCards API: GET /api/v2/topups/offers?category_id={id}&include_ui=1 (OpenAPI Spec)
        """
        base_url = FazerCardsService.get_base_url(api_url)
        headers = FazerCardsService.get_headers(api_key)
        endpoint = "/topups/offers" if base_url.endswith("/v2") else "/api/v2/topups/offers"
        url = f"{base_url}{endpoint}"
        params = {"category_id": category_id}
        if include_ui:
            params["include_ui"] = "1"
        t0 = time.time()

        try:
            r = httpx.get(url, params=params, headers=headers, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            if r.status_code in [200, 201]:
                data = r.json()
                offers = data.get("offers") or []
                fields = data.get("fields") or []
                return {
                    "success": True,
                    "category_id": data.get("category_id") or category_id,
                    "name": data.get("name"),
                    "offers": offers,
                    "fields": fields,
                    "total": len(offers),
                    "latency_ms": latency_ms
                }
            return {"success": False, "error": f"HTTP {r.status_code}", "offers": []}
        except Exception as e:
            return {"success": False, "error": str(e), "offers": []}

    @staticmethod
    def get_products(api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 10.0) -> Dict[str, Any]:
        """
        Retrieves products catalog from FazerCards
        """
        base_url = FazerCardsService.get_base_url(api_url)
        headers = FazerCardsService.get_headers(api_key)
        endpoint = "/products" if base_url.endswith("/v2") else "/api/v2/products"
        url = f"{base_url}{endpoint}"
        t0 = time.time()

        try:
            r = httpx.get(url, headers=headers, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            if r.status_code in [200, 201]:
                data = r.json()
                products = data.get("products") or data.get("data") or []
                return {
                    "success": True,
                    "products": products,
                    "total": len(products),
                    "latency_ms": latency_ms
                }
            
            # Fallback to OpenAPI /topups endpoint if /products is not found
            topup_res = FazerCardsService.get_topups(api_url=api_url, api_key=api_key, timeout=timeout)
            if topup_res.get("success"):
                return {
                    "success": True,
                    "products": topup_res.get("items", []),
                    "total": len(topup_res.get("items", [])),
                    "latency_ms": latency_ms
                }

            return {"success": False, "error": f"HTTP {r.status_code}", "products": []}
        except Exception as e:
            return {"success": False, "error": str(e), "products": []}

    @staticmethod
    def create_order(
        product_id: str,
        user_id: str,
        zone_id: Optional[str] = "",
        reference: Optional[str] = None,
        quantity: int = 1,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 15.0
    ) -> Dict[str, Any]:
        """
        Creates an order on FazerCards: POST /api/v2/topups/order or /api/v2/orders (OpenAPI Spec)
        """
        base_url = FazerCardsService.get_base_url(api_url)
        headers = FazerCardsService.get_headers(api_key)
        endpoint = "/topups/order" if base_url.endswith("/v2") else "/api/v2/topups/order"
        url = f"{base_url}{endpoint}"
        
        ref_id = reference or f"FZR-{uuid.uuid4().hex[:10].upper()}"
        payload = {
            "offer_id": product_id,
            "product_id": product_id,
            "quantity": quantity,
            "reference": ref_id,
            "fields": {
                "user_id": user_id,
                "zone_id": zone_id or ""
            },
            "custom_fields": {
                "user_id": user_id,
                "zone_id": zone_id or ""
            }
        }
        
        t0 = time.time()
        try:
            r = httpx.post(url, json=payload, headers=headers, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            print(f"[FAZERCARDS_DEBUG] POST {url} Payload: {payload}, Status: {r.status_code}, Response: {r.text}")

            if r.status_code in [200, 201]:
                data = r.json()
                ok = data.get("ok", True) or data.get("success", True)
                status_raw = str(data.get("status") or "").lower()
                
                if ok or status_raw in ["completed", "processing", "success", "pending"]:
                    return {
                        "success": True,
                        "order_id": str(data.get("order_id") or data.get("id") or ref_id),
                        "external_reference": ref_id,
                        "status": "completed" if status_raw == "completed" else "processing",
                        "price": float(data.get("price") or 0.0),
                        "pin_code": data.get("pin") or data.get("serial") or "",
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("message") or "FazerCards order failed",
                        "latency_ms": latency_ms,
                        "raw": data
                    }
            else:
                # Retry with /api/v2/orders fallback
                url_orders = f"{base_url}/orders" if base_url.endswith("/v2") else f"{base_url}/api/v2/orders"
                r2 = httpx.post(url_orders, json=payload, headers=headers, timeout=timeout)
                if r2.status_code in [200, 201]:
                    data2 = r2.json()
                    ok2 = data2.get("ok", True) or data2.get("success", True)
                    if ok2:
                        return {
                            "success": True,
                            "order_id": str(data2.get("order_id") or data2.get("id") or ref_id),
                            "external_reference": ref_id,
                            "status": "processing",
                            "latency_ms": latency_ms,
                            "raw": data2
                        }

                try:
                    err_json = r.json()
                    err_msg = err_json.get("message") or err_json.get("error") or f"HTTP {r.status_code}"
                except Exception:
                    err_msg = f"HTTP {r.status_code}: {r.text[:100]}"
                return {
                    "success": False,
                    "error": f"FazerCards Order Error: {err_msg}",
                    "latency_ms": latency_ms
                }
        except httpx.TimeoutException:
            return {"success": False, "error": "FazerCards order request timed out"}
        except Exception as e:
            return {"success": False, "error": f"FazerCards order exception: {str(e)}"}
