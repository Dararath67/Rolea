import os
import sys

# Ensure root directory is in Python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.main import app

if __name__ == "__main__":
    import uvicorn
    # Force port 15511 for Apsara allocation
    port = int(os.environ.get("APP_PORT") or 15511)
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)



