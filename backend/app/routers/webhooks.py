from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Request, Header, Body
from ..data_store import db
from ..services.provider_adapters import get_provider_adapter
from ..models.schemas import OrderStatusUpdate

router = APIRouter(prefix="/api/v1/webhooks", tags=["Provider Webhook Endpoints"])

@router.post("/provider/{provider_id}", response_model=Dict[str, Any])
async def handle_provider_webhook(
    provider_id: str,
    request: Request,
    x_signature: str = Header(None, alias="X-Signature"),
    x_callback_token: str = Header(None, alias="X-Callback-Token")
):
    provider = db.get_provider(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail=f"Provider {provider_id} not found")

    body_bytes = await request.body()
    adapter = get_provider_adapter(provider)
    
    # Verify signature if secret configured
    sig = x_signature or x_callback_token or ""
    if provider.webhook_secret and sig:
        if not adapter.verify_webhook(body_bytes, sig, provider.webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        data = await request.json()
    except Exception:
        data = {}

    order_ref = data.get("reference") or data.get("order_id") or data.get("merchant_order_id")
    status_str = data.get("status", "success").lower()
    delivery_code = data.get("delivery_code") or data.get("serial_number") or data.get("voucher_code")
    err_msg = data.get("message") or data.get("error")

    if not order_ref:
        return {"success": True, "message": "Webhook received without specific order reference (heartbeat acknowledged)"}

    order = db.get_order_by_id(order_ref)
    if not order:
        return {"success": False, "message": f"Order {order_ref} not found"}

    target_status = "success" if status_str in ("success", "paid", "delivered", "200") else "failed"
    update_obj = OrderStatusUpdate(
        status=target_status,
        delivery_code=delivery_code or order.delivery_code,
        error_message=err_msg if target_status == "failed" else None
    )

    updated = db.update_order_status(order.id, update_obj)
    return {
        "success": True,
        "message": f"Order {order.id} updated to {target_status} via {provider.name} webhook",
        "order_id": order.id,
        "status": target_status
    }

@router.post("/payment/raksmeypay", response_model=Dict[str, Any])
async def handle_raksmeypay_payment_webhook(request: Request):
    """
    Handles automated Raksmey Pay merchant webhook callbacks for instant KHQR payment confirmation.
    """
    try:
        data = await request.json()
    except Exception:
        data = {}

    order_id = data.get("order_id") or data.get("reference") or data.get("merchant_order_id")
    status_str = str(data.get("status", "SUCCESS")).upper()
    transaction_id = data.get("transaction_id") or data.get("txn_id")

    if not order_id:
        return {"success": True, "message": "Raksmey Pay webhook ping acknowledged"}

    order = db.get_order_by_id(order_id)
    if not order:
        return {"success": False, "message": f"Order {order_id} not found"}

    target_status = "paid" if status_str in ("SUCCESS", "PAID", "COMPLETED", "200") else "failed"

    update_obj = OrderStatusUpdate(
        status=target_status,
        error_message=None if target_status == "paid" else "Raksmey Pay payment failed"
    )

    updated_order = db.update_order_status(order.id, update_obj)

    return {
        "success": True,
        "message": f"Raksmey Pay KHQR payment processed for order {order_id}",
        "order_id": order_id,
        "status": target_status,
        "transaction_id": transaction_id
    }

@router.post("/payment/khpay", response_model=Dict[str, Any])
async def handle_khpay_payment_webhook(request: Request):
    """
    Handles automated KHPay merchant webhook callbacks for instant KHQR payment confirmation.
    """
    try:
        data = await request.json()
    except Exception:
        data = {}

    order_id = data.get("order_id") or data.get("reference") or data.get("merchant_order_id")
    status_str = str(data.get("status", "SUCCESS")).upper()
    transaction_id = data.get("transaction_id") or data.get("txn_id")

    if not order_id:
        return {"success": True, "message": "KHPay webhook ping acknowledged"}

    order = db.get_order_by_id(order_id)
    if not order:
        return {"success": False, "message": f"Order {order_id} not found"}

    target_status = "paid" if status_str in ("SUCCESS", "PAID", "COMPLETED", "200") else "failed"

    update_obj = OrderStatusUpdate(
        status=target_status,
        error_message=None if target_status == "paid" else "KHPay payment failed"
    )

    updated_order = db.update_order_status(order.id, update_obj)

    return {
        "success": True,
        "message": f"KHPay KHQR payment processed for order {order_id}",
        "order_id": order_id,
        "status": target_status,
        "transaction_id": transaction_id
    }

@router.post("/payment/khqrcc", response_model=Dict[str, Any])
async def handle_khqrcc_payment_webhook(request: Request):
    """
    Handles automated KHQR.CC gateway webhook callbacks for instant payment confirmation.
    """
    try:
        data = await request.json()
    except Exception:
        data = {}

    order_id = data.get("order_id") or data.get("reference") or data.get("merchant_order_id")
    status_str = str(data.get("status", "SUCCESS")).upper()
    transaction_id = data.get("transaction_id") or data.get("txn_id")

    if not order_id:
        return {"success": True, "message": "KHQR.CC webhook ping acknowledged"}

    order = db.get_order_by_id(order_id)
    if not order:
        return {"success": False, "message": f"Order {order_id} not found"}

    target_status = "paid" if status_str in ("SUCCESS", "PAID", "COMPLETED", "200") else "failed"

    update_obj = OrderStatusUpdate(
        status=target_status,
        error_message=None if target_status == "paid" else "KHQR.CC payment failed"
    )

    updated_order = db.update_order_status(order.id, update_obj)

    return {
        "success": True,
        "message": f"KHQR.CC payment processed for order {order_id}",
        "order_id": order_id,
        "status": target_status,
        "transaction_id": transaction_id
    }

@router.post("/payment/vngzz", response_model=Dict[str, Any])
def handle_vngzz_payment_webhook(data: Dict[str, Any] = Body(...)):
    """
    Handles automated VngZz 2 Game ABA PayWay KHQR gateway webhook / IPN callbacks.
    """
    order_id = (
        data.get("order_id") or 
        data.get("transaction_id") or 
        data.get("reference") or 
        data.get("idempotency_key") or
        data.get("merchant_order_id")
    )
    state_str = str(data.get("state") or data.get("status") or "PAID").upper()
    transaction_id = data.get("transaction_id") or data.get("txn_id") or order_id

    if not order_id:
        return {"success": True, "message": "VngZz webhook ping acknowledged"}

    order = db.get_order_by_id(str(order_id))
    if not order:
        return {"success": False, "message": f"Order {order_id} not found"}

    target_status = "success" if state_str in ("SUCCESS", "PAID", "COMPLETED", "200") else "failed"

    if target_status == "success" and order.status != "success":
        from ..services.provider_service import ProviderService
        success, prov_status, prov_id, txn_id, delivery = ProviderService.execute_topup_with_fallback(
            order=order,
            data_store=db
        )
        import uuid
        update_obj = OrderStatusUpdate(
            status="success" if success else "processing",
            delivery_code=delivery or f"VNGZZ-B2G-{uuid.uuid4().hex[:8].upper()}"
        )
    else:
        update_obj = OrderStatusUpdate(
            status=target_status,
            error_message=None if target_status == "success" else "VngZz payment unconfirmed"
        )

    updated_order = db.update_order_status(order.id, update_obj)

    return {
        "success": True,
        "message": f"VngZz ABA PayWay payment processed for order {order_id}",
        "order_id": order_id,
        "status": target_status,
        "transaction_id": transaction_id
    }

@router.post("/telegram/support", response_model=Dict[str, Any])
async def handle_telegram_support_webhook(request: Request):
    """
    Handles incoming user messages & callback button queries from Telegram Support Bot.
    """
    try:
        update_data = await request.json()
    except Exception:
        update_data = {}

    from ..services.telegram_service import TelegramService
    res = TelegramService.process_telegram_update(update_data, db)
    return res or {"ok": True}


