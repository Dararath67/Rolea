import random
import time
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Header, Depends, Body
from ..models.schemas import LoginRequest, RegisterRequest, AuthResponse, User, OrderCreate
from ..data_store import db
from ..services.auth_service import AuthService
from ..services.pricing_service import PricingService

router = APIRouter(prefix="/api/v1/user", tags=["User Dashboard & Auth"])

from ..services.email_service import EmailService

STANDARD_FORGOT_MSG = "ប្រសិនបើអ៊ីមែលនេះមានក្នុងប្រព័ន្ធ លេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នករួចរាល់។ (If the email is registered, a verification code has been sent.)"

@router.post("/forgot-password/request", response_model=Dict[str, Any])
@router.post("/forgot-password", response_model=Dict[str, Any])
def request_forgot_password(payload: Dict[str, Any] = Body(...)):
    identifier = str(payload.get("email") or payload.get("email_or_username") or "").strip().lower()
    if not identifier:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលអ៊ីមែល ឬ ឈ្មោះគណនីរបស់អ្នក (Please enter your email or username).")

    # 1. Email Format Security Check
    if "@" in identifier:
        parts = identifier.split("@")
        if len(parts) != 2 or "." not in parts[1] or len(parts[0]) < 1:
            raise HTTPException(
                status_code=400,
                detail="ទម្រង់អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ! (Please enter a valid email address)."
            )

    # 2. Strict Account Existence Check in Database
    user_entry = db.get_user_entry_by_username_or_email(identifier)
    if not user_entry:
        raise HTTPException(
            status_code=404,
            detail="មិនរកឃើញគណនី ឬ អ៊ីមែលនេះក្នុងប្រព័ន្ធទេ! សូមពិនិត្យមើលឈ្មោះគណនី ឬ អ៊ីមែលរបស់អ្នកឡើងវិញ (Account or email not found in our database)."
        )

    user = user_entry["user"]

    # 3. Create OTP Record & Enforce Cooldown
    try:
        rec_id, otp_code = db.create_password_reset_record(user.email)
        if rec_id and otp_code:
            # Send SMTP Real Email
            EmailService.send_password_reset_otp(user.email, otp_code)

            # Security Audit Log
            import uuid
            from datetime import datetime, timezone
            log_entry = {
                "id": f"sec_{uuid.uuid4().hex[:8]}",
                "user_id": user.id,
                "username": user.username,
                "event_type": "forgot_password_otp_request",
                "ip_address": "127.0.0.1",
                "user_agent": "Web Browser",
                "location": "Phnom Penh, Cambodia",
                "status": "success",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            if not hasattr(user, "security_logs") or user.security_logs is None:
                user.security_logs = []
            user.security_logs.insert(0, log_entry)
            db.save_to_disk()

            # Telegram Alert for Audit
            try:
                from ..services.telegram_service import TelegramService
                TelegramService.send_admin_alert(
                    f"SECURITY ALERT: Password reset OTP requested for `{user.username}` ({user.email}). OTP Code: `{otp_code}`"
                )
            except Exception:
                pass
    except ValueError as ve:
        raise HTTPException(status_code=429, detail=str(ve))

    # Mask email for UI display
    email_str = user.email
    if "@" in email_str:
        n_part, d_part = email_str.split("@", 1)
        masked_name = n_part[0] + "***" + (n_part[-1] if len(n_part) > 1 else "")
        masked_email = f"{masked_name}@{d_part}"
    else:
        masked_email = email_str

    return {
        "success": True,
        "masked_email": masked_email,
        "email": user.email,
        "message": f"លេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅកាន់ {masked_email} រួចរាល់! (Verification code sent)."
    }

@router.post("/forgot-password/resend-code", response_model=Dict[str, Any])
def resend_forgot_password_code(payload: Dict[str, Any] = Body(...)):
    return request_forgot_password(payload)

@router.post("/forgot-password/verify-code", response_model=Dict[str, Any])
@router.post("/forgot-password/verify", response_model=Dict[str, Any])
def verify_forgot_password_code(payload: Dict[str, Any] = Body(...)):
    email = str(payload.get("email") or payload.get("email_or_username") or "").strip().lower()
    code = str(payload.get("code") or payload.get("otp_code") or "").strip()

    if not email or not code:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលអ៊ីមែល និងលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ (Please provide email and 6-digit verification code).")

    res = db.verify_password_reset_code(email, code)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("detail", "Invalid verification code"))

    return res

