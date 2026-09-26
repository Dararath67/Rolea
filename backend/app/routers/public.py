import time
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, Body
from ..models.schemas import (
    Game, OrderCreate, Order, OrderStatusUpdate, KHQRGenerateRequest,
    KHQRGenerateResponse, CurrencyType, TicketCreateRequest, TicketReplyRequest, TicketStatusUpdateRequest
)
from ..data_store import db
from ..services.khqr_service import KHQRService
from ..services.pricing_service import PricingService
from ..services.telegram_service import TelegramService

from ..services.bank_security_engine import BankSecurityEngine

router = APIRouter(prefix="/api/v1", tags=["Public Storefront & Top-Up"])

@router.get("/bank-security-status", response_model=Dict[str, Any])
def get_bank_security_status():
    return BankSecurityEngine.get_security_status()

@router.get("/games", response_model=Dict[str, Any])
def list_games(
    category: Optional[str] = Query(None, description="Category filter (e.g. mobile, pc, voucher, airtime)"),
    search: Optional[str] = Query(None, description="Search term")
):
    games = db.get_games(category=category, search=search)
    return {"success": True, "data": games}

@router.get("/games/{slug}", response_model=Dict[str, Any])
def get_game_detail(slug: str):
    game = db.get_game_by_slug(slug)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found or not published")
    return {"success": True, "data": game}

@router.get("/games/{slug}/products", response_model=Dict[str, Any])
def get_game_active_products(slug: str):
    game = db.get_game_by_slug(slug, active_only=True)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found or not published")
    active_packages = [p for p in game.packages if p.is_active and not getattr(p, 'is_hidden', False)]
    return {
        "success": True,
        "game_slug": game.slug,
        "game_name_en": game.name_en,
        "game_name_km": game.name_km,
        "count": len(active_packages),
        "data": active_packages
    }

from ..services.player_check_service import PlayerCheckService
from ..models.schemas import GamerCheckRequest, GamerCheckResponse

@router.get("/game/check_id", response_model=Dict[str, Any])
def api_get_check_id(
    game: Optional[str] = Query(None),
    game_slug: Optional[str] = Query(None),
    userid: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    playerid: Optional[str] = Query(None),
    uid: Optional[str] = Query(None),
    id: Optional[str] = Query(None),
    serverid: Optional[str] = Query(None),
    server_id: Optional[str] = Query(None),
    zoneid: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None),
    server: Optional[str] = Query(None),
    zone: Optional[str] = Query(None)
):
    selected_game = game or game_slug or "mlbb"
    final_userid = userid or user_id or playerid or uid or id or ""
    final_serverid = serverid or server_id or zoneid or zone_id or server or zone or ""
    res = PlayerCheckService.check_player_account(selected_game, final_userid, final_serverid, db=db)
    return res

@router.get("/gamer/check", response_model=Dict[str, Any])
def api_get_check_gamer(
    game: Optional[str] = Query(None),
    game_slug: Optional[str] = Query(None),
    userid: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    playerid: Optional[str] = Query(None),
    uid: Optional[str] = Query(None),
    id: Optional[str] = Query(None),
    serverid: Optional[str] = Query(None),
    server_id: Optional[str] = Query(None),
    zoneid: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None)
):
    selected_game = game or game_slug or "mlbb"
    final_userid = userid or user_id or playerid or uid or id or ""
    final_serverid = serverid or server_id or zoneid or zone_id or ""
    res = PlayerCheckService.check_player_account(selected_game, final_userid, final_serverid, db=db)
    return res

@router.post("/gamer/check", response_model=Dict[str, Any])
def api_check_gamer(payload: Dict[str, Any] = Body(...)):
    game_slug = str(payload.get("game_slug") or payload.get("game") or payload.get("slug") or "").strip()
    user_id = ""
    zone_id = ""
    for k, v in payload.items():
        k_clean = str(k).lower().replace("_", "").replace("-", "").strip()
        val_str = str(v or "").strip()
        if k_clean in ["userid", "playerid", "uid", "id", "accountid", "user", "player"]:
            user_id = val_str
        elif k_clean in ["serverid", "zoneid", "server", "zone", "sid", "zid"]:
            zone_id = val_str

    if not user_id and payload:
        vals = [str(v).strip() for k, v in payload.items() if str(v).strip() and k not in ["game", "game_slug", "slug"]]
        if vals:
            user_id = vals[0]
            if len(vals) > 1:
                zone_id = vals[1]

    res = PlayerCheckService.check_player_account(game_slug, user_id, zone_id, db=db)
    return res

