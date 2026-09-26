from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List, Dict, Any
from ..data_store import db
from ..models.schemas import (
    PromoterApplication, Promoter, PromoterCommission, PromoterWithdrawal,
    PromoterApplyRequest, PromoterWithdrawRequest
)
from ..routers.user import get_current_user

router = APIRouter(prefix="/api/v1/promoter", tags=["Promoter Portal"])

@router.post("/apply", response_model=PromoterApplication)
def apply_promoter(req: PromoterApplyRequest):
    """Submit application to become a Promoter. Status starts as PENDING."""
    try:
        user = None
        if req.user_id:
            user = db.get_user_entry_by_id(req.user_id)
        app = db.apply_promoter(req, user)
        return app
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/dashboard", response_model=Dict[str, Any])
def get_promoter_dashboard(user_id: str = Query(...)):
    """Get promoter dashboard details, status, referral link, earnings, and commissions."""
    try:
        data = db.get_promoter_dashboard_data(user_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch promoter dashboard: {str(e)}")

@router.post("/withdraw", response_model=PromoterWithdrawal)
def request_promoter_withdrawal(req: PromoterWithdrawRequest):
    """Submit withdrawal request for accumulated promoter commissions."""
    try:
        if not req.user_id:
            raise HTTPException(status_code=400, detail="User ID is required for withdrawal request")
        withdrawal = db.request_promoter_withdrawal(req.user_id, req)
        return withdrawal
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process withdrawal request: {str(e)}")

@router.get("/verify/{code}")
def verify_referral_code(code: str):
    """Verify if a referral code is valid and active."""
    result = db.verify_referral_code(code)
    return result
