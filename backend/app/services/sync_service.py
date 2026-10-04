import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from ..models.schemas import Game, ProductPackage, InputFieldDef, Provider, SyncLog, PricingConfig
from .provider_adapters import get_provider_adapter
from .pricing_service import PricingService

def resolve_game_thumbnail(slug: str) -> str:
    s = (slug or '').lower()
    if "valorant" in s or "val" in s:
        return "/images/games/valorant.png"
    elif "wild-rift" in s or "wildrift" in s or "lol" in s:
        return "/images/games/wildrift.png"
    elif "bloodstrike" in s or "blood" in s:
        return "/images/games/bloodstrike.png"
    elif "fc-mobile" in s or "fcmobile" in s or "fc" in s or "ea" in s:
        return "/images/games/fcmobile.png"
    elif "mobile-legends" in s or "mlbb" in s or "legend" in s:
        return "/images/games/mlbb.png"
    elif "free-fire" in s or "freefire" in s or "ff" in s:
        return "/images/games/freefire.png"
    elif "pubg" in s:
        return "/images/games/pubg.png"
    elif "honor-of-kings" in s or "hok" in s or "kings" in s:
        return "/images/games/hok.png"
    elif "roblox" in s:
        return "/images/games/roblox.png"
    elif "genshin" in s:
        return "/images/games/genshin.png"
    elif "call-of-duty" in s or "codm" in s or "duty" in s:
        return "/images/games/codm.png"
    elif "clash" in s or "coc" in s:
        return "/images/games/clashofclans.png"
    elif "steam" in s:
        return "/images/games/steam.png"
    elif "brawl" in s:
        return "/images/games/brawlstars.png"
    elif "arena-of-valor" in s or "aov" in s or "arena" in s:
        return "/images/games/aov.png"
    elif "chatgpt" in s or "gpt" in s:
        return "/images/games/chatgpt.png"
    elif "canva" in s:
        return "/images/games/canva.png"
    elif "netflix" in s:
        return "/images/games/netflix.png"
    elif "spotify" in s:
        return "/images/games/spotify.png"
    elif "youtube" in s:
        return "/images/games/youtube.png"
    elif "cellcard" in s:
        return "/images/games/cellcard.png"
    elif "smart" in s:
        return "/images/games/smart.png"
    elif "metfone" in s:
        return "/images/games/metfone.png"
    return "/images/games/mlbb.png"

