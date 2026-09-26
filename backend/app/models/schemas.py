from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Core Enums
RoleType = Literal['user', 'reseller', 'admin', 'super_admin', 'manager', 'support', 'finance']
AdminRoleType = Literal['super_admin', 'admin', 'manager', 'support', 'finance']
LanguageType = Literal['km', 'en']
CurrencyType = Literal['USD', 'KHR']
OrderStatus = Literal['pending', 'paid', 'processing', 'success', 'failed', 'cancelled', 'refunded']
GameCategory = str
PaymentCategory = Literal['khqr', 'bakong', 'aba', 'acleda', 'wing', 'card', 'wallet', 'manual']
SyncInterval = Literal['manual', '5m', '15m', '30m', '1h', '6h', 'daily']
SyncStatus = Literal['never', 'success', 'error', 'running']
ProviderStatus = Literal['active', 'disabled', 'maintenance']

# --- Game & Product Schemas ---
class InputFieldDef(BaseModel):
 id: str
 label_en: str
 label_km: str
 placeholder_en: str
 placeholder_km: str
 type: Optional[Literal['text', 'number']] = 'text'
 required: bool = True
 helper_en: Optional[str] = None
 helper_km: Optional[str] = None

class ProductPackage(BaseModel):
 id: str
 game_slug: str
 name_en: str
 name_km: str
 cost_usd: float = 0.0
 price_user_usd: float
 price_reseller_usd: float
 price_vip_usd: float
 bonus_en: Optional[str] = None
 bonus_km: Optional[str] = None
 icon: Optional[str] = ''
 popular: Optional[bool] = False
 is_active: bool = True
 is_featured: Optional[bool] = False
 is_hidden: Optional[bool] = False
 sort_order: Optional[int] = 0
 provider_id: Optional[str] = "bay2game"
 supported_providers: List[str] = Field(default_factory=lambda: ["bay2game", "fazercards"])
 bay2game_product_id: Optional[str] = None
 fazercards_product_id: Optional[str] = None
 bay2game_cost_usd: Optional[float] = None
 fazercards_cost_usd: Optional[float] = None
 provider_product_id: Optional[str] = None
 external_product_id: Optional[str] = None
 provider_sku: Optional[str] = None
 manual_price_override: Optional[bool] = False
 markup_percent: Optional[float] = None
 fixed_markup_usd: Optional[float] = None

class ProductPackageUpdate(BaseModel):
 name_en: Optional[str] = None
 name_km: Optional[str] = None
 cost_usd: Optional[float] = None
 price_user_usd: Optional[float] = None
 price_reseller_usd: Optional[float] = None
 price_vip_usd: Optional[float] = None
 manual_price_override: Optional[bool] = None
 markup_percent: Optional[float] = None
 fixed_markup_usd: Optional[float] = None
 is_active: Optional[bool] = None
 is_featured: Optional[bool] = None
 is_hidden: Optional[bool] = None
 popular: Optional[bool] = None
 sort_order: Optional[int] = None
 provider_id: Optional[str] = None
 supported_providers: Optional[List[str]] = None
 bay2game_product_id: Optional[str] = None
 fazercards_product_id: Optional[str] = None
 provider_product_id: Optional[str] = None
 external_product_id: Optional[str] = None
 provider_sku: Optional[str] = None

class Game(BaseModel):
 id: str
 slug: str
 name_en: str
 name_km: str
 subtitle_en: str
 subtitle_km: str
 category: GameCategory
 publisher: str
 region: str = "Cambodia / SEA"
 thumbnail: str
 banner: str
 badge_en: Optional[str] = None
 badge_km: Optional[str] = None
 currency_name_en: str = "Diamonds"
 currency_name_km: str = "ពេជ្រ"
 instant_delivery: bool = True
 is_popular: bool = False
 is_hot_deal: bool = False
 is_new: bool = False
 is_active: bool = True
 guide_en: Optional[str] = None
 guide_km: Optional[str] = None
 primary_provider_id: Optional[str] = "bay2game"
 supported_providers: List[str] = Field(default_factory=lambda: ["bay2game", "fazercards"])
 bay2game_game_id: Optional[str] = None
 fazercards_game_id: Optional[str] = None
 provider_id: Optional[str] = "bay2game"
 fallback_provider_id: Optional[str] = "bay2game"
 provider_game_id: Optional[str] = None
 external_game_id: Optional[str] = None
 fields: List[InputFieldDef] = []
 packages: List[ProductPackage] = []

# --- Payment & KHQR Schemas ---
class PaymentMethod(BaseModel):
 id: str
 name_en: str
 name_km: str
 category: PaymentCategory
 icon: str
 fee_percent: float = 0.0
 fee_fixed_usd: float = 0.0
 account_name: Optional[str] = None
 account_number: Optional[str] = None
 qr_data: Optional[str] = None
 is_active: bool = True
 badge_en: Optional[str] = None
 badge_km: Optional[str] = None
 profile_id: Optional[str] = None
 profile_key: Optional[str] = None

