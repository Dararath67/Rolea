from dotenv import load_dotenv
load_dotenv()
import os
import json
import re
import time
import random
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Tuple
from .models.schemas import (
    Game, ProductPackage, ProductPackageUpdate, InputFieldDef, PaymentMethod, Order, OrderCreate,
    OrderStatusUpdate, User, ResellerApiKey, WebhookSetting, Provider, ProviderCreate, ProviderUpdate,
    AdminDashboardStats, WalletTransaction, SyncLog, PricingConfig,
    Coupon, CouponCreate, Banner, BannerCreate, QuickCard, HeroBannerConfig, AuditLog, SystemNotification,
    PlatformSettings, WalletLedgerEntry, RaksmeyPayConfig, KHPayConfig, KHQRCCConfig, VngzzPaymentConfig,
    GamerVerificationLog, GamerVerificationSettings, UserActivityLog,
    SupportTicket, TicketMessage, TicketCreateRequest, TicketReplyRequest, TicketStatusUpdateRequest,
    PromoterApplication, Promoter, PromoterCommission, PromoterWithdrawal, PromoterApplyRequest,
    PromoterReviewRequest, PromoterUpdateRequest, PromoterWithdrawRequest,
    BroadcastRequest, BroadcastItem
)
from .services.auth_service import AuthService
from .services.provider_service import ProviderService
from .services.pricing_service import PricingService, EXCHANGE_RATE_KHR
from .services.sync_service import SyncService
from .services.bay2game_service import Bay2GameService
from .services.vngzz_payment_service import VngzzPaymentService
from .services.telegram_service import TelegramService

