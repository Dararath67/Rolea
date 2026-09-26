from typing import Dict, Any
from fastapi import APIRouter
from ..data_store import store

router = APIRouter(prefix="/api/stats", tags=["Dashboard & Analytics"])

@router.get("", response_model=Dict[str, Any])
def get_dashboard_metrics():
    stats = store.get_stats()
    return {"success": True, "data": stats}
