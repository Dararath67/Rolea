"""
Enterprise Rate Limiter & Web Application Firewall (WAF) Engine
RoleaTopup Platform Cambodia
"""

import time
import re
from typing import Dict, Any, List, Set, Tuple
from fastapi import Request, HTTPException, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class RateLimiterWAFEngine:
    """
    Real-Time Sliding-Window Rate Limiter & WAF Threat Inspection Engine.
    - Prevents DDoS & Brute-Force Rate Abuse (HTTP 429)
    - WAF Threat Inspector blocks SQLi, XSS, Path Traversal, and Command Injections (HTTP 403)
    - Automated Dynamic IP Blacklisting (30-Minute Ban on repeat offenders)
    """

    # In-memory tracking structures
    ip_request_history: Dict[str, List[float]] = {}
    ip_waf_violations: Dict[str, int] = {}
    banned_ips: Dict[str, float] = {}  # ip -> unban_timestamp
    whitelisted_ips: Set[str] = {"127.0.0.1", "localhost", "::1"}

    # Limits (High throughput to prevent false positives)
    GENERAL_RATE_LIMIT = 500    # Max 500 reqs / min
    SENSITIVE_RATE_LIMIT = 100   # Max 100 reqs / min for auth, payment, admin
    WINDOW_SECONDS = 60
    BAN_DURATION_SECONDS = 1800  # 30 minutes

    # WAF Threat Detection Regular Expressions (Precise multi-word injection patterns only)
    WAF_RULES = [
        # SQL Injection (Exact SQL Syntax structures)
        (re.compile(r"(\bSELECT\s+[\s\S]+\s+FROM\b|\bUNION\s+(ALL\s+)?SELECT\b|\bDROP\s+TABLE\b|\bDELETE\s+FROM\b|\bINSERT\s+INTO\b|\bALTER\s+TABLE\b|\bTRUNCATE\s+TABLE\b)", re.IGNORECASE), "SQL Query Injection Vector Detected"),
        (re.compile(r"(--|\/\*|\*\/|;\s*DROP|;\s*DELETE)", re.IGNORECASE), "SQL Comment/Batch Injection Detected"),
        (re.compile(r"('\s*OR\s*'\d+'\s*=\s*'\d+'|'\s*OR\s*1\s*=\s*1)", re.IGNORECASE), "SQL Tautology Injection Detected"),

        # Cross-Site Scripting (XSS)
        (re.compile(r"(<script.*?>|javascript:|onload\s*=|onerror\s*=|document\.cookie)", re.IGNORECASE), "Cross-Site Scripting (XSS) Vector Detected"),
        (re.compile(r"(<iframe|<object|<embed|<applet)", re.IGNORECASE), "HTML Element Hijacking Vector Detected"),

        # Path Traversal & LFI
        (re.compile(r"(\.\./\.\./|\.\.\\\.\.\\|/etc/passwd|/etc/shadow|c:\\boot\.ini)", re.IGNORECASE), "Path Traversal / Local File Inclusion Vector Detected"),

        # Remote Command Execution (RCE)
        (re.compile(r"(\|(?:whoami|cat|ls|id|pwd|wget|curl)|;\s*(?:whoami|cat|ls|id|pwd))", re.IGNORECASE), "Command Injection RCE Vector Detected")
    ]

    @classmethod
    def get_client_ip(cls, request: Request) -> str:
        """Extracts client IP considering proxy headers (X-Forwarded-For)."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        return request.client.host if request.client else "127.0.0.1"

    @classmethod
    def is_ip_banned(cls, ip: str) -> Tuple[bool, int]:
        """Checks if IP is currently banned."""
        if ip in cls.banned_ips:
            unban_time = cls.banned_ips[ip]
            now = time.time()
            if now < unban_time:
                remaining_seconds = int(unban_time - now)
                return True, remaining_seconds
            else:
                # Ban expired
                del cls.banned_ips[ip]
                cls.ip_waf_violations[ip] = 0
        return False, 0

    @classmethod
    def ban_ip(cls, ip: str, duration_seconds: int = 1800) -> None:
        """Manually or automatically bans an IP address."""
        if ip not in cls.whitelisted_ips:
            cls.banned_ips[ip] = time.time() + duration_seconds

    @classmethod
    def unban_ip(cls, ip: str) -> None:
        """Unbans an IP address."""
        if ip in cls.banned_ips:
            del cls.banned_ips[ip]
        if ip in cls.ip_waf_violations:
            cls.ip_waf_violations[ip] = 0

    @classmethod
    def inspect_waf_threats(cls, request: Request) -> Tuple[bool, str]:
        """Inspects request URL path and query string against WAF rules."""
        raw_url_path_and_query = f"{request.url.path}?{request.url.query}" if request.url.query else request.url.path

        for rule, description in cls.WAF_RULES:
            if rule.search(raw_url_path_and_query):
                return True, description

        return False, ""

    @classmethod
    def check_rate_limit(cls, ip: str, is_sensitive: bool = False) -> Tuple[bool, int, int]:
        """
        Applies sliding-window rate limiting.
        Returns: (is_allowed, remaining_reqs, limit)
        """
        if ip in cls.whitelisted_ips:
            return True, 9999, 9999

        now = time.time()
        window_start = now - cls.WINDOW_SECONDS

        if ip not in cls.ip_request_history:
            cls.ip_request_history[ip] = []

        # Filter out timestamps older than window
        cls.ip_request_history[ip] = [t for t in cls.ip_request_history[ip] if t > window_start]

        limit = cls.SENSITIVE_RATE_LIMIT if is_sensitive else cls.GENERAL_RATE_LIMIT
        current_count = len(cls.ip_request_history[ip])

        if current_count >= limit:
            remaining = 0
            return False, remaining, limit

        # Record this request timestamp
        cls.ip_request_history[ip].append(now)
        remaining = limit - (current_count + 1)
        return True, remaining, limit

    @classmethod
    def get_waf_metrics(cls) -> Dict[str, Any]:
        """Returns WAF and Rate Limiter metrics for Admin Security Dashboard."""
        now = time.time()
        active_bans = [
            {"ip": ip, "remaining_seconds": max(0, int(unban_time - now))}
            for ip, unban_time in cls.banned_ips.items()
            if unban_time > now
        ]

        return {
            "success": True,
            "engine": "Rolea WAF & Rate Limiter v2.0",
            "waf_rules_count": len(cls.WAF_RULES),
            "whitelisted_ips": list(cls.whitelisted_ips),
            "banned_ips_count": len(active_bans),
            "banned_ips": active_bans,
            "active_tracked_ips": len(cls.ip_request_history),
            "total_waf_blocks": sum(cls.ip_waf_violations.values()),
            "status": "PROTECTED_ACTIVE"
        }


class WAFAndRateLimiterMiddleware(BaseHTTPMiddleware):
    """FastAPI Middleware to intercept & enforce WAF and Rate Limiting on every request."""
    async def dispatch(self, request: Request, call_next):
        client_ip = RateLimiterWAFEngine.get_client_ip(request)

        # 1. Check if IP is currently banned
        banned, remaining_secs = RateLimiterWAFEngine.is_ip_banned(client_ip)
        if banned:
            return JSONResponse(
                status_code=403,
                content={
                    "success": False,
                    "error": "IP_TEMPORARILY_BANNED",
                    "detail": f"Your IP address ({client_ip}) has been blocked by WAF due to security violations. Retry in {remaining_secs}s.",
                    "retry_after_seconds": remaining_secs
                }
            )

        # 2. WAF Threat Inspection
        path = request.url.path
        # Skip docs endpoints from rigid WAF regex matching
        if not (path.startswith("/docs") or path.startswith("/redoc") or path.startswith("/openapi.json")):
            has_threat, threat_desc = RateLimiterWAFEngine.inspect_waf_threats(request)
            if has_threat:
                violations = RateLimiterWAFEngine.ip_waf_violations.get(client_ip, 0) + 1
                RateLimiterWAFEngine.ip_waf_violations[client_ip] = violations

                # Auto ban after 3 WAF violations
                if violations >= 3:
                    RateLimiterWAFEngine.ban_ip(client_ip, duration_seconds=1800)

                return JSONResponse(
                    status_code=403,
                    content={
                        "success": False,
                        "error": "WAF_THREAT_BLOCKED",
                        "detail": f"Request blocked by Web Application Firewall (WAF): {threat_desc}",
                        "client_ip": client_ip
                    }
                )

        # 3. Rate Limit Enforcement
        is_sensitive_route = any(path.startswith(p) for p in [
            "/api/v1/user/login",
            "/api/v1/user/register",
            "/api/v1/user/wallet/deposit",
            "/api/v1/admin/login",
            "/api/v1/admin/security"
        ])

        allowed, remaining, limit = RateLimiterWAFEngine.check_rate_limit(client_ip, is_sensitive=is_sensitive_route)
        if not allowed:
            return JSONResponse(
                status_code=429,
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0"
                },
                content={
                    "success": False,
                    "error": "RATE_LIMIT_EXCEEDED",
                    "detail": f"Too many requests. Limit is {limit} req/min. Please slow down.",
                    "client_ip": client_ip
                }
            )

        # Proceed with request
        response: Response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
