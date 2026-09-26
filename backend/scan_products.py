import asyncio
import httpx

api_key = '33CD2DC54F1C05AC9F0B1FF0'
base_url = 'https://api.bay2game.xyz/api'

async def fetch_game_products(client, sem, game_code, name, img):
    async with sem:
        try:
            r = await client.get(f'{base_url}/products', params={'api_key': api_key, 'game_code': game_code}, timeout=8.0)
            if r.status_code == 200:
                data = r.json()
                pkgs = data.get('products', [])
                return {'game_code': game_code, 'name': name, 'count': len(pkgs), 'image_url': img, 'products': pkgs}
        except Exception as e:
            pass
        return {'game_code': game_code, 'name': name, 'count': 0, 'image_url': img, 'products': []}

async def main():
    async with httpx.AsyncClient(limits=httpx.Limits(max_connections=20)) as client:
        r = await client.get(f'{base_url}/categories', params={'api_key': api_key}, timeout=10.0)
        cats = r.json().get('categories', [])
        sem = asyncio.Semaphore(15)
        tasks = [fetch_game_products(client, sem, c.get('game_code'), c.get('name'), c.get('image_url')) for c in cats]
        results = await asyncio.gather(*tasks)
        
        active_games = [res for res in results if res['count'] > 0]
        print(f'Total categories: {len(cats)}, Games with active products: {len(active_games)}')
        for g in sorted(active_games, key=lambda x: x['count'], reverse=True):
            print(f"{g['game_code']:30} | {g['count']:3} products | {g['name']}")

if __name__ == '__main__':
    asyncio.run(main())
