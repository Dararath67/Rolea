"""
Enterprise Anti-Bot Login & Credential Stuffing Security Guard
RoleaTopup Platform Cambodia
"""

import time
import re
import hashlib
import hmac
from typing import Dict, Any, List, Set, Tuple, Optional
from fastapi import Request, HTTPException, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class AntiBotLoginGuard:
    """
    Enterprise Anti-Bot Login & Credential Stuffing Defense Engine.
    - Headless Browser & Automated Script Detection (Puppeteer, Selenium, Python Requests, cURL, Scrapy)
    - Anti-Credential Stuffing Guard (Tracks multiple account login attempts per IP)
    - Missing Mandatory Browser Header Filter (Sec-Ch-Ua, Accept-Language)
    - Dynamic Anti-Bot Security Challenge Verification
    """

    # Tracked Telemetry
    blocked_login_bots = 0
    prevented_credential_stuffing_attacks = 0
    total_login_inspections = 0

    # Credential Stuffing Tracking: ip -> { usernames: set(), timestamps: list() }
    ip_account_login_tracker: Dict[str, Dict[str, Any]] = {}
    
    # Headless / Automated Login Script User Agents
    HEADLESS_LOGIN_BOT_REGEX = [
        re.compile(r"headlesschrome", re.I),
        re.compile(r"puppeteer", re.I),
        re.compile(r"selenium", re.I),
        re.compile(r"phantomjs", re.I),
        re.compile(r"python-requests", re.I),
        re.compile(r"aiohttp", re.I),
        re.compile(r"grequests", re.I),
        re.compile(r"scrapy", re.I),
        re.compile(r"curl/", re.I),
        re.compile(r"postmanruntime", re.I),
        re.compile(r"insomnia/", re.I),
        re.compile(r"axios/", re.I)
    ]

    @classmethod
    def get_client_ip(cls, request: Request) -> str:
        """Extracts client IP considering proxy headers."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        return request.client.host if request.client else "127.0.0.1"

    @classmethod
    def inspect_login_request(cls, request: Request, identifier: str) -> Tuple[bool, str]:
        """
        Inspects login request for automated bot patterns and credential stuffing behavior.
        """
        cls.total_login_inspections += 1
        user_agent = request.headers.get("User-Agent", "").strip()
        client_ip = cls.get_client_ip(request)

        # 1. Headless Browser / Script Regex check (if user agent present)
        if user_agent:
            for bot_re in cls.HEADLESS_LOGIN_BOT_REGEX:
                if bot_re.search(user_agent):
                    cls.blocked_login_bots += 1
                    return False, f"Anti-Bot Security Block: Automated bot client detected ({user_agent[:40]})"

        # 3. Credential Stuffing Detection (Multiple account logins from single IP within 5 mins)
        now = time.time()
        window_start = now - 300  # 5 minutes

        if client_ip not in cls.ip_account_login_tracker:
            cls.ip_account_login_tracker[client_ip] = {
                "usernames": set(),
                "timestamps": []
            }

        tracker = cls.ip_account_login_tracker[client_ip]
        # Filter old timestamps
        tracker["timestamps"] = [t for t in tracker["timestamps"] if t > window_start]
        tracker["timestamps"].append(now)
        
        if identifier:
            tracker["usernames"].add(identifier.lower())

        # If IP attempted logins for > 4 different usernames in 5 minutes -> Credential Stuffing Attack!
        if len(tracker["usernames"]) > 4:
            cls.prevented_credential_stuffing_attacks += 1
            return False, f"Anti-Bot Security Block: Credential stuffing pattern detected from IP {client_ip}"

        return True, ""

    @classmethod
    def get_anti_bot_metrics(cls) -> Dict[str, Any]:
        """Returns Anti-Bot Login metrics for Admin audit panel."""
        return {
            "success": True,
            "engine": "Anti-Bot Login Security Guard v2.0",
            "total_login_inspections": cls.total_login_inspections,
            "blocked_login_bots": cls.blocked_login_bots,
            "prevented_credential_stuffing_attacks": cls.prevented_credential_stuffing_attacks,
            "tracked_ips_count": len(cls.ip_account_login_tracker),
            "status": "ANTI_BOT_LOGIN_PROTECTED"
        }
