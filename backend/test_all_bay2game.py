import httpx

api_key = '33CD2DC54F1C05AC9F0B1FF0'
base_url = 'https://api.bay2game.xyz/api'

r = httpx.get(f'{base_url}/categories', params={'api_key': api_key}, timeout=10.0)
cats = r.json().get('categories', [])

print(f'Total categories in API: {len(cats)}')

# Test specific game codes
test_codes = ['mlbb', 'pubgm', 'freefire_sgmy', 'freefire_global', 'freefire_kh', 'hok', 'bloodstrike', 'eafcmobile_kh', 'valorant_kh', 'ROBLOX_US_CARDS', 'codm_sgmy', 'magic_chess_gogo', 'whiteout_survival', 'genshin']
for code in test_codes:
    pr = httpx.get(f'{base_url}/products', params={'api_key': api_key, 'game_code': code}, timeout=8.0)
    if pr.status_code == 200:
        data = pr.json()
        pkgs = data.get('products', [])
        print(f"Game '{code}': {len(pkgs)} real products")
        if pkgs:
            print(f"  Sample: {pkgs[0]}")
    else:
        print(f"Game '{code}': HTTP {pr.status_code}")
