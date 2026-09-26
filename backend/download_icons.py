import httpx
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

os.makedirs('public/images/currencies', exist_ok=True)

# 1. Real MLBB Diamond from PNG All
urls = [
    ('https://www.pngall.com/wp-content/uploads/18/Mobile-Legends-Diamond-Icon-PNG-thumb.png', 'public/images/currencies/mlbb-diamond.png'),
    ('https://www.pngall.com/wp-content/uploads/18/Mobile-Legends-Diamond-Icon-PNG-thumb.png', 'public/images/currencies/diamond.png'),
    ('https://www.pngitem.com/pimgs/m/344-3447327_free-fire-diamond-png-transparent-png.png', 'public/images/currencies/freefire-diamond.png'),
]

for url, target in urls:
    try:
        r = httpx.get(url, headers=headers, timeout=10.0, follow_redirects=True)
        if r.status_code == 200 and len(r.content) > 2000:
            with open(target, 'wb') as f:
                f.write(r.content)
            print(f"Downloaded {target} successfully ({len(r.content)} bytes)")
        else:
            print(f"Failed {url} -> status {r.status_code}, length {len(r.content)}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")
