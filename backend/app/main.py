from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from .routers import public, user, reseller, admin, webhooks, promoter
from .services.rate_limiter_waf import WAFAndRateLimiterMiddleware
from .services.endpoint_security_guard import EndpointSecurityMiddleware
from .services.endpoint_payload_encryption import EndpointPayloadEncryptionMiddleware

app = FastAPI(
  title="RoleaTopup API",
  description="Khmer Game Top-Up & Reseller Platform Engine with Bakong KHQR, Multi-Provider Auto-Sync, and Reseller Hub.",
  version="2.1.0",
  docs_url="/docs",
  redoc_url="/redoc"
)

app.add_middleware(EndpointPayloadEncryptionMiddleware)
app.add_middleware(EndpointSecurityMiddleware)
app.add_middleware(WAFAndRateLimiterMiddleware)

class BankSecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        return response

app.add_middleware(BankSecurityHeadersMiddleware)

# Enable CORS for frontend
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Register routers
app.include_router(public.router)
app.include_router(user.router)
app.include_router(reseller.router)
app.include_router(admin.router)
app.include_router(webhooks.router)
app.include_router(promoter.router)

@app.get("/", tags=["Health"])
def health_check():
 return {
 "status": "online",
 "platform": "RoleaTopup Cambodia ",
 "version": "2.0.0",
 "docs": "/docs",
 "currency_exchange": "1 USD = 4,100 KHR"
 }

if __name__ == "__main__":
    import os
    import uvicorn
    # Force port 15511 for Apsara allocation
    port = int(os.environ.get("APP_PORT") or 15511)
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)