class RaksmeyPayConfig(BaseModel):
 is_active: bool = True
 profile_id: str = "rsp_prof_102938"
 profile_key: str = "rsp_sec_key_9981726"
 api_url: str = "https://www.raksmeypay.com/api/v1"
 webhook_url: str = "/api/v1/webhooks/payment/raksmeypay"
 merchant_name: str = "Rolea TopUp (Raksmey Pay Auto KHQR)"
 auto_verify: bool = True

class KHPayConfig(BaseModel):
 is_active: bool = True
 api_key: str = "khp_key_88991122"
 api_secret: str = "khp_sec_99447733"
 merchant_id: str = "khp_merch_5544"
 api_url: str = "https://www.khpay.site/api/v1"
 webhook_url: str = "/api/v1/webhooks/payment/khpay"
 merchant_name: str = "Rolea TopUp (KHPay Auto KHQR)"
 auto_verify: bool = True

class VngzzPaymentConfig(BaseModel):
    is_active: bool = True
    api_url: str = "https://www.vngzz2game.site/api"
    generate_qr_url: str = "https://www.vngzz2game.site/api/v1/generate_qr"
    check_transaction_url: str = "https://www.vngzz2game.site/api/v1/check_transaction"
    status_url: str = "https://www.vngzz2game.site/api/v1/status"
    api_key: str = ""
    merchant_name: str = "Rolea TopUp (VngZz 2 Game ABA PayWay KHQR)"
    auto_verify: bool = True

class VngzzQRGenerateRequest(BaseModel):
    amount: float
    currency: str = "USD"
    order_id: Optional[str] = None
    idempotency_key: Optional[str] = None

class VngzzCheckTransactionRequest(BaseModel):
    transaction_id: str
    order_id: Optional[str] = None

class KHQRCCConfig(BaseModel):
    is_active: bool = True
    merchant_id: str = "fdIyowSEZRGDts7mTxjpn5o8Z3FCCjiX"
    api_key: str = "fdIyowSEZRGDts7mTxjpn5o8Z3FCCjiX"
    api_secret: str = "fdIyowSEZRGDts7mTxjpn5o8Z3FCCjiX"
    api_url: str = "https://khqr.cc/api/v1"
    qr_api_url: str = "https://khqr.cc/api/fdIyowSEZRGDts7mTxjpn5o8Z3FCCjiX/payment-gateway/v1/payments/qr-api"
    check_trans_url: str = "https://khqr.cc/api/fdIyowSEZRGDts7mTxjpn5o8Z3FCCjiX/payment-gateway/v1/payments/check-trans"
    payment_request_url: str = "https://khqr.cc/api/payment/request/fdIyowSEZRGDts7mTxjpn5o8Z3FCCjiX"
    webhook_url: str = "/api/v1/webhooks/payment/khqrcc"
    merchant_name: str = "Rolea TopUp (KHQR.CC Auto Gateway)"
    auto_verify: bool = True

class KHQRGenerateRequest(BaseModel):
 order_id: str
 amount_usd: float
 amount_khr: int
 currency: CurrencyType = 'USD'
 customer_phone: Optional[str] = None

class KHQRGenerateResponse(BaseModel):
 success: bool
 qr_string: str
 md5: str
 amount: float
 currency: CurrencyType
 expires_in_seconds: int = 900
 bakong_account_id: str
 merchant_name: str

# --- Order Schemas ---
class OrderCreate(BaseModel):
    game_slug: str
    product_id: str
    player_id: str
    server_id: Optional[str] = ""
    currency: CurrencyType = "USD"
    payment_method_id: str
    customer_contact: Optional[str] = ""
    user_id: Optional[str] = None
    reference: Optional[str] = None
    coupon_code: Optional[str] = None
    referral_code: Optional[str] = None
    promoter_id: Optional[str] = None

class Order(BaseModel):
    id: str
    reference: str
    user_id: Optional[str] = None
    customer_name: Optional[str] = "Gamer"
    game_slug: str
    game_name_en: str
    game_name_km: str
    product_id: str
    product_name_en: str
    product_name_km: str
    player_id: str
    server_id: Optional[str] = ""
    amount_usd: float
    amount_khr: int
    cost_usd: float = 0.0
    profit_usd: float = 0.0
    currency: CurrencyType = "USD"
    payment_method_id: str
    payment_method_name: str
    status: OrderStatus
    payment_status: Literal['unpaid', 'paid', 'refunded'] = 'paid'
    provider_id: Optional[str] = None
    provider_order_id: Optional[str] = None
    idempotency_key: Optional[str] = None
    provider_response: Optional[Dict[str, Any]] = None
    delivery_code: Optional[str] = None
    slip_image: Optional[str] = None
    customer_contact: str = ""
    referral_code: Optional[str] = None
    promoter_id: Optional[str] = None
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None
    error_message: Optional[str] = None
    auto_account_notice: Optional[Dict[str, Any]] = None

