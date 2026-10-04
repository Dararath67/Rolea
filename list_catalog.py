import json

with open('backend/app/data/bay2game_catalog.json', encoding='utf-8') as f:
    cat = json.load(f)

print(f"Total catalog games: {len(cat)}")
for item in cat:
    print(f"{item.get('game_code')} | {item.get('name')} | {item.get('image_url')}")
