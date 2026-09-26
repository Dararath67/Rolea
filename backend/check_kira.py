import httpx
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
}

try:
    r = httpx.get('https://kiragamestore.com', headers=headers, follow_redirects=True, timeout=15.0)
    print("Status:", r.status_code)
    print("URL:", r.url)
    
    # Extract all img src
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', r.text, re.IGNORECASE)
    print(f"Found {len(imgs)} image tags:")
    for src in imgs:
        print(" ->", src)
    
    # Look for diamond or logo keywords
    assets = re.findall(r'https?://[^\s"\'<>]+\.(?:png|jpg|jpeg|webp|svg)', r.text, re.IGNORECASE)
    print(f"\nAll media assets ({len(assets)}):")
    for a in set(assets):
        if any(k in a.lower() for k in ['logo', 'diamond', 'mlbb', 'icon', 'currency', 'game']):
            print(" ->", a)
except Exception as e:
    print("Error:", e)
