from typing import Optional, Dict
from ..models.schemas import ProductPackage, CurrencyType, PricingConfig

EXCHANGE_RATE_KHR = 4100

class PricingService:
    @staticmethod
    def calculate_prices_from_cost(
        cost_usd: float,
        config: Optional[PricingConfig] = None,
        custom_markup_percent: Optional[float] = None,
        custom_fixed_markup_usd: Optional[float] = None
    ) -> Dict[str, float]:
        user_markup_pct = custom_markup_percent if custom_markup_percent is not None else (config.default_user_markup_percent if config else 12.0)
        reseller_markup_pct = config.default_reseller_markup_percent if config else 5.0
        vip_markup_pct = config.default_vip_markup_percent if config else 3.0
        fixed_markup = custom_fixed_markup_usd if custom_fixed_markup_usd is not None else (config.default_fixed_markup_usd if config else 0.05)

        price_user = round(cost_usd * (1 + user_markup_pct / 100.0) + fixed_markup, 2)
        price_reseller = round(cost_usd * (1 + reseller_markup_pct / 100.0), 2)
        price_vip = round(cost_usd * (1 + vip_markup_pct / 100.0), 2)

        # Minimum margin guarantee
        price_user = max(price_user, cost_usd)
        price_reseller = max(price_reseller, cost_usd)
        price_vip = max(price_vip, cost_usd)

        return {
            "cost_usd": cost_usd,
            "price_user_usd": price_user,
            "price_reseller_usd": price_reseller,
            "price_vip_usd": price_vip
        }

    @staticmethod
    def get_price(
        package: ProductPackage,
        role: str = "user",
        currency: CurrencyType = "USD"
    ) -> float:
        if role == "vip":
            usd_price = package.price_vip_usd
        elif role == "reseller":
            usd_price = package.price_reseller_usd
        else:
            usd_price = package.price_user_usd

        if currency == "KHR":
            return round(usd_price * EXCHANGE_RATE_KHR)
        return round(usd_price, 2)

    @staticmethod
    def usd_to_khr(amount_usd: float) -> int:
        return int(round(amount_usd * EXCHANGE_RATE_KHR))

    @staticmethod
    def khr_to_usd(amount_khr: int) -> float:
        return round(amount_khr / EXCHANGE_RATE_KHR, 2)
