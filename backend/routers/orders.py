from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from ..models import Order, OrderCreate, OrderUpdate
from ..data_store import store

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("", response_model=Dict[str, Any])
def list_orders(
    q: Optional[str] = Query(None, description="Search by ID, customer contact, or UID"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    orders = store.get_orders(query=q, status=status)
    return {"success": True, "data": orders}

@router.post("", response_model=Dict[str, Any])
def create_new_order(order_in: OrderCreate):
    order = store.create_order(order_in)
    return {"success": True, "data": order}

@router.get("/{order_id}", response_model=Dict[str, Any])
def get_order(order_id: str):
    order = store.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "data": order}

@router.patch("/{order_id}", response_model=Dict[str, Any])
def update_order_status(order_id: str, updates: OrderUpdate):
    order = store.update_order(order_id, updates)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "data": order}
