import httpx

key = '33CD2DC54F1C05AC9F0B1FF0'
r = httpx.get('https://api.bay2game.xyz/api/categories', params={'api_key': key})
data = r.json()
cats = data.get('categories', [])
print(f"Total Bay2Game categories: {len(cats)}")
for c in cats:
    print(f"- code: {c.get('code')} | name: {c.get('name')} | status: {c.get('status')}")
