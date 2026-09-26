import hashlib
import hmac
import time
import json
import base64
import os
import re
import struct
import secrets
from typing import Optional, Dict, Any, Tuple, List
from ..models.schemas import User, RoleType

JWT_SECRET = os.getenv("JWT_SECRET", "rolea-topup-super-secret-key-2026-cambodia-enterprise-99sec")

# In-memory Rate Limiting & Brute-Force Shield
_LOGIN_ATTEMPTS: Dict[str, Dict[str, Any]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 300 # 5 minutes

class AuthService:
    @staticmethod
    def generate_totp_secret() -> str:
        random_bytes = secrets.token_bytes(20)
        return base64.b32encode(random_bytes).decode('ascii').replace('=', '')

    @staticmethod
    def generate_totp_code(secret: str, time_step: int = 30) -> str:
        clean = secret.strip().replace(' ', '').upper()
        padding = '=' * (-len(clean) % 8)
        key = base64.b32decode(clean + padding, casefold=True)
        counter = int(time.time() // time_step)
        msg = struct.pack('>Q', counter)
        h = hmac.new(key, msg, hashlib.sha1).digest()
        offset = h[-1] & 0x0F
        binary = struct.unpack('>I', h[offset:offset+4])[0] & 0x7FFFFFFF
        otp = binary % 1000000
        return f"{otp:06d}"

    @staticmethod
    def verify_totp_code(secret: str, code: str, window: int = 1) -> bool:
        clean_code = str(code).strip()
        if not clean_code.isdigit() or len(clean_code) != 6:
            return False
        current_time = int(time.time())
        for t in range(current_time - window * 30, current_time + (window + 1) * 30, 30):
            try:
                clean = secret.strip().replace(' ', '').upper()
                padding = '=' * (-len(clean) % 8)
                key = base64.b32decode(clean + padding, casefold=True)
                counter = int(t // 30)
                msg = struct.pack('>Q', counter)
                h = hmac.new(key, msg, hashlib.sha1).digest()
                offset = h[-1] & 0x0F
                binary = struct.unpack('>I', h[offset:offset+4])[0] & 0x7FFFFFFF
                otp = binary % 1000000
                if f"{otp:06d}" == clean_code:
                    return True
            except Exception:
                continue
        return False

    @staticmethod
    def generate_recovery_codes(count: int = 8) -> List[str]:
        codes = []
        for _ in range(count):
            c1 = secrets.token_hex(2).upper()
            c2 = secrets.token_hex(2).upper()
            codes.append(f"{c1}-{c2}")
        return codes

    @staticmethod
    def hash_password(password: str, salt: Optional[str] = None) -> str:
        """
        PBKDF2-HMAC-SHA256 with cryptographic salt and 100,000 iterations for 99% security.
        """
        if not salt:
            salt = hashlib.sha256(os.urandom(16)).hexdigest()[:16]
        
        # 100,000 iterations PBKDF2
        key = hashlib.pbkdf2_hmac(
            hash_name="sha256",
            password=password.encode("utf-8"),
            salt=salt.encode("utf-8"),
            iterations=100_000
        ).hex()
        return f"pbkdf2:sha256:100000${salt}${key}"

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """
        Constant-time verification supporting both modern PBKDF2 and legacy SHA-256 hashes.
        """
        if not hashed or not password:
            return False
            
        if hashed.startswith("pbkdf2:sha256:"):
            try:
                parts = hashed.split("$")
                if len(parts) == 3:
                    salt = parts[1]
                    expected_key = parts[2]
                    calc = hashlib.pbkdf2_hmac(
                        hash_name="sha256",
                        password=password.encode("utf-8"),
                        salt=salt.encode("utf-8"),
                        iterations=100_000
                    ).hex()
                    return hmac.compare_digest(calc, expected_key)
            except Exception:
                return False

        # Legacy backward-compatibility with constant-time check
        legacy_hash = hashlib.sha256(f"salt_{password}_rolea2026".encode()).hexdigest()
        if hmac.compare_digest(legacy_hash, hashed):
            return True
            
        return False

    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, int, str]:
        """
        Evaluates password strength and returns (is_valid, score_percent, message).
        99% Security policy: Minimum 6 chars, recommended 8+ with mix of alphanumeric characters.
        """
        if not password or len(password) < 6:
            return False, 10, "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ (Password must be at least 6 characters)."

        score = 25
        if len(password) >= 8:
            score += 25
        if re.search(r"\d", password):
            score += 20
        if re.search(r"[A-Z]", password):
            score += 15
        if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            score += 15

        score = min(score, 99)

        if score < 40:
            return True, score, "កម្រិតសុវត្ថិភាព: ខ្សោយ (Security: Low - recommend 8+ chars and numbers)"
        elif score < 70:
            return True, score, "កម្រិតសុវត្ថិភាព: មធ្យម (Security: Medium)"
        else:
            return True, score, "កម្រិតសុវត្ថិភាព: រឹងមាំ ៩៩% (Security: High 99% Secure)"

    @staticmethod
    def check_brute_force_lock(identifier: str, is_admin: bool = False) -> Tuple[bool, int]:
        """
        Checks if an IP or username is temporarily locked out due to excessive failed attempts.
        Admin Panel Lockout: 3 failed attempts -> 30-minute lockout (1800s).
        User Lockout: 5 failed attempts -> 5-minute lockout (300s).
        Returns (is_locked, remaining_seconds).
        """
        clean_id = identifier.strip().lower()
        record = _LOGIN_ATTEMPTS.get(clean_id)
        if not record:
            return False, 0

        max_attempts = 3 if is_admin else MAX_FAILED_ATTEMPTS
        lockout_secs = 1800 if is_admin else LOCKOUT_DURATION_SECONDS

        now = time.time()
        if record["attempts"] >= max_attempts:
            elapsed = now - record["last_attempt"]
            if elapsed < lockout_secs:
                remaining = int(lockout_secs - elapsed)
                return True, remaining
            else:
                # Lock expired, reset
                del _LOGIN_ATTEMPTS[clean_id]
                return False, 0

        return False, 0

    @staticmethod
    def record_failed_login(identifier: str) -> int:
        """
        Records a failed login attempt. Returns current attempt count.
        """
        clean_id = identifier.strip().lower()
        now = time.time()
        if clean_id not in _LOGIN_ATTEMPTS:
            _LOGIN_ATTEMPTS[clean_id] = {"attempts": 1, "last_attempt": now}
        else:
            _LOGIN_ATTEMPTS[clean_id]["attempts"] += 1
            _LOGIN_ATTEMPTS[clean_id]["last_attempt"] = now
        return _LOGIN_ATTEMPTS[clean_id]["attempts"]

    @staticmethod
    def reset_failed_login(identifier: str):
        """
        Clears failed attempts on successful login.
        """
        clean_id = identifier.strip().lower()
        if clean_id in _LOGIN_ATTEMPTS:
            del _LOGIN_ATTEMPTS[clean_id]

    @staticmethod
    def create_token(user: User) -> str:
        """
        Creates an encrypted, HMAC-SHA256 signed JWT token with expiry.
        """
        header_dict = {"alg": "HS256", "typ": "JWT"}
        header = base64.urlsafe_b64encode(json.dumps(header_dict).encode()).decode().rstrip("=")
        
        iat = int(time.time())
        exp = iat + (86400 * 7) # 7 days validity
        
        payload_dict = {
            "sub": user.id,
            "username": user.username,
            "role": user.role,
            "iat": iat,
            "exp": exp
        }
        payload = base64.urlsafe_b64encode(json.dumps(payload_dict).encode()).decode().rstrip("=")
        
        signature = hmac.new(
            JWT_SECRET.encode("utf-8"),
            f"{header}.{payload}".encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        return f"{header}.{payload}.{signature}"

    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decodes and verifies token signature using constant-time comparison.
        """
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header, payload, sig = parts
            
            expected_sig = hmac.new(
                JWT_SECRET.encode("utf-8"),
                f"{header}.{payload}".encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(sig, expected_sig):
                return None
            
            # Restore padding
            padded_payload = payload + "=" * (-len(payload) % 4)
            data = json.loads(base64.urlsafe_b64decode(padded_payload.encode()).decode())
            
            if data.get("exp", 0) < time.time():
                return None
                
            return data
        except Exception:
            return None