class OrderStatusUpdate(BaseModel):
 status: OrderStatus
 delivery_code: Optional[str] = None
 error_message: Optional[str] = None
 slip_image: Optional[str] = None
 completed_at: Optional[str] = None

# --- Reseller Schemas ---
class ResellerTopUpRequest(BaseModel):
 game: str
 product_id: str
 player_id: str
 server_id: Optional[str] = ""
 reference: str

class ResellerTopUpResponse(BaseModel):
 success: bool
 status: str
 order_id: str
 reference: str
 balance_remaining_usd: float
 message: Optional[str] = "Top-up request dispatched successfully"

class ResellerApiKey(BaseModel):
 id: str
 user_id: str
 api_key: str
 secret_key_preview: str
 label: str
 ip_whitelist: List[str] = []
 is_active: bool = True
 created_at: str

class WebhookSetting(BaseModel):
 id_key: Optional[str] = None
 user_id: str
 webhook_url: str
 secret: str
 is_active: bool = True
 allowed_ips: List[str] = []

class WalletDepositQRRequest(BaseModel):
 amount_usd: float

class WalletDepositQRResponse(BaseModel):
 success: bool
 deposit_id: str
 amount_usd: float
 amount_khr: int
 qr_string: str
 md5: str
 merchant_name: str
 reference: str

class WalletDepositVerifyRequest(BaseModel):
 deposit_id: str
 md5_hash: Optional[str] = None

class ResellerSecurityConfigUpdate(BaseModel):
 allowed_ips: List[str] = []
 webhook_url: Optional[str] = None

# --- User & Auth Schemas ---
class SecurityLogEntry(BaseModel):
    id: str
    user_id: str
    username: str
    event_type: str  # login, 2fa_enable, 2fa_disable, failed_login
    ip_address: str = "127.0.0.1"
    user_agent: Optional[str] = "Web Browser"
    location: Optional[str] = "Cambodia"
    status: str = "success"
    created_at: str

class User(BaseModel):
 id: str
 username: str
 email: str
 phone: Optional[str] = None
 role: RoleType = "user"
 tier: Literal['user', 'reseller', 'vip'] = "user"
 wallet_usd: float = 0.0
 total_spent_usd: float = 0.0
 total_orders: int = 0
 api_enabled: bool = False
 is_active: bool = True
 is_2fa_enabled: bool = False
 two_factor_secret: Optional[str] = None
 two_factor_recovery_codes: List[str] = []
 security_logs: List[Dict[str, Any]] = []
 reseller_status: Optional[Literal['none', 'pending', 'approved', 'rejected']] = "none"
 reseller_business_name: Optional[str] = None
 reseller_applied_at: Optional[str] = None
 reseller_reviewed_at: Optional[str] = None
 reseller_reject_reason: Optional[str] = None
 referred_by_code: Optional[str] = None
 referred_by_promoter_id: Optional[str] = None
 spins_remaining: int = 0
 reward_points: int = 0
 password_plain: Optional[str] = None
 password_hash_preview: Optional[str] = None
 telegram_chat_id: Optional[str] = None
 telegram_username: Optional[str] = None
 telegram_photo_url: Optional[str] = None
 telegram_linked_at: Optional[str] = None
 created_at: str

class TwoFactorSetupResponse(BaseModel):
    secret: str
    qr_uri: str
    recovery_codes: List[str]

class TwoFactorVerifyRequest(BaseModel):
    code: str
    secret: Optional[str] = None

class TwoFactorToggleRequest(BaseModel):
    code: str
    enable: bool = True

class WalletTransaction(BaseModel):
 id: str
 user_id: str
 type: Literal['deposit', 'topup_payment', 'refund', 'reseller_credit', 'adjustment']
 amount_usd: float
 balance_after_usd: float
 reference: str
 description: str
 created_at: str

class WalletLedgerEntry(BaseModel):
 id: str
 user_id: str
 username: str
 type: str
 amount_usd: float
 balance_after_usd: float
 reference: str
 note: str
 created_at: str

class LoginRequest(BaseModel):
 username_or_email: str
 password: str
 two_factor_code: Optional[str] = None

class RegisterRequest(BaseModel):
 username: str
 email: str
 password: str
 phone: Optional[str] = None
 role: RoleType = "user"
 referral_code: Optional[str] = None

class AuthResponse(BaseModel):
 success: bool
 token: str
 user: User

# --- Provider Schemas ---
class Provider(BaseModel):
 id: str
 name: str
 api_url: str
 api_key: str
 secret: Optional[str] = None
 api_username: Optional[str] = None
 status: ProviderStatus = 'active'
 priority: int = 1
 webhook_url: Optional[str] = None
 webhook_secret: Optional[str] = None
 auto_sync_interval: SyncInterval = '1h'
 auto_sync_games: bool = True
 auto_sync_products: bool = True
 auto_update_prices: bool = True
 auto_update_status: bool = True
 last_sync_at: Optional[str] = None
 last_sync_status: SyncStatus = 'never'
 last_sync_error: Optional[str] = None
 sync_games_count: int = 0
 sync_products_count: int = 0
 created_at: str

