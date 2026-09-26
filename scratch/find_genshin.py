import sys
from backend.app.services.bay2game_service import Bay2GameService

res = Bay2GameService.get_categories(api_key="33CD2DC54F1C05AC9F0B1FF0")
cats = res.get("categories", [])

for c in cats:
    name = str(c.get("name") or "").encode("ascii", "ignore").decode("ascii")
    code = str(c.get("game_code") or "")
    img = str(c.get("image_url") or "")
    if any(k in name.lower() or k in code.lower() for k in ["genshin", "gensh", "impact", "gi", "hoyoverse"]):
        print(f"GENSHIN: code='{code}', name='{name}', img='{img}'")
