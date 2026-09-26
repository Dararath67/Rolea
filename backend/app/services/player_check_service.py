import os
import time
import httpx
from typing import Dict, Any, Optional
from dotenv import load_dotenv
load_dotenv()

from .bay2game_service import Bay2GameService

class PlayerCheckService:
    @staticmethod
    def check_id_via_vngzz(
        game_slug: str,
        user_id: str,
        zone_id: Optional[str] = "",
        api_key: Optional[str] = None,
        endpoint_url: Optional[str] = None,
        timeout: float = 7.0
    ) -> Dict[str, Any]:
        """
        Calls VngZz 2 Game ID Verification API:
        GET https://www.vngzz2game.site/api/v1/game/check_id?game={game}&userid={userid}&serverid={serverid}
        """
        key = api_key or os.getenv("VNGZZ_API_KEY", "") or "pwkCw4Sly7CIWLBLtajJP4LSZ7MC2k8O"
        url = endpoint_url or "https://www.vngzz2game.site/api/v1/game/check_id"
        
        g_code = game_slug.lower().strip()
        if "mlbb" in g_code or "mobile-legends" in g_code or "mobile_legends" in g_code:
            vngzz_game_candidates = ["mlbb", "mobile-legends"]
        elif "freefire" in g_code or "free_fire" in g_code or "free-fire" in g_code or "ff" in g_code:
            vngzz_game_candidates = ["freefire_sgmy", "freefire", "freefire_global", "ff", "free_fire", "freefire_id", "freefire_th"]
        elif "pubg" in g_code:
            vngzz_game_candidates = ["pubg", "pubgm", "pubg-mobile", "pubg_mobile", "pubg_global"]
        elif "bloodstrike" in g_code or "blood-strike" in g_code or "blood_strike" in g_code:
            vngzz_game_candidates = ["bloodstrike", "blood-strike", "blood_strike"]
        elif "hok" in g_code or "honor" in g_code:
            vngzz_game_candidates = ["hok", "hok_global", "honor-of-kings", "honor_of_kings"]
        elif "genshin" in g_code:
            vngzz_game_candidates = ["genshin", "genshin_global", "genshin-impact"]
        elif "roblox" in g_code:
            vngzz_game_candidates = ["roblox", "ROBLOX_US_CARDS"]
        elif "aov" in g_code or "arena" in g_code:
            vngzz_game_candidates = ["aov", "arena-of-valor", "arena_of_valor"]
        elif "codm" in g_code or "duty" in g_code:
            vngzz_game_candidates = ["codm", "codm_sgmy", "call-of-duty-mobile"]
        else:
            vngzz_game_candidates = [g_code]

        headers = {
            "User-Agent": "RoleaTopup/1.0",
            "Accept": "application/json"
        }
        if key:
            headers["X-API-Key"] = key
            headers["Authorization"] = f"Bearer {key}"

        user_id_clean = str(user_id or "").strip()
        zone_id_clean = str(zone_id or "").strip()

        for g_name in vngzz_game_candidates:
            params = {
                "game": g_name,
                "userid": user_id_clean
            }
            if zone_id_clean:
                params["serverid"] = zone_id_clean
                params["zoneid"] = zone_id_clean
                params["server_id"] = zone_id_clean
                params["zone_id"] = zone_id_clean

            if key:
                params["api_key"] = key

            try:
                r = httpx.get(url, params=params, headers=headers, timeout=timeout)
                if r.status_code == 200:
                    data = r.json()
                    payload = data.get("data") if isinstance(data.get("data"), dict) else data
                    player_name = (
                        payload.get("username") or
                        payload.get("playerName") or
                        payload.get("name") or
                        payload.get("nickname") or
                        payload.get("gamer_name") or
                        payload.get("player_name") or
                        payload.get("user_name") or
                        data.get("username") or
                        data.get("playerName") or
                        data.get("name") or
                        data.get("nickname") or
                        data.get("gamer_name")
                    )
                    if player_name:
                        return {
                            "success": True,
                            "verified": True,
                            "valid": True,
                            "playerName": str(player_name),
                            "nickname": str(player_name),
                            "gamer_name": str(player_name),
                            "userId": user_id_clean,
                            "zoneId": zone_id_clean,
                            "provider": "VngZz 2 Game ID Verification",
                            "raw": data
                        }
            except Exception:
                continue

        return {"success": False, "verified": False}

    @staticmethod
    def check_id_via_direct_gateway(game_slug: str, user_id: str, zone_id: Optional[str] = "") -> Dict[str, Any]:
        """
        Direct high-speed official game gateway check for MLBB, Free Fire, PUBG, Genshin, HoK, Blood Strike
        """
        slug = game_slug.lower()
        uid = str(user_id or "").strip()
        zid = str(zone_id or "").strip()

        try:
            if "mlbb" in slug or "mobile-legends" in slug:
                if zid:
                    r = httpx.get(f"https://api.isan.eu.org/nickname/ml?id={uid}&zone={zid}", timeout=3.0)
                    if r.status_code == 200:
                        d = r.json()
                        name = d.get("name") or d.get("username") or d.get("nickname")
                        if name:
                            return {
                                "success": True,
                                "verified": True,
                                "playerName": name,
                                "nickname": name,
                                "gamer_name": name,
                                "provider": "VngZz / Mobile Legends Gateway"
                            }
            elif "freefire" in slug or "free_fire" in slug or "free-fire" in slug or "ff" in slug:
                r = httpx.get(f"https://api.isan.eu.org/nickname/ff?id={uid}", timeout=3.0)
                if r.status_code == 200:
                    d = r.json()
                    name = d.get("name") or d.get("username") or d.get("nickname")
                    if name:
                        return {
                            "success": True,
                            "verified": True,
                            "playerName": name,
                            "nickname": name,
                            "gamer_name": name,
                            "provider": "VngZz / Free Fire Gateway"
                        }
            elif "pubg" in slug:
                r = httpx.get(f"https://api.isan.eu.org/nickname/pubg?id={uid}", timeout=3.0)
                if r.status_code == 200:
                    d = r.json()
                    name = d.get("name") or d.get("username") or d.get("nickname")
                    if name:
                        return {
                            "success": True,
                            "verified": True,
                            "playerName": name,
                            "nickname": name,
                            "gamer_name": name,
                            "provider": "VngZz / PUBG Mobile Gateway"
                        }
            elif "genshin" in slug:
                r = httpx.get(f"https://api.isan.eu.org/nickname/genshin?id={uid}", timeout=3.5)
                if r.status_code == 200:
                    d = r.json()
                    name = d.get("name") or d.get("username") or d.get("nickname")
                    if name:
                        return {
                            "success": True,
                            "verified": True,
                            "playerName": name,
                            "nickname": name,
                            "gamer_name": name,
                            "provider": "VngZz / Genshin Gateway"
                        }
        except Exception:
            pass

        return {"success": False, "verified": False}

    @staticmethod
    def check_id_via_flub71(game_slug: str, user_id: str, zone_id: Optional[str] = "") -> Dict[str, Any]:
        """
        Flub71 MLBB Nickname Lookup Engine (https://github.com/flub71/mlbb-nickname-lookup)
        Endpoint: https://api.isan.eu.org/nickname/ml?id={id}&zone={zone}
        """
        slug = game_slug.lower().strip()
        uid = str(user_id or "").strip()
        zid = str(zone_id or "").strip()

        if not uid:
            return {"success": False, "verified": False}

        if "mlbb" in slug or "mobile-legends" in slug or "mobile_legends" in slug or "ml" in slug:
            if not zid:
                return {"success": False, "verified": False}
            try:
                url = f"https://api.isan.eu.org/nickname/ml?id={uid}&zone={zid}"
                r = httpx.get(url, timeout=4.0)
                if r.status_code == 200:
                    data = r.json()
                    name = data.get("name") or data.get("username") or data.get("nickname")
                    if data.get("success") and name:
                        return {
                            "success": True,
                            "verified": True,
                            "valid": True,
                            "playerName": str(name),
                            "nickname": str(name),
                            "gamer_name": str(name),
                            "userId": uid,
                            "zoneId": zid,
                            "country": data.get("country", ""),
                            "provider": "Flub71 MLBB Lookup Engine",
                            "raw": data
                        }
            except Exception:
                pass

        return {"success": False, "verified": False}

    @staticmethod
    def check_player_account(game_slug: str, user_id: str, zone_id: Optional[str] = "", db: Any = None) -> Dict[str, Any]:
        t0 = time.time()

        # Check if verification is enabled in settings
        custom_endpoint = None
        custom_key = None
        if db:
            settings = getattr(db, 'get_gamer_verification_settings', None)
            if callable(settings):
                s = settings()
                if not getattr(s, 'enabled', True):
                    return {
                        "success": False,
                        "verified": False,
                        "message": "Player verification is disabled on this platform."
                    }
                custom_endpoint = getattr(s, 'provider_api_url', None)
                custom_key = getattr(s, 'api_key', None)

            # Check cache first
            cached_fn = getattr(db, 'get_cached_gamer_verification', None)
            if callable(cached_fn):
                cached = cached_fn(game_slug, user_id, zone_id or "")
                if cached:
                    return cached

        user_id_clean = str(user_id or "").strip()
        zone_id_clean = str(zone_id or "").strip()

        if not user_id_clean:
            return {
                "success": False,
                "verified": False,
                "message": "Player not found"
            }

        slug = game_slug.lower().strip()

        verified = False
        player_name = None
        provider_used = "Flub71 MLBB Lookup Engine"

        # 1. Primary: Flub71 MLBB Nickname Lookup Engine (https://github.com/flub71/mlbb-nickname-lookup)
        flub_res = PlayerCheckService.check_id_via_flub71(
            game_slug=slug,
            user_id=user_id_clean,
            zone_id=zone_id_clean
        )
        if flub_res.get("verified"):
            verified = True
            player_name = flub_res.get("playerName") or flub_res.get("gamer_name")
            provider_used = flub_res.get("provider") or "Flub71 MLBB Lookup Engine"

        # 2. Secondary: VngZz 2 Game Check ID Endpoint (/api/v1/game/check_id)
        if not verified:
            vngzz_res = PlayerCheckService.check_id_via_vngzz(
                game_slug=slug,
                user_id=user_id_clean,
                zone_id=zone_id_clean,
                api_key=custom_key,
                endpoint_url=custom_endpoint
            )
            if vngzz_res.get("verified"):
                verified = True
                player_name = vngzz_res.get("playerName") or vngzz_res.get("gamer_name")
                provider_used = "VngZz 2 Game ID Verification"

        # 2. Direct Official Game Gateway Check (MLBB, Free Fire, PUBG, Genshin)
        if not verified:
            gw_res = PlayerCheckService.check_id_via_direct_gateway(
                game_slug=slug,
                user_id=user_id_clean,
                zone_id=zone_id_clean
            )
            if gw_res.get("verified"):
                verified = True
                player_name = gw_res.get("playerName") or gw_res.get("gamer_name")
                provider_used = gw_res.get("provider") or "VngZz 2 Game ID Verification"

        # 4. Bay2Game API Validation Fallback
        if not verified:
            b2g_res = Bay2GameService.validate_player_id(
                game_code=slug,
                user_id=user_id_clean,
                zone_id=zone_id_clean
            )
            if b2g_res.get("verified"):
                verified = True
                player_name = b2g_res.get("playerName") or b2g_res.get("gamer_name")
                provider_used = b2g_res.get("provider") or "Bay2Game API"

        # 4. Strictly require authentic player name from game server
        if not verified or not player_name:
            resp = {
                "success": False,
                "verified": False,
                "valid": False,
                "message": "រកមិនឃើញឈ្មោះអ្នកលេង ឬ ID មិនត្រឹមត្រូវ (Player ID not found)"
            }
            if db:
                log_fn = getattr(db, 'log_gamer_verification', None)
                if callable(log_fn):
                    log_fn(slug, user_id_clean, zone_id_clean, None, False, "Validation Failed", int((time.time() - t0) * 1000))
            return resp

        resp = {
            "success": True,
            "verified": True,
            "valid": True,
            "gamer_name": str(player_name),
            "playerName": str(player_name),
            "nickname": str(player_name),
            "user_id": user_id_clean,
            "userId": user_id_clean,
            "zone_id": zone_id_clean,
            "zoneId": zone_id_clean,
            "provider": provider_used
        }

        resp_time = int((time.time() - t0) * 1000)

        if db:
            set_cache_fn = getattr(db, 'set_cached_gamer_verification', None)
            if callable(set_cache_fn):
                set_cache_fn(slug, user_id_clean, zone_id_clean, resp)
            log_fn = getattr(db, 'log_gamer_verification', None)
            if callable(log_fn):
                log_fn(slug, user_id_clean, zone_id_clean, str(player_name), True, provider_used, resp_time)

        return resp