class SyncService:
    @staticmethod
    def sync_games(provider_id: str, data_store: Any) -> Dict[str, Any]:
        start_time = time.time()
        provider = data_store.get_provider(provider_id)
        if not provider:
            return {"success": False, "message": f"Provider {provider_id} not found."}

        print(f"\n[PROVIDER SYNC]\nProvider: {provider.name}\nProvider ID: {provider.id}")
        print(f"[API REQUEST]\nGET {provider.name} Games")

        try:
            adapter = get_provider_adapter(provider)
            games_data = adapter.get_games()
            games_synced = 0
            print(f"[API RESPONSE]\nGames: {len(games_data)}")
            print(f"[DATABASE]\nUpserting games with provider_id={provider.id}")

            alias_map = {
                "pubgm": "pubg_mobile",
                "pubg_m_manul": "pubg_mobile",
                "hok": "hok_global",
                "roblox_us_cards": "roblox",
                "gfreect": "freefire_global",
                "freefire_eu": "freefire_global",
                "freefire_th": "freefire_global",
                "freefire_sgmy": "freefire_sgmy",
                "freefire": "freefire_global",
                "xbox": "xbox_giftcard",
                "nintendo": "nintendocard"
            }

            for g_data in games_data:
                raw_slug = str(g_data.get("slug") or g_data.get("id") or "").strip()
                if not raw_slug:
                    continue

                slug = alias_map.get(raw_slug.lower(), raw_slug)
                external_game_id = str(g_data.get("external_game_id") or g_data.get("provider_game_id") or g_data.get("id", raw_slug))
                
                # Match existing game STRICTLY within the SAME provider
                existing_game = next((
                    g for g in data_store.games 
                    if getattr(g, 'provider_id', '') == provider.id 
                    and (g.slug.lower() == slug.lower() or g.id.lower() == slug.lower() or g.id.lower() == f"b2g_{slug}".lower() or g.id.lower() == f"{provider.id}_{slug}".lower() or g.slug.lower() == raw_slug.lower() or getattr(g, 'external_game_id', '') == external_game_id or getattr(g, 'provider_game_id', '') == external_game_id)
                ), None)

                fields_def = [
                    InputFieldDef(
                        id=f.get("id", "user_id"),
                        label_en=f.get("label_en", "Player ID"),
                        label_km=f.get("label_km", "Player ID"),
                        placeholder_en=f.get("placeholder_en", "e.g. 12345678"),
                        placeholder_km=f.get("placeholder_km", "ឧទាហរណ៍ 12345678"),
                        required=f.get("required", True)
                    )
                    for f in g_data.get("fields", [])
                ]

                thumb_path = g_data.get("thumbnail") or resolve_game_thumbnail(slug)
                banner_path = g_data.get("banner") or thumb_path

                if existing_game:
                    if fields_def:
                        existing_game.fields = fields_def
                    if thumb_path:
                        existing_game.thumbnail = thumb_path
                    if banner_path:
                        existing_game.banner = banner_path
                    existing_game.primary_provider_id = provider.id
                    existing_game.provider_id = provider.id
                    existing_game.provider_game_id = external_game_id
                    existing_game.external_game_id = external_game_id
                else:
                    game_unique_id = f"{provider.id}_{slug}"
                    new_game = Game(
                        id=game_unique_id,
                        slug=slug,
                        name_en=g_data.get("name_en", slug.replace("-", " ").title()),
                        name_km=g_data.get("name_km", slug.replace("-", " ").title()),
                        subtitle_en=f"Instant {g_data.get('name_en', slug)} top-up via Cambodian KHQR",
                        subtitle_km=f"បញ្ចូលទឹកប្រាក់ {g_data.get('name_km', slug)} ស្វ័យប្រវត្តិ",
                        category=g_data.get("category", "mobile"),
                        publisher=g_data.get("publisher", provider.name),
                        region="Cambodia / Global",
                        thumbnail=thumb_path,
                        banner=banner_path,
                        currency_name_en="Credits",
                        currency_name_km="ពិន្ទុ",
                        instant_delivery=True,
                        is_active=True,
                        primary_provider_id=provider.id,
                        provider_id=provider.id,
                        provider_game_id=external_game_id,
                        external_game_id=external_game_id,
                        supported_providers=[provider.id],
                        fields=fields_def,
                        packages=[]
                    )
                    data_store.games.append(new_game)
                
                games_synced += 1

            duration_ms = int((time.time() - start_time) * 1000)
            now_iso = datetime.now(timezone.utc).isoformat()
            
            provider.last_sync_at = now_iso
            provider.last_sync_status = "success"
            provider.last_sync_error = None
            provider.sync_games_count = games_synced

            log = SyncLog(
                id=f"sync-{uuid.uuid4().hex[:8]}",
                provider_id=provider.id,
                provider_name=provider.name,
                sync_type="games",
                games_synced=games_synced,
                products_synced=0,
                status="success",
                duration_ms=duration_ms,
                created_at=now_iso
            )
            data_store.save_sync_log(log)

            return {
                "success": True,
                "message": f"Successfully synced {games_synced} games from {provider.name}.",
                "games_synced": games_synced,
                "duration_ms": duration_ms
            }

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            now_iso = datetime.now(timezone.utc).isoformat()
            error_msg = str(e)
            
            provider.last_sync_at = now_iso
            provider.last_sync_status = "error"
            provider.last_sync_error = error_msg

            log = SyncLog(
                id=f"sync-{uuid.uuid4().hex[:8]}",
                provider_id=provider.id,
                provider_name=provider.name,
                sync_type="games",
                games_synced=0,
                products_synced=0,
                status="error",
                error_message=error_msg,
                duration_ms=duration_ms,
                created_at=now_iso
            )
            data_store.save_sync_log(log)

            return {
                "success": False,
                "message": f"Sync failed: {error_msg}",
                "error": error_msg
            }

    @staticmethod
    def sync_products(provider_id: str, data_store: Any, game_slug: Optional[str] = None) -> Dict[str, Any]:
        start_time = time.time()
        provider = data_store.get_provider(provider_id)
        if not provider:
            return {"success": False, "message": f"Provider {provider_id} not found."}

        try:
            adapter = get_provider_adapter(provider)
            target_games = [
                g for g in data_store.games 
                if getattr(g, 'provider_id', '') == provider.id and (not game_slug or g.slug == game_slug)
            ]
            total_products_synced = 0
            pricing_cfg = data_store.get_pricing_config() if hasattr(data_store, 'get_pricing_config') else data_store.pricing_config

            for game in target_games:
                products_data = adapter.get_products(game.slug)
                if not products_data:
                    products_data = adapter.get_products(game.id)

                for p_data in products_data:
                    prov_prod_id = str(p_data.get("provider_product_id") or p_data.get("external_product_id") or p_data.get("sku") or f"{provider.id}-{p_data.get('name_en')}")
                    cost_usd = float(p_data.get("cost_usd", 0.0))

                    # Check if package exists strictly in this provider's game
                    existing_pkg = next((
                        p for p in game.packages 
                        if getattr(p, 'provider_id', '') == provider.id 
                        and (p.provider_product_id == prov_prod_id or getattr(p, 'external_product_id', None) == prov_prod_id or p.id == prov_prod_id or p.name_en == p_data.get("name_en"))
                    ), None)

                    # Calculate markup prices
                    prices = PricingService.calculate_prices_from_cost(cost_usd, pricing_cfg)

                    if existing_pkg:
                        existing_pkg.cost_usd = cost_usd
                        existing_pkg.provider_id = provider.id
                        existing_pkg.provider_product_id = prov_prod_id
                        existing_pkg.external_product_id = prov_prod_id
                        existing_pkg.provider_sku = p_data.get("sku")
                        
                        if not existing_pkg.manual_price_override and pricing_cfg.auto_update_prices_on_sync:
                            existing_pkg.price_user_usd = prices["price_user_usd"]
                            existing_pkg.price_reseller_usd = prices["price_reseller_usd"]
                            existing_pkg.price_vip_usd = prices["price_vip_usd"]
                    else:
                        new_pkg = ProductPackage(
                            id=f"{provider.id}_{game.slug}_{prov_prod_id}",
                            game_slug=game.slug,
                            name_en=p_data.get("name_en", "Game Package"),
                            name_km=p_data.get("name_km", p_data.get("name_en", "កញ្ចប់ហ្គេម")),
                            cost_usd=cost_usd,
                            price_user_usd=prices["price_user_usd"],
                            price_reseller_usd=prices["price_reseller_usd"],
                            price_vip_usd=prices["price_vip_usd"],
                            bonus_en=p_data.get("bonus_en"),
                            bonus_km=p_data.get("bonus_km"),
                            popular=p_data.get("popular", False),
                            is_active=True,
                            provider_id=provider.id,
                            provider_product_id=prov_prod_id,
                            external_product_id=prov_prod_id,
                            provider_sku=p_data.get("sku")
                        )
                        game.packages.append(new_pkg)

                    total_products_synced += 1

                # Sort packages: Weekly Passes first, then ascending by user price
                game.packages.sort(key=lambda x: (
                    0 if "weekly" in x.name_en.lower() and "2x" not in x.name_en.lower() and "3x" not in x.name_en.lower() and "4x" not in x.name_en.lower() and "5x" not in x.name_en.lower()
                    else 1 if "2x weekly" in x.name_en.lower()
                    else 2 if "3x weekly" in x.name_en.lower()
                    else 3 if "4x weekly" in x.name_en.lower()
                    else 4 if "5x weekly" in x.name_en.lower()
                    else 5 if "twilight" in x.name_en.lower()
                    else 6 if "pass" in x.name_en.lower() or "pack" in x.name_en.lower()
                    else 10,
                    x.price_user_usd
                ))

            duration_ms = int((time.time() - start_time) * 1000)
            now_iso = datetime.now(timezone.utc).isoformat()

            provider.last_sync_at = now_iso
            provider.last_sync_status = "success"
            provider.last_sync_error = None
            provider.sync_products_count = total_products_synced

            print(f"[PRODUCT SYNC]\nProvider: {provider.name}\nProducts: {total_products_synced}")
            print(f"[SYNC COMPLETE]\nProvider: {provider.id}\nGames: {len(target_games)}\nProducts: {total_products_synced}\n")

            log = SyncLog(
                id=f"sync-{uuid.uuid4().hex[:8]}",
                provider_id=provider.id,
                provider_name=provider.name,
                sync_type="products",
                games_synced=0,
                products_synced=total_products_synced,
                status="success",
                duration_ms=duration_ms,
                created_at=now_iso
            )
            data_store.save_sync_log(log)

            return {
                "success": True,
                "message": f"Successfully synced {total_products_synced} product packages from {provider.name}.",
                "products_synced": total_products_synced,
                "duration_ms": duration_ms
            }

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            now_iso = datetime.now(timezone.utc).isoformat()
            error_msg = str(e)

            provider.last_sync_at = now_iso
            provider.last_sync_status = "error"
            provider.last_sync_error = error_msg

            log = SyncLog(
                id=f"sync-{uuid.uuid4().hex[:8]}",
                provider_id=provider.id,
                provider_name=provider.name,
                sync_type="products",
                games_synced=0,
                products_synced=0,
                status="error",
                error_message=error_msg,
                duration_ms=duration_ms,
                created_at=now_iso
            )
            data_store.save_sync_log(log)

            return {
                "success": False,
                "message": f"Product sync failed: {error_msg}",
                "error": error_msg
            }

    @staticmethod
    def sync_all(data_store: Any) -> Dict[str, Any]:
        results = []
        provs = data_store.get_providers() if hasattr(data_store, 'get_providers') else getattr(data_store, 'providers', [])
        for prov in provs:
            if getattr(prov, 'status', 'active') == "active":
                try:
                    res_games = SyncService.sync_games(prov.id, data_store)
                    res_products = SyncService.sync_products(prov.id, data_store)
                    results.append({
                        "provider": prov.name,
                        "games": res_games,
                        "products": res_products
                    })
                except Exception as ex:
                    print(f"[SYNC_ALL_WARN] Exception syncing provider {getattr(prov, 'name', prov.id)}: {ex}")
                    results.append({
                        "provider": getattr(prov, 'name', prov.id),
                        "success": False,
                        "error": str(ex)
                    })
        data_store.save_to_disk()
        return {"success": True, "message": "API Sync All completed successfully", "results": results}

