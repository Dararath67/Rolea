from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from ..models import GameProduct
from ..data_store import store

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=Dict[str, Any])
def list_products(
    category: Optional[str] = Query(None, description="Category filter (e.g. mobile, pc, voucher, airtime)"),
    search: Optional[str] = Query(None, description="Search query string")
):
    products = store.get_products(category=category, search=search)
    return {"success": True, "data": products}

@router.get("/{slug}", response_model=Dict[str, Any])
def get_product(slug: str):
    product = store.get_product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "data": product}

@router.post("", response_model=Dict[str, Any])
def create_product(product: GameProduct):
    saved = store.save_product(product)
    return {"success": True, "data": saved}