@router.get("/games/{slug}/check-account", response_model=Dict[str, Any])
def get_check_player_account(
    slug: str,
    userid: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    playerid: Optional[str] = Query(None),
    uid: Optional[str] = Query(None),
    id: Optional[str] = Query(None),
    serverid: Optional[str] = Query(None),
    server_id: Optional[str] = Query(None),
    zoneid: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None)
):
    final_userid = userid or user_id or playerid or uid or id or ""
    final_serverid = serverid or server_id or zoneid or zone_id or ""
    res = PlayerCheckService.check_player_account(slug, final_userid, final_serverid, db=db)
    if not res.get("verified") or not res.get("valid"):
        raise HTTPException(status_code=400, detail=res.get("message", "Unable to verify player"))
    return res

@router.post("/games/{slug}/check-account", response_model=Dict[str, Any])
def check_player_account(
    slug: str,
    payload: Dict[str, Any] = Body(...)
):
    user_id = ""
    zone_id = ""
    for k, v in payload.items():
        k_clean = str(k).lower().replace("_", "").replace("-", "").strip()
        val_str = str(v or "").strip()
        if k_clean in ["userid", "playerid", "uid", "id", "accountid", "user", "player"]:
            user_id = val_str
        elif k_clean in ["serverid", "zoneid", "server", "zone", "sid", "zid"]:
            zone_id = val_str

    if not user_id and payload:
        vals = [str(v).strip() for k, v in payload.items() if str(v).strip() and k not in ["game", "game_slug", "slug"]]
        if vals:
            user_id = vals[0]
            if len(vals) > 1:
                zone_id = vals[1]

    res = PlayerCheckService.check_player_account(slug, user_id, zone_id, db=db)
    if not res.get("verified") or not res.get("valid"):
        raise HTTPException(status_code=400, detail=res.get("message", "Unable to verify player"))
    return res

@router.get("/banners/hero", response_model=Dict[str, Any])
def get_public_hero_banner():
    hero = db.get_hero_banner()
    return {"success": True, "data": hero}

@router.get("/banners", response_model=Dict[str, Any])
def list_public_banners():
    banners = [b for b in db.get_banners() if b.is_active]
    return {"success": True, "data": banners}

@router.get("/payment-methods", response_model=Dict[str, Any])
def list_payment_methods():
    methods = [m for m in db.payment_methods if m.is_active]
    return {"success": True, "data": methods}

@router.post("/coupons/validate", response_model=Dict[str, Any])
@router.get("/coupons/validate", response_model=Dict[str, Any])
def validate_coupon(
    code: Optional[str] = Query(None),
    amount_usd: Optional[float] = Query(None),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    coupon_code = ""
    order_amount = 0.0
    
    if payload:
        coupon_code = str(payload.get("code") or payload.get("coupon_code") or "").strip().upper()
        order_amount = float(payload.get("amount_usd") or payload.get("amount") or 0.0)
    
    if not coupon_code and code:
        coupon_code = str(code).strip().upper()
    if not order_amount and amount_usd:
        order_amount = float(amount_usd)

    if not coupon_code:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលកូដបញ្ចុះតម្លៃ (Please enter a discount code).")

    found_coupon = None
    for c in db.coupons:
        if c.code.upper() == coupon_code and c.is_active:
            found_coupon = c
            break

    if not found_coupon:
        raise HTTPException(status_code=404, detail="កូដមិនត្រឹមត្រូវ ឬផុតកំណត់ (Invalid or expired discount code).")

    if found_coupon.min_order_usd > 0 and order_amount > 0 and order_amount < found_coupon.min_order_usd:
        raise HTTPException(
            status_code=400,
            detail=f"កូដនេះតម្រូវឱ្យកម្ម៉ង់ចាប់ពី ${found_coupon.min_order_usd:.2f} ឡើងទៅ (Min order ${found_coupon.min_order_usd:.2f})."
        )

    discount_pct = found_coupon.discount_percent
    discount_amount = round((order_amount * discount_pct / 100.0), 2) if order_amount > 0 else 0.0
    final_amount = round(max(0.0, order_amount - discount_amount), 2)

    return {
        "success": True,
        "valid": True,
        "message": f"កូដ '{found_coupon.code}' ត្រឹមត្រូវ! បញ្ចុះតម្លៃ {discount_pct:.0f}%",
        "data": {
            "id": found_coupon.id,
            "code": found_coupon.code,
            "discount_percent": discount_pct,
            "min_order_usd": found_coupon.min_order_usd,
            "discount_amount_usd": discount_amount,
            "original_amount_usd": order_amount,
            "final_amount_usd": final_amount
        }
    }

from ..services.vngzz_payment_service import VngzzPaymentService
from ..models.schemas import VngzzQRGenerateRequest, VngzzCheckTransactionRequest

@router.post("/payments/vngzz/generate-qr", response_model=Dict[str, Any])
@router.post("/khqr/generate", response_model=Dict[str, Any])
def generate_vngzz_khqr_payload(payload: Dict[str, Any] = Body(...)):
    order_id = str(payload.get("order_id") or payload.get("idempotency_key") or f"ORD-{int(time.time()*1000)}")
    amount = float(payload.get("amount_usd") or payload.get("amount") or 1.0)
    currency = str(payload.get("currency") or "USD").upper()

    cfg = db.get_vngzz_config()
    res = VngzzPaymentService.generate_qr(
        amount=amount,
        currency=currency,
        idempotency_key=order_id,
        api_key=cfg.api_key,
        generate_qr_url=cfg.generate_qr_url
    )
    return res

@router.post("/payments/vngzz/check-transaction", response_model=Dict[str, Any])
def check_vngzz_transaction(req: VngzzCheckTransactionRequest):
    cfg = db.get_vngzz_config()
    res = VngzzPaymentService.check_transaction(
        transaction_id=req.transaction_id,
        api_key=cfg.api_key,
        check_trans_url=cfg.check_transaction_url
    )
    
    # If transaction is confirmed paid, execute topup delivery with Provider API & auto-refund fallback
    if res.get("is_paid") or res.get("state") == "PAID":
        order_id = req.order_id or req.transaction_id
        if order_id:
            order = db.get_order_by_id(order_id)
            if order and order.status != "success":
                order.payment_status = "paid"
                try:
                    TelegramService.notify_payment_success(order, req.transaction_id)
                except Exception as e:
                    print(f"[TELEGRAM_WARN] Failed to notify payment: {e}")

                from ..services.provider_service import ProviderService
                success, processed_order = ProviderService.process_order_auto_fulfillment(
                    order=order,
                    data_store=db
                )
    return res

@router.get("/payments/vngzz/status", response_model=Dict[str, Any])
def get_vngzz_status():
    cfg = db.get_vngzz_config()
    return VngzzPaymentService.check_status(api_url=cfg.api_url)

@router.post("/orders", response_model=Dict[str, Any])
def create_order(order_data: OrderCreate):
    # TopUp Protection: check player status if available
    customer_name = "Gamer"
    try:
        check_res = PlayerCheckService.check_player_account(
            order_data.game_slug, order_data.player_id, order_data.server_id, db=db
        )
        if check_res.get("verified"):
            customer_name = check_res.get("playerName") or check_res.get("gamer_name") or "Gamer"
    except Exception as e:
        print(f"[PLAYER_CHECK_WARN] Verification skipped: {e}")

    try:
        order = db.create_order(order_data, role="user")
        if customer_name and customer_name != "Gamer":
            order.customer_name = customer_name
        
        # Trigger Telegram Notification for New Order
        try:
            final_usd = getattr(order, 'price_usd', getattr(order, 'amount_usd', 0.0))
            final_khr = int(final_usd * 4100)
            TelegramService.notify_new_order(order, final_usd, final_khr)
        except Exception as e:
            print(f"[TELEGRAM_WARN] New order notification error: {e}")

        return {"success": True, "data": order}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/{order_id}", response_model=Dict[str, Any])
def get_order_status(order_id: str):
    order = db.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "data": order}