class ProviderCreate(BaseModel):
 id: Optional[str] = None
 name: str
 api_url: str
 api_key: str
 secret: Optional[str] = None
 api_username: Optional[str] = None
 status: ProviderStatus = 'active'
 priority: int = 1
 webhook_secret: Optional[str] = None
 auto_sync_interval: SyncInterval = '1h'
 auto_sync_games: bool = True
 auto_sync_products: bool = True

class ProviderUpdate(BaseModel):
 name: Optional[str] = None
 api_url: Optional[str] = None
 api_key: Optional[str] = None
 secret: Optional[str] = None
 api_username: Optional[str] = None
 status: Optional[ProviderStatus] = None
 priority: Optional[int] = None
 webhook_secret: Optional[str] = None
 auto_sync_interval: Optional[SyncInterval] = None
 auto_sync_games: Optional[bool] = None
 auto_sync_products: Optional[bool] = None

class ProviderResponse(BaseModel):
 id: str
 name: str
 api_url: str
 api_key_masked: str
 has_secret: bool
 api_username: Optional[str] = None
 status: ProviderStatus
 priority: int
 webhook_url: Optional[str]
 auto_sync_interval: SyncInterval
 auto_sync_games: bool = True
 auto_sync_products: bool = True
 last_sync_at: Optional[str]
 last_sync_status: SyncStatus
 last_sync_error: Optional[str]
 sync_games_count: int
 sync_products_count: int
 created_at: str

# --- Pricing & Sync Log Schemas ---
class PricingConfig(BaseModel):
 default_user_markup_percent: float = 12.0
 default_reseller_markup_percent: float = 5.0
 default_vip_markup_percent: float = 3.0
 default_fixed_markup_usd: float = 0.05
 exchange_rate_khr: int = 4100
 auto_update_prices_on_sync: bool = True

class SyncLog(BaseModel):
 id: str
 provider_id: str
 provider_name: str
 sync_type: Literal['games', 'products', 'all']
 games_added: int = 0
 games_updated: int = 0
 products_added: int = 0
 products_updated: int = 0
 products_disabled: int = 0
 status: Literal['success', 'error', 'partial']
 error_message: Optional[str] = None
 started_at: Optional[str] = None
 finished_at: Optional[str] = None
 duration_ms: int = 0
 created_at: str

# --- Coupons & Promotions ---
class Coupon(BaseModel):
 id: str
 code: str
 discount_percent: Optional[float] = 10.0
 discount_amount_usd: Optional[float] = None
 min_order_usd: float = 1.0
 max_uses: int = 100
 used_count: int = 0
 valid_until: str
 is_active: bool = True
 created_at: str

class CouponCreate(BaseModel):
 code: str
 discount_type: Optional[str] = "PERCENT"
 discount_value: Optional[float] = None
 discount_percent: Optional[float] = 10.0
 discount_amount_usd: Optional[float] = None
 min_order_usd: float = 1.0
 max_discount_usd: Optional[float] = None
 max_uses: int = 100
 valid_until: Optional[str] = "2026-12-31T23:59:59Z"
 is_active: bool = True

# --- Banners & Hero Configuration ---
class QuickCard(BaseModel):
 id: str
 badge_en: str = "POPULAR"
 badge_km: str = "ពេញនិយម"
 badge_color: str = "cyan" # cyan, yellow, orange, emerald, purple
 game_slug: str = "mobile-legends"
 game_name_en: str = "Mobile Legends"
 game_name_km: str = "Mobile Legends"
 package_name_en: str = "Weekly Pass"
 package_name_km: str = "Weekly Pass"
 price_usd: float = 1.85
 price_khr: int = 7585
 target_url: str = "/games/mobile-legends"
 is_active: bool = True

