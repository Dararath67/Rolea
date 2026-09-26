import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    @staticmethod
    def get_smtp_config():
        return {
            "host": os.getenv("SMTP_HOST", "smtp.gmail.com").strip(),
            "port": int(os.getenv("SMTP_PORT", "587")),
            "user": os.getenv("SMTP_USER", "").strip(),
            "password": os.getenv("SMTP_PASSWORD", "").strip(),
            "from_address": os.getenv("SMTP_FROM", "Rolea TopUp Security <roleatopup@gmail.com>").strip(),
            "use_tls": os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")
        }

    @classmethod
    def send_password_reset_otp(cls, recipient_email: str, otp_code: str) -> bool:
        """
        Sends password reset OTP email using SMTP with professional enterprise HTML formatting.
        """
        config = cls.get_smtp_config()
        
        # Premium Enterprise HTML Template
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 16px; margin: 0; text-align: center;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px 32px; box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08);">
    
    <!-- Header Brand Banner -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; background: #2563eb; color: #ffffff; padding: 8px 18px; border-radius: 12px; font-weight: 800; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px;">
        ROLEA TOPUP SECURITY
      </div>
      <h1 style="color: #0f172a; margin: 0 0 10px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
        Password Reset Code
      </h1>
      <p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 500;">
        Your official 6-digit verification code is:
      </p>
    </div>
    
    <!-- 6-Digit OTP Box -->
    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px; margin-bottom: 28px; text-align: center;">
      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #1d4ed8; text-indent: 10px;">
        {otp_code}
      </div>
    </div>
    
    <!-- Notice & Expiry Alert -->
    <div style="text-align: left; background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 12px; margin-bottom: 28px;">
      <p style="color: #1e40af; font-size: 13px; line-height: 1.6; margin: 0; font-weight: 600;">
        This code will expire in <strong>10 minutes</strong>.
      </p>
      <p style="color: #3b82f6; font-size: 12px; line-height: 1.5; margin: 6px 0 0 0;">
        Please do not share this code with anyone. Our support team will never ask for your verification code.
      </p>
    </div>

    <!-- Security Footer -->
    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
        If you did not request a password reset, please ignore this email or contact support immediately.
      </p>
      <p style="color: #cbd5e1; font-size: 11px; margin: 0; font-weight: 600;">
        Rolea TopUp Cambodia 256-Bit SSL Encrypted Banking Security System
      </p>
    </div>

  </div>
</body>
</html>"""

        plain_text = f"Password Reset Code\n\nYour verification code is: {otp_code}\n\nThis code will expire in 10 minutes.\nIf you did not request a password reset, please ignore this email."

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Password Reset Code: {otp_code} - Rolea TopUp Security"
        msg["From"] = config["from_address"]
        msg["To"] = recipient_email.strip()

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        if not config["user"] or not config["password"]:
            print(f"[EMAIL_NOTICE] SMTP credentials not fully set in .env. Generated OTP Code for {recipient_email}: {otp_code}")
            return False

        try:
            print(f"[EMAIL_SERVICE] Connecting to SMTP server {config['host']}:{config['port']} for {recipient_email}...")
            with smtplib.SMTP(config["host"], config["port"], timeout=15) as server:
                if config["use_tls"]:
                    server.starttls()
                server.login(config["user"], config["password"])
                server.sendmail(config["from_address"], [recipient_email.strip()], msg.as_string())
            print(f"[EMAIL_SERVICE] Successfully dispatched OTP email to {recipient_email}")
            return True
        except Exception as e:
            print(f"[EMAIL_ERROR] Failed to send SMTP email to {recipient_email}: {e}")
            return False
