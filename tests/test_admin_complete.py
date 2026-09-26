import sys
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_admin_dashboard_and_stats():
    res = client.get("/api/v1/admin/dashboard")
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert "revenue_usd" in data
    assert "chart_daily_revenue" in data
    assert len(data["chart_daily_revenue"]) == 14
    assert "chart_top_games" in data

def test_admin_providers_suite():
    res = client.get("/api/v1/admin/providers")
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["success"] is True
    providers = res_json["data"]
    assert len(providers) >= 3
    for p in providers:
        assert "api_secret" not in p or p.get("api_secret") is None
        assert "api_key_masked" in p

    provider_id = providers[0]["id"]

    res_test = client.post(f"/api/v1/admin/providers/{provider_id}/test")
    assert res_test.status_code == 200
    assert res_test.json()["success"] is True

    res_games = client.post(f"/api/v1/admin/providers/{provider_id}/sync-games")
    assert res_games.status_code == 200
    assert res_games.json()["success"] is True

    res_prods = client.post(f"/api/v1/admin/providers/{provider_id}/sync-products")
    assert res_prods.status_code == 200
    assert res_prods.json()["success"] is True

    res_all = client.post("/api/v1/admin/providers/sync-all")
    assert res_all.status_code == 200
    assert res_all.json()["success"] is True

def test_admin_games_suite():
    res = client.get("/api/v1/admin/games")
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["success"] is True
    games = res_json["data"]
    assert len(games) >= 14
    
    mlbb = next((g for g in games if g["id"] == "mlbb"), None)
    assert mlbb is not None
    assert "Mobile Legends" in mlbb["name_en"]
    assert len(mlbb["packages"]) > 0

def test_admin_products_suite():
    res = client.get("/api/v1/admin/products")
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["success"] is True
    products = res_json["data"]
    assert len(products) > 0
    
    first_sku = products[0]["id"]
    update_payload = [{
        "id": first_sku,
        "price_user_usd": 1.15,
        "is_featured": True,
        "manual_price_override": True
    }]
    res_update = client.patch("/api/v1/admin/products/batch", json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["success"] is True

def test_admin_orders_suite():
    res = client.get("/api/v1/admin/orders")
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["success"] is True
    orders = res_json["data"]
    assert len(orders) > 0

    order_id = orders[0]["id"]

    res_status = client.get(f"/api/v1/admin/orders/{order_id}/provider-status")
    assert res_status.status_code == 200
    assert res_status.json()["success"] is True

    res_retry = client.post(f"/api/v1/admin/orders/{order_id}/retry")
    assert res_retry.status_code == 200
    assert res_retry.json()["success"] is True

    res_refund = client.post(f"/api/v1/admin/orders/{order_id}/refund", json={"reason": "Customer entered invalid Zone ID"})
    assert res_refund.status_code == 200
    assert res_refund.json()["success"] is True

def test_admin_users_and_resellers():
    res_u = client.get("/api/v1/admin/users")
    assert res_u.status_code == 200
    res_json = res_u.json()
    assert res_json["success"] is True
    users = res_json["data"]
    assert len(users) > 0

    u_id = users[0]["id"]
    res_adj = client.post(f"/api/v1/admin/users/{u_id}/adjust-balance", json={"amount": 25.0, "reason": "Promotional bonus"})
    assert res_adj.status_code == 200
    assert res_adj.json()["success"] is True

    res_r = client.get("/api/v1/admin/resellers")
    assert res_r.status_code == 200
    resellers = res_r.json()["data"]
    assert len(resellers) > 0

    r_id = resellers[0]["id"]
    res_key = client.post(f"/api/v1/admin/resellers/{r_id}/reset-api-key")
    assert res_key.status_code == 200
    assert "new_api_key" in res_key.json()["data"]

def test_admin_wallet_and_payments():
    res_w = client.get("/api/v1/admin/wallet/ledger")
    assert res_w.status_code == 200
    entries = res_w.json()["data"]
    assert len(entries) > 0

    res_p = client.get("/api/v1/admin/payments")
    assert res_p.status_code == 200
    methods = res_p.json()["data"]
    assert len(methods) >= 6

def test_admin_coupons_and_banners():
    res_c = client.get("/api/v1/admin/coupons")
    assert res_c.status_code == 200
    coupons = res_c.json()["data"]
    assert len(coupons) > 0

    new_coupon = {
        "code": "TESTPROMO2026",
        "discount_type": "PERCENT",
        "discount_value": 15.0,
        "min_order_usd": 5.0,
        "max_discount_usd": 10.0,
        "max_uses": 100,
        "is_active": True
    }
    res_c_add = client.post("/api/v1/admin/coupons", json=new_coupon)
    assert res_c_add.status_code == 200
    created_c = res_c_add.json()["data"]
    assert created_c["code"] == "TESTPROMO2026"

    res_c_del = client.delete(f"/api/v1/admin/coupons/{created_c['id']}")
    assert res_c_del.status_code == 200

    res_b = client.get("/api/v1/admin/banners")
    assert res_b.status_code == 200
    banners = res_b.json()["data"]
    assert len(banners) > 0

def test_admin_reports_notifications_logs_settings():
    res_rep = client.get("/api/v1/admin/reports/financial?period=30d")
    assert res_rep.status_code == 200
    rep = res_rep.json()["data"]
    assert "gross_revenue_usd" in rep
    assert "net_profit_usd" in rep

    res_n = client.get("/api/v1/admin/notifications")
    assert res_n.status_code == 200
    notifications = res_n.json()["data"]
    assert len(notifications) > 0

    res_n_read = client.post("/api/v1/admin/notifications/mark-read", json={"all": True})
    assert res_n_read.status_code == 200

    res_sl = client.get("/api/v1/admin/sync-logs")
    assert res_sl.status_code == 200
    sync_logs = res_sl.json()["data"]
    assert len(sync_logs) > 0

    res_al = client.get("/api/v1/admin/audit-logs")
    assert res_al.status_code == 200
    audit_logs = res_al.json()["data"]
    assert len(audit_logs) > 0

    res_set = client.get("/api/v1/admin/settings")
    assert res_set.status_code == 200
    settings = res_set.json()["data"]
    assert "platform_name" in settings
    assert settings["exchange_rate_khr"] == 4100

    res_roles = client.get("/api/v1/admin/roles")
    assert res_roles.status_code == 200
    roles = res_roles.json()["data"]
    assert "super_admin" in roles