class HeroBannerConfig(BaseModel):
 badge_text_en: str = "0% Fee with Bakong KHQR across all Cambodian Banks"
 badge_text_km: str = "ទូទាត់តាម Bakong KHQR មិនគិតថ្លៃសេវា 0%"
 title_en: str = "Instant Game Top-Up"
 title_km: str = "បញ្ចូលទឹកប្រាក់ហ្គេម"
 highlight_en: str = "Fast & Secure"
 highlight_km: str = "លឿនរហ័ស & សុវត្ថិភាព"
 subtitle_en: str = "Automated instant credit delivery via Bakong KHQR, ABA Mobile, Wing Bank and ACLEDA into your game account."
 subtitle_km: str = "ផ្ទេរប្រាក់តាមរយៈ Bakong KHQR, ABA Mobile, Wing Bank និង ACLEDA ចូលគណនីដោយស្វ័យប្រវត្តិ។"
 cta_primary_text_en: str = "Top Up Now (MLBB)"
 cta_primary_text_km: str = "បញ្ចូលប្រាក់ឥឡូវនេះ (MLBB)"
 cta_primary_url: str = "/games/mobile-legends"
 cta_secondary_text_en: str = "Check Order Status"
 cta_secondary_text_km: str = "ពិនិត្យស្ថានភាព"
 cta_secondary_url: str = "/order/track"
 stat_1_val_en: str = "Official"
 stat_1_val_km: str = "ផ្លូវការ"
 stat_1_label_en: str = "API Partner"
 stat_1_label_km: str = "ដៃគូផ្គត់ផ្គង់"
 stat_2_val_en: str = "< 30s"
 stat_2_val_km: str = "ក្រោម ៣០ វិនាទី"
 stat_2_label_en: str = "Instant Delivery"
 stat_2_label_km: str = "ល្បឿនបញ្ចូល"
 stat_3_val_en: str = "99.9%"
 stat_3_val_km: str = "៩៩.៩%"
 stat_3_label_en: str = "Success Rate"
 stat_3_label_km: str = "អត្រាជោគជ័យ"
 quick_cards: List[QuickCard] = []
 background_gradient: str = "from-blue-900 via-indigo-900 to-slate-900"
 background_image_url: Optional[str] = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80"
 is_active: bool = True
 updated_at: Optional[str] = None

class Banner(BaseModel):
 id: str
 title_en: str
 title_km: str
 subtitle_en: str
 subtitle_km: str
 image_url: str
 target_url: str = "/games"
 badge_en: Optional[str] = "PROMO"
 badge_km: Optional[str] = "ប្រូម៉ូសិន"
 is_active: bool = True
 sort_order: int = 0
 created_at: str

class BannerCreate(BaseModel):
 title_en: str
 title_km: str
 subtitle_en: str
 subtitle_km: str
 image_url: str
 target_url: str = "/games"
 badge_en: Optional[str] = "PROMO"
 badge_km: Optional[str] = "ប្រូម៉ូសិន"
 is_active: bool = True
 sort_order: int = 0

# --- Audit Logs & User Activity Tracker ---
class AuditLog(BaseModel):
 id: str
 admin_username: str
 admin_role: str
 action: str
 target_id: Optional[str] = None
 details: str
 ip_address: str = "127.0.0.1"
 created_at: str

class UserActivityLog(BaseModel):
 id: str
 user_id: str
 username: str
 email: Optional[str] = None
 role: str = "user"
 action: str
 action_label_km: str = "សកម្មភាព"
 action_label_en: str = "User Action"
 details: str
 target_id: Optional[str] = None
 amount_usd: Optional[float] = None
 ip_address: str = "127.0.0.1"
 user_agent: Optional[str] = "Web Browser"
 status: str = "success"
 created_at: str

# --- System Notifications ---
class SystemNotification(BaseModel):
 id: str
 title: str
 message: str
 type: Literal['info', 'warning', 'error', 'success'] = 'info'
 is_read: bool = False
 link: Optional[str] = None
 created_at: str

# --- Platform Settings ---
class PlatformSettings(BaseModel):
 platform_name: str = "RoleaTopup Core Engine"
 api_base_url: str = "http://us.apsara.lol:15511"
 support_telegram: str = "https://t.me/rolea_support"
 support_whatsapp: str = "+855 12 345 678"
 support_email: str = "support@roleatopup.com"
 exchange_rate_khr: int = 4100
 maintenance_mode: bool = False
 auto_sync_master_enabled: bool = True
 auto_sync_interval: SyncInterval = "1h"
 low_balance_alert_usd: float = 100.0
 idempotency_window_minutes: int = 60
 ai_chat_enabled: bool = True
 ai_chat_api_url: str = "https://api.laalaa.me"
 ai_chat_api_key: str = ""
 ai_chat_model: str = "gpt-4o-mini"

# --- Admin Dashboard Stats & Charts ---
class AdminDashboardStats(BaseModel):
 total_users: int
 total_resellers: int
 total_orders: int
 today_orders_count: int = 0
 success_orders: int
 failed_orders: int
 pending_orders: int
 revenue_usd: float
 webhook_secret: Optional[str] = None
 auto_sync_interval: Optional[SyncInterval] = None
 auto_sync_games: Optional[bool] = None
 auto_sync_products: Optional[bool] = None

class ProviderResponse(BaseModel):
 id: str
 name: str
 api_url: str
 api_key_masked: str
 has_secret: bool
 api_username: Optional[str] = None
 status: ProviderStatus
 priority: int
 webhook_url: Optional[str]
 auto_sync_interval: SyncInterval
 auto_sync_games: bool = True
 auto_sync_products: bool = True
 last_sync_at: Optional[str]
 last_sync_status: SyncStatus
 last_sync_error: Optional[str]
 sync_games_count: int
 sync_products_count: int
 created_at: str

# --- Pricing & Sync Log Schemas ---
class PricingConfig(BaseModel):
 default_user_markup_percent: float = 12.0
 default_reseller_markup_percent: float = 5.0
 default_vip_markup_percent: float = 3.0
 default_fixed_markup_usd: float = 0.05
 exchange_rate_khr: int = 4100
 auto_update_prices_on_sync: bool = True

