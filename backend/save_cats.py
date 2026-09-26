import httpx

key = '33CD2DC54F1C05AC9F0B1FF0'
r = httpx.get('https://api.bay2game.xyz/api/categories', params={'api_key': key})
data = r.json()
cats = data.get('categories', [])

with open('scratch/bay2game_cats.txt', 'w', encoding='utf-8') as f:
    for c in cats:
        code = c.get('code')
        name = c.get('name')
        f.write(f"code={code} | name={name}\n")

print(f"Written {len(cats)} categories to scratch/bay2game_cats.txt")
