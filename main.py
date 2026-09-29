import os
import sys

# Ensure root directory and backend directory are in Python search path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if os.path.exists(BACKEND_DIR) and BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

APP_DIR = os.path.join(BACKEND_DIR, "app")
if os.path.exists(APP_DIR) and APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

# Dynamic fallback import for FastAPI application instance
try:
    from backend.app.main import app
except ModuleNotFoundError:
    try:
        from app.main import app
    except ModuleNotFoundError:
        # Import directly from current folder's app/main or backend/app/main module object
        import importlib.util
        main_app_path = os.path.join(APP_DIR, "main.py")
        if os.path.exists(main_app_path):
            spec = importlib.util.spec_from_file_location("backend_app_main", main_app_path)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            app = mod.app
        else:
            raise RuntimeError("Could not find backend app main module.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT") or os.environ.get("APP_PORT") or 15511)
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
    except Exception:
        uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