class SyncLog(BaseModel):
 id: str
 provider_id: str
 provider_name: str
 sync_type: Literal['games', 'products', 'all']
 games_added: int = 0
 games_updated: int = 0
 products_added: int = 0
 products_updated: int = 0
 products_disabled: int = 0
 status: Literal['success', 'error', 'partial']
 error_message: Optional[str] = None
 started_at: Optional[str] = None
 finished_at: Optional[str] = None
 duration_ms: int = 0
 created_at: str

# --- Coupons & Promotions ---
class Coupon(BaseModel):
 id: str
 code: str
 discount_percent: Optional[float] = 10.0
 discount_amount_usd: Optional[float] = None
 min_order_usd: float = 1.0
 max_uses: int = 100
 used_count: int = 0
 valid_until: str
 is_active: bool = True
 created_at: str

class CouponCreate(BaseModel):
 code: str
 discount_type: Optional[str] = "PERCENT"
 discount_value: Optional[float] = None
 discount_percent: Optional[float] = 10.0
 discount_amount_usd: Optional[float] = None
 min_order_usd: float = 1.0
 max_discount_usd: Optional[float] = None
 max_uses: int = 100
 valid_until: Optional[str] = "2026-12-31T23:59:59Z"
 is_active: bool = True

# --- Banners & Hero Configuration ---
class QuickCard(BaseModel):
 id: str
 badge_en: str = "POPULAR"
 badge_km: str = "ពេញនិយម"
 badge_color: str = "cyan" # cyan, yellow, orange, emerald, purple
 game_slug: str = "mobile-legends"
 game_name_en: str = "Mobile Legends"
 game_name_km: str = "Mobile Legends"
 package_name_en: str = "Weekly Pass"
 package_name_km: str = "Weekly Pass"
 price_usd: float = 1.85
 price_khr: int = 7585
 target_url: str = "/games/mobile-legends"
 is_active: bool = True

class HeroBannerConfig(BaseModel):
 badge_text_en: str = "0% Fee with Bakong KHQR across all Cambodian Banks"
 badge_text_km: str = "ទូទាត់តាម Bakong KHQR មិនគិតថ្លៃសេវា 0%"
 title_en: str = "Instant Game Top-Up"
 title_km: str = "បញ្ចូលទឹកប្រាក់ហ្គេម"
 highlight_en: str = "Fast & Secure"
 highlight_km: str = "លឿនរហ័ស & សុវត្ថិភាព"
 subtitle_en: str = "Automated instant credit delivery via Bakong KHQR, ABA Mobile, Wing Bank and ACLEDA into your game account."
 subtitle_km: str = "ផ្ទេរប្រាក់តាមរយៈ Bakong KHQR, ABA Mobile, Wing Bank និង ACLEDA ចូលគណនីដោយស្វ័យប្រវត្តិ។"
 cta_primary_text_en: str = "Top Up Now (MLBB)"
 cta_primary_text_km: str = "បញ្ចូលប្រាក់ឥឡូវនេះ (MLBB)"
 cta_primary_url: str = "/games/mobile-legends"
 cta_secondary_text_en: str = "Check Order Status"
 cta_secondary_text_km: str = "ពិនិត្យស្ថានភាព"
 cta_secondary_url: str = "/order/track"
 stat_1_val_en: str = "Official"
 stat_1_val_km: str = "ផ្លូវការ"
 stat_1_label_en: str = "API Partner"
 stat_1_label_km: str = "ដៃគូផ្គត់ផ្គង់"
 stat_2_val_en: str = "< 30s"
 stat_2_val_km: str = "ក្រោម ៣០ វិនាទី"
 stat_2_label_en: str = "Instant Delivery"
 stat_2_label_km: str = "ល្បឿនបញ្ចូល"
 stat_3_val_en: str = "99.9%"
 stat_3_val_km: str = "៩៩.៩%"
 stat_3_label_en: str = "Success Rate"
 stat_3_label_km: str = "អត្រាជោគជ័យ"
 quick_cards: List[QuickCard] = []
 background_gradient: str = "from-blue-900 via-indigo-900 to-slate-900"
 background_image_url: Optional[str] = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80"
 is_active: bool = True
 updated_at: Optional[str] = None

class Banner(BaseModel):
 id: str
 title_en: str
 title_km: str
 subtitle_en: str
 subtitle_km: str
 image_url: str
 target_url: str = "/games"
 badge_en: Optional[str] = "PROMO"
 badge_km: Optional[str] = "ប្រូម៉ូសិន"
 is_active: bool = True
 sort_order: int = 0
 created_at: str

class BannerCreate(BaseModel):
 title_en: str
 title_km: str
 subtitle_en: str
 subtitle_km: str
 image_url: str
 target_url: str = "/games"
 badge_en: Optional[str] = "PROMO"
 badge_km: Optional[str] = "ប្រូម៉ូសិន"
 is_active: bool = True
 sort_order: int = 0

