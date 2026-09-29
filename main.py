import os
import sys

# Ensure root directory and backend directory are in Python search path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if os.path.exists(BACKEND_DIR) and BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Dynamic fallback import for FastAPI application instance
try:
    from backend.app.main import app
except ModuleNotFoundError:
    try:
        from app.main import app
    except ModuleNotFoundError:
        from main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT") or os.environ.get("APP_PORT") or 15511)
    
    # Try running the app object directly or via module string fallback
    try:
        uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
    except Exception:
        uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