@router.patch("/orders/{order_id}", response_model=Dict[str, Any])
def update_order_status(order_id: str, update: OrderStatusUpdate):
    order = db.update_order_status(order_id, update)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Trigger Telegram Notification for Delivered/Completed Order
    if update.status in ["success", "completed"]:
        try:
            TelegramService.notify_order_delivered(order, getattr(update, 'delivery_code', None))
        except Exception as e:
            print(f"[TELEGRAM_WARN] Order delivered notification error: {e}")

    return {"success": True, "data": order}

# --- Support Ticket Endpoints ---
@router.post("/tickets", response_model=Dict[str, Any])
def create_support_ticket(req: TicketCreateRequest):
    if not req.subject or not req.message:
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលប្រធានបទ និងសារព័ត៌មាន (Subject and message are required).")
    ticket = db.create_support_ticket(req)
    return {"success": True, "data": ticket, "message": "Support ticket created successfully!"}

@router.get("/tickets", response_model=Dict[str, Any])
def list_support_tickets(
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    if not user_id or not user_id.strip() or user_id.lower() in ["all", "admin", "super_admin"]:
        return {"success": True, "total": 0, "data": []}
    tickets = db.get_support_tickets(user_id=user_id, status=status, category=category)
    return {"success": True, "total": len(tickets), "data": tickets}


@router.get("/tickets/{ticket_id}", response_model=Dict[str, Any])
def get_support_ticket_details(ticket_id: str):
    ticket = db.get_support_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    return {"success": True, "data": ticket}

@router.post("/tickets/{ticket_id}/reply", response_model=Dict[str, Any])
def reply_to_support_ticket(ticket_id: str, req: TicketReplyRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="សូមបញ្ចូលសារឆ្លើយតប (Reply message cannot be empty).")
    sender_name = req.sender_name or "Customer"
    sender_role = req.sender_role or "user"
    updated = db.add_ticket_reply(ticket_id, sender_role=sender_role, sender_name=sender_name, message=req.message, attachments=req.attachments)
    if not updated:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    return {"success": True, "data": updated, "message": "Reply sent successfully!"}