# --- Audit Logs ---
class AuditLog(BaseModel):
 id: str
 admin_username: str
 admin_role: str
 action: str
 target_id: Optional[str] = None
 details: str
 ip_address: str = "127.0.0.1"
 created_at: str

# --- System Notifications ---
class SystemNotification(BaseModel):
 id: str
 title: str
 message: str
 type: Literal['info', 'warning', 'error', 'success'] = 'info'
 is_read: bool = False
 link: Optional[str] = None
 created_at: str

# --- Platform Settings ---
class PlatformSettings(BaseModel):
    platform_name: str = "RoleaTopup Core Engine"
    support_telegram: str = "https://t.me/rolea_support"
    support_whatsapp: str = "+855 12 345 678"
    support_email: str = "support@roleatopup.com"
    exchange_rate_khr: int = 4100
    maintenance_mode: bool = False
    auto_sync_master_enabled: bool = True
    auto_sync_interval: SyncInterval = "1h"
    low_balance_alert_usd: float = 100.0
    idempotency_window_minutes: int = 60
    telegram_bot_token: Optional[str] = ""
    telegram_chat_id: Optional[str] = ""
    telegram_enabled: bool = True

# --- Admin Dashboard Stats & Charts ---
class AdminDashboardStats(BaseModel):
 total_users: int
 total_resellers: int
 total_orders: int
 today_orders_count: int = 0
 success_orders: int
 failed_orders: int
 pending_orders: int
 revenue_usd: float
 revenue_khr: int
 cost_usd: float = 0.0
 profit_usd: float
 today_sales_usd: float
 total_wallet_pool_usd: float
 provider_balance_pool_usd: float = 1845.50
 total_providers: int = 0
 active_providers: int = 0
 active_games_count: int = 0
 active_products_count: int = 0
 recent_orders: List[Order] = []
 recent_sync_logs: List[SyncLog] = []
 recent_audit_logs: List[AuditLog] = []
 unread_notifications_count: int = 0
 chart_daily_revenue: List[Dict[str, Any]] = []
 chart_daily_profit: List[Dict[str, Any]] = []
 chart_status_distribution: Dict[str, int] = {}
 chart_top_games: List[Dict[str, Any]] = []

# --- Gamer Verification Schemas ---
class GamerCheckRequest(BaseModel):
    game: Optional[str] = None
    game_slug: Optional[str] = None
    userId: Optional[str] = None
    user_id: Optional[str] = None
    player_id: Optional[str] = None
    zoneId: Optional[str] = ""
    zone_id: Optional[str] = ""

class GamerCheckResponse(BaseModel):
    success: bool
    verified: bool
    playerName: Optional[str] = None
    userId: Optional[str] = None
    zoneId: Optional[str] = ""
    message: Optional[str] = None
    provider: Optional[str] = None

class GamerVerificationLog(BaseModel):
    id: str
    game: str
    userId: str
    zoneId: Optional[str] = ""
    playerName: Optional[str] = None
    success: bool
    provider: str = "Default Provider"
    responseTimeMs: int = 0
    createdAt: str

class GamerVerificationSettings(BaseModel):
    enabled: bool = True
    provider_api_url: str = "https://www.vngzz2game.site/api/v1/game/check_id"
    base_api_url: str = "https://www.vngzz2game.site/api/v1"
    api_key: str = ""
    api_secret: str = ""
    request_timeout: int = 6
    cache_duration: int = 300

# --- Support Ticket Schemas ---
TicketCategory = Literal['order', 'deposit', 'account', 'general']
TicketPriority = Literal['low', 'medium', 'high', 'urgent']
TicketStatus = Literal['open', 'in_progress', 'resolved', 'closed']

class TicketMessage(BaseModel):
    id: str
    sender_role: Literal['user', 'admin', 'system']
    sender_name: str
    message: str
    attachments: List[str] = []
    reply_to: Optional[Dict[str, Any]] = None
    is_edited: Optional[bool] = False
    is_deleted: Optional[bool] = False
    created_at: str

class SupportTicket(BaseModel):
    id: str
    reference: str
    user_id: str
    username: str
    email: str
    subject: str
    category: TicketCategory = 'general'
    priority: TicketPriority = 'medium'
    status: TicketStatus = 'open'
    order_id: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    telegram_username: Optional[str] = None
    telegram_photo_url: Optional[str] = None
    channel: Optional[Literal['website', 'telegram']] = 'website'
    linked_user_id: Optional[str] = None
    linked_username: Optional[str] = None
    linked_email: Optional[str] = None
    pinned_message_id: Optional[str] = None
    messages: List[TicketMessage] = []
    created_at: str
    updated_at: str

class TicketCreateRequest(BaseModel):
    subject: str
    category: TicketCategory = 'general'
    priority: TicketPriority = 'medium'
    order_id: Optional[str] = None
    message: str
    attachments: Optional[List[str]] = []
    user_id: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    channel: Optional[Literal['website', 'telegram']] = 'website'

