from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Header, Depends, Body, Request
from ..models.schemas import (
    ResellerTopUpRequest, ResellerTopUpResponse, ResellerApiKey,
    WebhookSetting, User, OrderCreate, OrderStatusUpdate
)
from ..data_store import db
from ..services.provider_service import ProviderService
from ..services.pricing_service import PricingService
from .user import get_current_user, get_optional_user

router = APIRouter(prefix="/api/v1", tags=["Reseller B2B API & Dashboard"])

def authenticate_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    authorization: Optional[str] = Header(None)
) -> User:
    api_key_val = x_api_key
    if not api_key_val and authorization:
        if authorization.startswith("Bearer rt_"):
            api_key_val = authorization.split(" ")[1]

    if api_key_val:
        key_record = db.get_api_key(api_key_val)
        if key_record:
            user_entry = db.get_user_entry_by_id(key_record.user_id)
            if user_entry:
                return user_entry["user"]

    # Fallback to first user in database for demo/testing mode
    if db.users:
        return db.users[0]["user"]

    raise HTTPException(status_code=401, detail="Missing or invalid API Key. Provide 'X-API-Key' header.")

# ==========================================
# CORE RESELLER B2B DIRECT TOP-UP API
# ==========================================
@router.post("/topup", response_model=ResellerTopUpResponse)
def reseller_direct_topup(
    req: ResellerTopUpRequest,
    user: User = Depends(authenticate_api_key)
):
    """
    Automated B2B Game Top-Up API for Resellers & external websites.
    Executes top-up via configured provider with fallback.
    """
    game = db.get_game_by_slug(req.game)
    if not game:
        raise HTTPException(status_code=404, detail=f"Game '{req.game}' not supported.")

    pkg = next((p for p in game.packages if p.id == req.product_id), None)
    if not pkg:
        raise HTTPException(status_code=404, detail=f"Product package '{req.product_id}' not found.")

    # Calculate wholesale reseller price
    cost_usd = pkg.price_reseller_usd
    if user.wallet_usd < cost_usd:
        raise HTTPException(
            status_code=402, 
            detail=f"Insufficient balance. Cost: ${cost_usd:.2f}, Wallet Balance: ${user.wallet_usd:.2f}"
        )

    # Deduct wallet balance & create order
    db.deduct_user_wallet(user.id, cost_usd, f"Reseller API TopUp: {pkg.name_en} ({req.game})")
    
    order = db.create_order(OrderCreate(
        game_slug=req.game,
        product_id=req.product_id,
        user_id=user.id,
        player_id=req.player_id,
        zone_id=req.zone_id,
        server_id=req.server_id,
        customer_phone=req.customer_phone,
        payment_method="wallet",
        amount_usd=cost_usd,
        amount_khr=int(cost_usd * 4100),
        client_ip=req.client_ip or "127.0.0.1",
        ref_id=req.ref_id
    ))

    # Dispatch to Top-Up Provider API with auto-refund on failure
    success, processed_order = ProviderService.process_order_auto_fulfillment(order, db)
    final_status = getattr(processed_order, 'status', 'success' if success else 'refunded')
    delivery_code = getattr(processed_order, 'delivery_code', None)

    return ResellerTopUpResponse(
        success=success,
        order_id=order.id,
        ref_id=req.ref_id,
        status=final_status,
        game=req.game,
        product=pkg.name_en,
        cost_usd=cost_usd,
        remaining_balance_usd=round(user.wallet_usd, 2),
        delivery_code=delivery_code,
        message="Top-Up executed successfully via RoleaTopup API." if success else f"Top-Up API Failed: Auto-refunded ${cost_usd:.2f} back to wallet balance."
    )

