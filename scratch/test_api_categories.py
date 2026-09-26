import json
from backend.app.services.bay2game_service import Bay2GameService

res = Bay2GameService.get_categories(api_key="33CD2DC54F1C05AC9F0B1FF0")
cats = res.get("categories", [])
print(f"Total categories returned: {len(cats)}")
for c in cats:
    print(f"Name: {c.get('name')} | Code: {c.get('game_code')} | Image: {c.get('image_url')}")
