import time
import random
from typing import Dict, Any, Tuple, Optional
from ..models.schemas import Order
from .provider_adapters import get_provider_adapter

class ProviderService:
    @staticmethod
    def execute_topup_with_fallback(
        order: Order,
        data_store: Any
    ) -> Tuple[bool, str, Optional[str], Optional[str], Optional[str]]:
        """
        Executes Top-Up strictly via the specified provider for the product/order.
        Returns: (success, status, provider_id, provider_order_id, delivery_code)
        """
        # Determine provider strictly from order -> package -> active provider
        target_prov_id = getattr(order, 'provider_id', None) or getattr(data_store, 'active_primary_provider_id', 'bay2game')
        target_prov_id = (target_prov_id or 'bay2game').lower().strip()

        provider = data_store.get_provider(target_prov_id)
        if not provider or provider.status != "active":
            print(f"[PROVIDER ERROR] Provider {target_prov_id} is inactive or disconnected.")
            return False, "failed", target_prov_id, None, f"Provider {target_prov_id} is inactive or disconnected"

        try:
            adapter = get_provider_adapter(provider)
            success, status, txn_id, delivery_code = adapter.create_topup(order)
            return success, status, provider.id, txn_id, delivery_code
        except Exception as e:
            print(f"[PROVIDER ERROR] Direct execution via {target_prov_id} failed: {e}")
            return False, "failed", target_prov_id, None, str(e)

    @staticmethod
    def process_order_auto_fulfillment(
        order: Any,
        data_store: Any
    ) -> Tuple[bool, Any]:
        """
        Automated Top-Up Processor:
        1. Submits order directly to Provider API.
        2. If success: updates order status to 'success' with delivery code.
        3. If failed (e.g. Provider balance $0 / Insufficient balance, API error):
           Leaves status as 'processing' with provider error message so Admin can top up Bay2Game and click 'Approve' to re-purchase.
           (Does NOT auto-refund unless Admin explicitly clicks 'Refund').
        """
        import uuid
        from ..models.schemas import OrderStatusUpdate

        success, prov_status, prov_id, prov_order_id, delivery_code = ProviderService.execute_topup_with_fallback(order, data_store)

        if success:
            d_code = delivery_code or f"AUTO-DELIVERED-{uuid.uuid4().hex[:8].upper()}"
            updated_order = data_store.update_order_status(
                order_id=order.id,
                update=OrderStatusUpdate(
                    status="success",
                    delivery_code=d_code
                )
            )
            return True, updated_order or order
        else:
            error_reason = delivery_code or "Provider API Error or Insufficient Balance"
            updated_order = data_store.update_order_status(
                order_id=order.id,
                update=OrderStatusUpdate(
                    status="processing",
                    delivery_code=error_reason,
                    error_message=f"BAY2GAME: {error_reason}"
                )
            )

            # Trigger Telegram Low Balance Alert to Admin
            try:
                from .telegram_service import TelegramService
                TelegramService.notify_provider_low_balance(
                    provider_name=getattr(order, 'provider_id', 'Bay2Game Wholesale API').upper(),
                    balance_usd=0.0,
                    threshold_usd=10.0
                )
            except Exception as e:
                print(f"[TELEGRAM_WARN] Failed to dispatch low balance alert: {e}")

            return False, updated_order or order