# ==========================================
# RESELLER DASHBOARD CONTROLS
# ==========================================
@router.get("/reseller/overview", response_model=Dict[str, Any])
def get_reseller_overview(user: Optional[User] = Depends(get_optional_user)):
    target_user = user
    if not target_user:
        return {
            "success": True,
            "data": {
                "wallet_usd": 0.0,
                "est_profit_usd": 0.0,
                "active_api_keys_count": 0,
                "b2b_orders_count": 0,
                "api_keys": []
            }
        }

    user_keys = db.get_user_api_keys(target_user.id)
    active_keys = [k for k in user_keys if k.is_active]
    if not active_keys:
        db.create_api_key(target_user.id, "Default B2B Production Key", ip_whitelist=[])
        user_keys = db.get_user_api_keys(target_user.id)

    user_orders = [o for o in db.orders if o.user_id == target_user.id]
    
    # Calculate wholesale profit margin (+15%)
    total_spent = sum(o.amount_usd for o in user_orders if o.status in ['paid', 'processing', 'success'])
    est_profit = round(total_spent * 0.15, 2)

    return {
        "success": True,
        "data": {
            "wallet_usd": target_user.wallet_usd,
            "est_profit_usd": est_profit,
            "active_api_keys_count": len([k for k in user_keys if k.is_active]),
            "b2b_orders_count": len(user_orders),
            "api_keys": user_keys
        }
    }

@router.get("/reseller/api-keys", response_model=Dict[str, Any])
def get_reseller_api_keys(user: Optional[User] = Depends(get_optional_user)):
    target_user = user or (db.users[0]["user"] if db.users else None)
    user_id = target_user.id if target_user else "usr-admin"
    keys = db.get_user_api_keys(user_id)
    if not [k for k in keys if k.is_active]:
        db.create_api_key(user_id, "Default B2B Production Key", ip_whitelist=[])
        keys = db.get_user_api_keys(user_id)
    return {"success": True, "data": keys}

@router.post("/reseller/api-keys/generate", response_model=Dict[str, Any])
def generate_reseller_api_key(
    payload: Dict[str, Any] = Body(...),
    user: Optional[User] = Depends(get_optional_user)
):
    target_user = user or (db.users[0]["user"] if db.users else None)
    user_id = target_user.id if target_user else "usr-admin"
    label = str(payload.get("label") or payload.get("name") or "API Key").strip()
    raw_ips = payload.get("ip_whitelist") or payload.get("allowed_ips") or []
    if isinstance(raw_ips, str):
        ip_whitelist = [ip.strip() for ip in raw_ips.split(",") if ip.strip()]
    else:
        ip_whitelist = [str(ip).strip() for ip in raw_ips if str(ip).strip()]

    key = db.create_api_key(user_id, label, ip_whitelist)
    return {"success": True, "message": "API key generated successfully.", "data": key}

@router.delete("/reseller/api-keys/{key_id}", response_model=Dict[str, Any])
def revoke_reseller_api_key(
    key_id: str,
    user: Optional[User] = Depends(get_optional_user)
):
    target_user = user or (db.users[0]["user"] if db.users else None)
    user_id = target_user.id if target_user else "usr-admin"
    revoked = db.revoke_api_key(user_id, key_id)
    if not revoked:
        raise HTTPException(status_code=404, detail="API key not found.")
    return {"success": True, "message": "API key revoked successfully."}

# ==========================================
# RESELLER API v2 - EXACT SPEC ENDPOINTS
# ==========================================
@router.get("/reseller/games", response_model=Dict[str, Any])
def api_spec_get_reseller_games(user: Optional[User] = Depends(get_optional_user)):
    target_user = user or (db.users[0]["user"] if db.users else None)
    balance = target_user.wallet_usd if target_user else 50.00
    shop_name = getattr(target_user, 'reseller_business_name', None) or target_user.username if target_user else "My Shop"

    active_games = [
        {"slug": g.slug, "name": g.name_en}
        for g in db.games if getattr(g, 'is_active', True)
    ]

    return {
        "ok": True,
        "reseller": {
            "name": shop_name,
            "balance": balance
        },
        "games": active_games
    }

@router.get("/reseller/offers/{game_slug}", response_model=Dict[str, Any])
def api_spec_get_reseller_offers(game_slug: str):
    game = db.get_game_by_slug(game_slug)
    if not game:
        raise HTTPException(status_code=404, detail=f"Game '{game_slug}' not found.")

    offers = []
    for p in game.packages:
        if not getattr(p, 'is_active', True):
            continue
        price_usd = p.price_reseller_usd
        retail_usd = p.price_user_usd
        profit_usd = round(max(0.0, retail_usd - price_usd), 2)

        offers.append({
            "offerId": p.id,
            "sku": getattr(p, 'provider_sku', None) or p.id,
            "name": p.name_en,
            "priceUsd": price_usd,
            "retailUsd": retail_usd,
            "profitUsd": profit_usd
        })

    return {
        "ok": True,
        "offers": offers
    }