class TicketReplyRequest(BaseModel):
    message: str
    attachments: Optional[List[str]] = []
    sender_role: Optional[Literal['user', 'admin', 'system']] = 'admin'
    sender_name: Optional[str] = None
    reply_to: Optional[Dict[str, Any]] = None

class TicketStatusUpdateRequest(BaseModel):
    status: TicketStatus

class TelegramSupportBotConfig(BaseModel):
    enabled: bool = True
    bot_token: Optional[str] = None
    bot_username: Optional[str] = None
    webhook_url: Optional[str] = None

# --- Content Creator & Affiliate Partner Schemas ---
CreatorStatus = Literal['pending', 'approved', 'rejected']

class CreatorPartner(BaseModel):
    id: str
    user_id: str
    username: str
    email: str
    creator_code: str
    creator_name: str
    channel_link: Optional[str] = ""
    platform: Optional[Literal['tiktok', 'youtube', 'facebook', 'telegram', 'other']] = 'tiktok'
    commission_percent: float = 3.0
    discount_percent: float = 2.0
    total_referrals: int = 0
    total_sales_usd: float = 0.0
    total_earned_usd: float = 0.0
    balance_usd: float = 0.0
    status: CreatorStatus = 'pending'
    reject_reason: Optional[str] = None
    applied_at: str
    reviewed_at: Optional[str] = None

class CreatorApplyRequest(BaseModel):
    creator_code: str
    creator_name: str
    channel_link: str
    platform: Optional[Literal['tiktok', 'youtube', 'facebook', 'telegram', 'other']] = 'tiktok'
    user_id: Optional[str] = None

class CreatorStatusUpdateRequest(BaseModel):
    status: CreatorStatus
    reject_reason: Optional[str] = None
    commission_percent: Optional[float] = None
    discount_percent: Optional[float] = None

# --- Promoter System Schemas ---
PromoterStatus = Literal['pending', 'approved', 'rejected', 'suspended']

class PromoterApplication(BaseModel):
    id: str
    user_id: str
    full_name: str
    username: str
    email: str
    phone: str
    telegram_username: Optional[str] = None
    payment_method: str = "ABA Bank"
    payment_account: str
    qr_code_url: Optional[str] = None
    reason: str
    social_links: Optional[str] = ""
    avatar_url: Optional[str] = ""
    status: PromoterStatus = 'pending'
    reject_reason: Optional[str] = None
    applied_at: str
    reviewed_at: Optional[str] = None

class Promoter(BaseModel):
    id: str
    user_id: str
    full_name: str
    username: str
    email: str
    phone: str
    telegram_username: Optional[str] = None
    payment_method: str = "ABA Bank"
    payment_account: str
    qr_code_url: Optional[str] = None
    referral_code: str
    referral_link: str
    commission_rate: float = 0.3
    status: PromoterStatus = 'approved'
    total_referrals: int = 0
    total_orders: int = 0
    total_sales_usd: float = 0.0
    total_commission_usd: float = 0.0
    available_balance_usd: float = 0.0
    pending_commission_usd: float = 0.0
    withdrawn_amount_usd: float = 0.0
    created_at: str
    updated_at: str

class PromoterCommission(BaseModel):
    id: str
    promoter_id: str
    order_id: str
    order_reference: str
    customer_name: Optional[str] = "Gamer"
    order_amount_usd: float
    commission_rate: float
    commission_amount_usd: float
    status: Literal['paid', 'pending', 'cancelled'] = 'paid'
    created_at: str

class PromoterWithdrawal(BaseModel):
    id: str
    promoter_id: str
    user_id: str
    full_name: str
    amount_usd: float
    payment_method: str
    payment_account: str
    qr_code_url: Optional[str] = None
    status: Literal['pending', 'approved', 'rejected'] = 'pending'
    reject_reason: Optional[str] = None
    requested_at: str
    processed_at: Optional[str] = None

class PromoterApplyRequest(BaseModel):
    full_name: str
    phone: str
    telegram_username: Optional[str] = None
    payment_method: Optional[str] = "ABA Bank"
    payment_account: str
    qr_code_url: Optional[str] = None
    reason: str
    social_links: Optional[str] = ""
    avatar_url: Optional[str] = ""
    user_id: Optional[str] = None

class PromoterReviewRequest(BaseModel):
    status: PromoterStatus
    reject_reason: Optional[str] = None
    commission_rate: Optional[float] = None
    referral_code: Optional[str] = None

class PromoterUpdateRequest(BaseModel):
    commission_rate: Optional[float] = None
    referral_code: Optional[str] = None
    payment_account: Optional[str] = None
    qr_code_url: Optional[str] = None
    status: Optional[PromoterStatus] = None

class PromoterWithdrawRequest(BaseModel):
    amount_usd: float
    payment_method: Optional[str] = "ABA Bank"
    payment_account: str
    qr_code_url: Optional[str] = None
    user_id: Optional[str] = None

