from backend.app.services.bay2game_service import Bay2GameService

res = Bay2GameService.get_categories(api_key="33CD2DC54F1C05AC9F0B1FF0")
cats = res.get("categories", [])

search_targets = ["pubg", "hok", "honor", "blood", "roblox", "genshin", "freefire", "mlbb"]

for c in cats:
    name = str(c.get("name") or "")
    code = str(c.get("game_code") or "")
    img = str(c.get("image_url") or "")
    
    for t in search_targets:
        if t in name.lower() or t in code.lower():
            # print cleanly
            print(f"MATCH [{t.upper()}]: code='{code}', name='{name}', img='{img}'")
