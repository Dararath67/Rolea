from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import products, orders, payments, stats

app = FastAPI(
    title="NEXUS TOP-UP API",
    description="High-performance backend for game top-ups, mobile airtime, digital vouchers, PromptPay QR payments, and merchant dashboard.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend and external client apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(stats.router)

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "NEXUS TOP-UP FastAPI Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