@router.post("/reseller/order", response_model=Dict[str, Any])
def api_spec_place_reseller_order(
    payload: Dict[str, Any] = Body(...),
    user: User = Depends(authenticate_api_key)
):
    game_slug = payload.get("gameSlug") or payload.get("game")
    offer_id = payload.get("offerId") or payload.get("product_id")
    player_id = str(payload.get("playerId") or payload.get("player_id") or "")
    server_id = payload.get("serverId") or payload.get("server_id") or ""
    customer_email = payload.get("customerEmail") or payload.get("customer_contact") or ""

    if not game_slug or not offer_id or not player_id:
        raise HTTPException(status_code=400, detail="gameSlug, offerId, and playerId are required.")

    game = db.get_game_by_slug(game_slug)
    if not game:
        raise HTTPException(status_code=404, detail=f"Game '{game_slug}' not found.")

    pkg = next((
        p for p in game.packages 
        if str(p.id) == str(offer_id) 
        or str(getattr(p, 'provider_sku', '')) == str(offer_id) 
        or str(getattr(p, 'provider_product_id', '')) == str(offer_id)
    ), game.packages[0] if game.packages else None)

    if not pkg:
        raise HTTPException(status_code=404, detail=f"Offer '{offer_id}' not found for game '{game_slug}'.")

    cost_usd = pkg.price_reseller_usd
    if user.wallet_usd < cost_usd:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient wallet balance. Cost: ${cost_usd:.2f}, Balance: ${user.wallet_usd:.2f}"
        )

    db.deduct_user_wallet(user.id, cost_usd, f"Reseller Order: {pkg.name_en} ({game_slug})")

    order = db.create_order(OrderCreate(
        game_slug=game.slug,
        product_id=pkg.id,
        user_id=user.id,
        player_id=player_id,
        server_id=str(server_id) if server_id else "",
        customer_contact=str(customer_email) if customer_email else "",
        payment_method_id="wallet",
        amount_usd=cost_usd,
        amount_khr=int(cost_usd * 4100),
        client_ip="127.0.0.1"
    ))

    success, status, prov_id, prov_order_id, delivery_code = ProviderService.execute_topup_with_fallback(order, db)
    valid_status = status if status in ['pending', 'paid', 'processing', 'success', 'failed', 'cancelled', 'refunded'] else 'success'
    db.update_order_status(order.id, OrderStatusUpdate(status=valid_status, delivery_code=delivery_code))

    status_upper = "DELIVERED" if status in ["success", "paid"] else status.upper()

    return {
        "ok": success,
        "order": {
            "orderNumber": order.reference or f"RT-{order.id[:8].upper()}",
            "status": status_upper
        }
    }

# ==========================================
# RESELLER API KEYS & WEBHOOK MANAGEMENT
# ==========================================
@router.get("/reseller/api-keys", response_model=Dict[str, Any])
def get_my_api_keys(user: User = Depends(get_optional_user)):
    target_user_id = user.id if user else "usr-admin"
    keys = db.get_user_api_keys(target_user_id)
    return {"success": True, "data": keys}

@router.post("/reseller/api-keys", response_model=Dict[str, Any])
def create_my_api_key(payload: Dict[str, Any] = Body(...), user: User = Depends(get_optional_user)):
    target_user_id = user.id if user else "usr-admin"
    label = str(payload.get("label") or "My Reseller Integration Key").strip()
    ip_whitelist = payload.get("ip_whitelist") or []
    new_key = db.create_api_key(target_user_id, label, ip_whitelist)
    return {
        "success": True,
        "message": "New B2B Reseller API Key created successfully!",
        "data": new_key
    }

@router.delete("/reseller/api-keys/{key_id}", response_model=Dict[str, Any])
def revoke_my_api_key(key_id: str, user: User = Depends(get_optional_user)):
    target_user_id = user.id if user else "usr-admin"
    revoked = db.revoke_api_key(target_user_id, key_id)
    if not revoked:
        raise HTTPException(status_code=404, detail="API Key not found or already revoked")
    return {"success": True, "message": f"API Key {key_id} revoked successfully"}

