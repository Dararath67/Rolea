import json
import urllib.request
import os

with open('backend/app/data/bay2game_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

os.makedirs('public/images/games', exist_ok=True)

success_count = 0
fail_count = 0

for item in catalog:
    code = item.get('game_code') or ''
    url = item.get('image_url') or ''
    if not code or not url:
        continue
    
    # Target filename e.g. public/images/games/cat_love_nikki.png
    filename = f"{code}.png"
    target_path = os.path.join('public', 'images', 'games', filename)
    
    # Try downloading from Cloudinary
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            if len(data) > 100:
                with open(target_path, 'wb') as out_f:
                    out_f.write(data)
                success_count += 1
                print(f"[OK] {code} -> {target_path} ({len(data)} bytes)")
            else:
                fail_count += 1
                print(f"[SMALL DATA] {code}")
    except Exception as e:
        fail_count += 1
        print(f"[FAIL] {code}: {e}")

print(f"\nDownload summary: {success_count} succeeded, {fail_count} failed.")
