from backend.app.services.bay2game_service import Bay2GameService

api_key = "33CD2DC54F1C05AC9F0B1FF0"
codes = ["mlbb", "freefire_sgmy", "pubgm", "hok", "bloodstrike", "ROBLOX_US_CARDS", "pubg_mobile", "hok_global"]

for c in codes:
    res = Bay2GameService.get_products(c, api_key=api_key)
    prods = res.get("products", [])
    print(f"Game '{c}': success={res.get('success')}, count={len(prods)}, error={res.get('error')}")
    if prods:
        print(f"  Sample product: {prods[0]}")