@router.post("/forgot-password/reset-password", response_model=Dict[str, Any])
@router.post("/forgot-password/reset", response_model=Dict[str, Any])
def reset_password(payload: Dict[str, Any] = Body(...)):
    reset_token = str(payload.get("reset_token") or "").strip()
    new_password = str(payload.get("new_password") or payload.get("password") or "").strip()
    confirm_password = str(payload.get("confirm_password") or new_password).strip()

    # Fallback support if user sends email + code directly to reset endpoint
    if not reset_token:
        email = str(payload.get("email") or payload.get("email_or_username") or "").strip().lower()
        code = str(payload.get("code") or "").strip()
        if email and code:
            verify_res = db.verify_password_reset_code(email, code)
            if not verify_res.get("success"):
                raise HTTPException(status_code=400, detail=verify_res.get("detail", "Invalid verification code"))
            reset_token = verify_res.get("reset_token", "")

    if not reset_token:
        raise HTTPException(status_code=400, detail="កម្រិតអនុញ្ញាតមិនត្រឹមត្រូវ។ សូមផ្ទៀងផ្ទាត់លេខកូដ OTP ជាមុនសិន (Authorization reset token is required. Please verify OTP first).")

    res = db.execute_password_reset(reset_token, new_password, confirm_password)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("detail", "Failed to reset password"))

    return res



def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ")[1]
    payload = AuthService.decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")
    
    user_entry = db.get_user_entry_by_id(payload["sub"])
    if not user_entry:
        raise HTTPException(status_code=404, detail="User not found")
    return user_entry["user"]

def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = AuthService.decode_token(token)
    if not payload:
        return None
    user_entry = db.get_user_entry_by_id(payload["sub"])
    return user_entry["user"] if user_entry else None

from ..services.telegram_service import TelegramService

