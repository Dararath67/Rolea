import os
import time
import uuid
import httpx
from typing import Dict, Any, Optional, List

class Bay2GameService:
    @staticmethod
    def get_base_url(override_url: Optional[str] = None) -> str:
        url = (override_url or os.getenv("BAY2GAME_API_URL") or "https://api.bay2game.xyz/api").rstrip("/")
        if not url.startswith("http"):
            url = f"https://{url}"
        return url

    @staticmethod
    def get_api_key(override_key: Optional[str] = None) -> str:
        key = (override_key or os.getenv("BAY2GAME_API_KEY") or "").strip()
        return key

    @staticmethod
    def get_profile(api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 8.0) -> Dict[str, Any]:
        """
        Retrieves user profile and balance: GET /profile
        """
        base_url = Bay2GameService.get_base_url(api_url)
        key = Bay2GameService.get_api_key(api_key)
        url = f"{base_url}/profile"
        t0 = time.time()
        
        if not key:
            return {
                "success": False,
                "error": "Bay2Game API key is missing. Please configure BAY2GAME_API_KEY.",
                "code": "missing_api_key",
                "latency_ms": 0
            }

        try:
            r = httpx.get(url, params={"api_key": key}, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            print(f"[BAY2GAME_DEBUG] GET /profile Status: {r.status_code}, Response: {r.text}")
            
            if r.status_code == 200:
                data = r.json()
                status = str(data.get("status", "")).upper()
                if status == "SUCCESS" and "user" in data:
                    user_info = data["user"]
                    balance = float(user_info.get("balance") or 0.0)
                    return {
                        "success": True,
                        "balance_usd": balance,
                        "currency": "USD",
                        "username": user_info.get("username"),
                        "status": user_info.get("status"),
                        "total_orders": user_info.get("total_orders"),
                        "total_spent": user_info.get("total_spent"),
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                else:
                    msg = data.get("message") or "Failed to retrieve Bay2Game profile"
                    return {
                        "success": False,
                        "error": msg,
                        "code": "api_error",
                        "latency_ms": latency_ms
                    }
            else:
                return {
                    "success": False,
                    "error": f"Bay2Game API Error (HTTP {r.status_code})",
                    "latency_ms": latency_ms
                }
        except httpx.TimeoutException:
            return {"success": False, "error": "Bay2Game API connection timed out", "latency_ms": int((time.time() - t0) * 1000)}
        except Exception as e:
            return {"success": False, "error": f"Bay2Game connection error: {str(e)}", "latency_ms": int((time.time() - t0) * 1000)}

    @staticmethod
    def get_categories(api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 8.0) -> Dict[str, Any]:
        """
        Retrieves all game categories: GET /categories
        """
        base_url = Bay2GameService.get_base_url(api_url)
        key = Bay2GameService.get_api_key(api_key)
        url = f"{base_url}/categories"
        t0 = time.time()

        try:
            r = httpx.get(url, params={"api_key": key}, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            if r.status_code == 200:
                data = r.json()
                status = str(data.get("status", "")).upper()
                if status == "SUCCESS":
                    return {
                        "success": True,
                        "categories": data.get("categories", []),
                        "total": data.get("total", 0),
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                return {"success": False, "error": data.get("message", "Failed to fetch categories"), "latency_ms": latency_ms}
            return {"success": False, "error": f"HTTP {r.status_code}", "latency_ms": latency_ms}
        except Exception as e:
            return {"success": False, "error": str(e), "latency_ms": int((time.time() - t0) * 1000)}

    @staticmethod
    def get_products(game_code: str, api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 8.0) -> Dict[str, Any]:
        """
        Retrieves products for a specific game: GET /products
        """
        base_url = Bay2GameService.get_base_url(api_url)
        key = Bay2GameService.get_api_key(api_key)
        url = f"{base_url}/products"
        t0 = time.time()

        try:
            r = httpx.get(url, params={"api_key": key, "game_code": game_code}, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            if r.status_code == 200:
                data = r.json()
                status = str(data.get("status", "")).upper()
                if status == "SUCCESS":
                    return {
                        "success": True,
                        "game": data.get("game"),
                        "products": data.get("products", []),
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                return {"success": False, "error": data.get("message", "Failed to fetch products"), "latency_ms": latency_ms}
        except Exception as e:
            return {"success": False, "error": str(e), "latency_ms": int((time.time() - t0) * 1000)}

    @staticmethod
    def fetch_all_catalog_fast(api_url: Optional[str] = None, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
        import asyncio
        base_url = Bay2GameService.get_base_url(api_url)
        key = Bay2GameService.get_api_key(api_key)

        async def _run():
            async with httpx.AsyncClient(limits=httpx.Limits(max_connections=30)) as client:
                try:
                    r = await client.get(f"{base_url}/categories", params={"api_key": key}, timeout=10.0)
                    if r.status_code != 200:
                        return []
                    cats = r.json().get("categories", [])
                    sem = asyncio.Semaphore(20)

                    async def _fetch_prods(cat):
                        code = cat.get("game_code")
                        name = cat.get("name")
                        img = cat.get("image_url") or ""
                        fields = cat.get("game_fields", ["userid"])
                        try:
                            async with sem:
                                pr = await client.get(f"{base_url}/products", params={"api_key": key, "game_code": code}, timeout=8.0)
                                if pr.status_code == 200:
                                    pkgs = pr.json().get("products", [])
                                    return {
                                        "game_code": code,
                                        "name": name,
                                        "image_url": img,
                                        "fields": fields,
                                        "products": pkgs
                                    }
                        except Exception:
                            pass
                        return {"game_code": code, "name": name, "image_url": img, "fields": fields, "products": []}

                    tasks = [_fetch_prods(c) for c in cats]
                    results = await asyncio.gather(*tasks)
                    return [res for res in results if res and res.get("products")]
                except Exception as e:
                    print(f"[BAY2GAME_CATALOG_FAST_ERR] {e}")
                    return []

        try:
            return asyncio.run(_run())
        except Exception:
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                return executor.submit(lambda: asyncio.run(_run())).result()

    @staticmethod
    def create_order(
        product_code: str,
        game_user_id: str,
        reference: str,
        game_zone_id: Optional[str] = "",
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 12.0
    ) -> Dict[str, Any]:
        """
        Places a new top-up order: GET/POST /create_order
        """
        base_url = Bay2GameService.get_base_url(api_url)
        key = Bay2GameService.get_api_key(api_key)
        url = f"{base_url}/create_order"
        t0 = time.time()

        ref_clean = str(reference or "").strip()
        if not ref_clean:
            ref_clean = f"B2G-{int(time.time())}-{uuid.uuid4().hex[:6].upper()}"

        payload = {
            "api_key": key,
            "product_code": product_code,
            "game_user_id": str(game_user_id),
            "reference": ref_clean
        }
        if game_zone_id:
            payload["game_zone_id"] = str(game_zone_id)

        print(f"[BAY2GAME_REQUEST] Endpoint: {url} Method: POST Payload: {payload}")

        try:
            r = httpx.post(url, json=payload, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            print(f"[BAY2GAME_RESPONSE] HTTP: {r.status_code} Response: {r.text}")

            data = {}
            try:
                data = r.json()
            except Exception:
                pass

            status = str(data.get("status", "")).upper()
            code = data.get("code")
            is_success_flag = data.get("success") is True
            msg = data.get("message") or data.get("msg") or data.get("error") or ""

            if r.status_code in [200, 201] and (
                status in ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID", "OK", "PENDING", "PROCESSING"] 
                or is_success_flag 
                or code in [200, 201]
                or data.get("reference")
            ):
                return {
                    "success": True,
                    "status": "completed",
                    "reference": data.get("reference", reference),
                    "order_id": data.get("reference", reference),
                    "amount": data.get("amount"),
                    "message": msg or "Order created successfully",
                    "latency_ms": latency_ms,
                    "raw": data
                }
            else:
                return {
                    "success": False,
                    "status": "failed",
                    "error": msg or f"Order failed (HTTP {r.status_code})",
                    "reference": reference,
                    "latency_ms": latency_ms,
                    "raw": data
                }
        except httpx.TimeoutException:
            return {"success": False, "status": "failed", "error": "Order request timed out", "latency_ms": int((time.time() - t0) * 1000)}
        except Exception as e:
            return {"success": False, "status": "failed", "error": str(e), "latency_ms": int((time.time() - t0) * 1000)}

    @staticmethod
    def check_order(reference: str, api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 8.0) -> Dict[str, Any]:
        """
        Checks order status: GET /check_order
        """
        base_url = Bay2GameService.get_base_url(api_url)
        key = Bay2GameService.get_api_key(api_key)
        url = f"{base_url}/check_order"
        t0 = time.time()

        try:
            r = httpx.get(url, params={"api_key": key, "reference": reference}, timeout=timeout)
            latency_ms = int((time.time() - t0) * 1000)
            if r.status_code == 200:
                data = r.json()
                status = str(data.get("status", "")).upper()
                order_info = data.get("order", {}) or {}
                order_status = str(order_info.get("status", data.get("order_status", ""))).upper()
                if status in ["SUCCESS", "OK", "COMPLETED", "PAID"] or order_status in ["SUCCESS", "COMPLETED", "DELIVERED", "PAID", "PROCESSING"]:
                    return {
                        "success": True,
                        "status": "completed",
                        "order": order_info,
                        "latency_ms": latency_ms,
                        "raw": data
                    }
                return {"success": False, "error": data.get("message", "Order lookup pending"), "latency_ms": latency_ms}
            return {"success": False, "error": f"HTTP {r.status_code}", "latency_ms": latency_ms}
        except Exception as e:
            return {"success": False, "error": str(e), "latency_ms": int((time.time() - t0) * 1000)}

    @staticmethod
    def validate_player_id(game_code: str, user_id: str, zone_id: Optional[str] = "", api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 6.0) -> Dict[str, Any]:
        """
        Validates player ID format and queries game account status via Bay2Game
        """
        user_id_clean = str(user_id or "").strip()
        zone_id_clean = str(zone_id or "").strip()
        t0 = time.time()

        if not user_id_clean:
            return {"success": False, "verified": False, "valid": False, "message": "Player not found"}

        # Attempt smile.one or official gateway lookup if zone_id provided
        if zone_id_clean:
            try:
                r = httpx.post("https://www.smile.one/merchant/smileone/checkrole", data={
                    "user_id": user_id_clean,
                    "zone_id": zone_id_clean,
                    "product": "mobilelegends"
                }, timeout=4.0)
                if r.status_code == 200:
                    d = r.json()
                    if d.get("status") == 200 and d.get("username"):
                        return {
                            "success": True,
                            "verified": True,
                            "valid": True,
                            "playerName": d.get("username"),
                            "gamer_name": d.get("username"),
                            "nickname": d.get("username"),
                            "userId": user_id_clean,
                            "zoneId": zone_id_clean,
                            "provider": "Bay2Game / SmileOne Gateway",
                            "latency_ms": int((time.time() - t0) * 1000)
                        }
            except Exception:
                pass

        return {
            "success": False,
            "verified": False,
            "valid": False,
            "message": "Player not found",
            "latency_ms": int((time.time() - t0) * 1000)
        }