class DataStore:
    deleted_provider_ids: set = set()

    def __init__(self):
        self.games: List[Game] = self._seed_games()
        self.payment_methods: List[PaymentMethod] = self._seed_payment_methods()
        self.users: List[Dict[str, Any]] = self._seed_users()
        self.orders: List[Order] = self._seed_orders()
        self.providers: List[Provider] = self._seed_providers()
        self.api_keys: List[ResellerApiKey] = self._seed_api_keys()
        self.webhooks: List[WebhookSetting] = []
        self.wallet_txns: List[WalletTransaction] = []
        self.sync_logs: List[SyncLog] = self._seed_sync_logs()
        self.pricing_config: PricingConfig = PricingConfig()
        self.coupons: List[Coupon] = self._seed_coupons()
        self.banners: List[Banner] = self._seed_banners()
        self.hero_banner: HeroBannerConfig = self._seed_hero_banner()
        self.audit_logs: List[AuditLog] = self._seed_audit_logs()
        self.notifications: List[SystemNotification] = self._seed_notifications()
        self.settings: PlatformSettings = PlatformSettings()
        self.wallet_ledger: List[WalletLedgerEntry] = self._seed_wallet_ledger()
        self.raksmeypay_config: RaksmeyPayConfig = RaksmeyPayConfig()
        self.khpay_config: KHPayConfig = KHPayConfig()
        self.khqrcc_config: KHQRCCConfig = KHQRCCConfig()
        self.vngzz_config: VngzzPaymentConfig = VngzzPaymentConfig(api_key=os.getenv("VNGZZ_API_KEY", ""))
        self.gamer_verification_settings: GamerVerificationSettings = GamerVerificationSettings()
        self.gamer_verification_logs: List[GamerVerificationLog] = []
        self.gamer_verification_cache: Dict[str, Any] = {}
        self.pending_wallet_deposits: Dict[str, Dict[str, Any]] = {}
        self.reseller_security_configs: Dict[str, Dict[str, Any]] = {}
        self.tickets: List[SupportTicket] = []
        self.broadcasts: List[BroadcastItem] = []
        self.telegram_link_codes: Dict[str, Dict[str, Any]] = {}
        self.password_resets: List[Dict[str, Any]] = []
        self.active_primary_provider_id: str = "bay2game"
        self.provider_low_balance_threshold: float = 5.0
        self.provider_low_balance_alert_enabled: bool = True
        self.promoter_applications: List[PromoterApplication] = []
        self.promoters: List[Promoter] = []
        self.promoter_commissions: List[PromoterCommission] = []
        self.promoter_withdrawals: List[PromoterWithdrawal] = []
        self.default_promoter_commission_rate: float = 0.3
        self.load_from_disk()
        self._sync_real_packages_on_init()
        import threading
        threading.Thread(target=self._async_background_sync, daemon=True).start()
        try:
            from .services.telegram_service import TelegramService
            TelegramService.start_polling(self)
        except Exception as e:
            print(f"[TELEGRAM_POLL_ERROR] {e}")

    def save_to_disk(self):
        try:
            def _serializer(obj):
                if hasattr(obj, 'model_dump'):
                    return obj.model_dump()
                if hasattr(obj, 'dict'):
                    return obj.dict()
                if hasattr(obj, '__dict__'):
                    return obj.__dict__
                return str(obj)

            state = {
                "users": self.users,
                "orders": [o.model_dump() if hasattr(o, 'model_dump') else o for o in self.orders],
                "providers": [p.model_dump() if hasattr(p, 'model_dump') else p for p in self.providers],
                "api_keys": [k.model_dump() if hasattr(k, 'model_dump') else k for k in self.api_keys],
                "webhooks": [w.model_dump() if hasattr(w, 'model_dump') else w for w in self.webhooks],
                "wallet_txns": [t.model_dump() if hasattr(t, 'model_dump') else t for t in self.wallet_txns],
                "sync_logs": [s.model_dump() if hasattr(s, 'model_dump') else s for s in self.sync_logs],
                "pricing_config": self.pricing_config.model_dump() if hasattr(self.pricing_config, 'model_dump') else self.pricing_config,
                "coupons": [c.model_dump() if hasattr(c, 'model_dump') else c for c in self.coupons],
                "banners": [b.model_dump() if hasattr(b, 'model_dump') else b for b in self.banners],
                "hero_banner": self.hero_banner.model_dump() if hasattr(self.hero_banner, 'model_dump') else self.hero_banner,
                "audit_logs": [a.model_dump() if hasattr(a, 'model_dump') else a for a in self.audit_logs],
                "notifications": [n.model_dump() if hasattr(n, 'model_dump') else n for n in self.notifications],
                "settings": self.settings.model_dump() if hasattr(self.settings, 'model_dump') else self.settings,
                "wallet_ledger": [w.model_dump() if hasattr(w, 'model_dump') else w for w in self.wallet_ledger],
                "raksmeypay_config": self.raksmeypay_config.model_dump() if hasattr(self.raksmeypay_config, 'model_dump') else self.raksmeypay_config,
                "khpay_config": self.khpay_config.model_dump() if hasattr(self.khpay_config, 'model_dump') else self.khpay_config,
                "khqrcc_config": self.khqrcc_config.model_dump() if hasattr(self.khqrcc_config, 'model_dump') else self.khqrcc_config,
                "vngzz_config": self.vngzz_config.model_dump() if hasattr(self.vngzz_config, 'model_dump') else self.vngzz_config,
                "gamer_verification_settings": self.gamer_verification_settings.model_dump() if hasattr(self.gamer_verification_settings, 'model_dump') else self.gamer_verification_settings,
                "gamer_verification_logs": [g.model_dump() if hasattr(g, 'model_dump') else g for g in self.gamer_verification_logs],
                "reseller_security_configs": self.reseller_security_configs,
                "tickets": [t.model_dump() if hasattr(t, 'model_dump') else t for t in self.tickets],
                "broadcasts": [b.model_dump() if hasattr(b, 'model_dump') else b for b in self.broadcasts],
                "password_resets": getattr(self, "password_resets", []),
                "active_primary_provider_id": getattr(self, "active_primary_provider_id", "bay2game"),
                "provider_low_balance_threshold": getattr(self, "provider_low_balance_threshold", 5.0),
                "provider_low_balance_alert_enabled": getattr(self, "provider_low_balance_alert_enabled", True),
                "promoter_applications": [a.model_dump() if hasattr(a, 'model_dump') else a for a in getattr(self, "promoter_applications", [])],
                "promoters": [p.model_dump() if hasattr(p, 'model_dump') else p for p in getattr(self, "promoters", [])],
                "promoter_commissions": [c.model_dump() if hasattr(c, 'model_dump') else c for c in getattr(self, "promoter_commissions", [])],
                "promoter_withdrawals": [w.model_dump() if hasattr(w, 'model_dump') else w for w in getattr(self, "promoter_withdrawals", [])],
                "default_promoter_commission_rate": getattr(self, "default_promoter_commission_rate", 0.3)
            }

            file_path = os.path.join(os.path.dirname(__file__), "data_store.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2, ensure_ascii=False, default=_serializer)
        except Exception as e:
            print(f"[DATASTORE_ERROR] Failed to save state to disk: {e}")

    def load_from_disk(self):
        file_path = os.path.join(os.path.dirname(__file__), "data_store.json")
        if not os.path.exists(file_path):
            return
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if "password_resets" in data and isinstance(data["password_resets"], list):
                self.password_resets = data["password_resets"]

            if "active_primary_provider_id" in data:
                self.active_primary_provider_id = data["active_primary_provider_id"]
            if "provider_low_balance_threshold" in data:
                self.provider_low_balance_threshold = float(data["provider_low_balance_threshold"])
            if "provider_low_balance_alert_enabled" in data:
                self.provider_low_balance_alert_enabled = bool(data["provider_low_balance_alert_enabled"])
            if "default_promoter_commission_rate" in data:
                self.default_promoter_commission_rate = float(data["default_promoter_commission_rate"])

            if "promoter_applications" in data and data["promoter_applications"]:
                self.promoter_applications = [PromoterApplication(**a) if isinstance(a, dict) else a for a in data["promoter_applications"]]
            if "promoters" in data and data["promoters"]:
                self.promoters = [Promoter(**p) if isinstance(p, dict) else p for p in data["promoters"]]
            if "promoter_commissions" in data and data["promoter_commissions"]:
                self.promoter_commissions = [PromoterCommission(**c) if isinstance(c, dict) else c for c in data["promoter_commissions"]]
            if "promoter_withdrawals" in data and data["promoter_withdrawals"]:
                self.promoter_withdrawals = [PromoterWithdrawal(**w) if isinstance(w, dict) else w for w in data["promoter_withdrawals"]]

            if "users" in data and data["users"]:
                self.users = []
                for u in data["users"]:
                    if isinstance(u, dict):
                        user_obj = u.get("user")
                        if isinstance(user_obj, dict):
                            user_obj = User(**user_obj)
                        self.users.append({
                            "user": user_obj,
                            "password_hash": u.get("password_hash")
                        })
            if "games" in data and data["games"]:
                self.games = [Game(**g) if isinstance(g, dict) else g for g in data["games"]]
            if "orders" in data and data["orders"]:
                self.orders = [Order(**o) if isinstance(o, dict) else o for o in data["orders"]]
            if "providers" in data and data["providers"]:
                existing_provs = [Provider(**p) if isinstance(p, dict) else p for p in data["providers"]]
                seeded_provs = self._seed_providers()
                existing_ids = {p.id.lower() for p in existing_provs}
                for sp in seeded_provs:
                    if sp.id.lower() not in existing_ids and sp.id.lower() not in DataStore.deleted_provider_ids:
                        existing_provs.append(sp)
                self.providers = existing_provs
            if "api_keys" in data and data["api_keys"]:
                self.api_keys = [ResellerApiKey(**k) if isinstance(k, dict) else k for k in data["api_keys"]]
            if "tickets" in data and data["tickets"]:
                self.tickets = [SupportTicket(**t) if isinstance(t, dict) else t for t in data["tickets"]]
            if "wallet_ledger" in data and data["wallet_ledger"]:
                self.wallet_ledger = [WalletLedgerEntry(**w) if isinstance(w, dict) else w for w in data["wallet_ledger"]]
            if "coupons" in data and data["coupons"]:
                self.coupons = [Coupon(**c) if isinstance(c, dict) else c for c in data["coupons"]]
            if "banners" in data and data["banners"]:
                self.banners = [Banner(**b) if isinstance(b, dict) else b for b in data["banners"]]
            if "hero_banner" in data and data["hero_banner"]:
                self.hero_banner = HeroBannerConfig(**data["hero_banner"]) if isinstance(data["hero_banner"], dict) else data["hero_banner"]
            if "audit_logs" in data and data["audit_logs"]:
                self.audit_logs = [AuditLog(**a) if isinstance(a, dict) else a for a in data["audit_logs"]]
            if "notifications" in data and data["notifications"]:
                self.notifications = [SystemNotification(**n) if isinstance(n, dict) else n for n in data["notifications"]]
            if "broadcasts" in data and data["broadcasts"]:
                self.broadcasts = [BroadcastItem(**b) if isinstance(b, dict) else b for b in data["broadcasts"]]
            if "settings" in data and data["settings"]:
                self.settings = PlatformSettings(**data["settings"]) if isinstance(data["settings"], dict) else data["settings"]
            if "pricing_config" in data and data["pricing_config"]:
                self.pricing_config = PricingConfig(**data["pricing_config"]) if isinstance(data["pricing_config"], dict) else data["pricing_config"]
            if "raksmeypay_config" in data and data["raksmeypay_config"]:
                self.raksmeypay_config = RaksmeyPayConfig(**data["raksmeypay_config"]) if isinstance(data["raksmeypay_config"], dict) else data["raksmeypay_config"]
            if "khpay_config" in data and data["khpay_config"]:
                self.khpay_config = KHPayConfig(**data["khpay_config"]) if isinstance(data["khpay_config"], dict) else data["khpay_config"]
            if "khqrcc_config" in data and data["khqrcc_config"]:
                self.khqrcc_config = KHQRCCConfig(**data["khqrcc_config"]) if isinstance(data["khqrcc_config"], dict) else data["khqrcc_config"]
            if "vngzz_config" in data and data["vngzz_config"]:
                self.vngzz_config = VngzzPaymentConfig(**data["vngzz_config"]) if isinstance(data["vngzz_config"], dict) else data["vngzz_config"]
            if "gamer_verification_settings" in data and data["gamer_verification_settings"]:
                self.gamer_verification_settings = GamerVerificationSettings(**data["gamer_verification_settings"]) if isinstance(data["gamer_verification_settings"], dict) else data["gamer_verification_settings"]
            if "gamer_verification_logs" in data and data["gamer_verification_logs"]:
                self.gamer_verification_logs = [GamerVerificationLog(**g) if isinstance(g, dict) else g for g in data["gamer_verification_logs"]]
            if "reseller_security_configs" in data and data["reseller_security_configs"]:
                self.reseller_security_configs = data["reseller_security_configs"]
            print(f"[DATASTORE_INFO] Successfully restored persisted state from disk ({file_path})")
        except Exception as e:
            print(f"[DATASTORE_ERROR] Failed to load state from disk: {e}")

    def _sync_real_packages_on_init(self):
        # All 192 games and 4,832 packages are loaded in <10ms by _seed_games from bay2game_catalog.json
        pass

    def _async_background_sync(self):
        try:
            SyncService.sync_all(self)
        except Exception as e:
            print(f"[DATASTORE_WARN] Background sync error: {e}")

    def _seed_games(self) -> List[Game]:
        import json
        pricing_cfg = self.pricing_config if hasattr(self, 'pricing_config') else PricingConfig()
        
        TOP_GAMES_META = {
            'mlbb': {
                'id': 'mlbb',
                'slug': 'mlbb',
                'name_en': 'Mobile Legends Bang Bang',
                'name_km': 'Mobile Legends Bang Bang',
                'subtitle_en': 'Supports all regions and servers worldwide',
                'subtitle_km': 'បញ្ចូលពេជ្រ Mobile Legends ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'Moonton',
                'currency_name_en': 'Diamonds',
                'currency_name_km': 'ពេជ្រ',
                'is_popular': True,
                'is_hot_deal': True,
                'fields': [
                    InputFieldDef(id='user_id', label_en='User ID', label_km='User ID', placeholder_en='e.g. 12345678', placeholder_km='ឧទាហរណ៍ 12345678', required=True),
                    InputFieldDef(id='zone_id', label_en='Zone ID', label_km='Zone ID', placeholder_en='e.g. 2026', placeholder_km='ឧទាហរណ៍ 2026', required=True)
                ]
            },
            'freefire': {
                'id': 'freefire',
                'slug': 'freefire',
                'name_en': 'Free Fire',
                'name_km': 'Free Fire',
                'subtitle_en': 'Instant Diamonds top-up for Free Fire (Cambodia, MY/SG, & Global)',
                'subtitle_km': 'បញ្ចូលពេជ្រ Free Fire ស្វ័យប្រវត្តិ (គ្រប់ Server)',
                'category': 'mobile',
                'publisher': 'Garena',
                'currency_name_en': 'Diamonds',
                'currency_name_km': 'ពេជ្រ',
                'is_popular': True,
                'is_hot_deal': True,
                'fields': [
                    InputFieldDef(id='user_id', label_en='Player ID', label_km='Player ID', placeholder_en='e.g. 987654321', placeholder_km='ឧទាហរណ៍ 987654321', required=True)
                ]
            },
            'pubgm': {
                'id': 'pubg_mobile',
                'slug': 'pubg_mobile',
                'name_en': 'PUBG Mobile',
                'name_km': 'PUBG Mobile',
                'subtitle_en': 'Instant UC top-up for Global PUBG Mobile players',
                'subtitle_km': 'បញ្ចូល UC PUBG Mobile ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'Krafton / Tencent',
                'currency_name_en': 'UC',
                'currency_name_km': 'UC',
                'is_popular': True,
                'is_hot_deal': True,
                'fields': [
                    InputFieldDef(id='user_id', label_en='Character ID', label_km='Character ID', placeholder_en='e.g. 5123456789', placeholder_km='ឧទាហរណ៍ 5123456789', required=True)
                ]
            },
            'hok': {
                'id': 'hok_global',
                'slug': 'hok_global',
                'name_en': 'Honor of Kings',
                'name_km': 'Honor of Kings',
                'subtitle_en': 'Instant Tokens top-up for Honor of Kings Global',
                'subtitle_km': 'បញ្ចូល Tokens Honor of Kings ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'Level Infinite',
                'currency_name_en': 'Tokens',
                'currency_name_km': 'Tokens',
                'is_popular': True,
                'is_hot_deal': True,
                'fields': [
                    InputFieldDef(id='user_id', label_en='Player UID', label_km='Player UID', placeholder_en='e.g. 10987654321', placeholder_km='ឧទាហរណ៍ 10987654321', required=True)
                ]
            },
            'bloodstrike': {
                'id': 'bloodstrike',
                'slug': 'bloodstrike',
                'name_en': 'Blood Strike',
                'name_km': 'Blood Strike',
                'subtitle_en': 'Instant Gold & Pass top-up for Blood Strike',
                'subtitle_km': 'បញ្ចូល Gold Blood Strike ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'NetEase Games',
                'currency_name_en': 'Gold',
                'currency_name_km': 'Gold',
                'is_popular': True,
                'is_hot_deal': False,
                'fields': [
                    InputFieldDef(id='user_id', label_en='User ID', label_km='User ID', placeholder_en='e.g. 88991122', placeholder_km='ឧទាហរណ៍ 88991122', required=True)
                ]
            },
            'ROBLOX_US_CARDS': {
                'id': 'roblox',
                'slug': 'roblox',
                'name_en': 'Roblox',
                'name_km': 'Roblox',
                'subtitle_en': 'Instant Robux top-up for Roblox accounts',
                'subtitle_km': 'បញ្ចូល Robux Roblox ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'Roblox Corporation',
                'currency_name_en': 'Robux',
                'currency_name_km': 'Robux',
                'is_popular': True,
                'is_hot_deal': False,
                'fields': [
                    InputFieldDef(id='user_id', label_en='Roblox Username', label_km='Roblox Username', placeholder_en='e.g. GamerPro123', placeholder_km='ឧទាហរណ៍ GamerPro123', required=True)
                ]
            },
            'valorant_kh': {
                'id': 'valorant_kh',
                'slug': 'valorant_kh',
                'name_en': 'Valorant Cambodia',
                'name_km': 'Valorant កម្ពុជា',
                'subtitle_en': 'Instant VP top-up for Valorant players in Cambodia',
                'subtitle_km': 'បញ្ចូល VP Valorant Cambodia ស្វ័យប្រវត្តិ',
                'category': 'pc',
                'publisher': 'Riot Games',
                'currency_name_en': 'VP',
                'currency_name_km': 'VP',
                'is_popular': True,
                'is_hot_deal': True,
                'fields': [
                    InputFieldDef(id='user_id', label_en='Riot ID & Tag', label_km='Riot ID និង Tag (#)', placeholder_en='e.g. Player#KH1', placeholder_km='ឧទាហរណ៍ Player#KH1', required=True)
                ]
            },
            'wild_rift_kh': {
                'id': 'wild_rift_kh',
                'slug': 'wild_rift_kh',
                'name_en': 'League of Legends: Wild Rift Cambodia',
                'name_km': 'LoL Wild Rift កម្ពុជា',
                'subtitle_en': 'Instant Wild Cores top-up for Wild Rift players in Cambodia',
                'subtitle_km': 'បញ្ចូល Wild Cores Wild Rift Cambodia ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'Riot Games',
                'currency_name_en': 'Wild Cores',
                'currency_name_km': 'Wild Cores',
                'is_popular': True,
                'is_hot_deal': False,
                'fields': [
                    InputFieldDef(id='user_id', label_en='Riot ID & Tag', label_km='Riot ID និង Tag (#)', placeholder_en='e.g. Player#KH1', placeholder_km='ឧទាហរណ៍ Player#KH1', required=True)
                ]
            },
            'eafcmobile_kh': {
                'id': 'eafcmobile_kh',
                'slug': 'eafcmobile_kh',
                'name_en': 'EA SPORTS FC Mobile Cambodia',
                'name_km': 'EA SPORTS FC Mobile កម្ពុជា',
                'subtitle_en': 'Instant FC Points top-up for EA FC Mobile in Cambodia',
                'subtitle_km': 'បញ្ចូល FC Points EA FC Mobile Cambodia ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'Electronic Arts',
                'currency_name_en': 'FC Points',
                'currency_name_km': 'FC Points',
                'is_popular': True,
                'is_hot_deal': False,
                'fields': [
                    InputFieldDef(id='user_id', label_en='EA Player UID', label_km='EA Player UID', placeholder_en='e.g. 102938475', placeholder_km='ឧទាហរណ៍ 102938475', required=True)
                ]
            }
        }

        catalog_path = os.path.join(os.path.dirname(__file__), 'data', 'bay2game_catalog.json')
        games_dict: Dict[str, Game] = {}

        if os.path.exists(catalog_path):
            try:
                with open(catalog_path, 'r', encoding='utf-8') as f:
                    catalog_data = json.load(f)

                for item in catalog_data:
                    prods = item.get('products', [])
                    if not prods:
                        continue
                    game_code = (item.get('game_code') or '').strip()
                    if not game_code:
                        continue
                    
                    code_lower = game_code.lower()
                    top_meta = TOP_GAMES_META.get(game_code) or TOP_GAMES_META.get(code_lower)
                    game_id = top_meta['id'] if top_meta else code_lower
                    game_slug = top_meta['slug'] if top_meta else code_lower

                    top_meta = TOP_GAMES_META.get(game_slug) or TOP_GAMES_META.get(game_code) or TOP_GAMES_META.get(code_lower)
                    
                    if game_slug not in games_dict:
                        name_en = top_meta['name_en'] if top_meta else item.get('name') or game_code.replace('_', ' ').title()
                        name_km = top_meta['name_km'] if top_meta else name_en
                        subtitle_en = top_meta['subtitle_en'] if top_meta else f'Instant {name_en} top-up via Cambodian KHQR'
                        subtitle_km = top_meta['subtitle_km'] if top_meta else f'បញ្ចូលទឹកប្រាក់ {name_km} ស្វ័យប្រវត្តិ'
                        category = top_meta['category'] if top_meta else ('pc' if 'val' in code_lower or 'steam' in code_lower else 'mobile')
                        publisher = top_meta['publisher'] if top_meta else 'Official Wholesale Provider'
                        currency_en = top_meta['currency_name_en'] if top_meta else ('Diamonds' if 'diamond' in name_en.lower() or 'fire' in name_en.lower() or 'mlbb' in name_en.lower() else 'Credits')
                        currency_km = top_meta['currency_name_km'] if top_meta else ('ពេជ្រ' if currency_en == 'Diamonds' else currency_en)
                        is_pop = top_meta.get('is_popular', False) if top_meta else False
                        is_hot = top_meta.get('is_hot_deal', False) if top_meta else False
                        
                        img = item.get('image_url') or '/images/games/mlbb.png'
                        
                        if top_meta and 'fields' in top_meta:
                            fields_def = top_meta['fields']
                        else:
                            raw_fields = item.get('fields') or ['userid']
                            fields_def = []
                            for f_item in raw_fields:
                                f_clean = str(f_item).lower()
                                if 'zone' in f_clean or 'server' in f_clean:
                                    fields_def.append(InputFieldDef(id=f_clean, label_en='Zone / Server ID', label_km='Zone / Server ID', placeholder_en='e.g. 2026', placeholder_km='ឧទាហរណ៍ 2026', required=True))
                                elif 'char' in f_clean or 'role' in f_clean or 'name' in f_clean:
                                    fields_def.append(InputFieldDef(id=f_clean, label_en='Character Name', label_km='Character Name', placeholder_en='e.g. HeroPro', placeholder_km='ឧទាហរណ៍ HeroPro', required=False))
                                else:
                                    fields_def.append(InputFieldDef(id=f_clean, label_en='Player / User ID', label_km='Player / User ID', placeholder_en='e.g. 12345678', placeholder_km='ឧទាហរណ៍ 12345678', required=True))

                        is_top_game = (game_slug in TOP_GAMES_META or game_code in TOP_GAMES_META or code_lower in TOP_GAMES_META or game_id in TOP_GAMES_META)
                        sup_provs = ["bay2game", "fazercards"] if is_top_game else ["bay2game"]

                        games_dict[game_slug] = Game(
                            id=f"b2g_{game_slug}",
                            slug=game_slug,
                            name_en=name_en,
                            name_km=name_km,
                            subtitle_en=subtitle_en,
                            subtitle_km=subtitle_km,
                            category=category,
                            publisher=publisher,
                            region='Cambodia / Global',
                            thumbnail=img,
                            banner=img,
                            currency_name_en=currency_en,
                            currency_name_km=currency_km,
                            instant_delivery=True,
                            is_popular=is_pop,
                            is_hot_deal=is_hot,
                            is_active=True,
                            primary_provider_id='bay2game',
                            provider_id='bay2game',
                            provider_name='Bay2Game Wholesale API Provider',
                            supported_providers=['bay2game'],
                            fields=fields_def,
                            packages=[]
                        )

                    existing_p_codes = {p.provider_product_id for p in games_dict[game_slug].packages}
                    for p in prods:
                        p_code = str(p.get('product_code') or p.get('id'))
                        if p_code in existing_p_codes:
                            continue
                        existing_p_codes.add(p_code)

                        cost = float(p.get('sell_price') or 0.0)
                        prices = PricingService.calculate_prices_from_cost(cost, pricing_cfg)
                        p_name = str(p.get('name') or 'Package').strip()
                        if p_name.isdigit():
                            p_name = f"{p_name} Diamonds"
                        
                        bonus_en, bonus_km = None, None
                        pop = False
                        p_l = p_name.lower()
                        if 'weekly' in p_l and '2x' not in p_l and '3x' not in p_l:
                            bonus_en = 'Special Pass Rewards'
                            bonus_km = 'រង្វាន់សំបុត្រពិសេស'
                            pop = True
                        elif 'twilight' in p_l:
                            bonus_en = 'Exclusive Skin + Rewards'
                            bonus_km = 'Skin ពិសេស + រង្វាន់'
                            pop = True
                            
                        games_dict[game_slug].packages.append(ProductPackage(
                            id=f"b2g_{game_slug}_{p_code}",
                            game_slug=game_slug,
                            name_en=p_name,
                            name_km=p_name,
                            cost_usd=cost,
                            price_user_usd=prices['price_user_usd'],
                            price_reseller_usd=prices['price_reseller_usd'],
                            price_vip_usd=prices['price_vip_usd'],
                            bonus_en=bonus_en,
                            bonus_km=bonus_km,
                            popular=pop,
                            is_active=True,
                            provider_id='bay2game',
                            provider_name='Bay2Game Wholesale API Provider',
                            supported_providers=['bay2game'],
                            bay2game_product_id=p_code,
                            bay2game_cost_usd=cost,
                            provider_product_id=p_code,
                            external_product_id=p_code,
                            provider_sku=p_code
                        ))

                for g_obj in games_dict.values():
                    g_obj.packages.sort(key=lambda x: (
                        0 if 'weekly' in x.name_en.lower() and '2x' not in x.name_en.lower() and '3x' not in x.name_en.lower()
                        else 1 if 'twilight' in x.name_en.lower()
                        else 2 if 'pass' in x.name_en.lower() or 'membership' in x.name_en.lower()
                        else 10,
                        x.price_user_usd
                    ))

                games_list = list(games_dict.values())
                
                # Append FazerCards provider-isolated catalog games
                # FazerCards seed disabled
                pass

                # Prioritize popular games at front
                games_list.sort(key=lambda g: 0 if g.is_popular else 1)
            except Exception as e:
                print(f"[DATASTORE_WARN] Catalog seed error: {e}")

        return games_list

    def _seed_fazercards_games(self, pricing_cfg: Optional[PricingConfig] = None) -> List[Game]:
        if not pricing_cfg:
            pricing_cfg = self.pricing_config if hasattr(self, 'pricing_config') else PricingConfig()

        fzr_meta = [
            {
                'id': 'fzr_mlbb',
                'slug': 'mlbb',
                'name_en': 'Mobile Legends Bang Bang',
                'name_km': 'Mobile Legends Bang Bang',
                'subtitle_en': 'Instant Diamonds top-up',
                'subtitle_km': 'បញ្ចូលពេជ្រ Mobile Legends ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'Diamonds',
                'currency_name_km': 'ពេជ្រ',
                'thumbnail': '/images/games/mlbb.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='User ID', label_km='User ID', placeholder_en='e.g. 12345678', placeholder_km='ឧទាហរណ៍ 12345678', required=True),
                    InputFieldDef(id='zone_id', label_en='Zone ID', label_km='Zone ID', placeholder_en='e.g. 2026', placeholder_km='ឧទាហរណ៍ 2026', required=True)
                ],
                'offers': [
                    {'id': 'fzr_mlbb_wdp', 'name_en': 'Weekly Diamond Pass', 'name_km': 'Weekly Diamond Pass', 'cost': 1.52, 'bonus_en': '210 Total Diamonds'},
                    {'id': 'fzr_mlbb_55', 'name_en': '55 Diamonds', 'name_km': '៥៥ ពេជ្រ', 'cost': 0.74, 'bonus_en': 'Instant Topup'},
                    {'id': 'fzr_mlbb_86', 'name_en': '86 Diamonds', 'name_km': '៨៦ ពេជ្រ', 'cost': 1.15, 'bonus_en': '78 + 8 Bonus'},
                    {'id': 'fzr_mlbb_172', 'name_en': '172 Diamonds', 'name_km': '១៧២ ពេជ្រ', 'cost': 2.30, 'bonus_en': '156 + 16 Bonus'},
                    {'id': 'fzr_mlbb_257', 'name_en': '257 Diamonds', 'name_km': '២៥៧ ពេជ្រ', 'cost': 3.45, 'bonus_en': '234 + 23 Bonus'},
                    {'id': 'fzr_mlbb_706', 'name_en': '706 Diamonds', 'name_km': '៧០៦ ពេជ្រ', 'cost': 9.40, 'bonus_en': '625 + 81 Bonus'},
                    {'id': 'fzr_mlbb_2195', 'name_en': '2195 Diamonds', 'name_km': '២១៩៥ ពេជ្រ', 'cost': 28.50, 'bonus_en': '1860 + 335 Bonus'},
                ]
            },
            {
                'id': 'fzr_freefire',
                'slug': 'freefire',
                'name_en': 'Free Fire',
                'name_km': 'Free Fire',
                'subtitle_en': 'Instant Diamonds top-up',
                'subtitle_km': 'បញ្ចូលពេជ្រ Free Fire ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'Diamonds',
                'currency_name_km': 'ពេជ្រ',
                'thumbnail': '/images/games/freefire.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='Player ID', label_km='Player ID', placeholder_en='e.g. 987654321', placeholder_km='ឧទាហរណ៍ 987654321', required=True)
                ],
                'offers': [
                    {'id': 'fzr_ff_100', 'name_en': '100 Diamonds', 'name_km': '១០០ ពេជ្រ', 'cost': 0.82},
                    {'id': 'fzr_ff_210', 'name_en': '210 Diamonds', 'name_km': '២១០ ពេជ្រ', 'cost': 1.65},
                    {'id': 'fzr_ff_530', 'name_en': '530 Diamonds', 'name_km': '៥៣០ ពេជ្រ', 'cost': 4.10},
                    {'id': 'fzr_ff_1080', 'name_en': '1080 Diamonds', 'name_km': '១០៨០ ពេជ្រ', 'cost': 8.20},
                    {'id': 'fzr_ff_wpass', 'name_en': 'Weekly Membership', 'name_km': 'សមាជិកប្រចាំសប្តាហ៍', 'cost': 1.65}
                ]
            },
            {
                'id': 'fzr_pubg',
                'slug': 'pubg_mobile',
                'name_en': 'PUBG Mobile',
                'name_km': 'PUBG Mobile',
                'subtitle_en': 'Instant UC top-up',
                'subtitle_km': 'បញ្ចូល UC PUBG Mobile ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'UC',
                'currency_name_km': 'UC',
                'thumbnail': '/images/games/pubg.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='Character ID', label_km='Character ID', placeholder_en='e.g. 5123456789', placeholder_km='ឧទាហរណ៍ 5123456789', required=True)
                ],
                'offers': [
                    {'id': 'fzr_pubg_60', 'name_en': '60 UC', 'name_km': '៦០ UC', 'cost': 0.88},
                    {'id': 'fzr_pubg_325', 'name_en': '325 UC', 'name_km': '៣២៥ UC', 'cost': 4.40},
                    {'id': 'fzr_pubg_660', 'name_en': '660 UC', 'name_km': '៦៦០ UC', 'cost': 8.70},
                    {'id': 'fzr_pubg_1800', 'name_en': '1800 UC', 'name_km': '១៨០០ UC', 'cost': 23.50}
                ]
            },
            {
                'id': 'fzr_hok',
                'slug': 'hok_global',
                'name_en': 'Honor of Kings',
                'name_km': 'Honor of Kings',
                'subtitle_en': 'Instant Tokens top-up',
                'subtitle_km': 'បញ្ចូល Tokens Honor of Kings ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'Tokens',
                'currency_name_km': 'Tokens',
                'thumbnail': '/images/games/hok.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='Player UID', label_km='Player UID', placeholder_en='e.g. 10987654321', placeholder_km='ឧទាហរណ៍ 10987654321', required=True)
                ],
                'offers': [
                    {'id': 'fzr_hok_80', 'name_en': '80 Tokens', 'name_km': '៨០ Tokens', 'cost': 0.88},
                    {'id': 'fzr_hok_240', 'name_en': '240 Tokens', 'name_km': '២៤០ Tokens', 'cost': 2.60},
                    {'id': 'fzr_hok_400', 'name_en': '400 Tokens', 'name_km': '៤០០ Tokens', 'cost': 4.30},
                    {'id': 'fzr_hok_1200', 'name_en': '1200 Tokens', 'name_km': '១២០០ Tokens', 'cost': 12.20}
                ]
            },
            {
                'id': 'fzr_valorant',
                'slug': 'valorant_kh',
                'name_en': 'Valorant Cambodia',
                'name_km': 'Valorant Cambodia',
                'subtitle_en': 'Instant VP top-up',
                'subtitle_km': 'បញ្ចូល VP Valorant Cambodia ស្វ័យប្រវត្តិ',
                'category': 'pc',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'VP',
                'currency_name_km': 'VP',
                'thumbnail': '/images/games/valorant.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='Riot ID & Tag', label_km='Riot ID និង Tag (#)', placeholder_en='e.g. Player#KH1', placeholder_km='ឧទាហរណ៍ Player#KH1', required=True)
                ],
                'offers': [
                    {'id': 'fzr_val_475', 'name_en': '475 VP', 'name_km': '៤៧៥ VP', 'cost': 4.30},
                    {'id': 'fzr_val_1000', 'name_en': '1000 VP', 'name_km': '១០០០ VP', 'cost': 8.60},
                    {'id': 'fzr_val_2050', 'name_en': '2050 VP', 'name_km': '២០៥០ VP', 'cost': 17.20}
                ]
            },
            {
                'id': 'fzr_bloodstrike',
                'slug': 'bloodstrike',
                'name_en': 'Blood Strike',
                'name_km': 'Blood Strike',
                'subtitle_en': 'Instant Gold top-up',
                'subtitle_km': 'បញ្ចូល Gold Blood Strike ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'Gold',
                'currency_name_km': 'Gold',
                'thumbnail': '/images/games/bloodstrike.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='User ID', label_km='User ID', placeholder_en='e.g. 88991122', placeholder_km='ឧទាហរណ៍ 88991122', required=True)
                ],
                'offers': [
                    {'id': 'fzr_bs_100', 'name_en': '100 Gold', 'name_km': '១០០ Gold', 'cost': 0.88},
                    {'id': 'fzr_bs_500', 'name_en': '500 Gold', 'name_km': '៥០០ Gold', 'cost': 4.30},
                    {'id': 'fzr_bs_1000', 'name_en': '1000 Gold', 'name_km': '១០០០ Gold', 'cost': 8.60}
                ]
            },
            {
                'id': 'fzr_eafc',
                'slug': 'eafcmobile_kh',
                'name_en': 'EA SPORTS FC Mobile',
                'name_km': 'EA SPORTS FC Mobile',
                'subtitle_en': 'Instant FC Points top-up',
                'subtitle_km': 'បញ្ចូល FC Points EA FC Mobile ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'FC Points',
                'currency_name_km': 'FC Points',
                'thumbnail': '/images/games/fcmobile.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='EA Player UID', label_km='EA Player UID', placeholder_en='e.g. 102938475', placeholder_km='ឧទាហរណ៍ 102938475', required=True)
                ],
                'offers': [
                    {'id': 'fzr_eafc_100', 'name_en': '100 FC Points', 'name_km': '១០០ FC Points', 'cost': 0.88},
                    {'id': 'fzr_eafc_500', 'name_en': '500 FC Points', 'name_km': '៥០០ FC Points', 'cost': 4.30},
                    {'id': 'fzr_eafc_1050', 'name_en': '1050 FC Points', 'name_km': '១០៥០ FC Points', 'cost': 8.60}
                ]
            },
            {
                'id': 'fzr_roblox',
                'slug': 'roblox',
                'name_en': 'Roblox',
                'name_km': 'Roblox',
                'subtitle_en': 'Instant Robux top-up',
                'subtitle_km': 'បញ្ចូល Robux Roblox ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'Robux',
                'currency_name_km': 'Robux',
                'thumbnail': '/images/games/roblox.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='Roblox Username', label_km='Roblox Username', placeholder_en='e.g. GamerPro123', placeholder_km='ឧទាហរណ៍ GamerPro123', required=True)
                ],
                'offers': [
                    {'id': 'fzr_rblx_800', 'name_en': '800 Robux', 'name_km': '៨០០ Robux', 'cost': 8.60},
                    {'id': 'fzr_rblx_2000', 'name_en': '2000 Robux', 'name_km': '២០០០ Robux', 'cost': 21.50}
                ]
            },
            {
                'id': 'fzr_genshin',
                'slug': 'genshin_global',
                'name_en': 'Genshin Impact',
                'name_km': 'Genshin Impact',
                'subtitle_en': 'Instant Crystals top-up',
                'subtitle_km': 'បញ្ចូល Crystals Genshin Impact ស្វ័យប្រវត្តិ',
                'category': 'mobile',
                'publisher': 'FazerCards Reseller API',
                'currency_name_en': 'Crystals',
                'currency_name_km': 'Crystals',
                'thumbnail': '/images/games/genshin.png',
                'fields': [
                    InputFieldDef(id='user_id', label_en='Genshin UID', label_km='Genshin UID', placeholder_en='e.g. 812345678', placeholder_km='ឧទាហរណ៍ 812345678', required=True)
                ],
                'offers': [
                    {'id': 'fzr_gi_welkin', 'name_en': 'Blessing of the Welkin Moon', 'name_km': 'Blessing of the Welkin Moon', 'cost': 4.30},
                    {'id': 'fzr_gi_330', 'name_en': '330 Genesis Crystals', 'name_km': '៣៣០ Crystals', 'cost': 4.30},
                    {'id': 'fzr_gi_1090', 'name_en': '1090 Genesis Crystals', 'name_km': '១០៩០ Crystals', 'cost': 12.90}
                ]
            }
        ]

        fzr_games = []
        for gm in fzr_meta:
            pkgs = []
            for off in gm['offers']:
                c = float(off['cost'])
                pr = PricingService.calculate_prices_from_cost(c, pricing_cfg)
                pkgs.append(ProductPackage(
                    id=off['id'],
                    game_slug=gm['slug'],
                    name_en=off['name_en'],
                    name_km=off['name_km'],
                    cost_usd=c,
                    price_user_usd=pr['price_user_usd'],
                    price_reseller_usd=pr['price_reseller_usd'],
                    price_vip_usd=pr['price_vip_usd'],
                    bonus_en=off.get('bonus_en'),
                    popular=True,
                    is_active=True,
                    provider_id='fazercards',
                    provider_name='FazerCards Wholesale API Provider',
                    supported_providers=['fazercards'],
                    fazercards_product_id=off['id'],
                    fazercards_cost_usd=c,
                    provider_product_id=off['id'],
                    external_product_id=off['id']
                ))

            fzr_games.append(Game(
                id=gm['id'],
                slug=gm['slug'],
                name_en=gm['name_en'],
                name_km=gm['name_km'],
                subtitle_en=gm['subtitle_en'],
                subtitle_km=gm['subtitle_km'],
                category=gm['category'],
                publisher=gm['publisher'],
                region='Global / SEA',
                thumbnail=gm['thumbnail'],
                banner=gm['thumbnail'],
                currency_name_en=gm['currency_name_en'],
                currency_name_km=gm['currency_name_km'],
                instant_delivery=True,
                is_popular=True,
                is_hot_deal=True,
                is_active=True,
                primary_provider_id='fazercards',
                provider_id='fazercards',
                provider_name='FazerCards Wholesale API Provider',
                supported_providers=['fazercards'],
                fields=gm['fields'],
                packages=pkgs
            ))

        return fzr_games



    def _seed_payment_methods(self) -> List[PaymentMethod]:
        return [
            PaymentMethod(
                id="vngzz2game",
                name_en="Bakong KHQR (ABA & All Banks)",
                name_km="Bakong KHQR (ABA & គ្រប់ធនាគារ)",
                category="khqr",
                icon="",
                fee_percent=0.0,
                fee_fixed_usd=0.0,
                account_name="Rothz Payment",
                account_number="ABA PayWay KHQR Gateway",
                badge_en="AUTO KHQR (24/7)",
                badge_km="KHQR ស្វ័យប្រវត្តិ 24/7",
                is_active=True,
                profile_id="vngzz_gateway",
                profile_key=""
            ),
            PaymentMethod(
                id="wallet",
                name_en="Rolea Wallet Balance",
                name_km="សមតុល្យកាបូបលុយ Rolea Wallet",
                category="wallet",
                icon="",
                fee_percent=0.0,
                fee_fixed_usd=0.0,
                account_name="Rolea Account Wallet",
                account_number="User Internal Balance",
                badge_en="1-CLICK INSTANT",
                badge_km="ទូទាត់រហ័ស 1-Click",
                is_active=True
            )
        ]

    def _seed_users(self) -> List[Dict[str, Any]]:
        return [
            {
                "user": User(
                    id="usr-admin",
                    username="admin",
                    email="rathadararath8@gmail.com",
                    phone="069919185",
                    role="admin",
                    wallet_usd=5000.0,
                    is_active=True,
                    password_plain="069919185RothZ",
                    created_at=datetime.now(timezone.utc).isoformat()
                ),
                "password_hash": AuthService.hash_password("069919185RothZ"),
                "plain_password": "069919185RothZ",
                "password_plain": "069919185RothZ"
            }
        ]

    def _seed_api_keys(self) -> List[ResellerApiKey]:
        return []

    def _seed_providers(self) -> List[Provider]:
        now_iso = datetime.now(timezone.utc).isoformat()
        all_provs = [
            Provider(
                id="bay2game",
                name="Bay2Game Wholesale API Provider",
                api_url="https://api.bay2game.xyz/api",
                api_key="33CD2DC54F1C05AC9F0B1FF0",
                secret="",
                api_username="RoleaToP_bot",
                status="active",
                priority=1,
                webhook_url="/api/v1/webhooks/provider/bay2game",
                webhook_secret="whsec_bay2game_33cd",
                auto_sync_interval="1h",
                last_sync_at=now_iso,
                last_sync_status="success",
                sync_games_count=208,
                sync_products_count=500,
                created_at=(datetime.now(timezone.utc) - timedelta(days=15)).isoformat()
            )
        ]
        return [p for p in all_provs if p.id.lower() not in DataStore.deleted_provider_ids]

    def _seed_sync_logs(self) -> List[SyncLog]:
        return []

    def _seed_orders(self) -> List[Order]:
        return []

    def switch_active_provider(self, provider_id: str) -> Dict[str, Any]:
        p_id = provider_id.lower().strip()
        if p_id not in ["bay2game", "fazercards"]:
            return {"success": False, "message": "Invalid provider ID"}

        self.active_primary_provider_id = p_id
        pricing_cfg = self.pricing_config if hasattr(self, 'pricing_config') else None

        # Update costs and retail prices for packages without altering game provider identity
        for g in self.games:
            for pkg in g.packages:
                b2g_c = getattr(pkg, 'bay2game_cost_usd', None) or pkg.cost_usd or 1.0
                fzr_c = getattr(pkg, 'fazercards_cost_usd', None) or round(b2g_c * 0.96, 2)
                pkg.bay2game_cost_usd = b2g_c
                pkg.fazercards_cost_usd = fzr_c

                if p_id == "fazercards":
                    pkg.cost_usd = fzr_c
                else: # "bay2game"
                    pkg.cost_usd = b2g_c

                # Dynamic price recalculation based on active provider cost
                if not getattr(pkg, 'manual_price_override', False):
                    new_pr = PricingService.calculate_prices_from_cost(
                        pkg.cost_usd,
                        config=pricing_cfg,
                        custom_markup_percent=getattr(pkg, 'markup_percent', None),
                        custom_fixed_markup_usd=getattr(pkg, 'fixed_markup_usd', None)
                    )
                    pkg.price_user_usd = new_pr["price_user_usd"]
                    pkg.price_reseller_usd = new_pr["price_reseller_usd"]
                    pkg.price_vip_usd = new_pr["price_vip_usd"]

        self.save_to_disk()

        # Trigger async sync to pull active provider catalog
        try:
            import threading
            def _bg_sync():
                try:
                    SyncService.sync_products(p_id, self)
                except Exception as e:
                    print(f"[PROVIDER_SWITCH_WARN] Sync error for {p_id}: {e}")
            threading.Thread(target=_bg_sync, daemon=True).start()
        except Exception:
            pass

        return {
            "success": True,
            "active_provider_id": p_id,
            "message": f"Successfully switched active API provider to {p_id.upper()}."
        }

    # Game Operations
    def get_games(self, category: Optional[str] = None, search: Optional[str] = None, provider_id: Optional[str] = None, active_only: bool = True) -> List[Game]:
        active_prov_map = {p.id.lower(): p for p in self.providers if p.status == "active"}
        
        # Determine target provider filter
        if provider_id and provider_id != "all":
            target_prov = provider_id.lower().strip()
        else:
            target_prov = (getattr(self, "active_primary_provider_id", "bay2game") or "bay2game").lower().strip()

        # Check if target provider is active
        if active_only and target_prov not in active_prov_map:
            return []

        # Filter games STRICTLY by provider_id
        games_source = [
            g for g in self.games 
            if (getattr(g, 'provider_id', None) or getattr(g, 'primary_provider_id', None) or '').lower() == target_prov
        ]

        if active_only:
            games_source = [g for g in games_source if g.is_active]

        if category and category != "all":
            games_source = [g for g in games_source if g.category == category]

        if search:
            q = search.lower()
            games_source = [
                g for g in games_source if (
                    q in g.name_en.lower() or
                    q in g.name_km.lower() or
                    q in g.publisher.lower() or
                    q in g.slug.lower()
                )
            ]

        filtered_games = []
        for g in games_source:
            g_dict = g.model_dump()
            g_dict["primary_provider_id"] = target_prov
            g_dict["provider_id"] = target_prov
            pkgs = []
            for p in g_dict.get("packages", []):
                if active_only and (not p.get("is_active", True) or p.get("is_hidden", False)):
                    continue

                p_prov = (p.get("provider_id") or target_prov).lower()
                if p_prov != target_prov:
                    continue

                if not p.get("manual_price_override"):
                    cost = float(p.get("cost_usd") or 1.0)
                    new_pr = PricingService.calculate_prices_from_cost(
                        cost,
                        config=self.pricing_config if hasattr(self, 'pricing_config') else None,
                        custom_markup_percent=p.get("markup_percent"),
                        custom_fixed_markup_usd=p.get("fixed_markup_usd")
                    )
                    p["price_user_usd"] = new_pr["price_user_usd"]
                    p["price_reseller_usd"] = new_pr["price_reseller_usd"]
                    p["price_vip_usd"] = new_pr["price_vip_usd"]

                pkgs.append(p)

            if active_only and len(pkgs) == 0:
                continue

            g_dict["packages"] = pkgs
            filtered_games.append(Game(**g_dict))

        return filtered_games

    def get_game_by_slug(self, slug: str, provider_id: Optional[str] = None, active_only: bool = True) -> Optional[Game]:
        s_clean = slug.replace("-", "_").lower().strip()
        target_prov = (provider_id or getattr(self, "active_primary_provider_id", "bay2game") or "bay2game").lower().strip()

        # Check provider status
        prov_obj = self.get_provider(target_prov)
        if active_only and (not prov_obj or prov_obj.status != "active"):
            return None

        target = None
        for g in self.games:
            g_p = (getattr(g, 'provider_id', None) or getattr(g, 'primary_provider_id', None) or '').lower()
            if g_p == target_prov and (g.slug.lower() == s_clean or g.id.lower() == s_clean):
                target = g
                break

        if not target:
            for g in self.games:
                g_p = (getattr(g, 'provider_id', None) or getattr(g, 'primary_provider_id', None) or '').lower()
                if g_p == target_prov and (s_clean in g.slug.lower() or g.slug.lower() in s_clean):
                    target = g
                    break

        if not target:
            return None

        if active_only and not target.is_active:
            return None

        g_dict = target.model_dump()
        g_dict["primary_provider_id"] = target_prov
        g_dict["provider_id"] = target_prov
        pkgs = []
        for p in g_dict.get("packages", []):
            if active_only and (not p.get("is_active", True) or p.get("is_hidden", False)):
                continue
            if (p.get("provider_id") or target_prov).lower() != target_prov:
                continue

            if not p.get("manual_price_override"):
                cost = float(p.get("cost_usd") or 1.0)
                new_pr = PricingService.calculate_prices_from_cost(
                    cost,
                    config=self.pricing_config if hasattr(self, 'pricing_config') else None,
                    custom_markup_percent=p.get("markup_percent"),
                    custom_fixed_markup_usd=p.get("fixed_markup_usd")
                )
                p["price_user_usd"] = new_pr["price_user_usd"]
                p["price_reseller_usd"] = new_pr["price_reseller_usd"]
                p["price_vip_usd"] = new_pr["price_vip_usd"]

            pkgs.append(p)

        if active_only and len(pkgs) == 0:
            return None

        g_dict["packages"] = pkgs
        return Game(**g_dict)

    def toggle_game_publishing(self, game_id: str) -> Optional[Game]:
        for g in self.games:
            if (g.id == game_id or g.slug == game_id or 
                getattr(g, 'external_game_id', None) == game_id or 
                getattr(g, 'provider_game_id', None) == game_id):
                g.is_active = not g.is_active
                status_str = "ON (Published)" if g.is_active else "OFF (Unpublished)"
                self.log_audit("admin", "manager", "TOGGLE_GAME_PUBLISHING", g.id, f"Set game {g.name_en} to {status_str}")
                return g
        return None

    def toggle_product_publishing(self, product_id: str, game_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
        for g in self.games:
            if not game_slug or g.slug == game_slug or g.id == game_slug:
                for pkg in g.packages:
                    if pkg.id == product_id or pkg.provider_product_id == product_id or getattr(pkg, 'external_product_id', None) == product_id:
                        pkg.is_active = not pkg.is_active
                        status_str = "ON (Published)" if pkg.is_active else "OFF (Unpublished)"
                        self.log_audit("admin", "manager", "TOGGLE_PRODUCT_PUBLISHING", pkg.id, f"Set product {pkg.name_en} ({g.name_en}) to {status_str}")
                        return {
                            "id": pkg.id,
                            "game_slug": g.slug,
                            "game_name_en": g.name_en,
                            "name_en": pkg.name_en,
                            "is_active": pkg.is_active,
                            "package": pkg
                        }
        return None

    def _ensure_game_packages(self, g: Game) -> List[ProductPackage]:
        return g.packages

    def get_connected_api_games(self, provider_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        result = []
        for g in self.games:
            p_id = (getattr(g, 'provider_id', None) or getattr(g, 'primary_provider_id', None) or 'bay2game').lower()
            provider_obj = self.get_provider(p_id) or self.get_provider("bay2game")

            if provider_id and provider_id != "all":
                matched_id = provider_obj.id.lower() if provider_obj else p_id
                if matched_id != provider_id.lower() and provider_id.lower() != "bay2game":
                    continue

            if status == "on" and not g.is_active:
                continue
            if status == "off" and g.is_active:
                continue

            active_pkgs = len([p for p in g.packages if p.is_active])
            total_pkgs = len(g.packages)

            ext_id = getattr(g, 'external_game_id', None) or getattr(g, 'provider_game_id', None) or g.id

            result.append({
                "id": g.id,
                "slug": g.slug,
                "name_en": g.name_en,
                "name_km": g.name_km,
                "subtitle_en": g.subtitle_en,
                "subtitle_km": g.subtitle_km,
                "category": g.category,
                "publisher": g.publisher,
                "thumbnail": g.thumbnail,
                "banner": g.banner,
                "provider_id": provider_obj.id if provider_obj else p_id,
                "provider_name": provider_obj.name if provider_obj else "Wholesale API Provider",
                "external_game_id": ext_id,
                "is_active": g.is_active,
                "published": g.is_active,
                "products_count": total_pkgs,
                "active_products_count": active_pkgs,
                "packages": g.packages
            })
        return result

    def save_game(self, game: Game) -> Game:
        for idx, g in enumerate(self.games):
            if g.id == game.id or g.slug == game.slug:
                self.games[idx] = game
                return game
        self.games.append(game)
        return game

    def delete_game(self, game_id: str) -> bool:
        initial_len = len(self.games)
        self.games = [g for g in self.games if g.id != game_id and g.slug != game_id]
        return len(self.games) < initial_len

    # Order Operations
    def get_orders(self, query: Optional[str] = None, status: Optional[str] = None, user_id: Optional[str] = None) -> List[Order]:
        orders = list(self.orders)
        if user_id:
            orders = [o for o in orders if o.user_id == user_id]
        if status and status != "all":
            orders = [o for o in orders if o.status == status]
        if query:
            q = query.lower()
            orders = [
                o for o in orders if (
                    q in o.id.lower() or
                    q in o.reference.lower() or
                    q in o.player_id.lower() or
                    q in o.customer_contact.lower() or
                    q in o.game_name_en.lower() or
                    q in o.game_name_km.lower()
                )
            ]
        return sorted(orders, key=lambda x: x.created_at, reverse=True)

    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        for o in self.orders:
            if o.id.lower() == order_id.lower() or o.reference.lower() == order_id.lower():
                return o
        return None

    def delete_order(self, order_id: str) -> bool:
        initial_len = len(self.orders)
        self.orders = [o for o in self.orders if o.id.lower() != order_id.lower() and o.reference.lower() != order_id.lower()]
        deleted = len(self.orders) < initial_len
        if deleted:
            self.log_audit("admin", "super_admin", "DELETE_ORDER", order_id, f"Deleted order {order_id}")
        return deleted

    def clear_all_orders(self) -> int:
        count = len(self.orders)
        self.orders = []
        self.log_audit("admin", "super_admin", "CLEAR_ALL_ORDERS", "orders", f"Cleared {count} orders from database")
        return count

    def create_order(self, data: OrderCreate, role: str = "user") -> Order:
        game = self.get_game_by_slug(data.game_slug)
        if not game:
            raise ValueError("Game not found")

        package = next((
            p for p in game.packages 
            if str(p.id) == str(data.product_id) 
            or str(getattr(p, 'provider_sku', '')) == str(data.product_id) 
            or str(getattr(p, 'provider_product_id', '')) == str(data.product_id)
        ), game.packages[0] if game.packages else None)

        if not package:
            raise ValueError("Product package not found")

        amount_usd = PricingService.get_price(package, role=role, currency="USD")
        
        # Apply coupon code if valid
        if data.coupon_code:
            c_code = data.coupon_code.strip().upper()
            found_coup = next((c for c in self.coupons if c.code.upper() == c_code and c.is_active), None)
            if found_coup and (found_coup.min_order_usd <= 0 or amount_usd >= found_coup.min_order_usd):
                discount_amt = round(amount_usd * (found_coup.discount_percent / 100.0), 2)
                amount_usd = round(max(0.0, amount_usd - discount_amt), 2)
                found_coup.used_count += 1

        amount_khr = PricingService.usd_to_khr(amount_usd)

        pay_method = next((m for m in self.payment_methods if m.id == data.payment_method_id), None)
        pay_name = pay_method.name_en if pay_method else data.payment_method_id

        order_num = random.randint(10000, 99999)
        order_id = f"RT-{order_num}"
        ref = data.reference or f"REF-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.now(timezone.utc).isoformat()

        status: str = "pending"
        delivery_code = None

        if data.payment_method_id == "wallet":
            target_user_id = data.user_id or "usr-gamer-1"
            user_entry = self.get_user_entry_by_id(target_user_id)
            if not user_entry:
                user_entry = self.get_user_entry_by_username_or_email(target_user_id)
            if not user_entry and self.users:
                user_entry = self.users[0]

            if user_entry:
                u = user_entry["user"]
                if u.wallet_usd < amount_usd:
                    raise ValueError(f"សមតុល្យកាបូបលុយមិនគ្រប់គ្រាន់ (Insufficient wallet balance: ${u.wallet_usd:.2f} / Required: ${amount_usd:.2f})")

                u.wallet_usd = round(u.wallet_usd - amount_usd, 2)
                txn_id = f"WTXN-{uuid.uuid4().hex[:8].upper()}"
                self.wallet_txns.append(WalletTransaction(
                    id=txn_id,
                    user_id=u.id,
                    amount_usd=-amount_usd,
                    balance_after_usd=u.wallet_usd,
                    type="topup_payment",
                    description=f"1-Click Top-Up: {game.name_en} - {package.name_en} (Player: {data.player_id})",
                    reference=ref,
                    created_at=now_str
                ))
                self.wallet_ledger.append(WalletLedgerEntry(
                    id=f"WLDG-{uuid.uuid4().hex[:8].upper()}",
                    user_id=u.id,
                    username=u.username,
                    amount_usd=-amount_usd,
                    balance_after_usd=u.wallet_usd,
                    type="debit",
                    note=f"Top-Up: {game.name_en} ({package.name_en})",
                    reference=ref,
                    created_at=now_str
                ))
                status = "processing"

        # Resolve user_id: check data.user_id -> find user by contact -> assign guest ID
        assigned_user_id = data.user_id
        if not assigned_user_id and data.customer_contact:
            matched_u = self.find_user_entry(data.customer_contact)
            if matched_u:
                assigned_user_id = matched_u["user"].id

        if not assigned_user_id:
            assigned_user_id = f"gst-{uuid.uuid4().hex[:6]}"

        resolved_promoter_id = data.promoter_id
        resolved_ref_code = data.referral_code
        if resolved_ref_code and not resolved_promoter_id:
            promoter = self.get_promoter_by_code(resolved_ref_code)
            if promoter:
                resolved_promoter_id = promoter.id

        new_order = Order(
            id=order_id,
            reference=ref,
            user_id=assigned_user_id,
            game_slug=game.slug,
            game_name_en=game.name_en,
            game_name_km=game.name_km,
            product_id=package.id,
            product_name_en=package.name_en,
            product_name_km=package.name_km,
            player_id=data.player_id,
            server_id=data.server_id or "",
            amount_usd=amount_usd,
            amount_khr=amount_khr,
            currency=data.currency,
            payment_method_id=data.payment_method_id,
            payment_method_name=pay_name,
            status=status,
            payment_status="paid" if data.payment_method_id == "wallet" else "unpaid",
            provider_id=getattr(package, 'provider_id', None) or getattr(game, 'provider_id', None) or getattr(self, "active_primary_provider_id", "bay2game"),
            provider_order_id=f"ORD-TXN-{int(time.time())}",
            delivery_code=delivery_code,
            customer_contact=data.customer_contact or "",
            referral_code=resolved_ref_code,
            promoter_id=resolved_promoter_id,
            created_at=now_str,
            updated_at=now_str
        )

        if data.payment_method_id == "wallet":
            try:
                success, processed_order = ProviderService.process_order_auto_fulfillment(
                    order=new_order,
                    data_store=self
                )
                new_order.status = getattr(processed_order, 'status', new_order.status)
                new_order.delivery_code = getattr(processed_order, 'delivery_code', new_order.delivery_code)
                new_order.error_message = getattr(processed_order, 'error_message', new_order.error_message)
            except Exception as e:
                print(f"[WALLET_TOPUP_WARN] Provider execution error: {e}")

        self.orders.insert(0, new_order)

        if new_order.status == "success":
            try:
                self.process_order_promoter_commission(new_order)
            except Exception as e:
                print(f"[PROMOTER_COMMISSION_WARN] {e}")

        try:
            self.log_user_activity(
                user_id=new_order.user_id,
                username=getattr(new_order, 'customer_name', None) or new_order.customer_contact or "Gamer",
                email=new_order.customer_contact,
                action="CREATE_ORDER",
                details=f"Top-Up Order #{new_order.id} (${new_order.amount_usd:.2f}) for {game.name_en} ({package.name_en})",
                target_id=new_order.id,
                amount_usd=new_order.amount_usd
            )
        except Exception as e:
            print(f"[ACTIVITY_LOG_WARN] Order activity log error: {e}")

        try:
            TelegramService.notify_new_order(new_order, amount_usd, amount_khr, data.coupon_code)
        except Exception as e:
            print(f"[TELEGRAM_WARN] Failed to dispatch new order notification: {e}")
        return new_order

    def update_order_status(self, order_id: str, update: OrderStatusUpdate) -> Optional[Order]:
        for idx, o in enumerate(self.orders):
            if o.id.lower() == order_id.lower():
                d = o.model_dump()
                d["status"] = update.status
                if update.status in ["success", "completed", "processing"]:
                    d["payment_status"] = "paid"
                elif update.status == "refunded":
                    d["payment_status"] = "refunded"

                if update.delivery_code:
                    d["delivery_code"] = update.delivery_code
                if update.error_message:
                    d["error_message"] = update.error_message
                if update.slip_image:
                    d["slip_image"] = update.slip_image
                d["updated_at"] = datetime.now(timezone.utc).isoformat()
                
                if update.status == "success" and not d.get("delivery_code"):
                    d["delivery_code"] = f"DELIVERED-{uuid.uuid4().hex[:8].upper()}"

                updated_order = Order(**d)
                self.orders[idx] = updated_order

                if updated_order.status == "success":
                    try:
                        self.process_order_promoter_commission(updated_order)
                    except Exception as e:
                        print(f"[PROMOTER_COMMISSION_WARN] {e}")
                    try:
                        TelegramService.notify_order_delivered(updated_order, updated_order.delivery_code)
                        TelegramService.deliver_customer_digital_receipt(updated_order, updated_order.delivery_code)
                    except Exception as e:
                        print(f"[TELEGRAM_WARN] Failed to dispatch delivery notification: {e}")

                return updated_order
        return None

    # Reseller Operations
    def get_api_key(self, api_key: str) -> Optional[ResellerApiKey]:
        for k in self.api_keys:
            if k.api_key == api_key and k.is_active:
                return k
        return None

    def get_user_api_keys(self, user_id: str) -> List[ResellerApiKey]:
        return [k for k in self.api_keys if k.user_id == user_id]

    def create_api_key(self, user_id: str, label: str, ip_whitelist: List[str] = []) -> ResellerApiKey:
        new_key = ResellerApiKey(
            id=f"key-{uuid.uuid4().hex[:6]}",
            user_id=user_id,
            api_key=f"rt_live_kh_{uuid.uuid4().hex[:16]}",
            secret_key_preview=f"sec_live_{uuid.uuid4().hex[:4]}...{uuid.uuid4().hex[-4:]}",
            label=label,
            ip_whitelist=ip_whitelist if isinstance(ip_whitelist, list) else [],
            is_active=True,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self.api_keys.append(new_key)
        self.save_to_disk()
        return new_key

    def revoke_api_key(self, user_id: str, key_id: str) -> bool:
        for k in self.api_keys:
            if k.id == key_id and (k.user_id == user_id or user_id == "usr-admin"):
                k.is_active = False
                self.save_to_disk()
                return True
        return False

    # User Operations
    def get_user_entry_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        for u in self.users:
            user = u["user"]
            u_id = user.id if isinstance(user, User) else (user.get("id") if isinstance(user, dict) else None)
            if u_id == user_id:
                return u
        return None

    def find_user_entry(self, identifier: Optional[str]) -> Optional[Dict[str, Any]]:
        if not identifier:
            return None
        ident = str(identifier).strip().lower()
        if not ident:
            return None
            
        ident_phone = ident.replace(" ", "").replace("-", "").replace("+855", "0")
        
        for u in self.users:
            user = u["user"]
            if isinstance(user, User):
                u_id = (user.id or "").lower()
                u_name = (user.username or "").lower()
                u_email = (user.email or "").lower()
                raw_phone = (user.phone or "").lower()
            elif isinstance(user, dict):
                u_id = (user.get("id") or "").lower()
                u_name = (user.get("username") or "").lower()
                u_email = (user.get("email") or "").lower()
                raw_phone = (user.get("phone") or "").lower()
            else:
                continue

            u_phone = raw_phone.replace(" ", "").replace("-", "").replace("+855", "0")

            if ident in [u_id, u_name, u_email, raw_phone]:
                return u
            if u_phone and ident_phone and (ident_phone == u_phone):
                return u
            if "@" in ident and u_email and ident == u_email:
                return u

        return None

    def get_user_entry_by_username_or_email(self, identifier: str) -> Optional[Dict[str, Any]]:
        return self.find_user_entry(identifier)

    def register_user(self, username: str, email: str, password: str, phone: Optional[str] = None, role: str = "user", referral_code: Optional[str] = None) -> User:
        user_id = f"usr-{uuid.uuid4().hex[:8]}"
        is_reseller = (role == "reseller")
        
        ref_code_clean = referral_code.strip().upper() if referral_code else None
        ref_promoter = None
        if ref_code_clean:
            ref_promoter = self.get_promoter_by_code(ref_code_clean)
            if ref_promoter:
                ref_promoter.total_referrals += 1
                ref_promoter.updated_at = datetime.now(timezone.utc).isoformat()

        new_user = User(
            id=user_id,
            username=username,
            email=email,
            phone=phone,
            role=role,
            tier="reseller" if is_reseller else "user",
            wallet_usd=0.0,
            is_active=False if is_reseller else True,
            reseller_status="pending" if is_reseller else "none",
            reseller_applied_at=datetime.now(timezone.utc).isoformat() if is_reseller else None,
            referred_by_code=ref_promoter.referral_code if ref_promoter else None,
            referred_by_promoter_id=ref_promoter.id if ref_promoter else None,
            password_plain=password,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self.users.append({
            "user": new_user,
            "password_hash": AuthService.hash_password(password),
            "plain_password": password
        })
        self.save_to_disk()
        return new_user

    def reset_user_password(self, user_id: str, new_password: str) -> bool:
        entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not entry:
            return False
        entry["password_hash"] = AuthService.hash_password(new_password)
        entry["plain_password"] = new_password
        entry["user"].password_plain = new_password
        self.log_audit("admin", "super_admin", "RESET_USER_PASSWORD", entry['user'].id, f"Reset password for user {entry['user'].username}")
        return True

    def update_user_info(self, user_id: str, email: Optional[str] = None, phone: Optional[str] = None, username: Optional[str] = None, role: Optional[str] = None) -> Optional[User]:
        entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not entry:
            return None
        user = entry["user"]
        
        if email and email.strip():
            clean_email = email.strip().lower()
            existing = self.get_user_entry_by_username_or_email(clean_email)
            if existing and existing["user"].id != user.id:
                raise ValueError("អ៊ីមែលនេះត្រូវបានប្រើប្រាស់រួចហើយ (Email is already registered by another account)")
            user.email = clean_email
            
        if phone is not None:
            user.phone = phone.strip()
            
        if username and username.strip():
            clean_username = username.strip().lower()
            existing = self.get_user_entry_by_username_or_email(clean_username)
            if existing and existing["user"].id != user.id:
                raise ValueError("ឈ្មោះគណនីនេះត្រូវបានប្រើប្រាស់រួចហើយ (Username is already taken)")
            user.username = clean_username
            
        if role and role in ["user", "reseller", "admin", "super_admin"]:
            user.role = role
            if role in ["reseller", "admin", "super_admin"]:
                user.tier = "reseller"
                user.reseller_status = "approved"
                user.is_active = True
            
        self.log_audit("admin", "super_admin", "UPDATE_USER_INFO", user.id, f"Updated profile for user {user.username} (Email: {user.email}, Phone: {user.phone})")
        return user

    def apply_reseller(self, user_id: str, business_name: str, phone: Optional[str] = None, reason: Optional[str] = None) -> User:
        entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not entry:
            raise ValueError("រកមិនឃើញគណនី (User account not found)")
        user = entry["user"]
        user.reseller_status = "pending"
        user.reseller_business_name = business_name
        user.reseller_applied_at = datetime.now(timezone.utc).isoformat()
        if phone:
            user.phone = phone.strip()
        self.save_to_disk()
        return user

    def adjust_user_spins(self, user_id: str, spins: int, mode: str = "add", reason: str = "") -> Dict[str, Any]:
        entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not entry:
            raise ValueError("រកមិនឃើញគណនី (User account not found)")
        user = entry["user"]
        if not hasattr(user, 'spins_remaining') or user.spins_remaining is None:
            user.spins_remaining = 0
        
        if mode == "add":
            user.spins_remaining += abs(spins)
        elif mode in ["deduct", "subtract"]:
            user.spins_remaining = max(0, user.spins_remaining - abs(spins))
        elif mode in ["set", "exact"]:
            user.spins_remaining = max(0, spins)
            
        self.save_to_disk()
        return {
            "user_id": user.id,
            "username": user.username,
            "spins_remaining": user.spins_remaining,
            "reward_points": getattr(user, 'reward_points', 0)
        }

    def spin_lucky_draw(self, user_id: str) -> Dict[str, Any]:
        entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not entry:
            raise ValueError("រកមិនឃើញគណនី (User account not found)")
        user = entry["user"]
        
        current_spins = getattr(user, 'spins_remaining', 0) or 0
        if current_spins <= 0:
            raise ValueError("គ្មានចំនួនការបង្វិលនៅសល់ទេ (No spins remaining)")

        user.spins_remaining = current_spins - 1

        wheel_segments = [
            {'label': 'PS4', 'type': 'item', 'value': 0},
            {'label': '+50 Points', 'type': 'points', 'value': 50},
            {'label': '+1 Spin', 'type': 'spin', 'value': 1},
            {'label': '+10 Points', 'type': 'points', 'value': 10},
            {'label': 'LITE', 'type': 'item', 'value': 0},
            {'label': 'L+', 'type': 'item', 'value': 0},
            {'label': '+100 Points', 'type': 'points', 'value': 100},
            {'label': '+10 Points', 'type': 'points', 'value': 10},
        ]
        prize = random.choice(wheel_segments)
        
        if prize['type'] == 'points':
            if not hasattr(user, 'reward_points') or user.reward_points is None:
                user.reward_points = 0
            user.reward_points += prize['value']
        elif prize['type'] == 'spin':
            user.spins_remaining += prize['value']

        self.save_to_disk()
        return {
            "prize": prize['label'],
            "prize_type": prize['type'],
            "prize_value": prize['value'],
            "spins_remaining": user.spins_remaining,
            "reward_points": getattr(user, 'reward_points', 0)
        }

    def generate_telegram_link_code(
        self,
        chat_id: str,
        telegram_username: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        photo_url: Optional[str] = None
    ) -> str:
        if not hasattr(self, 'telegram_link_codes') or self.telegram_link_codes is None:
            self.telegram_link_codes = {}

        # Reuse existing active code for this chat_id if generated previously
        for existing_code, info in list(self.telegram_link_codes.items()):
            if str(info.get("chat_id")) == str(chat_id):
                if telegram_username:
                    info["telegram_username"] = telegram_username
                if photo_url:
                    info["photo_url"] = photo_url
                return existing_code

        code = f"{random.randint(100000, 999999)}"
        full_name = f"{first_name or ''} {last_name or ''}".strip() or telegram_username or chat_id
        
        self.telegram_link_codes[code] = {
            "code": code,
            "chat_id": str(chat_id),
            "telegram_username": telegram_username,
            "display_name": full_name,
            "photo_url": photo_url,
            "created_at": time.time(),
            "expires_at": None
        }
        return code

    def verify_and_link_telegram_code(self, code: str, user_id_or_username: str) -> Dict[str, Any]:
        if not hasattr(self, 'telegram_link_codes') or self.telegram_link_codes is None:
            self.telegram_link_codes = {}

        code_clean = str(code).strip()
        if code_clean not in self.telegram_link_codes:
            return {"success": False, "message": "កូដមិនត្រឹមត្រូវ ឬត្រូវបានប្រើប្រាស់រួចរាល់ (Invalid or used code)."}

        info = self.telegram_link_codes[code_clean]
        if info.get("expires_at") and time.time() > info.get("expires_at"):
            del self.telegram_link_codes[code_clean]
            return {"success": False, "message": "កូដនេះបានផុតកំណត់ហើយ សូមផ្ញើសារ /link ម្តងទៀត (Expired code)."}

        entry = self.get_user_entry_by_id(user_id_or_username) or self.get_user_entry_by_username_or_email(user_id_or_username)
        if not entry:
            return {"success": False, "message": "មិនរកឃើញគណនីអ្នកប្រើប្រាស់នៅលើគេហទំព័រ (User not found)."}

        user = entry["user"]
        setattr(user, "telegram_chat_id", info.get("chat_id"))
        setattr(user, "telegram_username", info.get("telegram_username"))
        setattr(user, "telegram_photo_url", info.get("photo_url"))
        setattr(user, "telegram_linked_at", datetime.now(timezone.utc).isoformat())

        del self.telegram_link_codes[code_clean]
        self.save_to_disk()

        try:
            from .services.telegram_service import TelegramService
            notify_msg = (
                f"<b>[ROLEA TELEGRAM ACCOUNT LINKED]</b>\n"
                f"----------------------------------------\n"
                f"គណនី Telegram របស់អ្នកត្រូវបានភ្ជាប់ដោយជោគជ័យជាមួយគណនីគេហទំព័រ៖ <b>{getattr(user, 'username', 'N/A')}</b>\n\n"
                f"ឥឡូវនេះលោកអ្នកអាចចុចប៊ូតុង <b>'ពិនិត្យសមតុល្យ'</b> ឬ <b>'ស្ថានភាព Order'</b> ដើម្បីមើលព័ត៌មានគណនីរបស់អ្នកដោយស្វ័យប្រវត្តិ!\n"
                f"----------------------------------------"
            )
            main_menu_keyboard = {
                "inline_keyboard": [
                    [
                        {"text": "ពិនិត្យសមតុល្យ (Check Balance)", "callback_data": "cmd_balance"},
                        {"text": "ស្ថានភាព Order (Check Status)", "callback_data": "cmd_status"}
                    ],
                    [
                        {"text": "កូដភ្ជាប់គណនី (Link Code)", "callback_data": "cmd_link"},
                        {"text": "បង្កើត Ticket ជំនួយ (Create Ticket)", "callback_data": "cmd_ticket"}
                    ]
                ]
            }
            TelegramService.send_message(text=notify_msg, chat_id=info.get("chat_id"), reply_markup=main_menu_keyboard)
        except Exception as e:
            print(f"[TELEGRAM_NOTIFY_LINK_ERROR] {e}")

        return {
            "success": True,
            "message": f"បានភ្ជាប់គណនី Telegram (@{info.get('telegram_username') or info.get('chat_id')}) ជាមួយគណនី {user.username} បានជោគជ័យ!",
            "data": {
                "user_id": getattr(user, 'id', ''),
                "username": getattr(user, 'username', ''),
                "telegram_chat_id": info.get("chat_id"),
                "telegram_username": info.get("telegram_username"),
                "telegram_photo_url": info.get("photo_url")
            }
        }

    def get_user_by_telegram_chat_id(self, chat_id: str, telegram_username: Optional[str] = None) -> Optional[User]:
        str_cid = str(chat_id or "").strip()
        str_uname = str(telegram_username or "").strip().lower()
        
        for u_entry in self.users:
            u = u_entry.get("user") if isinstance(u_entry, dict) and "user" in u_entry else u_entry
            if not u:
                continue
            tg_cid = str(getattr(u, "telegram_chat_id", "") or "").strip()
            tg_u = str(getattr(u, "telegram_username", "") or "").strip().lower()
            
            if str_cid and tg_cid == str_cid:
                return u
            if str_uname and tg_u and tg_u == str_uname:
                return u
        return None

    def delete_user(self, user_id: str) -> bool:
        entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not entry:
            return False
        user = entry["user"]
        if user.id == "usr-admin" or user.username.lower() == "admin":
            raise ValueError("មិនអាចលុបគណនី Admin មេបានទេ (Cannot delete primary Admin account)")
        
        target_id = user.id
        self.users = [u for u in self.users if u["user"].id != target_id]
        self.api_keys = [k for k in self.api_keys if getattr(k, 'user_id', '') != target_id]
        self.log_audit("admin", "super_admin", "DELETE_USER", target_id, f"Deleted user account {user.username} ({user.email})")
        self.save_to_disk()
        return True

    def get_reseller_applications(self, status: Optional[str] = None) -> List[User]:
        resellers = [u["user"] for u in self.users if u["user"].role == "reseller" or u["user"].reseller_status in ["pending", "approved", "rejected"]]
        if status and status != "all":
            resellers = [u for u in resellers if getattr(u, "reseller_status", None) == status]
        return resellers

    def approve_reseller(self, user_id: str) -> Optional[User]:
        entry = self.get_user_entry_by_id(user_id)
        if not entry:
            return None
        user = entry["user"]
        user.role = "reseller"
        user.tier = "reseller"
        user.is_active = True
        user.reseller_status = "approved"
        user.reseller_reviewed_at = datetime.now(timezone.utc).isoformat()
        user.reseller_reject_reason = None
        user.api_enabled = True

        user_keys = self.get_user_api_keys(user.id)
        if not [k for k in user_keys if k.is_active]:
            self.create_api_key(user.id, "Default B2B Production Key", ip_whitelist=[])

        try:
            TelegramService.notify_reseller_decision(user, approved=True)
        except Exception as e:
            print(f"[TELEGRAM_WARN] {e}")
        return user

    def reject_reseller(self, user_id: str, reason: Optional[str] = None) -> Optional[User]:
        entry = self.get_user_entry_by_id(user_id)
        if not entry:
            return None
        user = entry["user"]
        user.is_active = False
        user.reseller_status = "rejected"
        user.reseller_reviewed_at = datetime.now(timezone.utc).isoformat()
        user.reseller_reject_reason = reason or "Requirements not met"
        try:
            TelegramService.notify_reseller_decision(user, approved=False, reason=reason)
        except Exception as e:
            print(f"[TELEGRAM_WARN] {e}")
        return user


    def deduct_user_wallet(self, user_id: str, amount_usd: float, description: str = "Reseller B2B Deduction") -> Optional[User]:
        return self.adjust_wallet(user_id, -abs(amount_usd), description)

    def adjust_wallet(self, user_id: str, amount_usd: float, description: str) -> Optional[User]:
        entry = self.get_user_entry_by_id(user_id)
        if not entry:
            return None
        user = entry["user"]
        user.wallet_usd = max(0.0, round(user.wallet_usd + amount_usd, 2))
        
        self.wallet_txns.append(WalletTransaction(
            id=f"tx-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            type="deposit" if amount_usd >= 0 else "adjustment",
            amount_usd=amount_usd,
            amount_khr=PricingService.usd_to_khr(amount_usd),
            balance_after_usd=user.wallet_usd,
            reference=f"ADJ-{uuid.uuid4().hex[:6].upper()}",
            description=description,
            created_at=datetime.now(timezone.utc).isoformat()
        ))
        if amount_usd > 0:
            try:
                TelegramService.notify_wallet_deposit(
                    user_id=user.id,
                    username=user.username,
                    amount_usd=amount_usd,
                    tx_id=f"DEP-{uuid.uuid4().hex[:6].upper()}",
                    new_balance=user.wallet_usd
                )
            except Exception as e:
                print(f"[TELEGRAM_WARN] Failed to dispatch wallet deposit notification: {e}")
        return user

    def create_wallet_deposit_qr(self, user_id: str, amount_usd: float) -> Dict[str, Any]:
        user_entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not user_entry and self.users:
            user_entry = self.users[0]
        if not user_entry:
            raise ValueError("User not found")
        
        amt = round(max(0.50, float(amount_usd)), 2)
        amount_khr = int(round(amt * self.pricing_config.exchange_rate_khr))
        deposit_id = f"DEP-{uuid.uuid4().hex[:8].upper()}"
        
        from .services.vngzz_payment_service import VngzzPaymentService
        from .services.khqr_service import KHQRService
        
        qr_string = ""
        md5_hash = ""
        try:
            qr_data = VngzzPaymentService.generate_qr(amt, currency="USD", idempotency_key=deposit_id)
            if isinstance(qr_data, dict):
                qr_string = qr_data.get("qr_string") or qr_data.get("qr_image") or ""
                md5_hash = qr_data.get("md5") or ""
        except Exception as e:
            print(f"[KHQR_WARN] VngZz QR fallback: {e}")

        if not qr_string:
            qr_string = KHQRService.generate_bakong_khqr_string(amt, "USD", "Rothz TopUp", deposit_id)
        if not md5_hash:
            md5_hash = KHQRService.generate_md5_hash(qr_string)
        
        deposit_entry = {
            "deposit_id": deposit_id,
            "user_id": user_entry["user"].id,
            "amount_usd": amt,
            "amount_khr": amount_khr,
            "qr_string": qr_string,
            "md5": md5_hash,
            "merchant_name": "Rothz TopUp Wallet",
            "reference": deposit_id,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        self.pending_wallet_deposits[deposit_id] = deposit_entry
        return deposit_entry

    def verify_and_credit_wallet_deposit(self, deposit_id: str, md5_hash: Optional[str] = None) -> Dict[str, Any]:
        dep = self.pending_wallet_deposits.get(deposit_id)
        if not dep:
            for d_id, d in self.pending_wallet_deposits.items():
                if d.get("deposit_id") == deposit_id or d.get("md5") == md5_hash:
                    dep = d
                    deposit_id = d_id
                    break
        
        if not dep:
            raise ValueError("Deposit transaction not found")
        
        user_entry = self.get_user_entry_by_id(dep["user_id"])
        if not user_entry:
            raise ValueError("Associated user account not found")
        
        if dep["status"] == "paid":
            return {
                "success": True,
                "status": "paid",
                "deposit_id": deposit_id,
                "amount_usd": dep["amount_usd"],
                "new_balance_usd": user_entry["user"].wallet_usd,
                "message": f"Deposit {deposit_id} is already completed and credited!"
            }
        
        from .services.vngzz_payment_service import VngzzPaymentService
        check_res = VngzzPaymentService.check_transaction(dep["md5"])
        
        dep["status"] = "paid"
        updated_user = self.adjust_wallet(dep["user_id"], dep["amount_usd"], description=f"Automated KHQR Deposit ({deposit_id})")
        
        return {
            "success": True,
            "status": "paid",
            "deposit_id": deposit_id,
            "amount_usd": dep["amount_usd"],
            "new_balance_usd": updated_user.wallet_usd if updated_user else dep["amount_usd"],
            "message": f"Successfully credited ${dep['amount_usd']:.2f} USD to wallet!"
        }

    # --- Seed Methods for New Modules ---
    def _seed_coupons(self) -> List[Coupon]:
        return [
            Coupon(
                id="coup-1",
                code="ROTHZ10",
                discount_percent=10.0,
                min_order_usd=0.50,
                max_uses=1000,
                used_count=14,
                valid_until="2027-12-31",
                is_active=True,
                created_at=datetime.utcnow().isoformat()
            ),
            Coupon(
                id="coup-2",
                code="FLASH50",
                discount_percent=50.0,
                min_order_usd=1.00,
                max_uses=200,
                used_count=28,
                valid_until="2027-12-31",
                is_active=True,
                created_at=datetime.utcnow().isoformat()
            ),
            Coupon(
                id="coup-3",
                code="WELCOME",
                discount_percent=5.0,
                min_order_usd=0.00,
                max_uses=5000,
                used_count=105,
                valid_until="2027-12-31",
                is_active=True,
                created_at=datetime.utcnow().isoformat()
            ),
            Coupon(
                id="coup-4",
                code="DISCOUNT10",
                discount_percent=10.0,
                min_order_usd=0.50,
                max_uses=1000,
                used_count=12,
                valid_until="2027-12-31",
                is_active=True,
                created_at=datetime.utcnow().isoformat()
            )
        ]

    def _seed_banners(self) -> List[Banner]:
        return []

    def _seed_hero_banner(self) -> HeroBannerConfig:
        return HeroBannerConfig(
            badge_text_en="0% Fee with Bakong KHQR across all Cambodian Banks",
            badge_text_km="ទូទាត់តាម Bakong KHQR មិនគិតថ្លៃសេវា 0%",
            title_en="Instant Game Top-Up",
            title_km="បញ្ចូលទឹកប្រាក់ហ្គេម",
            highlight_en="Fast & Secure",
            highlight_km="លឿនរហ័ស & សុវត្ថិភាព",
            subtitle_en="Automated instant credit delivery via Bakong KHQR, ABA Mobile, Wing Bank and ACLEDA into your game account.",
            subtitle_km="ផ្ទេរប្រាក់តាមរយៈ Bakong KHQR, ABA Mobile, Wing Bank និង ACLEDA ចូលគណនីដោយស្វ័យប្រវត្តិ។",
            cta_primary_text_en="Top Up Now (MLBB)",
            cta_primary_text_km="បញ្ចូលប្រាក់ឥឡូវនេះ (MLBB)",
            cta_primary_url="/games/mobile-legends",
            cta_secondary_text_en="Check Order Status",
            cta_secondary_text_km="ពិនិត្យស្ថានភាព",
            cta_secondary_url="/order/track",
            stat_1_val_en="Official",
            stat_1_val_km="ផ្លូវការ",
            stat_1_label_en="API Partner",
            stat_1_label_km="ដៃគូផ្គត់ផ្គង់",
            stat_2_val_en="< 30s",
            stat_2_val_km="ក្រោម ៣០ វិនាទី",
            stat_2_label_en="Instant Delivery",
            stat_2_label_km="ល្បឿនបញ្ចូល",
            stat_3_val_en="99.9%",
            stat_3_val_km="៩៩.៩%",
            stat_3_label_en="Success Rate",
            stat_3_label_km="អត្រាជោគជ័យ",
            background_image_url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
            quick_cards=[
                QuickCard(
                    id="qc-1",
                    badge_en="POPULAR",
                    badge_km="POPULAR",
                    badge_color="cyan",
                    game_slug="mobile-legends",
                    game_name_en="Mobile Legends",
                    game_name_km="Mobile Legends",
                    package_name_en="Weekly Pass",
                    package_name_km="Weekly Pass",
                    price_usd=1.85,
                    price_khr=7585,
                    target_url="/games/mobile-legends",
                    is_active=True
                ),
                QuickCard(
                    id="qc-2",
                    badge_en="TOP PICK",
                    badge_km="TOP PICK",
                    badge_color="yellow",
                    game_slug="pubg-mobile",
                    game_name_en="PUBG Mobile",
                    game_name_km="PUBG Mobile",
                    package_name_en="325 UC",
                    package_name_km="325 UC",
                    price_usd=4.80,
                    price_khr=19680,
                    target_url="/games/pubg-mobile",
                    is_active=True
                ),
                QuickCard(
                    id="qc-3",
                    badge_en="PROMO",
                    badge_km="PROMO",
                    badge_color="orange",
                    game_slug="free-fire",
                    game_name_en="Free Fire",
                    game_name_km="Free Fire",
                    package_name_en="310 + 31 Diamonds",
                    package_name_km="310 + 31 Diamonds",
                    price_usd=2.95,
                    price_khr=12095,
                    target_url="/games/free-fire",
                    is_active=True
                ),
                QuickCard(
                    id="qc-4",
                    badge_en="PC SEA",
                    badge_km="PC SEA",
                    badge_color="emerald",
                    game_slug="valorant",
                    game_name_en="VALORANT VP",
                    game_name_km="VALORANT VP",
                    package_name_en="1,000 VP",
                    package_name_km="1,000 VP",
                    price_usd=7.99,
                    price_khr=32759,
                    target_url="/games/valorant",
                    is_active=True
                )
            ],
            background_gradient="from-blue-900 via-indigo-900 to-slate-900",
            is_active=True,
            updated_at=datetime.now(timezone.utc).isoformat()
        )

    def _seed_audit_logs(self) -> List[AuditLog]:
        return []

    def _seed_notifications(self) -> List[SystemNotification]:
        return []

    def _seed_wallet_ledger(self) -> List[WalletLedgerEntry]:
        return []

    # --- Enhanced Stats & Chart Analytics ---
    def get_admin_stats(self) -> AdminDashboardStats:
        all_orders = self.orders
        success_orders = [o for o in all_orders if o.status == "success"]
        failed_orders = [o for o in all_orders if o.status in ("failed", "cancelled")]
        pending_orders = [o for o in all_orders if o.status in ("pending", "processing")]

        total_rev_usd = sum(o.amount_usd for o in success_orders)
        total_cost_usd = sum(getattr(o, "cost_usd", o.amount_usd * 0.88) for o in success_orders)
        profit_usd = round(total_rev_usd - total_cost_usd, 2) if total_rev_usd > 0 else 0.0

        total_rev_khr = sum(o.amount_khr for o in success_orders)
        total_resellers = len([u for u in self.users if u["user"].role == "reseller"])
        total_wallet_pool = sum(u["user"].wallet_usd for u in self.users)

        active_provs = len([p for p in self.providers if p.status == "active"])
        active_games = len([g for g in self.games if g.is_active])
        active_products = sum(len([p for p in g.packages if p.is_active]) for g in self.games)

        # 14-day Time Series for Charts based on actual orders
        now = datetime.now(timezone.utc)
        chart_rev = []
        chart_prof = []
        for i in range(13, -1, -1):
            day_dt = now - timedelta(days=i)
            d_str = day_dt.strftime("%b %d")
            day_start = day_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            day_orders = [
                o for o in success_orders
                if day_start.isoformat() <= o.created_at <= day_end.isoformat()
            ]
            rev_val = round(sum(o.amount_usd for o in day_orders), 2)
            cost_val = sum(getattr(o, "cost_usd", o.amount_usd * 0.88) for o in day_orders)
            prof_val = round(rev_val - cost_val, 2)
            chart_rev.append({"date": d_str, "revenue": rev_val})
            chart_prof.append({"date": d_str, "profit": prof_val})

        # Top Selling Games from actual orders
        game_sales: Dict[str, Dict[str, Any]] = {}
        for o in success_orders:
            g_key = o.game_slug
            if g_key not in game_sales:
                g_obj = self.get_game_by_slug(g_key, active_only=False)
                game_sales[g_key] = {
                    "game_name": o.game_name_en,
                    "orders_count": 0,
                    "revenue_usd": 0.0,
                    "thumbnail": g_obj.thumbnail if g_obj else "/images/games/mlbb.png"
                }
            game_sales[g_key]["orders_count"] += 1
            game_sales[g_key]["revenue_usd"] += o.amount_usd

        top_games_data = sorted(
            [
                {
                    "game_name": v["game_name"],
                    "orders_count": v["orders_count"],
                    "revenue_usd": round(v["revenue_usd"], 2),
                    "thumbnail": v["thumbnail"]
                }
                for v in game_sales.values()
            ],
            key=lambda x: x["revenue_usd"],
            reverse=True
        )[:6]

        status_dist = {
            "success": len(success_orders),
            "processing": len([o for o in all_orders if o.status == "processing"]),
            "pending": len([o for o in all_orders if o.status == "pending"]),
            "failed": len(failed_orders),
            "refunded": len([o for o in all_orders if o.status == "refunded"])
        }

        unread_notifs = len([n for n in self.notifications if not n.is_read])

        # Today's sales
        today_str = now.strftime("%Y-%m-%d")
        today_orders = [o for o in success_orders if o.created_at.startswith(today_str)]
        today_sales = round(sum(o.amount_usd for o in today_orders), 2)

        return AdminDashboardStats(
            total_users=len(self.users),
            total_resellers=total_resellers,
            total_orders=len(all_orders),
            today_orders_count=len(today_orders),
            success_orders=len(success_orders),
            failed_orders=len(failed_orders),
            pending_orders=len(pending_orders),
            revenue_usd=round(total_rev_usd, 2),
            revenue_khr=total_rev_khr,
            cost_usd=round(total_cost_usd, 2),
            profit_usd=profit_usd,
            today_sales_usd=today_sales,
            total_wallet_pool_usd=round(total_wallet_pool, 2),
            provider_balance_pool_usd=0.0,
            total_providers=len(self.providers),
            active_providers=active_provs,
            active_games_count=active_games,
            active_products_count=active_products,
            recent_orders=all_orders[:8],
            recent_sync_logs=self.sync_logs[:6],
            recent_audit_logs=self.audit_logs[:6],
            unread_notifications_count=unread_notifs,
            chart_daily_revenue=chart_rev,
            chart_daily_profit=chart_prof,
            chart_status_distribution=status_dist,
            chart_top_games=top_games_data
        )

    # --- Provider Operations ---
    def get_providers(self) -> List[Provider]:
        return self.providers

    def get_provider(self, provider_id: str) -> Optional[Provider]:
        for p in self.providers:
            if p.id.lower() == provider_id.lower():
                return p
        return None

    def add_provider(self, prov: ProviderCreate) -> Provider:
        prov_id = prov.id or re.sub(r'[^a-z0-9]+', '-', prov.name.lower()).strip('-')
        new_provider = Provider(
            id=prov_id,
            name=prov.name,
            api_url=prov.api_url,
            api_key=prov.api_key,
            secret=prov.secret,
            api_username=prov.api_username,
            status=prov.status,
            priority=prov.priority,
            webhook_url=f"/api/v1/webhooks/provider/{prov_id}",
            webhook_secret=prov.webhook_secret or f"whsec_{uuid.uuid4().hex[:8]}",
            auto_sync_interval=prov.auto_sync_interval,
            auto_sync_games=prov.auto_sync_games,
            auto_sync_products=prov.auto_sync_products,
            last_sync_at=None,
            last_sync_status="never",
            sync_games_count=0,
            sync_products_count=0,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self.providers.append(new_provider)
        self.log_audit("admin", "super_admin", "ADD_PROVIDER", new_provider.id, f"Added provider {new_provider.name}")
        return new_provider

    def update_provider(self, provider_id: str, update: ProviderUpdate) -> Optional[Provider]:
        for idx, p in enumerate(self.providers):
            if p.id.lower() == provider_id.lower():
                old_status = p.status
                d = p.model_dump()
                for k, v in update.model_dump(exclude_unset=True).items():
                    if v is not None:
                        d[k] = v
                updated = Provider(**d)
                self.providers[idx] = updated
                self.log_audit("admin", "super_admin", "UPDATE_PROVIDER", provider_id, f"Updated provider {p.name}")
                self.save_to_disk()
                
                # If provider was reconnected/activated, trigger game/product sync immediately
                if old_status != "active" and updated.status == "active":
                    try:
                        import threading
                        def _bg_sync():
                            SyncService.sync_products(updated.id, self)
                        threading.Thread(target=_bg_sync, daemon=True).start()
                    except Exception as e:
                        print(f"[PROVIDER_ACTIVATE_WARN] Sync error: {e}")
                return updated
        return None

    def delete_provider(self, provider_id: str) -> bool:
        initial_len = len(self.providers)
        DataStore.deleted_provider_ids.add(provider_id.lower())
        self.providers = [p for p in self.providers if p.id.lower() != provider_id.lower()]
        if len(self.providers) < initial_len:
            for g in self.games:
                if (getattr(g, 'provider_id', None) and g.provider_id.lower() == provider_id.lower()) or (getattr(g, 'primary_provider_id', None) and g.primary_provider_id.lower() == provider_id.lower()):
                    g.provider_id = None
                    g.primary_provider_id = None
            self.log_audit("admin", "super_admin", "DELETE_PROVIDER", provider_id, f"Deleted provider {provider_id}")
            return True
        return False

    # --- Products & Package Operations ---
    def get_all_products(self) -> List[Dict[str, Any]]:
        flat_list = []
        for g in self.games:
            for p in g.packages:
                d = p.model_dump()
                d["game_name_en"] = g.name_en
                d["game_name_km"] = g.name_km
                d["game_slug"] = g.slug
                d["game_thumbnail"] = g.thumbnail
                d["game_category"] = g.category
                flat_list.append(d)
        return flat_list

    def update_product_package(self, game_slug: str, package_id: str, update: ProductPackageUpdate) -> Optional[ProductPackage]:
        game = self.get_game_by_slug(game_slug)
        if not game:
            return None
        for idx, pkg in enumerate(game.packages):
            if pkg.id == package_id:
                d = pkg.model_dump()
                update_dict = update.model_dump(exclude_unset=True)
                for k, v in update_dict.items():
                    if v is not None:
                        d[k] = v

                # Priority: explicit prices set by admin -> fallback to markup calculation
                if update.price_user_usd is not None:
                    d["price_user_usd"] = round(float(update.price_user_usd), 2)
                elif update.markup_percent is not None:
                    d["price_user_usd"] = round(pkg.cost_usd * (1 + float(update.markup_percent) / 100.0), 2)

                if update.price_reseller_usd is not None:
                    d["price_reseller_usd"] = round(float(update.price_reseller_usd), 2)

                if update.price_vip_usd is not None:
                    d["price_vip_usd"] = round(float(update.price_vip_usd), 2)

                if update.manual_price_override is not None:
                    d["manual_price_override"] = bool(update.manual_price_override)
                else:
                    d["manual_price_override"] = True

                updated_pkg = ProductPackage(**d)
                game.packages[idx] = updated_pkg
                self.log_audit("admin", "manager", "UPDATE_PRODUCT", package_id, f"Updated product {pkg.name_en} in {game.name_en}")
                self.save_to_disk()
                return updated_pkg
        return None


    def batch_update_products(self, updates: List[Dict[str, Any]]) -> int:
        count = 0
        for item in updates:
            game_slug = item.get("game_slug")
            pkg_id = item.get("id")
            if game_slug and pkg_id:
                up = ProductPackageUpdate(**item)
                if self.update_product_package(game_slug, pkg_id, up):
                    count += 1
        return count

    # --- Order Management, Retry & Refund ---
    def get_order(self, order_id: str) -> Optional[Order]:
        return self.get_order_by_id(order_id)

    def check_order_provider_status(self, order_id: str) -> Dict[str, Any]:
        order = self.get_order_by_id(order_id)
        if not order:
            return {"success": False, "message": "Order not found"}
        
        provider = self.get_provider(order.provider_id or "smileone")
        return {
            "success": True,
            "order_id": order.id,
            "provider_name": provider.name if provider else "SmileOne",
            "provider_order_id": order.provider_order_id or f"EXT-{order.id}",
            "status": order.status,
            "upstream_status": "DELIVERED" if order.status == "success" else "PENDING_UPSTREAM",
            "upstream_response": order.provider_response or {
                "code": 200,
                "msg": "Order confirmed in upstream provider ledger",
                "trx_id": order.provider_order_id or f"PRV-{order.id}",
                "server_time": datetime.now(timezone.utc).isoformat()
            }
        }

    def retry_order(self, order_id: str) -> Dict[str, Any]:
        order = self.get_order_by_id(order_id)
        if not order:
            return {"success": False, "message": "Order not found"}
        
        # Idempotency safety check
        if order.status == "success":
            return {"success": False, "message": "Order is already successful. Duplicate dispatch blocked."}

        from .services.provider_service import ProviderService
        success, processed_order = ProviderService.process_order_auto_fulfillment(order, self)

        if success:
            self.log_audit("admin", "support", "RETRY_ORDER_SUCCESS", order.id, f"Auto re-purchase succeeded via Provider API for order {order.id}")
            self.save_to_disk()
            return {
                "success": True,
                "message": f"Order {order.id} re-purchased and delivered successfully via Provider API!",
                "data": processed_order
            }
        else:
            err_msg = getattr(processed_order, 'error_message', getattr(processed_order, 'delivery_code', 'Provider API purchase failed'))
            self.log_audit("admin", "support", "RETRY_ORDER_FAILED", order.id, f"Auto re-purchase failed for order {order.id}: {err_msg}")
            self.save_to_disk()
            return {
                "success": False,
                "message": f"Re-purchase via Provider API failed: {err_msg}",
                "data": processed_order
            }

    def refund_order(self, order_id: str, reason: str = "Admin manual refund") -> Dict[str, Any]:
        order = self.get_order_by_id(order_id)
        if not order:
            return {"success": False, "message": "Order not found"}
        
        if order.status == "refunded":
            return {"success": False, "message": "Order is already refunded"}

        order.status = "refunded"
        order.payment_status = "refunded"
        order.updated_at = datetime.now(timezone.utc).isoformat()
        order.error_message = f"Refunded: {reason}"

        # Credit wallet: resolve user_id by order.user_id -> customer_contact -> customer_name -> matching user
        target_user = None
        target_user_id = order.user_id

        if target_user_id:
            u_entry = self.find_user_entry(target_user_id)
            if u_entry:
                target_user = u_entry["user"]

        if not target_user and order.customer_contact:
            u_entry = self.find_user_entry(order.customer_contact)
            if u_entry:
                target_user = u_entry["user"]
                target_user_id = target_user.id

        if not target_user and getattr(order, "customer_name", None):
            u_entry = self.find_user_entry(order.customer_name)
            if u_entry:
                target_user = u_entry["user"]
                target_user_id = target_user.id

        auto_account_credentials = None

        # Auto-create account for guest if no existing user account found
        if not target_user:
            contact = str(order.customer_contact or f"guest_{order.id.lower()}").strip()
            contact_clean = contact.replace("@", "_at_").replace(".", "_")
            
            email = contact if "@" in contact else f"{contact_clean}@topup.com"
            username = f"gamer_{uuid.uuid4().hex[:6]}"
            
            # Temporary secure password (different from email!)
            temp_password = f"RT{uuid.uuid4().hex[:6].upper()}#"

            new_user = User(
                id=f"usr-{uuid.uuid4().hex[:8]}",
                username=username,
                email=email,
                role="user",
                wallet_usd=order.amount_usd,
                wallet_khr=int(order.amount_usd * 4100),
                is_active=True,
                created_at=datetime.now(timezone.utc).isoformat(),
                is_auto_created=True,
                need_password_change=True,
                auto_created_reason=f"ប្រព័ន្ធបានបង្កើតគណនីជូនអ្នកដោយស្វ័យប្រវត្តិ ដោយសារមានទឹកប្រាក់បង្វិលសង (${order.amount_usd:.2f}) សម្រាប់ Order #{order.id}"
            )

            self.users.append({
                "user": new_user,
                "password_hash": temp_password,
                "password_plain": temp_password,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

            target_user = new_user
            target_user_id = new_user.id
            order.user_id = new_user.id

            auto_account_credentials = {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "temp_password": temp_password,
                "wallet_usd": new_user.wallet_usd,
                "role": new_user.role,
                "is_auto_created": True,
                "need_password_change": True,
                "refund_amount_usd": order.amount_usd,
                "order_id": order.id,
                "reason": new_user.auto_created_reason
            }
            order.auto_account_notice = auto_account_credentials
        else:
            order.user_id = target_user.id
            try:
                self.adjust_wallet(target_user.id, order.amount_usd, description=f"Refund for order {order.id}: {reason}")
            except Exception as e:
                print(f"[REFUND_WARN] Wallet adjustment error: {e}")

        self.log_audit("admin", "finance", "REFUND_ORDER", order.id, f"Refunded order {order.id} (${order.amount_usd}) - Reason: {reason}")
        
        # Log user activity
        try:
            self.log_user_activity(
                user_id=target_user_id,
                username=target_user.username if target_user else "Gamer",
                email=target_user.email if target_user else order.customer_contact,
                action="WALLET_REFUND",
                details=f"Refunded ${order.amount_usd:.2f} to wallet balance for Order #{order.id} ({reason})",
                target_id=order.id,
                amount_usd=order.amount_usd
            )
        except Exception as e:
            print(f"[ACTIVITY_LOG_WARN] Failed to log activity: {e}")

        self.save_to_disk()
        return {"success": True, "message": f"Order {order.id} refunded successfully", "data": order}

    def _seed_user_activities(self) -> List[UserActivityLog]:
        now = datetime.now(timezone.utc)
        return [
            UserActivityLog(
                id="act-seed-1",
                user_id="usr-admin",
                username="admin",
                email="roleatopup@gmail.com",
                role="super_admin",
                action="LOGIN",
                action_label_km="ចូលប្រើប្រាស់ (Login)",
                action_label_en="User Login",
                details="Logged in successfully to RoleaTopup Dashboard",
                ip_address="110.74.221.14",
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)",
                status="success",
                created_at=(now - timedelta(minutes=15)).isoformat()
            ),
            UserActivityLog(
                id="act-seed-2",
                user_id="usr-101",
                username="rathadararath",
                email="rathadararath8@gmail.com",
                role="user",
                action="CREATE_ORDER",
                action_label_km="បង្កើតការបញ្ជាទិញ (Order Created)",
                action_label_en="Order Created",
                details="Placed order #RT-92066 for MLBB Weekly Elite Pack ($0.92)",
                target_id="RT-92066",
                amount_usd=0.92,
                ip_address="110.74.198.88",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                status="success",
                created_at=(now - timedelta(minutes=32)).isoformat()
            ),
            UserActivityLog(
                id="act-seed-3",
                user_id="usr-101",
                username="rathadararath",
                email="rathadararath8@gmail.com",
                role="user",
                action="WALLET_REFUND",
                action_label_km="បង្វិលប្រាក់ (Wallet Refund)",
                action_label_en="Wallet Refund",
                details="Refunded $0.92 to wallet balance for Order #RT-92066",
                target_id="RT-92066",
                amount_usd=0.92,
                ip_address="110.74.198.88",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                status="success",
                created_at=(now - timedelta(minutes=10)).isoformat()
            ),
            UserActivityLog(
                id="act-seed-4",
                user_id="usr-101",
                username="rathadararath",
                email="rathadararath8@gmail.com",
                role="user",
                action="CHANGE_PASSWORD",
                action_label_km="ប្តូរលេខសម្ងាត់ (Password Changed)",
                action_label_en="Password Changed",
                details="Updated account password and profile security settings",
                ip_address="110.74.198.88",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                status="success",
                created_at=(now - timedelta(minutes=5)).isoformat()
            )
        ]

    def log_user_activity(
        self,
        user_id: str,
        username: str,
        action: str,
        details: str,
        action_label_km: Optional[str] = None,
        action_label_en: Optional[str] = None,
        email: Optional[str] = None,
        role: str = "user",
        target_id: Optional[str] = None,
        amount_usd: Optional[float] = None,
        ip_address: str = "127.0.0.1",
        user_agent: str = "Web Browser",
        status: str = "success"
    ) -> UserActivityLog:
        act_clean = action.upper().strip()
        km_map = {
            "LOGIN": "ចូលប្រើប្រាស់ (Login)",
            "LOGOUT": "ចាកចេញ (Logout)",
            "REGISTER": "ចុះឈ្មោះ (Register)",
            "CREATE_ORDER": "បង្កើតការបញ្ជាទិញ (Order Created)",
            "WALLET_DEPOSIT": "បញ្ចូលលុយ (Wallet Deposit)",
            "WALLET_REFUND": "បង្វិលប្រាក់ (Wallet Refund)",
            "UPDATE_PROFILE": "កែប្រែព័ត៌មាន (Profile Updated)",
            "CHANGE_PASSWORD": "ប្តូរលេខសម្ងាត់ (Password Changed)",
            "TICKET_CREATE": "បង្កើតសំបុត្រ (Ticket Created)",
            "TICKET_REPLY": "ឆ្លើយតបសំបុត្រ (Ticket Replied)",
            "API_KEY_CREATE": "បង្កើត API Key (API Key Created)",
            "API_KEY_REVOKE": "លុប API Key (API Key Revoked)"
        }
        en_map = {
            "LOGIN": "User Login",
            "LOGOUT": "User Logout",
            "REGISTER": "User Registration",
            "CREATE_ORDER": "Order Created",
            "WALLET_DEPOSIT": "Wallet Deposit",
            "WALLET_REFUND": "Wallet Refund",
            "UPDATE_PROFILE": "Profile Updated",
            "CHANGE_PASSWORD": "Password Changed",
            "TICKET_CREATE": "Support Ticket Created",
            "TICKET_REPLY": "Support Ticket Replied",
            "API_KEY_CREATE": "API Key Created",
            "API_KEY_REVOKE": "API Key Revoked"
        }
        
        lbl_km = action_label_km or km_map.get(act_clean, "សកម្មភាពអ្នកប្រើប្រាស់")
        lbl_en = action_label_en or en_map.get(act_clean, "User Activity")

        new_log = UserActivityLog(
            id=f"act-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            username=username,
            email=email,
            role=role,
            action=act_clean,
            action_label_km=lbl_km,
            action_label_en=lbl_en,
            details=details,
            target_id=target_id,
            amount_usd=amount_usd,
            ip_address=ip_address or "127.0.0.1",
            user_agent=user_agent or "Web Browser",
            status=status,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        if not hasattr(self, 'user_activities') or self.user_activities is None:
            self.user_activities = []
        self.user_activities.insert(0, new_log)
        self.save_to_disk()
        return new_log

    def get_user_activity_logs(
        self,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 200
    ) -> List[UserActivityLog]:
        if not hasattr(self, 'user_activities') or not self.user_activities:
            self.user_activities = self._seed_user_activities()
            
        logs = getattr(self, 'user_activities', []) or []
        if user_id:
            logs = [l for l in logs if l.user_id.lower() == user_id.lower()]
        if action and action.upper() != "ALL":
            logs = [l for l in logs if l.action.upper() == action.upper()]
        if search:
            s_clean = search.lower().strip()
            logs = [
                l for l in logs 
                if s_clean in l.username.lower() 
                or (l.email and s_clean in l.email.lower())
                or (l.user_id and s_clean in l.user_id.lower())
                or s_clean in l.details.lower()
                or s_clean in (l.target_id or "").lower()
                or s_clean in l.ip_address.lower()
            ]
        return logs[:limit]

    # --- Coupons Operations ---
    def get_coupons(self) -> List[Coupon]:
        return self.coupons

    def add_coupon(self, c: CouponCreate) -> Coupon:
        pct = c.discount_percent
        if c.discount_type == "PERCENT" and c.discount_value is not None:
            pct = c.discount_value
        amt = c.discount_amount_usd
        if c.discount_type == "FIXED" and c.discount_value is not None:
            amt = c.discount_value

        new_coupon = Coupon(
            id=f"cp-{uuid.uuid4().hex[:6]}",
            code=c.code.upper().strip(),
            discount_percent=pct,
            discount_amount_usd=amt,
            min_order_usd=c.min_order_usd,
            max_uses=c.max_uses,
            used_count=0,
            valid_until=c.valid_until or "2026-12-31T23:59:59Z",
            is_active=c.is_active,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self.coupons.append(new_coupon)
        self.log_audit("admin", "manager", "ADD_COUPON", new_coupon.code, f"Created coupon {new_coupon.code}")
        return new_coupon

    def delete_coupon(self, coupon_id: str) -> bool:
        init_len = len(self.coupons)
        self.coupons = [c for c in self.coupons if c.id != coupon_id]
        return len(self.coupons) < init_len

    # --- Banners Operations ---
    def get_banners(self) -> List[Banner]:
        return sorted(self.banners, key=lambda b: b.sort_order)

    def add_banner(self, b: BannerCreate) -> Banner:
        new_banner = Banner(
            id=f"bn-{uuid.uuid4().hex[:6]}",
            title_en=b.title_en,
            title_km=b.title_km,
            subtitle_en=b.subtitle_en,
            subtitle_km=b.subtitle_km,
            image_url=b.image_url,
            target_url=b.target_url,
            badge_en=b.badge_en,
            badge_km=b.badge_km,
            is_active=b.is_active,
            sort_order=b.sort_order,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self.banners.append(new_banner)
        self.log_audit("admin", "manager", "ADD_BANNER", new_banner.id, f"Created banner {new_banner.title_en}")
        return new_banner

    def delete_banner(self, banner_id: str) -> bool:
        init_len = len(self.banners)
        self.banners = [b for b in self.banners if b.id != banner_id]
        return len(self.banners) < init_len

    def delete_all_banners(self) -> bool:
        self.banners = []
        self.log_audit("admin", "manager", "DELETE_ALL_BANNERS", "all", "Purged all promotional photo banners")
        return True

    def toggle_banner(self, banner_id: str) -> Optional[Banner]:
        for b in self.banners:
            if b.id == banner_id:
                b.is_active = not b.is_active
                self.log_audit("admin", "manager", "TOGGLE_BANNER", b.id, f"Toggled banner {b.title_en} status")
                return b
        return None

    def update_banner(self, banner_id: str, b: BannerCreate) -> Optional[Banner]:
        for banner in self.banners:
            if banner.id == banner_id:
                banner.title_en = b.title_en
                banner.title_km = b.title_km
                banner.subtitle_en = b.subtitle_en
                banner.subtitle_km = b.subtitle_km
                banner.image_url = b.image_url
                banner.target_url = b.target_url
                banner.badge_en = b.badge_en
                banner.badge_km = b.badge_km
                banner.is_active = b.is_active
                banner.sort_order = b.sort_order
                self.log_audit("admin", "manager", "UPDATE_BANNER", banner.id, f"Updated banner {banner.title_en}")
                return banner
        return None

    def get_hero_banner(self) -> HeroBannerConfig:
        return self.hero_banner

    def update_hero_banner(self, cfg: HeroBannerConfig) -> HeroBannerConfig:
        cfg.updated_at = datetime.now(timezone.utc).isoformat()
        self.hero_banner = cfg
        self.log_audit("admin", "super_admin", "UPDATE_HERO_BANNER", "hero_banner", "Updated homepage hero banner settings")
        return self.hero_banner

    # --- Audit Logs & Notifications ---
    def log_audit(self, username: str, role: str, action: str, target_id: Optional[str], details: str, ip: str = "127.0.0.1") -> AuditLog:
        entry = AuditLog(
            id=f"aud-{uuid.uuid4().hex[:6]}",
            admin_username=username,
            admin_role=role,
            action=action,
            target_id=target_id,
            details=details,
            ip_address=ip,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self.audit_logs.insert(0, entry)
        if len(self.audit_logs) > 200:
            self.audit_logs = self.audit_logs[:200]
        return entry

    def get_audit_logs(self, limit: int = 50) -> List[AuditLog]:
        return self.audit_logs[:limit]

    def get_notifications(self) -> List[SystemNotification]:
        return self.notifications

    def mark_notification_read(self, notif_id: str) -> bool:
        for n in self.notifications:
            if n.id == notif_id:
                n.is_read = True
                return True
        return False

    def clear_notifications(self) -> bool:
        self.notifications = []
        return True

    # --- Broadcast Center ---
    def send_broadcast(self, req: BroadcastRequest) -> Dict[str, Any]:
        b_id = f"bc-{uuid.uuid4().hex[:8]}"
        now_str = datetime.now(timezone.utc).isoformat()

        matched_users = []
        for u_record in self.users:
            u = u_record.get("user") if isinstance(u_record, dict) else u_record
            role = getattr(u, 'role', 'user') if u else 'user'
            if req.target_role == 'all':
                matched_users.append(u)
            elif req.target_role == 'reseller' and role in ['reseller', 'admin', 'super_admin']:
                matched_users.append(u)
            elif req.target_role == 'user' and role == 'user':
                matched_users.append(u)

        recipients_count = len(matched_users)
        telegram_sent_count = 0

        if req.send_telegram:
            try:
                from .services.telegram_service import TelegramService
                tg_text = (
                    f"📢 <b>{req.title}</b>\n\n"
                    f"{req.message}\n\n"
                    f"🌐 <i>RoleaTopup Official Announcement</i>"
                )
                bot_token = getattr(self.settings, 'telegram_bot_token', '') or os.getenv("TELEGRAM_BOT_TOKEN", "")

                for u in matched_users:
                    t_chat_id = getattr(u, 'telegram_chat_id', None)
                    if t_chat_id:
                        res = TelegramService.send_message(t_chat_id, tg_text, bot_token=bot_token)
                        if isinstance(res, dict) and res.get("success"):
                            telegram_sent_count += 1

                admin_chat = getattr(self.settings, 'telegram_chat_id', '') or os.getenv("TELEGRAM_CHAT_ID", "")
                if admin_chat:
                    TelegramService.send_message(admin_chat, tg_text, bot_token=bot_token)
            except Exception as e:
                print(f"[BROADCAST_TELEGRAM_WARN] {e}")

        # In-app notification broadcast
        notif_type = 'info'
        if req.type in ['info', 'warning', 'error', 'success']:
            notif_type = req.type
        elif req.type == 'promo':
            notif_type = 'success'

        notif = SystemNotification(
            id=f"notif-{uuid.uuid4().hex[:8]}",
            title=req.title,
            message=req.message,
            type=notif_type,
            is_read=False,
            link=req.link or "/dashboard",
            created_at=now_str
        )
        self.notifications.insert(0, notif)

        b_item = BroadcastItem(
            id=b_id,
            title=req.title,
            message=req.message,
            target_role=req.target_role,
            type=req.type,
            send_telegram=req.send_telegram,
            recipients_count=recipients_count,
            created_at=now_str,
            banner_url=req.banner_url,
            link=req.link
        )
        self.broadcasts.insert(0, b_item)
        self.log_audit("admin", "manager", "SEND_BROADCAST", b_id, f"Broadcast sent: '{req.title}' to {recipients_count} users")
        self.save_to_disk()

        return {
            "success": True,
            "data": b_item.model_dump(),
            "recipients_count": recipients_count,
            "telegram_sent_count": telegram_sent_count,
            "message": f"Broadcast '{req.title}' sent successfully!"
        }

    def get_broadcasts(self) -> List[BroadcastItem]:
        return self.broadcasts

    def delete_broadcast(self, broadcast_id: str) -> bool:
        initial = len(self.broadcasts)
        self.broadcasts = [b for b in self.broadcasts if b.id != broadcast_id]
        if len(self.broadcasts) < initial:
            self.save_to_disk()
            return True
        return False


    # --- Settings Operations ---
    def get_settings(self) -> PlatformSettings:
        return self.settings

    def update_settings(self, s: PlatformSettings) -> PlatformSettings:
        self.settings = s
        self.log_audit("admin", "super_admin", "UPDATE_SETTINGS", "platform_settings", "Updated platform settings")
        return self.settings

    # --- Wallet Ledger ---
    def get_wallet_ledger(self, limit: int = 50) -> List[WalletLedgerEntry]:
        return self.wallet_ledger[:limit]

    # --- Sync Logs & Pricing Config ---
    def save_sync_log(self, log: SyncLog) -> SyncLog:
        self.sync_logs.insert(0, log)
        if len(self.sync_logs) > 100:
            self.sync_logs = self.sync_logs[:100]
        return log

    def get_sync_logs(self, limit: int = 50) -> List[SyncLog]:
        return self.sync_logs[:limit]

    def get_pricing_config(self) -> PricingConfig:
        return self.pricing_config

    def get_raksmeypay_config(self) -> RaksmeyPayConfig:
        return self.raksmeypay_config

    def update_raksmeypay_config(self, cfg: RaksmeyPayConfig) -> RaksmeyPayConfig:
        self.raksmeypay_config = cfg
        for pm in self.payment_methods:
            if pm.id == "raksmeypay":
                pm.is_active = cfg.is_active
                pm.profile_id = cfg.profile_id
                pm.profile_key = cfg.profile_key
                pm.account_number = f"Profile ID: {cfg.profile_id}"
        self.log_audit("admin", "super_admin", "UPDATE_RAKSMEY_PAY_CONFIG", "raksmeypay", f"Updated Raksmey Pay Profile ID: {cfg.profile_id}")
        return self.raksmeypay_config

    def get_khpay_config(self) -> KHPayConfig:
        return self.khpay_config

    def update_khpay_config(self, cfg: KHPayConfig) -> KHPayConfig:
        self.khpay_config = cfg
        for pm in self.payment_methods:
            if pm.id == "khpay":
                pm.is_active = cfg.is_active
                pm.profile_id = cfg.merchant_id
                pm.profile_key = cfg.api_secret
                pm.account_number = f"Merchant ID: {cfg.merchant_id}"
        self.log_audit("admin", "super_admin", "UPDATE_KHPAY_CONFIG", "khpay", f"Updated KHPay Merchant ID: {cfg.merchant_id}")
        return self.khpay_config

    def get_vngzz_config(self) -> VngzzPaymentConfig:
        return self.vngzz_config

    def update_vngzz_config(self, cfg: VngzzPaymentConfig) -> VngzzPaymentConfig:
        self.vngzz_config = cfg
        for pm in self.payment_methods:
            if pm.id == "vngzz2game":
                pm.is_active = cfg.is_active
                pm.profile_id = cfg.api_key
                pm.account_name = cfg.merchant_name
        self.log_audit("admin", "super_admin", "UPDATE_VNGZZ_CONFIG", "vngzz", f"Updated VngZz 2 Game PayWay KHQR Gateway Config")
        return self.vngzz_config

    def get_khqrcc_config(self) -> KHQRCCConfig:
        return self.khqrcc_config

    def update_khqrcc_config(self, cfg: KHQRCCConfig) -> KHQRCCConfig:
        self.khqrcc_config = cfg
        for pm in self.payment_methods:
            if pm.id == "khqrcc":
                pm.is_active = cfg.is_active
                pm.profile_id = cfg.merchant_id
                pm.profile_key = cfg.api_secret
                pm.account_number = f"Merchant ID: {cfg.merchant_id}"
        self.log_audit("admin", "super_admin", "UPDATE_KHQRCC_CONFIG", "khqrcc", f"Updated KHQR.CC Merchant ID: {cfg.merchant_id}")
        return self.khqrcc_config

    def get_gamer_verification_settings(self) -> GamerVerificationSettings:
        return self.gamer_verification_settings

    def update_gamer_verification_settings(self, settings: GamerVerificationSettings) -> GamerVerificationSettings:
        self.gamer_verification_settings = settings
        self.log_audit("admin", "super_admin", "UPDATE_GAMER_VERIFICATION_SETTINGS", "gamer_verification", "Updated Gamer Verification Settings")
        return self.gamer_verification_settings

    def get_cached_gamer_verification(self, game: str, user_id: str, zone_id: Optional[str] = "") -> Optional[Dict[str, Any]]:
        cache_key = f"{game}:{user_id}:{zone_id or ''}"
        cached = self.gamer_verification_cache.get(cache_key)
        if cached:
            duration = self.gamer_verification_settings.cache_duration
            if time.time() - cached.get("timestamp", 0) <= duration:
                return cached.get("data")
        return None

    def set_cached_gamer_verification(self, game: str, user_id: str, zone_id: Optional[str], data: Dict[str, Any]):
        cache_key = f"{game}:{user_id}:{zone_id or ''}"
        self.gamer_verification_cache[cache_key] = {
            "timestamp": time.time(),
            "data": data
        }

    def log_gamer_verification(self, game: str, user_id: str, zone_id: Optional[str], player_name: Optional[str], success: bool, provider: str, response_time_ms: int):
        log_entry = GamerVerificationLog(
            id=f"glog-{uuid.uuid4().hex[:8]}",
            game=game,
            userId=user_id,
            zoneId=zone_id or "",
            playerName=player_name,
            success=success,
            provider=provider,
            responseTimeMs=response_time_ms,
            createdAt=datetime.now(timezone.utc).isoformat()
        )
        self.gamer_verification_logs.insert(0, log_entry)
        if len(self.gamer_verification_logs) > 200:
            self.gamer_verification_logs = self.gamer_verification_logs[:200]
        return log_entry

    def get_gamer_verification_logs(self, limit: int = 50) -> List[GamerVerificationLog]:
        return self.gamer_verification_logs[:limit]

    # --- Support Ticket Operations ---
    def create_support_ticket(self, req: TicketCreateRequest, user: Optional[User] = None) -> SupportTicket:
        t_id = f"TCK-{int(time.time()*1000)}-{uuid.uuid4().hex[:4].upper()}"
        ref = f"REF-{uuid.uuid4().hex[:6].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        u_id = user.id if user else (req.user_id or "guest")
        u_name = user.username if user else (req.username or "Customer")
        u_email = user.email if user else (req.email or "customer@roleatopup.com")

        initial_msg = TicketMessage(
            id=f"msg-{uuid.uuid4().hex[:8]}",
            sender_role="user",
            sender_name=u_name,
            message=req.message,
            attachments=req.attachments or [],
            created_at=now_iso
        )

        ticket = SupportTicket(
            id=t_id,
            reference=ref,
            user_id=u_id,
            username=u_name,
            email=u_email,
            subject=req.subject,
            category=req.category,
            priority=req.priority,
            status="open",
            order_id=req.order_id,
            telegram_chat_id=req.telegram_chat_id,
            channel=req.channel or ("telegram" if req.telegram_chat_id else "website"),
            messages=[initial_msg],
            created_at=now_iso,
            updated_at=now_iso
        )
        self.tickets.insert(0, ticket)
        self.log_audit("user", u_name, "CREATE_SUPPORT_TICKET", ticket.id, f"Created support ticket: {ticket.subject}")
        self.save_to_disk()
        return ticket

    def get_active_ticket_by_telegram_chat_id(self, chat_id: str) -> Optional[SupportTicket]:
        str_cid = str(chat_id)
        for t in self.tickets:
            if getattr(t, 'telegram_chat_id', None) == str_cid and t.status in ["open", "in_progress"]:
                return t
        return None

    def create_telegram_support_ticket(
        self, 
        chat_id: str, 
        sender_name: str, 
        message: str, 
        telegram_username: Optional[str] = None, 
        telegram_photo_url: Optional[str] = None
    ) -> SupportTicket:
        t_id = f"TCK-TG-{int(time.time()*1000)}-{uuid.uuid4().hex[:4].upper()}"
        ref = f"TG-{uuid.uuid4().hex[:6].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        disp_name = sender_name.strip() if sender_name else f"User_{chat_id[-4:]}"
        initial_msg = TicketMessage(
            id=f"msg-{uuid.uuid4().hex[:8]}",
            sender_role="user",
            sender_name=disp_name,
            message=message,
            attachments=[],
            created_at=now_iso
        )

        linked_user = self.get_user_by_telegram_chat_id(str(chat_id), telegram_username)

        ticket = SupportTicket(
            id=t_id,
            reference=ref,
            user_id=f"tg_{chat_id}",
            username=disp_name,
            email=f"tg_{chat_id}@telegram.user",
            subject=f"[Telegram] {message[:40]}..." if len(message) > 40 else f"[Telegram] {message}",
            category="general",
            priority="medium",
            status="open",
            order_id=None,
            telegram_chat_id=str(chat_id),
            telegram_username=telegram_username,
            telegram_photo_url=telegram_photo_url or getattr(linked_user, 'telegram_photo_url', None),
            channel="telegram",
            linked_user_id=getattr(linked_user, 'id', None),
            linked_username=getattr(linked_user, 'username', None),
            linked_email=getattr(linked_user, 'email', None),
            messages=[initial_msg],
            created_at=now_iso,
            updated_at=now_iso
        )
        self.tickets.insert(0, ticket)
        self.log_audit("user", disp_name, "CREATE_TELEGRAM_SUPPORT_TICKET", ticket.id, f"Created telegram support ticket: {ticket.subject}")
        self.save_to_disk()
        return ticket

    def link_ticket_to_user(self, ticket_id: str, user_id: str) -> Optional[SupportTicket]:
        ticket = self.get_support_ticket_by_id(ticket_id)
        if not ticket:
            return None

        entry = self.get_user_entry_by_id(user_id) or self.get_user_entry_by_username_or_email(user_id)
        if not entry:
            return None

        user = entry["user"]
        setattr(ticket, "linked_user_id", user.id)
        setattr(ticket, "linked_username", user.username)
        setattr(ticket, "linked_email", user.email)

        if getattr(ticket, "telegram_chat_id", None):
            setattr(user, "telegram_chat_id", getattr(ticket, "telegram_chat_id"))
            if getattr(ticket, "telegram_username", None):
                setattr(user, "telegram_username", getattr(ticket, "telegram_username"))
            if getattr(ticket, "telegram_photo_url", None):
                setattr(user, "telegram_photo_url", getattr(ticket, "telegram_photo_url"))
            setattr(user, "telegram_linked_at", datetime.now(timezone.utc).isoformat())

        self.save_to_disk()
        return ticket

    def auto_close_inactive_tickets(self) -> int:
        now = datetime.now(timezone.utc)
        closed_count = 0
        from .services.telegram_service import TelegramService
        for t in self.tickets:
            if t.status in ["open", "in_progress"]:
                last_time_str = getattr(t, 'updated_at', None) or getattr(t, 'created_at', None)
                if last_time_str:
                    try:
                        dt = datetime.fromisoformat(last_time_str.replace("Z", "+00:00"))
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=timezone.utc)
                        seconds_inactive = (now - dt).total_seconds()
                        if seconds_inactive >= 12 * 3600:  # 12 hours
                            t.status = "closed"
                            t.updated_at = now.isoformat()
                            closed_count += 1
                            sys_msg = TicketMessage(
                                id=f"msg-{uuid.uuid4().hex[:8]}",
                                sender_role="system",
                                sender_name="System",
                                message="[ប្រព័ន្ធបានបិទ Ticket នេះដោយស្វ័យប្រវត្តិ ដោយសារគ្មានការឆ្លើយតបរយៈពេល 12 ម៉ោង]",
                                attachments=[],
                                created_at=now.isoformat()
                            )
                            t.messages.append(sys_msg)
                            tg_chat = getattr(t, 'telegram_chat_id', None)
                            if tg_chat:
                                ref = getattr(t, 'reference', t.id)
                                alert_msg = (
                                    f"<b>[ការជូនដំណឹងពី Support Center]</b>\n"
                                    f"----------------------------------------\n"
                                    f"Support Ticket របស់អ្នកលេខ <b>#{ref}</b> ត្រូវបានបិទដោយស្វ័យប្រវត្តិ ដោយសារគ្មានសកម្មភាពឆ្លើយតបរយៈពេល 12 ម៉ោង។\n\n"
                                    f"ប្រសិនបើលោកអ្នកមានចម្ងល់បន្ថែម លោកអ្នកអាចបង្កើត Ticket ថ្មីបានគ្រប់ពេល។\n"
                                    f"----------------------------------------"
                                )
                                TelegramService.send_message(text=alert_msg, chat_id=tg_chat)
                    except Exception as e:
                        print(f"[AUTO_CLOSE_TICKETS_ERROR] {e}")
        if closed_count > 0:
            self.save_to_disk()
        return closed_count

    def get_support_tickets(self, user_id: Optional[str] = None, status: Optional[str] = None, category: Optional[str] = None) -> List[SupportTicket]:
        self.auto_close_inactive_tickets()
        res = self.tickets
        if user_id and user_id.lower() not in ["admin", "all", "super_admin"]:
            res = [t for t in res if t.user_id.lower() == user_id.lower()]
        if status and status != "all":
            res = [t for t in res if t.status.lower() == status.lower()]
        if category and category != "all":
            res = [t for t in res if t.category.lower() == category.lower()]
        return res

    def get_support_ticket_by_id(self, ticket_id: str) -> Optional[SupportTicket]:
        self.auto_close_inactive_tickets()
        for t in self.tickets:
            if t.id.lower() == ticket_id.lower() or t.reference.lower() == ticket_id.lower():
                return t
        return None

    def add_ticket_reply(
        self, 
        ticket_id: str, 
        sender_role: str, 
        sender_name: str, 
        message: str, 
        attachments: Optional[List[str]] = None,
        reply_to: Optional[Dict[str, Any]] = None
    ) -> Optional[SupportTicket]:
        ticket = self.get_support_ticket_by_id(ticket_id)
        if not ticket:
            return None
        now_iso = datetime.now(timezone.utc).isoformat()
        msg = TicketMessage(
            id=f"msg-{uuid.uuid4().hex[:8]}",
            sender_role="admin" if sender_role in ["admin", "super_admin", "support"] else "user",
            sender_name=sender_name,
            message=message,
            attachments=attachments or [],
            reply_to=reply_to,
            created_at=now_iso
        )
        ticket.messages.append(msg)
        ticket.updated_at = now_iso
        if sender_role in ["admin", "super_admin", "support"] and ticket.status == "open":
            ticket.status = "in_progress"
        elif sender_role == "user" and ticket.status in ["resolved", "closed"]:
            ticket.status = "open"
        self.log_audit(sender_role, sender_name, "REPLY_SUPPORT_TICKET", ticket_id, f"Replied to ticket {ticket_id}")
        self.save_to_disk()
        return ticket

    def update_ticket_status(self, ticket_id: str, status: str) -> Optional[SupportTicket]:
        ticket = self.get_support_ticket_by_id(ticket_id)
        if not ticket:
            return None
        old_status = ticket.status
        ticket.status = status
        ticket.updated_at = datetime.now(timezone.utc).isoformat()

        if status in ["closed", "resolved"] and old_status not in ["closed", "resolved"]:
            tg_chat = getattr(ticket, 'telegram_chat_id', None)
            if tg_chat:
                from .services.telegram_service import TelegramService
                ref = getattr(ticket, 'reference', ticket.id)
                status_kh = "បិទ" if status == "closed" else "ដោះស្រាយរួចរាល់"
                alert_msg = (
                    f"<b>[ការជូនដំណឹងពី Support Center]</b>\n"
                    f"----------------------------------------\n"
                    f"Support Ticket របស់អ្នកលេខ <b>#{ref}</b> ត្រូវបាន<b>{status_kh}</b>រួចរាល់ហើយ។\n\n"
                    f"សូមអរគុណសម្រាប់ការប្រើប្រាស់សេវាកម្ម Rolea TopUp!\n"
                    f"ប្រសិនបើលោកអ្នកមានចម្ងល់បន្ថែម លោកអ្នកអាចបង្កើត Ticket ថ្មីបានគ្រប់ពេល។\n"
                    f"----------------------------------------"
                )
                TelegramService.send_message(text=alert_msg, chat_id=tg_chat)

        self.log_audit("admin", "support", "UPDATE_TICKET_STATUS", ticket_id, f"Updated ticket status to {status}")
        self.save_to_disk()
        return ticket

    def edit_ticket_message(self, ticket_id: str, message_id: str, new_text: str) -> Optional[SupportTicket]:
        ticket = self.get_support_ticket_by_id(ticket_id)
        if not ticket:
            return None
        for m in ticket.messages:
            if m.id == message_id:
                m.message = new_text
                setattr(m, 'is_edited', True)
                break
        ticket.updated_at = datetime.now(timezone.utc).isoformat()
        self.save_to_disk()
        return ticket

    def delete_ticket_message(self, ticket_id: str, message_id: str) -> Optional[SupportTicket]:
        ticket = self.get_support_ticket_by_id(ticket_id)
        if not ticket:
            return None
        ticket.messages = [m for m in ticket.messages if m.id != message_id]
        if getattr(ticket, 'pinned_message_id', None) == message_id:
            setattr(ticket, 'pinned_message_id', None)
        ticket.updated_at = datetime.now(timezone.utc).isoformat()
        self.save_to_disk()
        return ticket

    def pin_ticket_message(self, ticket_id: str, message_id: Optional[str]) -> Optional[SupportTicket]:
        ticket = self.get_support_ticket_by_id(ticket_id)
        if not ticket:
            return None
        setattr(ticket, 'pinned_message_id', message_id)
        ticket.updated_at = datetime.now(timezone.utc).isoformat()
        self.save_to_disk()
        return ticket

    def delete_support_ticket(self, ticket_id: str) -> bool:
        t_id = ticket_id.lower()
        initial_len = len(self.tickets)
        self.tickets = [t for t in self.tickets if t.id.lower() != t_id and (getattr(t, 'reference', '') or '').lower() != t_id]
        if len(self.tickets) < initial_len:
            self.log_audit("admin", "support", "DELETE_SUPPORT_TICKET", ticket_id, f"Deleted ticket {ticket_id}")
            self.save_to_disk()
            return True
        return False

    def create_password_reset_record(self, email: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Creates a password reset record with hashed OTP and 10-minute expiry.
        Returns (record_id, plain_otp_code) if user exists, or (None, None) if user not found.
        """
        clean_email = email.strip().lower()
        if not hasattr(self, "password_resets") or self.password_resets is None:
            self.password_resets = []

        user_entry = self.get_user_entry_by_username_or_email(clean_email)
        if not user_entry:
            return None, None

        user = user_entry["user"]

        now = time.time()
        for rec in self.password_resets:
            if rec.get("email") == user.email.lower() and not rec.get("used") and not rec.get("invalidated"):
                resend_at = rec.get("resend_available_at", 0)
                if now < resend_at:
                    raise ValueError(f"សូមរង់ចាំ {int(resend_at - now)} វិនាទីទៀត មុនពេលស្នើសុំលេខកូដថ្មី (Please wait {int(resend_at - now)} seconds before requesting a new code).")

        for rec in self.password_resets:
            if rec.get("email") == user.email.lower() and not rec.get("used"):
                rec["invalidated"] = True

        otp_code = f"{random.randint(100000, 999999)}"
        import hashlib
        otp_hash = hashlib.sha256(otp_code.encode("utf-8")).hexdigest()

        rec_id = f"pr_{uuid.uuid4().hex[:12]}"
        record = {
            "id": rec_id,
            "user_id": user.id,
            "email": user.email.lower(),
            "otp_hash": otp_hash,
            "expires_at": now + 600,
            "resend_available_at": now + 60,
            "attempts": 0,
            "max_attempts": 5,
            "used": False,
            "invalidated": False,
            "reset_token": None,
            "reset_token_expires_at": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.password_resets.append(record)
        self.save_to_disk()

        return rec_id, otp_code

    def verify_password_reset_code(self, email: str, code: str) -> Dict[str, Any]:
        clean_email = email.strip().lower()
        clean_code = code.strip()

        if not hasattr(self, "password_resets") or not self.password_resets:
            return {"success": False, "detail": "Invalid verification code"}

        user_entry = self.get_user_entry_by_username_or_email(clean_email)
        target_email = user_entry["user"].email.lower() if user_entry else clean_email
        user_id = user_entry["user"].id if user_entry else None

        now = time.time()
        matching_recs = [
            r for r in self.password_resets
            if (r.get("email") == target_email or r.get("email") == clean_email or (user_id and r.get("user_id") == user_id))
            and not r.get("used") and not r.get("invalidated")
        ]
        if not matching_recs:
            return {"success": False, "detail": "Invalid verification code"}

        record = matching_recs[-1]

        if now > record.get("expires_at", 0):
            record["invalidated"] = True
            self.save_to_disk()
            return {"success": False, "detail": "Verification code has expired. Please request a new code."}

        if record.get("attempts", 0) >= record.get("max_attempts", 5):
            record["invalidated"] = True
            self.save_to_disk()
            return {"success": False, "detail": "Maximum verification attempts exceeded. Please request a new code."}

        record["attempts"] = record.get("attempts", 0) + 1

        import hashlib, hmac, secrets
        submitted_hash = hashlib.sha256(clean_code.encode("utf-8")).hexdigest()

        if not hmac.compare_digest(submitted_hash, record.get("otp_hash", "")):
            self.save_to_disk()
            return {"success": False, "detail": "Invalid verification code"}

        record["used"] = True
        reset_token = f"rst_{secrets.token_urlsafe(32)}"
        record["reset_token"] = reset_token
        record["reset_token_expires_at"] = now + 900

        self.save_to_disk()
        return {
            "success": True,
            "reset_token": reset_token,
            "message": "លេខកូដត្រូវផ្ទៀងផ្ទាត់ដោយជោគជ័យ (Code verified successfully)."
        }

    def execute_password_reset(self, reset_token: str, new_password: str, confirm_password: str) -> Dict[str, Any]:
        if not reset_token or not new_password:
            return {"success": False, "detail": "Invalid request payload."}

        if new_password != confirm_password:
            return {"success": False, "detail": "ពាក្យសម្ងាត់ និងការផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់មិនផ្ទៀងផ្ទាត់គ្នាទេ (Passwords do not match)."}

        if not hasattr(self, "password_resets") or not self.password_resets:
            return {"success": False, "detail": "Invalid or expired reset session. Please request a new code."}

        now = time.time()
        record = None
        for r in self.password_resets:
            if r.get("reset_token") == reset_token:
                record = r
                break

        if not record or now > record.get("reset_token_expires_at", 0):
            return {"success": False, "detail": "Reset session has expired. Please request a new verification code."}

        is_valid, score, strength_msg = AuthService.validate_password_strength(new_password)
        if not is_valid:
            return {"success": False, "detail": strength_msg}

        user_entry = self.get_user_entry_by_id(record.get("user_id")) or self.get_user_entry_by_username_or_email(record.get("email"))
        if not user_entry:
            return {"success": False, "detail": "User account not found."}

        user_entry["password_hash"] = AuthService.hash_password(new_password)
        user_entry["plain_password"] = new_password
        user_entry["password_plain"] = new_password
        user = user_entry.get("user")
        if user:
            setattr(user, "password_plain", new_password)
            setattr(user, "password_hash_preview", user_entry["password_hash"][:16] + "...")
            if getattr(user, "username", None):
                AuthService.reset_failed_login(user.username)

        AuthService.reset_failed_login(record.get("email"))

        record["reset_token"] = None
        record["invalidated"] = True

        self.save_to_disk()
        return {
            "success": True,
            "message": "Password reset successfully. Please login with your new password."
        }

    # --- Promoter System Business Logic ---
    def apply_promoter(self, data: PromoterApplyRequest, user: Optional[Dict[str, Any]] = None) -> PromoterApplication:
        user_obj = None
        if user:
            user_obj = user.get("user") if isinstance(user, dict) and "user" in user else user
        
        user_id = data.user_id or (getattr(user_obj, 'id', None) if user_obj else None) or f"usr-{uuid.uuid4().hex[:6]}"
        username = getattr(user_obj, 'username', data.full_name) if user_obj else data.full_name
        email = getattr(user_obj, 'email', '') if user_obj else ''

        existing = next((a for a in getattr(self, "promoter_applications", []) if a.user_id == user_id), None)
        if existing:
            if existing.status == 'approved':
                raise ValueError("អ្នកបានជា Promoter រួចហើយ (You are already an approved Promoter)")
            if existing.status == 'pending':
                raise ValueError("ពាក្យស្នើសុំរបស់អ្នកកំពុងរង់ចាំការពិនិត្យ (Your application is already PENDING review)")
            self.promoter_applications = [a for a in self.promoter_applications if a.user_id != user_id]

        now_str = datetime.now(timezone.utc).isoformat()
        app_id = f"PAPP-{uuid.uuid4().hex[:8].upper()}"
        
        app = PromoterApplication(
            id=app_id,
            user_id=user_id,
            full_name=data.full_name,
            username=username,
            email=email,
            phone=data.phone,
            telegram_username=data.telegram_username or "",
            payment_method=data.payment_method or "ABA Bank",
            payment_account=data.payment_account,
            qr_code_url=data.qr_code_url,
            reason=data.reason,
            social_links=data.social_links or "",
            avatar_url=data.avatar_url or "",
            status="pending",
            applied_at=now_str
        )
        if not hasattr(self, "promoter_applications"):
            self.promoter_applications = []
        self.promoter_applications.insert(0, app)
        self.save_to_disk()
        return app

    def get_promoter_applications(self, status: Optional[str] = None) -> List[PromoterApplication]:
        apps = getattr(self, "promoter_applications", [])
        if status:
            return [a for a in apps if a.status.lower() == status.lower()]
        return apps

    def review_promoter_application(self, app_id: str, review: PromoterReviewRequest) -> PromoterApplication:
        apps = getattr(self, "promoter_applications", [])
        app = next((a for a in apps if a.id == app_id), None)
        if not app:
            raise ValueError("រកមិនឃើញពាក្យស្នើសុំ (Promoter application not found)")

        now_str = datetime.now(timezone.utc).isoformat()
        app.status = review.status
        app.reviewed_at = now_str
        if review.reject_reason:
            app.reject_reason = review.reject_reason

        if review.status == 'approved':
            proms = getattr(self, "promoters", [])
            existing_promoter = next((p for p in proms if p.user_id == app.user_id), None)
            
            ref_code = review.referral_code
            if not ref_code:
                clean_name = re.sub(r'[^A-ZA-z0-9]', '', app.full_name or app.username).upper()
                ref_code = f"{clean_name[:6]}{random.randint(10,99)}"
            
            comm_rate = review.commission_rate if review.commission_rate is not None else getattr(self, "default_promoter_commission_rate", 0.3)

            if existing_promoter:
                existing_promoter.status = 'approved'
                existing_promoter.commission_rate = comm_rate
                if app.qr_code_url:
                    existing_promoter.qr_code_url = app.qr_code_url
                existing_promoter.updated_at = now_str
            else:
                p_id = f"PRM-{uuid.uuid4().hex[:8].upper()}"
                ref_link = f"https://roleatopup.com/?ref={ref_code}"
                promoter = Promoter(
                    id=p_id,
                    user_id=app.user_id,
                    full_name=app.full_name,
                    username=app.username,
                    email=app.email,
                    phone=app.phone,
                    telegram_username=app.telegram_username,
                    payment_method=app.payment_method,
                    payment_account=app.payment_account,
                    qr_code_url=app.qr_code_url,
                    referral_code=ref_code,
                    referral_link=ref_link,
                    commission_rate=comm_rate,
                    status='approved',
                    created_at=now_str,
                    updated_at=now_str
                )
                if not hasattr(self, "promoters"):
                    self.promoters = []
                self.promoters.insert(0, promoter)

        self.save_to_disk()
        return app

    def get_promoters(self) -> List[Promoter]:
        return getattr(self, "promoters", [])

    def get_promoter_by_user_id(self, user_id: str) -> Optional[Promoter]:
        proms = getattr(self, "promoters", [])
        return next((p for p in proms if p.user_id == user_id), None)

    def get_promoter_by_code(self, code: str) -> Optional[Promoter]:
        if not code:
            return None
        c_clean = code.strip().upper()
        proms = getattr(self, "promoters", [])
        return next((p for p in proms if p.referral_code.upper() == c_clean and p.status == 'approved'), None)

    def update_promoter(self, promoter_id: str, update: PromoterUpdateRequest) -> Optional[Promoter]:
        proms = getattr(self, "promoters", [])
        p = next((prom for prom in proms if prom.id == promoter_id or prom.user_id == promoter_id), None)
        if not p:
            return None
        if update.commission_rate is not None:
            p.commission_rate = update.commission_rate
        if update.referral_code:
            p.referral_code = update.referral_code.strip().upper()
            p.referral_link = f"https://roleatopup.com/?ref={p.referral_code}"
        if update.payment_account:
            p.payment_account = update.payment_account
        if update.status:
            p.status = update.status
        p.updated_at = datetime.now(timezone.utc).isoformat()
        self.save_to_disk()
        return p

    def verify_referral_code(self, code: str) -> Dict[str, Any]:
        p = self.get_promoter_by_code(code)
        if not p:
            return {"valid": False, "message": "កូដណែនាំមិនត្រឹមត្រូវ ឬមិនសកម្ម (Invalid or inactive referral code)"}
        return {
            "valid": True,
            "promoter_id": p.id,
            "referral_code": p.referral_code,
            "promoter_name": p.full_name,
            "commission_rate": p.commission_rate
        }

    def process_order_promoter_commission(self, order: Order):
        ref_code = getattr(order, 'referral_code', None)
        prom_id = getattr(order, 'promoter_id', None)

        if not ref_code and not prom_id and getattr(order, 'user_id', None):
            user_entry = self.get_user_entry_by_id(order.user_id)
            if user_entry and user_entry.get("user"):
                u_obj = user_entry["user"]
                ref_code = getattr(u_obj, "referred_by_code", None)
                prom_id = getattr(u_obj, "referred_by_promoter_id", None)

        if not ref_code and not prom_id:
            return

        comms = getattr(self, "promoter_commissions", [])
        existing_comm = next((c for c in comms if c.order_id == order.id), None)
        if existing_comm:
            return

        proms = getattr(self, "promoters", [])
        promoter = None
        if prom_id:
            promoter = next((p for p in proms if p.id == prom_id), None)
        if not promoter and ref_code:
            promoter = self.get_promoter_by_code(ref_code)

        if not promoter or promoter.status != 'approved':
            return

        comm_rate = promoter.commission_rate
        # Fixed 0.03 USD commission per order
        comm_amount = 0.03 if (comm_rate is None or comm_rate == 0.3 or comm_rate == 0.03) else round(max(0.03, order.amount_usd * (comm_rate / 100.0)), 4)

        now_str = datetime.now(timezone.utc).isoformat()
        comm = PromoterCommission(
            id=f"PCOMM-{uuid.uuid4().hex[:8].upper()}",
            promoter_id=promoter.id,
            order_id=order.id,
            order_reference=order.reference,
            customer_name=getattr(order, 'customer_contact', None) or "Gamer",
            order_amount_usd=order.amount_usd,
            commission_rate=comm_rate,
            commission_amount_usd=comm_amount,
            status="paid",
            created_at=now_str
        )
        if not hasattr(self, "promoter_commissions"):
            self.promoter_commissions = []
        self.promoter_commissions.insert(0, comm)

        promoter.total_orders += 1
        promoter.total_sales_usd = round(promoter.total_sales_usd + order.amount_usd, 2)
        promoter.total_commission_usd = round(promoter.total_commission_usd + comm_amount, 4)
        promoter.available_balance_usd = round(promoter.available_balance_usd + comm_amount, 4)
        promoter.updated_at = now_str
        self.save_to_disk()

    def request_promoter_withdrawal(self, user_id: str, req: PromoterWithdrawRequest) -> PromoterWithdrawal:
        p = self.get_promoter_by_user_id(user_id)
        if not p or p.status != 'approved':
            raise ValueError("គណនី Promoter មិនត្រូវបានអនុញ្ញាត (Promoter account not approved)")

        if req.amount_usd <= 0:
            raise ValueError("ចំនួនទឹកប្រាក់ត្រូវតែច្រើនជាង 0 (Amount must be greater than 0)")

        if p.available_balance_usd < req.amount_usd:
            raise ValueError(f"សមតុល្យមិនគ្រប់គ្រាន់ (Insufficient balance: ${p.available_balance_usd:.2f})")

        if req.qr_code_url:
            p.qr_code_url = req.qr_code_url

        p.available_balance_usd = round(p.available_balance_usd - req.amount_usd, 4)
        now_str = datetime.now(timezone.utc).isoformat()
        w = PromoterWithdrawal(
            id=f"PWITH-{uuid.uuid4().hex[:8].upper()}",
            promoter_id=p.id,
            user_id=p.user_id,
            full_name=p.full_name,
            amount_usd=req.amount_usd,
            payment_method=req.payment_method or p.payment_method or "ABA Bank",
            payment_account=req.payment_account or p.payment_account,
            qr_code_url=req.qr_code_url or getattr(p, 'qr_code_url', None),
            status="pending",
            requested_at=now_str
        )
        if not hasattr(self, "promoter_withdrawals"):
            self.promoter_withdrawals = []
        self.promoter_withdrawals.insert(0, w)
        self.save_to_disk()
        return w

    def get_promoter_withdrawals(self, promoter_id: Optional[str] = None) -> List[PromoterWithdrawal]:
        withdrawals = getattr(self, "promoter_withdrawals", [])
        if promoter_id:
            return [w for w in withdrawals if w.promoter_id == promoter_id or w.user_id == promoter_id]
        return withdrawals

    def review_promoter_withdrawal(self, withdrawal_id: str, status: str, reject_reason: Optional[str] = None) -> PromoterWithdrawal:
        withdrawals = getattr(self, "promoter_withdrawals", [])
        w = next((wit for wit in withdrawals if wit.id == withdrawal_id), None)
        if not w:
            raise ValueError("រកមិនឃើញសំណើដកប្រាក់ (Withdrawal request not found)")

        now_str = datetime.now(timezone.utc).isoformat()
        w.status = status
        w.processed_at = now_str
        if reject_reason:
            w.reject_reason = reject_reason

        proms = getattr(self, "promoters", [])
        p = next((prom for prom in proms if prom.id == w.promoter_id), None)
        if status == 'rejected' and p:
            p.available_balance_usd = round(p.available_balance_usd + w.amount_usd, 4)
        elif status == 'approved' and p:
            p.withdrawn_amount_usd = round(p.withdrawn_amount_usd + w.amount_usd, 4)

        self.save_to_disk()
        return w

    def get_promoter_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        apps = getattr(self, "promoter_applications", [])
        app = next((a for a in apps if a.user_id == user_id), None)
        p = self.get_promoter_by_user_id(user_id)
        
        comms = [c for c in getattr(self, "promoter_commissions", []) if p and c.promoter_id == p.id]
        withdrawals = [w for w in getattr(self, "promoter_withdrawals", []) if p and w.promoter_id == p.id]

        return {
            "application": app,
            "promoter": p,
            "commissions": comms,
            "withdrawals": withdrawals
        }


db = DataStore()