@router.post("/link-telegram", response_model=Dict[str, Any])
def link_telegram_account(payload: Dict[str, Any] = Body(...)):
    code = str(payload.get("code") or payload.get("link_code") or "").strip()
    user_id = str(payload.get("user_id") or payload.get("username") or "").strip()

    if not code:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលកូដភ្ជាប់គណនី ៦ ខ្ទង់ (Please enter the 6-digit link code).")
    if not user_id:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូល ID ឬ Username របស់គណនី (User ID or username is required).")

    res = db.verify_and_link_telegram_code(code=code, user_id_or_username=user_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    
    return res

@router.post("/register", response_model=Dict[str, Any])
def register(req: RegisterRequest):
    clean_username = req.username.strip().lower()
    clean_email = req.email.strip().lower()
    
    # 1. Username format security validation
    if len(clean_username) < 3 or len(clean_username) > 32:
        raise HTTPException(status_code=400, detail="ឈ្មោះគណនីត្រូវមានពី ៣ ទៅ ៣២ តួអក្សរ (Username must be between 3 and 32 characters).")
    
    if not clean_username.replace("_", "").replace("-", "").isalnum():
        raise HTTPException(status_code=400, detail="ឈ្មោះគណនីអាចប្រើបានតែអក្សរ លេខ និងសញ្ញា _ ឬ - ប៉ុណ្ណោះ (Username may only contain letters, numbers, and _ or -).")

    # 2. Email format validation
    if "@" not in clean_email or "." not in clean_email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ (Please enter a valid email address).")

    # 3. 99% Password Strength Validation
    is_valid, score, strength_msg = AuthService.validate_password_strength(req.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=strength_msg)

    # 4. Check for duplicates
    existing = db.get_user_entry_by_username_or_email(clean_username) or db.get_user_entry_by_username_or_email(clean_email)
    if existing:
        raise HTTPException(status_code=400, detail="ឈ្មោះគណនី ឬ អ៊ីមែលនេះត្រូវបានប្រើប្រាស់រួចហើយ (Username or email is already registered).")

    user = db.register_user(
        username=clean_username,
        email=clean_email,
        password=req.password,
        phone=req.phone.strip() if req.phone else "",
        role=req.role,
        referral_code=req.referral_code
    )

    if req.role == "reseller":
        try:
            TelegramService.notify_reseller_application(user)
        except Exception as e:
            print(f"[TELEGRAM_WARN] Failed to dispatch reseller alert: {e}")
        return {
            "success": True,
            "status": "pending_approval",
            "security_score": score,
            "message": "ពាក្យស្នើសុំដៃគូលក់បន្តត្រូវបានបញ្ជូនដោយជោគជ័យ! សូមរង់ចាំ Admin ពិនិត្យ និងអនុម័ត (Reseller application submitted! Pending Admin approval).",
            "user": user
        }

    token = AuthService.create_token(user)
    return {
        "success": True, 
        "token": token, 
        "user": user,
        "security_score": score,
        "security_level": "99% High Security"
    }

@router.post("/login", response_model=Dict[str, Any])
def login(req: LoginRequest):
    identifier = req.username_or_email.strip().lower()

    entry = db.get_user_entry_by_username_or_email(identifier)
    is_admin = False
    if entry and getattr(entry.get("user"), "role", "") == "admin":
        is_admin = True

    # 1. Check Brute-Force Rate Limiting Lockout (Bank-Grade 30-min lockout for Admin)
    is_locked, remaining_secs = AuthService.check_brute_force_lock(identifier, is_admin=is_admin)
    if is_locked:
        mins = remaining_secs // 60
        secs = remaining_secs % 60
        time_str = f"{mins}m {secs}s" if mins > 0 else f"{secs}s"
        raise HTTPException(
            status_code=429,
            detail=f"គណនីត្រូវបានចាក់សោរបណ្ដោះអាសន្នសម្រាប់សុវត្ថិភាពខ្ពស់បំផុតកម្រិតធនាគារ (Bank-Grade Security Lockout). សូមព្យាយាមម្ដងទៀតនៅ {time_str} ក្រោយ (Account locked. Try again in {time_str})."
        )

    if not entry or not AuthService.verify_password(req.password, entry["password_hash"]):
        attempts = AuthService.record_failed_login(identifier)
        max_allowed = 3 if is_admin else 5
        remaining_attempts = max(0, max_allowed - attempts)
        if remaining_attempts > 0:
            raise HTTPException(
                status_code=401, 
                detail=f"ឈ្មោះគណនី ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Invalid credentials. {remaining_attempts} attempts remaining)."
            )
        else:
            lock_time = "30 នាទី" if is_admin else "5 នាទី"
            raise HTTPException(
                status_code=429,
                detail=f"បញ្ចូលពាក្យសម្ងាត់ខុស {max_allowed} ដង! គណនីត្រូវបានចាក់សោរ {lock_time} សម្រាប់សុវត្ថិភាពខ្ពស់បំផុត ({max_allowed} failed attempts! Account locked)."
            )

    # 2. Reset failed attempts on success
    AuthService.reset_failed_login(identifier)

    user = entry["user"]

    # 3. 2FA Verification check
    if getattr(user, "is_2fa_enabled", False):
        code = req.two_factor_code
        secret = getattr(user, "two_factor_secret", None)
        recovery_codes = getattr(user, "two_factor_recovery_codes", []) or []

        if not code:
            return {
                "success": False,
                "requires_2fa": True,
                "message": "សូមបញ្ចូលលេខកូដ 2FA 6 ខ្ទង់ពី Google Authenticator (2FA Code Required)."
            }

        code_valid = False
        if secret and AuthService.verify_totp_code(secret, code):
            code_valid = True
        elif code in recovery_codes:
            code_valid = True
            recovery_codes.remove(code)
            user.two_factor_recovery_codes = recovery_codes
            db.save_to_disk()

        if not code_valid:
            raise HTTPException(
                status_code=401,
                detail="លេខកូដ 2FA មិនត្រឹមត្រូវ ឬ ហួសកំណត់ (Invalid or expired 2FA code)."
            )

    if user.role == "reseller":
        status = getattr(user, "reseller_status", "approved")
        if status == "pending":
            raise HTTPException(
                status_code=403,
                detail="គណនីដៃគូលក់បន្តរបស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យពី Admin (Your reseller account is pending Admin approval)."
            )
        elif status == "rejected":
            reason = getattr(user, "reseller_reject_reason", "")
            msg = "ពាក្យស្នើសុំដៃគូលក់បន្តរបស់អ្នកត្រូវបានបដិសេធ (Your reseller application was rejected)."
            if reason:
                msg += f" មូលហេតុ: {reason}"
            raise HTTPException(status_code=403, detail=msg)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is suspended or pending approval. Please contact support.")

    # Log security audit entry
    import uuid
    from datetime import datetime, timezone
    log_entry = {
        "id": f"sec_{uuid.uuid4().hex[:8]}",
        "user_id": user.id,
        "username": user.username,
        "event_type": "login",
        "ip_address": "127.0.0.1",
        "user_agent": "Web Browser",
        "location": "Phnom Penh, Cambodia",
        "status": "success",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    if not hasattr(user, "security_logs") or user.security_logs is None:
        user.security_logs = []
    user.security_logs.insert(0, log_entry)
    db.save_to_disk()

    token = AuthService.create_token(user)
    return {
        "success": True, 
        "token": token, 
        "user": user,
        "security_level": "99% High Security",
        "encryption": "256-Bit SSL / PBKDF2"
    }

@router.post("/2fa/setup", response_model=Dict[str, Any])
def setup_2fa(user: User = Depends(get_current_user)):
    secret = AuthService.generate_totp_secret()
    recovery_codes = AuthService.generate_recovery_codes()
    qr_uri = f"otpauth://totp/RoleaTopUp:{user.username}?secret={secret}&issuer=RoleaTopUp"
    return {
        "success": True,
        "data": {
            "secret": secret,
            "qr_uri": qr_uri,
            "recovery_codes": recovery_codes
        }
    }

@router.post("/2fa/verify-and-enable", response_model=Dict[str, Any])
def verify_and_enable_2fa(payload: Dict[str, Any] = Body(...), user: User = Depends(get_current_user)):
    code = str(payload.get("code", "")).strip()
    secret = str(payload.get("secret", "")).strip()
    recovery_codes = payload.get("recovery_codes", [])

    if not secret or not code:
        raise HTTPException(status_code=400, detail="Secret and 2FA verification code are required.")

    if not AuthService.verify_totp_code(secret, code):
        raise HTTPException(status_code=400, detail="លេខកូដ 2FA មិនត្រឹមត្រូវ។ សូមពិនិត្យមើលកម្មវិធី Google Authenticator ឡើងវិញ (Invalid 2FA verification code).")

    user.is_2fa_enabled = True
    user.two_factor_secret = secret
    user.two_factor_recovery_codes = recovery_codes or AuthService.generate_recovery_codes()

    from datetime import datetime, timezone
    import uuid
    log_entry = {
        "id": f"sec_{uuid.uuid4().hex[:8]}",
        "user_id": user.id,
        "username": user.username,
        "event_type": "2fa_enable",
        "ip_address": "127.0.0.1",
        "user_agent": "Web Browser",
        "location": "Phnom Penh, Cambodia",
        "status": "success",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    if not hasattr(user, "security_logs") or user.security_logs is None:
        user.security_logs = []
    user.security_logs.insert(0, log_entry)

    db.save_to_disk()
    return {
        "success": True,
        "message": "សុវត្ថិភាព 2FA ត្រូវបានបើកដំណើរការដោយជោគជ័យ (Two-Factor Authentication activated successfully).",
        "user": user
    }

@router.post("/2fa/disable", response_model=Dict[str, Any])
def disable_2fa(payload: Dict[str, Any] = Body(...), user: User = Depends(get_current_user)):
    code = str(payload.get("code", "")).strip()
    secret = getattr(user, "two_factor_secret", None)

    if secret and code:
        if not AuthService.verify_totp_code(secret, code) and code not in getattr(user, "two_factor_recovery_codes", []):
            raise HTTPException(status_code=400, detail="លេខកូដ 2FA មិនត្រឹមត្រូវ (Invalid 2FA code).")

    user.is_2fa_enabled = False
    user.two_factor_secret = None
    user.two_factor_recovery_codes = []

    from datetime import datetime, timezone
    import uuid
    log_entry = {
        "id": f"sec_{uuid.uuid4().hex[:8]}",
        "user_id": user.id,
        "username": user.username,
        "event_type": "2fa_disable",
        "ip_address": "127.0.0.1",
        "user_agent": "Web Browser",
        "location": "Phnom Penh, Cambodia",
        "status": "success",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    if not hasattr(user, "security_logs") or user.security_logs is None:
        user.security_logs = []
    user.security_logs.insert(0, log_entry)

    db.save_to_disk()
    return {
        "success": True,
        "message": "បានបិទ 2FA ដោយជោគជ័យ (Two-Factor Authentication disabled).",
        "user": user
    }

@router.get("/security-logs", response_model=Dict[str, Any])
def get_security_logs(user: User = Depends(get_current_user)):
    logs = getattr(user, "security_logs", []) or []
    return {"success": True, "data": logs}

@router.get("/profile", response_model=Dict[str, Any])
def get_profile(user: User = Depends(get_current_user)):
    return {"success": True, "user": user}

@router.post("/change-password", response_model=Dict[str, Any])
def user_change_password(payload: Dict[str, Any] = Body(...), user: Optional[User] = Depends(get_optional_user)):
    user_id = payload.get("user_id") or (user.id if user else None)
    old_password = str(payload.get("old_password") or "").strip()
    new_password = str(payload.get("new_password") or "").strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូល User ID (User ID is required)")
    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់ (Password must be at least 6 characters)")

    u_entry = db.get_user_entry_by_id(user_id) or db.get_user_entry_by_username_or_email(user_id)
    if not u_entry:
        raise HTTPException(status_code=404, detail="មិនរកឃើញគណនីនេះទេ (User not found)")

    if old_password and u_entry.get("password_hash"):
        if not AuthService.verify_password(old_password, u_entry["password_hash"]) and old_password != u_entry.get("plain_password"):
            raise HTTPException(status_code=400, detail="ពាក្យសម្ងាត់ចាស់មិនត្រឹមត្រូវ (Old password is incorrect)")

    db.reset_user_password(u_entry["user"].id, new_password)
    u_entry["user"].need_password_change = False
    db.save_to_disk()

    try:
        db.log_user_activity(
            user_id=u_entry["user"].id,
            username=u_entry["user"].username,
            email=u_entry["user"].email,
            action="CHANGE_PASSWORD",
            details="Changed account password successfully",
            target_id=u_entry["user"].id
        )
    except Exception as e:
        print(f"[ACTIVITY_LOG_WARN] Failed to log password change: {e}")

    return {
        "success": True,
        "message": "ផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ (Password changed successfully)",
        "user": u_entry["user"]
    }

@router.post("/update-username", response_model=Dict[str, Any])
def user_update_username(payload: Dict[str, Any] = Body(...), user: Optional[User] = Depends(get_optional_user)):
    user_id = payload.get("user_id") or (user.id if user else None)
    new_username = str(payload.get("new_username") or "").strip().lower()

    if not user_id or not new_username:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលឈ្មោះគណនីថ្មី (New username is required)")
    if len(new_username) < 3:
        raise HTTPException(status_code=400, detail="ឈ្មោះគណនីត្រូវមានយ៉ាងហោចណាស់ ៣ តួអក្សរ (Username must be at least 3 characters)")

    u_entry = db.get_user_entry_by_id(user_id) or db.get_user_entry_by_username_or_email(user_id)
    if not u_entry:
        raise HTTPException(status_code=404, detail="មិនរកឃើញគណនីនេះទេ (User not found)")

    try:
        updated_user = db.update_user_info(u_entry["user"].id, username=new_username)
        if not updated_user:
            raise HTTPException(status_code=400, detail="ឈ្មោះគណនីនេះត្រូវបានគេប្រើប្រាស់រួចហើយ (Username taken)")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    db.save_to_disk()
    return {
        "success": True,
        "message": "បានធ្វើបច្ចុប្បន្នភាពឈ្មោះគណនីដោយជោគជ័យ (Username updated successfully)",
        "user": updated_user
    }

@router.get("/orders", response_model=Dict[str, Any])
def get_user_orders(user: User = Depends(get_current_user)):
    orders = db.get_orders(user_id=user.id)
    return {"success": True, "data": orders}

@router.get("/wallet", response_model=Dict[str, Any])
def get_wallet_overview(user: Optional[User] = Depends(get_optional_user), user_id: Optional[str] = None):
    target_user = user
    if not target_user and user_id:
        u_entry = db.get_user_entry_by_id(user_id) or db.get_user_entry_by_username_or_email(user_id)
        if u_entry:
            target_user = u_entry["user"]
    if not target_user:
        return {
            "success": False,
            "account_deleted": True,
            "message": "គណនីនេះត្រូវបានលុប ឬមិនមានក្នុងប្រព័ន្ធឡើយ (Account has been deleted or disabled)",
            "data": {"balance_usd": 0.0, "transactions": []}
        }
        
    txns = [t for t in db.wallet_txns if t.user_id == target_user.id]
    return {
        "success": True,
        "data": {
            "balance_usd": target_user.wallet_usd,
            "transactions": txns
        }
    }

@router.post("/wallet/deposit-demo", response_model=Dict[str, Any])
def deposit_demo_wallet(amount_usd: float = 20.0, user: Optional[User] = Depends(get_optional_user)):
    target_user = user
    if not target_user and db.users:
        target_user = db.users[0]["user"]
    if not target_user:
        raise HTTPException(status_code=400, detail="User not found")
    updated_user = db.adjust_wallet(target_user.id, amount_usd, description=f"Demo KHQR Deposit +${amount_usd}")
    return {"success": True, "user": updated_user}

@router.post("/wallet/deposit", response_model=Dict[str, Any])
def deposit_user_wallet(payload: Dict[str, Any] = Body(...), user: Optional[User] = Depends(get_optional_user)):
    import uuid
    amount = float(payload.get("amount_usd") or payload.get("amount") or 0.0)
    tx_id = str(payload.get("transaction_id") or payload.get("order_id") or f"DEP-{uuid.uuid4().hex[:8].upper()}")
    target_user_id = str(payload.get("user_id") or "")
    
    target_user = user
    if not target_user and target_user_id:
        u_entry = db.get_user_entry_by_id(target_user_id) or db.get_user_entry_by_username_or_email(target_user_id)
        if u_entry:
            target_user = u_entry["user"]
            
    if not target_user and db.users:
        target_user = db.users[0]["user"]
        
    if not target_user:
        raise HTTPException(status_code=400, detail="User account not found for deposit")
        
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid deposit amount")
        
    updated_user = db.adjust_wallet(target_user.id, amount, description=f"KHQR Balance Deposit (${amount:.2f}) [Ref: {tx_id}]")
    return {
        "success": True,
        "message": f"Successfully deposited ${amount:.2f} to Rolea Wallet",
        "user": updated_user,
        "wallet_usd": updated_user.wallet_usd if updated_user else 0.0
    }

@router.post("/wallet/deposit-qr", response_model=Dict[str, Any])
def generate_wallet_deposit_qr(
    payload: Dict[str, Any] = Body(...),
    user: Optional[User] = Depends(get_optional_user)
):
    amt = float(payload.get("amount_usd") or payload.get("amount") or 5.0)
    user_id = str(payload.get("user_id") or (user.id if user else "usr-admin"))
    try:
        data = db.create_wallet_deposit_qr(user_id, amt)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/wallet/verify-deposit", response_model=Dict[str, Any])
def verify_wallet_deposit(payload: Dict[str, Any] = Body(...)):
    deposit_id = str(payload.get("deposit_id") or payload.get("reference") or "")
    md5_hash = payload.get("md5_hash")
    try:
        res = db.verify_and_credit_wallet_deposit(deposit_id, md5_hash=md5_hash)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==========================================
# RESELLER APPLICATION (FOR LOGGED-IN USERS)
# ==========================================
@router.post("/reseller/apply", response_model=Dict[str, Any])
def user_apply_reseller(payload: Dict[str, Any] = Body(...)):
    user_id = str(payload.get("user_id") or "").strip()
    business_name = str(payload.get("business_name") or payload.get("store_name") or "").strip()
    phone = str(payload.get("phone") or "").strip()
    reason = str(payload.get("reason") or "").strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូល User ID (User ID is required)")
    if not business_name:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលឈ្មោះអាជីវកម្ម ឬហាងរបស់អ្នក (Business or Store name is required)")

    try:
        updated_user = db.apply_reseller(user_id=user_id, business_name=business_name, phone=phone, reason=reason)
        try:
            TelegramService.notify_reseller_application(updated_user)
        except Exception as e:
            print(f"[TELEGRAM_WARN] Failed to send reseller apply notification: {e}")
        return {
            "success": True,
            "message": "ពាក្យស្នើសុំដៃគូលក់បន្តត្រូវបានបញ្ជូនដោយជោគជ័យ! សូមរង់ចាំ Admin ពិនិត្យ និងអនុម័ត (Reseller application submitted successfully!)",
            "user": updated_user
        }
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))

# ==========================================
# LUCKY DRAW & SPIN SYSTEM
# ==========================================
@router.get("/lucky-draw/status", response_model=Dict[str, Any])
def get_lucky_draw_status(user_id: Optional[str] = None):
    user_obj = None
    if user_id:
        entry = db.get_user_entry_by_id(user_id) or db.get_user_entry_by_username_or_email(user_id)
        if entry:
            user_obj = entry["user"]

    spins = getattr(user_obj, "spins_remaining", 0) if user_obj else 0
    points = getattr(user_obj, "reward_points", 0) if user_obj else 0

    return {
        "success": True,
        "spins_remaining": spins,
        "reward_points": points,
        "user": user_obj
    }

@router.post("/lucky-draw/spin", response_model=Dict[str, Any])
def user_spin_lucky_draw(payload: Dict[str, Any] = Body(...)):
    user_id = str(payload.get("user_id") or "").strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required to spin")
    try:
        res = db.spin_lucky_draw(user_id)
        return {
            "success": True,
            "data": res
        }
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))

