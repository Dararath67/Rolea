import sys
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.data_store import db

client = TestClient(app)

def test_get_connected_api_games():
    """Test retrieving connected API games catalog"""
    res = client.get("/api/v1/admin/api-games")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "data" in data
    assert data["total"] >= 10

    # Verify game fields
    sample_game = data["data"][0]
    assert "id" in sample_game
    assert "slug" in sample_game
    assert "name_en" in sample_game
    assert "provider_id" in sample_game
    assert "provider_name" in sample_game
    assert "external_game_id" in sample_game
    assert "is_active" in sample_game
    assert "products_count" in sample_game
    assert "active_products_count" in sample_game

def test_api_games_filtering():
    """Test filtering by provider and status"""
    # Filter by provider
    res_smileone = client.get("/api/v1/admin/api-games?provider_id=smileone")
    assert res_smileone.status_code == 200
    for g in res_smileone.json()["data"]:
        assert g["provider_id"] == "smileone"

    # Filter by ON status
    res_on = client.get("/api/v1/admin/api-games?status=on")
    assert res_on.status_code == 200
    for g in res_on.json()["data"]:
        assert g["is_active"] is True

def test_game_publishing_toggle_and_storefront_isolation():
    """Test toggle OFF hides game from public, toggle ON publishes it"""
    # 1. Ensure MLBB is active initially
    mlbb = db.get_game_by_slug("mobile-legends", active_only=False)
    assert mlbb is not None
    if not mlbb.is_active:
        client.patch("/api/v1/admin/api-games/mlbb/toggle")

    # 2. Check public storefront can view MLBB
    res_pub = client.get("/api/v1/games/mobile-legends")
    assert res_pub.status_code == 200
    assert res_pub.json()["data"]["slug"] == "mobile-legends"

    # 3. Toggle MLBB OFF (Unpublished)
    res_toggle_off = client.patch("/api/v1/admin/api-games/mlbb/toggle")
    assert res_toggle_off.status_code == 200
    assert res_toggle_off.json()["is_active"] is False

    # 4. Public storefront should now return 404
    res_pub_hidden = client.get("/api/v1/games/mobile-legends")
    assert res_pub_hidden.status_code == 404

    # 5. Public game listing should NOT include MLBB
    res_pub_list = client.get("/api/v1/games")
    assert res_pub_list.status_code == 200
    public_slugs = [g["slug"] for g in res_pub_list.json()["data"]]
    assert "mobile-legends" not in public_slugs

    # 6. Toggle MLBB back ON (Published)
    res_toggle_on = client.patch("/api/v1/admin/api-games/mlbb/toggle")
    assert res_toggle_on.status_code == 200
    assert res_toggle_on.json()["is_active"] is True

    # 7. Public storefront should now return 200 again
    res_pub_restored = client.get("/api/v1/games/mobile-legends")
    assert res_pub_restored.status_code == 200
    assert res_pub_restored.json()["data"]["name_en"] == "Mobile Legends: Bang Bang"

def test_product_sku_toggle_publishing():
    """Test individual diamond package ON/OFF toggle"""
    # 1. Get MLBB products from admin
    res_admin_prods = client.get("/api/v1/admin/api-games/mlbb/products")
    assert res_admin_prods.status_code == 200
    packages = res_admin_prods.json()["data"]
    target_pkg = packages[0]
    pkg_id = target_pkg["id"]

    # 2. Check public products endpoint
    res_pub_prods = client.get("/api/v1/games/mobile-legends/products")
    assert res_pub_prods.status_code == 200
    initial_pub_ids = [p["id"] for p in res_pub_prods.json()["data"]]
    assert pkg_id in initial_pub_ids

    # 3. Toggle product package OFF
    res_toggle_pkg_off = client.patch(f"/api/v1/admin/products/{pkg_id}/toggle?game_slug=mobile-legends")
    assert res_toggle_pkg_off.status_code == 200
    assert res_toggle_pkg_off.json()["is_active"] is False

    # 4. Public endpoint should now exclude the disabled SKU
    res_pub_prods_after = client.get("/api/v1/games/mobile-legends/products")
    assert res_pub_prods_after.status_code == 200
    updated_pub_ids = [p["id"] for p in res_pub_prods_after.json()["data"]]
    assert pkg_id not in updated_pub_ids

    # 5. Toggle product package back ON
    res_toggle_pkg_on = client.patch(f"/api/v1/admin/products/{pkg_id}/toggle?game_slug=mobile-legends")
    assert res_toggle_pkg_on.status_code == 200
    assert res_toggle_pkg_on.json()["is_active"] is True

    # 6. Public endpoint has restored the SKU
    res_pub_prods_final = client.get("/api/v1/games/mobile-legends/products")
    final_pub_ids = [p["id"] for p in res_pub_prods_final.json()["data"]]
    assert pkg_id in final_pub_ids

def test_resync_preserves_admin_publishing_choices():
    """Test that re-syncing API feeds updates costs but strictly preserves ON/OFF states"""
    # 1. Turn Free Fire OFF
    ff = db.get_game_by_slug("free-fire", active_only=False)
    assert ff is not None
    if ff.is_active:
        res = client.patch("/api/v1/admin/api-games/free-fire/toggle")
        assert res.status_code == 200
        assert res.json()["is_active"] is False
    
    ff_updated = db.get_game_by_slug("free-fire", active_only=False)
    assert ff_updated.is_active is False

    # 2. Trigger provider sync
    res_sync = client.post("/api/v1/admin/providers/smileone/sync-games")
    assert res_sync.status_code == 200

    # 3. Verify Free Fire is STILL OFF
    ff_after_sync = db.get_game_by_slug("free-fire", active_only=False)
    assert ff_after_sync.is_active is False

    # 4. Restore Free Fire to ON
    client.patch("/api/v1/admin/api-games/free-fire/toggle")
    assert db.get_game_by_slug("free-fire", active_only=False).is_active is True
