import sys
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.data_store import db

client = TestClient(app)

def test_public_hero_banner_endpoint():
    """Test public endpoint returns hero banner configuration"""
    res = client.get("/api/v1/banners/hero")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    hero = data["data"]
    assert "badge_text_km" in hero
    assert "title_km" in hero
    assert "highlight_km" in hero
    assert "quick_cards" in hero
    assert len(hero["quick_cards"]) >= 4

def test_admin_hero_banner_update_and_live_sync():
    """Test admin updating hero banner dynamically updates public storefront hero banner"""
    # 1. Fetch current hero config
    res_get = client.get("/api/v1/admin/banners/hero")
    assert res_get.status_code == 200
    current_hero = res_get.json()["data"]

    # 2. Modify title and badge
    updated_hero = dict(current_hero)
    updated_hero["badge_text_km"] = "ទូទាត់តាម Bakong KHQR 0% - ពិសេសជូនអតិថិជន Rothz"
    updated_hero["title_km"] = "បញ្ចូលទឹកប្រាក់ហ្គេម ស្វ័យប្រវត្តិ"
    updated_hero["highlight_km"] = "លឿនបំផុត ២០២៦"

    # 3. Post updated config to admin endpoint
    res_post = client.post("/api/v1/admin/banners/hero", json=updated_hero)
    assert res_post.status_code == 200
    assert res_post.json()["success"] is True

    # 4. Fetch public hero banner and verify live sync
    res_pub = client.get("/api/v1/banners/hero")
    assert res_pub.status_code == 200
    pub_hero = res_pub.json()["data"]
    assert pub_hero["badge_text_km"] == "ទូទាត់តាម Bakong KHQR 0% - ពិសេសជូនអតិថិជន Rothz"
    assert pub_hero["title_km"] == "បញ្ចូលទឹកប្រាក់ហ្គេម ស្វ័យប្រវត្តិ"
    assert pub_hero["highlight_km"] == "លឿនបំផុត ២០២៦"

    # 5. Restore original config
    client.post("/api/v1/admin/banners/hero", json=current_hero)

def test_banner_toggle():
    """Test toggling promotional banners ON/OFF"""
    banners = db.get_banners()
    assert len(banners) > 0
    target_banner = banners[0]
    initial_status = target_banner.is_active

    # Toggle
    res_toggle = client.patch(f"/api/v1/admin/banners/{target_banner.id}/toggle")
    assert res_toggle.status_code == 200
    assert res_toggle.json()["is_active"] is (not initial_status)

    # Revert
    client.patch(f"/api/v1/admin/banners/{target_banner.id}/toggle")
