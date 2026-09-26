from typing import Dict, Any
from fastapi import APIRouter
from ..data_store import store

router = APIRouter(prefix="/api/payment-methods", tags=["Payments"])

@router.get("", response_model=Dict[str, Any])
def list_payment_methods():
    methods = store.get_payment_methods()
    return {"success": True, "data": methods}
