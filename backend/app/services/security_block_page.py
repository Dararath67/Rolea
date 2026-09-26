"""
Enterprise Cloudflare-Style Custom Security Block Page Renderer
RoleaTopup Platform Cambodia
"""

import time
import hashlib
from typing import Dict, Any

class SecurityBlockPageRenderer:
    """
    Renders custom Cloudflare-Style Security Block HTML Pages for WAF Threat Blocks,
    IP Bans, and Rate Limit Breaches.
    """

    @classmethod
    def generate_ray_id(cls, ip: str, reason: str) -> str:
        """Generates a 16-character hexadecimal Ray ID based on IP + Timestamp."""
        raw = f"{ip}:{reason}:{time.time()}"
        return hashlib.md5(raw.encode('utf-8')).hexdigest()[:16].upper()

    @classmethod
    def render_block_html(
        cls,
        ip: str,
        reason_title: str,
        reason_detail: str,
        error_code: str = "WAF_SECURITY_BLOCK",
        retry_after: int = 0
    ) -> str:
        ray_id = cls.generate_ray_id(ip, error_code)
        current_time_utc = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        retry_info = f"<p><strong>Retry Cooldown:</strong> {retry_after} seconds remaining</p>" if retry_after > 0 else ""

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Denied - Rolea Security Engine</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }}
        body {{ background-color: #f7f9fa; color: #333; line-height: 1.6; padding: 40px 20px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
        .container {{ max-width: 850px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); padding: 48px; border: 1px solid #e1e8ed; text-align: left; width: 100%; }}
        .header {{ margin-bottom: 30px; text-align: center; }}
        .title {{ font-size: 32px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; margin-bottom: 8px; }}
        .subtitle {{ font-size: 16px; color: #64748b; font-weight: 500; }}
        .icon-box {{ width: 96px; height: 96px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 30px auto; border: 4px solid #fecaca; }}
        .icon-box svg {{ width: 48px; height: 48px; fill: #dc2626; }}
        .details-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; }}
        @media (max-width: 640px) {{ .details-grid {{ grid-template-columns: 1fr; gap: 20px; }} .container {{ padding: 24px; }} .title {{ font-size: 24px; }} }}
        .section-title {{ font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; display: flex; items-center; gap: 8px; }}
        .section-text {{ font-size: 14px; color: #475569; leading-relaxed: 1.6; }}
        .badge {{ display: inline-block; background-color: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px; padding: 4px 10px; border-radius: 6px; font-weight: 700; margin-top: 6px; }}
        .footer-meta {{ margin-top: 30px; font-size: 12px; color: #94a3b8; font-family: monospace; border-top: 1px solid #f1f5f9; padding-top: 20px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }}
        .btn {{ display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; margin-top: 16px; transition: background 0.2s; }}
        .btn:hover {{ background: #1d4ed8; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Sorry, you have been blocked</h1>
            <p class="subtitle">You are unable to access this website service due to security policies.</p>
        </div>

        <div class="icon-box">
            <svg viewBox="0 0 24 24">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
        </div>

        <div class="details-grid">
            <div>
                <h3 class="section-title">Why have I been blocked?</h3>
                <p class="section-text">
                    This website is using a bank-grade Web Application Firewall (WAF) to protect itself from cyber attacks, malicious bots, or unauthorized traffic bursts.
                </p>
                <div style="margin-top: 12px;">
                    <span class="badge">Trigger: {error_code}</span>
                    <p class="section-text" style="margin-top: 6px; font-size: 13px; font-weight: 600; color: #dc2626;">
                        {reason_detail}
                    </p>
                    {retry_info}
                </div>
            </div>

            <div>
                <h3 class="section-title">What can I do to resolve this?</h3>
                <p class="section-text">
                    If you believe this block is an error or need assistance, please contact the website administrator with the Ray ID below.
                </p>
                <a href="https://t.me/RoleaToP_bot" target="_blank" class="btn">Contact Telegram Support</a>
            </div>
        </div>

        <div class="footer-meta">
            <span>Rolea-Ray ID: <strong>{ray_id}</strong></span>
            <span>Your IP: <strong>{ip}</strong></span>
            <span>Timestamp: <strong>{current_time_utc}</strong></span>
        </div>
    </div>
</body>
</html>"""
        return html
